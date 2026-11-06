// The user's own Ridmik-style web prototype: vowel/consonant keymap, longest-match
// parsing, conjunct rules, exceptions, and Bangla-only spelling suggestions.
// Kept independent from any Android APK or third-party keyboard service.

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
export function conv(s){
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

const DICT="আমি তুমি আপনি আমার তোমার আপনার আমরা তোমরা সে তারা কি কী কেন কোথায় কখন কীভাবে ভালো খারাপ বাংলা বাংলাদেশ ভাষা বাড়ি স্কুল কলেজ বন্ধু ভালোবাসা ধন্যবাদ শুভ সকাল রাত দিন আজ কাল এখন পরে আগে করছি করব করেছি করা হবে হয়েছে যাচ্ছি আসছি খাচ্ছি লিখছি লিখতে পড়তে দেখতে বলতে যেতে আসতে পারি পারব চাই লাগবে আছে নেই না হ্যাঁ ঠিক সুন্দর বড় ছোট নতুন পুরনো কাজ টাকা পানি খাবার ভাত মাছ মা বাবা ভাই বোন শিক্ষা শিক্ষক ছাত্র ছাত্রী বই কলম খাতা মোবাইল ফোন কম্পিউটার ইন্টারনেট অ্যাপ কীবোর্ড সমুদ্র নদী আকাশ চাঁদ সূর্য ফুল গাছ মানুষ দেশ শহর গ্রাম সময় জীবন স্বপ্ন আশা দুঃখ সুখ শান্তি স্বাধীনতা বিদ্যালয় বিশ্ববিদ্যালয় প্রশ্ন উত্তর সমস্যা সমাধান ব্যবহার ব্যবসা কর্ম ধর্ম রিদ্মিক".split(' ');
const skel=s=>s.replace(/[\u200c\u0981]/g,'').replace(/ী/g,'ি').replace(/ূ/g,'ু').replace(/ঈ/g,'ই').replace(/ঊ/g,'উ').replace(/ণ/g,'ন').replace(/[ষশ]/g,'স').replace(/য়/g,'য').replace(/ৎ/g,'ত').replace(/ড়/g,'র').replace(/ঢ়/g,'ঢ');
const stem=s=>skel(s).replace(/[ািুেোৈৌ]+$/,'');
const SW=[['ি','ী'],['ী','ি'],['ু','ূ'],['ূ','ু'],['ন','ণ'],['ণ','ন'],['স','শ'],['স','ষ'],['শ','স'],['শ','ষ'],['ষ','শ'],['জ','য'],['য','জ'],['ত','ৎ']];
export function suggest(base){
  const st=stem(base),r=[],seen=new Set([base]);
  const add=x=>{if(r.length<4&&!seen.has(x)){seen.add(x);r.push(x)}};
  DICT.map(d=>[d,skel(d)]).filter(([d,k])=>st&&k.startsWith(st)).sort((a,b)=>Math.abs(a[1].length-skel(base).length)-Math.abs(b[1].length-skel(base).length)).forEach(([d])=>add(d));
  for(const [a,b] of SW){const i=a==='ত'?(base.endsWith('ত')?base.length-1:-1):base.indexOf(a);if(i>=0)add(base.slice(0,i)+b+base.slice(i+a.length))}
  return r;
}
