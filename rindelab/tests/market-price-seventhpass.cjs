'use strict';
const assert=require('node:assert/strict'),C=require('../sii/catalog-identity.js');
const a=require('../data/market-price-unresolved-after-sixthpass-20261022.json');
const b=require('../data/market-price-seventhpass-20261022.json');
const c=require('../data/market-price-unresolved-after-seventhpass-20261022.json');
const k=x=>C.norm(x.model)+'|'+x.homologationDate+'|'+x.homologationCodeSuffix;
assert.equal(a.records.length,193);assert.equal(b.baselinePending,193);
assert.equal(b.newFamilyReferences,11);assert.equal(b.totalWithReferences,390);
assert.equal(b.pendingAfter,182);assert.equal(c.records.length,182);assert.equal(c.withFamilyReferences,390);
assert.deepEqual(c.categoryCounts,{'unmatched-catalog':165,'expired-price-reference':14,'other-powertrain':3});
const originals=new Map(a.records.map(x=>[k(x),x])),seen=new Set();
for(const x of b.records){
 const id=k(x);assert(!seen.has(id));seen.add(id);assert(originals.has(id));
 assert.equal(x.priceAssignedTo3CV,false);
 assert.match(x.reference.sourceUrl,/^https:\/\//);
 assert(Number.isSafeInteger(x.reference.priceListClp)&&x.reference.priceListClp>0);
 assert(x.reference.commercialVersion);assert(x.reference.notes);
}
const find=name=>b.records.filter(x=>C.norm(x.model)===C.norm(name));
assert.equal(find('DFLM T5 EVO MT')[0].reference.priceListClp,15990000);
assert.equal(find('DFLM T5 EVO AT')[0].reference.priceListClp,19990000);
assert.equal(find('DFLM T5L 1.5T')[0].reference.priceListClp,14990000);
assert.equal(find('DFLM SX6 1.6L')[0].reference.priceListClp,11990000);
assert.equal(find('Dongfeng AEOLUS Y3 AT')[0].reference.priceListClp,12590000);
assert.equal(new Set([...seen,...c.records.map(k)]).size,193);
console.log('PASS séptimo cruce: 11 referencias CIDEF por familia, 390 con referencias, 182 abiertas y ninguna lista imputada a versión 3CV');
