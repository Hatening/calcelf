// Creem webhook：https://calcelf.vercel.app/api/creem-webhook
// 事件：checkout.completed（首次付款：充值包加积分 / 订阅开通）、subscription.paid（续费发额度）、
//       subscription.canceled/paused/expired（降级 free）。
// 签名：请求头 creem-signature = HMAC-SHA256(webhook secret, 原始请求体) 的 hex。
const crypto=require('crypto');
const {admin}=require('../lib/supabase');

const PLAN_CREDITS={student:250,plus:800,family:2200};
const PACK_CREDITS={pack100:100,pack250:250,pack600:600};

function safeEqual(a,b){
  const ba=Buffer.from(String(a||'')),bb=Buffer.from(String(b||''));
  return ba.length===bb.length&&crypto.timingSafeEqual(ba,bb);
}

module.exports=async(req,res)=>{
  try{
    const raw=Buffer.isBuffer(req.body)
      ? req.body
      : Buffer.from(typeof req.body==='string'?req.body:JSON.stringify(req.body||{}));
    const sig=req.headers['creem-signature'];
    const secret=process.env.CREEM_WEBHOOK_SECRET;
    if(!secret)return res.status(500).send('CREEM_WEBHOOK_SECRET not configured');
    const hex=crypto.createHmac('sha256',secret).update(raw).digest('hex');
    if(!(safeEqual(sig,hex)||safeEqual(sig,'sha256='+hex))){
      return res.status(400).send('Invalid Creem signature');
    }
    const evt=JSON.parse(raw.toString('utf8'));
    const type=evt.eventType,id=evt.id,o=evt.object||{};
    if(!type||!id)return res.status(400).send('Malformed event');

    const sb=admin();
    const {data:exists}=await sb.from('creem_events').select('id').eq('id',id).maybeSingle();
    if(exists)return res.status(200).json({received:true,duplicate:true});
    await sb.from('creem_events').insert({id,event_type:type});

    if(type==='checkout.completed'){
      // 订单未支付完成（如 pending）不发货
      if(o.order&&o.order.status&&o.order.status!=='paid'){
        return res.status(200).json({received:true,skipped:'order_'+o.order.status});
      }
      const product=o.metadata?.product;
      const uid=o.metadata?.user_id;
      if(!product||!uid)return res.status(200).json({received:true,skipped:'missing_metadata'});

      if(PACK_CREDITS[product]){
        await sb.rpc('grant_credits',{
          p_user_id:uid,
          p_amount:PACK_CREDITS[product],
          p_bucket:'paid',
          p_reason:product,
          p_request_id:id
        });
      }else if(PLAN_CREDITS[product]){
        const n=PLAN_CREDITS[product];
        await sb.from('profiles').update({
          plan:product,
          monthly_grant:n,
          credits_monthly:n,
          subscription_started_at:new Date().toISOString(),
          creem_customer_id:o.customer?.id||null,
          creem_subscription_id:o.subscription?.id||null
        }).eq('id',uid);
      }
    }

    if(type==='subscription.paid'){
      // 续费：把当月订阅额度重置为满额（不影响付费充值包余额）
      const {data:p}=await sb.from('profiles').select('id,monthly_grant')
        .eq('creem_subscription_id',o.id).maybeSingle();
      if(p?.id)await sb.from('profiles').update({credits_monthly:p.monthly_grant}).eq('id',p.id);
    }

    if(type==='subscription.canceled'||type==='subscription.paused'||type==='subscription.expired'){
      await sb.from('profiles').update({
        plan:'free',monthly_grant:0,credits_monthly:0,creem_subscription_id:null
      }).eq('creem_subscription_id',o.id);
    }

    res.status(200).json({received:true});
  }catch(e){
    console.error('creem webhook error',e);
    res.status(400).send('Webhook Error: '+e.message);
  }
};

module.exports.config={api:{bodyParser:false}};
