/* Validation: published used market values must never be presented as SII/transaction. */
'use strict';
const {strict:assert}=require('node:assert');
const data=require('../sii/data/used-market-20261021.json');
const life=require('../sii/model-lifecycle-2026.json');
const norm=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
assert.equal(data.schemaVersion,1);
assert.equal(data.records.length,270,'Los dos lotes comerciales deben conservar los 270 registros');
const rows=data.records,unique=new Set();const bySource={};
const held=rows.filter(r=>r.qualityStatus==='held-for-manual-review');
assert.deepEqual(held.map(r=>r.brandSlug+'|'+r.modelSlug+'|'+r.year).sort(),['audi|r8|2016','bmw|i8|2016','suzuki|kizashi|2015']);
assert(held.every(r=>r.qualityNote?.length>30));
assert.equal(rows.filter(r=>!r.qualityStatus).length,267);
for(const r of rows){
 const key=r.source+'|'+r.brandSlug+'|'+r.modelSlug+'|'+r.year;
 assert(!unique.has(key),'Duplicate source/model/year '+key);unique.add(key);
 assert(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(r.brandSlug)&&/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(r.modelSlug));
 assert(Number.isInteger(r.year)&&r.year>=2000&&r.year<=2026);
 assert.equal(r.observedAt,data.observedAt);
 const u=new URL(r.sourceUrl);
 assert.equal(u.protocol,'https:');
 assert(u.pathname.endsWith('/'+r.brandSlug+'/'+r.modelSlug+'/'+r.year));
 if(r.source==='AutoExplora'){
  assert.equal(u.hostname,'www.autoexplora.cl');
  assert(Number.isInteger(r.sampleSize)&&r.sampleSize>=5);
  assert(Number.isInteger(r.p10Clp)&&r.p10Clp>=1000000);
  assert(Number.isInteger(r.medianClp)&&r.medianClp>=r.p10Clp);
  assert(Number.isInteger(r.p90Clp)&&r.p90Clp>=r.medianClp);
  assert(!('lowClp' in r)&&!('highClp' in r),'Do not rebrand bands');
 }else{
  assert.equal(r.source,'Autofact');assert.equal(u.hostname,'www.autofact.cl');
  assert(r.lowClp>=1000000&&r.highClp<250000000&&(r.lowClp<r.highClp||(r.lowClp===r.highClp&&r.qualityStatus==='held-for-manual-review')),'Rango no fiable sin retención '+key);
  assert(!('medianClp' in r)&&!('sampleSize' in r),'Do not invent median/sample');
 }
 bySource[r.source]=(bySource[r.source]||0)+1;
}
assert(bySource.AutoExplora>=20);
assert(bySource.Autofact>=150);
const archived=new Set(life.models.filter(x=>x.match==='whole-family'&&x.status==='discontinued-cl').map(x=>norm(x.brand)+'|'+norm(x.model)));
const retired=rows.filter(x=>archived.has(norm(x.brandSlug)+'|'+norm(x.modelSlug)));
assert(retired.length>=110);
assert(rows.some(x=>x.brandSlug==='ford'&&x.modelSlug==='focus'&&x.year===2017&&x.source==='Autofact'));
assert(rows.some(x=>x.brandSlug==='toyota'&&x.modelSlug==='yaris'&&x.year===2022&&x.source==='AutoExplora'));
const families=new Set(rows.map(x=>x.brandSlug+'|'+x.modelSlug));
const years=new Set(rows.map(x=>x.brandSlug+'|'+x.modelSlug+'|'+x.year));
console.log('OK usados: '+rows.length+' observaciones, '+families.size+' familias, '+years.size+' modelo/año únicos, '+retired.length+' de familias retiradas · '+JSON.stringify(bySource));
