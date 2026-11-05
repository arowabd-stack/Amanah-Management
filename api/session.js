'use strict';
const {json,sameOrigin,parseInput,digest,verifyPassword,createCookie,clearCookie,authorized,configReady}=require('../lib/clinic-security');
module.exports=async function handler(req,res) {
 if(!configReady())return json(res,503,{error:'Cloud configuration incomplete'});
 if(req.method==='GET')return json(res,200,{authenticated:authorized(req),mode:'private-cloud'});
 if(req.method==='DELETE') {
  if(!sameOrigin(req))return json(res,403,{error:'Invalid origin'});
  return json(res,200,{ok:true},{'Set-Cookie':clearCookie()});
 }
 if(req.method!=='POST'){res.setHeader('Allow','GET, POST, DELETE');return json(res,405,{error:'Method not allowed'})}
 if(!sameOrigin(req))return json(res,403,{error:'Invalid origin'});
 let body;try{body=parseInput(req)}catch{return json(res,400,{error:'Bad request'})}
 if(!body||typeof body.username!=='string'||typeof body.password!=='string'||body.username.length>100||body.password.length>256)return json(res,400,{error:'Invalid input'});
 const user=process.env.AMANAH_ADMIN_USER||'admin';
 const allowed=digest(body.username,user) && verifyPassword(body.password);
 if(!allowed)return json(res,401,{error:'ইউজার বা পাসওয়ার্ড ভুল'});
 return json(res,200,{ok:true,authenticated:true},{'Set-Cookie':createCookie()});
};
