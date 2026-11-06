/* =====================================================================
   DATA LAYER  ·  আপাতত ব্রাউজারে (localStorage) রাখা হচ্ছে।
   ডেভেলপার: শুধু এই Store অবজেক্টের load/save বদলে Firebase/সার্ভার জুড়বেন।
   ===================================================================== */
const Store={
 KEY:'amanah_clinic_clean_v2',
 load(){try{return JSON.parse(localStorage.getItem(this.KEY))||null}catch(e){return null}},
 save(d){try{localStorage.setItem(this.KEY,JSON.stringify(d));return true}catch(e){toast('সেভ হয়নি! ব্রাউজারের স্টোরেজ বন্ধ');return false}}
};
const DEF={
 settings:{
  center:'আমানাহ সেন্টার',address:'পশ্চিম হাজীপাড়া মেইন রোড, সুনামগঞ্জ সদর',phone:'০১৬১৬-০৮৬৯৫২',
  user:'admin',passHash:null,hijriOffset:0,
  therapists:[{id:'t1',name:'পুরুষ থেরাপিস্ট',gender:'পুরুষ'},{id:'t2',name:'নারী থেরাপিস্ট',gender:'মহিলা'}],
  services:[{id:'s1',name:'ওয়েট কাপিং (সুন্নাহ হিজামা)',fee:1000},{id:'s2',name:'ড্রাই কাপিং',fee:600},{id:'s3',name:'মাথা ও ঘাড়ের হিজামা',fee:800}],
  defAdvice:'১–৩ দিন বিশ্রাম নিন, ভারী কাজ ও ব্যায়াম করবেন না। জায়গাটি পরিষ্কার ও শুকনো রাখুন, চুলকাবেন না। কুসুম গরম পানিতে গোসল করুন, প্রচুর পানি ও পুষ্টিকর খাবার খান।',
  waTpl:'আসসালামু আলাইকুম {নাম}, আমানাহ সেন্টার থেকে বলছি। আপনার পরবর্তী হিজামা/সেবার তারিখ {তারিখ} {সময়}। ইনশাআল্লাহ সময়মতো চলে আসবেন। প্রয়োজনে: ০১৬১৬-০৮৬৯৫২'
 },
 patients:[],visits:[],appts:[],seq:0
};
let D=Store.load()||JSON.parse(JSON.stringify(DEF));
if(D.settings.defAdvice&&D.settings.defAdvice.startsWith('সেদিন বিশ্রাম নিন')){D.settings.defAdvice=D.settings.defAdvice.replace('সেদিন বিশ্রাম নিন','১–৩ দিন বিশ্রাম নিন');Store.save(D)}
if(!D.mig1){D.settings.services=D.settings.services.filter(x=>!['s4','s5'].includes(x.id));D.mig1=1;Store.save(D)}
const save=()=>Store.save(D);

const QS=["রক্ত পাতলা করার ওষুধ (যেমন ওয়ারফারিন, ক্লপিডোগ্রেল, অ্যাসপিরিন) খান কি?","হিমোফিলিয়া বা রক্তক্ষরণের কোনো রোগ আছে কি?","রক্তস্বল্পতা আছে কি?","ক্যান্সারের চিকিৎসা চলছে, বা লিভার-কিডনির গুরুতর রোগ আছে কি?","গর্ভবতী, সদ্য সন্তান প্রসব, বা এখন পিরিয়ড চলছে কি?","ডায়াবেটিস আছে কি?","উচ্চ বা নিম্ন রক্তচাপ আছে কি?","হৃদরোগ আছে বা পেসমেকার আছে কি?","খিঁচুনি (মৃগী) রোগ আছে কি?","হেপাটাইটিস বা HIV আছে কি?","গত ১ সপ্তাহে রক্তদান বা হিজামা করেছেন কি?","সম্প্রতি অপারেশন হয়েছে বা হাড় ভেঙেছে কি?","হিজামার জায়গায় ক্ষত, ইনফেকশন বা চর্মরোগ আছে কি?","রক্ত বা ব্লেড দেখে অজ্ঞান হওয়ার প্রবণতা আছে কি?","কোনো ওষুধ বা জিনিসে অ্যালার্জি আছে কি?"];
const RISK=[0,1,3,4,7,9,12]; // এগুলোতে "হ্যাঁ" হলে লাল সতর্কতা
const DECL='আমাকে হিজামার পদ্ধতি এবং সম্ভাব্য পার্শ্বপ্রতিক্রিয়া — দাগ, ব্যথা, মাথা ঘোরা এবং খুব কম ক্ষেত্রে ইনফেকশন — বুঝিয়ে বলা হয়েছে। আমি উপরের সব তথ্য সত্য দিয়েছি এবং নিজের ইচ্ছায় হিজামা করাতে সম্মত।';

