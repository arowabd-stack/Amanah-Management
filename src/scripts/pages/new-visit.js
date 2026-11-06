/* ================= NEW VISIT WIZARD ================= */
let W=null;
const STEPS=['রোগী','পরীক্ষা','প্রশ্ন','চিকিৎসা','পেমেন্ট','যাচাই'];
function blankVisit(){return{step:0,pid:null,np:{name:'',age:'',sex:'',mobile:'',address:''},date:today(),vitals:{bp:'',pulse:'',rbs:'',weight:'',temp:'',spo2:'',hb:''},ans:Array(15).fill(null),meds:'',service:D.settings.services[0]?.id||'',points:'',cups:'',therapist:'',advice:D.settings.defAdvice??'১–৩ দিন বিশ্রাম নিন, ভারী কাজ ও ব্যায়াম করবেন না। জায়গাটি পরিষ্কার ও শুকনো রাখুন, চুলকাবেন না। কুসুম গরম পানিতে গোসল করুন, প্রচুর পানি ও পুষ্টিকর খাবার খান।',nextDate:'',fee:D.settings.services[0]?.fee||0,paid:'',apptId:null}}
function pNew(m){
 if(!W||(param&&param.fresh!==false&&!W._keep)){W=blankVisit();if(param?.pid){W.pid=param.pid}if(param?.appt){const a=D.appts.find(x=>x.id===param.appt);if(a){W.apptId=a.id;W.pid=a.patientId;if(!a.patientId){W.np.name=a.name;W.np.mobile=a.mobile}W.service=a.service||W.service;W.therapist=a.therapist||'';W.fee=(D.settings.services.find(s=>s.id===W.service)||{}).fee||0}}W._keep=true;param=null}
 const s=W.step;
 const gaps=W._showGaps?wizardGaps():[];
 m.innerHTML=`<div class="top���q�^