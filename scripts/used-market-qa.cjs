/* QA precios usados, fuentes y cobertura histórica sin inferir generaciones. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),dataset=require('../rindelab/sii/data/used-market-20261021.json');
const lifecycle=require('../rindelab/sii/model-lifecycle-2026.json'),newBatch=require('../rindelab/sii/data/used-autofact-additions-20261021.json');
const normalize=x=>String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const id=(b,m)=>normalize(b)+'|'+normalize(m);
assert.equal(dataset.records.length,106);
assert.equal(newBatch.records.length,80);
assert.equal(lifecycle.models.length,90);
const urls=new Set(),pairs=new Set();
for(const rec of dataset.records){
 const doc=new URL(rec.sourceUrl);
 assert.equal(doc.protocol,'https:');
 assert(!urls.has(doc.href),'Duplicated URL '+doc.href);urls.add(doc.href);
 assert(Number.isInteger(rec.year)&&rec.year>=1980&&rec.year<=2026);
 const domain=rec.source==='Autofact'?'www.autofact.cl':'www.autoexplora.cl';
 assert.equal(doc.hostname,domain);
 if(rec.source==='Autofact'){
  assert(Number.isSafeInteger(rec.lowClp)&&Number.isSafeInteger(rec.highClp)&&rec.lowClp>0&&rec.lowClp<=rec.highClp);
  assert.equal(rec.scope,'approximate-published-range');
 }else{
  assert(Number.isSafeInteger(rec.medianClp)&&rec.sampleSize>=5);
  assert(rec.p10Clp<=rec.medianClp&&rec.medianClp<=rec.p90Clp,'Median outside p10–p90');
 }
 pairs.add(id(rec.brandSlug,rec.modelSlug));
}
const grouped=new Map();
for(const r of dataset.records){
 const key=id(r.brandSlug,r.modelSlug);if(!grouped.has(key))grouped.set(key,[]);
 grouped.get(key).push(r);
}
const amount=n=>n.toLocaleString('es-CL');
const rows=lifecycle.models.map((x,i)=>{
 const familyAllowed=x.match==='whole-family';
 const arr=familyAllowed?(grouped.get(id(x.brand,x.model))||[]):[];
 const latest=[...arr].sort((a,b)=>b.year-a.year||(a.source==='AutoExplora'?-1:1))[0]||null;
 const example=latest?(latest.source==='AutoExplora'?
  'Mediana $'+amount(latest.medianClp)+' ('+latest.year+')':
  'Rango $'+amount(latest.lowClp)+'–$'+amount(latest.highClp)+' ('+latest.year+')'):'Sin referencia';
 return {index:i+1,brand:x.brand,model:x.model,match:x.match,yearCount:new Set(arr.map(r=>r.year)).size,latest,example,status:x.status,statusUrl:x.sourceUrl};
});
const matched=rows.filter(x=>x.latest),unsafe=rows.filter(x=>x.match!=='whole-family');
const lines=[
 '# RINDELAB · Cobertura del mercado de autos usados (21-10-2026)','',
 '## Datos integrados','',
 '- 106 observaciones individuales por modelo/año/fuente, 20 de AutoExplora y 86 de Autofact, correspondientes a '+pairs.size+' denominaciones normalizadas de familia.',
 '- 80 observaciones Autofact añadidas en esta etapa y respaldadas por sus páginas individuales. Se examinaron también 14 candidatos que no entregaron un rango utilizable; no se incluyen como precios.',
 '- 90 modelos o generaciones con antecedente histórico de retiro en Chile; '+matched.length+' tienen alguna referencia de valor comercial conectable de forma conservadora al nivel de familia; '+(rows.length-matched.length)+' permanecen sin vínculo automático a un valor.',
 '- '+unsafe.length+' casos limitados a una generación, carrocería, prefijo o variante no reciben un valor genérico de familia. Para sus generaciones/terminaciones específicas se requiere cotejo adicional.',
 '',
 '## Metodología','',
 'Los precios son de publicaciones de usados en Chile o rangos aproximados de un proveedor. No corresponden al precio pagado en una operación ni a una tasación fiscal SII. Autofact entrega mínimos/máximos aproximados sin muestra conocida; AutoExplora publica mediana y p10–p90 cuando existen al menos cinco avisos. No se calculan promedios ni medianas entre extremos, ni se extrapolan valores a otros años o generaciones. Los importes son un corte documental del 21 de octubre de 2026.',
 '',
 '| # | Marca | Modelo o generación | Identidad | Referencia comercial documentada | Fuente |',
 '|---:|---|---|---|---|---|',
 ...rows.map(r=>'| '+r.index+' | '+r.brand+' | '+r.model.replace(/[|]/g,'/')+' | '+(r.match==='whole-family'?'Familia completa':'Acotado a versión/generación')+' | '+r.example+' | '+(r.latest?'[Ver origen]('+r.latest.sourceUrl+')':'[Ver antecedente]('+r.statusUrl+')')+' |'),
 '',
 '## Control de integridad','',
 'Comprobar con node scripts/expand-used-market.cjs --check, node scripts/used-market-qa.cjs --check y node rindelab/tests/used-prices.cjs contra el servidor local.',
 'La publicación de una URL o de un promedio estimado sin alcance verificable no se considera una incorporación de precio.'
];
const target=path.join(root,'rindelab/sii/USADOS-MERCADO-QA-20261021.md');
const content=lines.join('\n')+'\n';
if(process.argv.includes('--check'))assert.equal(fs.readFileSync(target,'utf8').replace(/\r\n/g,'\n'),content);
else fs.writeFileSync(target,content);
console.log(JSON.stringify({priceObservations:dataset.records.length,families:pairs.size,historicalModels:rows.length,historicalPriced:matched.length,historicalUnpriced:rows.length-matched.length,generationScopedWithoutAutomaticMapping:unsafe.length},null,2));
