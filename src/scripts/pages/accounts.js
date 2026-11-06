/* ================= MONEY ================= */
let monM=today().slice(0,7);
function pMoney(m){
 const vs=D.visits.filter(v=>v.date.startsWith(monM)).sort((a,b)=>b.date.localeCompare(a.date));
 const fee=vs.reduce((s,v)=>s+(+v.fee||0),0),paid=vs.reduce((s,v)=>s+(+v.paid||0),0);
 const dues=D.visits.filter(v=>due(v)>0).sort((a,b)=>b.date.localeCompare(a.date));
 const bySv={};vs.forEach(v=>{bySv[v.service]=(bySv[v.service]||0)+(+v.paid||0)});
 const [y,mo]=monM.split('-').map(Number);
 m.innerHTML=`<div class="top"><div><h2>হিসাব</h2><div class="sub">মাস ধরে আয় ও বাকি</div></div><div class="flex"><button class="btn sm" id="mp">‹</button><b>${MON[mo-1]} ${bn(y)}</b><button class="btn sm" id="mn">›</button></div></div>
 <div class="grid g3"><div class="card stat"><div class="k">মোট ফি</div><div class="v">${tk(fee)}</div><div class="s">${bn(vs.length)}টি সাক্ষাৎ</div></div><div class="card stat"><div class="k">আদায়</div><div class="v" style="color:var(--green)">${tk(paid)}</div></div><div class="card stat"><div class="k">এই মাসের বাকি</div><div class="v" style="color:${fee-paid>0?'var(--red)':'var(--navy)'}">${tk(fee-paid)}</div></div></div>
 <div class="grid g2 mt"><div class="card"><div class="h3">সেবা অনুযায়ী আয়</div>${Object.keys(bySv).length?Object.entries(bySv).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<div class="row"><div class="grow">${esc(s���q�^