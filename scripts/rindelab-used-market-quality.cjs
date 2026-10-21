/* RINDELAB · validar precios usados sin estimaciones ni falsos vínculos tributarios. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const base=JSON.parse(fs.readFileSync(path.join(root,'rindelab/sii/data/used-market-20261021.json'),'utf8'));
const lifecycle=JSON.parse(fs.readFileSync(path.join(root,'rindelab/sii/data/used-discontinued-families-20261021.json'),'utf8'));
const sii=JSON.parse(fs.readFileSync(path.join(root,'rindelab/sii/data/index.json'),'utf8'));
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const discontinued=new Set(lifecycle.records.map(x=>norm(x.brand)+'|'+norm(x.family)));
assert.equal(base.schemaVersion,1);assert(base.records.length>=160);
assert.equal(lifecycle.records.length,65);
assert.equal(sii.records,81697,'La base tributaria SII no debe desaparecer ni mezclarse');
const entries=new Set(),held=[];
for(const x of base.records){
 const key=[x.source,x.brandSlug,x.modelSlug,x.year].join('|');
 assert(!entries.has(key),'Registro duplicado '+key);
 entries.add(key);
 assert(x.year>=1980&&x.year<=2026,'Año imposible '+key);
 assert.equal(x.observedAt,'2026-10-21','Corte no documentado '+key);
 assert(['AutoExplora','Autofact'].includes(x.source),'Fuente no admitida');
 const url=new URL(x.sourceUrl);
 assert.equal(url.protocol,'https:');
 assert.equal(url.hostname,x.source==='Autofact'?'www.autofact.cl':'www.autoexplora.cl');
 assert(url.pathname.endsWith('/'+x.brandSlug+'/'+x.modelSlug+'/'+x.year));
 if(x.source==='AutoExplora'){
  assert(x.sampleSize>=5,'Mediana sin muestra mínima '+key);
  assert(Number.isInteger(x.medianClp)&&x.medianClp>=1000000);
  assert(Number.isInteger(x.p10Clp)&&Number.isInteger(x.p90Clp));
  assert(x.p10Clp<=x.medianClp&&x.medianClp<=x.p90Clp);
  assert(x.lowClp===undefined&&x.highClp===undefined,'No extrapolar extremos');
 }else{
  assert(Number.isInteger(x.lowClp)&&Number.isInteger(x.highClp));
  assert(x.lowClp>=1000000&&x.highClp>=x.lowClp);
  assert(x.medianClp===undefined&&x.sampleSize===undefined,'No inventar mediana o n del rango Autofact');
 }
 if(x.qualityStatus){assert.equal(x.qualityStatus,'held-for-manual-review');assert(x.qualityNote);held.push(key);}
}
const expectedHold=['Autofact|audi|r8|2016','Autofact|bmw|i8|2016'];
assert.deepEqual(held.sort(),expectedHold.sort(),'Rangos bajo revisión deben permanecer excluidos');
const shown=base.records.filter(x=>!x.qualityStatus),covered=new Set(shown.map(x=>norm(x.brandSlug.replace(/-/g,' '))+'|'+norm(x.modelSlug.replace(/-/g,' '))).filter(x=>discontinued.has(x)));
const html=fs.readFileSync(path.join(root,'rindelab/usados.html'),'utf8');
const js=fs.readFileSync(path.join(root,'rindelab/usados.js'),'utf8');
const reader=fs.readFileSync(path.join(root,'rindelab/used-market.js'),'utf8');
assert(html.includes('id="usedOnlyDiscontinued"'));
assert(js.includes('RindelabUsed.discontinued'));
assert(reader.includes("qualityStatus!=='held-for-manual-review'"));
assert(reader.includes('used-discontinued-families-20261021.json'));
assert(shown.length>=160);
console.log(JSON.stringify({documented:base.records.length,published:shown.length,held:held.length,brands:new Set(shown.map(x=>x.brandSlug)).size,sourceCounts:{Autofact:base.records.filter(x=>x.source==='Autofact').length,AutoExplora:base.records.filter(x=>x.source==='AutoExplora').length},publishedDiscontinuedFamilies:covered.size,lifecycleWholeFamily:discontinued.size},null,2));
