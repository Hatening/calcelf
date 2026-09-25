// CalcElf 下单接口：配置了 CREEM_API_KEY 走 Creem（MoR，支持大陆主体），否则走 Stripe。
// 前端无需改动：POST /api/checkout { product } -> { url }
const {getUser}=require('../lib/supabase');

const PLAN_CREDITS={student:250,plus:800,family:2200};
const PACK_CREDITS={pack100:100,pack250:250,pack600:600};
const PRODUCTS=Object.keys(PLAN_CREDITS).concat(Object.keys(PACK_CREDITS));

async function creemCheckout(u,product,appUrl){
  const map={
    student:process.env.CREEM_PRODUCT_STUDENT,
    plus:process.env.CREEM_PRODUCT_PLUS,
    family:process.env.CREEM_PRODUCT_FAMILY,
    pack100:process.env.CREEM_PRODUCT_PACK100,
    pack250:process.env.CREEM_PRODUCT_PACK250,
    pack600:process.env.CREEM_PRODUCT_PACK600
  };
  const productId=map[product];
  if(!productId)throw new Error('Creem product id missing for '+product);
  // creem_test_ 开头的 key 自动走沙箱域名，正式 key 走正式域名；也可用 CREEM_API_BASE 强制覆盖
  const base=process.env.CREEM_API_BASE
    || (String(process.env.CREEM_API_KEY).startsWith('creem_test')?'https://test-api.creem.io/v1':'https://api.creem.io/v1');
  const r=await fetch(`${base}/checkouts`,{
    method:'POST',
    headers:{'x-api-key':process.env.CREEM_API_KEY,'Content-Type':'application/json'},
    body:JSON.stringify({
      product_id:productId,
      request_id:`calcelf_${product}_${u.id}_${Date.now()}`,
      success_url:`${appUrl}/?checkout=success`,
      customer:{email:u.email||undefined,name:u.user_metadata?.display_name||u.user_metadata?.full_name||undefined},
      metadata:{user_id:String(u.id),product:String(product)}
    })
  });
  const text=await r.text();
  if(!r.ok)throw new Error('Creem checkout failed '+r.status+': '+text.slice(0,300));
  const j=JSON.parse(text);
  if(!j.checkout_url)throw new Error('Creem returned no checkout_url');
  return {url:j.checkout_url,provider:'creem'};
}

async function stripeCheckout(u,product,appUrl){
  const Stripe=require('stripe');
  const stripe=new Stripe(process.env.STRIPE_SECRET_KEY);
  const map={
    student:[process.env.STRIPE_PRICE_STUDENT,'subscription'],
    plus:[process.env.STRIPE_PRICE_PLUS,'subscription'],
    family:[process.env.STRIPE_PRICE_FAMILY,'subscription'],
    pack100:[process.env.STRIPE_PRICE_PACK100,'payment'],
    pack250:[process.env.STRIPE_PRICE_PACK250,'payment'],
    pack600:[process.env.STRIPE_PRICE_PACK600,'payment']
  };
  const [price,mode]=map[product]||[];
  if(!price)throw new Error('Stripe price id missing for '+product);
  const s=await stripe.checkout.sessions.create({
    mode,
    line_items:[{price,quantity:1}],
    customer_email:u.email||undefined,
    allow_promotion_codes:true,
    automatic_tax:{enabled:true},
    metadata:{user_id:u.id,product},
    success_url:`${appUrl}/?checkout=success`,
    cancel_url:`${appUrl}/?checkout=cancel`
  });
  return {url:s.url,provider:'stripe'};
}

module.exports=async(req,res)=>{
  try{
    const u=await getUser(req);
    if(!u)return res.status(401).json({error:'Sign in required'});
    const product=String(req.body?.product||'student');
    if(!PRODUCTS.includes(product))return res.status(400).json({error:'Unknown product'});
    const appUrl=(process.env.APP_URL||'https://calcelf.vercel.app').replace(/\/$/,'');
    const out=process.env.CREEM_API_KEY
      ? await creemCheckout(u,product,appUrl)
      : await stripeCheckout(u,product,appUrl);
    res.status(200).json(out);
  }catch(e){
    console.error('checkout error',e);
    res.status(500).json({error:e.message});
  }
};
