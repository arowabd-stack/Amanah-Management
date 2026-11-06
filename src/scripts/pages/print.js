/* ================= PRINT ================= */
function formHTML(v,copy){
 const p=pById(v.patientId)||{};const S=D.settings;const V=v.vitals||{};
 const vit=[['BP (রক্তচাপ)',V.bp],['Pulse (হৃৎস্পন্দন)',V.pulse],['RBS (ব্লাড সুগার)',V.rbs],['ওজন',V.weight],['তাপমাত্রা',V.temp],['SpO₂ (রক্তে অক্সিজেন)',V.spo2],['Hb (যদি জানা থাকে)',V.hb]];
 return `<div class="pf"><span class="copy">${copy}</span>
 <div class="hd"><span class="nm">${esc(S.center)}</span><div class="ad">${esc(S.address)}<br>যোগাযোগ: ${esc(S.phone)} (Call / WhatsApp)</div></div>
 <div class="tt"><b>হিজামার আগে রোগীর সম্মতিপত্র</b><small>${v.serial?'ক্রমিক নং: '+bn(v.serial)+' · সেবা: '+esc(svName(v.service)):'হিজামা শুরুর আগে রোগী নিজে পূরণ করবেন'}</small></div>
 <div class="info">
  <div class="f" style="grid-column:span 3"><span>রোগীর নাম:</span><i>${esc(p.name)}</i></div><div class="f"><span>বয়স:</span><i>${bn(p.age)}</i></div>
  <div class="f" style="grid-column:span 2;align-items:center"><span>লিঙ্গ:</span><span class="sx"><span class="bx ${p.sex==='পুরুষ'?'x':''}">${p.sex==='পুরুষ'?'✓':''}</span>পুরুষ<span class="bx ${p.sex==='মহিলা'?'x':''}">${p.sex==='মহিলা'?'✓':''}</span>মহিলা</span></div>
  <div class="f" style="grid-column:span 2"><span>মোবাইল:</span><i>${esc(bn(p.mobile))}</i></div><div class="f" style="grid-column:span 2"><span>ঠিকানা:</span><i>${esc(p.address)}</i></div><div class="f" style="grid-column:span 2"><span>তারিখ:</span><i>${fds(v.date)}</i></div></div>
 <div class="body"><div class="sidep"><h4>পরীক্ষা (থেরাপিস্ট)</h4>${vit.map(([l,x])=>`<div class="vt"><span>${l}</span><i>${esc(bn(x))}</i></div>`).join('')}
  <h4 style="margin-top:3mm">কাপের সংখ্যা</h4><div class="vt"><i>${bn(v.cups)}</i></div><h4>থেরাপিস্ট</h4><div class="vt"><i>${esc(thName(v.therapist))}</i></div></div>
 <div class="mainp"><h4>নিজে যাচাই করুন — প্রতিটি প্রশ্নে টিক দিন</h4><table>${QS.map((q,i)=>`<tr class="${v.ans[i]==='Y'?'yes':''}"><td class="n">${bn(i+1)}</td><td>${q}</td><td class="ynp"><span class="bx ${v.ans[i]==='Y'?'x':''}">${v.ans[i]==='Y'?'✓':''}</span>হ্যাঁ<span class="bx ${v.ans[i]==='N'?'x':''}">${v.ans[i]==='N'?'✓':''}</span>না</td></tr>`).join('')}</table>
  <div class="f" style="margin-top:2mm"><span>বর্তমানে যেসব ওষুধ খাচ্ছেন:</span><i>${esc(v.meds)}</i></div>
  <h4 style="margin-top:2.5mm">হিজামার পয়েন্ট</h4><div class="pt">${esc(v.points)}</div>
  <h4 style="margin-top:2mm">থেরাপিস্টের পরামর্শ</h4><div class="adv">${esc(v.advice)}</div>
  <div class="f" style="margin-top:1.5mm"><span>পরবর্তী তারিখ:</span><i>${fds(v.nextDate)}</i></div>
  <div class="decl"><b>সম্মতি:</b> ${DECL}</div></div></div>
 <div class="sig"><div>রোগীর স্বাক্ষর ও তারিখ</div><div>অভিভাবকের নাম ও স্বাক্ষর</div><div>থেরাপিস্টের নাম, স্বাক্ষর ও তারিখ</div></div>
 <div class="meta"><span>${esc(S.center)} · ${esc(S.phone)}</span><span>ক্রমিক ${bn(v.serial)}</span></div></div>`}
function printBlank(){D.patients.push({id:'__b',name:'',age:'',sex:'',mobile:'',address:''});const v={serial:'',patientId:'__b',date:'',vitals:{},ans:Array(15).fill(null),meds:'',service:'',points:'',cups:'',therapist:'',advice:D.settings.defAdvice??'১–৩ দিন বিশ্রাম নিন, ভারী কাজ ও ব্যায়াম করবেন না। জায়গাটি পরিষ্কার ও শুকনো রাখুন, চুলকাবেন না। কুসুম গরম পানিতে গোসল করুন, প্রচুর পানি ও পুষ্টিকর খাবার খান।',nextDate:''};
 $('#printArea').innerHTML=formHTML(v,'ফাঁকা ফর্ম');D.patients=D.patients.filter(p=>p.id!=='__b');setTimeout(()=>window.print(),150)}
function printVisit(id){const v=D.visits.find(x=>x.id===id);if(!v)return;$('#printArea').innerHTML=formHTML(v,'রোগীর কপি')+formHTML(v,'সেন্টারের কপি');setTimeout(()=>window.print(),150)}
