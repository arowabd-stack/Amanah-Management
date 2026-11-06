/* ================= NEW VISIT WIZARD ================= */
let W=null;
const STEPS=['রোগী','পরীক্ষা','প্রশ্ন','চিকিৎসা','পেমেন্ট','যাচাই'];
function blankVisit(){return{step:0,pid:null,np:{name:'',age:'',sex:'',mobile:'',address:''},date:today(),vitals:{bp:'',pulse:'',rbs:'',weight:'',temp:'',spo2:'',hb:''},ans:Array(15).fill(null),meds:'',service:D.settings.services[0]?.id||'',points:'',cups:'',therapist:'',advice:D.settings.defAdvice??'১–৩ দিন বিশ্রাম নিন, ভারী কাজ ও ব্যায়াম করবেন না। জায়গাটি পরিষ্কার ও শুকনো রাখুন, চুলকাবেন না। কুসুম গরম পানিতে গোসল করুন, প্রচুর পানি ও পুষ্টিকর খাবার খান।',nextDate:'',fee:D.settings.services[0]?.fee||0,paid:'',apptId:null}}
function pNew(m){
 if(!W||(param&&param.fresh!==false&&!W._keep)){W=blankVisit();if(param?.pid){W.pid=param.pid}if(param?.appt){const a=D.appts.find(x=>x.id===param.appt);if(a){W.apptId=a.id;W.pid=a.patientId;if(!a.patientId){W.np.name=a.name;W.np.mobile=a.mobile}W.service=a.service||W.service;W.therapist=a.therapist||'';W.fee=(D.settings.services.find(s=>s.id===W.service)||{}).fee||0}}W._keep=true;param=null}
 const s=W.step;
 const gaps=W._showGaps?wizardGaps():[];
 m.innerHTML=`<div class="top"><div><h2>নতুন সাক্ষাৎ</h2><div class="sub">ধাপ ${bn(s+1)} / ${bn(STEPS.length)} · ${STEPS[s]}</div></div><button class="btn" onclick="cancelWizard()">বাতিল</button></div>
 <div class="steps" id="wizardSteps" aria-label="সাক্ষাতের ধাপ">${STEPS.map((t,i)=>`<button type="button" data-step="${i}" class="${i===s?'on':i<s?'done':''} ${gaps.includes(i)?'needs-attention':''}" aria-current="${i===s?'step':'false'}" onclick="wizardGo(${i})"><i>${gaps.includes(i)?'!':i<s?'✓':bn(i+1)}</i>${t}</button>`).join('')}</div>
 <div class="card" id="wbody"></div>
 <div class="wfoot"><button class="btn" ${s?'':'style="visibility:hidden"'} onclick="W.step--;render()">← আগের ধাপ</button><button class="btn pri" id="wnext">${s===STEPS.length-1?(W._allowBlank?'ফাঁকা রেখেই সম্পন্ন ও প্রিন্ট':'✓ সম্পন্ন ও প্রিন্ট'):'পরের ধাপ →'}</button></div>`;
 const b=$('#wbody');[st1,st2,st3,st4,st5,st6][s](b);
 $('#wnext').onclick=()=>{if(s<STEPS.length-1)wizardGo(s+1);else submitWizard()};
 if(s===0&&W._error)b.insertAdjacentHTML('afterbegin','<div class="alert wizard-required-alert" role="alert">'+esc(W._error)+'</div>');
 b.addEventListener('input',()=>{if(W._error){W._error='';b.querySelector('.wizard-required-alert')?.remove()}refreshWizardWarnings()});
 b.addEventListener('click',refreshWizardWarnings);
}
function wizardGo(step){if(!W)return;W.step=Math.max(0,Math.min(STEPS.length-1,Number(step)||0));render()}
function wizardPatient(){return W.pid?pById(W.pid):W.np}
function wizardRequiredIssue(){
 const p=wizardPatient();
 if(!p||!String(p.name||'').trim())return 'রোগীর নাম লিখুন';
 const mobile=en(String(p.mobile||'').trim());
 if(!mobile)return 'মোবাইল নম্বর লিখুন';
 if(!/^[0-9]{10,11}$/.test(mobile))return 'মোবাইল নম্বর ১০ বা ১১টি ইংরেজি সংখ্যা (0–9) দিয়ে লিখুন';
 return '';
}
function wizardGaps(){
 const gaps=[];
 if(wizardRequiredIssue())gaps.push(0);
 if(!Object.values(W.vitals).some(v=>String(v??'').trim()))gaps.push(1);
 if(W.ans.some(a=>a!=='Y'&&a!=='N'))gaps.push(2);
 if(!String(W.points||'').trim()&&!String(W.cups||'').trim())gaps.push(3);
 if(String(W.paid??'').trim()==='')gaps.push(4);
 return gaps;
}
function refreshWizardWarnings(){
 if(!W?._showGaps)return;
 const steps=document.getElementById('wizardSteps');if(!steps)return;
 const missing=wizardGaps();
 steps.querySelectorAll('[data-step]').forEach(el=>{
  const i=+el.dataset.step;const bad=missing.includes(i);
  el.classList.toggle('needs-attention',bad);
  const n=el.querySelector('i');if(n)n.textContent=bad?'!':i<W.step?'✓':bn(i+1);
  if(bad)el.setAttribute('aria-invalid','true');else el.removeAttribute('aria-invalid');
 });
}
function submitWizard(){
 if(!W)return;
 W._showGaps=true;
 const err=wizardRequiredIssue();
 if(err){
  W._error=err;W._allowBlank=false;W.step=0;render();toast(err);
  document.querySelector(err==='রোগীর নাম লিখুন'?'#w_name':'#w_mob')?.focus();
  return;
 }
 const optional=wizardGaps().filter(i=>i>0);
 if(optional.length&&!W._allowBlank){
  W._allowBlank=true;W._error='';render();toast('লাল ধাপগুলোতে কিছু তথ্য ফাঁকা আছে');
  return;
 }
 finish();
}
function cancelWizard(){confirmBox('এই সাক্ষাতের লেখা তথ্য মুছে যাবে। বাতিল করবেন?',()=>{W=null;closeModal();go('dash')})}
const bind=(id,obj,key)=>{const el=document.getElementById(id);el.value=obj[key]??'';el.oninput=()=>obj[key]=el.value};
function st1(b){
 if(W.pid){const p=pById(W.pid);const last=visitsOf(p.id)[0];
  b.innerHTML=`<div class="h3">পুরনো রোগী <button class="btn sm" onclick="W.pid=null;render()">অন্য রোগী</button></div><div class="row"><div class="av ${p.sex==='মহিলা'?'f':''}">${esc(p.name[0])}</div><div class="grow"><div class="t">${esc(p.name)}</div><div class="m">${bn(p.age)} বছর · ${esc(p.sex)} · ${esc(bn(p.mobile))}</div></div></div>
  ${last?`<div class="found"><div class="grow"><b>শেষ সাক্ষাৎ: ${fd(last.date)}</b><div class="m muted" style="font-size:13px">পয়েন্ট: ${esc(last.points)||'—'} · কাপ ${bn(last.cups)||'—'} · BP ${esc(bn(last.vitals?.bp))||'—'}</div></div><button class="btn sm" onclick="copyLast()">আগের তথ্য নিন</button></div>`:''}
  <div class="fg mt"><div><label for="w_date">সাক্ষাতের তারিখ</label><input type="date" id="w_date"></div><div><label for="w_age">বর্তমান বয়স</label><input id="w_age" value="${esc(p.age)}"></div></div>`;
  bind('w_date',W,'date');$('#w_age').oninput=e=>W.np._age=e.target.value;return}
 b.innerHTML=`<div class="h3">রোগীর তথ্য</div><div class="fg">
  <div><label for="w_name">রোগীর নাম <span style="color:var(--red)">*</span></label><input id="w_name" autocomplete="name"></div>
  <div><label for="w_age">বয়স</label><input id="w_age" inputmode="numeric"></div>
  <div class="full"><label>লিঙ্গ</label><div class="seg" id="w_sex"><button type="button" data-v="পুরুষ">পুরুষ</button><button type="button" data-v="মহিলা">মহিলা</button></div></div>
  <div class="full"><label for="w_addr">ঠিকানা</label><input id="w_addr"></div>
  <div class="full"><label for="w_mob">মোবাইল নম্বর <span style="color:var(--red)">*</span></label><input id="w_mob" inputmode="numeric" autocomplete="tel-national" placeholder="01712345678" maxlength="11" pattern="[0-9]*"></div>
  <div><label for="w_date">সাক্ষাতের তারিখ</label><input type="date" id="w_date"></div></div><div id="w_found"></div>`;
 W.np.mobile=en(W.np.mobile).replace(/\D/g,'').slice(0,11);
 bind('w_mob',W.np,'mobile');bind('w_name',W.np,'name');bind('w_age',W.np,'age');bind('w_addr',W.np,'address');bind('w_date',W,'date');
 const mobileInput=$('#w_mob');mobileInput.addEventListener('input',()=>{const digits=en(mobileInput.value).replace(/\D/g,'').slice(0,11);if(mobileInput.value!==digits)mobileInput.value=digits;W.np.mobile=digits});
 seg('w_sex',W.np,'sex');
 const chk=()=>{const m=en(W.np.mobile).replace(/\D/g,'');const f=m.length>=6?D.patients.find(p=>en(p.mobile).replace(/\D/g,'')===m):null;
  $('#w_found').innerHTML=f?`<div class="found"><div class="grow"><b>এই নম্বরে আগের রোগী আছে: ${esc(f.name)}</b><div class="muted" style="font-size:13px">${bn(visitsOf(f.id).length)} বার এসেছেন</div></div><button class="btn sm pri" onclick="W.pid='${f.id}';render()">এই রোগী</button></div>`:''};
 $('#w_mob').addEventListener('input',chk);chk();
}
function v1(){return wizardRequiredIssue()}
function copyLast(){const l=visitsOf(W.pid)[0];if(!l)return;W.ans=l.ans.slice();W.meds=l.meds;W.points=l.points;W.cups=l.cups;W.service=l.service;W.therapist=l.therapist;W.fee=l.fee;if(l.advice)W.advice=l.advice;toast('আগের প্রশ্নের উত্তর ও চিকিৎসা নেওয়া হয়েছে');}
function seg(id,obj,key,cb){const el=document.getElementById(id);el.querySelectorAll('button').forEach(x=>{x.classList.toggle('on',obj[key]===x.dataset.v);x.onclick=()=>{obj[key]=x.dataset.v;el.querySelectorAll('button').forEach(y=>y.classList.toggle('on',y===x));cb&&cb()}})}
function st2(b){const V=W.vitals;
 b.innerHTML=`<div class="h3">পরীক্ষা (থেরাপিস্ট পূরণ করবেন)</div><p class="skip" style="margin:-4px 0 10px">এখন না লিখলেও চলবে, সরাসরি “পরের ধাপ” চাপুন। ফাঁকা ঘর প্রিন্টে ডট লাইন হয়ে থাকবে, পরে কলমে লেখা যাবে।</p><div class="fg">
 <div><label for="v_bp">BP (রক্তচাপ)</label><input id="v_bp" placeholder="১২০/৮০"></div><div><label for="v_pulse">Pulse (হৃৎস্পন্দন)</label><input id="v_pulse" inputmode="numeric"></div>
 <div><label for="v_rbs">RBS (ব্লাড সুগার, mmol/L)</label><input id="v_rbs" inputmode="decimal"></div><div><label for="v_w">ওজন (কেজি)</label><input id="v_w" inputmode="decimal"></div>
 <div><label for="v_t">তাপমাত্রা (°F)</label><input id="v_t" inputmode="decimal"></div><div><label for="v_s">SpO₂ (%)</label><input id="v_s" inputmode="numeric"></div>
 <div><label for="v_hb">Hb (যদি জানা থাকে)</label><input id="v_hb"></div></div><div id="v_warn"></div>`;
 [['v_bp','bp'],['v_pulse','pulse'],['v_rbs','rbs'],['v_w','weight'],['v_t','temp'],['v_s','spo2'],['v_hb','hb']].forEach(([i,k])=>bind(i,V,k));
 const warn=()=>{const w=[];const x=en(V.bp).split('/');const s=+x[0],d=+x[1];if(s>=160||d>=100)w.push('রক্তচাপ বেশি ('+bn(V.bp)+')');if(s&&s<90)w.push('রক্তচাপ কম ('+bn(V.bp)+')');const r=parseFloat(en(V.rbs));if(r>=11.1)w.push('সুগার বেশি ('+bn(V.rbs)+')');if(r&&r<4)w.push('সুগার কম');const o=+en(V.spo2);if(o&&o<94)w.push('অক্সিজেন কম');
  $('#v_warn').innerHTML=w.length?`<div class="alert">সতর্কতা: ${w.join(', ')}। হিজামার আগে ভেবে দেখুন।</div>`:''};
 b.querySelectorAll('input').forEach(i=>i.addEventListener('input',warn));warn();
}
function v2(){return ''}
function st3(b){

 b.innerHTML=`<div class="h3">রোগীকে প্রশ্ন করুন <span class="flex"><button class="btn sm" id="allno">সব “না”</button><button class="btn sm" id="allblank">সব ফাঁকা (হাতে লিখব)</button></span></div>
 <p class="muted" style="margin:-4px 0 10px;font-size:14px">উত্তর না দিলে প্রশ্ন ফাঁকাই থাকবে এবং প্রিন্টে হাতে টিক দেওয়া যাবে। উত্তর জানা থাকলে “হ্যাঁ” অথবা “না” বাছুন।</p>
 <div class="qgrid">${QS.map((q,i)=>`<div class="q ${W.ans[i]==='Y'&&RISK.includes(i)?'warn':''}" id="q${i}"><div class="n">${bn(i+1)}</div><div class="tx">${q}</div><div class="yn"><button class="yb ${W.ans[i]==='Y'?'on':''}" data-i="${i}" data-v="Y">হ্যাঁ</button><button class="nb ${W.ans[i]==='N'?'on':''}" data-i="${i}" data-v="N">না</button></div></div>`).join('')}</div>
 <div class="mt"><label for="w_meds">বর্তমানে যেসব ওষুধ খাচ্ছেন</label><input id="w_meds" placeholder="না থাকলে “নেই” লিখুন"></div><div id="q_warn"></div>`;
 bind('w_meds',W,'meds');
 const upd=()=>{const r=RISK.filter(i=>W.ans[i]==='Y');$('#q_warn').innerHTML=r.length?`<div class="alert">ঝুঁকিপূর্ণ উত্তর: প্রশ্ন ${r.map(i=>bn(i+1)).join(', ')}। থেরাপিস্ট/ডাক্তারের সাথে পরামর্শ করে সিদ্ধান্ত নিন।</div>`:''};
 b.querySelectorAll('.yn button').forEach(x=>x.onclick=()=>{const i=+x.dataset.i;W.ans[i]=W.ans[i]===x.dataset.v?null:x.dataset.v;x.parentNode.querySelectorAll('button').forEach(y=>y.classList.toggle('on',y.dataset.v===W.ans[i]));document.getElementById('q'+i).classList.toggle('warn',W.ans[i]==='Y'&&RISK.includes(i));upd();return;x.parentNode.querySelectorAll('button').forEach(y=>y.classList.toggle('on',y===x));document.getElementById('q'+i).classList.toggle('warn',W.ans[i]==='Y'&&RISK.includes(i));upd()});
 $('#allno').onclick=()=>{W.ans=W.ans.map(()=>'N');render()};$('#allblank').onclick=()=>{W.ans=W.ans.map(()=>null);render()};upd();
}
function v3(){return ''}
function st4(b){
 const sex=W.pid?pById(W.pid).sex:W.np.sex;
 const th=D.settings.therapists.slice().sort((a,c)=>(c.gender===sex)-(a.gender===sex));
 if(!W.therapist){const m=th.find(t=>t.gender===sex);if(m)W.therapist=m.id}
 b.innerHTML=`<div class="h3">চিকিৎসা</div><p class="skip" style="margin:-4px 0 10px">পয়েন্ট, কাপ, পরামর্শ ফাঁকা রাখলে প্রিন্টের পর হাতে লেখা যাবে।</p><div class="fg">
 <div class="full"><label>সেবা</label><div class="seg" id="w_sv">${D.settings.services.map(s=>`<button data-v="${s.id}">${esc(s.name)}</button>`).join('')}</div></div>
 <div class="full"><label for="w_pt">হিজামার পয়েন্ট</label><textarea id="w_pt" placeholder="যেমন: কাহিল, আখদাইন (২), ইয়াফুখ"></textarea></div>
 <div><label for="w_cups">কাপের সংখ্যা</label><input id="w_cups" inputmode="numeric"></div>
 <div><label>থেরাপিস্ট ${sex==='মহিলা'?'<span class="pill red">নারী রোগী</span>':''}</label><select id="w_th"><option value="">বাছুন</option>${th.map(t=>`<option value="${t.id}">${esc(t.name)} (${t.gender})</option>`).join('')}</select></div>
 <div class="full"><label for="w_adv">থেরাপিস্টের পরামর্শ</label><textarea id="w_adv" ></textarea><div class="skip">সাধারণ পরামর্শ আগে থেকেই লেখা আছে; থেরাপিস্ট দরকারমতো বাড়াতে-কমাতে পারবেন। <a href="#" id="advReset" style="color:var(--navy2)">আবার আগের লেখা</a></div></div>
 <div><label for="w_next">পরবর্তী তারিখ</label><input type="date" id="w_next"></div>
 <div><label>&nbsp;</label><div class="flex"><button class="btn sm" data-d="7">৭ দিন পর</button><button class="btn sm" data-d="30">১ মাস পর</button><button class="btn sm" id="nsun">পরের সুন্নাহ দিন</button></div></div></div>`;
 seg('w_sv',W,'service',()=>{W.fee=(D.settings.services.find(s=>s.id===W.service)||{}).fee||W.fee});
 bind('w_pt',W,'points');bind('w_cups',W,'cups');bind('w_th',W,'therapist');bind('w_adv',W,'advice');$('#advReset').onclick=e=>{e.preventDefault();W.advice=D.settings.defAdvice??'';$('#w_adv').value=W.advice};bind('w_next',W,'nextDate');
 b.querySelectorAll('[data-d]').forEach(x=>x.onclick=()=>{W.nextDate=addDays(W.date,+x.dataset.d);$('#w_next').value=W.nextDate});
 $('#nsun').onclick=()=>{for(let i=1;i<60;i++){const d=addDays(W.date,i);if(isSunnah(d)){W.nextDate=d;$('#w_next').value=d;toast(fd(d));break}}};
}
function v4(){return ''}
function st5(b){
 b.innerHTML=`<div class="h3">পেমেন্ট</div><div class="fg"><div><label for="w_fee">মোট ফি (৳)</label><input id="w_fee" inputmode="numeric"></div><div><label for="w_paid">এখন পরিশোধ (৳)</label><input id="w_paid" inputmode="numeric"></div></div>
 <div class="flex mt"><button class="btn sm" id="pfull">পুরো টাকা দিয়েছেন</button><span class="muted" id="pdue"></span></div>`;
 bind('w_fee',W,'fee');bind('w_paid',W,'paid');
 const u=()=>{const d=Math.max(0,(+en(W.fee)||0)-(+en(W.paid)||0));$('#pdue').innerHTML=d?'বাকি থাকবে: <b style="color:var(--red)">'+tk(d)+'</b>':'<span class="pill green">কোনো বাকি নেই</span>'};
 $('#w_fee').addEventListener('input',u);$('#w_paid').addEventListener('input',u);$('#pfull').onclick=()=>{W.paid=W.fee;$('#w_paid').value=W.fee;u()};u();
}
function v5(){return ''}
function st6(b){
 const p=W.pid?pById(W.pid):W.np;const V=W.vitals;const yes=W.ans.map((a,i)=>a==='Y'?i:-1).filter(i=>i>=0);
 b.innerHTML=`<div class="h3">সব ঠিক আছে কি না দেখে নিন</div><div class="review"><dl>
 <dt>রোগী</dt><dd><b>${esc(p.name)}</b> · ${bn(W.np._age||p.age)} বছর · ${esc(p.sex)} · ${esc(bn(p.mobile))}</dd>
 <dt>তারিখ</dt><dd>${fd(W.date)}</dd>
 <dt>পরীক্ষা</dt><dd>BP ${esc(bn(V.bp))} · Pulse ${esc(bn(V.pulse))||'—'} · RBS ${esc(bn(V.rbs))||'—'} · SpO₂ ${esc(bn(V.spo2))||'—'}</dd>
 <dt>“হ্যাঁ” উত্তর</dt><dd>${yes.length?yes.map(i=>'<span class="pill '+(RISK.includes(i)?'red':'amber')+'">'+bn(i+1)+'</span>').join(' '):(W.ans.every(a=>a==='N')?'<span class="pill green">সব “না”</span>':'<span class="pill amber">কিছু প্রশ্ন ফাঁকা</span>')}</dd>
 <dt>সেবা</dt><dd>${esc(svName(W.service))} · থেরাপিস্ট: ${esc(thName(W.therapist))}</dd>
 <dt>পয়েন্ট</dt><dd>${esc(W.points)||'—'} · কাপ ${bn(W.cups)||'—'}</dd>
 <dt>পরবর্তী তারিখ</dt><dd>${fd(W.nextDate)||'—'}</dd>
 <dt>পেমেন্ট</dt><dd>ফি ${tk(en(W.fee))} · পরিশোধ ${tk(en(W.paid))}${(+en(W.fee)||0)>(+en(W.paid)||0)?' · <span class="pill red">বাকি '+tk((+en(W.fee))-(+en(W.paid)||0))+'</span>':''}</dd></dl></div>
 <p class="muted" style="font-size:13px;margin-top:12px">“সম্পন্ন ও প্রিন্ট” চাপলে সাক্ষাৎ সেভ হবে আর সম্মতিপত্রের ২ কপি (রোগীর কপি ও সেন্টারের কপি) প্রিন্টের জন্য খুলবে।</p>`;
 if(W._showGaps){const missing=wizardGaps().filter(i=>i>0);if(missing.length)b.insertAdjacentHTML('beforeend','<div class="alert" role="alert">এই ধাপগুলোতে কিছু তথ্য ফাঁকা আছে: <b>'+missing.map(i=>STEPS[i]).join(', ')+'</b>। উপরের লাল ধাপে গিয়ে পূরণ করতে পারেন। চাইলে ফাঁকা রেখেই সম্পন্ন ও প্রিন্ট করুন।</div>')}
}
function finish(){
 const required=wizardRequiredIssue();if(required){W._error=required;W._showGaps=true;W._allowBlank=false;W.step=0;render();toast(required);return}
 let pid=W.pid;
 if(!pid){pid=uid();D.patients.push({id:pid,name:W.np.name.trim(),age:en(W.np.age),sex:W.np.sex,mobile:W.np.mobile.trim(),address:W.np.address.trim(),created:today()})}
 else if(W.np._age){pById(pid).age=en(W.np._age)}
 D.seq=(D.seq||0)+1;
 const v={id:uid(),serial:D.seq,patientId:pid,date:W.date,vitals:{...W.vitals},ans:W.ans.slice(),meds:W.meds,service:W.service,points:W.points,cups:en(W.cups),therapist:W.therapist,advice:W.advice,nextDate:W.nextDate,fee:+en(W.fee)||0,paid:+en(W.paid)||0,payments:[{date:W.date,amt:+en(W.paid)||0}],created:new Date().toISOString()};
 D.visits.push(v);
 if(W.apptId){const a=D.appts.find(x=>x.id===W.apptId);if(a){a.status='done';a.patientId=pid}}
 if(W.nextDate&&!D.appts.some(a=>a.patientId===pid&&a.date===W.nextDate)){D.appts.push({id:uid(),patientId:pid,name:'',mobile:'',date:W.nextDate,time:'',service:W.service,therapist:W.therapist,note:'ফলো-আপ',status:'pending'})}
 save();W=null;toast('সাক্ষাৎ সেভ হয়েছে');go('patient',pid);setTimeout(()=>printVisit(v.id),300);
}
