/*
 * Common natural Banglish words typed in complete sentences.
 *
 * Use this as a conservative exception layer over the user's own conv() keymap.
 * No fuzzy auto-replacement: near matches are suggestion-only.
 * Mappings are whole words, so personal names and unfamiliar words keep the
 * original HTML output.
 */
const COMMON=Object.freeze({
  // Pronouns, particles, contractions and everyday connective words.
  amaderke:'আমাদেরকে',amader:'আমাদের',amake:'আমাকে',
  apnaderke:'আপনাদেরকে',apnader:'আপনাদের',apnake:'আপনাকে',
  tomader:'তোমাদের',tomaderke:'তোমাদেরকে',tomake:'তোমাকে',
  tader:'তাদের',taderke:'তাদেরকে',take:'তাকে',
  sobaike:'সবাইকে',shobaike:'সবাইকে',sobar:'সবার',shobar:'সবার',
  sobai:'সবাই',shobai:'সবাই',shobe:'সবে',
  amra:'আমরা',tomra:'তোমরা',apnara:'আপনারা',tara:'তারা',
  ora:'ওরা',oder:'ওদের',or:'ওর',ei:'এই',eita:'এইটা',
  eta:'এটা',ota:'ওটা',oita:'ওইটা',eikhan:'এখানে',ekhane:'এখানে',
  ekta:'একটা',akta:'একটা',ekti:'একটি',
  eivabe:'এভাবে',evabe:'এভাবে',eibhabe:'এভাবে',eibhabeo:'এভাবেও',
  oivabe:'ওইভাবে',seivabe:'সেইভাবে',
  aro:'আরও',ar:'আর',ebong:'এবং',othoba:'অথবা',tobe:'তবে',
  tobuo:'তবুও',tobu:'তবু',tai:'তাই',
  taile:'তাহলে',tahole:'তাহলে',nahole:'নাহলে',kintu:'কিন্তু',
  nah:'না',na:'না',nao:'নাও',ki:'কি',kie:'কী',
  keu:'কেউ',kew:'কেউ',keo:'কেউ',kau:'কেউ',kewo:'কেউ',
  ke:'কে',kake:'কাকে',karo:'কারও',karor:'কারও',kar:'কার',
  kara:'কারা',zara:'যারা',jara:'যারা',jarao:'যারাও',
  jake:'যাকে',jader:'যাদের',jaderke:'যাদেরকে',
  jate:'যাতে',jodi:'যদি',jokhon:'যখন',tokhon:'তখন',
  keno:'কেন',ken:'কেন',kivabe:'কীভাবে',kemne:'কেমনে',
  kemon:'কেমন',kothay:'কোথায়',kothae:'কোথায়',
  aaj:'আজ',aj:'আজ',kal:'কাল',goto:'গত',
  ekhon:'এখন',ekhono:'এখনো',ekkhono:'এখনো',
  ekhunu:'এখনো',ekkono:'এখনো',ekhoni:'এখনই',tokhono:'তখনো',
  er:'এর',etar:'এটার',etake:'এটাকে',
  khub:'খুব',onek:'অনেক',ektu:'একটু',eaktu:'একটু',
  jothesto:'যথেষ্ট',shotti:'সত্যি',sotti:'সত্যি',
  sob:'সব',shob:'সব',kichu:'কিছু',kisu:'কিছু',kishu:'কিছু',
  asole:'আসলে',ashole:'আসলে',obosshoi:'অবশ্যই',
  // Common words, places within conversation, and everyday public speaking.
  chai:'চাই',cai:'চাই',chay:'চায়',chaitesi:'চাইতেছি',
  chayni:'চায়নি',chaile:'চাইলে',chailam:'চাইলাম',
  chaitam:'চাইতাম',chaiten:'চাইতেন',
  asote:'আসতে',aste:'আসতে',asthe:'আসতে',asben:'আসবেন',
  hoilo:'হইলো',holo:'হলো',holoe:'হলো',
  bose:'বসে',boshe:'বসে',boseche:'বসেছে',bosheche:'বসেছে',
  darun:'দারুণ',daruun:'দারুণ',dharun:'দারুণ',
  daarie:'দাঁড়িয়ে',dariye:'দাঁড়িয়ে',
  dariyechen:'দাঁড়িয়েছেন',dariyechi:'দাঁড়িয়েছি',daran:'দাঁড়ান',
  plij:'প্লিজ',please:'প্লিজ',pls:'প্লিজ',
  kosto:'কষ্ট',koshto:'কষ্ট',
  koste:'কষ্টে',kostota:'কষ্টটা',kostogulo:'কষ্টগুলো',
  die:'দিয়ে',diye:'দিয়ে',dia:'দিয়ে',diyeo:'দিয়েও',
  hoye:'হয়ে',hoya:'হয়ে',hoyeo:'হয়েও',
  jacce:'যাচ্ছে',jacche:'যাচ্ছে',
  jacchhe:'যাচ্ছে',jacchen:'যাচ্ছেন',
  jacchi:'যাচ্ছি',jacchhi:'যাচ্ছি',
  sundor:'সুন্দর',shundor:'সুন্দর',sundoro:'সুন্দর',
  khoma:'ক্ষমা',kkhoma:'ক্ষমা',
  khomar:'ক্ষমার',khomashundor:'ক্ষমাসুন্দর',
  drriShti:'দৃষ্টি',drishti:'দৃষ্টি',dristi:'দৃষ্টি',
  drrishti:'দৃষ্টি',drrishtite:'দৃষ্টিতে',drishtite:'দৃষ্টিতে',
  drishtikon:'দৃষ্টিকোণ',
  dekhben:'দেখবেন',dekhbo:'দেখব',dekhba:'দেখবে',
  kotha:'কথা',kothao:'কোথাও',kothata:'কথাটা',
  bola:'বলা',bolar:'বলার',bolte:'বলতে',bolchen:'বলছেন',
  bolcen:'বলছেন',bolchheN:'বলছেন',
  korai:'করাই',koran:'করান',korano:'করানো',
  korte:'করতে',korar:'করার',korbe:'করবে',
  lagbe:'লাগবে',lagto:'লাগত',lagche:'লাগছে',
  onusthan:'অনুষ্ঠান',onuSthan:'অনুষ্ঠান',
  
  assalamuyalaikum:'আসসালামু আলাইকুম',
  assalamuualaikum:'আসসালামু আলাইকুম',
  assalamualaikum:'আসসালামু আলাইকুম',
  assalamualikum:'আসসালামু আলাইকুম',
  assalamualaikumwrwb:'আসসালামু আলাইকুম ওয়া রাহমাতুল্লাহি ওয়া বারাকাতুহু',
  walaykumussalam:'ওয়ালাইকুমুস সালাম',
  walaikumassalam:'ওয়ালাইকুমুস সালাম',
  alhamdulillah:'আলহামদুলিল্লাহ',inshaallah:'ইনশাআল্লাহ',
  insaallah:'ইনশাআল্লাহ',inshaAllah:'ইনশাআল্লাহ',
  mashallah:'মাশাআল্লাহ',
  // Strongly contextual short forms are deliberately excluded (e.g. 'jan').
});
// Whole-word exceptions learned from real, user-provided long-form typing.
const LONG_FORM=Object.freeze({
  shobche:'সবচেয়ে',sobche:'সবচেয়ে',shobcheye:'সবচেয়ে',
  sobcheye:'সবচেয়ে',shobcheo:'সবচেয়েও',
  nodi:'নদী',nodir:'নদীর',nodite:'নদীতে',
  bangladesh:'বাংলাদেশ',bangladesher:'বাংলাদেশের',
  shob:'সব',sob:'সব',
  januk:'জানুক',jano:'জানো',janen:'জানেন',
  asole:'আসলে',amora:'আমরা',
  kosht:'কষ্ট',koshto:'কষ্ট',kosto:'কষ্ট',
  koshtt:'কষ্ট',
  kora:'করা',kore:'করে',korar:'করার',
  lagt:'লাগত',lagto:'লাগত',lagchilo:'লাগছিল',
  ekon:'এখন',ekhone:'এখন',
  ai:'আই',e:'এ',ese:'এসে',
  shohoj:'সহজ',sohoj:'সহজ',shohoz:'সহজ',
  dilo:'দিলো',diloo:'দিলো',
  likhtechi:'লিখতেছি',likhtechhi:'লিখতেছি',likhtesi:'লিখতেছি',
  likhchi:'লিখছি',likhchhi:'লিখছি',
  ridmik:'রিদমিক',ridmikkeyboard:'রিদমিক কিবোর্ড',
  kibord:'কিবোর্ড',keyboard:'কিবোর্ড',
  bat:'বাট',but:'বাট',
  smuth:'স্মুথ',smooth:'স্মুথ',
  apdet:'আপডেট',update:'আপডেট',apdeyt:'আপডেট',
  mashaalaah:'মাশাআল্লাহ',mashaallah:'মাশাআল্লাহ',
  mashallah:'মাশাআল্লাহ',mashaallaah:'মাশাআল্লাহ',
  mashaaallah:'মাশাআল্লাহ',mashaalah:'মাশাআল্লাহ',
  alhamdulillah:'আলহামদুলিল্লাহ',alhamdullilah:'আলহামদুলিল্লাহ'
});

