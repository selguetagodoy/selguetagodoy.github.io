/* RINDELAB: cotejo del suplemento verificado de 29 rangos de usados. */
'use strict';
const assert=require('node:assert/strict');
const data=require('../sii/data/used-market-20261021.json');
const ext=require('../sii/data/used-supplement-29-20261021.json');
const id=x=>[x.source,x.brandSlug,x.modelSlug,x.year].join('|');
assert.equal(ext.schemaVersion,1);
assert.equal(ext.baseline,270);
assert.equal(ext.additional,29);
assert.equal(ext.merged,299);
assert.equal(ext.records.length,29);
assert.equal(data.records.length,299);
assert.equal(data.records.filter(x=>!x.qualityStatus).length,296);
const seen=new Set(),rows=new Map(data.records.map(x=>[id(x),x]));
for(const x of ext.records){
 const key=id(x);
 assert(!seen.has(key),'Referencia repetida '+key);seen.add(key);
 assert.equal(x.source,'Autofact');
 assert(x.sourceUrl.startsWith('https://www.autofact.cl/valor-comercial-autos/'));
 assert(x.sourceUrl.endsWith('/'+x.brandSlug+'/'+x.modelSlug+'/'+x.year));
 assert(Number.isSafeInteger(x.lowClp)&&Number.isSafeInteger(x.highClp)&&x.lowClp>1000000&&x.highClp>x.lowClp);
 assert.deepEqual(rows.get(key),x,'El valor publicado no coincide con la fuente del suplemento');
}
const anomalies=data.records.filter(x=>x.qualityStatus==='held-for-manual-review');
assert.deepEqual(anomalies.map(x=>x.brandSlug+'|'+x.modelSlug+'|'+x.year).sort(),[
 'audi|r8|2016','bmw|i8|2016','suzuki|kizashi|2015'
]);
const vel=rows.get('Autofact|hyundai|veloster|2015');
assert.equal(vel.sourceUrl,'https://www.autofact.cl/valor-comercial-autos/hyundai/veloster/2015');
console.log('PASS 299 entradas documentadas, 296 visibles, 29 fuentes complementarias, 3 anomalías retenidas');
