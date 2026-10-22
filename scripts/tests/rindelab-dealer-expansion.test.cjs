/* Control reproducible de ampliación: dos distribuidores, URLs reales y precios de lista. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const C=require('../../rindelab/sii/catalog-identity.js');
const root=path.resolve(__dirname,'../..');
const src=require('../../rindelab/data/dealer-new-models-20261021.json');
const list=require('../../rindelab/sii/commercial-2026.json');
assert.equal(src.observedAt,'2026-10-21');
assert.equal(src.schemaVersion,1);
assert(src.records.length>=290,'El snapshot no incluye todas las páginas revisadas');
const byRetailer=Object.groupBy(src.records,x=>x.retailer);
assert((byRetailer['Pompeyo Carrasco']||[]).length>=105);
assert((byRetailer['Salazar Israel']||[]).length>=185);
const sources=new Set(),old=new Set(list.map(x=>C.key(x.brand,x.family))),newGroups=new Set();
let publishedListPrices=0;
for(const p of src.records){
 assert(p.brand&&p.family&&p.source.startsWith('https://'));
 assert(p.listing==='new'&&p.observedAt==='2026-10-21');
 assert(!sources.has(p.source),'URL duplicada '+p.source);sources.add(p.source);
 const url=new URL(p.source);
 assert((url.hostname==='www.pompeyo.cl'&&url.pathname.startsWith('/producto/'))||
  (url.hostname==='www.salazarisrael.cl'&&url.pathname.startsWith('/marcas/')),url.href);
 if(p.listPriceClp!==null){
  publishedListPrices++;
  assert.equal(p.retailer,'Pompeyo Carrasco','Precio Salazar con bono importado incorrectamente');
  assert(Number.isSafeInteger(p.listPriceClp)&&p.listPriceClp>1000000);
  assert(typeof p.taxIncluded==='boolean');
 }else assert.equal(p.taxIncluded,null);
 const k=C.key(p.brand,p.family);
 if(!old.has(k))newGroups.add(k);
}
assert(publishedListPrices>=95,'No se extrajeron precios de lista publicados');
assert(newGroups.size>=75,'No se generó una ampliación útil de nombres comerciales');
const photoJs=fs.readFileSync(path.join(root,'rindelab/v2-photos.js'),'utf8');
const window={};vm.runInNewContext(photoJs,{window,document:{addEventListener(){}}});
assert.equal(window.RindelabPhotos.count,245,'Biblioteca fotográfica incompleta');
const targets=['rindelab-subaru-trailseeker-licensed-20261021.jpg','rindelab-byd-sealion-7-licensed-20261021.jpg','rindelab-honda-zr-v-licensed-20261021.jpg','rindelab-audi-q5-sportback-licensed-20261021.jpg','rindelab-mg-s5-ev-licensed-20261021.jpg'];
for(const f of targets){
 const p=path.join(root,'rindelab/images/commons',f);
 assert(fs.existsSync(p),'Falta fotografía: '+f);
 assert(fs.statSync(p).size>20000,'Imagen corrupta: '+f);
}
const pairs=[
 ['Subaru','All New Trailseeker','EV'],
 ['BYD','Sealion 7 EV','EV'],
 ['Honda','ZR-V Hybrid','HEV'],
 ['Audi','Q5 Sportback','Bencina'],
 ['MG','S5 EV','EV']
];
for(const [brand,family,technology] of pairs){
 const found=window.RindelabPhotos.findCommercial({brand,family,technology,checkedAt:'2026-10-21'});
 assert(found,brand+' '+family+' no tiene foto licenciada');
 assert(found.source.startsWith('https://commons.wikimedia.org/'),found.source);
}
console.log(JSON.stringify({records:src.records.length,byRetailer:Object.fromEntries(Object.entries(byRetailer).map(([k,v])=>[k,v.length])),publishedListPrices,newFamilyLabels:newGroups.size,photoLibrary:205},null,2));
