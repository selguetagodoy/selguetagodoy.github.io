/* Alerta documental, nunca importa automáticamente precios ni interpreta falta como retiro. */
'use strict';
const fs=require('node:fs'),path=require('node:path');
const base=path.resolve(__dirname,'..');
const arg=k=>process.argv.find(x=>x.startsWith('--'+k+'='))?.slice(k.length+3);
const old=require('../rindelab/data/dealer-new-models-20261021.json');
const current=JSON.parse(fs.readFileSync(arg('live')||'dealer-live-snapshot.json','utf8'));
if(!Array.isArray(current.records)||current.records.length<180||current.errors?.length)throw Error('Búsqueda remota incompleta: no revisar diferencias hasta obtener un snapshot válido');
const index=arr=>new Map(arr.map(x=>[x.source,x]));
const oldMap=index(old.records),newMap=index(current.records);
const added=current.records.filter(x=>!oldMap.has(x.source));
const modified=current.records.filter(x=>{
 const prev=oldMap.get(x.source);return prev&&prev.listPriceClp!==x.listPriceClp;
}).map(x=>({brand:x.brand,family:x.family,source:x.source,previous:oldMap.get(x.source).listPriceClp,new:x.listPriceClp}));
const absent=old.records.filter(x=>!newMap.has(x.source));
const report={
 schemaVersion:1,generatedAt:current.observedAt,snapshotRecords:current.records.length,
 baselineRecords:old.records.length,newListingCandidates:added,
 changedPublishedListPrices:modified,
 previouslyListedButNotObserved:absent.map(x=>({brand:x.brand,family:x.family,source:x.source})),
 warning:'Cambios de presencia o precios requieren revisión documental; ausencia en un rastreo no acredita descontinuación; precio de lista jamás se infiere de un descuento.'
};
fs.writeFileSync(arg('out')||'dealer-change-review.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({newListingCandidates:added.length,changedPublishedListPrices:modified.length,notObserved:absent.length},null,2));
