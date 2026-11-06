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
  user:'admin',passHash:null,
  therapists:[{id:'t1',name:'পুরুষ থেরাপিস্ট',gender:'পুরুষ'},{id:'t2',name:'নারী থেরাপিস্ট',gender:'মহিলা'}],
  services:[{id:'s1',name:'ওয়েট কাপিং (সুন্নাহ হিজামা)',fee:1000},{id:'s2',name:'ড্রাই কাপিং',fee:600},{id:'s3',name:'মাথা ও ঘাড়ের হিজামা',fee:800}],
  defAdvice:'১–৩ দিন ���q�^