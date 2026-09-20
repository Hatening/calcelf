const {admin}=require('./supabase');const {ip,hmac}=require('./security');
async function allow(req,userId,route,seconds,limit){const key=`${route}:${userId||'anon'}:${hmac(ip(req))}`;const {data,error}=await admin().rpc('consume_rate',{p_key:key,p_window_seconds:seconds,p_limit:limit});if(error)throw error;return !!data}
module.exports={allow};
