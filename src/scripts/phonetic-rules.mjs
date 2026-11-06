/* EXACT phonetic conversion and suggestion rules extracted from the user's own
 * "with suggestion keyeboard index(1).html" (no name overrides, no Avro substitution).
 * Keep these routines unchanged; UI logic is in name-phonetic-entry.mjs. */
const V={o:['অ',''],a:['আ','া'],i:['ই','ি'],I:['ঈ','ী'],u:['উ','ু'],U:['ঊ','ূ'],e:['এ','ে'],OI:['ঐ','ৈ'],O:['ও','ো'],OU:['ঔ','ৌ'],rri:['ঋ','ৃ']};
const C={k:'ক',kh:'খ',g:'গ',gh:'ঘ',Ng:'ঙ',c:'চ',ch:'ছ',j:'জ',jh:'ঝ',NG:'ঞ',T:'ট',Th:'ঠ',D:'ড',Dh:'ঢ',N:'ণ',t:'ত',th:'থ',d:'দ',dh:'ধ',n:'ন',p:'প',f:'ফ',ph:'ফ',b:'ব',v:'ভ',bh:'ভ',m:'ম',z:'য',r:'র',l:'ল',S:'শ',sh:'শ',Sh:'ষ',s:'স',h:'হ',R:'ড়',Rh:'ঢ়',y:'য়',kkh:'ক্ষ',gg:'জ্ঞ',nj:'ঞ্জ',nc:'ঞ্চ'};
const M={ng:'ং',qq:'ঁ',TH:'ৎ'};
const TM={};
for(const k in V)TM[k]={t:'v',a:V[k][0],b:V[k][1]};
for(const k in C)TM[k]={t:'c',a:C[k]};
for(const k in M)TM[k]={t:'m',a:M[k]};
TM.hm={t:'e',a:'হ্ম'};TM.ShN={t:'e',a:'ষ্ণ'};
TM.hs={t:'hs'};TM.rr={t:'rr'};TM.w={t:'w'};TM.Z={t:'Z'};
['k','kh','g','gh','c','ch','p','f','ph','b','v','bh','m','l','h','kkh','gg','qq'].forEach(k=>{
  const cap=k[0].toUpperCase()+k.slice(1);
  [k.toUpperCase(),cap].forEach(x=>{if(!TM[x])TM[x]=TM[k]});
});
function conv(s){
  let out='',join=0,prev='s',i=0;
  while(i<s.length){
    let tk=null,L=0,key='';
    for(let n=3;n>=1;n--){const q=s.substr(i,n);if(TM[q]){tk=TM[q];L=n;key=q;break}}
    if(!tk){out+=s[i++];join=0;prev='s';continue}
    i+=L;
    switch(tk.t){
      case 'v':
        if(key==='o'){ if(prev!=='c'&&prev!=='m')out+='অ'; }
        else out+= prev==='c'?tk.b:tk.a;
        join=0;prev='v';break;
      case 'c':case 'e':{
        const y=(key==='y'||key==='z')&&join===1;
        if(y){out+='্য';join=0;prev='c';break}
        if(join===1)out+='্';
        out+=tk.a;join=(tk.t==='e'||key==='y'||key==='R'||key==='Rh')?0:1;prev='c';break}
      case 'm':out+=tk.a;join=0;prev='m';break;
      case 'hs':out+='্';if(!/[A-Za-z]/.test(s[i]||''))out+='\u200c';join=2;prev='m';break;
      case 'rr':out+='র্';join=2;prev='m';break;
      case 'w':out+='্ব';join=0;prev='c';break;
      case 'Z':out+='্য';join=0;prev='c';break;
    }
  }
  return out;
}
const DICT="আমি তুমি আপনি আমার তোমার আপনার আমরা তোমরা সে তারা কি কী কেন কোথায় কখন কীভাবে ভালো খারাপ বাংলা বাংলাদেশ ভাষা বাড়ি স্কুল কলেজ বন্ধু ভালোবাসা ধন্যবাদ শুভ সকাল রাত দিন আজ কাল এখন পরে আগে করছি করব করেছি করা হবে হয়েছে যাচ্ছি আসছি খাচ্ছি লিখছি লিখতে পড়তে দেখতে বলতে যেতে আসতে পারি পারব চাই লাগবে আছে নেই না হ্যাঁ ঠিক সুন্দর বড় ছোট নতুন পুরনো কাজ টাকা পানি খাবার ভাত মাছ মা বাবা ভাই বোন শিক্ষা শিক্ষক ছাত্র ছাত্রী বই কলম খাতা মোবাইল ফোন কম্পিউটার ইন্টারনেট অ্যাপ কীবোর্ড সমুদ্র নদী আকাশ চাঁদ সূর্য ফুল গাছ মানুষ দেশ শহর গ্রাম সময় জীবন স্বপ্ন আশা দুঃখ সুখ শান্তি স্বাধীনতা বিদ্যালয় বিশ্ববিদ্যালয় প্রশ্ন উত্তর সমস্যা সমাধান ব্যবহার ব্যবসা কর্ম ধর্ম রিদ্মিক".split(' ').concat(["বাংলাদেশি", "বাঙালি", "বাংলায়", "বাংলাতে", "ইংরেজি", "হিন্দি", "আরবি", "অনুবাদ", "লেখা", "লেখক", "কবিতা", "গল্প", "গান", "সিনেমা", "খেলা", "ফুটবল", "ক্রিকেট", "পরীক্ষা", "ফলাফল", "ভর্তি", "চাকরি", "অফিস", "বেতন", "বাজার", "দোকান", "দাম", "কম", "বেশি", "সব", "কিছু", "কেউ", "কেউ", "কোনো", "যদি", "কিন্তু", "এবং", "অথবা", "তাহলে", "কারণ", "জন্য", "সাথে", "সঙ্গে", "থেকে", "পর্যন্ত", "মধ্যে", "ভিতরে", "বাইরে", "উপরে", "নিচে", "সামনে", "পিছনে", "ডান", "বাম", "প্রথম", "দ্বিতীয়", "শেষ", "শুরু", "চলো", "চল", "এসো", "যাও", "যান", "আসুন", "বসুন", "দেখুন", "শুনুন", "বলুন", "লিখুন", "পড়ুন", "খাও", "খান", "ঘুম", "ঘুমাতে", "উঠতে", "বসতে", "হাসি", "কান্না", "রাগ", "ভয়", "লজ্জা", "গর্ব", "মন", "হৃদয়", "মাথা", "হাত", "পা", "চোখ", "মুখ", "নাক", "কান", "দাঁত", "শরীর", "স্বাস্থ্য", "ডাক্তার", "হাসপাতাল", "ওষুধ", "রোগ", "জ্বর", "সর্দি", "ব্যথা", "বৃষ্টি", "রোদ", "ঝড়", "শীত", "গ্রীষ্ম", "বর্ষা", "বসন্ত", "শরৎ", "হেমন্ত", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার", "শনিবার", "রবিবার", "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর", "এক", "দুই", "তিন", "চার", "পাঁচ", "ছয়", "সাত", "আট", "নয়", "দশ", "শত", "হাজার", "লক্ষ", "কোটি", "স্বাগতম", "দুঃখিত", "মাফ", "দয়া", "অনুগ্রহ", "সাহায্য", "বিশ্বাস", "সত্য", "মিথ্যা", "সম্পর্ক", "পরিবার", "আত্মীয়", "প্রতিবেশী", "শিশু", "ছেলে", "মেয়ে", "নারী", "পুরুষ", "বৃদ্ধ", "যুবক", "রাজা", "রানি", "সরকার", "নির্বাচন", "ভোট", "আইন", "বিচার", "অধিকার", "দায়িত্ব", "সংস্কৃতি", "ইতিহাস", "বিজ্ঞান", "গণিত", "প্রযুক্তি", "তথ্য", "খবর", "পত্রিকা", "ছবি", "ভিডিও", "গান্ধী", "রবীন্দ্রনাথ", "নজরুল", "পহেলা", "বৈশাখ", "ঈদ", "পূজা", "বড়দিন"]);
const skel=s=>s.replace(/[\u200c\u0981]/g,'').replace(/ী/g,'ি').replace(/ূ/g,'ু').replace(/ঈ/g,'ই').replace(/ঊ/g,'উ').replace(/ণ/g,'ন').replace(/[ষশ]/g,'স').replace(/য়/g,'য').replace(/ৎ/g,'ত').replace(/ড়/g,'র').replace(/ঢ়/g,'ঢ');
const stem=s=>skel(s).replace(/[ািুেোৈৌ]+$/,'');
const SW=[['ি','ী'],['ী','ি'],['ু','ূ'],['ূ','ু'],['ন','ণ'],['ণ','ন'],['স','শ'],['স','ষ'],['শ','স'],['শ','ষ'],['ষ','শ'],['জ','য'],['য','জ'],['ত','ৎ']];
const lev=(a,b)=>{const d=[...Array(b.length+1).keys()];for(let i=1;i<=a.length;i++){let p=d[0];d[0]=i;for(let j=1;j<=b.length;j++){const t=d[j];d[j]=Math.min(d[j]+1,d[j-1]+1,p+(a[i-1]===b[j-1]?0:1));p=t}}return d[b.length]};
function suggest(base){
  const k=skel(base),st=stem(base),r=[],seen=new Set([base]);
  const add=x=>{if(r.length<4&&!seen.has(x)){seen.add(x);r.push(x)}};
  const lim=k.length>=4?2:1;
  DICT.map(d=>{const dk=skel(d),pre=!!st&&dk.startsWith(st),dist=lev(dk,k);return{d,pre,dist,len:Math.abs(dk.length-k.length)}})
    .filter(x=>x.pre||x.dist<=lim)
    .sort((a,b)=>(b.pre-a.pre)||(a.dist-b.dist)||(a.len-b.len)).forEach(x=>add(x.d));
  if(r.length<2&&!DICT.includes(base))for(const [a,b] of [['ি','ী'],['ী','ি'],['ন','ণ'],['স','শ'],['শ','স']]){const i=base.indexOf(a);if(i>=0&&r.length<2)add(base.slice(0,i)+b+base.slice(i+a.length))}
  return r;
}
export {conv,suggest};
