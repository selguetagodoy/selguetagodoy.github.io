/* Auditoría de portada para difusión pública: sin texto residual ni promesas estadísticas inventadas. */
const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const base=process.env.RINDELAB_BASE_URL||'http://127.0.0.1:8765/rindelab/';
 const b=await chromium.launch(process.platform==='win32'?{channel:'chrome',headless:true}:{headless:true,args:['--no-sandbox']});
 let passed=0;
 for(const width of [320,390,768,1440]){
  const p=await b.newPage({viewport:{width,height:900},isMobile:width<=390,hasTouch:width<=390});
  const errors=[];p.on('pageerror',e=>errors.push(e.message));
  const r=await p.goto(base,{waitUntil:'domcontentloaded'});
  assert.equal(r.status(),200);
  await p.waitForFunction(()=>document.querySelector('#recordCount')?.textContent==='8.325',{timeout:25000});
  assert.equal(await p.locator('.source-teaser').count(),0,'Source teaser still visible');
  assert.equal(await p.locator('.hero-support').count(),0,'Redundant hero description');
  assert.equal(await p.locator('.search-card-heading p').count(),0,'Redundant search explanation');
  assert.equal(await p.locator('#tech').isVisible(),false,'Duplicate motor filter is on surface');
  assert.equal(await p.locator('#technical').evaluate(el=>el.open),false,'Extra filters pre-opened');
  assert.equal(await p.locator('#supuestos').isVisible(),false,'Cost editor duplicates the CTA');
  assert.equal(await p.locator('#footer-data-explanation').count(),0);
  assert(await p.locator('#fuentes a[href="./metodologia.html"]').isVisible(),'Methodology link missing');
  assert.equal(await p.locator('#recordCount').isVisible(),false);
  assert.equal(await p.locator('.footer small').count(),0,'Redundant footer claims');
  const layout=await p.evaluate(()=>({
    pageWidth:document.documentElement.scrollWidth,viewport:innerWidth,
    searchY:document.querySelector('#searchButton').getBoundingClientRect().top+scrollY,
    rankWidth:document.querySelector('#statsOpen').getBoundingClientRect().width,
    introCount:document.querySelectorAll('main .intro p').length
  }));
  assert(layout.pageWidth<=layout.viewport+3,'Horizontal overflow '+width);
  if(width<=390)assert(layout.searchY<900,'Search action below initial view: '+layout.searchY);
  if(width>=768)assert(layout.rankWidth<330,'Oversized secondary hero CTA');
  assert.deepEqual(errors,[],'JS errors');
  console.log('PASS '+width+'px — portada limpia, navegación y acciones visibles');
  passed++;await p.close();
 }
 const p=await b.newPage({viewport:{width:1440,height:900}});
 await p.goto(base,{waitUntil:'domcontentloaded'});
 assert.equal(await p.locator('meta[property="og:image"]').getAttribute('content'),'https://selguetagodoy.github.io/rindelab/linkedin-preview.png');
 assert.equal(await p.locator('meta[property="og:image:width"]').getAttribute('content'),'1200');
 assert.equal(await p.locator('meta[property="og:image:height"]').getAttribute('content'),'630');
 const image=await p.evaluate(async()=>{
  const r=await fetch('./linkedin-preview.png');const bytes=new Uint8Array(await r.arrayBuffer());
  const view=new DataView(bytes.buffer);return {status:r.status,width:view.getUint32(16),height:view.getUint32(20),type:r.headers.get('content-type'),bytes:bytes.byteLength}
 });
 assert.equal(image.status,200);assert.equal(image.width,1200);assert.equal(image.height,630);assert(image.bytes>50000);
 console.log('PASS imagen LinkedIn en 1200 × 630 y metadatos Open Graph');passed++;
 await p.locator('#technical summary').click();assert(await p.locator('#tech').isVisible());
 await p.selectOption('#tech','REEV');assert.equal(await p.inputValue('#tech'),'REEV');
 await p.locator('#searchButton').click();
 assert(await p.locator('#results').isVisible());
 console.log('PASS motorizaciones menos frecuentes accesibles en Más filtros');passed++;
 await b.close();console.log(passed+' verificaciones showcase aprobadas');
})().catch(e=>{console.error('FAIL '+e.stack);process.exit(1)});