/* ---------- helpers ---------- */
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const bn=x=>String(x??'').replace(/\d/g,d=>'০১২৩৪৫৬৭৮৯'[d]);
const en=x=>String(x??'').replace(/[০-৯]/g,d=>'০১২৩৪৫৬৭৮৯'.indexOf(d));
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const today=()=>{const d=new Date();d.setMinutes(d.getMinutes()-d.getTimezoneOffset());return d.toISOString().slice(0,10)};
const addDays=(s,n)=>{const d=new Date(s+'T00:00');d.setDate(d.getDate()+n);d.setMinutes(d.getMinutes()-d.getTimezoneOffset());return d.toISOString().slice(0,10)};
const MON=['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর'];
const fd=s=>{if(!s)return '';const [y,m,d]=s.split('-');return bn(+d)+' '+MON[+m-1]+' '+bn(y)};
const fds=s=>{if(!s)return '';const [y,m,d]=s.split('-');return bn(d+'-'+m+'-'+y)};
const tk=n=>'৳'+bn((+n||0).toLocaleString('en-IN'));
const pById=id=>D.patients.find(p=>p.id===id);
const thName=id=>(D.settings.therapists.find(t=>t.id===id)||{}).name||'';
const svName=id=>(D.settings.services.find(s=>s.id===id)||{}).name||'';
function hijri(dateStr){
 try{
  // Preserve the old Umm al-Qura calculation and apply the centre's optional adjustment.
  const configured=Number(D?.settings?.hijriOffset??0);
  const offset=Number.isInteger(configured)&&configured>=-2&&configured<=2?configured:0;
  const d=new Date(dateStr+'T12:00');
  if(Number.isNaN(d.getTime()))return null;
  d.setDate(d.getDate()+offset);
  const f=new Intl.DateTimeFormat('en-u-ca-islamic-umalqura',{day:'numeric',month:'numeric'}).formatToParts(d);
  return {day:+f.find(x=>x.type==='day').value,month:+f.find(x=>x.type==='month').value};
 }catch(e){return null}
}
const HM=['মুহাররম','সফর','রবিউল আউয়াল','রবিউস সানি','জমাদিউল আউয়াল','জমাদিউস সানি','রজব','শাবান','রমজান','শাওয়াল','জিলকদ','জিলহজ'];
const isSunnah=s=>{const h=hijri(s);return h&&[17,19,21].includes(h.day)};
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('on'),1800)}
function waLink(mobile,text){let m=en(mobile).replace(/\D/g,'');if(m.startsWith('0'))m='88'+m;else if(!m.startsWith('88'))m='88'+m;return 'https://wa.me/'+m+'?text='+encodeURIComponent(text)}
const telLink=m=>'tel:'+en(m).replace(/[^\d+]/g,'');
const visitsOf=pid=>D.visits.filter(v=>v.patientId===pid).sort((a,b)=>b.date.localeCompare(a.date)||b.serial-a.serial);
const due=v=>Math.max(0,(+v.fee||0)-(+v.paid||0));

/* ---------- icons ---------- */
const I={
 dash:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>',
 users:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14.6c2 .7 3.1 2.6 3.5 5.4"/></svg>',
 cal:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4.5" width="18" height="16" rx="2"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/></svg>',
 plus:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M12 5v14M5 12h14"/></svg>',
 money:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.6"/><path d="M6 9.5v5M18 9.5v5"/></svg>',
 gear:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
 search:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
 print:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M6 14h12v7H6z"/></svg>',
 wa:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.4.6-.4.4c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.2.1.7-.1 1.3z"/></svg>',
 phone:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/></svg>'
};
const PAGES=[['dash','ড্যাশবোর্ড',I.dash],['patients','রোগী তালিকা',I.users],['new','নতুন সাক্ষাৎ',I.plus],['appts','অ্যাপয়েন্টমেন্ট',I.cal],['money','হিসাব',I.money],['settings','সেটিংস',I.gear]];

/* ---------- router ---------- */
const pagePaths={dash:'/dashboard/',patients:'/patients/',patient:'/patient/',new:'/new-visit/',appts:'/appointments/',money:'/accounts/',settings:'/settings/'};
function pageStateFromUrl(){
 const path=location.pathname.replace(/\/+$/,'')||'/';
 const name=Object.keys(pagePaths).find(k=>pagePaths[k].replace(/\/+$/,'')===path);
 let found=name||'dash';const q=new URLSearchParams(location.search);
 if(found==='patient'&&!q.get('id'))found='patients';
 let p=null;
 if(found==='patient')p=q.get('id');
 if(found==='new'){
  const pid=q.get('patient'),appt=q.get('appointment');
  if(pid)p={pid};else if(appt)p={appt};
 }
 return {route:found,param:p};
}
const initialPage=pageStateFromUrl();
let route=initialPage.route,param=initialPage.param;
function pageHref(r,p){
 const url=new URL(pagePaths[r]||'/dashboard/',location.origin);
 if(r==='patient'&&p)url.searchParams.set('id',String(p));
 if(r==='new'&&p&&typeof p==='object'){
  if(p.pid)url.searchParams.set('patient',p.pid);
  if(p.appt)url.searchParams.set('appointment',p.appt);
 }
 return url.pathname+url.search;
}
function go(r,p){
 route=r;param=p??null;
 const href=pageHref(r,param);
 if(location.pathname+location.search!==href)history.pushState({route:r},'',href);
 render();window.scrollTo(0,0);
}
window.addEventListener('popstate',()=>{
 const state=pageStateFromUrl();route=state.route;param=state.param;render();
});
function navHTML(){
 $('#nav').innerHTML=PAGES.map(([k,t,i])=>`<a href="${pageHref(k)}" data-r="${k}" class="${route===k||(route==='patient'&&k==='patients')?'on':''}">${i}${t}</a>`).join('');
 $('#tabs').innerHTML=[['dash','হোম',I.dash],['patients','রোগী',I.users],['new','',I.plus],['appts','তারিখ',I.cal],['money','হিসাব',I.money]].map(([k,t,i])=>k==='new'?`<a href="${pageHref('new')}" data-r="new" class="add"><span class="c">${i}</span></a>`:`<a href="${pageHref(k)}" data-r="${k}" class="${route===k?'on':''}">${i}${t}</a>`).join('');
 document.querySelectorAll('[data-r]').forEach(a=>a.onclick=e=>{e.preventDefault();go(a.dataset.r)});
}
function render(){navHTML();const m=$('#main');({dash:pDash,patients:pPatients,patient:pPatient,new:pNew,appts:pAppts,money:pMoney,settings:pSettings}[route]||pDash)(m)}
