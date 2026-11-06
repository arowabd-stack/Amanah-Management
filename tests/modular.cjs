// Browser-only checks with in-memory fixtures; no production clinic requests.
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
 if(!fs.existsSync(file))return route.fulfill({status:404,body:'missing '+file});
 return route.fulfill({body:fs.readFileSync(file),contentType:file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':file.endsWith('.woff2')?'font/woff2':'text/html'});
});
let passed=0;
for(const [url,expected] of [['/','dash'],['/dashboard/','dash'],['/patients/','patients'],['/patient/?id=p1','patient'],['/new-visit/','new'],['/appointments/','appts'],['/accounts/','money'],['/settings/','settings']]){
 await p.goto('https://qa.amanah.test'+url);
 await p.waitForFunction(()=>document.getElementById('shell')&&!document.getElementById('shell').hidden);
 assert.equal(await p.evaluate(()=>route),expected,'direct route '+url);
 assert.ok(await p.locator('#main').innerText(),'Page main '+url);
 console.log('PAGE OK '+url);passed++;
}
await p.locator('#nav a[data-r="patients"]').click();
assert.equal(new URL(p.url()).pathname,'/patients/');
await p.goBack();
assert.equal(new URL(p.url()).pathname,'/settings/');
console.log('NAVIGATION AND HISTORY OK');passed++;
await p.goto('https://qa.amanah.test/new-visit/');
await p.locator('#wizardSteps [data-step="5"]').click();
assert.equal(await p.evaluate(()=>W.step),5);
await p.locator('#wnext').click();
assert.equal(await p.evaluate(()=>W.step),0);
assert.equal(await p.locator('#wbody .wizard-required-alert').count(),1);
await p.locator('#w_name').fill('QA test visitor');
await p.locator('#w_mob').fill('01712345678');
await p.locator('#wizardSteps [data-step="5"]').click();
await p.locator('#wnext').click();
assert.equal(await p.evaluate(()=>W._allowBlank),true);
assert.ok(await p.locator('#wizardSteps .needs-attention').count()>0);
assert.ok(await p.locator('#wnext').innerText().then(t=>t.includes('ফাঁকা')));
console.log('WIZARD FIELDS / WARNINGS OK');passed++;
assert.equal(writes.length,0,'No clinic writes during QA');
assert.deepEqual(errs,[],'browser page errors');
console.log('ALL '+passed+' PAGE/WIZARD CHECKS PASSED');
await browser.close();
})().catch(e=>{console.error(e);process.exitCode=1;});
