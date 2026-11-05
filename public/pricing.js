/* Amanah cup-based service pricing. Prices are set by the clinic; no invented per-cup fees. */
(function(){
'use strict';
const STYLE=document.createElement('style');
STYLE.textContent='.price-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px}.price-card{border:1px solid #e1e7e3;border-radius:16px;padding:17px;background:#fff}.price-card h3{font-size:17px;margin:0 0 12px}.price-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.price-form label{display:block;font-size:12px;color:var(--muted);margin-bottom:3px}.price-form input{min-width:0;width:100%;padding:9px;border:1px solid #d6ded9;border-radius:9px;font:inherit}.price-preview{background:#eef7f0;border-radius:11px;padding:12px;margin-top:13px;font-weight:700;color:#165d44}.price-note{color:var(--muted);font-size:13px;line-height:1.75}.cup-quick{display:flex;gap:7px;align-items:center;flex-wrap:wrap;margin-top:9px}.cup-quick button{padding:5px 12px;border:1px solid #c5d7c8;background:#edf5ed;border-radius:99px;color:#245d43;cursor:pointer}.price-toolbar{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin:15px 0}.price-toolbar input{max-width:95px}.price-calc-wizard{margin-top:8px;border:1px solid #d8e6da;background:#eff8f1;padding:11px 14px;border-radius:10px;font-size:13px;color:#255a40}.price-card .remove-cat{margin-top:10px;font-size:12px;color:#a24646}.price-card .hint{color:#69786a;font-size:12px;margin:7px 0}@media(max-width:450px){.price-grid{grid-template-columns:1fr}.price-form{gap:8px}}';
document.head.appendChild(STYLE);
function goodNumber(raw, min, max){
 const n=Number(en(raw));return Number.isFinite(n)?Math.max(min,Math.min(max,n)):min;
}
function config(service){
 if(!service)return {fee:0,baseCups:1,extraCup:0};
 return {fee:goodNumber(service.fee,0,10000000),baseCups:Math.round(goodNumber(service.baseCups??1,1,100)),extraCup:goodNumber(service.extraCup??0,0,1000000)};
}
function priceFor(id,rawCount){
 const s=D.settings.services.find(x=>x.id===id);const r=config(s);
 const cups=rawCount===''||rawCount===null||rawCount===undefined?r.baseCups:Math.round(goodNumber(rawCount,0,100));
 return r.fee+Math.max(0,cups-r.baseCups)*r.extraCup;
}
function breakdown(id, rawCount){
 const r=config(D.settings.services.find(x=>x.id===id));
 const cups=rawCount===''||rawCount===null||rawCount===undefined?r.baseCups:Math.round(goodNumber(rawCount,0,100));
 return 'বেস '+bn(r.baseCups)+' কাপ: '+tk(r.fee)+' · অতিরিক্ত '+bn(Math.max(0,cups-r.baseCups))+' কাপ × '+tk(r.extraCup)+' = '+tk(priceFor(id,cups));
}
window.AmanahPricing={priceFor,breakdown};
const i=PAGES.findIndex(x=>x[0]==='settings');
PAGES.splice(i<0?PAGES.length:i,0,['pricing','কাপ ও প্রাইস',I.money]);
const oldRender=render;
render=function(){
 if(route==='pricing'){navHTML();pPricing($('#main'));return}
 return oldRender();
};
function pPricing(root){
 root.innerHTML='<div class="top"><div><h2>কাপ ও সার্ভিস প্রাইসিং</h2><div class="sub">প্রতিটি সেবা Category-এর মূল্য আলাদাভাবে পরিবর্তন করুন</div></div><button class="btn" id="pricingToSettings">সেটিংস</button></div>'+
 '<div class="card"><b>দাম হিসাবের নিয়ম</b><p class="price-note">বেস কাপের জন্য বেস মূল্য। বেস কাপের বেশি হলে প্রতি অতিরিক্ত কাপের চার্জ যোগ হবে। কাপের সংখ্যা কমালে হিসাবও কমবে, তবে বেস মূল্যের নিচে যাবে না। সব দাম টাকা (৳) এবং তোমার নিজের নির্ধারিত। পুরোনো সাক্ষাতের সেভ করা ফি বদলাবে না।</p></div>'+
 '<div class="price-toolbar"><button class="btn pri" id="addPriceCategory">+ নতুন সার্ভিস ক্যাটাগরি</button><span class="price-note">প্রিভিউ কাপ:</span><input type="number" min="1" max="100" step="1" id="pricePreviewCups" value="3" aria-label="প্রিভিউ কাপের সংখ্যা"></div><div class="price-grid" id="priceGrid"></div>';
 $('#pricingToSettings').onclick=()=>go('settings');
 const renderCards=()=>{
  const grid=$('#priceGrid');grid.innerHTML='';
  D.settings.services.forEach((s,index)=>{
   const v=config(s);const card=document.createElement('section');card.className='price-card';
   card.innerHTML='<h3>ক্যাটাগরি '+bn(index+1)+'</h3>'+
   '<label for="priceName'+index+'">সার্ভিসের নাম</label><input class="price-name" style="width:100%;padding:9px;border:1px solid #d6ded9;border-radius:9px" id="priceName'+index+'" value="'+esc(s.name)+'" maxlength="90">'+
   '<div class="price-form" style="margin-top:13px"><div><label for="baseFee'+index+'">বেস ফি (৳)</label><input type="number" inputmode="decimal" min="0" step="1" id="baseFee'+index+'" value="'+v.fee+'"></div>'+
   '<div><label for="baseCups'+index+'">বেস কাপ সংখ্যা</label><input type="number" inputmode="numeric" min="1" max="100" id="baseCups'+index+'" value="'+v.baseCups+'"></div>'+
   '<div><label for="extraCup'+index+'">প্রতি অতিরিক্ত কাপ (৳)</label><input type="number" inputmode="decimal" min="0" step="1" id="extraCup'+index+'" value="'+v.extraCup+'"></div>'+
   '<div><label>দাম শুরু</label><p class="hint">প্রথম '+bn(v.baseCups)+' কাপ: '+tk(v.fee)+'</p></div></div>'+
   '<div class="price-preview" aria-live="polite" id="previewPrice'+index+'"></div>'+
   '<button type="button" class="btn sm danger remove-cat" id="removePrice'+index+'">এই ক্যাটাগরি সরান</button>';
   grid.appendChild(card);
   const title=$('#priceName'+index),fee=$('#baseFee'+index),base=$('#baseCups'+index),extra=$('#extraCup'+index),preview=$('#previewPrice'+index);
   const refresh=()=>{const count=$('#pricePreviewCups')?.value||3;preview.textContent=bn(count)+' কাপের মোট: '+tk(priceFor(s.id,count))};
   const update=()=>{
    s.name=title.value.trim()||'নতুন সেবা';
    s.fee=goodNumber(fee.value,0,10000000);
    s.baseCups=Math.round(goodNumber(base.value,1,100));
    s.extraCup=goodNumber(extra.value,0,1000000);
    save();refresh();toast('ক্যাটাগরির দাম সেভ করা হয়েছে');
   };
   title.addEventListener('change',update);fee.addEventListener('change',update);base.addEventListener('change',update);extra.addEventListener('change',update);
   $('#removePrice'+index).onclick=()=>{
    if(D.settings.services.length<=1){toast('অন্তত একটি ক্যাটাগরি রাখুন');return}
    if(D.visits.some(v=>v.service===s.id)||D.appts.some(a=>a.service===s.id)){toast('এই ক্যাটাগরিতে পুরোনো রোগী/অ্যাপয়েন্টমেন্ট আছে। মুছবেন না।');return}
    if(confirm('এই অব্যবহৃত সার্ভিস ক্যাটাগরি মুছে ফেলবে?')){D.settings.services.splice(index,1);save();renderCards()}
   };
   refresh();
  });
 };
 $('#pricePreviewCups').addEventListener('input',renderCards);
 $('#addPriceCategory').onclick=()=>{D.settings.services.push({id:uid(),name:'নতুন সার্ভিস',fee:0,baseCups:1,extraCup:0});save();renderCards()};
 renderCards();
}
const oldSt4=st4;
st4=function(b){
 oldSt4(b);
 const cup=$('#w_cups'),serv=$('#w_sv');if(!cup||!serv)return;
 cup.type='number';cup.min='0';cup.max='100';cup.step='1';cup.placeholder='যেমন: ৩';
 const summary=document.createElement('div');summary.className='price-calc-wizard';summary.id='cupPriceSummary';summary.setAttribute('aria-live','polite');
 cup.closest('div').appendChild(summary);
 const row=document.createElement('div');row.className='cup-quick';row.innerHTML='<span class="muted">দ্রুত বাছুন:</span><button type="button" data-cup-n="1">১</button><button type="button" data-cup-n="3">৩</button><button type="button" data-cup-n="5">৫</button><button type="button" data-cup-n="7">৭</button><button type="button" data-cup-n="10">১০</button>';
 cup.closest('div').appendChild(row);
 const recalc=()=>{
  W.fee=priceFor(W.service,W.cups);
  summary.textContent=breakdown(W.service,W.cups);
 };
 cup.addEventListener('input',recalc);
 row.querySelectorAll('button').forEach(btn=>btn.onclick=()=>{cup.value=btn.dataset.cupN;W.cups=cup.value;recalc()});
 serv.querySelectorAll('button').forEach(btn=>btn.addEventListener('click',recalc));
 recalc();
};
const oldSt5=st5;
st5=function(b){
 oldSt5(b);
 const fee=$('#w_fee');const desc=document.createElement('div');
 desc.className='price-calc-wizard';
 desc.innerHTML='<div id="feeFormula"></div><button class="btn sm" type="button" id="useCupPrice" style="margin-top:8px">কাপ অনুযায়ী হিসাব বসান</button><p class="price-note" style="margin:6px 0 0">প্রয়োজনে মোট ফি ম্যানুয়ালি পরিবর্তন করতে পারবেন।</p>';
 b.querySelector('.fg').after(desc);
 $('#feeFormula').textContent=breakdown(W.service,W.cups);
 $('#useCupPrice').onclick=()=>{W.fee=priceFor(W.service,W.cups);fee.value=W.fee;fee.dispatchEvent(new Event('input',{bubbles:true}));toast('কাপ অনুযায়ী ফি বসানো হয়েছে')};
};
const oldSettings=pSettings;
pSettings=function(m){
 oldSettings(m);
 const serviceGrid=$('#sl');if(serviceGrid){const card=serviceGrid.closest('.card');if(card)card.innerHTML='<div class="h3">সেবা ও কাপের মূল্য</div><p class="price-note">ক্যাটাগরি অনুযায়ী বেস ফি, কত কাপ অন্তর্ভুক্ত এবং প্রতি বাড়তি কাপের দাম এখন আলাদাভাবে সেট করা যায়।</p><button class="btn pri" id="manageCupPrices">কাপ ও প্রাইসিং ম্যানেজ করুন</button>';}
 const btn=$('#manageCupPrices');if(btn)btn.onclick=()=>go('pricing');
};
})();