const FUTURES=Object.freeze({
  bolba:'বলবে',bolbe:'বলবে',bolbo:'বলব',bolben:'বলবেন',
  korba:'করবে',korbe:'করবে',korbo:'করব',korben:'করবেন',
  hobe:'হবে',hoy:'হয়',jabo:'যাব',jabe:'যাবে',
  jaben:'যাবেন',jete:'যেতে',
  parbo:'পারব',parbe:'পারবে',parben:'পারবেন',
  pabo:'পাব',pabe:'পাবে',paben:'পাবেন',
  jani:'জানি',bujhi:'বুঝি',chao:'চাও',chai:'চাই',
  dekhbo:'দেখব',dekha:'দেখা',
  lagbe:'লাগবে',aste:'আসতে',asbo:'আসব',
  dibo:'দেব',debo:'দেব',debe:'দেবে'
});
function naturalWordFix(word){
  if(!/^[A-Za-z]+$/.test(String(word||'')))return null;
  const lower=word.toLowerCase();
  if(Object.prototype.hasOwnProperty.call(LONG_FORM,lower))return LONG_FORM[lower];
  if(Object.prototype.hasOwnProperty.call(COMMON,lower))return COMMON[lower];
  // Regular pronoun accusative forms: e.g. amader+ke, tader+ke.
  const PRONOUNS={amar:'আমার',amader:'আমাদের',tomar:'তোমার',
    tomader:'তোমাদের',apnar:'আপনার',apnader:'আপনাদের',
    tar:'তার',tader:'তাদের',sobar:'সবার',shobar:'সবার',
    sobai:'সবাই',shobai:'সবাই'};
  if(lower.endsWith('ke')){
    const root=lower.slice(0,-2);
    if(Object.prototype.hasOwnProperty.call(PRONOUNS,root))return PRONOUNS[root]+'কে';
  }
  // High-confidence separated negatives: bolbana -> বলবে না, chaina -> চাই না.
  if(lower.endsWith('na')&&lower.length>=5){
    const root=lower.slice(0,-2);
    if(Object.prototype.hasOwnProperty.call(FUTURES,root))return FUTURES[root]+' না';
  }
  // Context-free forms not in the conservative lexicon keep the supplied
  // phonetic HTML's conv() output unchanged.
  return null;
}
function contextualWordFix(word,prefix=''){
  const key=String(word||'').toLowerCase();
  if((key==='jan'||key==='jaan') &&
     /(?:দাঁড়িয়ে|দাঁড়িয়ে|dariye|daarie)\s*$/iu.test(String(prefix||''))){
    return 'যান';
  }
  return null;
}
export {naturalWordFix,contextualWordFix};

