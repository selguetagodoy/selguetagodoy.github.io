'use strict';
const assert=require('node:assert/strict'),C=require('../sii/catalog-identity.js');
const baseline=require('../data/price-association-audit-20261022.json');
const followup=require('../data/market-price-followup-20261022.json');
assert.equal(baseline.schemaVersion,1);
assert.equal(baseline.records.length,572);
assert.equal(followup.schemaVersion,1);
assert.equal(followup.asOf,'2026-10-22');
assert.equal(followup.summary.auditedHomologations,572);
assert.equal(followup.summary.originallyUnmatchedWithOfficialPriceAndPowertrain,25);
assert.equal(followup.summary.originallyUnmatchedDealerOnlyRows,18);
assert.equal(followup.summary.originallyUnmatchedAnySeller,53);
assert.equal(followup.summary.originallyUnmatchedDealerPublishedPrice,1);
assert.equal(followup.sourceDealerRecords,465);
const keys=new Map(baseline.records.map(x=>[C.norm(x.model)+'|'+x.homologationDate+'|'+x.homologationCodeSuffix,x]));
const seen=new Set(),officialNew=[];
for(const x of followup.records){
 const k=C.norm(x.model)+'|'+x.homologationDate+'|'+x.homologationCodeSuffix;
 assert(!seen.has(k),'Duplicated evidence '+k);
 seen.add(k);
 const b=keys.get(k);assert(b,'Nonexistent 3CV code '+k);
 assert.equal(x.originalCategory,b.category);
 assert(x.reference||x.dealers.length>0);
 if(x.reference){
  assert.match(x.reference.url,/^https:\/\//);
  assert(x.reference.commercialVersion);
  assert(Number.isSafeInteger(x.reference.referencePriceClp)&&x.reference.referencePriceClp>0);
  assert(['lista','lista+IVA','desde','lista-vencida','lista-dealer','lista-septiembre'].includes(x.reference.priceType));
  if(['desde','lista-vencida','lista-dealer','lista-septiembre'].includes(x.reference.priceType))assert.equal(x.reference.samePowertrain,false,'Imprecise/expired source cannot be current comparable price');
  if(x.originalCategory==='unmatched-catalog'&&x.reference.samePowertrain)officialNew.push(x);
 }
 for(const d of x.dealers){
  assert.match(d.url,/^https:\/\//);
  assert(d.seller);
  assert(d.listPriceClp===null||Number.isSafeInteger(d.listPriceClp));
  assert([null,true,false].includes(d.taxIncluded));
 }
}
assert.equal(officialNew.length,25);
const find=name=>followup.records.filter(x=>C.norm(x.model)===C.norm(name));
assert.equal(find('BMW 330e Berlina')[0].reference.referencePriceClp,65900000);
assert.equal(find('Changan Hunter REEV ECE 4x2')[0].reference.referencePriceClp,32990000);
assert.equal(find('Changan Hunter REEV 4x4 ECE')[0].reference.referencePriceClp,36990000);
assert.equal(find('Volkswagen Amarok PA2 V6')[0].reference.priceType,'lista+IVA');
assert.equal(find('BMW M440i xDrive LCI II Gran Coupé')[0].reference.referencePriceClp,86900000);
assert.equal(find('BMW M440i xDrive LCI II Cabriolet')[0].reference.referencePriceClp,89900000);
assert(find('Toyota RAV4 2.5 PHEV AWD').every(x=>!x.reference||x.reference.samePowertrain===false),'Nunca trasladar precio HEV a la RAV4 PHEV');
assert.equal(find('Toyota BZ4X AWD BEV')[0].reference.priceType,'lista-vencida');
assert.equal(find('Audi New A5')[0].reference.priceType,'lista-vencida');
assert.equal(find('Gac GS4 MAX 1.5T AT GL')[0].reference.priceType,'desde');
const boxer=find('Peugeot Boxer SC Chasis CAB L4')[0];
assert.equal(boxer.reference,null);
assert.equal(boxer.dealers[0].listPriceClp,31390000);
assert.equal(boxer.dealers[0].taxIncluded,false);
console.log('PASS segundo chequeo: 25 referencias de misma tecnología con versión comercial pendiente; 1 precio dealer + IVA sin motor, 53 fichas antes no observadas con fuente comercial; ninguno se asigna por similitud al código 3CV.');
