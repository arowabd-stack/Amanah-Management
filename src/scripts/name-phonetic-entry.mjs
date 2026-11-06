/*
 * Exact-output Bangla name editor for Amanah Center.
 * All ordinary words use conv() exactly as in the uploaded HTML.
 * Only an explicit whitelist of everyday grammar words receives auto-fix.
 * Suggestions still apply ONLY if the user selects one.
 */
import {conv,suggest} from './phonetic-rules.mjs';
import {grammarAutoFix} from './phonetic-autofix.mjs';
import {contextualWordFix} from './phonetic-natural.mjs';

(function(){
  'use strict';
  const selector='#w_name,#ep_name,#ap_name';
  const state=new WeakMap();
  const wired=new WeakSet();
  let emitting=false;
  let owner=null;
  let highlighted=-1;
  let options=[];

  const popup=document.createElement('div');
  popup.id='amanah-name-suggestions';
  popup.className='amanah-name-suggestions';
  popup.hidden=true;
  popup.setAttribute('role','listbox');
  popup.setAttribute('aria-label','বাংলা বানান সাজেশন');
  document.body.appendChild(popup);

  // This must be equivalent to the supplied HTML:
  // inp.value.split('\n').map(l=>l.replace(/[A-Za-z]+/g,cv)).join('\n')
  // when no explicit suggestion was selected.
  const renderedWord=(word,prefix='')=>contextualWordFix(word,prefix)??grammarAutoFix(word)??conv(word);
  // Only this explicit two-token acronym is joined; other word boundaries stay untouched.
  const normalizeKnownPhrase=line=>line.replace(/এ আই(?=\s|$|[.,!?])/g,'এআই');
  const convertText=text=>String(text).split('\n')
    .map(line=>normalizeKnownPhrase(line.replace(/[A-Za-z]+/g,
      (word,index)=>renderedWord(word,line.slice(0,index))))).join('\n');

  function emit(input){
    emitting=true;
    try{input.dispatchEvent(new Event('input',{bubbles:true}))}
    finally{emitting=false}
  }
  function stopSuggestions(){
    popup.hidden=true;
    popup.replaceChildren();
    highlighted=-1;
    options=[];
    owner?.setAttribute('aria-expanded','false');
    owner?.removeAttribute('aria-activedescendant');
  }
  function finishWord(input){
    const s=state.get(input);
    if(s)s.draft=null;
    stopSuggestions();
  }
  function draftAtCaret(input){
    const s=state.get(input),d=s?.draft;
    if(!s?.enabled||!d||input.selectionStart!==input.selectionEnd)return null;
    const end=d.start+d.rendered.length;
    if(input.selectionStart!==end||input.value.slice(d.start,end)!==d.rendered){
      finishWord(input);
      return null;
    }
    return d;
  }
  function position(){
    if(popup.hidden||!owner?.isConnected)return;
    const r=owner.getBoundingClientRect();
    const width=Math.min(Math.max(r.width,190),window.innerWidth-16);
    popup.style.width=width+'px';
    popup.style.left=Math.max(8,Math.min(r.left,window.innerWidth-width-8))+'px';
    const height=Math.min(popup.scrollHeight,190);
    const above=r.top>height+10&&window.innerHeight-r.bottom<height+15;
    popup.style.top=(above?Math.max(8,r.top-height-5):r.bottom+5)+'px';
  }
  function refresh(input){
    owner=input;
    const d=draftAtCaret(input);
    if(!d){stopSuggestions();return}
    const base=d.rendered; // Exactly conv(raw), unless the user explicitly selected a spelling.
    const alternative=suggest(conv(d.raw)).filter(value=>value!==base).slice(0,4);
    options=[base,...alternative];
    popup.replaceChildren();
    options.forEach((value,index)=>{
      const button=document.createElement('button');
      button.type='button';
      button.className='amanah-name-suggestion'+(index===0?' current':'');
      button.id='amanah-name-suggestion-'+index;
      button.setAttribute('role','option');
      button.setAttribute('aria-selected',String(index===0));
      // Text is always Bangla Unicode; no Roman input or English labels in suggestions.
      button.textContent=value;
      button.addEventListener('pointerdown',e=>e.preventDefault());
      button.addEventListener('click',()=>pick(input,index));
      popup.appendChild(button);
    });
    highlighted=-1;
    popup.hidden=false;
    input.setAttribute('aria-expanded','true');
    position();
  }
  function setHighlight(index){
    if(!options.length)return;
    highlighted=Math.max(-1,Math.min(options.length-2,index));
    popup.querySelectorAll('[role="option"]').forEach((el,i)=>{
      const on=i===highlighted+1;
      el.classList.toggle('highlight',on);
      el.setAttribute('aria-selected',String(on||(highlighted===-1&&i===0)));
      if(on)owner?.setAttribute('aria-activedescendant',el.id);
    });
  }
  function renderWord(input,start,end,raw){
    const s=state.get(input);
    const rendered=renderedWord(raw,input.value.slice(0,start)); // Exact conv() except high-confidence grammar/context.
    input.setRangeText(rendered,start,end,'end');
    s.draft=raw?{start,raw,rendered,selected:false}:null;
    emit(input);
    if(raw)refresh(input);else stopSuggestions();
  }
  function pick(input,index){
    const d=draftAtCaret(input);
    const value=options[index];
    if(!d||typeof value!=='string')return;
    input.setRangeText(value,d.start,d.start+d.rendered.length,'end');
    d.rendered=value;
    d.selected=(value!==renderedWord(d.raw,input.value.slice(0,d.start)));
    emit(input);
    stopSuggestions();
    input.focus({preventScroll:true});
  }
  function resetChoice(input){
    const d=draftAtCaret(input);
    if(!d)return;
    const original=renderedWord(d.raw,input.value.slice(0,d.start));
    input.setRangeText(original,d.start,d.start+d.rendered.length,'end');
    d.rendered=original;
    d.selected=false;
    emit(input);
    refresh(input);
  }
  function onBeforeInput(event){
    const input=event.target;
    if(!input?.matches?.(selector)||emitting||event.isComposing||!event.cancelable)return;
    setup(input);
    const s=state.get(input);
    if(!s.enabled||s.composing)return;
    const start=input.selectionStart,end=input.selectionEnd;
    if(start===null||end===null)return;

    if(event.inputType==='deleteContentBackward'){
      const d=draftAtCaret(input);
      if(!d)return;
      event.preventDefault();
      renderWord(input,d.start,end,d.raw.slice(0,-1));
      return;
    }
    if(event.inputType==='insertText'&&typeof event.data==='string'){
      const data=event.data;
      if(/^[A-Za-z]+$/.test(data)){
        const d=start===end?draftAtCaret(input):null;
        event.preventDefault();
        renderWord(input,d?d.start:start,end,(d?d.raw:'')+data);
        return;
      }
      if(/[A-Za-z]/.test(data)){
        event.preventDefault();
        input.setRangeText(convertText(data),start,end,'end');
        finishWord(input);
        emit(input);
        return;
      }
      // A space or punctuation commits the current word unchanged.
      // When the final two words are the Bangla spelling of 'e ai',
      // join that recognized acronym only after its word boundary.
      finishWord(input);
      if(start===end&&/[\s.,!?]/.test(data)&&input.value.slice(0,start).endsWith('এ আই')){
        input.setRangeText('এআই',start-4,start,'end');
        emit(input);
      }
      return;
    }
    if(event.inputType.startsWith('delete')||event.inputType.startsWith('insert'))finishWord(input);
  }
  function onPaste(event){
    const input=event.target;
    if(!input?.matches?.(selector))return;
    setup(input);
    if(!state.get(input).enabled)return;
    const pasted=event.clipboardData?.getData('text/plain');
    if(!pasted||!/[A-Za-z]/.test(pasted))return;
    const start=input.selectionStart,end=input.selectionEnd;
    if(start===null||end===null)return;
    event.preventDefault();
    input.setRangeText(convertText(pasted),start,end,'end');
    finishWord(input);
    emit(input);
  }
  function onNativeInput(event){
    const input=event.target;
    if(!input?.matches?.(selector)||emitting||event.isComposing||!event.isTrusted)return;
    setup(input);
    const s=state.get(input);
    if(!s.enabled||s.composing||input.selectionStart!==input.selectionEnd)return;
    const end=input.selectionStart;
    if(end===null)return;
    const match=/[A-Za-z]+$/.exec(input.value.slice(0,end));
    if(!match)return;
    const tail=match[0],d=s.draft;
    let start=end-tail.length,raw=tail;
    if(d&&d.start+d.rendered.length===start&&
       input.value.slice(d.start,start)===d.rendered){
      start=d.start;raw=d.raw+tail;
    }
    renderWord(input,start,end,raw);
  }
  function onKeydown(event){
    const input=event.target;
    if(!input?.matches?.(selector)||popup.hidden||!draftAtCaret(input))return;
    // Same optional selection as the attached HTML: arrows only highlight;
    // Enter, Numpad1..4 or click explicitly pick a suggestion; Numpad0 resets.
    if(/^Numpad[1-4]$/.test(event.code)){
      const i=Number(event.code.slice(-1));
      if(i<options.length){event.preventDefault();pick(input,i)}
      return;
    }
    if(event.code==='Numpad0'){
      event.preventDefault();resetChoice(input);return;
    }
    if(event.key==='ArrowRight'||event.key==='ArrowDown'){
      event.preventDefault();setHighlight(highlighted+1);
    }else if(event.key==='ArrowLeft'||event.key==='ArrowUp'){
      event.preventDefault();setHighlight(highlighted-1);
    }else if(event.key==='Enter'&&highlighted>=0){
      event.preventDefault();pick(input,highlighted+1);
    }else if(event.key==='Escape'){
      event.preventDefault();stopSuggestions();
    }else if(event.key==='Tab'||event.key==='Home'||event.key==='End'){
      finishWord(input);
    }
  }
  function setup(input){
    if(wired.has(input))return;
    wired.add(input);
    const s={enabled:true,draft:null,composing:false};
    state.set(input,s);
    input.setAttribute('autocomplete','off');
    input.setAttribute('aria-autocomplete','list');
    input.setAttribute('aria-controls',popup.id);
    input.setAttribute('aria-expanded','false');
    const toggle=document.createElement('button');
    toggle.type='button';
    toggle.className='amanah-name-mode';
    toggle.setAttribute('aria-pressed','true');
    toggle.textContent='বাংলা টাইপিং: চালু';
    toggle.addEventListener('click',()=>{
      finishWord(input);
      s.enabled=!s.enabled;
      toggle.setAttribute('aria-pressed',String(s.enabled));
      toggle.textContent=s.enabled?'বাংলা টাইপিং: চালু':'বাংলা টাইপিং: বন্ধ';
      input.focus({preventScroll:true});
    });
    input.insertAdjacentElement('afterend',toggle);
    input.addEventListener('compositionstart',()=>{s.composing=true;finishWord(input)});
    input.addEventListener('compositionend',()=>{
      s.composing=false;
      if(!s.enabled)return;
      const end=input.selectionStart;
      if(end!==null&&end===input.selectionEnd){
        const m=/[A-Za-z]+$/.exec(input.value.slice(0,end));
        if(m)renderWord(input,end-m[0].length,end,m[0]);
      }
    });
    input.addEventListener('blur',()=>finishWord(input));
  }
  document.addEventListener('focusin',event=>{
    if(event.target?.matches?.(selector)){setup(event.target);owner=event.target}
    else if(!popup.contains(event.target))stopSuggestions();
  });
  document.addEventListener('beforeinput',onBeforeInput,true);
  document.addEventListener('paste',onPaste,true);
  document.addEventListener('input',onNativeInput);
  document.addEventListener('keydown',onKeydown,true);
  document.addEventListener('scroll',()=>{if(!popup.hidden)position()},true);
  window.addEventListener('resize',()=>{if(!popup.hidden)position()});
  window.AmanahNamePhonetic=Object.freeze({conv,suggest,grammarAutoFix,renderedWord,convertText});
})();
