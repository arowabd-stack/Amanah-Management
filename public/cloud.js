/* Amanah private cloud sync: authenticated, no silent overwrites, explicit first-device migration. */
(function(){
'use strict';
try{sessionStorage.removeItem('amanah_in')}catch(e){}
const Cloud={ready:false,revision:null,pending:null,busy:false,conflict:false,lastError:'',timer:null,lastWriteAt:0};
const overlayStyle=document.createElement('style');
overlayStyle.textContent=[
'#amanahNoticeHub[hidden],#amanahNoticePanel[hidden],#amanahNoticeCount[hidden],#amanahNoticeActions[hidden],#amanahNoticeActions button[hidden]{display:none!important}',
'#amanahNoticeHub{position:fixed;right:max(12px,env(safe-area-inset-right));top:max(12px,env(safe-area-inset-top));z-index:2000;font:500 13px/1.6 system-ui,sans-serif;color:#1b392b}',
'#amanahNoticeBell{width:44px;height:44px;position:relative;display:grid;place-items:center;border-radius:14px;border:1px solid #d7e8dc;background:#fff;color:#196149;box-shadow:0 4px 17px #173e2a20;cursor:pointer}',
'#amanahNoticeBell:hover{background:#f0f8f2}',
'#amanahNoticeBell:focus-visible,#amanahNoticePanel button:focus-visible{outline:3px solid #b38d38;outline-offset:2px}',
'#amanahNoticeCount{position:absolute;top:-6px;right:-6px;min-width:19px;height:19px;display:flex;align-items:center;justify-content:center;padding:0 4px;border-radius:99px;background:#cb443e;color:#fff;border:2px solid #fff;font:750 10px/1 system-ui,sans-serif}',
'#amanahNoticePanel{position:absolute;right:0;top:calc(100% + 9px);width:min(380px,calc(100vw - 20px));max-height:min(68dvh,600px);display:flex;flex-direction:column;overflow:hidden;border:1px solid #dbe7df;border-radius:18px;background:#fff;box-shadow:0 15px 42px #15392737}',
'#amanahNoticePanel .notice-head{display:flex;align-items:center;justify-content:space-between;gap:7px;padding:14px 15px 12px;border-bottom:1px solid #edf1ee}',
'#amanahNoticePanel .notice-title{font-weight:850;font-size:16px}',
'#amanahNoticePanel .notice-head button{border:0;background:#edf5ef;color:#24583c;border-radius:8px;padding:5px 9px;cursor:pointer;font:650 12px system-ui,sans-serif}',
'#amanahNoticeList{padding:5px 9px;margin:0;list-style:none;overflow:auto;min-height:45px;overscroll-behavior:contain}',
'#amanahNoticeList li{display:flex;align-items:flex-start;gap:10px;padding:12px 8px;border-bottom:1px solid #f0f3f1}',
'#amanahNoticeList li:last-child{border-bottom:0}',
'#amanahNoticeList .notice-dot{width:8px;height:8px;flex:none;border-radius:100%;background:#44a276;margin-top:8px}',
'#amanahNoticeList li.error .notice-dot{background:#c94d43}',
'#amanahNoticeList .notice-copy{overflow-wrap:anywhere;flex:1;min-width:0;font-size:13px;line-height:1.65;color:#294435}',
'#amanahNoticeList li.error .notice-copy{color:#8c392f}',
'#amanahNoticeList time{display:block;color:#87958b;font-size:11px;margin-top:4px}',
'#amanahNoticeEmpty{padding:25px 12px;text-align:center;color:#819185}',
'#amanahNoticeActions{display:flex;flex-wrap:wrap;gap:7px;padding:10px 15px 13px;border-top:1px solid #ebf0ec}',
'#amanahNoticeActions button{cursor:pointer;border:1px solid #b8d6c3;border-radius:8px;background:#eaf5ec;color:#205d40;padding:8px 10px;font:700 12px/1.4 system-ui,sans-serif}',
'#amanahNoticeLive{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}',
'@media(max-width:700px){#amanahNoticeHub{top:max(9px,env(safe-area-inset-top));right:max(8px,env(safe-area-inset-right))}#amanahNoticeBell{width:42px;height:42px;border-radius:13px}#amanahNoticePanel{width:min(365px,calc(100vw - 16px));max-height:calc(100dvh - 135px)}}',
'@media(max-width:860px){#main>.top{padding-right:54px;min-height:44px}}',
'@media(min-width:861px){#amanahNoticeHub{position:relative;top:auto;right:auto;inset:auto;flex:0 0 auto}#amanahNoticePanel{right:auto;left:0}}',
'#amanahNoticeList li.appointment{background:#f0f8f2;margin:4px 0;border:1px solid #d9e7dd;border-radius:12px;padding:0}',
'#amanahNoticeList .appt-open{display:flex;gap:10px;align-items:flex-start;width:100%;padding:12px 9px;border:0;background:transparent;text-align:left;cursor:pointer;color:inherit;font:inherit;border-radius:12px}',
'#amanahNoticeList .appt-open:hover{background:#e5f2e9}',
'#amanahNoticeList .appt-open:focus-visible{outline:3px solid #a2cdb2;outline-offset:2px}',
'#amanahNoticeList .appt-action{font-size:12px;color:#17614a;font-weight:800;white-space:nowrap;flex:none;padding-top:3px}',
'#amanahNoticePanel .notice-preference{padding:11px 15px;border-top:1px solid #edf1ee;font-size:12px;color:#657c6d;line-height:1.6}',
'@media print{#amanahNoticeHub{display:none!important}}'
].join('');
document.head.appendChild(overlayStyle);
const hub=document.createElement('div');
hub.id='amanahNoticeHub';hub.hidden=true;
hub.innerHTML=[
'<button type="button" id="amanahNoticeBell" aria-label="নোটিফিকেশন খুলুন" aria-haspopup="true" aria-controls="amanahNoticePanel" aria-expanded="false" title="নোটিফিকেশন">',
'<svg aria-hidden="true" width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></svg>',
'<span id="amanahNoticeCount" hidden></span></button>',
'<section id="amanahNoticePanel" aria-label="Cloud ও অ্যাপ নোটিফিকেশন" hidden>',
'<div class="notice-head"><span class="notice-title">নোটিফিকেশন</span><button type="button" id="amanahNoticeClose" aria-label="নোটিফিকেশন বন্ধ করুন">বন্ধ করুন</button></div>',
'<ol id="amanahNoticeList"></ol><div id="amanahNoticeEmpty" hidden>এখন কোনো নোটিফিকেশন নেই</div>',
'<p class="notice-preference">অ্যাপয়েন্টমেন্ট রিমাইন্ডার অ্যাপ খোলা থাকলে দেখা যাবে। সময় সেটিংস থেকে বদলানো যায়।</p>',
'<div id="amanahNoticeActions" hidden><button type="button" id="cloudRetry" hidden>আবার Save</button><button type="button" id="cloudBackup" hidden>ব্যাকআপ ডাউনলোড</button><button type="button" id="cloudReload" hidden>Cloud থেকে Reload</button></div>',
'</section><span id="amanahNoticeLive" aria-live="polite" aria-atomic="true"></span>'
].join('');
document.body.appendChild(hub);
const bell=document.getElementById('amanahNoticeBell'),panel=document.getElementById('amanahNoticePanel');
const count=document.getElementById('amanahNoticeCount'),list=document.getElementById('amanahNoticeList');
const empty=document.getElementById('amanahNoticeEmpty'),actionsPanel=document.getElementById('amanahNoticeActions');
const live=document.getElementById('amanahNoticeLive');
const retry=document.getElementById('cloudRetry'),backup=document.getElementById('cloudBackup'),reload=document.getElementById('cloudReload');
const messages=[];
let unread=0,lastActions={};
let appointmentReminders=[];
const REMINDER_SEEN_KEY='amanah-reminder-seen-v1';
const seenAppointmentKeys=new Set();
try{const a=JSON.parse(localStorage.getItem(REMINDER_SEEN_KEY)||'[]');if(Array.isArray(a))for(const id of a.slice(-400))if(typeof id==='string'&&id.length<250)seenAppointmentKeys.add(id)}catch(e){}
function rememberOpenedReminders(){let changed=false;for(const a of appointmentReminders)if(!seenAppointmentKeys.has(a.key)){seenAppointmentKeys.add(a.key);changed=true}if(changed)try{localStorage.setItem(REMINDER_SEEN_KEY,JSON.stringify([...seenAppointmentKeys].slice(-400)))}catch(e){}}
function dhakaDateParts(value){const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value||''));if(!m)return null;const y=+m[1],mon=+m[2],day=+m[3];if(y<2020||y>2100||mon<1||mon>12||day<1||day>31)return null;const verify=new Date(Date.UTC(y,mon-1,day));if(verify.getUTCFullYear()!==y||verify.getUTCMonth()!==mon-1||verify.getUTCDate()!==day)return null;return {y,mon,day}}
function appointmentReminderRange(appt,mode){
 const date=dhakaDateParts(appt?.date);if(!date)return null;
 const midnightUTC=Date.UTC(date.y,date.mon-1,date.day);
 const tz=6*3600000; // Bangladesh standard time (Asia/Dhaka), UTC+06:00.
 const end=midnightUTC+86400000-tz;
 const t=/^(\d{1,2}):(\d{2})$/.exec(String(appt.time||''));
 const timeValid=!!(t&&+t[1]<24&&+t[2]<60);
 const appointmentAt=timeValid?midnightUTC+(+t[1]*60 + +t[2])*60000-tz:null;
 const trigger=mode==='12h'&&timeValid?appointmentAt-12*3600000:midnightUTC-86400000+20*3600000-tz;
 return {trigger,end,appointmentAt};
}
function refreshAppointmentReminders(){
 if(!Cloud.ready||!D||!Array.isArray(D.appts))return;
 const mode=D.settings?.apptReminderMode==='12h'?'12h':'evening';
 const now=Date.now();const next=[];
 for(const a of D.appts){
  if(!a||a.status!=='pending'||typeof a.id!=='string')continue;
  const range=appointmentReminderRange(a,mode);
  if(!range||now<range.trigger||now>=range.end)continue;
  const p=a.patientId&&Array.isArray(D.patients)?D.patients.find(x=>x.id===a.patientId):null;
  const name=(p?.name||a.name||'অ্যাপয়েন্টমেন্ট').trim();
  const dateText=typeof fd==='function'?fd(a.date):a.date;
  const timeText=a.time?(' • '+(typeof bn==='function'?bn(a.time):a.time)):' • সময় নির্ধারিত নয়';
  const reminderKey=[a.id,a.date,a.time||'',mode].join('|');
  next.push({key:reminderKey,appointmentId:a.id,message:'অ্যাপয়েন্টমেন্ট: '+name,subtitle:dateText+timeText,at:range.trigger,due:range.appointmentAt??range.end});
 }
 next.sort((a,b)=>a.due-b.due);
 appointmentReminders=next.slice(0,100);
 // A reminder that arrives in the visible panel has already been displayed to the user.
 if(!panel.hidden&&!document.hidden)rememberOpenedReminders();
 drawNotices();
}
function openReminderAppointment(id){
 if(!Cloud.ready)return;
 const appt=D.appts.find(a=>a.id===id&&a.status==='pending');
 if(!appt){refreshAppointmentReminders();return;}
 // Use the original appointment detail / edit modal, not a generic patient page.
 openNotices(false);
 calSel=appt.date;calM=appt.date.slice(0,7);
 go('appts');openAppt(appt.id);
 // If this appointment is linked to a registered patient, expose the patient file too.
 if(appt.patientId&&Array.isArray(D.patients)&&D.patients.some(p=>p.id===appt.patientId)){
  const saveButton=document.getElementById('ap_ok');
  if(saveButton&&saveButton.parentElement&&!document.getElementById('apptPatientFileLink')){
   const view=document.createElement('button');view.type='button';view.id='apptPatientFileLink';view.className='btn';view.textContent='রোগীর ফাইল';
   view.addEventListener('click',()=>{closeModal();go('patient',appt.patientId)});
   saveButton.parentElement.prepend(view);
  }
 }
}

