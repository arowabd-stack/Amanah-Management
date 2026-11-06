// Unit tests for parsing the public, dated iHadis HTML. No live network.
const assert=require('node:assert/strict');
const {parseIHadis,bangladeshDate}=require('../api/hijri');
const fixture=(day,month,year,greg)=>'<script type="application/ld+json">{"@type":"FAQPage","mainEntity":[{"acceptedAnswer":{"text":"Arabic date today in Bangladesh is '+day+' '+month+' '+year+', corresponding to '+greg+' in the Gregorian calendar."}}]}</script>';
const parsed=parseIHadis(fixture(25,'Jumada al-Ula',1448,'November 6, 2026'));
assert.deepEqual(parsed,{date:'2026-11-06',hijri:{day:25,month:5,year:1448,monthName:'Jumada al-Ula'}});
assert.equal(parseIHadis(fixture(1,'Ramadan',1448,'February 9, 2027')).hijri.month,9);
assert.equal(parseIHadis(fixture(15,'Shaban',1448,'January 24, 2027')).hijri.month,8);
assert.throws(()=>parseIHadis('<html>site unavailable</html>'),/format changed/);
assert.throws(()=>parseIHadis(fixture(31,'Ramadan',1448,'February 9, 2027')),/Invalid iHadis Hijri date/);
assert.throws(()=>parseIHadis(fixture(25,'FakeMonth',1448,'November 6, 2026')),/Invalid iHadis Hijri date/);
assert.throws(()=>parseIHadis(fixture(25,'Jumada al-Ula',1448,'February 30, 2027')),/Invalid Gregorian/);
assert.equal(bangladeshDate(new Date('2026-11-06T17:59:00Z')),'2026-11-06');
assert.equal(bangladeshDate(new Date('2026-11-06T18:01:00Z')),'2026-11-07');
console.log('PASS iHadis parser, strict validation, and Dhaka midnight');
