const {admin}=require('./supabase');
// v5.3：动画课件并入解题权益，animation 不再单独扣费（保留键位，值为 0）
const COST={solve:2,animation:0,chat:1,voice:1,practice:1};
async function charge(uid,amount,reason,requestId){const {data,error}=await admin().rpc('consume_credits',{p_user_id:uid,p_amount:amount,p_reason:reason,p_request_id:requestId});if(error)throw error;return data}
async function refund(uid,amount,bucket,reason,requestId){const {data,error}=await admin().rpc('refund_credits',{p_user_id:uid,p_amount:amount,p_bucket:bucket,p_reason:reason,p_request_id:requestId});if(error)throw error;return data}
async function grant(uid,amount,bucket,reason,requestId){const {data,error}=await admin().rpc('grant_credits',{p_user_id:uid,p_amount:amount,p_bucket:bucket,p_reason:reason,p_request_id:requestId});if(error)throw error;return data}
module.exports={COST,charge,refund,grant};
