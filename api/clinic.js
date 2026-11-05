'use strict';
const crypto=require('node:crypto');
const {get,put,BlobNotFoundError,BlobPreconditionFailedError}=require('@vercel/blob');
const {json,sameOrigin,parseInput,authorized,configReady}=require('../lib/clinic-security');
const PATH='amanah-clinic/v1/state.encrypted.json';
const AAD=Buffer.from('amanah-clinic-v1');
function key(){const raw=process.env.AMANAH_DATA_KEY||'';if(!/^[a-f0-9]{64}$/i.test(raw))throw Error('Data encryption key missing');return Buffer.from(raw,'hex')}
function encrypt(d){
 const iv=crypto.randomBytes(12),cipher=crypto.createCipheriv('aes-256-gcm',key(),iv);cipher.setAAD(AAD);
 const text=Buffer.from(JSON.stringify(d),'utf8');const data=Buffer.concat([cipher.update(text),cipher.final()]);
 return JSON.stringify({v:1,alg:'aes-256-gcm',iv:iv.toString('base64'),tag:cipher.getAuthTag().toString('base64'),data:data.toString('base64')});
}
function decrypt(text){
 const item=JSON.parse(text);if(item.v!==1||item.alg!=='aes-256-gcm')throw Error('Invalid encrypted record');
 const decipher=crypto.createDecipheriv('aes-256-gcm',key(),Buffer.from(item.iv,'base64'));
 decipher.setAAD(AAD);decipher.setAuthTag(Buffer.from(item.tag,'base64'));
 const plain=Buffer.concat([decipher.update(Buffer.from(item.data,'base64')),decipher.final()]);
 return JSON.parse(plain.toString('utf8'));
}
function verifyState(obj){
 if(!obj||typeof obj!=='object'||Array.isArray(obj))return false;
 if(!obj.settings||typeof obj.settings!=='object')return false;
 return ['patients','visits','appts'].every(k=>Array.isArray(obj[k])&&obj[k].length<=30000);
}
async function load(){
 try{
  const file=await get(PATH,{access:'private'});
  if(!file||file.statusCode===404)return {state:null,revision:null};
  if(!file.stream)throw Error('Unreadable private data');
  const body=await new Response(file.stream).text();
  return {state:decrypt(body),revision:file.blob.etag};
 }catch(e){
  if(e instanceof BlobNotFoundError||e?.name==='BlobNotFoundError')return {state:null,revision:null};
  throw e;
 }
}
module.exports=async function handler(req,res){
 if(!configReady())return json(res,503,{error:'Private cloud setup incomplete'});
 if(!authorized(req))return json(res,401,{error:'Login required'});
 if(req.method==='GET'){
  try{return json(res,200,await load())}
  catch(e){console.error('Clinic read failed',e?.name);return json(res,503,{error:'Cloud read temporarily unavailable; no local data was overwritten'})}
 }
 if(req.method!=='PUT'){res.setHeader('Allow','GET, PUT');return json(res,405,{error:'Method not allowed'})}
 if(!sameOrigin(req))return json(res,403,{error:'Invalid origin'});
 let body;try{body=parseInput(req)}catch{return json(res,400,{error:'Invalid JSON'})}
 if(!verifyState(body?.state)||!(body.revision===null||typeof body.revision==='string'))return json(res,400,{error:'Invalid clinic record or revision'});
 // Do not allow client-side passwords to become the cloud authentication authority.
 delete body.state.settings.passHash;delete body.state.settings.user;
 const raw=JSON.stringify(body.state);
 if(Buffer.byteLength(raw,'utf8')>2000000)return json(res,413,{error:'Dataset exceeds 2 MB; export a backup and contact support'});
 try{
  const before=await load();
  if(before.revision!==body.revision)return json(res,409,{error:'Another device changed this data',code:'STALE_REVISION',revision:before.revision});
  const encrypted=encrypt(body.state);
  const opt={access:'private',contentType:'application/json',cacheControlMaxAge:60,addRandomSuffix:false};
  if(body.revision){opt.allowOverwrite=true;opt.ifMatch=body.revision}
  const written=await put(PATH,encrypted,opt);
  return json(res,200,{ok:true,revision:written.etag});
 }catch(e){
  if(e instanceof BlobPreconditionFailedError||e?.name==='BlobPreconditionFailedError'||/already exists|precondition|conflict/i.test(String(e?.message)))return json(res,409,{error:'Another device wrote data first',code:'STALE_REVISION'});
  console.error('Clinic write failed',e?.name);
  return json(res,503,{error:'Save failed; server data was not updated'});
 }
};
