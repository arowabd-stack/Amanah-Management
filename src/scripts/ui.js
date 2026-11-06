/* ================= MODAL / CONFIRM ================= */
function modal(h){$('#mbox').innerHTML=h;$('#modal').hidden=false}
function closeModal(){$('#modal').hidden=true}
$('#modal').onclick=e=>{if(e.target.id==='modal')closeModal()};
function confirmBox(msg,ok){modal(`<h3>নিশ্চিত করুন</h3><p>${msg}</p><div class="flex mt" style="justify-content:flex-end"><button class="btn" onclick="closeModal()">না</button><button class="btn pri" id="cf_ok">হ্যাঁ</button></div>`);$('#cf_ok').onclick=ok}

/* ================= LOGIN ================= */
async function hash(s){try{const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('amanah:'+s));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}catch(e){return 'p:'+s}}
function enter(){$('#login').hidden=true;$('#login').style.display='none';$('#shell').hidden=false;render()}
document.getElementById('loginForm').onsubmit=e=>{e.preventDefault();document.getElementById('lpErr').textContent='Cloud security module is loading. Please reload.'};
