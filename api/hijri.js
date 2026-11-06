/* Bangladesh Hijri date from iHadis. Never silently substitute another calendar. */
'use strict';

const SOURCE='https://ihadis.com/en/calendar/bangladesh/islamic-date-today';
const MONTHS=new Map([
 ['muharram',1],['safar',2],
 ['rabialawwal',3],['rabiulawwal',3],['rabialthani',4],['rabialakhir',4],['rabiulakhir',4],
 ['jumadaalula',5],['jumadaalawwal',5],['jumadaula',5],['jumadaalakhirah',6],['jumadaalthani',6],['jumadaalakhir',6],
 ['rajab',7],['shaban',8],['ramadan',9],['shawwal',10],
 ['dhulqadah',11],['dhualqadah',11],['dhulqidah',11],['dhualqidah',11],
 ['dhulhijjah',12],['dhualhijjah',12]
]);
const GREGORIAN_MONTHS=new Map(['January','February','March','April','May','June','July','August','September','October','November','December'].map((name,i)=>[name.toLowerCase(),i+1]));
const pad=n=>String(n).padStart(2,'0');

function bangladeshDate(now=new Date()){
 const f=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Dhaka',day:'2-digit',month:'2-digit',year:'numeric'});
 const p=Object.fromEntries(f.formatToParts(now).map(x=>[x.type,x.value]));
 return p.year+'-'+p.month+'-'+p.day;
}
function parseIHadis(html){
 if(typeof html!=='string'||!html.length)throw Error('No iHadis content');
 // The page includes a dated FAQ entry in server-rendered structured content.
 const match=/Arabic date today in Bangladesh is\s+(\d{1,2})\s+([A-Za-z][A-Za-z'’\- ]{1,55}?)\s+(\d{4}),\s+corresponding to\s+([A-Za-z]+\s+\d{1,2},\s+\d{4})/i.exec(html);
 if(!match)throw Error('iHadis date format changed');
 const day=Number(match[1]),monthName=match[2].replace(/\s+/g,' ').trim(),year=Number(match[3]);
 const normalized=monthName.toLowerCase().replace(/[^a-z]/g,'');
 const month=MONTHS.get(normalized);
 if(!month||day<1||day>30||year<1400||year>1600)throw Error('Invalid iHadis Hijri date');
 const greg=/^([A-Za-z]+)\s+(\d{1,2}),\s+(\d{4})$/.exec(match[4].trim());
 if(!greg)throw Error('Invalid iHadis Gregorian date');
 const gm=GREGORIAN_MONTHS.get(greg[1].toLowerCase()),gd=Number(greg[2]),gy=Number(greg[3]);
 if(!gm||gd<1||gd>31||gy<2020||gy>2200)throw Error('Unrecognized iHadis Gregorian date');
 const utc=new Date(Date.UTC(gy,gm-1,gd));
 if(utc.getUTCFullYear()!==gy||utc.getUTCMonth()!==gm-1||utc.getUTCDate()!==gd)throw Error('Invalid Gregorian calendar date');
 return {date:gy+'-'+pad(gm)+'-'+pad(gd),hijri:{day,month,year,monthName}};
}

module.exports=async function handler(req,res){
 res.setHeader('Cache-Control','private, no-store, max-age=0');
 res.setHeader('X-Content-Type-Options','nosniff');
 if(req.method&&req.method!=='GET')return res.status(405).json({error:'method_not_allowed'});
 const today=bangladeshDate();
 try{
  const remote=await fetch(SOURCE,{headers:{'Accept':'text/html','User-Agent':'Mozilla/5.0 Amanah-Center-Hijri/1.0'},cache:'no-store',signal:AbortSignal.timeout(10000)});
  if(!remote.ok)throw Error('iHadis upstream HTTP '+remote.status);
  const size=Number(remote.headers.get('content-length')||0);
  if(size>1250000)throw Error('Unexpected iHadis response size');
  const html=await remote.text();
  if(html.length>1250000)throw Error('Unexpected iHadis response size');
  const result=parseIHadis(html);
  // The upstream or an intermediary can serve yesterday's cached HTML at midnight.
  if(result.date!==today)throw Error('iHadis date is not current for Bangladesh');
  return res.status(200).json({ok:true,source:'iHadis',sourceUrl:SOURCE,...result,checkedAt:new Date().toISOString()});
 }catch(error){
  console.warn('iHadis sync unavailable:',error?.message);
  // Fail closed: never tell users a different calculated date came from iHadis.
  return res.status(503).json({ok:false,source:'iHadis',sourceUrl:SOURCE,date:today,error:'source_unavailable'});
 }
};
module.exports.parseIHadis=parseIHadis;
module.exports.bangladeshDate=bangladeshDate;
