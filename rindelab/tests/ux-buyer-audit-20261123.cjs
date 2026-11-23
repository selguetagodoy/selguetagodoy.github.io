'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),read=file=>fs.readFileSync(path.join(root,file),'utf8');
const C=require('../sii/catalog-identity.js');
const list=require('../sii/commercial-2026.json');
const byd=list.filter(p=>p.brand==='BYD'&&p.family==='Yuan Pro DM-i');
assert.equal(byd.length,2,'BYD GL/GS have precisely two documented prices');
for(const [v,cost] of [['GL',19990000],['GS',22990000]]){
 const entry=byd.find(x=>x.version.endsWith(' '+v));
 assert(entry,'Missing variant '+v);
 assert.equal(entry.priceListClp,cost,'Do not assign GL price to GS');
 assert.equal(entry.source,'https://astararetail.cl/byd-yuan-pro/');
 assert.equal(entry.sourceOfferEnd,'2026-11-30');
 assert.equal(entry.checkedAt,'2026-11-22');
 assert.equal(entry.priceType,'lista');
}
const win={RindelabSII:{show:async()=>{},decorateComparison:()=>{}},RindelabIdentity:C,
 dispatchEvent(){}};
const ctx={window:win,fetch:async()=>({ok:true,json:async()=>list}),
 Event:class Event{constructor(type){this.type=type;}},console,Promise,Date};
vm.runInNewContext(read('sii/prices.js'),ctx,{filename:'sii/prices.js'});
(async()=>{
 await win.RindelabCommercial.ready();
 for(const [variant,price] of [['GL',19990000],['GS',22990000]]){
  const r=win.RindelabCommercial.minimum(['BYD','BYD Yuan Pro DM-i '+variant,'PHEV'],'Yuan Pro DM-i');
  assert(r,'No BYD record '+variant);
  assert.equal(r.priceListClp,price,'3CV '+variant+' must show its matching commercial version');
  assert.equal(r.version,'Yuan Pro DM-i '+variant);
  assert.equal(r.referenceOnly,true,'Do not certify 3CV equivalence');
 }
 const unknown=win.RindelabCommercial.minimum(['BYD','Yuan Pro DM-i','PHEV'],'Yuan Pro DM-i');
 assert.equal(unknown,null,'A generic 3CV family must not be assigned GL as a version price');
 assert(read('v6.js').includes("$('catalogScope').value='all';"),'Reset must return to the whole 3CV catalog');
 assert(read('v6.js').includes('const modelName=normalize(row[F.MODEL])'),'Repeated BYD brand removed from titles');
 assert(read('v6.js').includes('No encontramos esta búsqueda en el subconjunto comercial'),'Free search must offer historical matches');
 assert(read('market-catalog.js').includes('market-compare-mobile'),'Commercial compare must render mobile cards');
 assert(read('market.css').includes('.market-compare-mobile-card'),'Mobile cards styles must be defined');
 for(const filename of ['index.html','cotizador.html','metodologia.html','marcas.html','novedades-3cv.html']){
  assert(read(filename).includes('20261123-'),'Old pages must invalidate cache: '+filename);
 }
 console.log('PASS buyer UX 2026-11-23: GL/GS proper documented prices and source, no implicit family-to-version; reset, search and responsive compare');
})().catch(error=>{console.error(error);process.exitCode=1;});
