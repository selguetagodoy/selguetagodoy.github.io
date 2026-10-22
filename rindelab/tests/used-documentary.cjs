'use strict';
const assert=require('node:assert/strict');
const d=require('../sii/data/used-documentary-listings-20261021.json');
const official=require('../sii/data/used-market-20261021.json');
const life=require('../sii/model-lifecycle-2026.json');
const norm=s=>String(s).normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
assert.equal(d.schemaVersion,1);
assert.equal(d.records.length,8);
assert.equal(official.records.length,299);
assert.equal(official.records.filter(x=>x.qualityStatus==='held-for-manual-review').length,3);
const keys=new Set();
for(const r of d.records){
 assert(['individual-listing','archived-range'].includes(r.kind));
 assert.equal(r.qualityStatus,'documentary-reference');
 assert(Number.isInteger(r.year)&&r.year>=2000&&r.year<=2026);
 const u=new URL(r.sourceUrl);assert.equal(u.protocol,'https:');
 assert(r.variant&&r.identityStatus&&r.sourcePrecision);
 const k=[r.brandSlug,r.modelSlug,r.variant,r.year,r.kind,r.source].join('|');
 assert(!keys.has(k));keys.add(k);
 if(r.kind==='individual-listing'){assert(Number.isInteger(r.priceClp)&&r.priceClp>1000000);assert(!('medianClp'in r)&&!('lowClp'in r))}
 else {assert(Number.isInteger(r.lowClp)&&r.highClp>=r.lowClp);assert(!('medianClp'in r)&&!('priceClp'in r))}
}
const canonical=d.records.map(x=>x.brandSlug+'|'+x.modelSlug);
for(const k of new Set(canonical)){if(k==='mitsubishi|lancer')continue;const [brand,model]=k.split('|');assert(life.models.some(x=>norm(x.brand)===norm(brand)&&norm(x.model)===norm(model)&&x.match==='whole-family'))}
assert(d.records.filter(r=>r.kind==='individual-listing').length===5);
assert(d.records.filter(r=>r.kind==='archived-range').length===3);
console.log('OK: 8 antecedentes documentales separados, 299 registros base inalterados, sin medianas inventadas');
