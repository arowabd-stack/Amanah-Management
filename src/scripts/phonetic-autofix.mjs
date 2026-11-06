/* Common conversational Banglish corrections.
 * This is a deliberately limited exception layer over the user's exact conv() engine.
 * Only whole Latin words match. Every other word uses conv() unchanged.
 * Do not map arbitrary phonetic chunks or patient names.
 */
import {naturalWordFix} from './phonetic-natural.mjs';

const stems=Object.freeze({
  bol:'বল', kor:'কর', dekh:'দেখ', likh:'লিখ', por:'পড়',
  shun:'শুন', bujh:'বুঝ', ash:'আস', thak:'থাক', shikh:'শিখ',
  khel:'খেল', dhor:'ধর', jan:'জান'
});
const suffixes=Object.freeze([
  ['chhilen','ছিলেন'],['chilen','ছিলেন'],['chhilam','ছিলাম'],
  ['chilam','ছিলাম'],['chhilo','ছিল'],['chilo','ছিল'],
  ['chhen','ছেন'],['chen','ছেন'],['cen','ছেন'],
  ['chhi','ছি'],['chi','ছি'],['ci','ছি'],
  ['chhe','ছে'],['che','ছে'],['ce','ছে'],
  ['ben','বেন'],['be','বে'],['bo','ব'],
  ['len','লেন'],['le','লে']
]);
const common=Object.freeze({
  bolcen:'বলছেন',bolchhen:'বলছেন',bolechen:'বলেছেন',bolesen:'বলেছেন',
  boleche:'বলেছে',bolese:'বলেছে',bollen:'বললেন',bollo:'বলল',
  korechen:'করেছেন',korechhen:'করেছেন',koreche:'করেছে',
  korcen:'করছেন',korchhen:'করছেন',korlen:'করলেন',korlo:'করল',
  dekhechen:'দেখেছেন',dekheche:'দেখেছে',
  likhechen:'লিখেছেন',likheche:'লিখেছে',
  shunechen:'শুনেছেন',shuneche:'শুনেছে',
  bujhechen:'বুঝেছেন',bujheche:'বুঝেছে',
  hoyeche:'হয়েছে',hoyechhe:'হয়েছে',hoyechen:'হয়েছেন',
  hoyechhen:'হয়েছেন',hoyni:'হয়নি',hoyeni:'হয়নি',
  hoche:'হচ্ছে',hochhe:'হচ্ছে',hocche:'হচ্ছে',
  hocchen:'হচ্ছেন',hochhen:'হচ্ছেন',
  ache:'আছে',achen:'আছেন',achhen:'আছেন',acchen:'আছেন',achi:'আছি',
  jacchen:'যাচ্ছেন',jachchen:'যাচ্ছেন',jachen:'যাচ্ছেন',
  jacchi:'যাচ্ছি',jachhi:'যাচ্ছি',jacche:'যাচ্ছে',
  jabo:'যাব',jabe:'যাবে',jaben:'যাবেন',
  aschen:'আসছেন',aschhen:'আসছেন',aschi:'আসছি',
  asche:'আসছে',asben:'আসবেন',asbo:'আসব',
  khacchen:'খাচ্ছেন',khachchen:'খাচ্ছেন',khacchi:'খাচ্ছি',
  khachhi:'খাচ্ছি',khacche:'খাচ্ছে',khabo:'খাব',
  khabe:'খাবে',khaben:'খাবেন',
  dicchen:'দিচ্ছেন',dicchi:'দিচ্ছি',dicche:'দিচ্ছে',
  diyechen:'দিয়েছেন',diyeche:'দিয়েছে',debo:'দেব',deben:'দেবেন',
  nichchen:'নিচ্ছেন',nicchi:'নিচ্ছি',nicche:'নিচ্ছে',
  niyechen:'নিয়েছেন',niyeche:'নিয়েছে',nebo:'নেব',neben:'নেবেন',
  pacchen:'পাচ্ছেন',pacchi:'পাচ্ছি',pacche:'পাচ্ছে',
  peyechen:'পেয়েছেন',peyeche:'পেয়েছে',peyechi:'পেয়েছি',
  pabo:'পাব',paben:'পাবেন',
  gechen:'গেছেন',geche:'গেছে',giyechen:'গিয়েছেন',
  giyechi:'গিয়েছি',giyeche:'গিয়েছে',gelam:'গেলাম',
  lagche:'লাগছে',lagbe:'লাগবে',
  bolte:'বলতে',korte:'করতে',dekhte:'দেখতে',likhte:'লিখতে',
  shunte:'শুনতে',bujhte:'বুঝতে',jete:'যেতে',
  onek:'অনেক',ektu:'একটু',eaktu:'একটু',
  kintu:'কিন্তু',jonno:'জন্য',janno:'জন্য',
  karon:'কারণ',ekhon:'এখন',tahole:'তাহলে',
  kivabe:'কীভাবে',kothay:'কোথায়',keno:'কেন',
  kemon:'কেমন',shomoy:'সময়',somoy:'সময়',
  sob:'সব',shob:'সব',sobai:'সবাই',shobai:'সবাই',
  amar:'আমার',amader:'আমাদের',apnar:'আপনার',apnader:'আপনাদের'
});
function grammarAutoFix(word){
  const raw=String(word||'');
  if(!/^[A-Za-z]+$/.test(raw))return null;
  const key=raw.toLowerCase();
  const natural=naturalWordFix(raw);
  if(natural!==null)return natural;
  if(Object.prototype.hasOwnProperty.call(common,key))return common[key];
  for(const [stem,bangla] of Object.entries(stems)){
    if(!key.startsWith(stem))continue;
    const ending=key.slice(stem.length);
    for(const [romanSuffix,banglaSuffix] of suffixes){
      if(ending===romanSuffix)return bangla+banglaSuffix;
    }
  }
  return null;
}
export {grammarAutoFix};
