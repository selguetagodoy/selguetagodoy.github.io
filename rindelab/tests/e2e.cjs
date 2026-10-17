/* QA navegador de RINDELAB v4.
  Ejecutar desde la raíz del repositorio después de: npm install --no-save playwright
  Requiere un servidor HTTP local: python3 -m http.server 8765
*/
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
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
  assert.match(await page.locator('#comparison').textContent(),/selecciona dos vehículos/i);
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
 await test('Sin desbordamiento horizontal en móvil',async()=>{
  const dimensions=await mobile.evaluate(()=>({doc:document.documentElement.scrollWidth,view:window.innerWidth}));
  assert(dimensions.doc<=dimensions.view+3,'Desbordamiento global: '+JSON.stringify(dimensions));
 });
 await mobile.close();await browser.close();
 console.log('\n'+checks+' pruebas aprobadas · '+failures+' fallidas');
 if(failures)process.exit(1);
})().catch(error=>{console.error(error);process.exit(1)});
