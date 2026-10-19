/* E2E complementaria: fotos acreditadas, escenarios rápidos, páginas secundarias. */
const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const base=process.env.RINDELAB_BASE_URL||'http://127.0.0.1:8765/rindelab/';
 const b=await chromium.launch(process.platform==='win32'?{channel:'chrome',headless:true}:{headless:true,args:['--no-sandbox']});
 let passed=0;
 async function check(label,fn){await fn();console.log('PASS '+label);passed++}
 const p=await b.newPage({viewport:{width:1440,height:900}});
 const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(base,{waitUntil:'domcontentloaded'});
 await p.waitForFunction(()=>document.getElementById('recordCount')?.textContent==='8.325',{timeout:30000});
 await check('La búsqueda encuentra Corolla Cross y asocia fotos verificadas',async()=>{
  await p.fill('#query','Corolla Cross');await p.click('#searchButton');
  assert((await p.locator('.vehicle-card').count())>0);
  const pictures=p.locator('.vehicle-photo img');
  assert((await pictures.count())>=2,'Sin foto verificable para dos motorizaciones Corolla Cross');
  const sizes=await pictures.evaluateAll(xs=>xs.map(x=>({src:x.src,complete:x.complete,naturalWidth:x.naturalWidth,alt:x.alt})));
  for(const x of sizes){assert(x.src.includes('/images/'));assert(x.naturalWidth>0,JSON.stringify(x));assert(x.alt.includes('referencial'))}
  assert((await p.locator('.vehicle-photo-credit a').count())>=4);
 });
 await check('La licencia está enlazada y no se declara una versión exacta',async()=>{
  const credit=await p.locator('.vehicle-photo-credit').first().textContent();
  assert(credit.includes('Foto del modelo'));
  assert.match(credit,/CC BY/);
  assert((await p.locator('.vehicle-photo img').first().getAttribute('alt')).includes('no acredita'));
 });
 await check('Cambiar carga pública, en casa y mixta usa el cálculo existente',async()=>{
  await p.locator('[data-scenario-mode="home"]').click();
  assert.equal(await p.inputValue('#chargeScenario'),'home');
  assert(await p.locator('#homeChargeField').isVisible());
  assert.equal(await p.inputValue('#electricPrice'),'');
  assert.equal(await p.locator('[data-scenario-mode="home"]').getAttribute('aria-pressed'),'true');
  await p.locator('[data-scenario-mode="mixed"]').click();
  assert.equal(await p.inputValue('#chargeScenario'),'mixed');
  assert(await p.locator('#homeShareField').isVisible());
  await p.locator('[data-scenario-mode="public"]').click();
  assert.equal(await p.inputValue('#chargeScenario'),'public');
  assert.equal(await p.inputValue('#electricPrice'),'340');
 });
 await check('BYD Dolphin Mini muestra imagen local con atribución',async()=>{
  await p.locator('#resetButton').click();await p.fill('#query','Dolphin Mini');await p.locator('#searchButton').click();
  const count=await p.locator('.vehicle-photo img').count();
  assert(count>0,'No hay foto BYD asociada al resultado');
  const img=p.locator('.vehicle-photo img').first();
  await img.scrollIntoViewIfNeeded();
  await img.evaluate(el=>el.decode());
  assert((await img.getAttribute('src')).includes('byd-dolphin-mini-2024'));
 });
 await check('Rankings y comparador conservan apertura',async()=>{
  await p.locator('#statsOpen').click();assert(await p.locator('#statsDialog').evaluate(x=>x.open));
  await p.locator('#statsClose').click();
  await p.locator('.vehicle-card button[data-compare]').first().click();
  assert(await p.locator('#compareTray').isVisible());
 });
 assert.deepEqual(errors,[]);await p.close();
 for(const w of [320,390,1440]){
  for(const name of ['cotizador.html','marcas.html','cobertura.html','versiones.html','homologaciones.html','novedades-3cv.html']){
   const pg=await b.newPage({viewport:{width:w,height:900},isMobile:w<=390,hasTouch:w<=390});
   const faults=[];pg.on('pageerror',e=>faults.push(e.message));
   const rsp=await pg.goto(base+name,{waitUntil:'domcontentloaded',timeout:25000});
   assert.equal(rsp.status(),200);
   await pg.waitForTimeout(220);
   const metrics=await pg.evaluate(()=>({overflow:document.documentElement.scrollWidth-innerWidth,font:getComputedStyle(document.body).fontFamily,loaded:[...document.querySelectorAll('link[rel=stylesheet]')].some(x=>x.href.includes('v2-secondary.css'))}));
   assert(metrics.overflow<=3,'Overflow '+name+' '+w+' '+JSON.stringify(metrics));
   assert(metrics.loaded,'Secondary style missing '+name);
   assert(metrics.font.includes('Inter'),'Local Inter missing '+name);
   assert.deepEqual(faults,[],'JS errors '+name);
   passed++;console.log('PASS '+name+' '+w+'px');
   await pg.close();
  }
 }
 await b.close();console.log(passed+' pruebas etapa 2 aprobadas');
})().catch(e=>{console.error('FAIL '+e.stack);process.exit(1)});
