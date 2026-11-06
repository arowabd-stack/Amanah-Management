// Isolated browser regression: every request is fulfilled locally. No production API is called.
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const results = [];
const clone = value => JSON.parse(JSON.stringify(value));
const patient = {id:'qa-patient',name:'QA TEST PATIENT',mobile:'',sex:'পুরুষ',age:'30',address:'TEST ONLY'};
const appt = (extra={}) => ({id:'qa-appointment',patientId:patient.id,name:'',mobile:'',date:'2026-11-07',time:'10:00',service:'s1',therapist:'t1',note:'QA TEST ONLY',status:'pending',...extra});
const fixture = (mode='evening',appts=[appt()]) => ({
  settings:{center:'QA TEST CLINIC',address:'TEST ONLY',phone:'',therapists:[{id:'t1',name:'QA therapist',gender:'পুরুষ'}],services:[{id:'s1',name:'QA service',fee:0}],defAdvice:'',waTpl:'',apptReminderMode:mode},
  patients:[patient,{...patient,id:'qa-other',name:'OTHER TEST PATIENT'}],visits:[],appts,seq:0,mig1:1,_syncVersion:1
});
const artifacts = process.env.QA_ARTIFACTS || '/tmp/amanah-reminder-qa';
fs.mkdirSync(artifacts,{recursive:true});
let browser;
async function session({state=fixture(),now='2026-11-06T20:00:00+06:00',width=1440,timezoneId='Asia/Dhaka'}={}) {
  const context=await browser.newContext({viewport:{width,height:900},timezoneId});
  const page=await context.newPage();
  const api={state:clone(state),revision:'qa-1���q�^