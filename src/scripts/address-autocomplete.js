/* Lightweight, accessible Bengali address autocomplete with English transliteration aliases. */
(function(){
 'use strict';
 const entries=window.AmanahAddressDirectory?.entries||[];
 if(!entries.length)return;
 const selector='#w_addr, #ep_addr';
 const bangla=value=>String(value??'').normalize('NFC').toLocaleLowerCase('bn').replace(/[\u200c\u200d]/g,'').replace(/\s+/g,' ').trim();
 const latin=value=>String(value??'').normalize('NFKD').toLowerCase().replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,'');
 const isLatin=value=>/[a-z]/i.test(value);
 const distanceAtMost=(a,b,limit)=>{
   if(Math.abs(a.length-b.length)>limit)return false;
   const row=Array.from({length:b.length+1},(_,i)=>i);
   for(let i=1;i<=a.length;i++){
     let previous=row[0];row[0]=i;let smallest=row[0];
     for(let j=1;j<=b.length;j++){
       const old=row[j];
       row[j]=Math.min(row[j]+1,row[j-1]+1,previous+(a[i-1]===b[j-1]?0:1));
       previous=old;smallest=Math.min(smallest,row[j]);
     }
     if(smallest>limit)return false;
   }
   return row[b.length]<=limit;
 };
 function score(item,query){
   const terms=String(query||'').trim().split(/[\s,]+/).filter(Boolean);
   if(!terms.length)return null;
   const native=bangla(item.name),whole=bangla(item.value);
   const romanNames=[item.english,...item.aliases].map(latin).filter(Boolean);
   const romanFull=latin(item.englishValue);
   let total=0;
   for(const term of terms){
     if(isLatin(term)){
       const key=latin(term);
       if(key.length<2)return null;
       if(romanNames.includes(key))total+=0;
       else if(romanNames.some(n=>n.startsWith(key)))total+=1;
       else if(romanNames.some(n=>n.includes(key)))total+=2;
       else if(romanFull.includes(key))total+=4;
       else if(key.length>=5&&romanNames.some(n=>distanceAtMost(n,key,key.length>=8?2:1)))total+=7;
       else return null;
     }else{
       const key=bangla(term);
       if(key.length<2)return null;
       if(native===key)total+=0;
       else if(native.startsWith(key))total+=1;
       else if(native.includes(key))total+=2;
       else if(whole.includes(key))total+=4;
       else return null;
     }
   }
   // Prefer names ahead of context-only hits; prefer locations over district-only context.
   const kinds={'পাড়া/মহল্লা':0,'ইউনিয়ন':1,'গ্রাম':2,'উপজেলা':3,'জেলা':4};
   return total*10+(kinds[item.kind]??5);
 }
 function suggest(query){
   if(String(query??'').trim().length<2)return [];
   return entries.map(item=>({item,rank:score(item,query)}))
     .filter(x=>x.rank!==null)
     .sort((a,b)=>a.rank-b.rank||a.item.name.length-b.item.name.length||a.item.value.localeCompare(b.item.value,'bn'))
     .slice(0,8).map(x=>x.item);
 }
 window.AmanahAddressSearch=Object.freeze({suggest});

 const dropdown=document.createElement('div');
 dropdown.className='amanah-address-options';
 dropdown.id='amanah-address-options';
 dropdown.setAttribute('role','listbox');
 dropdown.setAttribute('aria-label','ঠিকানার সাজেশন');
 dropdown.hidden=true;
 document.body.appendChild(dropdown);
 const wired=new WeakSet();
 let active=null,items=[],activeIndex=-1,selecting=false;

 function hide(){
   dropdown.hidden=true;
   dropdown.replaceChildren();
   items=[];activeIndex=-1;
   if(active){active.setAttribute('aria-expanded','false');active.removeAttribute('aria-activedescendant')}
 }
 function position(){
   if(dropdown.hidden||!active||!active.isConnected)return;
   const r=active.getBoundingClientRect();
   if(r.bottom<0||r.top>window.innerHeight){hide();return}
   const below=window.innerHeight-r.bottom-12,above=r.top-12;
   const upward=below<190&&above>below;
   const usable=Math.max(96,Math.min(304,(upward?above:below)-8));
   dropdown.style.maxHeight=usable+'px';
   const actual=Math.min(dropdown.scrollHeight,usable);
   dropdown.style.width=Math.min(Math.max(220,r.width),window.innerWidth-16)+'px';
   dropdown.style.left=Math.max(8,Math.min(r.left,window.innerWidth-8-dropdown.offsetWidth))+'px';
   dropdown.style.top=(upward?Math.max(8,r.top-actual-6):r.bottom+6)+'px';
 }
 function highlight(index){
   if(!items.length)return;
   activeIndex=(index+items.length)%items.length;
   dropdown.querySelectorAll('[role="option"]').forEach((node,i)=>{
     const selected=i===activeIndex;
     node.setAttribute('aria-selected',String(selected));
     if(selected){active?.setAttribute('aria-activedescendant',node.id);node.scrollIntoView({block:'nearest'})}
   });
 }
 function choose(item){
   if(!active||!active.isConnected)return;
   const input=active;
   selecting=true;
   input.value=item.value;
   input.dispatchEvent(new Event('input',{bubbles:true}));
   input.dispatchEvent(new Event('change',{bubbles:true}));
   selecting=false;
   hide();
   input.focus({preventScroll:true});
 }
 function update(){
   if(selecting||!active||!active.isConnected){hide();return}
   items=suggest(active.value);
   dropdown.replaceChildren();
   activeIndex=-1;
   if(!items.length){hide();return}
   items.forEach((item,i)=>{
     const node=document.createElement('button');
     node.type='button';node.className='amanah-address-option';
     node.id='amanah-address-option-'+i;
     node.setAttribute('role','option');
     node.setAttribute('aria-selected','false');
     const name=document.createElement('span');
     name.className='amanah-address-name';name.textContent=item.name;
     const hint=document.createElement('span');
     hint.className='amanah-address-hint';hint.textContent=item.value;
     const type=document.createElement('span');
     type.className='amanah-address-kind';type.textContent=item.kind;
     const label=document.createElement('span');
     label.className='amanah-address-label';label.append(name,hint);
     node.append(label,type);
     node.addEventListener('pointerdown',event=>event.preventDefault());
     node.addEventListener('click',()=>choose(item));
     dropdown.append(node);
   });
   dropdown.hidden=false;
   active.setAttribute('aria-expanded','true');
   position();
 }
 function attach(input){
   if(wired.has(input))return;
   wired.add(input);
   input.setAttribute('autocomplete','off');
   input.setAttribute('role','combobox');
   input.setAttribute('aria-autocomplete','list');
   input.setAttribute('aria-haspopup','listbox');
   input.setAttribute('aria-controls',dropdown.id);
   input.setAttribute('aria-expanded','false');
   if(!input.placeholder)input.placeholder='গ্রাম, ইউনিয়ন বা মহল্লা — বাংলা বা English';
   input.addEventListener('input',()=>{active=input;update()});
   input.addEventListener('keydown',event=>{
     if(event.key==='Escape'){if(!dropdown.hidden){event.preventDefault();hide()}return}
     if(event.key==='Tab'){hide();return}
     if(event.key==='ArrowDown'||event.key==='ArrowUp'){
       if(dropdown.hidden){active=input;update()}
       if(items.length){event.preventDefault();highlight(event.key==='ArrowDown'?activeIndex+1:activeIndex<0?items.length-1:activeIndex-1)}
       return;
     }
     if(event.key==='Enter'&&!dropdown.hidden&&activeIndex>=0){
       event.preventDefault();choose(items[activeIndex]);
     }
   });
 }
 document.addEventListener('focusin',event=>{
   if(event.target?.matches?.(selector)){
     const input=event.target;
     attach(input);
     active=input;update();
   }else if(!dropdown.contains(event.target)){hide();active=null}
 });
 document.addEventListener('pointerdown',event=>{
   if(!dropdown.contains(event.target)&&event.target!==active){hide();active=null}
 });
 window.addEventListener('resize',position);
 document.addEventListener('scroll',position,true);
})();