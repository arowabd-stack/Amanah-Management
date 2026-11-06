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
const p=await c.newPage(),errs=[],writes=[];let hijriRequests=0;p.setDefaultTimeout(7000);
p.on('pageerror',e=>errs.push(e.message));
await c.route('**/*',async route=>{
 const req=route.request(),url=new URL(req.url());
 if(url.origin!=='https://qa.amanah.test')return route.fulfill({status:200,body:'',contentType:'text/plain'});
 if(url.pathname==='/api/session')return route.fulfill({json:{authenticated:true}});
 if(url.pathname==='/api/hijri'){hijriRequests++;
  const p=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Dhaka',day:'2-digit',month:'2-digit',year:'numeric'}).formatToParts(new Date()).map(x=>[x.type,x.value]));
  return route.fulfill({json:{ok:true,source:'iHadis',sourceUrl:'https://ihadis.com/en/calendar/bangladesh/islamic-date-today',date:p.year+'-'+p.month+'-'+p.day,hijri:{day:25,month:5,year:1448,monthName:'Jumada al-Ula'}}});
 }
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
 if(url==='/dashboard/')assert.ok(!(await p.locator('#main').innerText()).includes('iHadis'));
 assert.ok(await p.locator('#main').innerText(),'Page main '+url);
 console.log('PAGE OK '+url);passed++;
}
await p.goto('https://qa.amanah.test/settings/');
await p.waitForFunction(()=>document.getElementById('hijri_plus')?.offsetWidth>0);
assert.equal(await p.evaluate(()=>D.settings.hijriOffset??0),0);
assert.ok(await p.locator('#hijri_date_preview').innerText());
await p.locator('#hijri_plus').click();
assert.equal(await p.evaluate(()=>D.settings.hijriOffset),1);
await p.locator('#hijri_plus').click();
assert.equal(await p.evaluate(()=>D.settings.hijriOffset),2);
assert.equal(await p.locator('#hijri_plus').isDisabled(),true);
assert.equal(await p.evaluate(()=>{const d=new Date('2026-11-07T12:00');d.setDate(d.getDate()+2);const f=new Intl.DateTimeFormat('en-u-ca-islamic-umalqura',{day:'numeric',month:'numeric'}).formatToParts(d);const h=hijri('2026-11-07');return h.day===+f.find(x=>x.type==='day').value&&h.month===+f.find(x=>x.type==='month').value}),true);
await p.locator('#hijri_minus').click();
await p.locator('#hijri_minus').click();
await p.locator('#hijri_minus').click();
await p.locator('#hijri_minus').click();
assert.equal(await p.evaluate(()=>D.settings.hijriOffset),-2);
assert.equal(await p.locator('#hijri_minus').isDisabled(),true);
await p.locator('#hijri_reset').click();
assert.equal(await p.evaluate(()=>D.settings.hijriOffset),0);
assert.equal(await p.locator('#hijri_reset').isDisabled(),true);
assert.equal(hijriRequests,0,'Original calculator must not fetch iHadis');
console.log('HIJRI -2..+2 SETTINGS, LIVE PREVIEW AND RESET OK');passed++;

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
await p.locator('#wizardSteps [data-step="0"]').click();
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
await p.evaluate(()=>{if(!pById('p1'))D.patients.push({id:'p1',name:'Test patient',mobile:'01712345678',age:'32',sex:'পুরুষ',address:'Test'});editPatient('p1')});
await p.locator('#ep_addr').fill('Mongalkata');
await p.locator('#amanah-address-options [role="option"]').first().click();
assert.equal(await p.locator('#ep_addr').inputValue(),'মঙ্গলকাটা, জাহাঙ্গীরনগর, সুনামগঞ্জ সদর, সুনামগঞ্জ');
await p.evaluate(()=>closeModal());
console.log('PATIENT EDIT ADDRESS SUGGESTIONS OK');passed++;

// The user's uploaded HTML converter is authoritative except for common grammar words.
await p.goto('https://qa.amanah.test/new-visit/');
const nameInput=p.locator('#w_name');
await nameInput.focus();
await nameInput.pressSequentially('Masum Parvej',{delay:1});
const exactName=await p.evaluate(()=>AmanahNamePhonetic.conv('Masum')+' '+AmanahNamePhonetic.conv('Parvej'));
assert.equal(await nameInput.inputValue(),exactName);
assert.equal(await p.evaluate(()=>W.np.name),exactName);
assert.equal(exactName,'মাসুম পার্ভেজ','Preserve capitalization-sensitive user keymap, without name overrides');
console.log('UPLOADED HTML EXACT OUTPUT (NO NAME OVERRIDES) OK');passed++;
await nameInput.press('Backspace');
assert.notEqual(await nameInput.inputValue(),exactName);
await nameInput.pressSequentially('j',{delay:1});
assert.equal(await nameInput.inputValue(),exactName);
await p.locator('.amanah-name-mode').click();
await nameInput.pressSequentially(' Khan',{delay:1});
assert.equal(await nameInput.inputValue(),exactName+' Khan');
await p.locator('.amanah-name-mode').click();
await nameInput.pressSequentially(' Rahim',{delay:1});
assert.equal(await nameInput.inputValue(),exactName+' Khan '+await p.evaluate(()=>AmanahNamePhonetic.conv('Rahim')));
console.log('BACKSPACE AND ENGLISH MODE WITHOUT AUTO-OVERRIDE OK');passed++;
await nameInput.fill('');
await nameInput.evaluate(el=>{
 const dt=new DataTransfer();dt.setData('text/plain','Mohammad Ali');
 el.dispatchEvent(new ClipboardEvent('paste',{bubbles:true,cancelable:true,clipboardData:dt}));
});
assert.equal(await nameInput.inputValue(),await p.evaluate(()=>AmanahNamePhonetic.convertText('Mohammad Ali')));
await nameInput.fill('নুর');
assert.equal(await nameInput.inputValue(),'নুর');
console.log('PASTE AND DIRECT BENGALI EDITING OK');passed++;
const grammarCases={
 bolchen:'বলছেন',bolchi:'বলছি',bolche:'বলছে',bolchilen:'বলছিলেন',
 korchen:'করছেন',korchi:'করছি',dekhchen:'দেখছেন',
 likhchen:'লিখছেন',ashchen:'আসছেন',jacchen:'যাচ্ছেন',
 hoyeche:'হয়েছে',acchen:'আছেন',onek:'অনেক',ektu:'একটু'
};
for(const [roman,desired] of Object.entries(grammarCases)){
 await nameInput.fill('');
 await nameInput.pressSequentially(roman,{delay:1});
 assert.equal(await nameInput.inputValue(),desired,roman+' grammar auto fix');
 assert.equal(await p.evaluate(()=>W.np.name),desired,'Form binding '+roman);
}
assert.equal(await p.evaluate(()=>AmanahNamePhonetic.conv('bolchen')),'বল্ছেন',
  'Keep original converter unchanged; auto-fix is separate');
assert.equal(await p.evaluate(()=>AmanahNamePhonetic.convertText('ami bolchen Masum')),
  'আমি বলছেন মাসুম','Auto-fix only whitelisted grammar words');
console.log('WHITELISTED COMMON GRAMMAR WORD AUTOFIX OK');passed++;
await nameInput.fill('');
await nameInput.pressSequentially('bangla',{delay:1});
assert.equal(await nameInput.inputValue(),'বাংলা');
const expectedAlternatives=await p.evaluate(()=>AmanahNamePhonetic.suggest('বাংলা').filter(x=>x!=='বাংলা').slice(0,4));
const currentOptions=await p.locator('#amanah-name-suggestions [role="option"]').allTextContents();
assert.deepEqual(currentOptions,['বাংলা',...expectedAlternatives]);
assert.ok(expectedAlternatives.length>0);
assert.ok(currentOptions.every(t=>!/[A-Za-z]/.test(t)));
assert.equal(await nameInput.inputValue(),'বাংলা','Suggestion display cannot change base text');
await p.locator('#amanah-name-suggestions [role="option"]').nth(1).click();
assert.equal(await nameInput.inputValue(),expectedAlternatives[0]);
assert.equal(await p.evaluate(()=>W.np.name),expectedAlternatives[0]);
console.log('UPLOADED HTML SUGGESTIONS OPTIONAL MOUSE SELECTION OK');passed++;
await nameInput.fill('');
await nameInput.pressSequentially('bangla',{delay:1});
await nameInput.press('ArrowRight');
assert.equal(await nameInput.inputValue(),'বাংলা','Highlighting must not change the actual name');
await nameInput.press('Enter');
assert.equal(await nameInput.inputValue(),expectedAlternatives[0]);
await nameInput.fill('');
await nameInput.pressSequentially('bolchen ',{delay:1});
assert.equal(await nameInput.inputValue(),'বলছেন ');
console.log('OPTIONAL KEYBOARD SUGGESTIONS AND SPACE COMMIT OK');passed++;
const sourceKeymap=await p.evaluate(()=>({
 candle:AmanahNamePhonetic.conv('caqqd'),usage:AmanahNamePhonetic.conv('bZbohar'),
 ocean:AmanahNamePhonetic.conv('somudro'),work:AmanahNamePhonetic.conv('korrmo'),
 t:AmanahNamePhonetic.conv('t'),T:AmanahNamePhonetic.conv('T'),
 example:AmanahNamePhonetic.convertText('ami bangla likhte pari')
}));
assert.equal(sourceKeymap.candle,'চাঁদ');
assert.equal(sourceKeymap.usage,'ব্যবহার');
assert.equal(sourceKeymap.ocean,'সমুদ্র');
assert.equal(sourceKeymap.work,'কর্ম');
assert.equal(sourceKeymap.t,'ত');
assert.equal(sourceKeymap.T,'ট');
assert.equal(sourceKeymap.example,'আমি বাংলা লিখতে পারি');
console.log('USER KEYMAP / LIGATURE / CASE-SENSITIVITY OK');passed++;
await p.goto('https://qa.amanah.test/patient/?id=p1');
await p.evaluate(()=>{if(!pById('p1'))D.patients.push({id:'p1',name:'Test patient',mobile:'01712345678',age:'32',sex:'পুরুষ',address:'Test'});editPatient('p1')});
await p.locator('#ep_name').fill('');
await p.locator('#ep_name').pressSequentially('Nur Islam',{delay:1});
const editExpected=await p.evaluate(()=>AmanahNamePhonetic.convertText('Nur Islam'));
assert.equal(await p.locator('#ep_name').inputValue(),editExpected);
await p.evaluate(()=>closeModal());
await p.goto('https://qa.amanah.test/appointments/');
await p.evaluate(()=>openAppt(null,null,null));
await p.locator('#ap_name').pressSequentially('Md Hasan',{delay:1});
assert.equal(await p.locator('#ap_name').inputValue(),await p.evaluate(()=>AmanahNamePhonetic.convertText('Md Hasan')));
await p.evaluate(()=>closeModal());
console.log('PHONETIC PATIENT EDIT AND APPOINTMENT FIELDS OK');passed++;

assert.ok(writes.every(w=>Number.isInteger(w.state.settings.hijriOffset)&&Math.abs(w.state.settings.hijriOffset)<=2),'Only valid hijri offsets saved during QA');
assert.deepEqual(errs,[],'browser page errors');
console.log('ALL '+passed+' PAGE/WIZARD CHECKS PASSED');
await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
