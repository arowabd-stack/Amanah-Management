/* ================= PRINT ================= */
function formHTML(v,copy){
 const p=pById(v.patientId)||{};const S=D.settings;const V=v.vitals||{};
 const vit=[['BP (রক্তচাপ)',V.bp],['Pulse (হৃৎস্পন্দন)',V.pulse],['RBS (ব্লাড সুগার)',V.rbs],['ওজন',V.weight],['তাপমাত্রা',V.temp],['SpO₂ (রক্তে অক্সিজেন)',V.spo2],['Hb (যদি জানা থাকে)',V.hb]];
 return `<div class="pf"><span class="copy">${copy}</span>
 <div class="hd"><span class="nm">${esc(S.center)}</span><div class="ad">${esc(S.address)}<br>যোগাযোগ: ${esc(S.phone)} (Call / WhatsApp)</div></div>
 <div class="tt"><b>হিজামার আগে রোগীর সম্মতিপত্র</b><small>${v.serial?'ক্রমিক নং: '+bn(v.serial)+' · সেবা: '+esc(svName(v.service)):'হিজামা শুরুর আগে রোগী নিজে পূরণ করবেন'}</small></div>
 <div class="info">
  <div class="f" style="grid-column:span 3"><span>রোগীর নাম:</span><i>${esc(p.name)}</i></div><div class="f"><span>বয়স:</span><i>${bn(p.age)}</i></div>
  <div class="f" style="grid-column:span 2;align-items:center"><span>লিঙ্গ:</span><span class="sx"><span class="bx ${p.sex==='পুরুষ'?'x':''}">${p.sex==='পুরুষ'?'✓':''}</span>পুরুষ<span class="bx ${p.sex==='মহিলা'?'x':''}">${p.sex==='শ��q�^