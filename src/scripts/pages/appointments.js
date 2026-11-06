/* ================= APPOINTMENTS ================= */
let calM=today().slice(0,7),calSel=today();
function pAppts(m){
 const [y,mo]=calM.split('-').map(Number);const first=new Date(y,mo-1,1);const start=new Date(first);start.setDate(1-((first.getDay()+1)%7)); // শনিবার শুরু
 const days=[];for(let i=0;i<42;i++){const d=new Date(start);d.setDate(start.getDate()+i);d.setMinutes(d.getMinutes()-d.getTimezoneOffset());days.push(d.toISOString().slice(0,10))}
 const t=today();const sel=D.appts.filter(a=>a.date===calSel).sort((a,b)=>(a.time||'').localeCompare(b.time||''));const hs=hijri(calSel);
 m.innerHTML=`<div class="top"><div><h2>অ্যাপয়েন্টমেন্ট</h2><div class="sub">সোনালি ঘর = সুন্নাহ দিন (চান্দ্র ১৭, ১৯, ২১); সেটিংসের সমন্বয় অনুযায়ী।</div></div><button class="btn pri" onclick="openAppt(null,null,calSel)">${I.plus}নতুন অ্যাপয়েন্টমেন্ট</button></div>
 <div class="grid" style="grid-template-columns:minmax(0,1.6fr) minmax(0,1fr)" id="apg">
 <div class="card"><div class="h3"><button class="btn sm" id="cp">‹</button><span>${MON[mo-1]} ${bn(y)}</span><button class="btn sm" id="cn">›</button></div>
  <div class="cal">${['শনি','রবি','সোম','মঙ্গল','বুধ','বৃহঃ','শুক্র'].map(d=>`<div class="wd">${d}</div>`).join('')}
  ${days.map(d=>{const h=hijri(d);const sn=h&&[17,19,21].includes(h.day);const c=D.appts.filter(a=>a.date===d&&a.status!=='cancel').length;
   return `<div class="d ${d.slice(0,7)!==calM?'o':''} ${d===t?'today':''} ${d===calSel?'sel':''} ${sn?'sun':''}" data-d="${d}"><div class="dn"><span>${bn(+d.slice(8))}</span><span class="hj">${h?bn(h.day):''}</span></div>${sn?'<span class="sn">সুন্নাহ</span>':''}${c?`<span class="cnt">${bn(c)}</span>`:''}</div>`}).join('')}</div></div>
 <div class="card"><div class="h3">${fd(calSel)}</div><div class="muted" style="font-size:13px;margin:-6px 0 8px">${hs?bn(hs.day)+' '+HM[hs.month-1]:''}${isSunnah(calSel)?' · <span class="pill gold">সুন্নাহ দিন</span>':''}</div>
  <div class="list">${sel.length?sel.map(apptRow).join(''):'<div class="empty"><b>এই দিনে কোনো অ্যাপয়েন্টমেন্ট নেই</b><button class="btn sm pri mt" onclick="openAppt(null,null,calSel)">যোগ করুন</button></div>'}</div></div></div>`;
 if(innerWidth<860)$('#apg').style.gridTemplateColumns='1fr';
 $('#cp').onclick=()=>{const d=new Date(y,mo-2,1);calM=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');render()};
 $('#cn').onclick=()=>{const d=new Date(y,mo,1);calM=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');render()};
 m.querySelectorAll('.cal .d').forEach(x=>x.onclick=()=>{calSel=x.dataset.d;if(calSel.slice(0,7)!==calM)calM=calSel.slice(0,7);render()});
}
function openAppt(id,pid,date){
 const a=id?D.appts.find(x=>x.id===id):{id:null,patientId:pid||null,name:'',mobile:'',date:date||today(),time:'',service:D.settings.services[0]?.id,therapist:'',note:'',status:'pending'};
 const p=a.patientId?pById(a.patientId):null;
 modal(`<h3>${id?'অ্যাপয়েন্টমেন্ট এডিট':'নতুন অ্যাপয়েন্টমেন্ট'}</h3><div class="fg">
 ${p?`<div class="full"><label>রোগী</label><div class="row" style="padding:4px 0"><b>${esc(p.name)}</b><span class="muted">${esc(bn(p.mobile))}</span></div></div>`:`
 <div><label for="ap_mob">মোবাইল</label><input id="ap_mob" value="${esc(a.mobile)}"></div><div><label for="ap_name">নাম</label><input id="ap_name" value="${esc(a.name)}"></div><div class="full" id="ap_found"></div>`}
 <div><label for="ap_date">তারিখ</label><input type="date" id="ap_date" value="${a.date}"></div><div><label for="ap_time">সময়</label><input type="time" id="ap_time" value="${a.time||''}"></div>
 <div><label for="ap_sv">সেবা</label><select id="ap_sv">${D.settings.services.map(s=>`<option value="${s.id}" ${s.id===a.service?'selected':''}>${esc(s.name)}</option>`).join('')}</select></div>
 <div><label for="ap_th">থেরাপিস্ট</label><select id="ap_th"><option value="">পরে ঠিক হবে</option>${D.settings.therapists.map(t=>`<option value="${t.id}" ${t.id===a.therapist?'selected':''}>${esc(t.name)} (${t.gender})</option>`).join('')}</select></div>
 <div class="full"><label for="ap_note">নোট</label><input id="ap_note" value="${esc(a.note)}"></div>
 ${id?`<div class="full"><label>অবস্থা</label><div class="seg" id="ap_st"><button data-v="pending">অপেক্ষমাণ</button><button data-v="done">সম্পন্ন</button><button data-v="cancel">বাতিল</button></div></div>`:''}</div>
 <div id="ap_sun" class="muted" style="font-size:13px;margin-top:8px"></div>
 <div class="flex mt" style="justify-content:space-between">${id?`<button class="btn danger" id="ap_del">মুছুন</button>`:'<span></span>'}<div class="flex"><button class="btn" onclick="closeModal()">বাতিল</button><button class="btn pri" id="ap_ok">সেভ</button></div></div>`);
 const st={status:a.status};if(id)seg('ap_st',st,'status');
 const sun=()=>{const d=$('#ap_date').value;const h=hijri(d);$('#ap_sun').innerHTML=h?`চান্দ্র তারিখ: ${bn(h.day)} ${HM[h.month-1]}${isSunnah(d)?' · <span class="pill gold">সুন্নাহ দিন</span>':''}`:''};$('#ap_date').oninput=sun;sun();
 let linked=a.patientId;
 if(!p){const f=()=>{const m=en($('#ap_mob').value).replace(/\D/g,'');const x=m.length>=6?D.patients.find(q=>en(q.mobile).replace(/\D/g,'')===m):null;linked=x?x.id:null;$('#ap_found').innerHTML=x?`<div class="found">পুরনো রোগী: <b>${esc(x.name)}</b></div>`:'';if(x&&!$('#ap_name').value)$('#ap_name').value=x.name};$('#ap_mob').oninput=f;f()}
 $('#ap_ok').onclick=()=>{const o=Object.assign(a,{patientId:linked,name:p?'':$('#ap_name').value.trim(),mobile:p?'':$('#ap_mob').value.trim(),date:$('#ap_date').value,time:$('#ap_time').value,service:$('#ap_sv').value,therapist:$('#ap_th').value,note:$('#ap_note').value,status:st.status});
  if(!o.patientId&&!o.name){toast('নাম লিখুন');return}if(!o.date){toast('তারিখ দিন');return}
  if(!o.id){o.id=uid();D.appts.push(o)}save();closeModal();toast('সেভ হয়েছে');calSel=o.date;calM=o.date.slice(0,7);render()};
 if(id)$('#ap_del').onclick=()=>{D.appts=D.appts.filter(x=>x.id!==id);save();closeModal();render();toast('মুছে ফেলা হয়েছে')};
}
function startFromAppt(id){W=null;go('new',{appt:id})}
