/* Sunamganj address directory. Curated from the supplied upazila, union, mohalla and village lists.
   English spellings are SEARCH ALIASES ONLY: saved/displayed addresses are always Bengali. */
(function(){
  'use strict';
  const district='সুনামগঞ্জ';
  const districtEnglish='Sunamganj';
  const upazilas=[
    ['সুনামগঞ্জ সদর','Sunamganj Sadar','রঙ্গারচর=Rangarchar|লক্ষণশ্রী=Lakshansree|কুরবাননগর=Kurbannagar|গৌরারং=Gourarang|মোহনপুর=Mohanpur|জাহাঙ্গীরনগর=Jahangirnagar|মোল্লাপাড়া=Mollapara|কাঠইর=Kathoir|সুরমা=Surma'],
    ['শান্তিগঞ্জ','Shantiganj','জয়কলস=Joykalash|পশ্চিম পাগলা=Pashchim Pagla|দরগাপাশা=Dargapasha|শিমুলবাঁক=Shimulbak|পূর্ব বীরগাঁও=Purba Birgaon|পশ্চিম বীরগাঁও=Pashchim Birgaon|পূর্ব পাগলা=Purba Pagla|পাথারিয়া=Patharia'],
    ['ছাতক','Chhatak','জাউয়াবাজার=Jauyabazar|ছাতক সদর=Chhatak Sadar|চরমহল্লা=Charmohalla|ছৈলা আফজলাবাদ=Chhaila Afzalabad|কালারুকা=Kalaruka|দোলারবাজার=Dolarbazar|খুরমা দক্ষিণ=Khurma Dakshin|খুরমা উত্তর=Khurma Uttar|সিংচাপইড়=Singchapair|গোবিন্দগঞ্জ সৈদেরগাঁও=Gobindaganj Syedpur|ভাতগাঁও=Bhatgaon|ইসলামপুর=Islampur|নোয়ারাই=Noarai'],
    ['জগন্নাথপুর','Jagannathpur','কলকলিয়া=Kolkolia|পাটলী=Patli|আশারকান্দি=Asharkandi|রানীগঞ্জ=Raniganj|মীরপুর=Mirpur|সৈয়দপুর শাহারপাড়া=Syedpur Shaharpara|পাইলগাঁও=Pailgaon|চিলাউড়া হলদিপুর=Chilaura Holdipur'],
    ['দোয়ারাবাজার','Dowarabazar','বাংলা বাজার=Bangla Bazar|মান্নারগাঁও=Mannargaon|নরসিংপুর=Narsingpur|দোহালিয়া=Dohalia|বোগলা বাজার=Bogla Bazar|পান্ডারগাঁও=Pandargaon|লক্ষীপুর=Laxmipur|দোয়ারা বাজার=Dowara Bazar|সুরমা=Surma'],
    ['বিশ্বম্ভরপুর','Bishwambarpur','সলুকাবাদ=Salukabad|পলাশ=Palash|ধনপুর=Dhanpur|ফতেপুর=Fatepur|বাদাঘাট (দক্ষিণ)=Badaghat Dakshin'],
    ['তাহিরপুর','Tahirpur','বড়দল উত্তর=Bardal Uttar|বাদাঘাট=Badaghat|শ্রীপুর উত্তর=Sreepur Uttar|তাহিরপুর সদর=Tahirpur Sadar|বড়দল দক্ষিণ=Bardal Dakshin|বালিজুরী=Balijuri|শ্রীপুর দক্ষিণ=Sreepur Dakshin'],
    ['জামালগঞ্জ','Jamalganj','ফেনারবাঁক=Fenarbak|জামালগঞ্জ সদর=Jamalganj Sadar|জামালগঞ্জ উত্তর=Jamalganj Uttar|বেহেলী=Beheli|সাচনা বাজার=Sachna Bazar|ভীমখালী=Bhimkhali'],
    ['দিরাই','Derai','দিরাই সরমঙ্গল=Derai Sarmangal|জগদল=Jagdal|রাজানগর=Rajanagar|ভাটিপাড়া=Bhatipara|রফিনগর=Rafinagar|চরনারচর=Charnarchar|তাড়ল=Tarol|করিমপুর=Karimpur|কুলঞ্জ=Kulanj'],
    ['শাল্লা','Sullah','হবিবপুর=Habibpur|শাল্লা=Sullah|বাহাড়া=Bahara|আটগাঁও=Atgaon'],
    ['ধর্মপাশা','Dharmapasha','পাইকরাটি=Paikurati|সেলবরষ=Selbaras|সুখাইড় রাজাপুর দক্ষিণ=Sukhair Rajapur Dakshin|সুখাইড় রাজাপুর উত্তর=Sukhair Rajapur Uttar|জয়শ্রী=Joyshree|ধর্মপাশা সদর=Dharmapasha Sadar'],
    ['মধ্যনগর','Madhyanagar','মধ্যনগর=Madhyanagar|চামরদানী=Chamardani|বংশীকুন্ডা উত্তর=Bangshikunda Uttar|বংশীকুন্ডা দক্ষিণ=Bangshikunda Dakshin']
  ];
  const neighborhoods='আরপিননগর=Arpinnagar|বনানীপাড়া=Bananipara|মল্লিকপুর=Mallikpur|ওয়েজখালী=Wezkhali|হাছননগর=Hasonnagar|নতুনপাড়া=Nutanpara|উকিলপাড়া=Ukilpara|ধোপাখালী=Dhopakhali|ষোলঘর=Sholaghar|তেঘড়িয়া=Tegharia|কালিপুর=Kalipur|নবীনগর=Nabinagar|জগন্নাথবাড়ি=Jagannathbari|ডিএস রোড এলাকা=DS Road|ষোলঘর মধ্যপাড়া=Sholaghar Madhyapara|কাজীর পয়েন্ট=Kazir Point|আলফাত স্কয়ার (ট্রাফিক পয়েন্ট)=Alfat Square Traffic Point|বিলপাড়=Bilpar|হাসন বসত=Hason Basat|লঞ্চঘাট এলাকা=Launch Ghat|পূর্ব ষোলঘর=Purba Sholaghar|পশ্চিম ষোলঘর=Pashchim Sholaghar|গাজীর দরগাহ=Gazir Dargah|মোক্তারপাড়া=Moktarpara|জুবিলী রোড এলাকা=Jubilee Road|বড়পাড়া=Barpara|কামারপাড়া=Kamarpara|মালিপাড়া=Malipara|জেলেপাড়া=Jelepara|সুলতানপুর=Sultanpur|অচিন্ত্যপুর=Achintyapur';
  const villages=[
    ['লক্ষণশ্রী','Lakshansree','লক্ষণশ্রী=Lakshansree|গোবিন্দপুর=Gobindapur|জানিগাঁও=Janigaon'],
    ['মোহনপুর','Mohanpur','মোহনপুর=Mohanpur|জয়নগর=Joynagar|নারায়ণপুর=Narayanpur'],
    ['সুরমা','Surma','মঈনপুর=Moinpur|ইব্রাহিমপুর=Ibrahimpur|সৈয়দপুর=Syedpur'],
    ['জাহাঙ্গীরনগর','Jahangirnagar','জাহাঙ্গীরনগর=Jahangirnagar|মঙ্গলকাটা=Mongalkata|ডলুরা=Dolura'],
    ['রঙ্গারচর','Rangarchar','রঙ্গারচর=Rangarchar|হরিনগর=Harinagar|বনগাঁও=Bongaon'],
    ['গৌরারং','Gourarang','গৌরারং=Gourarang|লালপুর=Lalpur|নিয়ামতপুর=Niamatpur'],
    ['মোল্লাপাড়া','Mollapara','মোল্লাপাড়া=Mollapara|জলালপুর=Jalalpur|আব্দুল্লাহপুর=Abdullapur'],
    ['কাঠইর','Kathoir','কাঠইর=Kathoir|কলাইয়া=Kalaiya|সখিপুর=Sokhipur'],
    ['কুরবাননগর','Kurbannagar','কুরবাননগর=Kurbannagar|মাইজবাড়ি=Maijbari|টিলগাঁও=Tilgaon']
  ];
  const overrides={
    'কাঠইর':'Kathoir|Khatir|Kathir|Kathair|Katir|Kathoír',
    'সুনামগঞ্জ':'Sunamganj|Sunamgonj|Sunamgong',
    'শাল্লা':'Sullah|Shalla|Shalla',
    'দিরাই':'Derai|Dirai',
    'বিশ্বম্ভরপুর':'Bishwambarpur|Bishambarpur',
    'লক্ষণশ্রী':'Lakshansree|Lakhansree|Lokkonsree',
    'ষোলঘর':'Sholaghar|Shologhor|Sholagor',
    'আরপিননগর':'Arpinnagar|Arpin Nagar',
    'মোক্তারপাড়া':'Moktarpara|Mukterpara',
    'জুবিলী রোড এলাকা':'Jubilee Road|Jubily Road'
  };
  const entries=[];
  const known=new Set();
  const readPairs=text=>text.split('|').map(part=>{
    const idx=part.indexOf('=');
    return idx<0?[part,part]:[part.slice(0,idx),part.slice(idx+1)];
  });
  function add(name,english,kind,upazila='',upazilaEnglish='',union='',unionEnglish=''){
    const value=[name,...(union&&name!==union?[union]:[]),...(upazila&&name!==upazila?[upazila]:[]),...(name!==district?[district]:[])].join(', ');
    const key=kind+'|'+value;
    if(known.has(key))return;
    known.add(key);
    const englishValue=[english,...(union&&english!==unionEnglish?[unionEnglish]:[]),...(upazila&&english!==upazilaEnglish?[upazilaEnglish]:[]),...(name!==district?[districtEnglish]:[])].join(', ');
    entries.push(Object.freeze({name,english,englishValue,aliases:Object.freeze((overrides[name]||'').split('|').filter(Boolean)),kind,upazila,union,value}));
  }
  add(district,districtEnglish,'জেলা');
  for(const [upazila,english,unions] of upazilas){
    add(upazila,english,'উপজেলা');
    for(const [name,roman] of readPairs(unions))add(name,roman,'ইউনিয়ন',upazila,english);
  }
  for(const [name,roman] of readPairs(neighborhoods))add(name,roman,'পাড়া/মহল্লা','সুনামগঞ্জ সদর','Sunamganj Sadar');
  for(const [union,romanUnion,names] of villages){
    for(const [name,roman] of readPairs(names)){
      if(name===union)continue;
      add(name,roman,'গ্রাম','সুনামগঞ্জ সদর','Sunamganj Sadar',union,romanUnion);
    }
  }
  window.AmanahAddressDirectory=Object.freeze({district,entries:Object.freeze(entries)});
})();