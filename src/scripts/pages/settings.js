/* ================= SETTINGS ================= */
function pSettings(m){
 const S=D.settings;
 m.innerHTML=`<div class="top"><div><h2>সেটিংস</h2><div class="sub">থেরাপিস্ট, সেবা ও ফি, মেসেজ, পাসওয়ার্ড, ব্যাকআপ</div></div></div>
 <div class="grid g2">
 <div class="card"><div class="h3">থেরাপিস্ট <button class="btn sm" id="addT">${I.plus}যোগ</button></div><div id="tl"></div></div>
 <div class="card"><div class="h3">সেবা ও ফি <button class="btn sm" id="addS">${I.plus}যোগ</button></div><div id="sl"></div></div>
 <div class="card"><div class="h3">থেরাপিস্টের সাধারণ পরামর্শ</div><textarea id="adv_t" style="min-height:110px"></textarea><p class="muted" style="font-size:12.5px">প্রতিটি নতুন সাক্ষাতে এই লেখা আগে থেকে বসে থাকবে।</p><button class="btn pri sm" id="adv_s">সেভ</button></div>
 <div class="card"><div class="h3">WhatsApp রিমাইন্ডার মেসেজ</div><textarea id="wa_t" style="min-height:110px"></textarea><p class="muted" style="font-size:12.5px">{নাম}, {তারিখ}, {সময়} নিজে থেকে বসবে।</p><button class="btn pri sm" id="wa_s">সেভ</button></div>
 <div class="card"><div class="h3">সেন্টারের তথ্য (প্রিনර�q�^