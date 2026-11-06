/* ================= SETTINGS ================= */
function pSettings(m){
 const S=D.settings;
 m.innerHTML=`<div class="top"><div><h2>সেটিংস</h2><div class="sub">থেরাপিস্ট, সেবা ও ফি, মেসেজ, পাসওয়ার্ড, ব্যাকআপ</div></div></div>
 <div class="grid g2">
 <div class="card"><div class="h3">থেরাপিস্ট <button class="btn sm" id="addT">${I.plus}যোগ</button></div><div id="tl"></div></div>
 <div class="card"><div class="h3">সেবা ও ফি <button class="btn sm" id="addS">${I.plus}যোগ</button></div><div id="sl"></div></div>
 <div class="card"><div class="h3">থেরাপিস্টের সাধারণ পরামর্শ</div><textarea id="adv_t" style="min-height:110px"></textarea><p class="muted" style="font-size:12.5px">প্রতিটি নতুন সাক্ষাতে এই লেখা আগে থেকে বসে থাকবে।</p><button class="btn pri sm" id="adv_s">সেভ</button></div>
 <div class="card"><div class="h3">WhatsApp রিমাইন্ডার মেসেজ</div><textarea id="wa_t" style="min-height:110px"></textarea><p class="muted" style="font-size:12.5px">{নাম}, {তারিখ}, {সময়} নিজে থেকে বসবে।</p><button class="btn pri sm" id="wa_s">সেভ</button></div>
 <div class="card"><div class="h3">সেন্টারের তথ্য (প্রিন্টে যাবে)</div><div class="fg"><div class="full"><label>নাম</label><input id="c_n"></div><div class="full"><label>ঠিকানা</label><input id="c_a"></div><div class="full"><label>ফোন</label><input id="c_p"></div></div><button class="btn pri sm mt" id="c_s">সেভ</button></div>
 <div class="card"><div class="h3">হিজরি তারিখ সমন্বয়</div>
  <div class="flex" style="align-items:center;gap:10px;flex-wrap:wrap;margin:12px 0">
   <button type="button" class="btn" id="hijri_minus" aria-label="হিজরি তারিখ এক দিন কমান">−১</button>
   <strong id="hijri_offset_value" aria-live="polite" style="min-width:110px;text-align:center">০ দিন</strong>
   <button type="button" class="btn" id="hijri_plus" aria-label="হিজরি তারিখ এক দিন বাড়ান">+১</button>
   <button type="button" class="btn sm" id="hijri_reset">রিসেট</button>
  </div>
  <div id="hijri_date_preview" class="muted" style="font-size:14px"></div>
  <p class="muted" style="font-size:12.5px">আগের চান্দ্র তারিখের হিসাব অনুযায়ী। প্রয়োজন হলে সর্বোচ্চ ২ দিন আগে বা পরে নিতে পারবেন। পরিবর্তন নিজে থেকে সেভ হবে।</p></div>
 <div class="card"><div class="h3">লগইন</div><div class="fg"><div><label>ইউজার নাম</label><input id="u_n"></div><div><label>নতুন পাসওয়ার্ড</label><input id="u_p" type="password"></div></div><button class="btn pri sm mt" id="u_s">পাসওয়ার্ড বদলান</button></div>
 <div class="card"><div class="h3">ডেটা ব্যাকআপ</div><p class="muted" style="font-size:13.5px;margin-top:0">সপ্তাহে অন্তত একবার Excel বা ব্যাকআপ ফাইল ডাউনলোড করে রাখুন।</p>
  <div class="flex"><button class="btn pri" id="x_xl">Excel ডাউনলোড</button><button class="btn" id="x_js">ব্যাকআপ ফাইল</button><label class="btn" style="margin:0;color:var(--ink);font-size:15px">ব্যাকআপ থেকে ফেরত<input type="file" id="x_in" accept=".json" hidden></label></div></div>
 </div>`;
 const tl=()=>{$('#tl').innerHTML=S.therapists.map((t,i)=>`<div class="row"><input value="${esc(t.name)}" data-i="${i}" class="tn" style="flex:1"><select data-i="${i}" class="tg" style="width:110px"><option${t.gender==='পুরুষ'?' selected':''}>পুরুষ</option><option${t.gender==='মহিলা'?' selected':''}>মহিলা</option></select><button class="btn sm danger" data-i="${i}">✕</button></div>`).join('');
  $('#tl').querySelectorAll('.tn').forEach(x=>x.onchange=()=>{S.therapists[x.dataset.i].name=x.value;save();toast('সেভ হয়েছে')});
  $('#tl').querySelectorAll('.tg').forEach(x=>x.onchange=()=>{S.therapists[x.dataset.i].gender=x.value;save();toast('সেভ হয়েছে')});
  $('#tl').querySelectorAll('button').forEach(x=>x.onclick=()=>{S.therapists.splice(+x.dataset.i,1);save();tl()})};
 const sl=()=>{$('#sl').innerHTML=S.services.map((s,i)=>`<div class="row"><input value="${esc(s.name)}" data-i="${i}" class="sn" style="flex:1"><input value="${s.fee}" data-i="${i}" class="sf" style="width:90px" inputmode="numeric"><button class="btn sm danger" data-i="${i}">✕</button></div>`).join('');
  $('#sl').querySelectorAll('.sn').forEach(x=>x.onchange=()=>{S.services[x.dataset.i].name=x.value;save();toast('সেভ হয়েছে')});
  $('#sl').querySelectorAll('.sf').forEach(x=>x.onchange=()=>{S.services[x.dataset.i].fee=+en(x.value)||0;save();toast('সেভ হয়েছে')});
  $('#sl').querySelectorAll('button').forEach(x=>x.onclick=()=>{S.services.splice(+x.dataset.i,1);save();sl()})};
 tl();sl();
 const currentHijriOffset=()=>{
  const n=Number(S.hijriOffset??0);
  return Number.isInteger(n)&&n>=-2&&n<=2?n:0;
 };
 const showHijriOffset=()=>{
  const n=currentHijriOffset();
  $('#hijri_offset_value').textContent=(n>0?'+':n<0?'−':'')+bn(Math.abs(n))+' দিন';
  $('#hijri_minus').disabled=n<=-2;
  $('#hijri_plus').disabled=n>=2;
  $('#hijri_reset').disabled=n===0;
  const h=hijri(today());
  $('#hijri_date_preview').textContent='আজ: '+(h?bn(h.day)+' '+HM[h.month-1]:'তারিখ পাওয়া যাচ্ছে না');
 };
 const setHijriOffset=next=>{
  const n=Math.max(-2,Math.min(2,Math.trunc(next)));
  S.hijriOffset=n;
  save();
  showHijriOffset();
  toast('হিজরি তারিখ সমন্বয় সেভ হয়েছে');
 };
 $('#hijri_minus').onclick=()=>setHijriOffset(currentHijriOffset()-1);
 $('#hijri_plus').onclick=()=>setHijriOffset(currentHijriOffset()+1);
 $('#hijri_reset').onclick=()=>setHijriOffset(0);
 showHijriOffset();
 $('#addT').onclick=()=>{S.therapists.push({id:uid(),name:'নতুন থেরাপিস্ট',gender:'পুরুষ'});save();tl()};
 $('#addS').onclick=()=>{S.services.push({id:uid(),name:'নতুন সেবা',fee:0});save();sl()};
 $('#adv_t').value=S.defAdvice??'১–৩ দিন বিশ্রাম নিন, ভারী কাজ ও ব্যায়াম করবেন না। জায়গাটি পরিষ্কার ও শুকনো রাখুন, চুলকাবেন না। কুসুম গরম পানিতে গোসল করুন, প্রচুর পানি ও পুষ্টিকর খাবার খান।';$('#adv_s').onclick=()=>{S.defAdvice=$('#adv_t').value;save();toast('সেভ হয়েছে')};
 $('#wa_t').value=S.waTpl;$('#wa_s').onclick=()=>{S.waTpl=$('#wa_t').value;save();toast('সেভ হয়েছে')};
 $('#c_n').value=S.center;$('#c_a').value=S.address;$('#c_p').value=S.phone;$('#c_s').onclick=()=>{S.center=$('#c_n').value;S.address=$('#c_a').value;S.phone=$('#c_p').value;save();toast('সেভ হয়েছে')};
 $('#u_n').value=S.user;$('#u_s').onclick=async()=>{const p=$('#u_p').value;if(p.length<4){toast('কমপক্ষে ৪ অক্ষরের পাসওয়ার্ড দিন');return}S.user=$('#u_n').value.trim()||'admin';S.passHash=await hash(p);save();$('#u_p').value='';toast('পাসওয়ার্ড বদলানো হয়েছে')};
 $('#x_xl').onclick=exportXL;$('#x_js').onclick=()=>dl(new Blob([JSON.stringify(D,null,1)],{type:'application/json'}),'amanah-backup-'+today()+'.json');
 $('#x_in').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const d=JSON.parse(r.result);if(!d.patients||!d.visits)throw 0;confirmBox('বর্তমান সব ডেটার জায়গায় ব্যাকআপের ডেটা বসবে। নিশ্চিত?',()=>{D=d;save();closeModal();toast('ব্যাকআপ ফেরত আনা হয়েছে');render()})}catch(x){toast('ফাইলটি সঠিক ব্যাকআপ নয়')}};r.readAsText(f)};
}
function dl(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500)}
function exportXL(){
 const rows=D.visits.slice().sort((a,b)=>a.serial-b.serial).map(v=>{const p=pById(v.patientId)||{};const o={'ক্রমিক':v.serial,'তারিখ':v.date,'রোগীর নাম':p.name,'বয়স':p.age,'লিঙ্গ':p.sex,'মোবাইল':p.mobile,'ঠিকানা':p.address,'BP':v.vitals?.bp,'Pulse':v.vitals?.pulse,'RBS':v.vitals?.rbs,'ওজন':v.vitals?.weight,'তাপমাত্রা':v.vitals?.temp,'SpO2':v.vitals?.spo2,'Hb':v.vitals?.hb};
  QS.forEach((q,i)=>o['প্র '+(i+1)]=v.ans[i]==='Y'?'হ্যাঁ':v.ans[i]==='N'?'না':'');
  Object.assign(o,{'ওষুধ':v.meds,'সেবা':svName(v.service),'হিজামার পয়েন্ট':v.points,'কাপ':v.cups,'থেরাপিস্ট':thName(v.therapist),'পরামর্শ':v.advice,'পরবর্তী তারিখ':v.nextDate,'ফি':v.fee,'আদায়':v.paid,'বাকি':due(v)});return o});
 const pts=D.patients.map(p=>({'নাম':p.name,'বয়স':p.age,'লিঙ্গ':p.sex,'মোবাইল':p.mobile,'ঠিকানা':p.address,'মোট সাক্ষাৎ':visitsOf(p.id).length}));
 const aps=D.appts.map(a=>{const p=a.patientId?pById(a.patientId):null;return{'তারিখ':a.date,'সময়':a.time,'নাম':p?p.name:a.name,'মোবাইল':p?p.mobile:a.mobile,'সেবা':svName(a.service),'থেরাপিস্ট':thName(a.therapist),'অবস্থা':{pending:'অপেক্ষমাণ',done:'সম্পন্ন',cancel:'বাতিল'}[a.status],'নোট':a.note}});
 if(window.XLSX){const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(rows),'সাক্ষাৎ');XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(pts),'রোগী');XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(aps),'অ্যাপয়েন্টমেন্ট');XLSX.writeFile(wb,'amanah-data-'+today()+'.xlsx')}
 else{const keys=Object.keys(rows[0]||{'ক্রমিক':''});const csv='﻿'+[keys.join(',')].concat(rows.map(r=>keys.map(k=>'"'+String(r[k]??'').replace(/"/g,'""')+'"').join(','))).join('\n');dl(new Blob([csv],{type:'text/csv'}),'amanah-data-'+today()+'.csv')}
 toast('ডাউনলোড হচ্ছে');
}
