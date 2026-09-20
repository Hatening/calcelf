function lifetime(correct){if(correct>=5000)return 7;if(correct>=2500)return 6;if(correct>=1000)return 5;if(correct>=500)return 4;if(correct>=200)return 3;if(correct>=50)return 2;return 1}
function monthly(solved,accuracy,streak){if(solved>=100&&accuracy>=.9&&streak>=7)return 6;if(solved>=100&&accuracy>=.8)return 5;if(solved>=60)return 4;if(solved>=30)return 3;if(solved>=10)return 2;return 1}
module.exports={lifetime,monthly};
