import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';

const source='Amanah Center - Rogi Management.html';
const target='public/index.html';
if(!existsSync(source) || statSync(source).size<100_000)throw new Error('Amanah source HTML missing or truncated');
for(const asset of ['public/pricing.js','public/cloud.js','public/readability.css'])if(!existsSync(asset))throw new Error('Missing clinic enhancement: '+asset);
let html=readFileSync(source,'utf8');
// Run the new clinic in a completely separate local namespace. The old v1 data is never auto-imported.
if(!html.includes("KEY:'amanah_clinic_v1'"))throw new Error('Legacy storage key missing');
html=html.replace("KEY:'amanah_clinic_v1'","KEY:'amanah_clinic_clean_v2'");
// Disable legacy browser-only authentication; the cloud client handles authenticated login.
const start=html.indexOf('async function checkLogin(');
const mid=html.indexOf('function enter(){',start);
if(start<0||mid<=start)throw new Error('Unable to find legacy login for secure replacement');
html=html.slice(0,start)+html.slice(mid);
const loginStart=html.indexOf("$('#loginForm').onsubmit=");
const loginEnd=html.indexOf('</script>',loginStart);
if(loginStart<0||loginEnd<=loginStart)throw new Error('Unable to disable legacy session login');
const safeFallback="document.getElementById('loginForm').onsubmit=e=>{e.preventDefault();document.getElementById('lpErr').textContent='Cloud security module is loading. Please reload.'};\n";
html=html.slice(0,loginStart)+safeFallback+html.slice(loginEnd);
html=html.replace('placeholder="প্রথমবার: amanah123"','placeholder="Cloud Admin Password"');
const injected='<script src="/pricing.js"></script>\n<script src="/cloud.js"></script>\n';
if(!html.includes('</body>'))throw new Error('Missing body end');
if(!html.includes('</head>'))throw new Error('Missing document head');
html=html.replace('</head>','<link rel="stylesheet" href="/readability.css">\n</head>');
html=html.replace('</body>',injected+'</body>');
if(html.includes("sessionStorage.getItem('amanah_in')")||html.includes('amanah123')||!html.includes('/cloud.js'))throw new Error('Unsafe legacy login survived build');
mkdirSync('public',{recursive:true});
writeFileSync(target,html,'utf8');
console.log('Amanah clinic secure cloud + cup pricing ready: '+statSync(target).size+' bytes');
