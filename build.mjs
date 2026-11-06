import {existsSync,mkdirSync,readFileSync,writeFileSync,copyFileSync,statSync} from 'node:fs';
import {dirname,join} from 'node:path';
const scripts=['core.js','pages/dashboard.js','pages/patients.js','pages/new-visit.js','pages/print.js','pages/appointments.js','pages/accounts.js','pages/settings.js','ui.js'];
const pages=['','dashboard','patients','patient','new-visit','appointments','accounts','settings'];
const assets=['public/pricing.js','public/cloud.js','public/readability.css','src/styles/app.css',...scripts.map(s=>'src/scripts/'+s),...pages.map(p=>join('src/pages',p,'index.html'))];
for(const file of assets)if(!existsSync(file))throw new Error('Missing Amanah asset: '+file);
const core=readFileSync('src/scripts/core.js','utf8');
const ui=readFileSync('src/scripts/ui.js','utf8');
if(!core.includes("KEY:'amanah_clinic_clean_v2'"))throw new Error('Expected isolated storage key');
if(core.includes("KEY:'amanah_clinic_v1'")||ui.includes('checkLogin')||ui.includes('amanah123'))throw new Error('Unsafe legacy authentication or data key');
if(!ui.includes('Cloud security module is loading'))throw new Error('Missing secure login fallback');
for(const script of scripts){
 const from='src/scripts/'+script,to='public/assets/js/'+script;
 mkdirSync(dirname(to),{recursive:true});copyFileSync(from,to);
}
mkdirSync('public/assets/css',{recursive:true});copyFileSync('src/styles/app.css','public/assets/css/app.css');
for(const f of ['bangla-1.woff2','bangla-2.woff2','bangla-3.woff2']){¶»§q«^