'use strict';
const assert=require('node:assert/strict');
const d=require('../data/photo-source-priority-20261022.json');
const cv=require('../data/catalog-coverage-20261021.json');
assert.equal(d.schemaVersion,1);
assert.equal(d.groups.length,cv.summary.withoutFamilyPhoto,'No atribuir cobertura falsa');
assert.equal(d.stats.missingGroups,432);
assert.equal(d.stats.withDirectChileanSource,d.groups.length);
assert(d.stats.uniqueDirectSources>=300);
const keys=new Set();
for(const g of d.groups){
 assert(g.key&&!keys.has(g.key),'Duplicados');keys.add(g.key);
 assert(g.versions>=1&&g.brand&&g.family);
 assert.equal(g.licenseStatus,'no_verificada');
 assert.equal(g.status,'busqueda_fotografica_pendiente');
 assert(g.sources.length>=1);
 for(const s of g.sources){
  const u=new URL(s.url);
  assert.equal(u.protocol,'https:');
  assert.equal(s.photoReuse,'sin_permiso_acreditado','URL comercial no es licencia');
  assert.equal(s.use,'identificacion_de_modelo');
 }
 for(const [k,u] of Object.entries(g.search)){
  assert(['openverse','autocosmos','chile'].includes(k));
  assert.equal(new URL(u).protocol,'https:');
 }
}
assert(d.groups.some(x=>x.brand.toLowerCase()==='mini'&&x.family.toLowerCase()==='cooper'&&x.sources.some(s=>s.domain==='portillosur.cl')));
const sum=d.groups.reduce((s,x)=>s+x.versions,0);
const top=d.groups[0];assert(top.versions>=10);
console.log('PASS: '+d.groups.length+' grupos con fichas chilenas; '+d.stats.uniqueDirectSources+' URL distintas; '+sum+' versiones en grupos pendientes, 0 licencias inventadas');