function drawNotices(){
 list.replaceChildren();
 for(const item of [...appointmentReminders.map(a=>({...a,kind:'appointment'})),...messages]){
  const row=document.createElement('li');if(item.error)row.className='error';
  if(item.kind==='appointment')row.className='appointment';
  const dot=document.createElement('span');dot.className='notice-dot';dot.setAttribute('aria-hidden','true');
  const body=document.createElement('div');body.className='notice-copy';
  const copy=document.createElement('div');copy.textContent=item.message;
  const time=document.createElement('time');time.dateTime=new Date(item.at).toISOString();
  time.textContent=new Date(item.at).toLocaleTimeString('bn-BD',{hour:'numeric',minute:'2-digit'});
  if(item.kind==='appointment'){
   copy.style.fontWeight='750';time.textContent=item.subtitle;
   const action=document.createElement('button');action.type='button';action.className='appt-open';action.setAttribute('aria-label',item.message+' • '+item.subtitle+' • ফাইল খুলুন');
   const arrow=document.createElement('span');arrow.className='appt-action';arrow.textContent='দেখুন ›';
   body.append(copy,time);action.append(dot,body,arrow);row.appendChild(action);
   action.addEventListener('click',()=>openReminderAppointment(item.appointmentId));
  }else{body.append(copy,time);row.append(dot,body)}
  list.appendChild(row);
 }
 empty.hidden=messages.length!==0||appointmentReminders.length!==0;
 retry.hidden=!lastActions.retry;
 backup.hidden=!lastActions.backup;
 reload.hidden=!lastActions.reload;
 actionsPanel.hidden=retry.hidden&&backup.hidden&&reload.hidden;
 const critical=!!(Cloud.conflict||Cloud.lastError);
 const pendingReminders=appointmentReminders.filter(a=>!seenAppointmentKeys.has(a.key)).length;
 const totalUnread=Math.min(99,unread+pendingReminders);
 count.hidden=!totalUnread&&!critical;
 count.textContent=totalUnread>0?(totalUnread>9?'9+':String(totalUnread)):'!';
 bell.setAttribute('aria-label',totalUnread?totalUnread+'টি নতুন নোটিফিকেশন দেখুন':critical?'জরুরি নোটিফিকেশন দেখুন':'নোটিফিকেশন খুলুন');
 positionNoticePanel();
}
function positionNoticePanel(){
 if(panel.hidden)return;
 if(!bellDesktopMedia.matches){panel.style.left='';panel.style.right='';return;}
 const anchor=hub.getBoundingClientRect();
 const left=Math.max(10,Math.min(anchor.left,document.documentElement.clientWidth-panel.offsetWidth-10));
 panel.style.left=(left-anchor.left)+'px';panel.style.right='auto';
}
function openNotices(open){
 panel.hidden=!open;bell.setAttribute('aria-expanded',String(open));
 if(open){unread=0;refreshAppointmentReminders();rememberOpenedReminders();drawNotices()}
}
bell.addEventListener('click',()=>openNotices(panel.hidden));
document.getElementById('amanahNoticeClose').addEventListener('click',()=>{openNotices(false);bell.focus()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden){openNotices(false);bell.focus()}});
document.addEventListener('click',e=>{if(!hub.contains(e.target)&&!panel.hidden)openNotices(false)});
function badge(status,error,actions){
 // All Cloud status events go into the bell; the former floating banner is removed.
 if(!Cloud.ready)return;
 hub.hidden=false;
 const message=String(status||'').trim();
 if(!message)return;
 if(!error&&(/হচ্ছে|যাচাই হচ্ছে|প্রয়োজন/.test(message)))return;
 const now=Date.now();
 const top=messages[0];
 if(top&&top.message===message&&top.error===!!error&&now-top.at<30000)top.at=now;
 else{
  messages.unshift({message,error:!!error,at:now});
  if(messages.length>25)messages.pop();
  if(panel.hidden)unread=Math.min(99,unread+1);
 }
 lastActions=actions||{};
 if(error)live.textContent='নোটিফিকেশনে সতর্কতা এসেছে। নোটিফিকেশন বেল খুলে দেখুন।';
 drawNotices();
}
// Keep the desktop bell inside the normal header layout instead of floating over action buttons.
// On mobile, return it to the document body and keep the existing fixed top-right position.
const bellDesktopMedia=window.matchMedia('(min-width: 861px)');
function placeNoticeBell(){
 if(!Cloud.ready)return;
 if(!bellDesktopMedia.matches){
  if(hub.parentElement!==document.body)document.body.appendChild(hub);
  positionNoticePanel();
  return;
 }
 const header=document.querySelector('#main > .top');
 const actions=header?.querySelector(':scope > .flex');
 const slot=actions||header;
 if(slot){
  if(hub.parentElement!==slot || slot.firstElementChild!==hub){
   slot.insertBefore(hub,slot.firstChild);
  }
 }else if(hub.parentElement!==document.body)document.body.appendChild(hub);
 positionNoticePanel();
}
const renderBeforeNoticeBell=render;
render=function(...args){
 // Render replaces #main.innerHTML; first detach the bell so it survives route changes.
 if(hub.parentElement!==document.body)document.body.appendChild(hub);
 const result=renderBeforeNoticeBell.apply(this,args);
 placeNoticeBell();
 refreshAppointmentReminders();
 return result;
};
if(typeof bellDesktopMedia.addEventListener==='function')bellDesktopMedia.addEventListener('change',placeNoticeBell);
else if(typeof bellDesktopMedia.addListener==='function')bellDesktopMedia.addListener(placeNoticeBell);
window.addEventListener('resize',positionNoticePanel);

