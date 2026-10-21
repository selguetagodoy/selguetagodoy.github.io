/* RINDELAB: QA de precios usados observados vs SII 2026, sin interpolación. */
'use strict';
const assert=require('node:assert/strict');
const data=require('../sii/data/used-market-20261021.json');
const manifest=require('../sii/data/used-autofact-additions-20261021.json');
const history=require('../sii/model-lifecycle-2026.json');
assert.equal(data.records.length,106,'Cantidad de referencias del lote');
assert.equal(manifest.records.length,80,'Fuentes verificadas para la ampliación');
assert.equal(data.records.filter(x=>x.source==='AutoExplora').length,20);
assert.equal(data.records.filter(x=>x.source==='Autofact').length,86);
assert.equal(history.models.length,90);
const ids=new Set();
for(const item of data.records){
 const id=[item.source,item.brandSlug,item.modelSlug,item.year].join('|');
 assert(!ids.has(id),'Duplicate model/year/provider '+id);
 ids.add(id);
 assert(item.observedAt===data.observedAt);
 assert(Number.isInteger(item.year)&&item.year>=1990&&item.year<=2026);
 const uri=new URL(item.sourceUrl);
 assert(uri.protocol==='https:');
 const path=(item.source==='Autofact'?'/valor-comercial-autos/':'/precios/')+item.brandSlug+'/'+item.modelSlug+'/'+item.year;
 assert.equal(uri.pathname,path,'URL de modelo/año distinta al registro');
 if(item.source==='Autofact'){
  assert.equal(uri.hostname,'www.autofact.cl');
  assert(!('medianClp' in item),'Una banda aproximada no es mediana');
  assert(Number.isSafeInteger(item.lowClp)&&Number.isSafeInteger(item.highClp));
  assert(item.lowClp>0&&item.lowClp<=item.highClp);
 }else{
  assert.equal(uri.hostname,'www.autoexplora.cl');
  assert(item.sampleSize>=5,'Mediana AutoExplora sin suficiente muestra');
  assert(item.p10Clp<=item.medianClp&&item.medianClp<=item.p90Clp);
 }
}
for(const item of manifest.records){
 const original=data.records.find(p=>p.source===item.source&&p.brandSlug===item.brandSlug&&p.modelSlug===item.modelSlug&&p.year===item.year);
 assert(original,'Manifest record not present in unified database');
 assert.deepEqual(original,item,'Metadata del lote alterada');
}
const checks=[
 ['Nissan','March',2018,'Autofact',5100000,7400000],
 ['Ford','Fiesta',2017,'Autofact',6066896,7698952],
 ['Hyundai','Veloster',2015,'Autofact',7739415,9860475],
 ['Renault','Alaskan',2021,'Autofact',16785340,22804980],
 ['Volvo','S80',2014,'Autofact',13844675,17372650],
 ['Chevrolet','Cruze',2019,'Autofact',8539045,11163498]
];
const norm=v=>v.toLowerCase().replace(/[^a-z0-9]/g,'');
for(const [brand,model,year,source,low,high] of checks){
 const x=data.records.find(p=>norm(p.brandSlug)===norm(brand)&&norm(p.modelSlug)===norm(model)&&p.year===year&&p.source===source);
 assert(x,brand+' '+model+' '+year+' sin registro');
 assert.equal(x.lowClp,low);
 assert.equal(x.highClp,high);
}
assert.equal(manifest.records.filter(p=>p.scope==='approximate-published-range').length,80);
console.log('PASS 106 referencias documentadas, 80 nuevas, 90 retiros, integridad URLs/CLP/metodologías sin interpolación');
