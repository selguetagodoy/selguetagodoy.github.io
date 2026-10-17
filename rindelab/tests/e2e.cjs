/* RINDELAB v6 — pruebas funcionales en Chromium */
const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
const browser=await chromium.launch(process.platform==='win32'?{channel:'chrome',headless:true}:{headless:true,args:['--no-sandbox']});
let passed=0,failed=0;
async function test(label,action){try{await action();console.log('PASS '+label);passed++;}catch(error){console.error('FAIL '+label+' — '+error.stack);failed++;}}
const base='http://127.0.0.1:8765/rindelab/';
async function open(width,height){
 const page=await browser.newPage({viewport:{width,height},isMobile:width<=390,hasTouch:width<=390,deviceScaleFactor:1});
 await page.emulateMedia({reducedMotion:'reduce'});
 const errors=[];page.on('pageerror',e=>errors.push('JS: '+e.message));page.on('console',m=>{if(m.type()==='error')errors.push('Console: '+m.text())});
 const r=await page.goto(base,{waitUntil:'networkidle',timeout:30000});assert.equal(r.status(),200);
 await page.waitForFunction(()=>document.querySelector('#recordCount')?.textContent==='8.053',{timeout:25000});
 return {page,errors};
}
const {page,errors}=await open(1440,900);
await test('Metadatos 3CV coinciden con registros visibles al corte',async()=>{
 const manifest=await page.evaluate(async()=>fetch('../vehiculos/data/manifest.json').then(r=>r.json()));
 assert.equal(manifest.count,8056);
 assert.equal(manifest.excluded,3);
 assert.equal(manifest.count-manifest.excluded,8053);
 assert.equal(await page.locator('#recordCount').textContent(),'8.053');
});
await test('Una sola interfaz sin estadísticas ni simuladores',async()=>{
 assert.match(await page.locator('h1').textContent(),/cada peso cuenta/i);
 assert.equal(await page.locator('.search-card-heading h2').textContent(),'Busca tu vehículo');
 assert(await page.locator('.hero-image img').isVisible());
 assert.equal(await page.locator('.stats,.tech-overview,.manual-scenario,.chart,.guide-steps').count(),0);
 assert.equal(await page.locator('#results').isHidden(),true);
 assert.equal(await page.locator('#compareTray').isHidden(),true);
});
await test('Abrir ranking conjunto NEDC y WLTP y ordenar por menor costo',async()=>{
 await page.locator('#statsOpen').click();
 assert(await page.locator('#statsDialog').evaluate(e=>e.open));
 assert.equal(await page.inputValue('#statsCycle'),'');
 assert.equal(await page.locator('.rank-item').count(),10);
 assert.equal(await page.locator('.rank-cycle').count(),10);
 const labels=await page.locator('.rank-cycle').allTextContents();
 assert(labels.every(x=>x==='WLTP'||x==='NEDC'||x==='Ciclo no informado'));
 const first=await page.locator('.rank-value').allTextContents();
 const costs=first.map(x=>Number(x.replace(/\D/g,''))).filter(Number.isFinite);
 assert(costs.length===10);
 assert(costs.every((v,i)=>i===0||costs[i-1]<=v),'Top 10 menor costo: '+JSON.stringify(costs));
 await page.locator('#statsClose').click();
 assert(await page.locator('#statsDialog').isHidden());
});
await test('Estadísticas cambian al ordenar mayor costo y al filtrar camionetas',async()=>{
 await page.locator('#statsOpen').click();
 await page.selectOption('#statsOrder','desc');
 const values=(await page.locator('.rank-value').allTextContents()).map(x=>Number(x.replace(/\D/g,''))).filter(Number.isFinite);
 assert(values.length===10);
 assert(values.every((v,i)=>i===0||values[i-1]>=v),'Top 10 mayor costo: '+JSON.stringify(values));
 await page.selectOption('#statsBody','pickup');
 assert.equal(await page.locator('.rank-item').count(),10);
 assert.match(await page.locator('#statsResultCount').textContent(),/fichas con esta medida/);
 assert((await page.locator('.rank-item').allTextContents()).every(x=>x.includes('Camioneta')));
 await page.locator('#statsClose').click();
});
await test('El filtro opcional permite WLTP o NEDC sin separar el ranking conjunto',async()=>{
 await page.locator('#statsOpen').click();
 await page.selectOption('#statsTech','');
 await page.selectOption('#statsBody','');
 await page.selectOption('#statsMetric','cost');
 await page.selectOption('#statsCycle','');
 const allCount=Number((await page.locator('#statsResultCount').textContent()).replace(/\D/g,''));
 assert(allCount>0);
 await page.selectOption('#statsCycle','WLTP');
 const wltpCount=Number((await page.locator('#statsResultCount').textContent()).replace(/\D/g,''));
 assert(wltpCount>0&&wltpCount<allCount,'WLTP '+wltpCount+' / all '+allCount);
 assert((await page.locator('.rank-cycle').allTextContents()).every(x=>x==='WLTP'));
 await page.selectOption('#statsCycle','NEDC');
 assert((await page.locator('.rank-cycle').allTextContents()).every(x=>x==='NEDC'));
 await page.selectOption('#statsCycle','');
 assert.equal(await page.inputValue('#statsCycle'),'');
 await page.locator('#statsClose').click();
});
await test('PHEV muestra 232 fichas y rendimiento eléctrico y ponderado sin costo inventado',async()=>{
 await page.locator('#statsOpen').click();
 await page.selectOption('#statsMetric','performance');
 assert.equal(await page.locator('.rank-item').count(),0);
 assert.match(await page.locator('#statsNotice').textContent(),/Selecciona una motorización/);
 await page.selectOption('#statsTech','PHEV');
 assert.equal(await page.inputValue('#statsMetric'),'electric');
 assert(await page.locator('#statsMetric option[value="cost"]').isDisabled());
 assert.equal(await page.locator('.rank-item').count(),10);
 assert.match(await page.locator('#statsResultCount').textContent(),/^232 fichas/);
 assert((await page.locator('.rank-value').allTextContents()).every(x=>x.includes('km/kWh')));
 assert.match(await page.locator('#statsMetricHint').textContent(),/No se calcula un costo energético combinado/);
 await page.selectOption('#statsMetric','weighted');
 assert.equal(await page.locator('.rank-item').count(),10);
 assert((await page.locator('.rank-value').allTextContents()).every(x=>x.includes('km/L pond.')));
 assert.match(await page.locator('#statsNotice').textContent(),/no equivale al rendimiento con batería descargada/);
 await page.locator('#statsClose').click();
});
await test('REEV muestra sus 8 registros y ambas métricas con orden dinámico',async()=>{
 await page.locator('#statsOpen').click();
 await page.selectOption('#statsTech','REEV');
 await page.selectOption('#statsMetric','electric');
 await page.selectOption('#statsOrder','asc');
 assert.equal(await page.inputValue('#statsMetric'),'electric');
 assert.match(await page.locator('#statsResultCount').textContent(),/^8 fichas/);
 assert.equal(await page.locator('.rank-item').count(),8);
 assert((await page.locator('.rank-value').allTextContents()).every(x=>x.includes('km/kWh')));
 const first=(await page.locator('.rank-value').allTextContents()).map(x=>Number(x.replace(/[^\d,.]/g,'').replace(',','.')));
 assert(first.every((v,i)=>i===0||first[i-1]<=v),'REEV ascendente '+first);
 await page.selectOption('#statsOrder','desc');
 const reversed=(await page.locator('.rank-value').allTextContents()).map(x=>Number(x.replace(/[^\d,.]/g,'').replace(',','.')));
 assert(reversed.every((v,i)=>i===0||reversed[i-1]>=v),'REEV descendente '+reversed);
 await page.selectOption('#statsMetric','weighted');
 assert.equal(await page.locator('.rank-item').count(),8);
 assert.match(await page.locator('#statsNotice').textContent(),/Rendimiento ponderado informado/);
 await page.selectOption('#statsMetric','electric');
 await page.locator('.rank-item').first().click();
 assert(await page.locator('#statsDialog').isHidden());
 assert.match(await page.locator('#detailContent').textContent(),/Rendimiento eléctrico informado/);
 await page.locator('#detailClose').click();
});
await test('Desaparece híbrido por verificar y se conserva tecnología 3CV',async()=>{
 assert.equal(await page.locator('#tech option[value="Híbrido por verificar"]').count(),0);
 assert.equal(await page.locator('#statsTech option[value="Híbrido por verificar"]').count(),0);
 await page.click('#resetButton');
 await page.fill('#query','Grand Vitara');await page.click('#searchButton');
 assert((await page.locator('.vehicle-card').count())>0);
 const candidate=page.locator('.vehicle-card').filter({hasText:'Híbrido'}).first();
 if(await candidate.count()){
  await candidate.locator('button[data-detail]').click();
  const detail=await page.locator('#detailContent').textContent();
  assert.match(detail,/Motorización declarada 3CV/);
  assert.match(detail,/Aclaración sobre el nombre comercial/);
  assert.match(detail,/Bencina/);
  await page.click('#detailClose');
 }
});
await test('Ranking abre ficha completa y cierra estadísticas',async()=>{
 await page.locator('#statsOpen').click();
 await page.selectOption('#statsTech','Bencina');
 await page.selectOption('#statsMetric','cost');
 await page.selectOption('#statsBody','');
 await page.locator('.rank-item').first().click();
 assert(await page.locator('#statsDialog').isHidden());
 assert(await page.locator('#detailDialog').evaluate(e=>e.open));
 assert.match(await page.locator('#detailContent').textContent(),/Código 3CV/);
 await page.locator('#detailClose').click();
});
await test('Buscar explícitamente y recuperar cuatro Corolla Cross',async()=>{
 await page.click('#resetButton');
 await page.fill('#query','Corolla Cross');
 assert.equal(await page.locator('#results').isHidden(),true);
 await page.click('#searchButton');
 assert.match(await page.locator('#resultCount').textContent(),/4 versiones encontradas/);
 assert.equal(await page.locator('.vehicle-card').count(),4);
 assert((await page.locator('.vehicle-card').allTextContents()).every(x=>x.includes('Corolla Cross')));
});
await test('Marca Toyota despliega solo modelos de Toyota',async()=>{
 await page.click('#resetButton');await page.selectOption('#brand',{label:'Toyota'});
 assert.equal(await page.locator('#model').isDisabled(),false);
 const opts=await page.locator('#model option').allTextContents();
 assert(opts.some(s=>s.includes('Corolla Cross')));assert(opts.some(s=>s.includes('Hilux')));
 const selected=await page.locator('#model option').filter({hasText:'Corolla Cross'}).first().getAttribute('value');
 await page.selectOption('#model',selected);assert.equal(await page.locator('#results').isHidden(),true);
 await page.click('#searchButton');assert.match(await page.locator('#resultCount').textContent(),/^4 versiones/);
});
await test('Filtros técnicos mantienen ciclo sin modificar la base',async()=>{
 await page.click('#resetButton');
 await page.selectOption('#brand',{label:'Toyota'});
 await page.locator('#technical summary').click();
 await page.selectOption('#cycle','WLTP');
 await page.selectOption('#model','');
 await page.click('#searchButton');
 assert(Number((await page.locator('#resultCount').textContent()).match(/\d+/)[0])>0);
 const rows=await page.locator('.vehicle-card').allTextContents();assert(rows.every(t=>t.includes('WLTP')));
});
await test('Orden menor costo es funcional y mantiene la selección',async()=>{
 await page.click('#resetButton');await page.selectOption('#brand',{label:'Toyota'});await page.click('#searchButton');
 await page.selectOption('#sort','cheapest');
 assert.equal(await page.inputValue('#sort'),'cheapest');
 assert(await page.locator('#sortNote').isVisible());
 const values=await page.locator('.vehicle-card').evaluateAll(nodes=>nodes.map(n=>({
  cycle:n.querySelector('.cycle-badge').textContent.trim(),
  value:Number(n.querySelector('.vehicle-cell:nth-child(3) strong').textContent.replace(/\D/g,''))||null
 })));
 assert(values.filter(x=>x.value).length>2);
 assert(values.every((x,i)=>i===0||values[i-1].value===null||x.value===null||values[i-1].value<=x.value),'Costo ascendente global: '+JSON.stringify(values));
 assert.equal(await page.locator('.group-label').count(),0);
 assert.equal(await page.locator('.cycle-badge').count(),await page.locator('.vehicle-card').count());
});
await test('Orden mayor costo y marca/modelo cambian el listado',async()=>{
 await page.selectOption('#sort','expensive');assert.equal(await page.inputValue('#sort'),'expensive');
 const values=await page.locator('.vehicle-card').evaluateAll(nodes=>nodes.map(n=>({
  cycle:n.querySelector('.cycle-badge').textContent.trim(),
  value:Number(n.querySelector('.vehicle-cell:nth-child(3) strong').textContent.replace(/\D/g,''))||null
 })));
 assert(values.filter(x=>x.value).length>2);
 assert(values.every((x,i)=>i===0||values[i-1].value===null||x.value===null||values[i-1].value>=x.value),'Costo descendente global: '+JSON.stringify(values));
 await page.selectOption('#sort','name');assert.equal(await page.inputValue('#sort'),'name');assert(await page.locator('#sortNote').isHidden());
});
await test('Más resultados funciona sin paginación compleja',async()=>{
 assert.equal(await page.locator('.vehicle-card').count(),10);
 await page.click('#more');assert.equal(await page.locator('.vehicle-card').count(),20);
});
await test('Error ortográfico sugiere Corolla Cross',async()=>{
 await page.click('#resetButton');await page.fill('#query','Corolla Croos');await page.click('#searchButton');
 assert.match(await page.locator('#resultCount').textContent(),/^0 versiones/);
 assert(await page.locator('#suggested button').count()>0);
 await page.locator('#suggested button').first().click();
 assert(Number((await page.locator('#resultCount').textContent()).match(/\d+/)[0])>0);
});
await test('Filtros incompatibles ofrecen recuperación',async()=>{
 await page.click('#resetButton');await page.selectOption('#brand',{label:'Ford'});await page.fill('#query','Corolla Cross');await page.click('#searchButton');
 assert.match(await page.locator('#resultCount').textContent(),/^0 versiones/);
 assert.match(await page.locator('#suggested').textContent(),/sin filtros/);
 await page.locator('#suggested button').first().click();
 assert.match(await page.locator('#resultCount').textContent(),/^4 versiones/);
});
await test('La ficha conserva origen y cifra oficial',async()=>{
 await page.locator('.vehicle-card button[data-detail]').first().click();
 assert(await page.locator('#detailDialog').evaluate(x=>x.open));
 assert.match(await page.locator('#detailContent').textContent(),/Motorización declarada 3CV/);
 assert.match(await page.locator('#detailContent').textContent(),/Código 3CV/);
 await page.click('#detailClose');
});
await test('Comparar exactamente dos vehículos y limpiar selección',async()=>{
 await page.locator('.vehicle-card button[data-compare]').first().click();
 assert(await page.locator('#compareTray').isVisible());assert(await page.locator('#compareOpen').isDisabled());
 await page.locator('.vehicle-card button[data-compare]').nth(1).click();
 assert(await page.locator('#compareOpen').isEnabled());await page.locator('#compareOpen').click();
 assert(await page.locator('#compareDialog').evaluate(x=>x.open));
 assert.equal(await page.locator('#compareContent .compare-row').count(),8);
 await page.locator('#compareClose').click();await page.click('#compareClear');
 assert(await page.locator('#compareTray').isHidden());
});
await test('Selección persistente al cambiar de búsqueda o limpiar los filtros',async()=>{
 await page.click('#resetButton');
 await page.fill('#query','Corolla Cross');await page.click('#searchButton');
 await page.locator('.vehicle-card button[data-compare]').first().click();
 assert.match(await page.locator('#compareStatus').textContent(),/1 vehículo seleccionado/);
 await page.locator('#compareAdd').click();
 assert(await page.locator('#query').evaluate(e=>document.activeElement===e));
 await page.fill('#query','Hilux');await page.click('#searchButton');
 assert((await page.locator('.vehicle-card').count())>0);
 await page.locator('.vehicle-card button[data-compare]').first().click();
 assert.equal(await page.locator('.selected-vehicle-chip').count(),2);
 await page.click('#resetButton');
 assert(await page.locator('#results').isHidden());
 assert.equal(await page.locator('.selected-vehicle-chip').count(),2);
 assert(await page.locator('#compareOpen').isEnabled());
});
await test('Agregar hasta cinco modelos de búsquedas diferentes y rechazar el sexto',async()=>{
 for(const name of ['Ford','Hyundai','Kia']){
  await page.fill('#query',name);await page.click('#searchButton');
  assert((await page.locator('.vehicle-card').count())>0,name);
  await page.locator('.vehicle-card button[data-compare]').first().click();
 }
 assert.equal(await page.locator('.selected-vehicle-chip').count(),5);
 assert.match(await page.locator('#compareStatus').textContent(),/5 de 5/);
 assert.equal(await page.locator('#compareOpen').textContent(),'Comparar 5 vehículos');
 await page.fill('#query','BYD');await page.click('#searchButton');
 await page.locator('.vehicle-card button[data-compare]').first().click();
 assert.equal(await page.locator('.selected-vehicle-chip').count(),5);
 assert.match(await page.locator('#compareStatus').textContent(),/Quita uno/);
});
await test('Ventana de cinco columnas permite scroll, quitar uno y agregar otro',async()=>{
 await page.click('#compareOpen');
 assert(await page.locator('#compareDialog').evaluate(e=>e.open));
 assert.equal(await page.locator('.comparison-table thead th').count(),6);
 assert.equal(await page.locator('.comparison-table tbody tr').count(),7);
 assert.equal(await page.locator('.compare-model-cell').count(),5);
 const horizontal=await page.locator('.compare-scroller').evaluate(e=>({width:e.scrollWidth,visible:e.clientWidth,start:e.scrollLeft}));
 if(horizontal.width>horizontal.visible+2){
  await page.locator('#compareNext').click();await page.waitForTimeout(400);
  assert((await page.locator('.compare-scroller').evaluate(e=>e.scrollLeft))>horizontal.start);
 }else{
  assert(await page.locator('.compare-scroll-actions').isHidden(),'Las flechas deben ocultarse cuando caben cinco columnas');
 }
 await page.locator('.compare-remove').first().click();
 assert.equal(await page.locator('.compare-model-cell').count(),4);
 assert.equal(await page.locator('.selected-vehicle-chip').count(),4);
 await page.click('#compareDialogAdd');
 assert(await page.locator('#compareDialog').isHidden());
 assert(await page.locator('#query').evaluate(e=>document.activeElement===e));
 await page.fill('#query','BYD');await page.click('#searchButton');
 await page.locator('.vehicle-card button[data-compare]').first().click();
 assert.equal(await page.locator('.selected-vehicle-chip').count(),5);
 await page.click('#compareOpen');
 assert.equal(await page.locator('.comparison-table thead th').count(),6);
 await page.click('#compareClose');
});
await test('Quitar un vehículo de la bandeja permite agregar otro sin vaciar',async()=>{
 await page.locator('.selected-chip-remove').first().click();
 assert.equal(await page.locator('.selected-vehicle-chip').count(),4);
 await page.fill('#query','Corolla Cross');await page.click('#searchButton');
 await page.locator('.vehicle-card button[data-compare]').first().click();
 assert.equal(await page.locator('.selected-vehicle-chip').count(),5);
 await page.click('#compareClear');
 assert(await page.locator('#compareTray').isHidden());
});
await test('No hay cálculos inventados para PHEV y REEV',async()=>{
 await page.click('#resetButton');await page.selectOption('#tech','PHEV');await page.click('#searchButton');
 assert((await page.locator('.vehicle-card').count())>0);
 const values=await page.locator('.vehicle-card .vehicle-cell:nth-child(3) strong').allTextContents();
 assert(values.every(x=>x.includes('Sin dato comparable')));
});
await test('Enchufables no presentan un orden por costo que no pueden calcular',async()=>{
 await page.click('#resetButton');
 await page.selectOption('#tech','PHEV');
 await page.click('#searchButton');
 assert(await page.locator('#sort option[value="cheapest"]').isDisabled());
 assert(await page.locator('#sort option[value="expensive"]').isDisabled());
 assert.match(await page.locator('#sortNote').textContent(),/No hay costo energético combinado calculable/);
 assert.equal(await page.inputValue('#sort'),'recent');
 await page.locator('.vehicle-card').first().locator('button[data-detail]').click();
 const detail=await page.locator('#detailContent').textContent();
 assert.match(detail,/Rendimiento eléctrico informado \(km\/kWh\)/);
 assert.match(detail,/Rendimiento ponderado informado \(km\/L\)/);
 assert.match(detail,/No calculable sin supuestos/);
 await page.locator('#detailClose').click();
 await page.click('#resetButton');
 await page.selectOption('#tech','Diésel');
 await page.click('#searchButton');
 assert(await page.locator('#sort option[value="cheapest"]').isEnabled());
 await page.selectOption('#sort','cheapest');
 assert.equal(await page.inputValue('#sort'),'cheapest');
});
await test('Comparación enchufable y eléctrico desglosa rendimientos sin inferir costos',async()=>{
 if(await page.locator('#compareTray').isVisible())await page.click('#compareClear');
 await page.click('#resetButton');
 await page.selectOption('#tech','PHEV');
 await page.click('#searchButton');
 await page.locator('.vehicle-card button[data-compare]').first().click();
 await page.click('#resetButton');
 await page.selectOption('#tech','REEV');
 await page.click('#searchButton');
 await page.locator('.vehicle-card button[data-compare]').first().click();
 await page.click('#resetButton');
 await page.selectOption('#tech','EV');
 await page.click('#searchButton');
 await page.locator('.vehicle-card button[data-compare]').first().click();
 assert.equal(await page.locator('.selected-vehicle-chip').count(),3);
 await page.click('#compareOpen');
 const labels=await page.locator('.comparison-table tbody th.compare-label').allTextContents();
 assert(labels.includes('Rendimiento eléctrico (km/kWh)'));
 assert(labels.includes('Rendimiento ponderado (km/L)'));
 assert.equal(await page.locator('.comparison-table thead th').count(),4);
 assert.equal(await page.locator('.comparison-table tbody tr').count(),9);
 const note=await page.locator('#compareContent').textContent();
 assert.match(note,/Sin dato comparable/);
 await page.click('#compareClose');
 await page.click('#compareClear');
});
await test('Edición de precios modifica costos, sin bloquear el ordenamiento',async()=>{
 await page.click('#resetButton');await page.selectOption('#tech','Diésel');await page.click('#searchButton');
 let first=(await page.locator('.vehicle-card .vehicle-cell:nth-child(3) strong').first().textContent());
 await page.locator('#methodology summary').first().click();
 await page.locator('#priceSettings summary').click();
 await page.fill('#dieselPrice','2500');await page.locator('#dieselPrice').dispatchEvent('change');
 let second=(await page.locator('.vehicle-card .vehicle-cell:nth-child(3) strong').first().textContent());
 assert.notEqual(first,second);
 await page.selectOption('#sort','cheapest');assert.equal(await page.inputValue('#sort'),'cheapest');
});
await test('Orden global mezcla ciclos y muestra su etiqueta individual',async()=>{
 await page.click('#resetButton');
 await page.click('#searchButton');
 await page.selectOption('#sort','cheapest');
 await page.click('#more');
 const labels=await page.locator('#resultList .cycle-badge').allTextContents();
 assert(labels.length===20);
 assert(labels.every(x=>x==='WLTP'||x==='NEDC'||x==='Ciclo no informado'));
 assert.equal(await page.locator('.group-label').count(),0);
 assert.match(await page.locator('#sortNote').textContent(),/Orden único/);
});
await test('JavaScript escritorio sin errores',async()=>assert.deepEqual(errors,[]));
await page.close();
for(const [width,height] of [[768,1024],[390,844],[320,700]]){
 const {page:p,errors:issues}=await open(width,height);
 await test('Estadísticas accesibles y top 10 legible '+width+' px',async()=>{
  await p.locator('#statsOpen').click();
  assert(await p.locator('#statsDialog').evaluate(e=>e.open));
  assert.equal(await p.locator('.rank-item').count(),10);
  await p.selectOption('#statsMetric','performance');
  await p.selectOption('#statsTech','EV');
  assert((await p.locator('.rank-item').count())>0);
  const geometry=await p.evaluate(()=>({doc:document.documentElement.scrollWidth,viewport:innerWidth,modal:document.querySelector('#statsDialog').getBoundingClientRect().width,rank:document.querySelector('.rank-item').getBoundingClientRect().width}));
  assert(geometry.doc<=geometry.viewport+3,JSON.stringify(geometry));
  assert(geometry.modal<=geometry.viewport);
  assert(geometry.rank<geometry.modal);
  await p.locator('#statsClose').click();
 });
 await test('PHEV y REEV ofrecen datos en ventana móvil '+width+' px',async()=>{
  await p.locator('#statsOpen').click();
  await p.selectOption('#statsTech','PHEV');
  assert.equal(await p.inputValue('#statsMetric'),'electric');
  assert.equal(await p.locator('.rank-item').count(),10);
  await p.selectOption('#statsTech','REEV');
  assert.equal(await p.locator('.rank-item').count(),8);
  await p.selectOption('#statsMetric','weighted');
  assert.equal(await p.locator('.rank-item').count(),8);
  const size=await p.evaluate(()=>({doc:document.documentElement.scrollWidth,screen:innerWidth}));
  assert(size.doc<=size.screen+3);
  await p.locator('#statsClose').click();
 });
  await test('Diseño responsivo '+width+' px sin desbordamiento',async()=>{
  const dimensions=await p.evaluate(()=>({doc:document.documentElement.scrollWidth,view:innerWidth,search:document.querySelector('#searchButton').getBoundingClientRect().height,searchTop:document.querySelector('#searchButton').getBoundingClientRect().top+scrollY}));
  assert(dimensions.doc<=dimensions.view+3,JSON.stringify(dimensions));
  assert(dimensions.search>=44);
  if(width<=390)assert(dimensions.searchTop<900,'Buscador excesivamente bajo: '+dimensions.searchTop);
 });
 await test('Cinco columnas desplazables en pantalla '+width+' px',async()=>{
  await p.fill('#query','Toyota');await p.click('#searchButton');
  for(let i=0;i<5;i++)await p.locator('.vehicle-card button[data-compare]').nth(i).click();
  assert.equal(await p.locator('.selected-vehicle-chip').count(),5);
  await p.locator('#compareOpen').click();
  assert.equal(await p.locator('.comparison-table thead th').count(),6);
  const geometry=await p.evaluate(()=>{const e=document.querySelector('.compare-scroller');return {doc:document.documentElement.scrollWidth,view:innerWidth,width:e.scrollWidth,visible:e.clientWidth}});
  assert(geometry.doc<=geometry.view+3,JSON.stringify(geometry));
  assert(geometry.width>geometry.visible,JSON.stringify(geometry));
  await p.locator('#compareNext').click();await p.waitForTimeout(400);
  assert((await p.locator('.compare-scroller').evaluate(e=>e.scrollLeft))>0);
  await p.locator('#compareDialogAdd').click();
  assert(await p.locator('#compareDialog').isHidden());
  assert.equal(await p.locator('.selected-vehicle-chip').count(),5);
  await p.locator('#compareClear').click();
 });
 await test('Búsqueda y comparación '+width+' px',async()=>{
  await p.fill('#query','Corolla Cross');await p.click('#searchButton');
  assert.match(await p.locator('#resultCount').textContent(),/^4 versiones/);
  await p.locator('.vehicle-card button[data-compare]').first().click();
  await p.locator('.vehicle-card button[data-compare]').nth(1).click();
  await p.locator('#compareOpen').click();
  assert(await p.locator('#compareDialog').evaluate(x=>x.open));
  const dims=await p.evaluate(()=>({doc:document.documentElement.scrollWidth,view:innerWidth}));
  assert(dims.doc<=dims.view+3);
  assert.deepEqual(issues,[]);
 });
 await p.close();
}
await browser.close();console.log('\n'+passed+' aprobadas · '+failed+' fallidas');
if(failed)process.exit(1);
})().catch(e=>{console.error(e);process.exit(1)});
