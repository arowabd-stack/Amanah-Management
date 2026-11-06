/* ================= DASHBOARD ================= */
function pDash(m){
 const t=today(),mon=t.slice(0,7);
 const tv=D.visits.filter(v=>v.date===t),mv=D.visits.filter(v=>v.date.startsWith(mon));
 const ta=D.appts.filter(a=>a.date===t&&a.status!=='cancel').sort((a,b)=>(a.time||'').localeCompare(b.time||''));
 const dueTotal=D.visits.reduce((s,v)=>s+due(v),0);
 const up=[];for(let i=0;i<40&&up.length<3;i++){const d=addDays(t,i);if(isSunnah(d))up.push(d)}
 const followups=D.visits.filter(v=>v.nextDate&&v.nextDate>=t&&v.nextDate<=addDays(t,7)).sort((a,b)=>a.nextDate.localeCompare(b.nextDate));
 const h=hijri(t);
 m.innerHTML=`
 <div class="top"><div><h2>আসসালামু আলাইকুম</h2><div class="sub">${fd(t)}${h?' · '+bn(h.day)+' '+HM[h.month-1]:''}</div></div>
  <div class="flex"><button class="btn" onclick="printBlank()">${I.print}ফাঁকা ফর্ম</button><button class="btn" onclick="openAppt()">${I.cal}অ্যাপয়েন্টমেন্ট</button><button class="btn pri" onclick="go('new')">${I.plus}নতুন সাক্ষাৎ</button></div></div>
 <div class="grid g4">
  <div class="card stat"><div class="k">আজকের রোগী</div><div class="v">${bn(tv.length)}</div><div class="s">অ্যাপয়েন্টমেন্ট ${bn(ta.length)}টি</div></div>
  <div class="card stat"><div class="k">আজকের আয়</div><div class="v">${tk(tv.reduce((s,v)=>s+(+v.paid||0),0))}</div><div class="s">এই���q�^