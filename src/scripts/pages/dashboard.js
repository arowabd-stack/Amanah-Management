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
 <div class="top"><div><h2>আসসালামু আলাইকুম</h2><div class="sub">${fd(t)}${h?' · '+bn(h.day)+' '+HM[h.month-1]+' '+bn(h.year)+' হিজরি (iHadis)':' · '+(window.AmanahHijri?.status==='loading'?'হিজরি যাচাই হচ্ছে…':'iHadis-এর তারিখ পাওয়া যাচ্ছে না')}</div></div>
  <div class="flex"><button class="btn" onclick="printBlank()">${I.print}ফাঁকা ফর্ম</button><button class="btn" onclick="openAppt()">${I.cal}অ্যাপয়েন্টমেন্ট</button><button class="btn pri" onclick="go('new')">${I.plus}নতুন সাক্ষাৎ</button></div></div>
 <div class="grid g4">
  <div class="card stat"><div class="k">আজকের রোগী</div><div class="v">${bn(tv.length)}</div><div class="s">অ্যাপয়েন্টমেন্ট ${bn(ta.length)}টি</div></div>
  <div class="card stat"><div class="k">আজকের আয়</div><div class="v">${tk(tv.reduce((s,v)=>s+(+v.paid||0),0))}</div><div class="s">এই মাসে ${tk(mv.reduce((s,v)=>s+(+v.paid||0),0))}</div></div>
  <div class="card stat"><div class="k">এই মাসের সাক্ষাৎ</div><div class="v">${bn(mv.length)}</div><div class="s">মোট রোগী ${bn(D.patients.length)} জন</div></div>
  <div class="card stat"><div class="k">মোট বাকি</div><div class="v" style="color:${dueTotal?'var(--red)':'var(--navy)'}">${tk(dueTotal)}</div><div class="s">${bn(D.visits.filter(v=>due(v)>0).length)}টি সাক্ষাতে</div></div>
 </div>
 <div class="grid g2 mt">
  <div class="card"><div class="h3">আজকের অ্যাপয়েন্টমেন্ট <a class="btn sm" onclick="go('appts')">সব দেখুন</a></div>
   <div class="list">${ta.length?ta.map(apptRow).join(''):'<div class="empty"><b>আজ কোনো অ্যাপয়েন্টমেন্ট নেই</b>নতুন অ্যাপয়েন্টমেন্ট যোগ করতে ওপরের বাটন চাপুন।</div>'}</div></div>
  <div class="card"><div class="h3">আগামী ৭ দিনে ফলো-আপ</div>
   <div class="list">${followups.length?followups.slice(0,6).map(v=>{const p=pById(v.patientId)||{};return `<div class="row"><div class="av ${p.sex==='মহিলা'?'f':''}">${esc((p.name||'?')[0])}</div><div class="grow"><div class="t">${esc(p.name)}</div><div class="m">${fd(v.nextDate)} · ${esc(svName(v.service))}</div></div><a class="btn sm wa" target="_blank" rel="noopener" href="${waLink(p.mobile,fillTpl(p.name,v.nextDate,''))}">${I.wa}মেসেজ</a></div>`}).join(''):'<div class="empty"><b>কোনো ফলো-আপ নেই</b>সাক্ষাতের সময় “পরবর্তী তারিখ” দিলে এখানে দেখাবে।</div>'}</div></div>
 </div>
 <div class="card mt"><div class="h3">আসন্ন সুন্নাহ দিন (চান্দ্র মাসের ১৭, ১৯, ২১ তারিখ)</div>
  <div class="flex">${up.length?up.map(d=>{const hh=hijri(d);const c=D.appts.filter(a=>a.date===d&&a.status!=='cancel').length;return `<div class="card" style="flex:1;min-width:150px;background:#fffaf0;border-color:#ecd9a0"><div class="t" style="font-weight:700">${fd(d)}</div><div class="m muted" style="font-size:13px">${bn(hh.day)} ${HM[hh.month-1]}</div><div class="mt" style="margin-top:6px"><span class="pill gold">${bn(c)}টি অ্যাপয়েন্টমেন্ট</span></div></div>`}).join(''):'<span class="muted">iHadis-এর হালনাগাদ তারিখ যাচাই না হওয়ায় সুন্নাহ দিনের পূর্বাভাস দেখানো যাচ্ছে না।</span>'}</div>
  <p class="muted" style="font-size:12px;margin:8px 0 0">আজকের হিজরি তারিখ <a href="https://ihadis.com/en/calendar/bangladesh/islamic-date-today" target="_blank" rel="noopener noreferrer">iHadis বাংলাদেশ ক্যালেন্ডার</a> থেকে। ভবিষ্যতের সুন্নাহ দিনগুলো সেই তারিখের ভিত্তিতে আনুমানিক; স্থানীয় চাঁদ দেখার ঘোষণায় বদলাতে পারে।</p></div>`;
}
function apptRow(a){const p=a.patientId?pById(a.patientId):null;const name=p?p.name:a.name;const mob=p?p.mobile:a.mobile;
 const st=a.status==='done'?'<span class="pill green">সম্পন্ন</span>':a.status==='cancel'?'<span class="pill red">বাতিল</span>':'<span class="pill amber">অপেক্ষমাণ</span>';
 return `<div class="row"><div class="av">${a.time?bn(a.time.slice(0,5)):'—'}</div><div class="grow"><div class="t">${esc(name)} ${st}</div><div class="m">${fd(a.date)} · ${esc(svName(a.service))}${a.therapist?' · '+esc(thName(a.therapist)):''}</div></div>
 <div class="flex">${a.status==='pending'?`<button class="btn sm pri" onclick="startFromAppt('${a.id}')">শুরু</button>`:''}<a class="btn sm wa" target="_blank" rel="noopener" href="${waLink(mob,fillTpl(name,a.date,a.time))}">${I.wa}</a><button class="btn sm" onclick="openAppt('${a.id}')">এডিট</button></div></div>`}
function fillTpl(name,date,time){return D.settings.waTpl.replace('{নাম}',name||'').replace('{তারিখ}',fd(date)).replace('{সময়}',time?bn(time)+' টায়':'')}
