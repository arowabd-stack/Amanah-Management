// Isolated browser regression: every request is fulfilled locally. No production API is called.
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const results = [];
const clone = value => JSON.parse(JSON.stringify(value));
const patient = {id:'qa-patient',name:'QA TEST PATIENT',mobile:'',sex:'পুরুষ',age:'30',address:'TEST ONLY'};
const appt = (extra={}) => ({id:'qa-appointment',patientId:patient.id,name:'',mobile:'',date:'2026-11-07',time:'10:00',service:'s1',therapist:'t1',note:'QA TEST ONLY',status:'pending',...extra});
const fixture = (mode='evening',appts=[appt()]) => ({
  settings:{center:'QA TEST CLINIC',address:'TEST ONLY',phone:'',therapists:[{id:'t1',name:'QA therapist',gender:'পুরুষ'}],services:[{id:'s1',name:'QA service',fee:0}],defAdvice:'',waTpl:'',apptReminderMode:mode},
  patients:[patient,{...patient,id:'qa-other',name:'OTHER TEST PATIENT'}],visits:[],appts,seq:0,mig1:1,_syncVersion:1
});
const artifacts = process.env.QA_ARTIFACTS || '/tmp/amanah-reminder-qa';
fs.mkdirSync(artifacts,{recursive:true});
let browser;
async function session({state=fixture(),now='2026-11-06T20:00:00+06:00',width=1440,timezoneId='Asia/Dhaka'}={}) {
  const context=await browser.newContext({viewport:{width,height:900},timezoneId});
  const page=await context.newPage();
  const api={state:clone(state),revision:'qa-1',reads:0,writes:[],errors:[]};
  page.on('pageerror',e=>api.errors.push(e.message));
  await context.route('**/*',async route=>{
    const req=route.request(),url=new URL(req.url());
    // Do not contact third-party CDNs; unrelated export libraries are unused here.
    if(url.origin!=='https://qa.amanah.test')return route.fulfill({status:200,body:'',contentType:'text/plain'});
    if(url.pathname==='/api/session')return route.fulfill({json:{authenticated:true}});
    if(url.pathname==='/api/clinic'){
      if(req.method()==='PUT'){
        const body=req.postDataJSON();api.writes.push(clone(body));
        if(body.revision!==api.revision)return route.fulfill({status:409,json:{error:'QA stale revision',code:'STALE_REVISION'}});
        api.state=clone(body.state);api.revision='qa-'+(Number(api.revision.slice(3))+1);
        return route.fulfill({json:{ok:true,revision:api.revision}});
      }
      api.reads++;return route.fulfill({json:{state:clone(api.state),revision:api.revision}});
    }
    const file=path.join(root,'public',url.pathname==='/'?'index.html':url.pathname.slice(1));
    if(!fs.existsSync(file))return route.fulfill({status:404,body:''});
    return route.fulfill({body:fs.readFileSync(file),contentType:file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':'text/html'});
  });
  await page.clock.install({time:new Date(now)});
  await page.goto('https://qa.amanah.test/');
  await page.locator('#amanahNoticeBell').waitFor({state:'visible'});
  const s={page,context,api,
    reminders:()=>page.locator('.appt-open').count(),
    count:()=>page.locator('#amanahNoticeCount').evaluate(e=>e.hidden?0:e.textContent),
    async at(time){await page.clock.setFixedTime(new Date(time));await page.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')))},
    async read(){await page.locator('#amanahNoticeBell').click();await page.locator('#amanahNoticeClose').click()},
    async poll(state){api.state=clone(state);api.revision='qa-'+(Number(api.revision.slice(3))+1);await page.clock.runFor(20001);await page.waitForFunction(version=>D._syncVersion===version,state._syncVersion)},
    async close(){assert.deepEqual(api.errors,[],'Browser runtime errors');await context.close()}
  };
  return s;
}
async function check(name,fn){try{await fn();results.push({name,status:'PASS'});console.log('PASS '+name)}catch(e){results.push({name,status:'FAIL',error:e.message});console.log('FAIL '+name+': '+e.message)}}
async function main(){
  browser=await chromium.launch({headless:true});
  try {
    for(const timezoneId of ['Asia/Dhaka','UTC','America/New_York']){
      await check('8pm boundary, browser timezone '+timezoneId,async()=>{
        const s=await session({now:'2026-11-06T19:59:59+06:00',timezoneId});
        assert.equal(await s.reminders(),0);await s.read();
        await s.at('2026-11-06T20:00:00+06:00');assert.equal(await s.reminders(),1);assert.equal(await s.count(),'1');
        await s.at('2026-11-08T00:00:00+06:00');assert.equal(await s.reminders(),0);await s.close();
      });
      await check('12-hour boundary, browser timezone '+timezoneId,async()=>{
        const s=await session({state:fixture('12h'),now:'2026-11-06T21:59:59+06:00',timezoneId});
        assert.equal(await s.reminders(),0);await s.at('2026-11-06T22:00:00+06:00');assert.equal(await s.reminders(),1);await s.close();
      });
    }
    await check('No-time fallback, invalid dates and inactive appointments',async()=>{
      const s=await session({state:fixture('12h',[appt({time:''}),appt({id:'done',status:'done'}),appt({id:'cancel',status:'cancel'}),appt({id:'bad-date',date:'2026-02-30'})]),now:'2026-11-06T19:59:59+06:00'});
      assert.equal(await s.reminders(),0);await s.at('2026-11-06T20:00:00+06:00');assert.equal(await s.reminders(),1);await s.close();
    });
    await check('Month, year, leap-day and midnight boundaries',async()=>{
      for(const [date,time,before,trigger] of [
        ['2027-01-01','00:30','2026-12-31T12:29:59+06:00','2026-12-31T12:30:00+06:00'],
        ['2028-03-01','10:00','2028-02-29T21:59:59+06:00','2028-02-29T22:00:00+06:00']]){
        const s=await session({state:fixture('12h',[appt({date,time})]),now:before});
        assert.equal(await s.reminders(),0);await s.at(trigger);assert.equal(await s.reminders(),1);await s.close();
      }
    });
    await check('Unread clears and stays read after reload and Cloud poll',async()=>{
      const s=await session();await s.read();assert.equal(await s.count(),0);
      await s.page.reload();await s.page.locator('#amanahNoticeBell').waitFor({state:'visible'});await s.read();assert.equal(await s.count(),0);
      const next=clone(s.api.state);next._syncVersion++;await s.poll(next);
      // Cloud status may be unread; reminder itself must stay read.
      const seen=await s.page.evaluate(()=>JSON.parse(localStorage.getItem('amanah-reminder-seen-v1')));
      assert(seen.includes('qa-appointment|2026-11-07|10:00|evening'));assert.equal(await s.reminders(),1);await s.close();
    });
    await check('Reminder arriving while Bell is open is read',async()=>{
      const s=await session({now:'2026-11-06T19:59:59+06:00'});
      await s.page.locator('#amanahNoticeBell').click();await s.at('2026-11-06T20:00:00+06:00');
      assert.equal(await s.reminders(),1);assert.equal(await s.count(),0);await s.close();
    });
    await check('Minute timer activates a reminder without navigation',async()=>{
      const s=await session({now:'2026-11-06T19:59:30+06:00'});await s.read();
      await s.page.clock.runFor(60001);assert.equal(await s.reminders(),1);await s.close();
    });
    for(const width of [375,600,700,768,860,861,1024,1440]){
      await check('Bell, panel and appointment/patient navigation at '+width+'px',async()=>{
        const s=await session({width});
        await s.page.locator('#amanahNoticeBell').click();
        const bounds=await s.page.locator('#amanahNoticePanel').boundingBox();
        await s.page.screenshot({path:path.join(artifacts,'bell-'+width+'.png')});
        assert(bounds.x>=0&&bounds.x+bounds.width<=width+1,'Notification panel leaves viewport: '+JSON.stringify(bounds));
        const bell=await s.page.locator('#amanahNoticeBell').boundingBox();
        const btn=await s.page.locator('#main > .top button').last().boundingBox();
        if(btn)assert(!(bell.x<btn.x+btn.width&&bell.x+bell.width>btn.x&&bell.y<btn.y+btn.height&&bell.y+bell.height>btn.y),'Bell overlaps header action');
        await s.page.locator('.appt-open').click();assert.equal(await s.page.locator('#ap_date').inputValue(),'2026-11-07');assert.equal(await s.page.locator('#ap_time').inputValue(),'10:00');
        assert.match(await s.page.locator('#mbox').innerText(),/QA TEST PATIENT/);
        await s.page.locator('#apptPatientFileLink').click();assert.match(await s.page.locator('#main').innerText(),/QA TEST PATIENT/);
        assert(!await s.page.locator('#modal').isVisible());assert.equal(s.api.writes.length,0);await s.close();
      });
    }
    await check('Unregistered appointment opens without unrelated patient link',async()=>{
      const s=await session({state:fixture('evening',[appt({patientId:null,name:'QA NEW PATIENT'})])});
      await s.page.locator('#amanahNoticeBell').click();await s.page.locator('.appt-open').click();assert.equal(await s.page.locator('#ap_name').inputValue(),'QA NEW PATIENT');assert.equal(await s.page.locator('#apptPatientFileLink').count(),0);await s.close();
    });
    await check('Bell survives routes and mobile/desktop resize',async()=>{
      const s=await session();
      for(const width of [375,768,1024,1440]){
        await s.page.setViewportSize({width,height:900});
        for(const route of ['dash','patients','appts','money','settings']){
          // Exercise route re-rendering even when the desktop sidebar is hidden.
          await s.page.evaluate(route=>go(route),route);
          assert.equal(await s.page.locator('#amanahNoticeBell').count(),1);
          await s.page.locator('#amanahNoticeBell').click();
          const box=await s.page.locator('#amanahNoticePanel').boundingBox();
          assert(box.x>=0&&box.x+box.width<=width+1,route+' at '+width+'px panel leaves viewport: '+JSON.stringify(box));
          await s.page.locator('#amanahNoticeClose').click();
        }
      }
      assert.equal(s.api.writes.length,0);await s.close();
    });
    await check('Settings save round trip preserves 12-hour mode and patient data',async()=>{
      const s=await session({now:'2026-11-06T21:00:00+06:00'});const original=clone(s.api.state.patients);
      await s.page.locator('#nav [data-r="settings"]').click();await s.page.locator('#apptReminderSetting').selectOption('12h');
      await s.page.clock.runFor(1000);for(let i=0;i<20&&!s.api.writes.length;i++)await new Promise(r=>setTimeout(r,10));
      assert.equal(s.api.state.settings.apptReminderMode,'12h');assert.deepEqual(s.api.state.patients,original);assert.equal(await s.reminders(),0);
      await s.page.reload();await s.page.locator('#amanahNoticeBell').waitFor({state:'visible'});await s.at('2026-11-06T22:00:00+06:00');assert.equal(await s.reminders(),1);await s.close();
    });
    await check('Cloud polling applies mode, reschedule, cancellation and patient changes',async()=>{
      const s=await session({state:fixture('12h'),now:'2026-11-06T21:00:00+06:00'});assert.equal(await s.reminders(),0);
      let next=clone(s.api.state);next.settings.apptReminderMode='evening';next._syncVersion++;await s.poll(next);
      await s.page.locator('.appt-open').waitFor({state:'attached'});assert.equal(await s.reminders(),1);
      next=clone(s.api.state);next.appts[0].date='2026-11-09';next._syncVersion++;await s.poll(next);assert.equal(await s.reminders(),0);
      next=clone(s.api.state);next.appts[0].date='2026-11-07';next.appts[0].patientId='qa-other';next._syncVersion++;await s.poll(next);await s.page.locator('.appt-open').waitFor({state:'attached'});
      assert.match(await s.page.locator('.appt-open').textContent(),/OTHER TEST PATIENT/);
      next=clone(s.api.state);next.appts[0].status='cancel';next._syncVersion++;await s.poll(next);assert.equal(await s.reminders(),0);assert.equal(s.api.writes.length,0);await s.close();
    });
  } finally {await browser.close();fs.writeFileSync(path.join(artifacts,'results.json'),JSON.stringify(results,null,2))}
  console.log(JSON.stringify({passed:results.filter(r=>r.status==='PASS').length,failed:results.filter(r=>r.status==='FAIL').length,artifacts}));
  if(results.some(r=>r.status==='FAIL'))process.exitCode=1;
}
main().catch(e=>{console.error(e);process.exitCode=1});
