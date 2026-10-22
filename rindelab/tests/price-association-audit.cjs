'use strict';
const assert=require('node:assert/strict'),C=require('../sii/catalog-identity.js');
const audit=require('../data/price-association-audit-20261022.json');
const prices=require('../sii/commercial-2026.json');
const categories=['family-price-undocumented-tech','unmatched-catalog','expired-price-reference','other-powertrain'];
assert.equal(audit.schemaVersion,1);
assert.equal(audit.asOf,'2026-10-22');
assert.equal(audit.records.length,572);
assert.equal(prices.length,1514);
assert.deepEqual(categories.map(k=>audit.records.filter(x=>x.category===k).length),[272,281,14,5]);
const keys=new Set();
for(const r of audit.records){
 assert(r.model&&r.brand&&r.family&&r.homologationTechnology);
 assert.match(r.homologationDate,/^202[56]-\d\d-\d\d$/);
 assert.match(r.homologationCodeSuffix,/^[A-Z0-9]{4}[MS][0-9]{2}-[A-Z0-9]$/i);
 assert(categories.includes(r.category));
 const key=C.norm(r.model)+'|'+r.homologationDate+'|'+r.homologationCodeSuffix;
 assert(!keys.has(key),'duplicated 3CV evidence '+key);
 keys.add(key);
 if(r.category==='family-price-undocumented-tech'){
  assert(r.sources.length>=1,'price family must cite source '+r.model);
  for(const s of r.sources){assert.match(s.url,/^https:\/\//);assert(s.commercialVersion);}
 }
}
const find=(name)=>audit.records.filter(x=>C.norm(x.model)===C.norm(name));
assert.equal(find('Volvo XC60 T8 AWD ULTRA')[0].category,'family-price-undocumented-tech');
assert.equal(find('Kia Seltos 1.5L GSL 6MT SP3')[0].category,'family-price-undocumented-tech');
assert.equal(find('Opel New Mokka Electric GS')[0].category,'expired-price-reference');
assert.equal(find('Geely EX5 eMi')[0].category,'other-powertrain');
console.log('PASS auditoría 3CV: 572 fichas distintas, 272 familia sin tecnología, 281 sin precio de familia, 14 expiradas, 5 otra motorización; ninguna asociación automática de importes');
