'use strict';
/* Auditoría íntegra del buscador 3CV: sin prometer cobertura comercial como histórica. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../..'), R=path.join(root,'rindelab');
const m=require('../../vehiculos/data/manifest.json');
const legacy=m.files.flatMap(file=>require(path.join(root,'vehiculos',file))).filter(r=>r&&r[8]<='2026-05-08');
const api=require('../sii/official-api-mapper.js');
const pages=[1,2,3,4].map(i=>require(path.join(R,'data','oficial-api-20261018-0'+i+'.json')));
const october=api.load(pages,legacy);
const november=api.loadIncremental(require('../data/oficial-api-20261122.json'),legacy,october);
const rows=[...legacy,...october,...november];
const coverage=require('../data/real-3cv-photo-coverage-20261123.json');
const curated=require('../data/curated-generation-photo-reuse-20261123.json');
const ctx={window:{},document:{addEventListener(){}},HTMLImageElement:class{}};
vm.runInNewContext(fs.readFileSync(path.join(R,'v2-photos.js'),'utf8'),ctx);
const lib=ctx.window.RindelabPhotos;
const alias={'M. Benz':'Mercedes-Benz','Ram':'RAM','LEAPMOTOR':'Leapmotor','Faw':'FAW','Lynk Co':'Lynk & Co','ZX Auto':'Zxauto','Ssangyong':'KGM','Haval':'Great Wall','DFM':'Dongfeng','Mitsubishi Fuso':'Fuso','Exeed Born For More':'Exeed'};
const F={BRAND:0,MODEL:1,TECH:2,DATE:8};
const counts=new Map();
let withPhoto=0;
for(const source of rows){
 const row=source.slice();row[0]=alias[row[0]]||row[0];
 const photo=lib.find(row,F);
 if(photo)withPhoto++;
 const key=row[0];
 const v=counts.get(key)||{total:0,withPhoto:0,missing:0};
 v.total++;if(photo)v.withPhoto++;else v.missing++;
 counts.set(key,v);
 if(row[0]==='Land Rover'&&/^Range Rover Sport\b/i.test(row[1])){
  assert(!String(photo?.src||'').includes('rindelab-land-rover-range-rover-commonsmass-20261122.jpg'),
   'Un Range Rover Sport no puede mostrar la fotografía L460 del Range Rover normal');
 }
 if(row[0]==='Hyundai'&&/^Creta Grand\b/i.test(row[1])&&row[8]<='2021-12-31'){
  assert(!String(photo?.src||'').includes('hyundai-hyundai-creta-072.jpg'),
   'Creta Grand no puede heredar fotografía de Creta 5 asientos');
 }
 if(row[0]==='Maxus'&&/^T60 MAX\b/i.test(row[1])&&row[8].startsWith('2025')){
  assert(!String(photo?.src||'').includes('rindelab-maxus-t60-commonsmass-20261122.jpg'),
   'T60 MAX no puede heredar foto de T60 antigua');
 }
}
assert.equal(legacy.length,8053);
assert.equal(october.length,272);
assert.equal(november.length,69);
assert.equal(rows.length,8394);
assert.equal(withPhoto,3348,'Cobertura real de fichas 3CV, no de familias comerciales');
assert.equal(rows.length-withPhoto,5046);
assert.equal(coverage.withPhoto,withPhoto);
assert.equal(coverage.withoutPhoto,rows.length-withPhoto);
assert.equal(coverage.generationReuse20261123.newlyCovered,299);
assert.equal(coverage.historicalCommons20261123.newlyCovered,264);
assert.equal(coverage.historicalCommons20261123.photoAssetsAdded,41);
assert.equal(curated.rules.length,38);
assert.equal(lib.count,795,'Sin agregar fotografías ni incrementar artificialmente la biblioteca');
for(const [brand,v] of counts){
 const audited=coverage.byBrand[brand];
 assert(audited,'Marca sin inventariar: '+brand);
 assert.equal(v.total,audited.total,'Total marca '+brand);
 assert.equal(v.withPhoto,audited.withPhoto,'Cobertura marca '+brand);
 assert.equal(v.missing,audited.missing,'Faltantes marca '+brand);
}
const html=fs.readFileSync(path.join(R,'index.html'),'utf8');
assert(html.includes('3.348 de 8.394 fichas'));
assert(html.includes('5.046 fichas sin foto'));
assert(html.includes('v2-photos.js?v=20261123-historical-commons4'));
const photosSource=fs.readFileSync(path.join(R,'v2-photos.js'),'utf8');
for(const rule of curated.rules){
 assert(/^\d{4}$/.test(rule.from)&&/^\d{4}$/.test(rule.to)&&rule.from<=rule.to);
 new RegExp(rule.pattern,'i');
 assert(photosSource.includes(rule.filename),'Falta el archivo/familia: '+rule.filename);
 assert(!/motorway|generic stock/i.test(rule.generation),'Imprecisión: '+rule.generation);
}
console.log('PASS: historial 3CV 8.394, con imagen 3.348 (+299 +264), sin imagen 5.046; 38 reglas conservadoras, 795 fotos, control de generaciones y marcas');
