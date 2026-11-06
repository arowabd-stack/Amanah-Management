/* ================= APPOINTMENTS ================= */
let calM=today().slice(0,7),calSel=today();
function pAppts(m){
 const [y,mo]=calM.split('-').map(Number);const first=new Date(y,mo-1,1);const start=new Date(first);start.setDate(1-((first.getDay()+1)%7)); // শনিবার শুরু
 const days=[];for(let i=0;i<42;i++){const d=new Date(start);d.setDate(start.getDate()+i);d.setMinutes(d.getMinutes()-d.getTimezoneOffset());days.push(d.toISOString().slice(0,10))}
 const t=today();const sel=D.appts.filter(a=>a.date===calSel).sort((a,b)=>(a.time||'').localeCompare(b.time||''));const hs=hijri(calSel);
 m.innerHTML=`<div class="top"><div><h2>অ্যাপয়েন্টমেন্ট</h2><div class="sub">সোনালি ঘর = সুন্নাহ দিন (চান্দ্র ১৭, ১৯, ২১)</div></div><button class="btn pri" onclick="openAppt(null,null,calSel)">${I.plus}নতুন অ্যাপয়েন্টমেন্ট</button></div>
 <div class="grid" style="grid-template-columns:minmax(0,1.6fr) minmax(0,1fr)" id="apg">
 <div class="card"><div class="h3"><button class="btn sm" id="cp">‹</button><span>${MON[mo-1]} ${bn(y)}</span><button class="btn sm" id="cn">›</button></div>
  <div class="cal">${['শনি','রবি','সোম','মঙ্গল','বুধ','বৃহঃ','শুক্র'].map(d=>`<div class="wd">${d}</div>`).join('')}
  ${days.map(d=>{const h=hijri(d);const sn=h&&[17,19,21].includes(h.day);const c=D.appts.f���q�^