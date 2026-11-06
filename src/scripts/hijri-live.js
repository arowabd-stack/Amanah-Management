/* iHadis Bangladesh calendar sync. Only today's date is source-verified.
   Nearby future dates are estimates anchored to that date, never represented as official. */
(function(){
 'use strict';
 const source='https://ihadis.com/en/calendar/bangladesh/islamic-date-today';
 const calculatedHijri=hijri;
 const state={status:'loading',date:null,hijri:null,sourceUrl:source,lastChecked:0,offset:null};
 let pending=null;
 function bdDate(){
  const parts=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Dhaka',day:'2-digit',month:'2-digit',year:'numeric'}).formatToParts(new Date());
  const p=Object.fromEntries(parts.map(part=>[part.type,part.value]));
  return p.year+'-'+p.month+'-'+p.day;
 }
 function shiftDate(date,days){
  const d=new Date(date+'T12:00:00Z');
  if(Number.isNaN(d.getTime()))return null;
  d.setUTCDate(d.getUTCDate()+days);
  return d.toISOString().slice(0,10);
 }
 function daysApart(a,b){
  const da=Date.parse(a+'T00:00:00Z'),db=Date.parse(b+'T00:00:00Z');
  return Number.isFinite(da)&&Number.isFinite(db)?Math.round((da-db)/86400000):Infinity;
 }
 function sourceOffset(date,live){
  for(const shift of [0,-1,1,-2,2]){
   const candidate=shiftDate(date,shift);
   const h=candidate?calculatedHijri(candidate):null;
   if(h&&h.day===live.day&&h.month===live.month)return shift;
  }
  return null;
 }
 // Replace the previous Umm al-Qura *display* path. Do not use it as a fallback
 // when an up-to-date iHadis source date cannot be verified.
 hijri=function(date){
  if(state.status!=='ready'||!state.hijri||state.date!==bdDate())return null;
  if(date===state.date)return {...state.hijri,estimated:false,verified:true};
  if(!/^\d{4}-\d{2}-\d{2}$/.test(String(date||'')))return null;
  if(Math.abs(daysApart(date,state.date))>50||state.offset===null)return null;
  const converted=calculatedHijri(shiftDate(date,state.offset));
  return converted?{...converted,estimated:true,verified:false}:null;
 };
 function notify(){
  if(typeof route!=='undefined'&&(route==='dash'||route==='appts')&&typeof render==='function'){
   render();
  }
 }
 async function sync(){
  if(pending)return pending;
  const current=bdDate();
  if(state.date&&state.date!==current){
   state.status='loading';state.date=null;state.hijri=null;state.offset=null;
   notify();
  }
  pending=(async()=>{
   try{
    const resp=await fetch('/api/hijri',{credentials:'same-origin',cache:'no-store'});
    if(!resp.ok)throw Error('Could not verify iHadis');
    const body=await resp.json();
    if(!body.ok||body.source!=='iHadis'||body.date!==bdDate()||!body.hijri)throw Error('iHadis date mismatch');
    const h=body.hijri;
    if(!Number.isInteger(h.day)||!Number.isInteger(h.month)||!Number.isInteger(h.year)||h.day<1||h.day>30||h.month<1||h.month>12)throw Error('Invalid iHadis date');
    state.date=body.date;state.hijri={day:h.day,month:h.month,year:h.year};
    state.offset=sourceOffset(state.date,state.hijri);
    state.status='ready';
   }catch(_error){
    state.status='unavailable';state.date=null;state.hijri=null;state.offset=null;
   }finally{
    state.lastChecked=Date.now();
    pending=null;
    notify();
   }
  })();
  return pending;
 }
 window.AmanahHijri=Object.freeze({
  get status(){return state.status},
  get date(){return state.date},
  get checkedAt(){return state.lastChecked},
  sourceUrl:source,
  refresh:sync
 });
 sync();
 setInterval(()=>{
  if(document.visibilityState!=='visible')return;
  if(state.date&&state.date!==bdDate()||Date.now()-state.lastChecked>10*60*1000)sync();
 },60*1000);
 document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState==='visible'&&(!state.lastChecked||Date.now()-state.lastChecked>5*60*1000||state.date&&state.date!==bdDate()))sync();
 });
})();
