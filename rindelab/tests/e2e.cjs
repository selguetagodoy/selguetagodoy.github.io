/* QA navegador de RINDELAB v4.
  Ejecutar desde la raíz del repositorio después de: npm install --no-save playwright
  Requiere un servidor HTTP local: python3 -m http.server 8765
*/
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch(process.platform==='win32'?{channel:'chrome',headless:true}:{headless:true,args:['--no-sandbox']});
 const base='http://127.0.0.1:8765/rindelab/';
 let failures=0,checks=0;
 async function test(name,fn){
  try{await fn();console.log('PASS '+name);checks++}
  catch(e){failures++;console.error('FAIL '+name+' — '+e.stack)}
 }
 const page=await browser.newPage({viewport:{width:1440,height:940}});
 const errors=[];page.on('pageerror',e=>errors.push('Page error: '+e.message));
 page.on('console',msg=>{if(msg.type()==='error')errors.push('Console: '+msg.text())});
 await test('Carga y base oficial',async()=>{
  const res=await page.goto(base,{waitUntil:'networkidle',timeout:30000});
  assert.equal(res.status(),200);
  await page.waitForFunction(()=>document.querySelector('#sTotal')?.textContent?.includes('8.053'),{timeout:25000});
  assert.match(await page.locator('#resultInfo').textContent(),/8\.053/);
 });
 await test('Categorías visibles y conteos basados en el 3CV',async()=>{
  assert.equal(await page.locator('#categoryChips button[data-category]').count(),8);
  await page.locator('#categoryChips button[data-category="pickup"]').click();
  await page.waitForTimeout(180);
  assert.match(await page.locator('#sTotal').textContent(),/1\.056/);
  assert.equal(await page.locator('#category').inputValue(),'pickup');
  const allBody=await page.locator('#tbody tr').allTextContents();
  assert(allBody.every(s=>s.toLowerCase().includes('camioneta')));
 });
 await test('Desplegable de categoría visible y sincronizado con tarjetas',async()=>{
  assert(await page.locator('#category').isVisible());
  const option=page.locator('#category option[value="sedan"]');
  assert.match(await option.textContent(),/1\.072/);
  await page.selectOption('#category','sedan');
  assert.match(await page.locator('#sTotal').textContent(),/1\.072/);
  assert.equal(await page.locator('#categoryChips button[data-category="sedan"]').getAttribute('aria-pressed'),'true');
 });
 await test('Categoría sedán y reset',async()=>{
  await page.locator('#categoryChips button[data-category="sedan"]').click();
  assert.match(await page.locator('#sTotal').textContent(),/1\.072/);
  await page.locator('#reset').click();
  assert.match(await page.locator('#sTotal').textContent(),/8\.053/);
  assert.equal(await page.locator('#category').inputValue(),'');
 });
 await test('Marca, modelo y comparador de dos versiones',async()=>{
  await page.selectOption('#brand',{label:'Toyota'});
  await page.waitForFunction(()=>!document.querySelector('#model')?.disabled);
  const option=page.locator('#model option').filter({hasText:'Corolla Cross'}).first();
  const family=await option.getAttribute('value');
  assert(family,'No se encontró familia Corolla Cross');
  await page.selectOption('#model',family);
  assert.match(await page.locator('#sTotal').textContent(),/^4$/);
  await page.locator('#tbody button[data-compare]').first().click();
  assert.equal(await page.locator('#compareTrayCount').textContent(),'1 de 4 vehículos seleccionados');
  assert(await page.locator('#compareTray').isVisible());
  await page.locator('#tbody button[data-compare]').nth(1).click();
  assert.match(await page.locator('#compareTrayCount').textContent(),/^2 de 4/);
  assert(await page.locator('#comparison .matrix').isVisible());
  assert.equal(await page.locator('#comparison .matrix thead th').count(),3);
  assert.equal(await page.locator('#comparison .matrix tbody tr').count(),8);
  assert(await page.locator('#compareNow').isEnabled());
 });
 await test('Selección persiste entre filtros y advierte NEDC/WLTP',async()=>{
  await page.locator('#reset').click();
  await page.locator('#search').fill('Toyota Hilux BEV');
  await page.waitForTimeout(150);
  assert(await page.locator('#tbody button[data-compare]').count()>0);
  await page.locator('#tbody button[data-compare]').first().click();
  assert.match(await page.locator('#compareTrayCount').textContent(),/^3 de 4/);
  assert(await page.locator('#comparisonWarning').isVisible());
  assert.match(await page.locator('#comparisonWarning').textContent(),/NEDC y WLTP/);
  await page.locator('#compareReset').click();
  assert(await page.locator('#compareTray').isHidden());
  assert.match(await page.locator('#comparison').textContent(),/tu comparador está esperando vehículos/i);
 });
 await test('Buscador y categoría conservan filtros al usar Buscar',async()=>{
  await page.locator('#reset').click();
  await page.locator('#categoryChips button[data-category="sw"]').click();
  await page.locator('#search').fill('Corolla Cross');
  const count=await page.locator('#sTotal').textContent();
  assert(count!=='0');
  await page.locator('#catalogSearchButton').click();
  assert.equal(await page.locator('#category').inputValue(),'sw');
  assert.equal(await page.locator('#sTotal').textContent(),count);
  await page.locator('#reset').click();
  await page.locator('#search').fill('Corolla');
  assert.equal(await page.locator('#sTotal').textContent(),'21');
 });
 await test('Filtros técnicos en bloque secundario',async()=>{
  await page.locator('#advancedFilters summary').click();
  assert(await page.locator('#cycle').isVisible());
  await page.selectOption('#cycle','WLTP');
  const wltp=await page.locator('#sTotal').textContent();
  assert.notEqual(wltp,'8.053');
  await page.locator('#reset').click();
  assert.equal(await page.locator('#cycle').inputValue(),'');
 });
 await test('Tarifas configurables siguen funcionando',async()=>{
  await page.locator('.energy-shortcut').click();
  assert(await page.locator('#energyPanel').evaluate(el=>el.open));
  await page.selectOption('#charge','dc50');
  assert.match(await page.locator('#activeTariff').textContent(),/\$395\/kWh/);
  await page.selectOption('#period','peak');
  assert.match(await page.locator('#activeTariff').textContent(),/\$450\/kWh/);
 });
 await test('Búsqueda libre Corolla Cross sin selección previa',async()=>{
  await page.locator('#reset').click();
  await page.locator('#search').fill('Corolla Cross');
  assert.equal(await page.locator('#sTotal').textContent(),'4');
  assert.equal(await page.locator('#sort').inputValue(),'relevance');
  assert.equal(await page.locator('#tbody tr').count(),4);
 });
 await test('Categoría cambia opciones de marcas y modelos',async()=>{
  await page.locator('#reset').click();
  await page.selectOption('#category','pickup');
  assert.equal(await page.locator('#sTotal').textContent(),'1.056');
  assert.equal(await page.locator('#brand option').count(),58);
  await page.selectOption('#brand',{label:'Toyota'});
  assert(await page.locator('#model option').filter({hasText:'Hilux'}).count()>0);
  assert.equal(await page.locator('#model option').filter({hasText:'Corolla Cross'}).count(),0);
  await page.selectOption('#category','sw');
  assert(await page.locator('#model option').filter({hasText:'Corolla Cross'}).count()>0);
 });
 await test('Conflictos de categoría pueden eliminarse con un clic',async()=>{
  await page.locator('#reset').click();
  await page.selectOption('#category','pickup');
  await page.locator('#search').fill('Corolla Cross');
  assert.equal(await page.locator('#sTotal').textContent(),'0');
  assert(await page.locator('#showAllSearch').isVisible());
  await page.locator('#showAllSearch').click();
  assert.equal(await page.locator('#sTotal').textContent(),'4');
  assert.equal(await page.locator('#category').inputValue(),'');
 });
 await test('Sugerencia por error de escritura',async()=>{
  await page.locator('#reset').click();
  await page.locator('#search').fill('Corolla Croos');
  assert.equal(await page.locator('#sTotal').textContent(),'0');
  assert(await page.locator('#searchAlternatives button').count()>0);
  await page.locator('#searchAlternatives button').first().click();
  assert(await page.locator('#tbody tr').count()>0);
 });
 await test('Mostrar diez resultados y después veinte',async()=>{
  await page.locator('#reset').click();
  assert.equal(await page.locator('#tbody tr').count(),10);
  await page.locator('#next').click();
  assert.equal(await page.locator('#tbody tr').count(),20);
 });
 await test('La fuente de motorización queda distinguida en las fichas',async()=>{
  await page.locator('#tbody button[data-detail]').first().click();
  assert.match(await page.locator('#detailBody').textContent(),/Motorización declarada \(3CV\)/);
  assert.match(await page.locator('#detailBody').textContent(),/Clasificación interpretativa/);
  await page.locator('#closeDetail').click();
 });
 await test('Paneles editoriales son accesibles y están plegados',async()=>{
  assert.equal(await page.locator('#analysisDisclosure').evaluate(x=>x.open),false);
  await page.locator('#analysisDisclosure summary').click();
  assert.equal(await page.locator('#analysisDisclosure').evaluate(x=>x.open),true);
 });
 await test('Sin errores JS en escritorio',async()=>{assert.deepEqual(errors,[])});
 await page.close();
 const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,deviceScaleFactor:2});
 const mobileErrors=[];mobile.on('pageerror',e=>mobileErrors.push(e.message));
 await test('Categorías móviles y navegación accesible',async()=>{
  await mobile.goto(base,{waitUntil:'networkidle'});
  await mobile.waitForFunction(()=>document.querySelector('#sTotal')?.textContent?.includes('8.053'));
  assert(await mobile.locator('#category').isVisible());
  assert(await mobile.locator('#categoryChips').isHidden());
  await mobile.selectOption('#category','pickup');
  assert.match(await mobile.locator('#sTotal').textContent(),/1\.056/);
  assert.deepEqual(mobileErrors,[]);
 });
 await test('Menú móvil compacto se abre y se cierra',async()=>{
  assert(await mobile.locator('#mobileMenuToggle').isVisible());
  assert(await mobile.locator('#mainNav').isHidden());
  await mobile.locator('#mobileMenuToggle').click();
  assert(await mobile.locator('#mainNav').isVisible());
  await mobile.locator('#mainNav a[href="#catalogo"]').click();
  assert(await mobile.locator('#mainNav').isHidden());
 });
 await test('Búsqueda móvil, lote corto y comparador accesible',async()=>{
  await mobile.locator('#reset').click();
  await mobile.locator('#search').fill('Corolla Cross');
  assert.equal(await mobile.locator('#sTotal').textContent(),'4');
  assert.equal(await mobile.locator('#tbody tr').count(),4);
  await mobile.locator('#tbody button[data-compare]').first().click();
  await mobile.locator('#tbody button[data-compare]').nth(1).click();
  assert(await mobile.locator('#compareTray').isVisible());
  assert.equal(await mobile.locator('#comparison .matrix thead th').count(),3);
  await mobile.locator('#compareNow').click();
  assert(await mobile.locator('#compareNext').isVisible());
  const start=await mobile.locator('.matrix-scroll').evaluate(e=>e.scrollLeft);
  await mobile.locator('#compareNext').click();
  await mobile.waitForTimeout(400);
  const end=await mobile.locator('.matrix-scroll').evaluate(e=>e.scrollLeft);
  assert(end>start);
  await mobile.locator('#compareReset').click();
 });
 await test('Portada móvil compacta y controles táctiles',async()=>{
  const m=await mobile.evaluate(()=>({
   hero:document.querySelector('.hero').getBoundingClientRect().height,
   art:getComputedStyle(document.querySelector('.hero-art')).display,
   menu:document.querySelector('#mobileMenuToggle').getBoundingClientRect().height,
   search:document.querySelector('#search').getBoundingClientRect().height
  }));
  assert(m.hero<750,'Portada excede 750 px: '+m.hero);
  assert.equal(m.art,'none');
  assert(m.menu>=44&&m.search>=44);
 });
 await test('Sin desbordamiento horizontal en móvil',async()=>{
  const dimensions=await mobile.evaluate(()=>({doc:document.documentElement.scrollWidth,view:window.innerWidth}));
  assert(dimensions.doc<=dimensions.view+3,'Desbordamiento global: '+JSON.stringify(dimensions));
 });
 await mobile.close();await browser.close();
 console.log('\n'+checks+' pruebas aprobadas · '+failures+' fallidas');
 if(failures)process.exit(1);
})().catch(error=>{console.error(error);process.exit(1)});
