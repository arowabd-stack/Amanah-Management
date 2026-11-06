const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const fixture={
 settings:{center:'QA CENTER',address:'TEST',phone:'',therapists:[{id:'t1',name:'Therapist',gender:'পুরুষ'}],services:[{id:'s1',name:'Hijama',fee:1000}],defAdvice:'',waTpl:'',apptReminderMode:'evening'},
 patients:[{id:'p1',name:'Test patient',mobile:'01712345678',age:'32',sex:'পুরুষ',address:'Test'}],
 visits:[],appts:[],seq:0,mig1:1,_syncVersion:1
};
(async()=>{
const browser=await chromium.launch({headless:true});
const c=await browser.newContext();
const p=await c.newPage(),errs=[],writes=[];
p.on('pageerror',e=>errs.push(e.message));
await c.route('**/*',async route=>{
 const req=route.request(),url=new URL(req.url());
 if(url.origin!=='https://qa.amanah.test')return route.fulfill({status:200,body:'',contentType:'text/plain'});
 if(url.pathname==='/api/session')return route.fulfill({json:{authenticated:true}});
 if(url.pathname==='/api/clinic'){
  if(req.method()==='PUT'){writes.push(req.postDataJSON());return route.fulfill({json:{ok:true,revision:'qa-2'}})}
  return route.fulfill({json:{state:fixture,revision:'qa-1'}});
 }
 let file=path.join(root,'public',url.pathname==='/'?'index.html':url.pathname.slice(1));
 if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
 if(!fs.existsSync(file))return route.fulfill({status:404,body:'���q�^