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

const lookup=await p.evaluate(()=>({
  kathoir:AmanahAddressSearch.suggest('Kathoir').map(item=>item.value),
  alternative:AmanahAddressSearch.suggest('Khatir').map(item=>item.value),
  bangla:AmanahAddressSearch.suggest('কাঠ').map(item=>item.value),
  sadar:AmanahAddressSearch.suggest('Sunamganj Sadar').map(item=>item.value),
  sholaghar:AmanahAddressSearch.suggest('Sholaghar').map(item=>item.value),
  dolura:AmanahAddressSearch.suggest('Dolura').map(item=>item.value),
  surma:AmanahAddressSearch.suggest('Surma').map(item=>item.value),
  purba:AmanahAddressSearch.suggest('Purba Pagla').map(item=>item.value)
}));
const kathoir='কাঠইর, সুনামগঞ্জ সদর, সুনামগঞ্জ';
assert.equal(lookup.kathoir[0],kathoir);
assert.equal(lookup.alternative[0],kathoir);
assert.equal(lookup.bangla[0],kathoir);
assert.ok(lookup.sadar.includes('সুনামগঞ্জ সদর, সুনামগঞ্জ'));
assert.ok(lookup.sholaghar.includes('ষোলঘর, সুনামগঞ্জ সদর, সুনামগঞ্জ'));
assert.ok(lookup.dolura.includes('ডলুরা, জাহাঙ্গীরনগর, সুনামগঞ্জ সদর, সুনামগঞ্জ'));
assert.ok(lookup.surma.includes('সুরমা, সুনামগঞ্জ সদর, সুনামগঞ্জ'));
assert.ok(lookup.surma.includes('সুরমা, দোয়ারাবাজার, সুনামগঞ্জ'));
assert.ok(lookup.purba.includes('পূর্ব পাগলা, শান্তিগঞ্জ, সুনামগঞ্জ'));
console.log('BENGALI/ENGLISH ALIAS SEARCH OK');passed++;
await p.locator('#w_addr').fill('Kathoir');
await p.locator('#amanah-address-options [role="option"]').first().click();
assert.equal(await p.locator('#w_addr').inputValue(),kathoir);
assert.equal(await p.evaluate(()=>W.np.address),kathoir);
await p.locator('#w_addr').fill('Sholaghar');
await p.locator('#w_addr').press('ArrowDown');
await p.locator('#w_addr').press('Enter');
assert.equal(await p.locator('#w_addr').inputValue(),'ষোলঘর, সুনামগঞ্জ সদর, সুনামগঞ্জ');
console.log('MOUSE & KEYBOARD SELECTION OK');passed++;
await p.goto('https://qa.amanah.test/patient/?id=p1');
await p.evaluate(()=>editPatient('p1'));
await p.locator('#ep_addr').fill('Mongalkata');
await p.locator('#amanah-address-options [role="option"]').first().click();
assert.equal(await p.locator('#ep_addr').inputValue(),'মঙ্গলকাটা, জাহাঙ্গীরনগর, সুনামগঞ্জ সদর, সুনামগঞ্জ');
await p.evaluate(()=>closeModal());
console.log('PATIENT EDIT ADDRESS SUGGESTIONS OK');passed++;

assert.equal(writes.length,0,'No clinic writes during QA');
assert.deepEqual(errs,[],'browser page errors');
console.log('ALL '+passed+' PAGE/WIZARD CHECKS PASSED');
await browser.close();
})().catch(e=>{console.error(e);process.exitCode=1;});
