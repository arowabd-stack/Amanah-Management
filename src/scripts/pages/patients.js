/* ================= PATIENTS ================= */
function pPatients(m){
 m.innerHTML=`<div class="top"><div><h2>রোগী তালিকা</h2><div class="sub">মোট ${bn(D.patients.length)} জন</div></div>
  <div class="flex" style="flex:1;justify-content:flex-end"><div class="search">${I.search}<input id="q" placeholder="নাম বা মোবাইল দিয়ে খুঁজুন"></div><button class="btn pri" onclick="go('new')">${I.plus}নতুন</button></div></div>
  <div class="card"><div class="tw"><table class="t"><thead><tr><th>নাম</th><th>মোবাইল</th><th>বয়স/লিঙ্গ</th><th>সাক্ষাৎ</th><th>শেষ এসেছেন</th><th>বাকি</th><th></th></tr></thead><tbody id="pl"></tbody></table></div><div id="pe"></div></div>`;
 const draw=()=>{const q=en($('#q').value.trim()).toLowerCase();
  const L=D.patients.filter(p=>!q||p.name.toLowerCase().includes(q)||en(p.mobile).includes(q)).map(p=>{const vs=visitsOf(p.id);return{p,vs,last:vs[0]?.date||'',due:vs.reduce((s,v)=>s+due(v),0)}}).sort((a,b)=>b.last.localeCompare(a.last));
  $('#pl').innerHTML=L.map(({p,vs,last,due:d})=>`<tr style="cursor:pointer" onclick="go('patient','${p.id}')"><td><b>${esc(p.name)}</b></td><td>${esc(bn(p.mobile))}</td><td>${bn(p.age)} · ${esc(p.sex)}</td><td class="num">${bn(vs.length)}</td><td>${fd(last)}</td><td>${d?'<span class="pill red">'+tk(d)+'</span>':'—'}</td><td><a class="btn sm wa" target="_blank" rel="noopener" onclick="event.stopPropagation()" href="${waLink(p.mobile,'আসসালামু আলাইকুম '+p.name+', আমানাহ সেন্টার থেকে বলছি।')}">${I.wa}</a></td></tr>`).join('');
  $('#pe').innerHTML=L.length?'':'<div class="empty"><b>'+(D.patients.length?'কাউকে পাওয়া যায়নি':'এখনো কোনো রোগী নেই')+'</b>“নতুন সাক্ষাৎ” দিয়ে প্রথম রোগী যোগ করুন।</div>'};
 $('#q').oninput=draw;draw();
}
function pPatient(m){
 const p=pById(param);if(!p)return go('patients');
 const vs=visitsOf(p.id),paid=vs.reduce((s,v)=>s+(+v.paid||0),0),d=vs.reduce((s,v)=>s+due(v),0);
 const apps=D.appts.filter(a=>a.patientId===p.id&&a.date>=today()&&a.status==='pending');
 const bp=vs.slice().reverse().map(v=>{const x=en(v.vitals?.bp||'').split('/');return{d:v.date,s:+x[0]||null,dia:+x[1]||null,r:parseFloat(en(v.vitals?.rbs))||null}});
 m.innerHTML=`<div class="top"><div class="flex"><button class="btn sm" onclick="go('patients')">← তালিকা</button><div><h2>${esc(p.name)}</h2><div class="sub">${bn(p.age)} বছর · ${esc(p.sex)} · ${esc(bn(p.mobile))} · ${esc(p.address)}</div></div></div>
  <div class="flex"><a class="btn" href="${telLink(p.mobile)}">${I.phone}কল</a><a class="btn wa" target="_blank" rel="noopener" href="${waLink(p.mobile,'আসসালামু আলাইকুম '+p.name+', আমানাহ সেন্টার থেকে বলছি।')}">${I.wa}WhatsApp</a><button class="btn" onclick="editPatient('${p.id}')">এডিট</button><button class="btn" onclick="openAppt(null,'${p.id}')">${I.cal}অ্যাপয়েন্টমেন্ট</button><button class="btn pri" onclick="go('new',{pid:'${p.id}'})">${I.plus}নতুন সাক্ষাৎ</button></div></div>
  <div class="grid g4"><div class="card stat"><div class="k">মোট সাক্ষাৎ</div><div class="v">${bn(vs.length)}</div></div><div class="card stat"><div class="k">মোট পরিশোধ</div><div class="v">${tk(paid)}</div></div><div class="card stat"><div class="k">বাকি</div><div class="v" style="color:${d?'var(--red)':'var(--navy)'}">${tk(d)}</div></div><div class="card stat"><div class="k">পরবর্তী তারিখ</div><div class="v" style="font-size:19px">${apps[0]?fd(apps[0].date):(vs[0]?.nextDate?fd(vs[0].nextDate):'—')}</div></div></div>
  ${bp.filter(x=>x.s||x.r).length>1?`<div class="card mt"><div class="h3">BP ও সুগারের পরিবর্তন</div>${chart(bp)}</div>`:''}
  <div class="card mt"><div class="h3">সাক্ষাতের ইতিহাস</div>${vs.length?`<div class="tw"><table class="t"><thead><tr><th>ক্রমিক</th><th>তারিখ</th><th>সেবা</th><th>পয়েন্ট</th><th>কাপ</th><th>BP</th><th>সুগার</th><th>থেরাপিস্ট</th><th>ফি / বাকি</th><th></th></tr></thead><tbody>
  ${vs.map(v=>`<tr><td>${bn(v.serial)}</td><td>${fds(v.date)}</td><td>${esc(svName(v.service))}</td><td>${esc(v.points)}</td><td class="num">${bn(v.cups)}</td><td>${esc(bn(v.vitals?.bp))}</td><td>${esc(bn(v.vitals?.rbs))}</td><td>${esc(thName(v.therapist))}</td><td>${tk(v.fee)}${due(v)?' <span class="pill red">'+tk(due(v))+'</span>':''}</td>
  <td><div class="flex"><button class="btn sm" onclick="printVisit('${v.id}')">${I.print}</button>${due(v)?`<button class="btn sm" onclick="payDue('${v.id}')">টাকা নিন</button>`:''}<button class="btn sm danger" onclick="delVisit('${v.id}')">মুছুন</button></div></td></tr>`).join('')}</tbody></table></div>`:'<div class="empty"><b>এখনো কোনো সাক্ষাৎ নেই</b></div>'}</div>`;
}
function chart(pts){const W=600,H=130,P=26;const xs=i=>P+i*(W-2*P)/Math.max(1,pts.length-1);
 const vals=pts.flatMap(p=>[p.s,p.dia]).filter(Boolean);const mx=Math.max(160,...vals),mn=Math.min(60,...vals);const ys=v=>H-P-(v-mn)/(mx-mn)*(H-2*P);
 const line=(k,c)=>{const q=pts.map((p,i)=>p[k]?[xs(i),ys(p[k])]:null).filter(Boolean);return q.length?`<polyline fill="none" stroke="${c}" stroke-width="2.5" points="${q.map(a=>a.join(',')).join(' ')}"/>`+q.map(a=>`<circle cx="${a[0]}" cy="${a[1]}" r="3.5" fill="${c}"/>`).join(''):''};
 return `<svg class="spark" viewBox="0 0 ${W} ${H}"><line x1="${P}" x2="${W-P}" y1="${ys(120)}" y2="${ys(120)}" stroke="#dfe6ec" stroke-dasharray="4"/><text x="${W-P}" y="${ys(120)-4}" font-size="11" fill="#5f6f7c" text-anchor="end">১২০</text>${line('s','#b42335')}${line('dia','#1d6fa5')}
 ${pts.map((p,i)=>`<text x="${xs(i)}" y="${H-6}" font-size="10.5" fill="#5f6f7c" text-anchor="middle">${fds(p.d).slice(0,5)}</text>`).join('')}</svg>
 <div class="flex" style="font-size:12.5px"><span class="pill red">উপরের BP</span><span class="pill">নিচের BP</span><span class="muted">সুগার: ${pts.filter(p=>p.r).map(p=>bn(p.r)).join(' → ')||'—'}</span></div>`}
