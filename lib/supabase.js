const {createClient}=require('@supabase/supabase-js');
function admin(){return createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{autoRefreshToken:false,persistSession:false}})}
async function getUser(req){const h=req.headers.authorization||'';if(!h.startsWith('Bearer '))return null;const {data,error}=await admin().auth.getUser(h.slice(7));return error||!data.user?null:data.user}
module.exports={admin,getUser};