function countLocal(d){return (d?.patients?.length||0)+(d?.visits?.length||0)+(d?.appts?.length||0)}
function saveBackup(d,filename){
 const blob=new Blob([JSON.stringify(d,null,2)],{type:'application/json;charset=utf-8'});
 const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename||('amanah-local-backup-'+today()+'.json');
 document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(url);a.remove()},1000);
}
function loginView(message){
 Cloud.ready=false;
 hub.hidden=true;
 openNotices(false);
 const login=$('#login');const shell=$('#shell');
 if(shell)shell.hidden=true;
 if(login){login.hidden=false;login.style.display='';}
 const pw=$('#lpPass');if(pw)pw.placeholder='Cloud Admin Password';
 const err=$('#lpErr');if(err)err.textContent=message||'';
 badge('নিরাপদ Cloud Login প্রয়োজন',false,{});
}
async function fetchJson(url,options){
 const r=await fetch(url,Object.assign({credentials:'same-origin',cache:'no-store',headers:{Accept:'application/json'}},options||{}));
 let out;try{out=await r.json()}catch{throw Error('সার্ভার থেকে JSON পাওয়া যায়নি (HTTP '+r.status+')')}
 if(!r.ok){const e=new Error(out.error||'HTTP '+r.status);e.status=r.status;e.code=out.code;throw e}
 return out;
}
const localSave=Store.save.bind(Store);
Store.save=function(data){
 if(!Cloud.ready)return localSave(data);
 data._syncVersion=(Number(data._syncVersion)||0)+1;
 Cloud.pending=JSON.parse(JSON.stringify(data));
 refreshAppointmentReminders();
 badge('পরিবর্তন Cloud-এ Save হচ্ছে…',false,{});
 if(Cloud.conflict){badge('অন্য ডিভাইসের সঙ্গে পরিবর্তনের বিরোধ। Draft ব্যাকআপ নিয়ে Reload করুন।',true,{backup:true,reload:true});return false}
 clearTimeout(Cloud.timer);Cloud.timer=setTimeout(flush,250);
 return true;
};
const persist=()=>Cloud.ready&&Cloud.pending!==null;
async function flush(){
 if(!Cloud.ready||Cloud.busy||Cloud.conflict||!Cloud.pending)return;
 const snapshot=Cloud.pending;Cloud.pending=null;Cloud.busy=true;
 try{
  const out=await fetchJson('/api/clinic',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({state:snapshot,revision:Cloud.revision})});
  Cloud.revision=out.revision;Cloud.lastError='';Cloud.lastWriteAt=Date.now();
  badge('✓ সব পরিবর্তন Cloud-এ সংরক্ষিত',false,{});
 }catch(e){
  Cloud.pending=Cloud.pending||snapshot;
  Cloud.lastError=e.message;
  if(e.status===409){Cloud.conflict=true;badge('একই তথ্যের দুটি Save একসঙ্গে হয়েছে। ডেটা মুছে যায়নি। প্রথমে ব্যাকআপ ডাউনলোড করে তারপর Cloud Reload করুন।',true,{backup:true,reload:true})}
  else{badge('Cloud Save হয়নি: '+e.message,true,{retry:true,backup:true})}
 }finally{
  Cloud.busy=false;
  if(Cloud.pending&&!Cloud.conflict&&!Cloud.lastError){clearTimeout(Cloud.timer);Cloud.timer=setTimeout(flush,200)}
 }
}
retry.onclick=()=>{Cloud.lastError='';Cloud.conflict=false;flush()};
backup.onclick=()=>saveBackup(Cloud.pending||D,'amanah-unsynced-'+today()+'.json');
reload.onclick=async()=>{
 if((Cloud.pending||Cloud.conflict)&&!confirm('এখনকার Unsynced পরিবর্তন হারাতে পারে। আগে “ব্যাকআপ ডাউনলোড” করুন। তবুও Cloud থেকে নতুন ডেটা আনবে?'))return;
 try{
  badge('Cloud থেকে নতুন ডেটা আনা হচ্ছে…',false,{});
  const res=await fetchJson('/api/clinic');
  if(!res.state)throw Error('Cloud ডেটা এখনো তৈরি হয়নি');
  Cloud.pending=null;Cloud.conflict=false;Cloud.lastError='';Cloud.revision=res.revision;D=res.state;
  W=null;route='dash';param=null;render();
  badge('✓ Cloud-এর সাম্প্রতিক ডেটা লোড হয়েছে',false,{});
 }catch(e){badge('Cloud Reload ব্যর্থ: '+e.message,true,{retry:true,backup:true})}
};
window.addEventListener('beforeunload',e=>{
 if(Cloud.ready&&(Cloud.busy||Cloud.pending||Cloud.conflict)){e.preventDefault();e.returnValue=''}
});
async function pollCloud(){
 if(!Cloud.ready||Cloud.busy||Cloud.pending||Cloud.conflict||Cloud.lastError)return;
 try{
  const incoming=await fetchJson('/api/clinic');
  if(!incoming.state||incoming.revision===Cloud.revision)return;
  // Blob overwrite caches can briefly return an older ETag. Never restore older records over new work.
  if((Number(incoming.state._syncVersion)||0)<=(Number(D._syncVersion)||0))return;
  const modalOpen=!!(document.querySelector('#modal')&&!$('#modal').hidden);
  if(W||modalOpen){badge('অন্য ডিভাইসের নতুন ডেটা আছে। কাজ শেষ করে Cloud Reload করুন।',true,{reload:true,backup:true});return}
  Cloud.revision=incoming.revision;D=incoming.state;render();
  badge('✓ অন্য ডিভাইসের পরিবর্তন আপডেট হয়েছে',false,{});
 }catch(e){if(e.status===401)loginView('Session শেষ হয়েছে। আবার Login করুন।')}
}
async function cloudOpen(){
 badge('Private Cloud থেকে তথ্য যাচাই হচ্ছে…',false,{});
 let remote=await fetchJson('/api/clinic');
 if(remote.state){
  // Only clean v2 data is read. Legacy local data is not imported automatically.
  D=remote.state;Cloud.revision=remote.revision;
 }else{
  // Fresh start. Keep prior v1 browser records untouched, but completely separate.
  const fresh=JSON.parse(JSON.stringify(DEF));
  fresh._syncVersion=0;
  try{
   const uploaded=await fetchJson('/api/clinic',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({state:fresh,revision:null})});
   D=fresh;Cloud.revision=uploaded.revision;
  }catch(e){
   if(e.status!==409)throw e;
   // Another tab/device initialized v2 first; use it instead of showing a false conflict.
   remote=await fetchJson('/api/clinic');
   if(!remote.state)throw Error('Cloud data is being initialized. Try logging in again.');
   D=remote.state;Cloud.revision=remote.revision;
  }
 }
 Cloud.ready=true;Cloud.pending=null;Cloud.conflict=false;Cloud.lastError='';Cloud.lastWriteAt=Date.now();
 hub.hidden=false;
 $('#login').hidden=true;$('#login').style.display='none';$('#shell').hidden=false;
 enter();
 badge('✓ Private Cloud প্রস্তুত • '+bn(D.patients.length)+' জন রোগী',false,{});
 if(!window.__amanahCloudPolling){window.__amanahCloudPolling=setInterval(pollCloud,20000)}
 if(!window.__amanahReminderClock){window.__amanahReminderClock=setInterval(refreshAppointmentReminders,60000)}
}
$('#loginForm').onsubmit=async e=>{
 e.preventDefault();
 const button=$('#loginForm button[type="submit"]');if(button)button.disabled=true;
 const err=$('#lpErr');err.textContent='নিরাপদ Cloud Login হচ্ছে…';
 try{
  await fetchJson('/api/session',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:$('#lpUser').value.trim(),password:$('#lpPass').value})});
  $('#lpPass').value='';await cloudOpen();
 }catch(ex){loginView(ex.message);badge('Login/Cloud ডেটা প্রস্তুত হয়নি: '+ex.message,true,{})}
 finally{if(button)button.disabled=false}
};
$('#logout').onclick=async()=>{try{await fetchJson('/api/session',{method:'DELETE',headers:{'Content-Type':'application/json'},body:'{}'})}catch(e){}location.reload()};
const prevSettings=pSettings;
pSettings=function(m){
 prevSettings(m);
 const n=$('#u_n');if(n){const card=n.closest('.card');if(card)card.innerHTML='<div class="h3">নিরাপদ Cloud Login</div><p class="price-note">রোগীর তথ্য এখন Private Cloud-এ থাকে এবং Server-side Admin Login দিয়ে সুরক্ষিত। পাসওয়ার্ড বদলাতে Vercel Environment-এর AMANAH_ADMIN_PASSWORD_HASH নিরাপদভাবে পরিবর্তন করতে হবে। আগের ব্রাউজার-ভিত্তিক password আর ব্যবহৃত হয় না।</p>';}

 const target=m.querySelector('.grid.g2')||m;
 const card=document.createElement('div');card.className='card';
 card.innerHTML='<div class="h3">অ্যাপয়েন্টমেন্ট রিমাইন্ডার</div>'+
 '<label for="apptReminderSetting">নোটিফিকেশন কখন শুরু হবে?</label>'+
 '<select id="apptReminderSetting" aria-describedby="apptReminderExplanation">'+
 '<option value="evening">অ্যাপয়েন্টমেন্টের আগের দিন রাত ৮টা</option>'+
 '<option value="12h">অ্যাপয়েন্টমেন্টের ১২ ঘণ্টা আগে</option></select>'+
 '<p class="price-note" id="apptReminderExplanation">রিমাইন্ডার বাংলাদেশের সময় (UTC+06:00) অনুযায়ী হিসাব হবে। সময় লেখা না থাকলে আগের দিন রাত ৮টায় দেখাবে। ওয়েবসাইট খোলা থাকলে নোটিফিকেশন Bell-এ আসবে; বন্ধ থাকলে পরেরবার Login করলে দেখা যাবে।</p>';
 target.appendChild(card);
 const reminderSelect=card.querySelector('#apptReminderSetting');
 reminderSelect.value=D.settings.apptReminderMode==='12h'?'12h':'evening';
 reminderSelect.addEventListener('change',()=>{
   D.settings.apptReminderMode=reminderSelect.value==='12h'?'12h':'evening';
   save();refreshAppointmentReminders();toast('রিমাইন্ডারের সময় সেভ করা হচ্ছে');
 });

};
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&Cloud.ready)refreshAppointmentReminders()});
loginView('');
fetchJson('/api/session').then(s=>s.authenticated?cloudOpen():loginView('Cloud Admin Login করুন')).catch(e=>loginView('Cloud সংযোগ পাওয়া যাচ্ছে না: '+e.message));
})();
