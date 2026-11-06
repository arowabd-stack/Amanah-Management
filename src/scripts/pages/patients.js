/* ================= PATIENTS ================= */
function pPatients(m){
 m.innerHTML=`<div class="top"><div><h2>রোগী তালিকা</h2><div class="sub">মোট ${bn(D.patients.length)} জন</div></div>
  <div class="flex" style="flex:1;justify-content:flex-end"><div class="search">${I.search}<input id="q" placeholder="নাম বা মোবাইল দিয়ে খুঁজুন"></div><button class="btn pri" onclick="go('new')">${I.plus}নতুন</button></div></div>
  <div class="card"><div class="tw"><table class="t"><thead><tr><th>নাম</th><th>মোবাইল</th><th>বয়স/লিঙ্গ</th><th>সাক্ষাৎ</th><th>শেষ এসেছেন</th><th>বাকি</th><th></th></tr></thead><tbody id="pl"></tbody></table></div><div id="pe"></div></div>`;
 const draw=()=>{const q=en($('#q').value.trim()).toLowerCase();
  const L=D.patients.filter(p=>!q||p.name.toLowerCase().includes(q)||en(p.mobile).includes(q)).map(p=>{const vs=visitsOf(p.id);return{p,vs,last:vs[0]?.date||'',due:vs.reduce((s,v)=>s+due(v),0)}}).sort((a,b)=>b.last.localeCompare(a.last));
  $('#pl').innerHTML=L.map(({p,vs,last,due:d})=>`<tr style="cursor:pointer" onclick="go('patient','${p.id}')"><td><b>${esc(p.name)}</b></td><td>${esc(bn(p.mobile))}</td><td>${bn(p.age)} · ${esc(p.sex)}</td><td class="num">${bn(vs.length)}</td><td>${fd(last)}</td><td>${d?'<span class="pill red">'+tk(d)+'</span>':'—'}</td><td><a class="btn sm wa" target="_blank" rel="���q�^