import {existsSync,mkdirSync,readFileSync,writeFileSync,copyFileSync} from 'node:fs';
import {dirname,join} from 'node:path';
const scripts=['core.js','pages/dashboard.js','pages/patients.js','pages/new-visit.js','pages/print.js','pages/appointments.js','pages/accounts.js','pages/settings.js','ui.js','address-directory.js','address-autocomplete.js'];
const pages=['','dashboard','patients','patient','new-visit','appointments','accounts','settings'];
const assets=['public/pricing.js','public/cloud.js','public/readability.css','src/styles/app.css','src/styles/address-autocomplete.css',...scripts.map(s=>'src/scripts/'+s),...pages.map(p=>join('src/pages',p,'index.html'))];
for(const file of assets)if(!existsSync(file))throw new Error('Missing Amanah asset: '+file);
const core=readFileSync('src/scripts/core.js','utf8');
const ui=readFileSync('src/scripts/ui.js','utf8');
if(!core.includes("KEY:'amanah_clinic_clean_v2'"))throw new Error('Expected isolated storage key');
if(core.includes("KEY:'amanah_clinic_v1'")||ui.includes('checkLogin')||ui.includes('amanah123'))throw new Error('Unsafe legacy auth/data key');
if(!ui.includes('Cloud security module is loading'))throw new Error('Missing secure login fallback');
for(const script of scripts){
 const from='src/scripts/'+script,to='public/assets/js/'+script;
 mkdirSync(dirname(to),{recursive:true});copyFileSync(from,to);
}
mkdirSync('public/assets/css',{recursive:true});copyFileSync('src/styles/app.css','public/assets/css/app.css');
copyFileSync('src/styles/address-autocomplete.css','public/assets/css/address-autocomplete.css');
for(const name of pages){
 const from=join('src/pages',name,'index.html'),dest=join('public',name,'index.html');
 const html=readFileSync(from,'utf8');
 if(!html.includes('/cloud.js')||!html.includes('/assets/js/core.js')||!html.includes('/assets/css/app.css')||!html.includes('/assets/css/address-autocomplete.css')||!html.includes('/assets/js/address-autocomplete.js')||html.includes('amanah123'))throw new Error('Invalid page shell '+name);
 mkdirSync(dirname(dest),{recursive:true});writeFileSync(dest,html);
}
console.log('Amanah modular build: '+pages.length+' HTML entries, '+scripts.length+' JS modules, shared CSS');
