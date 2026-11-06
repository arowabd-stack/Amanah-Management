/*
 * Amanah Center name input: phonetic Banglish -> Bangla Unicode.
 * The phonetic engine is @subhesadek/avro-phonetic (MPL-2.0), not extracted from Ridmik APK.
 * All conversion is local in the browser; no patient name is transmitted.
 */
import {toBangla} from '@subhesadek/avro-phonetic';

(function(){
  'use strict';
  const selector='#w_name,#ep_name,#ap_name';
  // Clinical name spellings: automatic corrections for frequent local names.
  // Staff can always edit the final Unicode Bangla text directly.
  const overrides=Object.freeze({
    masum:'মাসুম',parvej:'পারভেজ',parvez:'পারভেজ',parbeej:'পারভেজ',
    rahim:'রহিম',rohim:'রহিম',rahman:'রহমান',rohman:'রহমান',
    abdul:'আব্দুল',abdur:'আব্দুর',abdullah:'আব্দুল্লাহ',
    md:'মোঃ',moh:'মোঃ',mohammad:'মোহাম্মদ',mohammed:'মোহাম্মদ',muhammad:'মুহাম্মদ',
    mst:'মোছাঃ',most:'মোছাঃ',mostafa:'মোস্তফা',
    hossain:'হোসেন',hussain:'হোসেন',hosain:'হোসেন',hossen:'হোসেন',
    hosen:'হোসেন',hossein:'হোসেন',
    hasan:'হাসান',hasanul:'হাসানুল',hassan:'হাসান',
    husain:'হোসেন',sadia:'সাদিয়া',sadiya:'সাদিয়া',
    nur:'নুর',noor:'নূর',nure:'নূরে',islam:'ইসলাম',
    jannat:'জান্নাত',jannatul:'জান্নাতুল',ara:'আরা',
    fatema:'ফাতেমা',fatima:'ফাতিমা',fatem:'ফাতেমা',
    tanvir:'তানভীর',tanbir:'তানভীর',tanveer:'তানভীর',tania:'তানিয়া',
    siddique:'সিদ্দিক',siddiq:'সিদ্দিক',siddik:'সিদ্দিক',siddika:'সিদ্দিকা',
    ali:'আলী',aly:'আলী',alam:'আলম',alom:'আলম',
    sumon:'সুমন',suman:'সুমন',shuvo:'শুভ',shubho:'শুভ',
    sahadat:'শাহাদাত',shahadat:'শাহাদাত',shohag:'সোহাগ',sohag:'সোহাগ',
    sajib:'সজীব',sajeev:'সজীব',sojib:'সজীব',sajeeb:'সজীব',
    rubel:'রুবেল',mamun:'মামুন',mahmud:'মাহমুদ',mahmuda:'মাহমুদা',
    sharif:'শরীফ',shorif:'শরীফ',shariful:'শরীফুল',
    shafiq:'শফিক',shafiqul:'শফিকুল',shafik:'শফিক',
    kabir:'কবির',khan:'খান',khatun:'খাতুন',begum:'বেগম',
    molla:'মোল্লা',mullah:'মোল্লা',
    shahin:'শাহীন',shaheen:'শাহীন',shahjahan:'শাহজাহান',
    jahangir:'জাহাঙ্গীর',ziaur:'জিয়াউর',zia:'জিয়া',sultan:'সুলতান',
    amin:'আমিন',amina:'আমিনা',mim:'মিম',mina:'মিনা',
    salma:'সালমা',samiya:'সামিয়া',samia:'সামিয়া',
    robiul:'রবিউল',robi:'রবি',rakib:'রাকিব',rakiib:'রাকিব',
    rayhan:'রায়হান',raihan:'রায়হান',rakibul:'রাকিবুল',
    imran:'ইমরান',arif:'আরিফ',ariful:'আরিফুল',
    shihab:'শিহাব',nazmul:'নাজমুল',nazrul:'নজরুল',
    akter:'আক্তার',akhtar:'আখতার',aktera:'আক্তারা',
    sadnan:'সাদনান',sadman:'সাদমান',sajjad:'সাজ্জাদ'
  });

  function transliterateWord(raw){
    if(!/^[A-Za-z]+$/.test(raw))return raw;
    const lower=raw.toLowerCase();
    return overrides[lower]||toBangla(lower,{banglaDigits:false,banglaFullStop:false});
  }
  function transliterateText(text){
    return String(text).replace(/[A-Za-z]+/g,word=>transliterateWord(word));
  }
  const enabled=new WeakMap(),activeWord=new WeakMap(),attached=new WeakSet();
  let emitting=false;

  function notify(input){
    emitting=true;
    input.dispatchEvent(new Event('input',{bubbles:true}));
    emitting=false;
  }
  function renderPart(input,start,end,raw,remember){
    const bangla=transliterateText(raw);
    input.setRangeText(bangla,start,end,'end');
    if(remember&&/^[A-Za-z]+$/.test(raw)){
      activeWord.set(input,{start,raw,bangla});
    }else{
      activeWord.delete(input);
    }
    notify(input);
  }
  function validWord(input){
    const current=activeWord.get(input);
    if(!current||input.selectionStart===null||input.selectionStart!==input.selectionEnd)return null;
    const end=current.start+current.bangla.length;
    if(input.selectionStart!==end||input.value.slice(current.start,end)!==current.bangla){
      activeWord.delete(input);return null;
    }
    return current;
  }
  function handleBeforeInput(event){
    const input=event.target;
    if(!input?.matches?.(selector)||enabled.get(input)===false||event.isComposing||!event.cancelable||emitting)return;
    attach(input);
    const start=input.selectionStart,end=input.selectionEnd;
    if(start===null||end===null)return;

    if(event.inputType==='deleteContentBackward'){
      const current=validWord(input);
      if(!current||!current.raw.length)return;
      event.preventDefault();
      renderPart(input,current.start,start,current.raw.slice(0,-1),true);
      return;
    }

    if(event.inputType==='insertText' && typeof event.data==='string'){
      const data=event.data;
      if(/^[A-Za-z]+$/.test(data)){
        const current=validWord(input);
        const initial=current&&start===end?current.start:start;
        const raw=(current&&start===end?current.raw:'')+data;
        event.preventDefault();
        renderPart(input,initial,end,raw,true);
        return;
      }
      if(/[A-Za-z]/.test(data)&&data.length>1){
        event.preventDefault();
        renderPart(input,start,end,data,false);
        return;
      }
    }
    // On space, punctuation or cursor editing, finish the current word.
    activeWord.delete(input);
  }
  function handlePaste(event){
    const input=event.target;
    if(!input?.matches?.(selector)||enabled.get(input)===false)return;
    const text=event.clipboardData?.getData('text/plain');
    if(!text||!/[A-Za-z]/.test(text))return;
    const start=input.selectionStart,end=input.selectionEnd;
    if(start===null||end===null)return;
    event.preventDefault();
    renderPart(input,start,end,text,false);
  }
  function handleNativeInput(event){
    const input=event.target;
    if(!input?.matches?.(selector)||enabled.get(input)===false||event.isComposing||emitting||!event.isTrusted)return;
    // Fallback for mobile keyboards that emit non-cancellable beforeinput.
    const caret=input.selectionStart;
    if(caret===null||caret!==input.selectionEnd)return;
    const before=input.value.slice(0,caret);
    const match=/[A-Za-z]+$/.exec(before);
    if(!match)return;
    const current=activeWord.get(input);
    let raw=match[0],start=caret-raw.length,end=caret;
    if(current&&current.start+current.bangla.length===start){
      raw=current.raw+raw;
      start=current.start;
    }
    renderPart(input,start,end,raw,true);
  }
  function addToggle(input){
    if(input.dataset.phoneticSwitch)return;
    input.dataset.phoneticSwitch='1';
    const button=document.createElement('button');
    button.type='button';
    button.className='amanah-name-mode';
    button.setAttribute('aria-pressed','true');
    button.textContent='বাংলা টাইপিং: চালু';
    button.title='ইংরেজি অক্ষর লিখলে স্বয়ংক্রিয়ভাবে বাংলা হবে। বন্ধ করলে ইংরেজি সরাসরি লেখা যাবে।';
    button.addEventListener('click',()=>{
      const on=enabled.get(input)!==false;
      enabled.set(input,!on);
      activeWord.delete(input);
      button.setAttribute('aria-pressed',String(!on));
      button.textContent=!on?'বাংলা টাইপিং: চালু':'বাংলা টাইপিং: বন্ধ';
      input.focus({preventScroll:true});
    });
    input.insertAdjacentElement('afterend',button);
  }
  function attach(input){
    if(attached.has(input))return;
    attached.add(input);
    enabled.set(input,true);
    addToggle(input);
    input.addEventListener('compositionstart',()=>activeWord.delete(input));
    input.addEventListener('compositionend',()=>{
      const caret=input.selectionStart;
      if(caret!==null&&input.selectionEnd===caret){
        const match=/[A-Za-z]+$/.exec(input.value.slice(0,caret));
        if(match&&enabled.get(input)!==false){
          renderPart(input,caret-match[0].length,caret,match[0],true);
        }
      }
    });
    input.addEventListener('blur',()=>activeWord.delete(input));
  }
  document.addEventListener('focusin',e=>{
    const input=e.target;
    if(input?.matches?.(selector))attach(input);
  });
  document.addEventListener('beforeinput',handleBeforeInput,true);
  document.addEventListener('paste',handlePaste,true);
  document.addEventListener('input',handleNativeInput);
  window.AmanahNamePhonetic=Object.freeze({transliterate:transliterateText,transliterateWord});
})();

