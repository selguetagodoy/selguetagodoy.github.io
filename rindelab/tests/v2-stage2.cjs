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
  for(const image of await pictures.all()){await image.scrollIntoViewIfNeeded();await image.evaluate(el=>el.decode());}
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
 await check('Tesla Model 3, Kia EV5 y BMW i4 muestran fotos atribuidas sin afirmar versión exacta',async()=>{
  for(const term of ['Tesla Model 3','Kia EV5','BMW i4']){
   await p.locator('#resetButton').click();await p.fill('#query',term);await p.click('#searchButton');
   const photo=p.locator('.vehicle-card .vehicle-photo img').first();
   assert((await photo.count())>0,'Falta foto de '+term);
   assert.match(await photo.getAttribute('src'),/images\/commons\//);await photo.scrollIntoViewIfNeeded();await photo.evaluate(el=>el.decode());assert((await photo.evaluate(el=>el.naturalWidth))>0);
   assert.match(await photo.getAttribute('alt'),/no acredita la versión homologada/);
   assert(await p.locator('.vehicle-card .vehicle-photo-credit a').first().count()>0);
   assert.match(await p.locator('.vehicle-card .vehicle-photo-credit').first().textContent(),/CC BY|CC0/);
  }
  await p.locator('#resetButton').click();await p.fill('#query','Corolla Cross');await p.click('#searchButton');
 });
 await check('Cotizador y electromovilidad comparten fotos y licencias de modelos',async()=>{
  const quote=await b.newPage({viewport:{width:1200,height:850}});
  await quote.goto(base+'cotizador.html',{waitUntil:'domcontentloaded'});
  await quote.waitForFunction(()=>document.querySelectorAll('.quote-version').length>0,{timeout:15000});
  await quote.fill('#quoteSearch','Tesla Model Y');
  assert((await quote.locator('.quote-version.has-photo .rinde-photo-thumb img').count())>0,'Sin fotos en cotizador Tesla');
  assert.match(await quote.locator('.quote-version .rinde-photo-attribution').first().textContent(),/CC BY-SA/);
  await quote.fill('#quoteSearch','Porsche 911');
  assert((await quote.locator('.quote-version').count())>0);
  assert.equal(await quote.locator('.quote-version .rinde-photo-thumb img').count(),0,'No usar foto del Taycan para un Porsche 911');
  await quote.close();
  const ev=await b.newPage({viewport:{width:1200,height:850}});
  await ev.goto(base+'electromovilidad.html',{waitUntil:'domcontentloaded'});
  await ev.waitForFunction(()=>document.querySelectorAll('#electroRows tr').length>0,{timeout:15000});
  await ev.fill('#eSearch','Kia EV5');
  assert((await ev.locator('#electroRows .rinde-photo-thumb img').count())>0,'Sin fotos en electromovilidad Kia EV5');
  assert.match(await ev.locator('#electroRows .rinde-photo-attribution').first().textContent(),/CC0/);
  await ev.close();
 });
 await check('Las 32 nuevas fotos locales tienen atribución y bytes íntegros',async()=>{
  const fs=require('node:fs');const path=require('node:path');const hash=require('node:crypto').createHash;
  const dir=path.join(__dirname,'../images/commons');const m=JSON.parse(fs.readFileSync(path.join(dir,'manifest.json'),'utf8'));
  assert.equal(m.downloaded,146);assert.equal(m.skipped,0);assert.equal(m.results.filter(x=>x.status==='local').length,146);assert.equal(await p.evaluate(()=>window.RindelabPhotos.count),150);
  for(const entry of m.results){assert(entry.source.startsWith('https://commons.wikimedia.org/'));assert(entry.author);assert(entry.license);
   const bytes=fs.readFileSync(path.join(__dirname,'..',entry.path.slice(2)));
   assert.equal(bytes.length,entry.bytes);assert.equal(hash('sha256').update(bytes).digest('hex'),entry.sha256);}
 });
 await check('Lote adicional identifica Tucson, Sonet, Ranger, RAV4, X1 y Fronx sin fotos cruzadas',async()=>{
  const list=[['Hyundai','Tucson 1.6 TGDI','Bencina','2024-01-01'],['Kia','Sonet 1.5','Bencina','2025-01-01'],
   ['Ford','Ranger P703 XLT','Diésel','2025-01-01'],['Toyota','RAV4 HEV','HEV','2023-01-01'],
   ['BMW','X1 xDrive20d','Diésel','2024-01-01'],['Suzuki','Fronx 1.5','MHEV','2025-01-01']];
  const results=await p.evaluate(list=>list.map(([brand,model,tech,date])=>{const x=window.RindelabPhotos.find([brand,model,tech,'','','','','',date],{BRAND:0,MODEL:1,TECH:2,DATE:8});return x?.src||''}),list);
  assert(results.every(x=>x.startsWith('./images/commons/')),JSON.stringify(results));
  assert(results.every(src=>src.includes('/images/commons/')));
 });
 await check('Las fotos nuevas cubren familias masivas y premium, sin cruzar versiones',async()=>{
  const cases=[['Porsche','Cayenne 3.0 V6','Bencina','2025-01-01'],['Mini','Cooper S 5P','Bencina','2025-01-01'],
    ['BMW','X5 xDrive30d','Diésel','2025-01-01'],['Chery','Tiggo 7 Pro Max 1.5','Bencina','2025-01-01'],
    ['Chevrolet','Tracker 1.2 Turbo','Bencina','2025-01-01'],['Kia','Sportage 1.6 HEV','HEV','2025-01-01']];
  const values=await p.evaluate(cases=>cases.map(([brand,model,tech,date])=>{const x=window.RindelabPhotos.find([brand,model,tech,'','','','','',date],{BRAND:0,MODEL:1,TECH:2,DATE:8});return x?.src||null}),cases);
  assert(values.every(x=>x&&x.startsWith('./images/commons/')),JSON.stringify(values));
  const mismatch=await p.evaluate(()=>window.RindelabPhotos.find(['Porsche','911 Carrera','','','','','','','2025-01-01'],{BRAND:0,MODEL:1,TECH:2,DATE:8}));
  assert(mismatch?.model.includes('911'));
  const countryman=await p.evaluate(()=>window.RindelabPhotos.find(['Mini','Countryman Cooper S','Bencina','','','','','','2025-01-01'],{BRAND:0,MODEL:1,TECH:2,DATE:8})?.model);
  assert.equal(countryman,'Mini Countryman');
 });
 await check('150 referencias: fotos locales de eléctricos, SUV y nuevos modelos',async()=>{
  const targets=[['Nissan','X-Trail 2.5','Bencina','2025-01-01'],['MG','S5 EV','EV','2025-01-01'],
    ['Hyundai','Inster EV','EV','2025-01-01'],['Kia','Niro HEV','HEV','2025-01-01'],
    ['Peugeot','408 1.6','Bencina','2024-01-01'],['Jeep','Commander Limited','Bencina','2025-01-01']];
  const found=await p.evaluate(targets=>targets.map(([brand,model,tech,date])=>window.RindelabPhotos.find([brand,model,tech,'','','','','',date],{BRAND:0,MODEL:1,TECH:2,DATE:8})?.src||null),targets);
  assert(found.every(src=>src?.startsWith('./images/commons/')),JSON.stringify(found));
  const wrong=await p.evaluate(()=>window.RindelabPhotos.find(['Ford','Transit Courier','','','','','','','2024-01-01'],{BRAND:0,MODEL:1,TECH:2,DATE:8}));
  assert.equal(wrong,null,'No asociar foto de Ford Transit a Ford Transit Courier');
 });
 await check('El escenario desplegable mantiene las tarifas y cálculos originales',async()=>{
  await p.locator('#supuestos').evaluate(el=>el.open=true);
  await p.selectOption('#chargeScenario','home');
  assert.equal(await p.inputValue('#chargeScenario'),'home');
  assert(await p.locator('#scenarioAdvanced').evaluate(el=>el.open));
  assert(await p.locator('#homeChargeField').isVisible());
  assert.equal(await p.inputValue('#electricPrice'),'230');
  await p.fill('#homeChargeRate','');
  assert.equal(await p.inputValue('#electricPrice'),''); // solo queda sin costo si el usuario borra el supuesto
  await p.fill('#homeChargeRate','230');
  await p.selectOption('#chargeScenario','mixed');
  assert.equal(await p.inputValue('#electricPrice'),'252');
  assert(await p.locator('#homeShareField').isVisible());
  await p.selectOption('#chargeScenario','public');
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
