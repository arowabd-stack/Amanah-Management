'use strict';
const crypto = require('node:crypto');
const COOKIE='__Host-amanah_session';
const SESSION_SECONDS=60*60*12;
function json(res,status,body,extra={}) {
 res.statusCode=status;
 res.setHeader('Content-Type','application/json; charset=utf-8');
 res.setHeader('Cache-Control','no-store, private');
 res.setHeader('Pragma','no-cache');
 res.setHeader('X-Content-Type-Options','nosniff');
 res.setHeader('Vary','Cookie');
 for(const [k,v] of Object.entries(extra))res.setHeader(k,v);
 return res.end(JSON.stringify(body));
}
function sameOrigin(req) {
 const origin=req.headers.origin||'';
 const host=req.headers['x-forwarded-host']||req.headers.host||'';
 try {
  const u=new URL(origin);
  return u.host===host && (u.protocol==='https:' || (host.startsWith('localhost:') && u.protocol==='http:'));
 }catch{return false;}
}
function parseInput(req) {
 if (typeof req.body==='object' && req.body!==null) return req.body;
 if (typeof req.body==='string' && req.body.length<2500000) return JSON.parse(req.body);
 return {};
}
function digest(a,b){const x=Buffer.from(String(a)),y=Buffer.from(String(b));return x.length===y.length&&crypto.timingSafeEqual(x,y)}
function verifyPassword(password) {
 const spec=process.env.AMANAH_ADMIN_PASSWORD_HASH||'';
 const m=/^pbkdf2_sha256:(\d+):([a-f0-9]{32}):([a-f0-9]{64})$/.exec(spec);
 if(!m||!Number.isInteger(+m[1])||+m[1]<200000)return false;
 const provided=crypto.pbkdf2Sync(String(password).slice(0,256),Buffer.from(m[2],'hex'),Number(m[1]),32,'sha256');
 return crypto.timingSafeEqual(provided,Buffer.from(m[3],'hex'));
}
function sign(body){const secret=process.env.AMANAH_SESSION_SECRET;if(!secret||secret.length<32)throw Error('Session secret unavailable');return crypto.createHmac('sha256',secret).update(body).digest('hex')}
function createCookie() {
 const token='admin.'+Math.floor(Date.now()/1000);
 return COOKIE+'='+token+'.'+sign(token)+'; Path=/; Max-Age='+SESSION_SECONDS+'; HttpOnly; Secure; SameSite=Strict';
}
function clearCookie(){return COOKIE+'=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict'}
function authorized(req) {
 const cookie=(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(COOKIE+'='));
 if(!cookie)return false;
 const token=decodeURIComponent(cookie.slice(COOKIE.length+1));
 const match=/^(admin\.\d{10})\.([a-f0-9]{64})$/.exec(token);if(!match)return false;
 const ts=Number(match[1].slice(6)),now=Math.floor(Date.now()/1000);
 if(ts>now+60||now-ts>SESSION_SECONDS||now-ts<0)return false;
 try{return digest(sign(match[1]),match[2])}catch{return false}
}
function configReady(){return !!(process.env.AMANAH_ADMIN_PASSWORD_HASH&&process.env.AMANAH_SESSION_SECRET&&process.env.AMANAH_DATA_KEY&&(process.env.BLOB_READ_WRITE_TOKEN||(process.env.VERCEL_OIDC_TOKEN&&process.env.BLOB_STORE_ID)))}
module.exports={json,sameOrigin,parseInput,digest,verifyPassword,createCookie,clearCookie,authorized,configReady};
