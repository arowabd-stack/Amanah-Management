const assert=require('node:assert/strict');

(async()=>{
 const {conv}=await import('../src/scripts/phonetic-rules.mjs');
 const {grammarAutoFix}=await import('../src/scripts/phonetic-autofix.mjs');
 const {contextualWordFix}=await import('../src/scripts/phonetic-natural.mjs');
 function convert(text){
   return text.replace(/[A-Za-z]+/g,(w,i)=>contextualWordFix(w,text.slice(0,i))??grammarAutoFix(w)??conv(w)).replace(/এ আই(?=\s|$|[.,!?])/g,'এআই');
 }
 const input='amaderke keno eivabe asote hoil eiTa niye ki kew/keu kotha bolbana. ar ami chai sobaike niye ekta darun kichu korte tobe er jonno amake kichu korai lagbe. tar age zara ekkhono bose ache plij tara daRiye jan. ami kintu apnader kosto die chaina tobuo kosto hoye jacce apnader. kkhoma sundor drriShTite dekhben shobai. assalamuyalaikum';
 const expected='আমাদেরকে কেন এভাবে আসতে হইল এইটা নিয়ে কি কেউ/কেউ কথা বলবে না. আর আমি চাই সবাইকে নিয়ে একটা দারুণ কিছু করতে তবে এর জন্য আমাকে কিছু করাই লাগবে. তার আগে যারা এখনো বসে আছে প্লিজ তারা দাঁড়িয়ে যান. আমি কিন্তু আপনাদের কষ্ট দিয়ে চাই না তবুও কষ্ট হয়ে যাচ্ছে আপনাদের. ক্ষমা সুন্দর দৃষ্টিতে দেখবেন সবাই. আসসালামু আলাইকুম';
 assert.equal(convert(input),expected,'Full natural Banglish paragraph must convert correctly');

 const riverInput='bangladesher shobche boR nodir nam ki janO, asole amora chai shobai shob januk , er jonno amader koSHT kora lagt onek, kintu ekon e ai ese amader onek shohoj kore dilo. mashaalaah alhamdulillah, ami likhtechi bangla ridmik kiborD diye baT onek smuth mashallah aro apDeT lagbe tobe';
 const riverExpected='বাংলাদেশের সবচেয়ে বড় নদীর নাম কি জানো, আসলে আমরা চাই সবাই সব জানুক , এর জন্য আমাদের কষ্ট করা লাগত অনেক, কিন্তু এখন এআই এসে আমাদের অনেক সহজ করে দিলো. মাশাআল্লাহ আলহামদুলিল্লাহ, আমি লিখতেছি বাংলা রিদমিক কিবোর্ড দিয়ে বাট অনেক স্মুথ মাশাআল্লাহ আরও আপডেট লাগবে তবে';
 assert.equal(convert(riverInput),riverExpected,'Second real paragraph must be spelled naturally');
 const riverWords={
   bangladesher:'বাংলাদেশের',shobche:'সবচেয়ে',boR:'বড়',
   nodir:'নদীর',janO:'জানো',shob:'সব',koSHT:'কষ্ট',
   lagt:'লাগত',ekon:'এখন',e:'এ',ai:'আই',shohoj:'সহজ',
   dilo:'দিলো',mashaalaah:'মাশাআল্লাহ',alhamdulillah:'আলহামদুলিল্লাহ',
   likhtechi:'লিখতেছি',ridmik:'রিদমিক',kiborD:'কিবোর্ড',
   baT:'বাট',smuth:'স্মুথ',mashallah:'মাশাআল্লাহ',
   apDeT:'আপডেট',aro:'আরও'
 };
 for(const [roman,desired] of Object.entries(riverWords)){
   const got=grammarAutoFix(roman)??conv(roman);
   assert.equal(got,desired,'Real phrase token '+roman);
 }

 const highConfidence={
   amaderke:'আমাদেরকে',tomaderke:'তোমাদেরকে',
   sobaike:'সবাইকে',kew:'কেউ',keu:'কেউ',
   bolbana:'বলবে না',korbona:'করব না',parbona:'পারব না',
   chaina:'চাই না',janina:'জানি না',lagbena:'লাগবে না',
   eivabe:'এভাবে',ekta:'একটা',ekkono:'এখনো',ekkhono:'এখনো',
   darun:'দারুণ',kosto:'কষ্ট',koshto:'কষ্ট',
   die:'দিয়ে',jacce:'যাচ্ছে',dariye:'দাঁড়িয়ে',
   khoma:'ক্ষমা',kkhoma:'ক্ষমা',drrishtite:'দৃষ্টিতে',
   assalamuyalaikum:'আসসালামু আলাইকুম',
   bolchen:'বলছেন',korchen:'করছেন',hoyeche:'হয়েছে'
 };
 let pass=0;
 for(const [word,expectedWord] of Object.entries(highConfidence)){
   const actual=grammarAutoFix(word)??conv(word);
   assert.equal(actual,expectedWord,word);
   pass++;
 }
 // Ambiguous words should not get a guessed meaning outside context.
 assert.equal(contextualWordFix('jan',''),null);
 assert.equal(convert('jan'),'জান');
 assert.equal(convert('daRiye jan'),'দাঁড়িয়ে যান');
 // Personal-name spellings must still follow the user's source converter.
 for(const name of ['Masum','Parvej','Nur','Islam','Rahim','Jannat']){
  assert.equal(grammarAutoFix(name)??conv(name),conv(name),name);
 }
 // Existing original HTML's keymap is untouched.
 for(const [word,out] of Object.entries({caqqd:'চাঁদ',bZbohar:'ব্যবহার',somudro:'সমুদ্র',korrmo:'কর্ম'})){
   assert.equal(conv(word),out,word);
 }
 console.log('PASS 2 real Banglish paragraphs + '+pass+' prior and '+Object.keys(riverWords).length+' new word cases + source protections');
})().catch(e=>{console.error(e);process.exitCode=1});

