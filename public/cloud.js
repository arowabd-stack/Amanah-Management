/* Amanah private cloud sync: authenticated, no silent overwrites, explicit first-device migration. */
(function(){
'use strict';
try{sessionStorage.removeItem('amanah_in')}catch(e){}
const Cloud={ready:false,revision:null,pending:null,busy:false,conflict:false,lastError:'',timer:null,lastWriteAt:0};
const overlayStyle=document.createElement('style');
overlayStyle.textContent='#amanahCloudBar{display:none;position:fixed;top:9px;right:12px;z-index:600;background:#fff;color:#23553c;border:1px solid #c9decf;box-shadow:0 3px 18px #071b102e;border-radius:12px;max-width:min(94vw,480px);padding:10px 13px;line-height:1.5;font:700 12px system-ui,"Noto Sans Bengali",sans-serif}#amanahCloudBar.show{display:block}#amanahCloudBar.error{border-color:#da6e55;background:#fff2ef;color:#7c362b}#amanahCloudBar button{cursor:pointer;background:#e6f3e9;border:1px solid #b6d6bd;border-radius:8px;padding:5px 7px;margin-left:6px;font-size:11px;color:#1d5939}#amanahCloudBar.error button{background:#fff}#amanahCloudBar .actions{display:flex;flex-wrap:wrap;gap:4px;margin-top:7px}@media(max-width:700px){#amanahCloudBar{top:auto;bottom:72px;right:8px;left:8px;max-width:none}}@media print{#amanahCloudBar{display:none!important}}';
document.head.appendChild(overlayStyle);
const bar=document.createElement('div');bar.id='amanahCloudBar';bar.setAttribute('role','status');bar.setAttribute('aria-live','polite');
bar.innerHTML='<span id="cloudStatusText">Cloud Sync</span><div class="actions"><button type="button" id="cloudRetry" hidden>আবার Save</button><button type="button" id="cloudBackup" hidden>ব্যাকআপ ডাউনলোড</button><button type="button" id="cloudReload" hidden>Cloud থেকে Reload</button></div>';
document.body.appendChild(bar);
const msg=document.getElementById('cloudStatusText'),retry=document.getElementById('cloudRetry'),backup=document.getElementById('cloudBackup'),reload=document.getElementById('cloudReload');
function badge(status,error,actions){
 bar.className='show'+(error?' error':'');
 msg.textContent=status;
 retry.hidden=!(actions&&actions.retry);
 backup.hidden=!(actions&&actions.backup);
 reload.hidden=!(actions&&actions.reload);
}
function countLocal(d){return (d?.patients?.length||0)+(d?.visits?.length||0)+(d?.appts?.length||0)}
function saveBackup(d,filename){
 const blob=new Blob([JSON.stringify(d,null,2)],{type:'application/json;charset=utf-8'});
 const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename||('amanah-local-backup-'+today()+'.json');
 document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(url);a.remove()},1000);
}
function loginView(message){
 Cloud.ready=false;
 const login=$('#login');const shell=$('#shell');
 if(shell)shell.hidden=true;
 if(login){login.hidden=false;login.style.display='';}
 const pw=$('#lpPass');if(pw)pw.placeholder='Cloud Admin Password';
 const err=$('#lpErr');if(err)err.textContent=message||'';
 badge('নিরাপদ Cloud Login প্রয়োজন',false,{});
}
async function fetchJson(url,options){
 const r=await fetch(url,Object.assign({credentials:'same-origin',cache:'no-store',headers:{Accept:'application/json'}},options||{}));
 let out;try{out=await r.json()}catch{throw Error('সার্ভার থেকে JSON পাওয়া যায়নি (HTTP '+r.status+')')}
 if(!r.ok){const e=new Error(out.error||'HTTP '+r.status);e.status=r.status;e.code=out.code;throw e}
 return out;
}
const localSave=Store.save.bind(Store);
Store.save=function(data){
 if(!Cloud.ready)return localSave(data);
 data._syncVersion=(Number(data._syncVersion)||0)+1;
 Cloud.pending=JSON.parse(JSON.stringify(data));
 badge('পরিবর্তন Cloud-এ Save হচ্ছে…',false,{});
 if(Cloud.conflict){badge('অন্য ডিভাইসের সঙ্গে পরিবর্তনের বিরোধ। Draft ব্যাকআপ নিয়ে Reload করুন।',true,{backup:true,reload:true});return false}
 clearTimeout(Cloud.timer);Cloud.timer=setTimeout(flush,250);
 return true;
};
const persist=()=>Cloud.ready&&Cloud.pending!==null;
async function flush(){
 if(!Cloud.ready||Cloud.busy||Cloud.conflict||!Cloud.pending)return;
 const snapshot=Cloud.pending;Cloud.pending=null;Cloud.busy=true;
 try{
  const out=await fetchJson('/api/clinic',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({state:snapshot,revision:Cloud.revision})});
  Cloud.revision=out.revision;Cloud.lastError='';Cloud.lastWriteAt=Date.now();
  badge('✓ সব পরিবর্তন Cloud-এ সংরক্ষিত',false,{});
 }catch(e){
  Cloud.pending=Cloud.pending||snapshot;
  Cloud.lastError=e.message;
  if(e.status===409){Cloud.conflict=true;badge('একই তথ্যের দুটি Save একসঙ্গে হয়েছে। ডেটা মুছে যায়নি। প্রথমে ব্যাকআপ ডাউনলোড করে তারপর Cloud Reload করুন।',true,{backup:true,reload:true})}
  else{badge('Cloud Save হয়নি: '+e.message,true,{retry:true,backup:true})}
 }finally{
  Cloud.busy=false;
  if(Cloud.pending&&!Cloud.conflict&&!Cloud.lastError){clearTimeout(Cloud.timer);Cloud.timer=setTimeout(flush,200)}
 }
}
retry.onclick=()=>{Cloud.lastError='';Cloud.conflict=false;flush()};
backup.onclick=()=>saveBackup(Cloud.pending||D,'amanah-unsynced-'+today()+'.json');
reload.onclick=async()=>{
 if((Cloud.pending||Cloud.conflict)&&!confirm('এখনকার Unsynced পরিবর্তন হারাতে পারে। আগে “ব্যাকআপ ডাউনলোড” করুন। তবুও Cloud থেকে নতুন ডেটা আনবে?'))return;
 try{
  badge('Cloud থেকে নতুন ডেটা আনা হচ্ছে…',false,{});
  const res=await fetchJson('/api/clinic');
  if(!res.state)throw Error('Cloud ডেটা এখনো তৈরি হয়নি');
  Cloud.pending=null;Cloud.conflict=false;Cloud.lastError='';Cloud.revision=res.revision;D=res.state;
  W=null;route='dash';param=null;render();
  badge('✓ Cloud-এর সাম্প্রতিক ডেটা লোড হয়েছে',false,{});
 }catch(e){badge('Cloud Reload ব্যর্থ: '+e.message,true,{retry:true,backup:true})}
};
window.addEventListener('beforeunload',e=>{
 if(Cloud.ready&&(Cloud.busy||Cloud.pending||Cloud.conflict)){e.preventDefault();e.returnValue=''}
});
async function pollCloud(){
 if(!Cloud.ready||Cloud.busy||Cloud.pending||Cloud.conflict||Cloud.lastError)return;
 try{
  const incoming=await fetchJson('/api/clinic');
  if(!incoming.state||incoming.revision===Cloud.revision)return;
  // Blob overwrite caches can briefly return an older ETag. Never restore older records over new work.
  if((Number(incoming.state._syncVersion)||0)<=(Number(D._syncVersion)||0))return;
  const modalOpen=!!(document.querySelector('#modal')&&!$('#modal').hidden);
  if(W||modalOpen){badge('অন্য ডিভাইসের নতুন ডেটা আছে। কাজ শেষ করে Cloud Reload করুন।',true,{reload:true,backup:true});return}
  Cloud.revision=incoming.revision;D=incoming.state;render();
  badge('✓ অন্য ডিভাইসের পরিবর্তন আপডেট হয়েছে',false,{});
 }catch(e){if(e.status===401)loginView('Session শেষ হয়েছে। আবার Login করুন।')}
}
async function cloudOpen(){
 badge('Private Cloud থেকে তথ্য যাচাই হচ্ছে…',false,{});
 let remote=await fetchJson('/api/clinic');
 if(remote.state){
  // Only clean v2 data is read. Legacy local data is not imported automatically.
  D=remote.state;Cloud.revision=remote.revision;
 }else{
  // Fresh start. Keep prior v1 browser records untouched, but completely separate.
  const fresh=JSON.parse(JSON.stringify(DEF));
  fresh._syncVersion=0;
  try{
   const uploaded=await fetchJson('/api/clinic',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({state:fresh,revision:null})});
   D=fresh;Cloud.revision=uploaded.revision;
  }catch(e){
   if(e.status!==409)throw e;
   // Another tab/device initialized v2 first; use it instead of showing a false conflict.
   remote=await fetchJson('/api/clinic');
   if(!remote.state)throw Error('Cloud data is being initialized. Try logging in again.');
   D=remote.state;Cloud.revision=remote.revision;
  }
 }
 Cloud.ready=true;Cloud.pending=null;Cloud.conflict=false;Cloud.lastError='';Cloud.lastWriteAt=Date.now();
 $('#login').hidden=true;$('#login').style.display='none';$('#shell').hidden=false;
 enter();
 badge('✓ Clean Cloud শুরু • রোগী ০ থেকে শুরু',false,{});
 if(!window.__amanahCloudPolling){window.__amanahCloudPolling=setInterval(pollCloud,20000)}
}
$('#loginForm').onsubmit=async e=>{
 e.preventDefault();
 const button=$('#loginForm button[type="submit"]');if(button)button.disabled=true;
 const err=$('#lpErr');err.textContent='নিরাপদ Cloud Login হচ্ছে…';
 try{
  await fetchJson('/api/session',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:$('#lpUser').value.trim(),password:$('#lpPass').value})});
  $('#lpPass').value='';await cloudOpen();
 }catch(ex){loginView(ex.message);badge('Login/Cloud ডেটা প্রস্তুত হয়নি: '+ex.message,true,{})}
 finally{if(button)button.disabled=false}
};
$('#logout').onclick=async()=>{try{await fetchJson('/api/session',{method:'DELETE',headers:{'Content-Type':'application/json'},body:'{}'})}catch(e){}location.reload()};
const prevSettings=pSettings;
pSettings=function(m){
 prevSettings(m);
 const n=$('#u_n');if(n){const card=n.closest('.card');if(card)card.innerHTML='<div class="h3">নিরাপদ Cloud Login</div><p class="price-note">রোগীর তথ্য এখন Private Cloud-এ থাকে এবং Server-side Admin Login দিয়ে সুরক্ষিত। পাসওয়ার্ড বদলাতে Vercel Environment-এর AMANAH_ADMIN_PASSWORD_HASH নিরাপদভাবে পরিবর্তন করতে হবে। আগের ব্রাউজার-ভিত্তিক password আর ব্যবহৃত হয় না।</p>';}
};
loginView('');
fetchJson('/api/session').then(s=>s.authenticated?cloudOpen():loginView('Cloud Admin Login করুন')).catch(e=>loginView('Cloud সংযোগ পাওয়া যাচ্ছে না: '+e.message));
})();