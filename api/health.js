module.exports=async(req,res)=>res.status(200).json({ok:true,service:'CalcElf',time:new Date().toISOString()});
