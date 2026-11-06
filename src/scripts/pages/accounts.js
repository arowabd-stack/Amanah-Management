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
 <div class="grid g2 mt"><div class="card"><div class="h3">সেবা অনুযায়ী আয়</div>${Object.keys(bySv).length?Object.entries(bySv).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<div class="row"><div class="grow">${esc(svName(k))}</div><b>${tk(v)}</b></div>`).join(''):'<div class="empty">এই মাসে কোনো আয় নেই</div>'}</div>
 <div class="card"><div class="h3">যাদের বাকি আছে</div>${dues.length?dues.slice(0,12).map(v=>{const p=pById(v.patientId)||{};return `<div class="row"><div class="grow"><div class="t">${esc(p.name)}</div><div class="m">${fd(v.date)} · ${esc(svName(v.service))}</div></div><span class="pill red">${tk(due(v))}</span><button class="btn sm" onclick="payDue('${v.id}')">নিন</button><a class="btn sm wa" target="_blank" rel="noopener" href="${waLink(p.mobile,'আসসালামু আলাইকুম '+p.name+', আমানাহ সেন্টারে আপনার '+tk(due(v))+' বাকি আছে। সুবিধামতো পরিশোধ করবেন। জাযাকাল্লাহ।')}">${I.wa}</a></div>`}).join(''):'<div class="empty"><b>কোনো বাকি নেই</b></div>'}</div></div>
 <div class="card mt"><div class="h3">এই মাসের সব লেনদেন</div><div class="tw"><table class="t"><thead><tr><th>তারিখ</th><th>রোগী</th><th>সেবা</th><th class="num">ফি</th><th class="num">আদায়</th><th class="num">বাকি</th></tr></thead><tbody>${vs.map(v=>`<tr><td>${fds(v.date)}</td><td>${esc((pById(v.patientId)||{}).name)}</td><td>${esc(svName(v.service))}</td><td class="num">${tk(v.fee)}</td><td class="num">${tk(v.paid)}</td><td class="num">${due(v)?tk(due(v)):'—'}</td></tr>`).join('')}</tbody></table></div>${vs.length?'':'<div class="empty">কোনো লেনদেন নেই</div>'}</div>`;
 $('#mp').onclick=()=>{const d=new Date(y,mo-2,1);monM=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');render()};
 $('#mn').onclick=()=>{const d=new Date(y,mo,1);monM=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');render()};
}