function editPatient(id){const p=pById(id);modal(`<h3>রোগীর তথ্য এডিট</h3><div class="fg">
 <div class="full"><label>নাম</label><input id="ep_name" value="${esc(p.name)}"></div><div><label>বয়স</label><input id="ep_age" value="${esc(p.age)}"></div>
 <div><label>লিঙ্গ</label><select id="ep_sex"><option${p.sex==='পুরুষ'?' selected':''}>পুরুষ</option><option${p.sex==='মহিলা'?' selected':''}>মহিলা</option></select></div>
 <div><label>মোবাইল</label><input id="ep_mob" value="${esc(p.mobile)}"></div><div><label>ঠিকানা</label><input id="ep_addr" value="${esc(p.address)}"></div></div>
 <div class="flex mt" style="justify-content:space-between"><button class="btn danger" onclick="delPatient('${id}')">রোগী মুছুন</button><div class="flex"><button class="btn" onclick="closeModal()">বাতিল</button><button class="btn pri" id="ep_ok">সেভ</button></div></div>`);
 $('#ep_ok').onclick=()=>{Object.assign(p,{name:$('#ep_name').value.trim(),age:$('#ep_age').value.trim(),sex:$('#ep_sex').value,mobile:$('#ep_mob').value.trim(),address:$('#ep_addr').value.trim()});save();closeModal();toast('সেভ হয়েছে');render()}}
function delPatient(id){confirmBox('এই রোগী আর তার সব সাক্ষাৎ মুছে যাবে। নিশ্চিত?',()=>{D.patients=D.patients.filter(p=>p.id!==id);D.visits=D.visits.filter(v=>v.patientId!==id);save();closeModal();go('patients');toast('মুছে ফেলা হয়েছে')})}
function delVisit(id){confirmBox('এই সাক্ষাৎটি মুছে যাবে। নিশ্চিত?',()=>{D.visits=D.visits.filter(v=>v.id!==id);save();closeModal();render();toast('মুছে ফেলা হয়েছে')})}
function payDue(id){const v=D.visits.find(x=>x.id===id);modal(`<h3>বাকি টাকা নিন</h3><p>বাকি: <b>${tk(due(v))}</b></p><label>কত টাকা নিলেন</label><input id="pd_amt" inputmode="numeric" value="${due(v)}"><div class="flex mt" style="justify-content:flex-end"><button class="btn" onclick="closeModal()">বাতিল</button><button class="btn pri" id="pd_ok">জমা করুন</button></div>`);
 $('#pd_ok').onclick=()=>{const a=+en($('#pd_amt').value)||0;v.paid=(+v.paid||0)+a;(v.payments=v.payments||[]).push({date:today(),amt:a});save();closeModal();render();toast(tk(a)+' জমা হয়েছে')}}
