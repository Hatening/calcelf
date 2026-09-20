const {admin}=require('./supabase');
const COST={solve:2,animation:8,chat:1,voice:1,practice:1};
async function charge(uid,amount,reason,requestId){const {data,error}=await admin().rpc('consume_credits',{p_user_id:uid,p_amount:amount,p_reason:reason,p_request_id:requestId});if(error)throw error;return data}
async function refund(uid,amount,bucket,reason,requestId){const {data,error}=await admin().rpc('refund_credits',{p_user_id:uid,p_amount:amount,p_bucket:bucket,p_reason:reason,p_request_id:requestId});if(error)throw error;return data}
async function grant(uid,amount,bucket,reason,requestId){const {data,error}=await admin().rpc('grant_credits',{p_user_id:uid,p_amount:amount,p_bucket:bucket,p_reason:reason,p_request_id:requestId});if(error)throw error;return data}
module.exports={COST,charge,refund,grant};
