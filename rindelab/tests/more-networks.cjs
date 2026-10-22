/* RINDELAB 4 networks: defensible aliases and photo copyright. */
'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),C=require('../sii/catalog-identity.js');
const root=path.resolve(__dirname,'..');
const portillo=require('../data/dealer-portillo-20261021.json'),gilde=require('../data/dealer-gildemeister-20261021.json'),aliases=require('../data/commercial-family-aliases-20261021.json'),photos=require('../data/photo-batch2-20261021.json');
assert.equal(portillo.records.length,111);
assert.equal(gilde.records.length,53);
assert.equal(aliases.aliases.length,28,'Solo 28 alias de familia comercial respaldados; no restaurar el alias eliminado sin evidencia');
assert.equal(photos.photos.length,19);
assert(aliases.aliases.every(x=>x.level==='same-commercial-family-only'));
assert(!aliases.aliases.some(x=>/ALL NEW (?:FORESTER|OUTBACK)/i.test(x.sourceFamily)),'Generación nueva colapsada sin respaldo');
const crypto=require('node:crypto');
for(const p of photos.photos){
 const f=path.join(root,p.localSrc.slice(2)),buf=fs.readFileSync(f);
 assert.equal(buf.length,p.bytes,'Archivo faltante '+p.file);
 assert.equal(crypto.createHash('sha256').update(buf).digest('hex'),p.sha256,'Hash Commons diferente '+p.file);
 assert(p.author&&p.license.startsWith('CC')&&p.source.startsWith('https://commons.wikimedia.org/wiki/File:'));
}
for(const [name,xs] of [['Portillo',portillo.records],['Gildemeister',gilde.records]]){
 const seen=new Set();
 for(const x of xs){
  assert(x.brand&&x.family&&x.source.startsWith('https://'));
  assert(!seen.has(x.source),'Duplicated '+name+' URL '+x.source);
  seen.add(x.source);
  assert.equal(x.listPriceClp,null,'No confundir precio desde bonificado con lista: '+x.source);
 }
}
(async()=>{
 const b=await chromium.launch(process.platform==='win32'?{channel:'chrome',headless:true}:{headless:true,args:['--no-sandbox']});
 try{
  for(const width of [390,1280]){
   const page=await b.newPage({viewport:{width,height:850},isMobile:width===390});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(process.env.RINDELAB_BASE_URL||'http://127.0.0.1:8765/rindelab/',{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>window.RindelabMarket?.records().length>=465&&window.RindelabMarket?.getAliasCount()===28&&window.RindelabPhotos?.count===259&&document.querySelector('#searchButton')&&!document.querySelector('#searchButton').disabled,{timeout:60000});
   const meta=await page.evaluate(()=>({groups:RindelabMarket.getTotal(),aliases:RindelabMarket.getAliasCount(),records:RindelabMarket.records().length,photos:RindelabPhotos.count}));
   assert(meta.groups>=820,'Faltan grupos comerciales '+JSON.stringify(meta));
   await page.selectOption('#catalogScope','commercial');
   await page.fill('#query','AION UT');await page.click('#searchButton');
   assert(await page.locator('.market-card').count()>0,'Gildemeister AION UT no se muestra');
   await page.fill('#query','Lexus Lx');await page.click('#searchButton');
   assert(await page.locator('.market-card').count()>0,'Portillo Lexus LX no está accesible');
   await page.fill('#query','C3 Aircross');await page.click('#searchButton');
   assert(await page.locator('.market-card').count()>0,'Citroën C3 Aircross no accesible');
   const photo=await page.evaluate(()=>RindelabPhotos.findCommercial({brand:'Citroën',family:'C3 Aircross',checkedAt:'2026-10-21'}));
   assert(photo&&photo.src.startsWith('./images/commons/'),'Citroën imagen no asignada');
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
   assert(overflow<=4,'Overflow '+width+': '+overflow);
   assert.deepEqual(errors,[]);
   console.log('PASS four-network catalog '+JSON.stringify(meta)+' viewport '+width);
   await page.close();
  }
 }finally{await b.close();}
})().catch(e=>{console.error(e.stack);process.exitCode=1});
