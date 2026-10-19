/* RINDELAB v6 — pruebas funcionales en Chromium */
const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
const browser=await chromium.launch(process.platform==='win32'?{channel:'chrome',headless:true}:{headless:true,args:['--no-sandbox']});
let passed=0,failed=0;
async function test(label,action){
 try{await action();console.log('PASS '+label);passed++;}
 catch(error){
  console.error('FAIL '+label+' — '+error.stack);failed++;
  // Evitar fallos en cascada: un assert puede interrumpir una prueba con un modal abierto,
  // impidiendo hacer clic durante 30 s a todas las pruebas siguientes.
  for(const context of browser.contexts()){
   for(const page of context.pages()){
    await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close())).catch(()=>{});
   }
  }
 }
}
const base='http://127.0.0.1:8765/rindelab/';
async function open(width,height){
 const page=await browser.newPage({viewport:{width,height},isMobile:width<=390,hasTouch:width<=390,deviceScaleFactor:1});
 await page.emulateMedia({reducedMotion:'reduce'});
 const errors=[];page.on('pageerror',e=>errors.push('JS: '+e.message));page.on('console',m=>{if(m.type()==='error')errors.push('Console: '+m.text())});
 const r=await page.goto(base,{waitUntil:'networkidle',timeout:30000});assert.equal(r.status(),200);
 await page.waitForFunction(()=>document.querySelector('#recordCount')?.textContent==='8.325' && document.querySelector('#searchButton')?.disabled===false,{timeout:25000});
 return {page,errors};
}
const {page,errors}=await open(1440,900);
await test('Foto elegida por el usuario se conserva sin invadir la búsqueda principal',async()=>{
 const img=page.locator('.hero-image img');
 assert(await img.isHidden());
 const src=await img.getAttribute('src');
 assert.match(src,/^\.\/hero-foto-rindelab\.webp\?v=20261018-1$/);
 const metrics=await img.evaluate(el=>({complete:el.complete,naturalWidth:el.naturalWidth,naturalHeight:el.naturalHeight,renderedWidth:el.getBoundingClientRect().width}));
 assert(metrics.complete&&metrics.naturalWidth===450&&metrics.naturalHeight===253,JSON.stringify(metrics));
 assert.equal(metrics.renderedWidth,0);
 assert.match(await img.getAttribute('alt'),/automóviles.*iluminado en azul/i);
 assert.equal(await page.locator('.hero-image-caption').textContent(),'Imagen referencial de vehículos');
});

await test('Metadatos 3CV coinciden con registros visibles al corte',async()=>{
 const manifest=await page.evaluate(async()=>fetch('../vehiculos/data/manifest.json').then(r=>r.json()));
 assert.equal(manifest.count,8056);
 assert.equal(manifest.excluded,3);
 assert.equal(manifest.count-manifest.excluded,8053);
 assert.equal(await page.locator('#recordCount').textContent(),'8.325');
 const extra=await page.evaluate(async()=>Promise.all([1,2,3,4].map(i=>fetch('./data/oficial-api-20261018-'+String(i).padStart(2,'0')+'.json').then(r=>r.json()))).then(a=>a.reduce((n,p)=>n+p.items.length,0)));
 assert.equal(extra,272);
});
await test('Una sola interfaz sin estadísticas ni simuladores',async()=>{
 assert.match(await page.locator('h1').textContent(),/cuánto gastarías/i);
 assert.equal(await page.locator('.search-card-heading h2').textContent(),'Busca un auto');
 assert(await page.locator('.hero-image img').isHidden());
 assert.equal(await page.locator('.stats,.tech-overview,.manual-scenario,.chart,.guide-steps').count(),0);
 assert.equal(await page.locator('#results').isHidden(),true);
 assert.equal(await page.locator('#compareTray').isHidden(),true);
});
await test('RINDELAB 7 muestra escenarios y metadatos compartibles',async()=>{
 assert(await page.locator('#annualKm').isVisible());
 assert(await page.locator('#electricPrice').isVisible());
 assert.equal(await page.locator('#annualKm').inputValue(),'15000');
 assert.equal(await page.locator('#statsCycle').inputValue(),'WLTP');
 assert.match(await page.locator('head meta[property="og:image"]').getAttribute('content'),/rindelab\/hero-foto-rindelab\.webp/);
 assert.equal(await page.locator('script[type="application/ld+json"]').count(),1);
 assert(await page.locator('.footer-data summary').isVisible());
});
await test('Carga publica: tarifas verificables por potencia, lugar y horario',async()=>{
 assert.equal(await page.inputValue('#chargeScenario'),'public');
 assert.equal(await page.inputValue('#electricPrice'),'340');
 assert(await page.locator('#publicChargeField').isVisible());
 assert(await page.locator('#homeChargeField').isHidden());
 await page.selectOption('#publicChargeRate',{label:'DC ≥120 kW · ciudad punta · $495'});
 assert.equal(await page.inputValue('#electricPrice'),'495');
 assert.match(await page.locator('#chargeStatus').textContent(),/Copec Voltex/);
 await page.selectOption('#publicChargeRate',{label:'AC ≤22 kW · ciudad valle · $340'});
 assert.equal(await page.inputValue('#electricPrice'),'340');
});
await test('Carga en casa exige una tarifa manual y no inventa costo EV',async()=>{
 await page.selectOption('#chargeScenario','home');
 assert(await page.locator('#homeChargeField').isVisible());
 assert(await page.locator('#publicChargeField').isHidden());
 assert.equal(await page.inputValue('#electricPrice'),'');
 assert.match(await page.locator('#chargeStatus').textContent(),/Introduce tu precio/);
 await page.selectOption('#tech','EV');await page.click('#searchButton');
 assert.match(await page.locator('.vehicle-card .no-data').first().textContent(),/Sin dato comparable/);
 await page.fill('#homeChargeRate','200');
 await page.locator('#homeChargeRate').dispatchEvent('change');
 assert.equal(await page.inputValue('#electricPrice'),'200');
 assert.match(await page.locator('.vehicle-card .vehicle-cell:nth-child(3) strong').first().textContent(),/\$/);
 await page.click('#resetButton');
});
await test('Escenario mixto pondera precios sin imputar rendimiento o perdidas',async()=>{
 await page.selectOption('#chargeScenario','mixed');
 assert(await page.locator('#homeShareField').isVisible());
 assert.equal(await page.inputValue('#homeChargeShare'),'80');
 assert.equal(await page.inputValue('#electricPrice'),'228');
 await page.selectOption('#publicChargeRate',{label:'DC ≥120 kW · ciudad punta · $495'});
 assert.equal(await page.inputValue('#electricPrice'),'259');
 await page.selectOption('#homeChargeShare','60');
 assert.equal(await page.inputValue('#electricPrice'),'318');
 await page.selectOption('#chargeScenario','manual');
 assert(await page.locator('#publicChargeField').isHidden());
 assert(await page.locator('#homeChargeField').isHidden());
 await page.fill('#electricPrice','260');
 await page.locator('#electricPrice').dispatchEvent('change');
 assert.equal(await page.inputValue('#electricPrice'),'260');
 await page.selectOption('#chargeScenario','public');
 await page.selectOption('#publicChargeRate',{label:'AC ≤22 kW · ciudad valle · $340'});
 assert.equal(await page.inputValue('#electricPrice'),'340');
});
await test('La calculadora distingue el precio de carga residencial y pública para una misma energía',async()=>{
 assert.equal(await page.inputValue('#chargeKwh'),'20');
 assert.equal(await page.locator('#publicSessionCost').textContent(),'$6.800');
 await page.selectOption('#chargeScenario','home');
 assert(await page.locator('#homeBillHelper').isVisible());
 await page.fill('#homeChargeRate','240');
 assert.equal(await page.inputValue('#homeChargeRate'),'240');
 await page.waitForFunction(()=>document.querySelector('#homeSessionCost')?.textContent==='$4.800',{timeout:4000});
 assert.equal(await page.locator('#homeSessionCost').textContent(),'$4.800');
 assert.equal(await page.locator('#publicSessionCost').textContent(),'$6.800');
 assert.match(await page.locator('#chargeDifference').textContent(),/2.000.*menos/);
 await page.fill('#chargeKwh','40');
 assert.equal(await page.locator('#homeSessionCost').textContent(),'$9.600');
 assert.equal(await page.locator('#publicSessionCost').textContent(),'$13.600');
 await page.fill('#chargeKwh','20');
});
await test('La boleta produce un precio medio explícito, sin equipararlo al cargo marginal',async()=>{
 await page.selectOption('#chargeScenario','home');
 if(!(await page.locator('#homeBillHelper').evaluate(el=>el.open)))await page.locator('#homeBillHelper summary').click();
 await page.fill('#homeBillAmount','35000');
 await page.fill('#homeBillKwh','150');
 await page.fill('#homeBillFixed','1500');
 await page.locator('#calcHomeFromBill').click();
 assert.equal(await page.inputValue('#homeChargeRate'),'223.33');
 assert.equal(await page.inputValue('#electricPrice'),'223.33');
 assert.equal(await page.locator('#homeSessionCost').textContent(),'$4.467');
 assert.match(await page.locator('#homeBillStatus').textContent(),/Precio medio aproximado/);
 assert.match(await page.locator('#homeBillStatus').textContent(),/No equivale necesariamente/);
});
await test('No acepta boleta inconsistente ni atribuye tarifa residencial a una comuna',async()=>{
 await page.selectOption('#chargeScenario','home');
 if(!(await page.locator('#homeBillHelper').evaluate(el=>el.open)))await page.locator('#homeBillHelper summary').click();
 await page.fill('#homeBillAmount','1000');
 await page.fill('#homeBillFixed','2000');
 await page.locator('#calcHomeFromBill').click();
 assert.match(await page.locator('#homeBillStatus').textContent(),/Verifica/);
 assert.equal(await page.inputValue('#homeChargeRate'),'223.33');
 assert.match(await page.locator('.assumptions-note').textContent(),/comuna, distribuidora/);
});
await test('La ficha EV muestra costos diferenciados de casa y electrolinera',async()=>{
 await page.click('#resetButton');
 await page.selectOption('#tech','EV');
 await page.click('#searchButton');
 await page.locator('.vehicle-card button[data-detail]').first().click();
 const labels=await page.locator('#detailContent dt').allTextContents();
 assert(labels.includes('Costo de 100 km cargando en casa'));
 assert(labels.includes('Costo de 100 km en electrolinera seleccionada'));
 assert(labels.some(x=>x.startsWith('Costo de recarga en casa (20 kWh)')));
 assert(labels.some(x=>x.startsWith('Costo de recarga pública (20 kWh)')));
 await page.locator('#detailClose').click();
 await page.click('#resetButton');
 await page.selectOption('#chargeScenario','public');
});
await test('Costo anual y quinquenal responde al kilometraje sin extrapolar PHEV',async()=>{
 await page.selectOption('#tech','Bencina');await page.click('#searchButton');
 const row=page.locator('.vehicle-card').first();
 const before=await row.locator('.annual-result').textContent();
 assert.match(before,/año.*5 años/);
 await page.selectOption('#annualKm','20000');
 const after=await row.locator('.annual-result').textContent();
 assert.notEqual(before,after);
 await page.selectOption('#annualKm','15000');
 await page.locator('.vehicle-card button[data-detail]').first().click();
 assert.match(await page.locator('#detailContent').textContent(),/Gasto energético anual estimado/);
 assert.equal(await page.locator('#detailContent dt').filter({hasText:'Conector AC'}).count(),0);
 await page.locator('#detailClose').click();
 await page.click('#resetButton');
});
await test('Carrocerías 3CV: ocho grupos exclusivos cubren todas las 8.053 fichas',async()=>{
 const audit=await page.evaluate(async()=>{
  const mf=await fetch('../vehiculos/data/manifest.json').then(r=>r.json());
  const list=(await Promise.all(mf.files.map(f=>fetch('../vehiculos/'+f).then(r=>r.json())))).flat()
   .filter(r=>r&&r[0]&&r[1]&&r[8]&&r[8]<=mf.published);
  const groups={
   station:['Station Wagon'],
   offroad:['Jeep','Tipo Jeep'],
   sedan:['Sedán','Limusina'],
   hatch:['Hatchback'],
   pickup:['Camioneta'],
   sport:['Coupé','Cabriolet','Convertible','Descapotable','Roadster'],
   van:['Furgón','Van','Minivan','Microvan'],
   bus:['Bus','Minibus']
  };
  const counts={};let overlaps=0,unmapped=0;
  for(const key of Object.keys(groups))counts[key]=0;
  for(const r of list){
   const hits=Object.entries(groups).filter(([,names])=>names.includes(r[4])).map(([key])=>key);
   if(hits.length===0)unmapped++;
   if(hits.length>1)overlaps++;
   for(const key of hits)counts[key]++;
  }
  return {total:list.length,unmapped,overlaps,counts,sourceLabels:new Set(list.map(r=>r[4])).size};
 });
 assert.equal(audit.total,8053);
 assert.equal(audit.sourceLabels,18);
 assert.equal(audit.overlaps,0);
 assert.equal(audit.unmapped,0);
 assert.deepEqual(audit.counts,{station:3525,offroad:31,sedan:1072,hatch:1156,pickup:1056,sport:676,van:352,bus:185});
});
await test('Rankings separan Station Wagon de Jeep y mantienen carrocería original',async()=>{
 await page.locator('#statsOpen').click();
 await page.selectOption('#statsTech','');
 await page.selectOption('#statsMetric','cost');
 await page.selectOption('#statsCycle','');
 await page.selectOption('#statsBody','station');
 assert.match(await page.locator('#statsBodyHint').textContent(),/no es un ranking exclusivo de SUV/);
 assert((await page.locator('.rank-item').count())>0);
 const stationRows=await page.locator('.rank-item .rank-main > small:first-of-type').allTextContents();
 assert(stationRows.every(x=>x.includes('Station Wagon')));
 await page.selectOption('#statsBody','offroad');
 assert.match(await page.locator('#statsBodyHint').textContent(),/Jeep/);
 assert((await page.locator('.rank-item').count())>0);
 const jeepRows=await page.locator('.rank-item .rank-main > small:first-of-type').allTextContents();
 assert(jeepRows.every(x=>x.includes('Jeep')&&!x.includes('Station Wagon')));
 await page.selectOption('#statsBody','pickup');
 assert((await page.locator('.rank-item').count())>0);
 const pickupRows=await page.locator('.rank-item .rank-main > small:first-of-type').allTextContents();
 assert(pickupRows.every(x=>x.includes('Camioneta')));
 await page.selectOption('#statsBody','');
 assert.equal(await page.locator('#statsBodyHint').textContent(),'');
 await page.locator('#statsClose').click();
});
await test('Ranking inicial WLTP ordena costos sin equiparar NEDC',async()=>{
 await page.locator('#statsOpen').click();
 assert(await page.locator('#statsDialog').evaluate(e=>e.open));
 await page.selectOption('#statsCycle','WLTP');
 assert.equal(await page.inputValue('#statsCycle'),'WLTP');
 assert.equal(await page.locator('.rank-item').count(),10);
 assert.equal(await page.locator('.rank-cycle').count(),10);
 const labels=await page.locator('.rank-cycle').allTextContents();
 assert(labels.every(x=>x==='WLTP'));
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
await test('PHEV muestra 264 fichas y rendimiento eléctrico y ponderado sin costo inventado',async()=>{
 await page.locator('#statsOpen').click();
 await page.selectOption('#statsMetric','performance');
 assert.equal(await page.locator('.rank-item').count(),0);
 assert.match(await page.locator('#statsNotice').textContent(),/Selecciona una motorización/);
 await page.selectOption('#statsTech','PHEV');
 assert.equal(await page.inputValue('#statsMetric'),'electric');
 assert(await page.locator('#statsMetric option[value="cost"]').isDisabled());
 assert.equal(await page.locator('.rank-item').count(),10);
 assert.match(await page.locator('#statsResultCount').textContent(),/^264 fichas/);
 assert((await page.locator('.rank-value').allTextContents()).every(x=>x.includes('km/kWh')));
 assert.match(await page.locator('#statsMetricHint').textContent(),/No se calcula un costo energético combinado/);
 await page.selectOption('#statsMetric','weighted');
 assert.equal(await page.locator('.rank-item').count(),10);
 assert((await page.locator('.rank-value').allTextContents()).every(x=>x.includes('km/L pond.')));
 assert.match(await page.locator('#statsNotice').textContent(),/no equivale al rendimiento con batería descargada/);
 await page.locator('#statsClose').click();
});
await test('REEV muestra sus 16 registros y ambas métricas con orden dinámico',async()=>{
 await page.locator('#statsOpen').click();
 await page.selectOption('#statsTech','REEV');
 await page.selectOption('#statsMetric','electric');
 await page.selectOption('#statsOrder','asc');
 assert.equal(await page.inputValue('#statsMetric'),'electric');
 assert.match(await page.locator('#statsResultCount').textContent(),/^16 fichas/);
 assert.equal(await page.locator('.rank-item').count(),10);
 assert((await page.locator('.rank-value').allTextContents()).every(x=>x.includes('km/kWh')));
 const first=(await page.locator('.rank-value').allTextContents()).map(x=>Number(x.replace(/[^\d,.]/g,'').replace(',','.')));
 assert(first.every((v,i)=>i===0||first[i-1]<=v),'REEV ascendente '+first);
 await page.selectOption('#statsOrder','desc');
 const reversed=(await page.locator('.rank-value').allTextContents()).map(x=>Number(x.replace(/[^\d,.]/g,'').replace(',','.')));
 assert(reversed.every((v,i)=>i===0||reversed[i-1]>=v),'REEV descendente '+reversed);
 await page.selectOption('#statsMetric','weighted');
 assert.equal(await page.locator('.rank-item').count(),10);
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
 assert.equal(await page.locator('#compareContent .compare-row').count(),13);
 await page.locator('#shareCompare').click();
 assert((await page.inputValue('#compareShareLink')).includes('comparar='));
 assert(await page.locator('#compareShareLink').isVisible());
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
 assert.equal(await page.locator('.comparison-table tbody tr').count(),12);
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
 assert.equal(await page.locator('.comparison-table tbody tr').count(),14);
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
await test('Consulta SII requiere año y selección expresa antes de mostrar tasación',async()=>{
 await page.click('#resetButton');
 await page.fill('#query','Corolla Cross');await page.click('#searchButton');
 await page.locator('.vehicle-card button[data-detail]').first().click();
 assert(await page.locator('#siiSection').isVisible());
 assert.match(await page.locator('#siiCurrentValue').textContent(),/Elige el año y la versión/);
 await page.click('#siiShowLookup');
 await page.waitForFunction(()=>!!document.querySelector('#siiBrand option[value="TOYOTA"]'));
 assert.equal(await page.inputValue('#siiBrand'),'TOYOTA');
 await page.fill('#siiModelQuery','Corolla Cross');
 await page.click('#siiSearch');
 assert.match(await page.locator('#siiMatches').textContent(),/Selecciona la marca y el año/);
 await page.selectOption('#siiYear','2025');
 await page.click('#siiSearch');
 await page.locator('.sii-item').first().waitFor({state:'visible'});
 assert((await page.locator('.sii-item').count())>=1);
 assert.match(await page.locator('.sii-item').first().textContent(),/Código SII: /);
 await page.locator('.sii-item button').first().click();
 assert.match(await page.locator('#siiCurrentValue').textContent(),/Tasación fiscal SII 2026/);
 assert.match(await page.locator('#siiCurrentValue').textContent(),/Permiso circulación 2026/);
 await page.waitForFunction(()=>document.querySelectorAll('.sii-price-item').length===2);
 assert.equal(await page.locator('.sii-price-item').count(),2);
 assert.match(await page.locator('#siiCommercial').textContent(),/27\.990\.000/);
 await page.locator('.sii-price-item').first().locator('button').click();
 assert.match(await page.locator('.sii-selected-price').textContent(),/27\.990\.000/);
 await page.locator('#detailClose').click();
});
await test('Tasación y permiso seleccionados aparecen en comparación de dos vehículos',async()=>{
 if(await page.locator('#compareTray').isVisible())await page.click('#compareClear');
 await page.locator('.vehicle-card button[data-compare]').first().click();
 await page.locator('.vehicle-card button[data-compare]').nth(1).click();
 await page.click('#compareOpen');
 const data=await page.locator('#compareContent').textContent();
 assert.match(data,/Tasación fiscal SII 2026/);
 assert.match(data,/Permiso de circulación 2026/);
 assert(data.includes('Precio de lista nuevo (sin bonos)'));
 assert.match(data,/27\.990\.000/);
 assert.equal(await page.locator('.comparison-table tbody tr').count(),12);
 assert.match(data,/22.354.806|23.139.460|21.570.147|18.775.083|20.189.698/);
 await page.locator('#compareClose').click();
 await page.click('#compareClear');
});
await test('Índice SII 2026 carga metadatos y 81.697 registros sin valores inferidos',async()=>{
 const m=await page.evaluate(async()=>fetch('./sii/data/index.json').then(r=>r.json()));
 assert.equal(m.records,81697);
 assert.equal(m.skipped,0);
 assert.equal(m.missingValue,0);
 assert.equal(m.year,2026);
 assert(m.buckets.length>=20);
 assert(m.brands.length>=260);
});
await test('Catálogo de 185 precios de lista sin bonos con fuente oficial',async()=>{
 const list=await page.evaluate(async()=>fetch('./sii/commercial-2026.json').then(r=>r.json()));
 assert.equal(list.length,185);
 assert.deepEqual([...new Set(list.map(x=>x.brand))].sort(),['BMW','BYD','Changan','Chery','Citroen','Ford','Gac','Great Wall','Hyundai','Kia','MG','Mazda','Nissan','Subaru','Suzuki','Toyota','Volkswagen']);
 const seen=new Set();
 for(const item of list){
  assert(Number.isSafeInteger(item.priceListClp)&&item.priceListClp>0);
  assert.equal(item.currency,'CLP');
  assert.match(item.source,/^https:\/\/(www\.hyundai\.cl|tienda\.toyota\.cl|www\.kia\.cl|www\.suzuki\.cl|suzuki\.cl|www\.mgmotor\.cl|www\.changan\.cl|www\.ford\.cl|www\.bmw\.cl|www\.mazda\.cl|www\.subaru\.cl|www\.volkswagen\.cl|www\.gwm\.cl|www\.byd\.com|webstore\.nissan\.cl|chery\.cl|aventuramotors\.chery\.cl|callegari\.chery\.cl|piamonte\.chery\.cl|rosselot\.chery\.cl|gacmotor\.cl|www\.citroen\.cl)\//);
  const key=[item.brand,item.family,item.version,item.modelYear].join('|');
  assert(!seen.has(key),'Precio de lista duplicado '+key);
  seen.add(key);
 }
});
await test('BYD, Great Wall y Changan: nueve precios oficiales sin equiparar ciclos ni motorizaciones',async()=>{
 const entries=await page.evaluate(async()=>fetch('./sii/commercial-2026.json?v=20261018-list185').then(r=>r.json()));
 const fresh=entries.filter(x=>x.checkedAt==='2026-10-18'&&['Great Wall','BYD','Changan'].includes(x.brand));
 assert.equal(fresh.length,9);
 assert.deepEqual(fresh.reduce((o,x)=>(o[x.brand]=(o[x.brand]||0)+1,o),{}),{'Great Wall':2,'BYD':3,'Changan':4});
 const lookup=(brand,version)=>fresh.find(x=>x.brand===brand&&x.version===version);
 assert.equal(lookup('Great Wall','Haval Jolion Max Elite 1.5T 2WD AT').priceListClp,21190000);
 assert.equal(lookup('Great Wall','ORA 03 400 KM EV').priceListClp,26490000);
 assert.equal(lookup('BYD','Yuan Pro DM-i GL').priceListClp,19990000);
 assert.equal(lookup('BYD','Yuan Pro DM-i GS').priceListClp,22990000);
 assert.equal(lookup('BYD','Song Plus DM-i GS').priceListClp,31490000);
 assert.equal(lookup('Changan','S05 REEV').priceListClp,29990000);
 assert.equal(lookup('Changan','S05 EV').priceListClp,30990000);
 assert.equal(lookup('Changan','CS35 Plus Luxury AT').priceListClp,17590000);
 assert.equal(lookup('Changan','CS35 Plus Elite AT').priceListClp,18890000);
 assert(fresh.every(p=>p.modelYear===null&&p.currency==='CLP'&&/Precio|precio/.test(p.priceBasis)));
 assert.equal(fresh.filter(x=>x.family==='Yuan Pro DM-i').length,2);
 assert(!fresh.some(x=>x.family==='Yuan Pro'), 'No mezclar enchufable con BEV');
 const mappings=await page.evaluate(()=>{
  const f=window.RindelabSII.family;
  return ['Haval Jolion Max HP','Haval Jolion 7DCT','ORA 03 (ES11) EV GT','Song Plus DMI 1.5T','YUAN PRO GL','Yuan Pro DM-i GL','DEEPAL S05 REEV','New CS35 Plus 1.6']
    .map((name,i)=>f([i<3?'Great Wall':i<6?'BYD':'Changan',name]));
 });
 assert.deepEqual(mappings,['Haval Jolion Max','Haval Jolion','ORA 03','Song Plus','YUAN','Yuan Pro DM-i','DEEPAL S05','CS35 Plus']);
});
await test('Great Wall: modelos Jolion Max y ORA 03 exponen precio de lista con selección manual',async()=>{
 for(const [q,price] of [['Haval Jolion Max','21.190.000'],['ORA 03','26.490.000']]){
  await page.click('#resetButton');await page.fill('#query',q);await page.click('#searchButton');
  assert((await page.locator('.vehicle-card').count())>0,'Sin ficha 3CV '+q);
  await page.locator('.vehicle-card button[data-detail]').first().click();
  await page.waitForFunction(()=>document.querySelectorAll('.sii-price-item').length===1);
  assert((await page.locator('#siiCommercial').textContent()).includes(price),'Sin precio esperado '+q);
  assert.equal(await page.locator('.sii-selected-price').count(),0);
  await page.locator('#detailClose').click();
 }
});
await test('Nissan: siete precios normales distintos de las promociones de financiamiento',async()=>{
 const all=await page.evaluate(async()=>fetch('./sii/commercial-2026.json?v=20261018-list185').then(r=>r.json()));
 const entries=all.filter(x=>x.brand==='Nissan');
 assert.equal(entries.length,7);
 const x=(family,version)=>entries.find(p=>p.family===family&&p.version===version);
 assert.equal(x('Kait','Sense CVT').priceListClp,20990000);
 assert.equal(x('Kait','Advance').priceListClp,22490000);
 assert.equal(x('Versa','New Versa Sense MT').priceListClp,16990000);
 assert.equal(x('Kicks','New Kicks Sense CVT').priceListClp,24790000);
 assert.equal(x('Sentra','SR Platinum').priceListClp,28990000);
 assert.equal(x('X-Trail','Sense CVT 3R').priceListClp,34401901);
 assert.equal(x('Pathfinder','Exclusive 7P 3.5 CVT').priceListClp,55668593);
 assert(entries.every(x=>x.modelYear===null&&x.source.startsWith('https://webstore.nissan.cl/')&&x.checkedAt==='2026-10-18'));
 assert(entries.every(x=>/financiamiento/.test(x.priceBasis)));
});
await test('Nissan Kait: dos versiones, sin asignación comercial automática',async()=>{
 await page.click('#resetButton');await page.fill('#query','Nissan Kait');await page.click('#searchButton');
 assert((await page.locator('.vehicle-card').count())>0,'No aparece homologación oficial Nissan Kait');
 await page.locator('.vehicle-card button[data-detail]').first().click();
 await page.waitForFunction(()=>document.querySelectorAll('.sii-price-item').length===2);
 assert.match(await page.locator('#siiCommercial').textContent(),/20\.990\.000/);
 assert.match(await page.locator('#siiCommercial').textContent(),/22\.490\.000/);
 assert.equal(await page.locator('.sii-selected-price').count(),0);
 await page.locator('.sii-price-item').first().locator('button').click();
 assert.match(await page.locator('.sii-selected-price').textContent(),/20\.990\.000/);
 await page.locator('.sii-selected-price button').click();
 assert.equal(await page.locator('.sii-selected-price').count(),0);
 await page.locator('#detailClose').click();
});
await test('Lote multimarca: 15 Chery, 14 Gac y 1 Citroen documentados sin bonos',async()=>{
 const list=await page.evaluate(async()=>fetch('./sii/commercial-2026.json?v=20261018-list185').then(r=>r.json()));
 const latest=list.filter(x=>['Chery','Gac','Citroen'].includes(x.brand));
 assert.equal(latest.length,30);
 assert.equal(latest.filter(x=>x.brand==='Chery').length,15);
 assert.equal(latest.filter(x=>x.brand==='Gac').length,14);
 assert.equal(latest.filter(x=>x.brand==='Citroen').length,1);
 assert(latest.every(x=>x.checkedAt==='2026-10-18'&&x.modelYear===null&&x.currency==='CLP'));
 assert.equal(latest.find(x=>x.brand==='Gac'&&x.version==='EMKOO 2.0 AT HEV GL')?.priceListClp,22990000);
 assert.equal(latest.find(x=>x.brand==='Chery'&&x.version==='TIGGO 7 PRO MAX 1.5 DHT PHEV')?.priceListClp,25990000);
 assert.equal(latest.find(x=>x.brand==='Citroen')?.priceListClp,16190000);
 const mappings=await page.evaluate(()=>{
   const fam=window.RindelabSII.family;
   return [['Chery','Tiggo 4 Pro Max 1.5 CVT GLS'],['Chery','Tiggo 4 Pro Max 1.5 DHT HEV'],['Chery','Tiggo 8 Pro Max 1.6 DCT GLX'],['Gac','GS3 Power MT 1.5T GS'],['Gac','New GS8 2.0T AT GT 2WD'],['Citroen','C3 Aircross VTI FEEL']]
     .map(x=>fam(x));
 });
 assert.deepEqual(mappings,['Tiggo 4 Pro Max','Tiggo 4 Pro Max','Tiggo 8 Pro Max','GS3 Power','GS8','C3 Aircross']);
});
await test('No asigna precio de lista automáticamente y permite elegir o quitar versión',async()=>{
 await page.click('#resetButton');await page.fill('#query','Corolla Cross');await page.click('#searchButton');
 await page.locator('.vehicle-card button[data-detail]').nth(1).click();
 await page.waitForFunction(()=>document.querySelectorAll('.sii-price-item').length===2);
 assert.match(await page.locator('#siiCommercial').textContent(),/Elige solamente|Elige manualmente|Elige manualmente la versión/i);
 assert.equal(await page.locator('.sii-selected-price').count(),0);
 await page.locator('.sii-price-item').nth(1).locator('button').click();
 assert.match(await page.locator('.sii-selected-price').textContent(),/29\.990\.000/);
 await page.locator('.sii-selected-price button').click();
 assert.equal(await page.locator('.sii-selected-price').count(),0);
 await page.click('#detailClose');
 await page.click('#resetButton');await page.fill('#query','Hilux');await page.click('#searchButton');
 await page.locator('.vehicle-card button[data-detail]').first().click();
 await page.waitForFunction(()=>document.querySelectorAll('.sii-price-item').length===1);
 assert.match(await page.locator('#siiCommercial').textContent(),/45\.290\.000/);
 await page.click('#detailClose');
});
await test('Kia Morning: cinco precios de lista distintos y fuente verificable',async()=>{
 await page.click('#resetButton');await page.fill('#query','Morning');await page.click('#searchButton');
 assert((await page.locator('.vehicle-card').count())>0,'Sin fichas 3CV para Morning');
 await page.locator('.vehicle-card button[data-detail]').first().click();
 await page.waitForFunction(()=>document.querySelectorAll('.sii-price-item').length===5);
 assert.equal(await page.locator('.sii-price-item').count(),5);
 assert.match(await page.locator('#siiCommercial').textContent(),/10\.990\.000/);
 assert.match(await page.locator('#siiCommercial').textContent(),/14\.990\.000/);
 assert.equal(await page.locator('.sii-selected-price').count(),0);
 await page.locator('.sii-price-item').first().locator('button').click();
 assert.match(await page.locator('.sii-selected-price').textContent(),/10\.990\.000/);
 const url=await page.locator('.sii-selected-price a[target="_blank"]').getAttribute('href');
 assert.equal(url,'https://www.kia.cl/promociones/kia-morning.html');
 await page.locator('.sii-selected-price button').click();
 assert.equal(await page.locator('.sii-selected-price').count(),0);
 await page.click('#detailClose');
});
await test('Ampliación Hyundai: once precios de lista con fuentes oficiales',async()=>{
 const p=await page.evaluate(async()=>fetch('./sii/commercial-2026.json?v=20261018-list185').then(r=>r.json()));
 const hyundai=p.filter(x=>x.brand==='Hyundai');
 assert.equal(p.length,185);
 assert.equal(hyundai.filter(x=>x.family==='Tucson').length,4);
 assert.equal(hyundai.filter(x=>x.family==='Venue').length,4);
 assert.equal(hyundai.filter(x=>x.family==='Creta Grand').length,2);
 assert.equal(hyundai.filter(x=>x.family==='Kona'&&/\bEV\b/.test(x.version)).length,1);
 assert.equal(p.find(x=>x.version==='TUCSON NX4c 2.0 MT GO FL')?.priceListClp,24390000);
 assert.equal(p.find(x=>x.version==='KONA SX2 EV GO LR')?.priceListClp,40090000);
 assert.equal(p.find(x=>x.version==='CRETA GRAND SU2i 2.0 MT GO FL')?.priceListClp,21790000);
 const unique=new Set();
 for(const x of p){const key=[x.brand,x.family,x.version,x.modelYear].join('|');assert(!unique.has(key));unique.add(key);}
});
await test('Creta Grand conserva su familia independiente de Creta',async()=>{
 const f=await page.evaluate(()=>{
  const family=window.RindelabSII.family;
  return ['Creta Grand 2.0 MT','The New Creta Grand AT','Creta 1.5 CVT'].map(model=>family(['Hyundai',model]));
 });
 assert.deepEqual(f,['Creta Grand','Creta Grand','Creta']);
});
await test('Ampliación Suzuki y MG: 27 nuevas versiones con precio de lista',async()=>{
 const list=await page.evaluate(async()=>fetch('./sii/commercial-2026.json?v=20261018-list185').then(r=>r.json()));
 const suzuki=list.filter(x=>x.brand==='Suzuki'),mg=list.filter(x=>x.brand==='MG');
 assert.equal(suzuki.length,12);
 assert.equal(mg.length,15);
 assert.equal(suzuki.filter(x=>x.family==='Swift').length,4);
 assert.equal(suzuki.filter(x=>x.family==='Fronx').length,4);
 assert.equal(suzuki.filter(x=>x.family==='Celerio').length,2);
 assert.equal(suzuki.filter(x=>x.family==='Jimny').length,2);
 assert.equal(mg.filter(x=>x.family==='MG3').length,5);
 assert.equal(mg.filter(x=>x.family==='ZS').length,7);
 assert.equal(mg.filter(x=>x.family==='S5').length,3);
 assert.equal(list.find(x=>x.brand==='Suzuki'&&x.family==='Swift'&&x.version==='1.2 GL')?.priceListClp,14090000);
 assert.equal(list.find(x=>x.brand==='MG'&&x.family==='MG3'&&x.version==='MG3 HEV 1.5L COM')?.priceListClp,16990000);
 assert.equal(list.find(x=>x.brand==='MG'&&x.family==='S5'&&x.version==='MG S5 EV 62kW LUX')?.priceListClp,28490000);
 assert(suzuki.concat(mg).every(x=>x.modelYear===null));
});
await test('Swift muestra cuatro precios de lista, con selección manual y fuentes',async()=>{
 await page.click('#resetButton');
 await page.fill('#query','Swift');await page.click('#searchButton');
 assert((await page.locator('.vehicle-card').count())>0);
 await page.locator('.vehicle-card button[data-detail]').first().click();
 await page.waitForFunction(()=>document.querySelectorAll('.sii-price-item').length===4);
 assert.equal(await page.locator('.sii-price-item').count(),4);
 assert.match(await page.locator('#siiCommercial').textContent(),/14\.090\.000/);
 assert.match(await page.locator('#siiCommercial').textContent(),/17\.490\.000/);
 assert.equal(await page.locator('.sii-selected-price').count(),0);
 await page.locator('.sii-price-item button').first().click();
 assert.match(await page.locator('.sii-selected-price').textContent(),/14\.090\.000/);
 assert.match(await page.locator('.sii-selected-price a[target="_blank"]').getAttribute('href'),/suzuki\.cl\/vehiculo\/swift-hybrid/);
 await page.locator('#detailClose').click();
});
await test('MG3 ofrece versiones térmicas e híbrida diferenciadas sin preselección',async()=>{
 await page.click('#resetButton');await page.fill('#query','MG3');await page.click('#searchButton');
 assert((await page.locator('.vehicle-card').count())>0);
 await page.locator('.vehicle-card button[data-detail]').first().click();
 await page.waitForFunction(()=>document.querySelectorAll('.sii-price-item').length===5);
 assert.match(await page.locator('#siiCommercial').textContent(),/10\.990\.000/);
 assert.match(await page.locator('#siiCommercial').textContent(),/16\.990\.000/);
 assert.equal(await page.locator('.sii-selected-price').count(),0);
 await page.locator('#detailClose').click();
});
await test('Changan: 25 precios de lista oficiales en nueve familias diferenciadas',async()=>{
 const list=await page.evaluate(async()=>fetch('./sii/commercial-2026.json?v=20261018-list185').then(r=>r.json()));
 const v=list.filter(x=>x.brand==='Changan'),groups={};
 for(const x of v){groups[x.family]=(groups[x.family]||0)+1;assert(x.source.startsWith('https://www.changan.cl/'));}
 assert.equal(v.length,25);
 assert.deepEqual(groups,{'CS35 Max':4,Hunter:4,'X7 Plus':4,'CS75 Plus':2,'CS55 Plus':3,S07:2,'Avatr 07':2,'Deepal S05':2,'CS35 Plus':2});
 assert.equal(v.find(x=>x.version==='CS35 Max Comfort MT').priceListClp,14490000);
 assert.equal(v.find(x=>x.version==='Hunter 2.0T 4X2 Comfort MT').priceListClp,20890000);
 assert.equal(v.find(x=>x.version==='Deepal S07 REEV').priceListClp,32990000);
 assert.equal(v.find(x=>x.version==='AVATR 07 4x2 REEV RWD').priceListClp,55990000);
});
await test('Familias Changan estrictas: Hunter diésel no recibe precios REEV',async()=>{
 const groups=await page.evaluate(()=>{
  const f=window.RindelabSII.family;
  return [
   'CS35 MAX 1.5 MT','CS55 Plus 1.5 Turbo DCT','CS55 1.5 Turbo AT',
   'CS75 Plus 1.5T AT','X7 Plus 1.5 Turbo TA','Hunter 2.0 MT 4WD',
   'HUNTER EREV 4x2','HUNTER E','S07 EREV','Avatr 07 REEV AWD'
  ].map(model=>f(['Changan',model]));
 });
 assert.deepEqual(groups,['CS35 Max','CS55 Plus','CS55','CS75 Plus','X7 Plus','Hunter','Hunter REEV','Hunter eléctrico','S07','Avatr 07']);
});
await test('Búsqueda de cilindrada Hunter 2.0 no confunde dígitos de código 3CV con modelo',async()=>{
 await page.click('#resetButton');await page.fill('#query','Hunter 2.0');await page.click('#searchButton');
 const cards=await page.locator('.vehicle-card h3').allTextContents();
 assert.equal(cards.length,2);
 assert(cards.every(v=>/Changan Hunter 2\.0/i.test(v)),'Resultados inesperados para Hunter 2.0: '+cards.join(', '));
 assert(!cards.some(v=>/Hunter E\b/i.test(v)));
});
await test('Changan Hunter presenta cuatro precios de lista seleccionables sin autoasignar',async()=>{
 await page.click('#resetButton');await page.fill('#query','Hunter 2.0');await page.click('#searchButton');
 assert((await page.locator('.vehicle-card').count())>0);
 await page.locator('.vehicle-card button[data-detail]').first().click();
 await page.waitForTimeout(1000);
 const hunterItems=await page.locator('.sii-price-item').count();
 const hunterTitle=await page.locator('#detailContent').textContent();
 const hunterVisibleName=await page.locator('.vehicle-card h3').first().textContent();
 const hunterFamily=await page.evaluate(name=>window.RindelabSII.family(['Changan',name.replace(/^Changan\s+/i,'')]),hunterVisibleName);
 assert.equal(hunterItems,4,'Hunter diésel - '+hunterVisibleName+' / '+hunterFamily+' / '+String(await page.locator('#siiCommercial').textContent()).slice(0,700));
 assert.equal(await page.locator('.sii-selected-price').count(),0);
 assert.match(await page.locator('#siiCommercial').textContent(),/20\.890\.000/);
 await page.locator('.sii-price-item').first().locator('button').click();
 assert.match(await page.locator('.sii-selected-price').textContent(),/20\.890\.000/);
 await page.locator('#detailClose').click();
 await page.click('#resetButton');await page.fill('#query','HUNTER EREV');await page.click('#searchButton');
 assert((await page.locator('.vehicle-card').count())>0);
 await page.locator('.vehicle-card button[data-detail]').first().click();
 await page.waitForTimeout(1000);
 const noReev=String(await page.locator('#siiCommercial').textContent());
 assert.match(noReev,/Sin precio de lista verificado/,'Hunter EREV - '+noReev.slice(0,700));
 assert.equal(await page.locator('.sii-price-item').count(),0);
 await page.locator('#detailClose').click();
});
await test('Changan Deepal y AVATR tienen listas independientes y fuente específica',async()=>{
 for(const [term,expected] of [['S07 EREV',2],['Avatr 07',2]]){
  await page.click('#resetButton');await page.fill('#query',term);await page.click('#searchButton');
  assert((await page.locator('.vehicle-card').count())>0,'Sin homologaciones '+term);
  await page.locator('.vehicle-card button[data-detail]').first().click();
  await page.waitForTimeout(1000);
  const count=await page.locator('.sii-price-item').count();
  assert.equal(count,expected,term+' - '+String(await page.locator('#siiCommercial').textContent()).slice(0,700));
  assert.equal(await page.locator('.sii-selected-price').count(),0);
  await page.locator('#detailClose').click();
 }
});
await test('Ford: ocho precios de lista vigentes para Territory y Maverick',async()=>{
 const items=await page.evaluate(async()=>fetch('./sii/commercial-2026.json?v=20261018-list185').then(r=>r.json()));
 const ford=items.filter(x=>x.brand==='Ford');
 assert.equal(ford.length,16);
 assert.equal(ford.filter(x=>x.family==='Territory').length,4);
 assert.equal(ford.filter(x=>x.family==='Maverick').length,4);
 assert(ford.every(x=>x.source.startsWith('https://www.ford.cl/')));
 assert.equal(ford.find(x=>x.version==='Trend 1.5L AT 4x2').priceListClp,21290000);
 assert.equal(ford.find(x=>x.version==='Platinum Híbrida 1.5L AT 4x2').priceListClp,32190000);
 assert.equal(ford.find(x=>x.version==='Lariat FHEV 2.5L AT AWD').priceListClp,39615100);
 assert.equal(ford.find(x=>x.version==='Tremor 2.0L AT AWD').priceListClp,40210100);
});
await test('Ford Territory muestra cuatro listas con versión y fuente diferenciadas',async()=>{
 await page.click('#resetButton');await page.fill('#query','Territory FHEV');await page.click('#searchButton');
 assert((await page.locator('.vehicle-card').count())>0);
 await page.locator('.vehicle-card button[data-detail]').first().click();
 await page.waitForFunction(()=>document.querySelectorAll('.sii-price-item').length===4);
 assert.equal(await page.locator('.sii-selected-price').count(),0);
 assert.match(await page.locator('#siiCommercial').textContent(),/21\.290\.000/);
 assert.match(await page.locator('#siiCommercial').textContent(),/32\.190\.000/);
 await page.locator('.sii-price-item').nth(3).locator('button').click();
 assert.match(await page.locator('.sii-selected-price').textContent(),/32\.190\.000/);
 await page.locator('.sii-selected-price button').click();
 assert.equal(await page.locator('.sii-selected-price').count(),0);
 await page.locator('#detailClose').click();
});
await test('Ford Maverick ofrece cuatro versiones sin atribuir precio por coincidencia automática',async()=>{
 await page.click('#resetButton');await page.fill('#query','Maverick');await page.click('#searchButton');
 assert((await page.locator('.vehicle-card').count())>0);
 await page.locator('.vehicle-card button[data-detail]').first().click();
 await page.waitForFunction(()=>document.querySelectorAll('.sii-price-item').length===4);
 assert.equal(await page.locator('.sii-selected-price').count(),0);
 assert.match(await page.locator('#siiCommercial').textContent(),/31\.285\.100/);
 assert.match(await page.locator('#siiCommercial').textContent(),/40\.210\.100/);
 await page.locator('#detailClose').click();
});
await test('Mazda: 12 precios de lista CX-30/CX-3/CX-5 con modelo 2027 confirmado',async()=>{
 const all=await page.evaluate(async()=>fetch('./sii/commercial-2026.json?v=20261018-list185').then(r=>r.json()));
 const mazda=all.filter(x=>x.brand==='Mazda');
 assert.equal(mazda.length,12);
 for(const [family,n] of [['CX-30',5],['CX-3',2],['CX-5',5]]){
  assert.equal(mazda.filter(x=>x.family===family).length,n);
 }
 assert(mazda.every(x=>x.modelYear===2027));
 assert.equal(mazda.find(x=>x.version==='ENTRY 2.0 2WD AT 7G').priceListClp,22990000);
 assert.equal(mazda.find(x=>x.version==='HIGH 2.5 AWD 6AT 7G').priceListClp,29690000);
 assert.equal(mazda.find(x=>x.family==='CX-3'&&x.version==='CORE 2.0 MT').priceListClp,19790000);
 assert.equal(mazda.find(x=>x.version==='SIGNATURE 2.5T AWD 6AT').priceListClp,35190000);
 assert(mazda.every(x=>x.source.startsWith('https://www.mazda.cl/')));
});
await test('Subaru: 15 precios de lista incluyen Impreza e híbridos; Outback sin año supuesto',async()=>{
 const all=await page.evaluate(async()=>fetch('./sii/commercial-2026.json?v=20261018-list185').then(r=>r.json()));
 const subaru=all.filter(x=>x.brand==='Subaru');
 assert.equal(subaru.length,15);
 assert.equal(subaru.filter(x=>x.family==='Crosstrek').length,5);
 assert.equal(subaru.filter(x=>x.family==='Forester').length,5);
 assert.equal(subaru.filter(x=>x.family==='Outback').length,2);
  assert.equal(subaru.filter(x=>x.family==='Impreza').length,3);
  assert.equal(subaru.find(x=>x.family==='Crosstrek'&&x.version==='2.0I HYBRID AWD CVT TOURING ES').priceListClp,34490000);
  assert.equal(subaru.find(x=>x.family==='Forester'&&x.version==='2.5 HEV AWD CVT SPORT ES').priceListClp,42990000);
  assert.equal(subaru.find(x=>x.family==='Impreza'&&x.version==='2.0I AWD CVT').priceListClp,23390000);
  assert.equal(subaru.filter(x=>x.checkedAt==='2026-10-18').length,5);
 assert(subaru.filter(x=>x.family==='Outback').every(x=>x.modelYear===null));
 assert.equal(subaru.find(x=>x.family==='Forester'&&x.version==='2.5 AWD CVT XS ES').priceListClp,31490000);
 assert.equal(subaru.find(x=>x.family==='Crosstrek'&&x.version==='2.0I AWD CVT').priceListClp,25990000);
 assert.equal(subaru.find(x=>x.family==='Outback'&&x.version==='Premium').priceListClp,37990000);
 assert(subaru.every(x=>x.source.startsWith('https://www.subaru.cl/')));
});
await test('Volkswagen: ocho precios de lista de octubre separados de bonos y precios +IVA',async()=>{
 const all=await page.evaluate(async()=>fetch('./sii/commercial-2026.json?v=20261018-list185').then(r=>r.json()));
 const vw=all.filter(x=>x.brand==='Volkswagen');
 assert.equal(vw.length,8);
 assert.equal(vw.filter(x=>x.family==='Tera').length,5);
 assert.equal(vw.filter(x=>x.family==='Taos').length,1);
 assert.equal(vw.filter(x=>x.family==='ID.4').length,1);
 assert.equal(vw.filter(x=>x.family==='Polo').length,1);
 assert.deepEqual(vw.filter(x=>x.family==='Tera').map(x=>x.priceListClp),[16590000,17490000,18990000,20690000,21090000]);
 assert.equal(vw.find(x=>x.family==='Taos').priceListClp,30590000);
 assert.equal(vw.find(x=>x.family==='ID.4').priceListClp,49900000);
 assert.equal(vw.find(x=>x.family==='Polo').priceListClp,14490000);
 assert(vw.every(x=>x.source.startsWith('https://www.volkswagen.cl/')));
 assert(vw.every(x=>x.checkedAt==='2026-10-17'&&x.modelYear===null));
 assert(vw.every(x=>/bono/i.test(x.priceBasis)));
});
await test('Mazda CX30 y CX-30 comparten catálogo sin asignación automática',async()=>{
 for(const term of ['CX30','CX-30']){
  await page.click('#resetButton');await page.fill('#query',term);await page.click('#searchButton');
  assert((await page.locator('.vehicle-card').count())>0,'Sin resultados '+term);
  await page.locator('.vehicle-card button[data-detail]').first().click();
  await page.waitForFunction(()=>document.querySelectorAll('.sii-price-item').length===5);
  assert.equal(await page.locator('.sii-selected-price').count(),0);
  assert.match(await page.locator('#siiCommercial').textContent(),/22\.990\.000/);
  assert.match(await page.locator('#siiCommercial').textContent(),/29\.690\.000/);
  await page.locator('#detailClose').click();
 }
});
await test('Subaru Forester y Crosstrek conservan cinco versiones incluyendo híbridas',async()=>{
 for(const term of ['Forester 2.5','Crosstrek']){
  await page.click('#resetButton');await page.fill('#query',term);await page.click('#searchButton');
  assert((await page.locator('.vehicle-card').count())>0,'Sin resultados '+term);
  await page.locator('.vehicle-card button[data-detail]').first().click();
  await page.waitForFunction(()=>document.querySelectorAll('.sii-price-item').length===5);
  assert.equal(await page.locator('.sii-selected-price').count(),0);
  await page.locator('#detailClose').click();
 }
});

await test('Subaru Impreza: tres versiones con precio de lista y selección manual',async()=>{
 await page.click('#resetButton');await page.fill('#query','Impreza');await page.click('#searchButton');
 assert((await page.locator('.vehicle-card').count())>0,'Sin fichas 3CV de Impreza');
 await page.locator('.vehicle-card button[data-detail]').first().click();
 await page.waitForFunction(()=>document.querySelectorAll('.sii-price-item').length===3);
 assert.match(await page.locator('#siiCommercial').textContent(),/23\.390\.000/);
 assert.match(await page.locator('#siiCommercial').textContent(),/28\.390\.000/);
 assert.equal(await page.locator('.sii-selected-price').count(),0);
 await page.locator('#detailClose').click();
});
await test('Marcas: 122 marcas del 3CV histórico, filtro transparente y CSV',async()=>{
 const p=await browser.newPage({viewport:{width:390,height:844},acceptDownloads:true});
 await p.goto(base+'marcas.html',{waitUntil:'networkidle'});
 await p.waitForFunction(()=>document.querySelector('#metricBrands')?.textContent==='122',{timeout:30000});
 assert.equal(await p.locator('#metricPrices').textContent(),'185');
 assert.equal(await p.locator('#metricCovered').textContent(),'17');
 assert.equal(await p.locator('#brandRows tr').count(),122);
 await p.fill('#brandSearch','Chevrolet');
 assert.equal(await p.locator('#brandRows tr').count(),1);
 assert.match(await p.locator('#brandRows tr').first().textContent(),/Sin precio documentado/);
 await p.fill('#brandSearch','Chery');
 assert.equal(await p.locator('#brandRows tr').count(),1);
 assert.match(await p.locator('#brandRows tr').first().textContent(),/15.*Precio documentado/);
 await p.fill('#brandSearch','');
 await p.selectOption('#brandStatus','available');
 assert.equal(await p.locator('#brandRows tr').count(),17);
 const download=p.waitForEvent('download');
 await p.locator('#exportBrands').click();
 assert.match((await download).suggestedFilename(),/rindelab-cobertura-marcas/);
 const sizes=await p.evaluate(()=>({page:document.documentElement.scrollWidth,screen:innerWidth}));
 assert(sizes.page<=sizes.screen+3,JSON.stringify(sizes));
 await p.close();
});
await test('Cobertura 3CV: 66 familias auditadas sin equivalencia automática de 185 versiones',async()=>{
 const p=await browser.newPage({viewport:{width:1440,height:900}});
 const issues=[];p.on('pageerror',e=>issues.push(e.message));
 const response=await p.goto(base+'cobertura.html',{waitUntil:'networkidle'});
 assert.equal(response.status(),200);
 await p.waitForFunction(()=>document.querySelector('#metricPrices')?.textContent==='185',{timeout:30000});
 assert.equal(await p.locator('#metricFamilies').textContent(),'66');
 assert.equal(await p.locator('#coverageRows tr').count(),66);
 assert.match(await p.locator('#coverageStatus').textContent(),/8\.053/);
 assert.match(await p.locator('.coverage-legend').textContent(),/no equivalencia de versión/i);
 assert.match(await p.locator('main').textContent(),/ninguna versión comercial se vincula automáticamente/i);
 assert.equal(issues.length,0,issues.join(' | '));
 await p.selectOption('#brandFilter','Volkswagen');
 assert.equal(await p.locator('#coverageRows tr').count(),4);
 await p.fill('#familyFilter','Tera');
 assert.equal(await p.locator('#coverageRows tr').count(),1);
 assert.match(await p.locator('#coverageRows').textContent(),/Tera/);
 const download=p.waitForEvent('download');
 await p.locator('#downloadCoverage').click();
 const file=await download;
 assert.match(file.suggestedFilename(),/rindelab-cobertura-nominal-3cv\.csv/);
 await p.close();
});
await test('Cobertura 3CV en móvil 320 px sin desbordamiento ni confusión de indicadores',async()=>{
 const p=await browser.newPage({viewport:{width:320,height:700},isMobile:true,hasTouch:true});
 const issues=[];p.on('pageerror',e=>issues.push(e.message));
 await p.goto(base+'cobertura.html',{waitUntil:'networkidle'});
 await p.waitForFunction(()=>document.querySelector('#metricFamilies')?.textContent==='66',{timeout:30000});
 const dims=await p.evaluate(()=>({doc:document.documentElement.scrollWidth,viewport:innerWidth,table:document.querySelector('.coverage-table-scroll').scrollWidth,area:document.querySelector('.coverage-table-scroll').clientWidth}));
 assert(dims.doc<=dims.viewport+3,JSON.stringify(dims));
 assert(dims.table>dims.area,JSON.stringify(dims));
 assert.deepEqual(issues,[]);
 await p.close();
});
await test('Cotejo técnico: 185 versiones, filtros y conflicto Tera manual versus 3CV',async()=>{
 const p=await browser.newPage({viewport:{width:1440,height:900},acceptDownloads:true});
 const errors=[];p.on('pageerror',e=>errors.push(e.message));
 const r=await p.goto(base+'versiones.html',{waitUntil:'networkidle'});
 assert.equal(r.status(),200);
 await p.waitForFunction(()=>document.querySelector('#versionTotal')?.textContent==='185',{timeout:30000});
 assert.equal(await p.locator('#versionsRows tr').count(),185);
 assert.match(await p.locator('#versionsStatus').textContent(),/Equivalencias técnicas certificadas: ninguna/);
 assert.deepEqual(errors,[]);
 await p.selectOption('#versionsBrand','Volkswagen');
 assert.equal(await p.locator('#versionsRows tr').count(),8);
 await p.fill('#versionsSearch','Tera');
 assert.equal(await p.locator('#versionsRows tr').count(),5);
 const conflict=p.locator('#versionsRows tr').filter({hasText:'Trend 1.6 MSI MT'});
 assert.equal(await conflict.count(),1);
 assert.match(await conflict.textContent(),/Solo candidatos contradictorios/);
 await conflict.locator('details summary').click();
 assert.match(await conflict.textContent(),/transmisión: comercial M \/ 3CV A/i);
 const download=p.waitForEvent('download');
 await p.locator('#versionsDownload').click();
 assert.match((await download).suggestedFilename(),/rindelab-cotejo-versiones-preliminar\.csv/);
 await p.close();
});
await test('Cotejo técnico versión 320 px no desborda y mantiene tabla desplazable',async()=>{
 const p=await browser.newPage({viewport:{width:320,height:700},isMobile:true,hasTouch:true});
 const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(base+'versiones.html',{waitUntil:'networkidle'});
 await p.waitForFunction(()=>document.querySelector('#versionTotal')?.textContent==='185',{timeout:30000});
 const size=await p.evaluate(()=>({
  doc:document.documentElement.scrollWidth,screen:innerWidth,
  table:document.querySelector('.coverage-table-scroll').scrollWidth,
  client:document.querySelector('.coverage-table-scroll').clientWidth
 }));
 assert(size.doc<=size.screen+3,JSON.stringify(size));
 assert(size.table>size.client,JSON.stringify(size));
 assert.deepEqual(errors,[]);
 await p.close();
});
await test('Revisión prioritaria contiene 28 casos; Nissan Kait CVT no altera transmisión 3CV',async()=>{
 const p=await browser.newPage({viewport:{width:1440,height:900},acceptDownloads:true});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto(base+'versiones.html',{waitUntil:'networkidle'});
 await p.waitForFunction(()=>document.querySelector('#versionTotal')?.textContent==='185',{timeout:30000});
 const summary=await p.locator('#versionsPrioritySummary').textContent();
 const found=summary.match(/(\d+) discrepancias · (\d+) candidatos únicos/);
 assert(found && Number(found[1])>=5 && Number(found[2])>=23,'No se deben perder las revisiones históricas');
 await p.locator('#versionsPriorityOnly').check();
 assert((await p.locator('#versionsRows tr').count())>=28);
 const tera=p.locator('#versionsRows tr').filter({hasText:'Trend 1.6 MSI MT'});
 assert.equal(await tera.count(),1);
 assert.match(await tera.textContent(),/Discrepancia contrastada con fabricante/);
 assert.match(await tera.textContent(),/VW9988E60525S00-6/);
 assert.match(await tera.textContent(),/pendiente aclaración 3CV/i);
 assert.match(await tera.locator('.reviewed-discrepancy a').getAttribute('href'),/volkswagen.cl\/tera\/tera/);
 const second=p.locator('#versionsRows tr').filter({hasText:'Comfort 1.6 MSI MT'});
 assert.match(await second.textContent(),/discrepancia contrastada con fabricante/i);
 const deepal=p.locator('#versionsRows tr').filter({hasText:'S05 EV'});
 assert.equal(await deepal.count(),1);
 assert.match(await deepal.textContent(),/Solo candidatos contradictorios/);
 const kait=p.locator('#versionsRows tr').filter({hasText:'Sense CVT'});
 assert.equal(await kait.count(),1);
 assert.match(await kait.textContent(),/Solo candidatos contradictorios/);
 assert.equal(await kait.locator('.reviewed-discrepancy').count(),0,'No atribuir certificación al cruce comercial Nissan');
 const forester=p.locator('#versionsRows tr').filter({hasText:'2.5 HEV AWD CVT SPORT ES'});
 assert.equal(await forester.count(),1);
 assert.match(await forester.textContent(),/Solo candidatos contradictorios/);
 assert.equal(await forester.locator('.reviewed-discrepancy').count(),0,'No afirmar que existe rectificación o contraste formal de la autoridad 3CV');
 assert.deepEqual(errs,[]);
 const dl=p.waitForEvent('download');
 await p.locator('#versionsDownload').click();
 assert.match((await dl).suggestedFilename(),/rindelab-cotejo-versiones-preliminar\.csv/);
 await p.close();
});
await test('Código compartido se distingue de versión comercial individual',async()=>{
 const p=await browser.newPage({viewport:{width:1440,height:900}});
 await p.goto(base+'versiones.html',{waitUntil:'networkidle'});
 await p.waitForFunction(()=>document.querySelector('#versionTotal')?.textContent==='185',{timeout:30000});
 await p.selectOption('#versionsBrand','Hyundai');
 await p.fill('#versionsSearch','Venue QU2i');
 const items=p.locator('#versionsRows tr');
 assert.equal(await items.count(),4);
 const first=items.filter({hasText:'Venue QU2i 1.0T MT GO'});
 assert.equal(await first.count(),1);
 assert.match(await first.textContent(),/mismo código candidato usado por 1 otra/);
 const next=items.filter({hasText:'Venue QU2i 1.0T MT PLUS'});
 assert.match(await next.textContent(),/mismo código candidato usado por 1 otra/);
 await p.close();
});

await test('Fronx MHEV respaldado por fabricante sin certificar equivalencia comercial 3CV',async()=>{
 const p=await browser.newPage({viewport:{width:1440,height:900}});
 const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(base+'versiones.html',{waitUntil:'networkidle'});
 await p.waitForFunction(()=>document.querySelector('#versionTotal')?.textContent==='185',{timeout:30000});
 assert.match(await p.locator('#versionsStatus').textContent(),/22 versiones contrastadas con ficha de fabricante/);
 await p.selectOption('#versionsBrand','Suzuki');await p.fill('#versionsSearch','Fronx');
 const gl=p.locator('#versionsRows tr').filter({hasText:'1.5 GL AT'});
 assert.equal(await gl.count(),1);
 assert.match(await gl.textContent(),/Tecnología: MHEV/);
 await gl.locator('.manufacturer-evidence summary').click();
 assert.match(await gl.textContent(),/Mild Hybrid/);
 assert.match(await gl.textContent(),/No confirma que el código 3CV corresponda exactamente a esta versión/);
 assert.equal(await gl.locator('.manufacturer-evidence a').getAttribute('href'),'https://suzuki.cl/vehiculo/fronx/');
 assert.deepEqual(errors,[]);
 await p.close();
});
await test('Hunter diésel y Avatr REEV muestran fichas oficiales sin cruzar tecnologías',async()=>{
 const p=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(base+'versiones.html',{waitUntil:'networkidle'});
 await p.waitForFunction(()=>document.querySelector('#versionTotal')?.textContent==='185',{timeout:30000});
 await p.selectOption('#versionsBrand','Changan');await p.fill('#versionsSearch','Hunter 2.0T 4X2 Comfort MT');
 const hunter=p.locator('#versionsRows tr').first();
 assert.match(await hunter.textContent(),/Tecnología: DIESEL/);
 assert.match(await hunter.textContent(),/Combustible: DIESEL/);
 await hunter.locator('.manufacturer-evidence summary').click();
 assert.match(await hunter.textContent(),/diésel 2.0T DPF/);
 await p.fill('#versionsSearch','AVATR 07 4x2 REEV RWD');
 const avatr=p.locator('#versionsRows tr').first();
 assert.match(await avatr.textContent(),/Tecnología: REEV/);
 assert.match(await avatr.textContent(),/Transmisión 3CV: A/);
 const dims=await p.evaluate(()=>({doc:document.documentElement.scrollWidth,view:innerWidth}));
 assert(dims.doc<=dims.view+3,JSON.stringify(dims));
 assert.deepEqual(errors,[]);
 await p.close();
});

await test('Registro oficial documental 3CV muestra 14 códigos, 22 versiones y cero verificaciones',async()=>{
 const p=await browser.newPage({viewport:{width:1440,height:900},acceptDownloads:true});
 const errors=[];p.on('pageerror',e=>errors.push(e.message));
 const response=await p.goto(base+'homologaciones.html',{waitUntil:'networkidle'});
 assert.equal(response.status(),200);
 await p.waitForFunction(()=>document.querySelector('#regCodes')?.textContent==='14',{timeout:30000});
 assert.equal(await p.locator('#regVersions').textContent(),'22');
 assert.equal(await p.locator('#regConflicts').textContent(),'2');
 assert.equal(await p.locator('#regCertified').textContent(),'0');
 assert.equal(await p.locator('#regRows tr').count(),14);
 assert.match(await p.locator('#regStatus').textContent(),/14 de 14 códigos encontrados/);
 assert.match(await p.locator('#regRows').textContent(),/C.H. 7730/);
 assert.match(await p.locator('#regMttSource').getAttribute('href'),/subtrans.gob.cl\/3cv\/homologacion/);
 assert.equal(await p.locator('.reg-conflict').count(),2);
 assert.match(await p.locator('#regConflictsList').textContent(),/VW9988E60525S00-6/);
 assert.match(await p.locator('#regConflictsList').textContent(),/C.H. 7304/);
 assert.match(await p.locator('#regConflictsList').textContent(),/La contradicción persiste/);
 assert.equal(await p.locator('#regRows tr').filter({hasText:'VW9988E60525S00-6'}).count(),0);
 assert.deepEqual(errors,[]);
 await p.close();
});
await test('Registro 3CV filtra códigos compartidos, permite buscar y exportar CSV',async()=>{
 const p=await browser.newPage({viewport:{width:1440,height:900},acceptDownloads:true});
 await p.goto(base+'homologaciones.html',{waitUntil:'networkidle'});
 await p.waitForFunction(()=>document.querySelector('#regCodes')?.textContent==='14',{timeout:30000});
 await p.selectOption('#regBrand','Hyundai');
 assert.equal(await p.locator('#regRows tr').count(),4);
 await p.selectOption('#regShared','multiple');
 assert.equal(await p.locator('#regRows tr').count(),2);
 await p.fill('#regSearch','HY10456E60226S00-5');
 assert.equal(await p.locator('#regRows tr').count(),1);
 assert.match(await p.locator('#regRows tr').first().textContent(),/MT GO/);
 assert.match(await p.locator('#regRows tr').first().textContent(),/MT PLUS/);
 assert.match(await p.locator('#regRows tr').first().textContent(),/no son homologaciones exclusivas/);
 assert.match(await p.locator('#regRows tr').first().textContent(),/C.H. 7730/);
 assert.match(await p.locator('#regRows tr').first().textContent(),/fila Excel 7882/);
 const started=p.waitForEvent('download');await p.locator('#regDownload').click();
 const dl=await started;
 assert.equal(dl.suggestedFilename(),'rindelab-control-documental-3cv.csv');
 await p.close();
});
await test('Registro 3CV en 320 px sin desbordamiento horizontal del documento',async()=>{
 const p=await browser.newPage({viewport:{width:320,height:700},isMobile:true,hasTouch:true});
 const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(base+'homologaciones.html',{waitUntil:'networkidle'});
 await p.waitForFunction(()=>document.querySelector('#regCodes')?.textContent==='14',{timeout:30000});
 const geometry=await p.evaluate(()=>({
  doc:document.documentElement.scrollWidth,view:innerWidth,
  table:document.querySelector('.coverage-table-scroll').scrollWidth,
  tableView:document.querySelector('.coverage-table-scroll').clientWidth
 }));
 assert(geometry.doc<=geometry.view+3,JSON.stringify(geometry));
 assert(geometry.table>geometry.tableView,JSON.stringify(geometry));
 assert.deepEqual(errors,[]);
 await p.close();
});
await test('Nómina MTT conserva diferencias de clasificación Fronx y la fuente XLS precisa',async()=>{
 const p=await browser.newPage({viewport:{width:1440,height:900}});
 const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(base+'homologaciones.html',{waitUntil:'networkidle'});
 await p.waitForFunction(()=>document.querySelector('#regCodes')?.textContent==='14',{timeout:30000});
 await p.selectOption('#regBrand','Suzuki');
 assert.equal(await p.locator('#regRows tr').count(),1);
 const s=await p.locator('#regRows tr').first().textContent();
 assert.match(s,/C.H. 6607/);
 assert.match(s,/MHEV/);
 assert.match(s,/Combustión Interna/);
 assert.match(s,/Se conservan ambas categorías/);
 assert.deepEqual(errors,[]);
 await p.close();
});
await test('Cruce MTT septiembre muestra 229 nuevos, 7491 comunes y 12 discrepancias',async()=>{
 const p=await browser.newPage({viewport:{width:1440,height:900},acceptDownloads:true});
 const errors=[];p.on('pageerror',e=>errors.push(e.message));
 const resp=await p.goto(base+'novedades-3cv.html',{waitUntil:'networkidle'});
 assert.equal(resp.status(),200);
 await p.waitForFunction(()=>document.querySelector('#metricRecentNew')?.textContent==='229',{timeout:30000});
 assert.equal(await p.locator('#metricCommon').textContent(),'7.491');
 assert.equal(await p.locator('#metricMttOnly').textContent(),'554');
 assert.equal(await p.locator('#metricDiffs').textContent(),'12');
 assert.equal(await p.locator('#deltaRows tr').count(),230);
 assert.equal(await p.locator('#deltaConflicts tr').count(),12);
 assert.match(await p.locator('#deltaStatus').textContent(),/Datos de rendimiento añadidos: ninguno/);
 assert.match(await p.locator('#deltaConflicts').textContent(),/JM10011E60525M00-7/);
 assert.deepEqual(errors,[]);
 await p.close();
});
await test('Nómina MTT permite filtrar 47 BEV y 32 homologaciones de septiembre',async()=>{
 const p=await browser.newPage({viewport:{width:1440,height:900}});
 await p.goto(base+'novedades-3cv.html',{waitUntil:'networkidle'});
 await p.waitForFunction(()=>document.querySelector('#metricRecentNew')?.textContent==='229',{timeout:30000});
 await p.selectOption('#deltaTech','BEV');
 assert.equal(await p.locator('#deltaRows tr').count(),47);
 await p.selectOption('#deltaTech','');
 await p.selectOption('#deltaMonth','2026-09');
 assert.equal(await p.locator('#deltaRows tr').count(),32);
 await p.selectOption('#deltaMonth','');
 await p.fill('#deltaSearch','Deepal S05 REEV');
 assert.equal(await p.locator('#deltaRows tr').count(),1);
 assert.match(await p.locator('#deltaRows').textContent(),/C.H. 7881/);
 assert.match(await p.locator('#deltaRows').textContent(),/Sin ficha en la base de mayo/);
 await p.close();
});
await test('Subaru XV posterior a mayo no se contabiliza como alta de código',async()=>{
 const p=await browser.newPage({viewport:{width:1440,height:900},acceptDownloads:true});
 await p.goto(base+'novedades-3cv.html',{waitUntil:'networkidle'});
 await p.waitForFunction(()=>document.querySelector('#metricRecentNew')?.textContent==='229',{timeout:30000});
 await p.selectOption('#deltaPresence','present');
 assert.equal(await p.locator('#deltaRows tr').count(),1);
 assert.match(await p.locator('#deltaRows').textContent(),/SB6195E60815S00-0/);
 assert.match(await p.locator('#deltaRows').textContent(),/Ya aparece en mayo/);
 const download=p.waitForEvent('download');
 await p.locator('#deltaDownload').click();
 assert.equal((await download).suggestedFilename(),'rindelab-homologaciones-recientes-mtt-20260928.csv');
 await p.close();
});
await test('Cruce MTT septiembre funciona en pantalla de 320 px sin desbordamiento del documento',async()=>{
 const p=await browser.newPage({viewport:{width:320,height:700},isMobile:true,hasTouch:true});
 const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(base+'novedades-3cv.html',{waitUntil:'networkidle'});
 await p.waitForFunction(()=>document.querySelector('#metricRecentNew')?.textContent==='229',{timeout:30000});
 const geo=await p.evaluate(()=>({
  doc:document.documentElement.scrollWidth,view:innerWidth,
  table:document.querySelector('.delta-table').scrollWidth,
  viewport:document.querySelector('.delta-table').parentElement.clientWidth
 }));
 assert(geo.doc<=geo.view+3,JSON.stringify(geo));
 assert(geo.table>geo.viewport,JSON.stringify(geo));
 assert.deepEqual(errors,[]);
 await p.close();
});
await test('Nómina MTT histórica muestra 324 códigos con fecha y 372 filas agrupadas',async()=>{
 const p=await browser.newPage({viewport:{width:1440,height:900},acceptDownloads:true});
 const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(base+'novedades-3cv.html',{waitUntil:'networkidle'});
 await p.waitForFunction(()=>document.querySelector('#metricRecentNew')?.textContent==='229',{timeout:30000});
 await p.selectOption('#deltaGroup','historical');
 assert.equal(await p.locator('#deltaRows tr').count(),324);
 assert.match(await p.locator('#deltaCount').textContent(),/324 códigos con fecha hasta mayo \(372 filas MTT\)/);
 assert(await p.locator('#deltaMonth').isDisabled());
 assert(await p.locator('#deltaPresence').isDisabled());
 await p.fill('#deltaSearch','KI5280E40713S');
 assert.equal(await p.locator('#deltaRows tr').count(),1);
 assert.match(await p.locator('#deltaRows').textContent(),/3 denominaciones de modelo/);
 await p.locator('#deltaRows details summary').click();
 assert.match(await p.locator('#deltaRows').textContent(),/Cerato 5/);
 assert.match(await p.locator('#deltaRows').textContent(),/Koup/);
 const dl=p.waitForEvent('download');
 await p.locator('#deltaDownload').click();
 assert.equal((await dl).suggestedFilename(),'rindelab-codigos-historicos-mtt-20260928.csv');
 assert.deepEqual(errors,[]);
 await p.close();
});
await test('Exeed sin fecha se mantiene fuera de altas recientes e históricas fechadas',async()=>{
 const p=await browser.newPage({viewport:{width:1440,height:900},acceptDownloads:true});
 await p.goto(base+'novedades-3cv.html',{waitUntil:'networkidle'});
 await p.waitForFunction(()=>document.querySelector('#metricRecentNew')?.textContent==='229',{timeout:30000});
 await p.selectOption('#deltaGroup','undated');
 assert.equal(await p.locator('#deltaRows tr').count(),1);
 const row=await p.locator('#deltaRows').textContent();
 assert.match(row,/EX10292E60925S00-K/);
 assert.match(row,/RX 1\.5T PHEV DHT UNLIMITED/);
 assert.match(row,/C\.H\. 7785/);
 assert.match(row,/Sin fecha consignada/);
 assert.match(row,/no se infiere antigüedad/);
 const dl=p.waitForEvent('download');await p.locator('#deltaDownload').click();
 assert.equal((await dl).suggestedFilename(),'rindelab-codigos-sin-fecha-mtt-20260928.csv');
 await p.selectOption('#deltaGroup','recent');
 assert.equal(await p.locator('#deltaRows tr').count(),230);
 assert(await p.locator('#deltaMonth').isEnabled());
 assert(await p.locator('#deltaPresence').isEnabled());
 await p.close();
});
await test('Selector de tres cortes del MTT mantiene ancho móvil 320 px',async()=>{
 const p=await browser.newPage({viewport:{width:320,height:700},isMobile:true,hasTouch:true});
 const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(base+'novedades-3cv.html',{waitUntil:'networkidle'});
 await p.waitForFunction(()=>document.querySelector('#metricRecentNew')?.textContent==='229',{timeout:30000});
 for(const group of ['historical','undated','recent']){
  await p.selectOption('#deltaGroup',group);
  const dims=await p.evaluate(()=>({document:document.documentElement.scrollWidth,screen:innerWidth}));
  assert(dims.document<=dims.screen+3,group+' '+JSON.stringify(dims));
 }
 assert.deepEqual(errors,[]);
 await p.close();
});

await test('Deepal S05 REEV tiene ahora ficha energética 3CV oficial de octubre verificable',async()=>{
 const p=await browser.newPage({viewport:{width:1440,height:900}});
 const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(base,{waitUntil:'networkidle'});
 await p.waitForFunction(()=>document.querySelector('#recordCount')?.textContent==='8.325',{timeout:30000});
 await p.fill('#query','CN10637E60826S00-7');await p.click('#searchButton');
 assert.equal(await p.locator('.mtt-result-card').count(),0);
 assert.equal(await p.locator('.vehicle-card').count(),1);
 const card=p.locator('.vehicle-card').first();
 assert.match(await card.textContent(),/Deepal S05 REEV/i);
 assert.match(await card.textContent(),/octubre 2026/);
 assert.match(await card.textContent(),/21,3/);
 assert(await card.locator('[data-detail]').isVisible());
 await card.locator('[data-detail]').click();
 assert.match(await p.locator('#detailContent').textContent(),/Rendimiento eléctrico informado \(km\/kWh\)/);
 assert.equal(await p.locator('#detailContent dt').filter({hasText:'Rendimiento eléctrico informado'}).locator('xpath=following-sibling::dd[1]').textContent(),'6');
 await p.locator('#detailClose').click();
 assert.deepEqual(errors,[]);
 await p.close();
});
await test('Filtros oficiales de octubre incluyen JIM Re-Max y Kia Sportage HEV',async()=>{
 const p=await browser.newPage({viewport:{width:1440,height:900}});
 await p.goto(base,{waitUntil:'networkidle'});
 await p.waitForFunction(()=>document.querySelector('#recordCount')?.textContent==='8.325',{timeout:30000});
 const brands=await p.locator('#brand option').allTextContents();
 assert(brands.includes('JIM'));
 await p.selectOption('#brand','JIM');
 const models=await p.locator('#model option').allTextContents();
 assert(models.some(x=>/re[\s-]?max/i.test(x)));
 const model=await p.locator('#model option').filter({hasText:/re[\s-]?max/i}).first().getAttribute('value');
 await p.selectOption('#model',model);await p.click('#searchButton');
 assert((await p.locator('.vehicle-card').count())>=4);
 assert.equal(await p.locator('.mtt-result-card').count(),0);
 await p.click('#resetButton');
 await p.selectOption('#tech','HEV');
 await p.fill('#query','Sportage 1.6T HEV');await p.click('#searchButton');
 assert((await p.locator('.vehicle-card').count())>=2);
 assert.equal(await p.locator('.mtt-result-card').count(),0);
 await p.locator('#technical summary').click();
 await p.selectOption('#cycle','WLTP');await p.click('#searchButton');
 assert((await p.locator('.vehicle-card').count())>=2);
 await p.close();
});
await test('De septiembre queda una sola homologación MTT sin ficha: Porsche Cayenne',async()=>{
 const p=await browser.newPage({viewport:{width:1440,height:900}});
 await p.goto(base,{waitUntil:'networkidle'});
 await p.waitForFunction(()=>document.querySelector('#recordCount')?.textContent==='8.325',{timeout:30000});
 await p.click('#searchButton');
 assert.match(await p.locator('#mttSearchCount').textContent(),/1 homologación encontrada/);
 assert.equal(await p.locator('.mtt-result-card').count(),1);
 assert.match(await p.locator('.mtt-result-card').textContent(),/Cayenne Turbo Coupé Electric/);
 assert.match(await p.locator('.mtt-result-card').textContent(),/PO10585EL0726M01-9/);
 assert.equal(await p.locator('.mtt-result-card [data-compare]').count(),0);
 assert(await p.locator('#mttSearchMore').isHidden());
 await p.fill('#query','PO10585EL0726M01-9');await p.click('#searchButton');
 assert.equal(await p.locator('.vehicle-card').count(),0);
 assert.equal(await p.locator('.mtt-result-card').count(),1);
 assert(await p.locator('#emptyState').isHidden());
 await p.click('#resetButton');
 assert(await p.locator('#mttSearchSection').isHidden());
 await p.close();
});
await test('Leapmotor B03X muestra rendimiento eléctrico oficial en móvil 320px',async()=>{
 const p=await browser.newPage({viewport:{width:320,height:720},isMobile:true,hasTouch:true});
 const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(base,{waitUntil:'networkidle'});
 await p.waitForFunction(()=>document.querySelector('#recordCount')?.textContent==='8.325',{timeout:30000});
 await p.fill('#query','Leapmotor B03X');await p.click('#searchButton');
 assert((await p.locator('.vehicle-card').count())>=1);
 assert.equal(await p.locator('.mtt-result-card').count(),0);
 assert.match(await p.locator('.vehicle-card').first().textContent(),/km\/kWh/);
 const box=await p.evaluate(()=>({viewport:innerWidth,doc:document.documentElement.scrollWidth}));
 assert(box.doc<=box.viewport+3,JSON.stringify(box));
 assert.deepEqual(errors,[]);
 await p.close();
});
await test('Leyenda distingue fuente histórica mayo de API oficial octubre',async()=>{
 const p=await browser.newPage({viewport:{width:1440,height:900}});
 const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(base,{waitUntil:'networkidle'});
 await p.waitForFunction(()=>document.querySelector('#recordCount')?.textContent==='8.325',{timeout:30000});
 await p.fill('#query','Deepal S05 REEV');await p.click('#searchButton');
 assert(await p.locator('#sourceLegend').isVisible());
 assert(await p.locator('#energyResultsHeading').isVisible());
 assert.match(await p.locator('#energyResultsHeading small').textContent(),/mayo y de la consulta oficial de octubre de 2026/);
 assert.doesNotMatch(await p.locator('#energyResultsHeading small').textContent(),/rendimientos al 8 de mayo/);
 assert.match(await p.locator('.vehicle-card .energy-source-line').first().textContent(),/octubre 2026/);
 assert.equal(await p.locator('.mtt-result-card').count(),0);
 await p.fill('#query','Dolphin Mini');await p.click('#searchButton');
 assert(await p.locator('.vehicle-card').count()>0);
 assert(await p.locator('.vehicle-card [data-compare]').first().isVisible());
 assert.deepEqual(errors,[]);
 await p.close();
});
await test('12 discrepancias con evidencia primaria, desglose familiar y CSV revisable',async()=>{
 const p=await browser.newPage({viewport:{width:1440,height:900},acceptDownloads:true});
 const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(base+'novedades-3cv.html',{waitUntil:'networkidle'});
 await p.waitForFunction(()=>document.querySelector('#metricDiffs')?.textContent==='12',{timeout:30000});
 assert.equal(await p.locator('#deltaConflicts tr').count(),12);
 assert.match(await p.locator('#deltaReviewCount').textContent(),/12 de 12.*ninguna rectificación oficial confirmada/);
 const kia=p.locator('#deltaConflicts tr[data-code="KI9911E60325S00-5"]');
 await kia.locator('details summary').click();
 assert.match(await kia.textContent(),/etiqueta.*código exacto/i);
 assert.match(await kia.locator('details a').getAttribute('href'),/kia\.cl/);
 await p.selectOption('#deltaReviewGroup','JMC Vigus');
 assert.equal(await p.locator('#deltaConflicts tr').count(),4);
 assert.match(await p.locator('#deltaReviewCount').textContent(),/4 de 12 discrepancias/);
 const first=p.locator('#deltaConflicts tr').first();
 await first.locator('details summary').click();
 assert.match(await first.textContent(),/caja manual de seis velocidades/i);
 assert.match(await first.textContent(),/pendiente|sin rectificación|no prueba identidad/i);
 const file=p.waitForEvent('download');
 await p.click('#deltaReviewDownload');
 assert.equal((await file).suggestedFilename(),'rindelab-expediente-12-discrepancias-3cv-mtt.csv');
 await p.selectOption('#deltaReviewGroup','Mercedes-Benz GLE');
 assert.equal(await p.locator('#deltaConflicts tr').count(),1);
 assert.match(await p.locator('#deltaConflicts').textContent(),/3 L/);
 assert.match(await p.locator('#deltaConflicts').textContent(),/2\.0 L/);
 assert.deepEqual(errors,[]);
 await p.close();
});
await test('Estados y expediente en móvil de 320 píxeles no desbordan',async()=>{
 const p=await browser.newPage({viewport:{width:320,height:700},isMobile:true,hasTouch:true});
 const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(base,{waitUntil:'networkidle'});
 await p.waitForFunction(()=>!document.querySelector('#searchButton')?.disabled,{timeout:30000});
 await p.fill('#query','Leapmotor B03X');await p.click('#searchButton');
 assert(await p.locator('#sourceLegend').isVisible());
 const dims=await p.evaluate(()=>({doc:document.documentElement.scrollWidth,view:innerWidth}));
 assert(dims.doc<=dims.view+3,JSON.stringify(dims));
 await p.goto(base+'novedades-3cv.html',{waitUntil:'networkidle'});
 await p.waitForFunction(()=>document.querySelector('#metricDiffs')?.textContent==='12',{timeout:30000});
 await p.selectOption('#deltaReviewGroup','Karry Q22');
 assert.equal(await p.locator('#deltaConflicts tr').count(),3);
 const geo=await p.evaluate(()=>({doc:document.documentElement.scrollWidth,view:innerWidth,table:document.querySelector('.delta-conflicts-table').scrollWidth,slot:document.querySelector('.delta-conflicts-table').parentElement.clientWidth}));
 assert(geo.doc<=geo.view+3,JSON.stringify(geo));
 assert(geo.table>geo.slot,JSON.stringify(geo));
 assert.deepEqual(errors,[]);
 await p.close();
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
  assert.equal(await p.locator('.rank-item').count(),10);
  await p.selectOption('#statsMetric','weighted');
  assert.equal(await p.locator('.rank-item').count(),10);
  const size=await p.evaluate(()=>({doc:document.documentElement.scrollWidth,screen:innerWidth}));
  assert(size.doc<=size.screen+3);
  await p.locator('#statsClose').click();
 });
  await test('Carrocería Station Wagon y Jeep funciona en '+width+' px',async()=>{
  await p.locator('#statsOpen').click();
  await p.selectOption('#statsTech','');
  await p.selectOption('#statsMetric','cost');
  await p.selectOption('#statsCycle','');
  await p.selectOption('#statsBody','station');
  assert.match(await p.locator('#statsBodyHint').textContent(),/Station Wagon/);
  assert((await p.locator('.rank-item').count())>0);
  await p.selectOption('#statsBody','offroad');
  assert((await p.locator('.rank-item').count())>0);
  const dim=await p.evaluate(()=>({doc:document.documentElement.scrollWidth,screen:innerWidth}));
  assert(dim.doc<=dim.screen+3);
  await p.locator('#statsClose').click();
 });
  await test('Tasación SII accesible en móvil y tableta '+width+' px',async()=>{
  await p.click('#resetButton');
  await p.fill('#query','Corolla Cross');await p.click('#searchButton');
  await p.locator('.vehicle-card button[data-detail]').first().click();
  await p.locator('#siiShowLookup').click();
  await p.waitForFunction(()=>!!document.querySelector('#siiBrand option[value="TOYOTA"]'));
  await p.selectOption('#siiYear','2025');await p.fill('#siiModelQuery','Corolla Cross');await p.click('#siiSearch');
  await p.locator('.sii-item').first().waitFor({state:'visible'});
  assert((await p.locator('.sii-item').count())>0);
  const w=await p.evaluate(()=>({doc:document.documentElement.scrollWidth,screen:innerWidth}));
  assert(w.doc<=w.screen+3);
  await p.locator('#detailClose').click();
 });
 await test('Precios de lista consultables y visibles en '+width+' px',async()=>{
  await p.click('#resetButton');await p.fill('#query','Corolla Cross');await p.click('#searchButton');
  await p.locator('.vehicle-card button[data-detail]').first().click();
  await p.waitForFunction(()=>document.querySelectorAll('.sii-price-item').length===2);
  const size=await p.evaluate(()=>({doc:document.documentElement.scrollWidth,view:innerWidth}));
  assert(size.doc<=size.view+3);
  await p.locator('#detailClose').click();
 });
 await test('Precios Mazda disponibles en ficha móvil '+width+' px',async()=>{
  await p.click('#resetButton');await p.fill('#query','CX-30');await p.click('#searchButton');
  await p.locator('.vehicle-card button[data-detail]').first().click();
  await p.waitForFunction(()=>document.querySelectorAll('.sii-price-item').length===5);
  const size=await p.evaluate(()=>({doc:document.documentElement.scrollWidth,view:innerWidth}));
  assert(size.doc<=size.view+3);
  await p.locator('#detailClose').click();
 });
 await test('Foto de portada se conserva sin ocupar la vista móvil '+width+' px',async()=>{
  const photo=p.locator('.hero-image img');
  assert(await photo.isHidden());
  const state=await photo.evaluate(el=>({
   complete:el.complete,naturalWidth:el.naturalWidth,
   photoWidth:el.getBoundingClientRect().width,
   documentWidth:document.documentElement.scrollWidth,viewport:innerWidth
  }));
  assert(state.complete&&state.naturalWidth===450&&state.photoWidth===0,JSON.stringify(state));
  assert(state.documentWidth<=state.viewport+3,JSON.stringify(state));
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

await test('Directorio de pliegos BT1 conserva fuente sin inventar precios',async()=>{
 const {page:p,errors:e}=await open(1160,820);
 await p.locator('#homeTariffDirectory summary').click();
 assert(await p.locator('#tariffDistributor').isVisible());
 await p.selectOption('#tariffDistributor','saesa');
 assert.match(await p.locator('#tariffSourceLink').getAttribute('href'),/gruposaesa\.cl/);
 assert.match(await p.locator('#tariffSourceDescription').textContent(),/pliegos/);
 await p.selectOption('#tariffDistributor','cge');
 assert.match(await p.locator('#tariffSourceLink').getAttribute('href'),/sec\.cl\/contactar-distribuidora/);
 assert.equal(await p.locator('#homeChargeRate').inputValue(),'');
 assert.deepEqual(e,[]);
 await p.close();
});
await test('Cotizador separado carga 185 precios de 17 marcas con fuente oficial',async()=>{
 const p=await browser.newPage({viewport:{width:1360,height:900}});
 const errors=[];p.on('pageerror',e=>errors.push(e.message));
 const r=await p.goto(base+'cotizador.html',{waitUntil:'networkidle',timeout:30000});assert.equal(r.status(),200);
 await p.waitForFunction(()=>document.querySelector('#quoteCatalogNumber')?.textContent?.includes('185 registros'),{timeout:10000});
 assert.match(await p.locator('#quoteCatalogNumber').textContent(),/17 marcas/);
 assert((await p.locator('#quoteBrand option').count())===18);
 assert(await p.locator('#quoteCopy').isDisabled());
 assert.equal(await p.locator('.quote-version').count(),24);
 assert.deepEqual(errors,[]);
 await p.close();
});
await test('Cotizador comercial exige elegir versión y suma solo gastos ingresados',async()=>{
 const p=await browser.newPage({viewport:{width:1360,height:900}});
 await p.goto(base+'cotizador.html',{waitUntil:'networkidle'});
 await p.selectOption('#quoteBrand','Toyota');
 await p.selectOption('#quoteFamily','Corolla Cross');
 await p.fill('#quoteSearch','XEI');
 assert.equal(await p.locator('.quote-version').count(),1);
 await p.locator('.quote-version button').click();
 assert.equal(await p.locator('#quoteTotal').textContent(),'$27.990.000');
 assert.match(await p.locator('#quoteSelected').textContent(),/XEI 1.8 HEV CVT/);
 assert.match(await p.locator('#quoteSource').getAttribute('href'),/tienda\.toyota\.cl/);
 assert(await p.locator('#quoteCopy').isEnabled());
 await p.fill('#quoteGreen','100000');
 await p.fill('#quoteRegistration','50000');
 assert.equal(await p.locator('#quoteTotal').textContent(),'$28.140.000');
 await p.fill('#quoteOther','-1');
 assert.match(await p.locator('#quoteTotal').textContent(),/Revisa los gastos/);
 await p.fill('#quoteOther','0');
 await p.close();
});
await test('Crédito solo se simula al ingresar tasa y nunca se presenta como oferta',async()=>{
 const p=await browser.newPage({viewport:{width:1360,height:900}});
 await p.goto(base+'cotizador.html',{waitUntil:'networkidle'});
 await p.selectOption('#quoteBrand','Toyota');await p.selectOption('#quoteFamily','Corolla Cross');await p.fill('#quoteSearch','XEI');
 await p.locator('.quote-version button').click();
 await p.locator('#financeDetails summary').click();
 assert.match(await p.locator('#quoteFinanceOut').textContent(),/Ingresa una tasa/);
 await p.fill('#quoteDeposit','5000000');
 await p.fill('#quoteAnnualRate','12');
 assert.match(await p.locator('#quoteFinanceOut').textContent(),/cuota matemática/);
 assert.match(await p.locator('#quoteFinanceOut').textContent(),/CAE/);
 await p.fill('#quoteDeposit','99999999');
 assert.match(await p.locator('#quoteFinanceOut').textContent(),/pie no puede superar/);
 await p.close();
});
await test('Enlace de cotización desde la ficha 3CV preserva selección comercial manual',async()=>{
 const {page:p,errors:e}=await open(1280,850);
 await p.fill('#query','Corolla Cross');await p.click('#searchButton');
 await p.locator('.vehicle-card button[data-detail]').first().click();
 await p.waitForFunction(()=>document.querySelectorAll('.sii-price-item').length===2,{timeout:10000});
 await p.locator('.sii-price-item button').first().click();
 assert.match(await p.locator('.sii-selected-price a[href*="cotizador.html"]').getAttribute('href'),/marca=Toyota/);
 assert.match(await p.locator('.sii-selected-price a[href*="cotizador.html"]').getAttribute('href'),/modelo=Corolla/);
 assert.deepEqual(e,[]);
 await p.close();
});
for(const width of [320,390]){
 await test('Cotizador compra sin desbordamiento en '+width+' px',async()=>{
  const p=await browser.newPage({viewport:{width,height:820},deviceScaleFactor:1,isMobile:true,hasTouch:true});
  await p.goto(base+'cotizador.html',{waitUntil:'networkidle'});
  await p.waitForFunction(()=>document.querySelectorAll('.quote-version').length>0);
  let box=await p.evaluate(()=>({doc:document.documentElement.scrollWidth,view:innerWidth}));
  assert(box.doc<=box.view+3,JSON.stringify(box));
  await p.selectOption('#quoteBrand','Toyota');await p.selectOption('#quoteFamily','Corolla Cross');await p.fill('#quoteSearch','XEI');
  await p.locator('.quote-version button').click();
  box=await p.evaluate(()=>({doc:document.documentElement.scrollWidth,view:innerWidth}));
  assert(box.doc<=box.view+3,JSON.stringify(box));
  assert(await p.locator('#quoteTotal').isVisible());
  await p.close();
 });
}

await test('Lista comercial ampliada: Ford Ranger 8 y BMW X1 4 con fuente y versión exacta',async()=>{
 const {page:detailPage}=await open(1280,850);
 const list=await detailPage.evaluate(async()=>fetch('./sii/commercial-2026.json?v=20261018-list185').then(r=>r.json()));
 const ford=list.filter(x=>x.brand==='Ford'&&x.family==='Ranger');
 const bmw=list.filter(x=>x.brand==='BMW'&&x.family==='X1');
 assert.equal(ford.length,8);assert.equal(bmw.length,4);
 const expectedFord={'XL 2.0L Diésel Cabina Doble 4x2 MT':33665100,'XL 2.0L Diésel Cabina Doble 4x4 MT':38306100,
 'XLS 2.0L Diésel Cabina Doble 4x2 MT':35926100,'XLS 2.0L Diésel Cabina Doble 4x4 MT':39377100,
 'XLT 2.0L Diésel Cabina Doble 4x2 AT':39876900,'XLT 2.0L Diésel Cabina Doble 4x4 MT':42732900,
 'XLT 2.0L Diésel Cabina Doble 4x4 AT':45469900,'Limited 3.0L Diésel Cabina Doble 4x4 AT':50705900};
 const expectedBmw={'X1 sDrive18i Comfort S':44900000,'X1 sDrive18d Dynamic':48900000,
 'X1 sDrive18i M Sport':51900000,'X1 xDrive25e Dynamic':53900000};
 for(const x of ford){assert.equal(x.priceListClp,expectedFord[x.version]);assert.equal(x.source,'https://www.ford.cl/pickups/ranger/comparar-modelos/');assert.equal(x.modelYear,null);}
 for(const x of bmw){assert.equal(x.priceListClp,expectedBmw[x.version]);assert.equal(x.source,'https://www.bmw.cl/modelos/x1');assert.equal(x.modelYear,null);}
 const q=await browser.newPage({viewport:{width:1200,height:850}});
 await q.goto(base+'cotizador.html',{waitUntil:'networkidle'});
 await q.selectOption('#quoteBrand','Ford');await q.selectOption('#quoteFamily','Ranger');
 assert.equal(await q.locator('.quote-version').count(),8);
 await q.selectOption('#quoteBrand','BMW');await q.selectOption('#quoteFamily','X1');
 assert.equal(await q.locator('.quote-version').count(),4);
 await q.close();
 await detailPage.close();
});
await test('Enel BT1 octubre: comuna, red, tramo y tarifa no homologada como final',async()=>{
 const {page:enelPage,errors:enelErrors}=await open(1280,850);
 const beforeHomeRate=await enelPage.locator('#homeChargeRate').inputValue();
 await enelPage.locator('#homeTariffDirectory summary').click();
 await enelPage.selectOption('#tariffDistributor','enel');
 await enelPage.waitForFunction(()=>document.querySelector('#tariffCommune')?.options.length>20,{timeout:9000});
 assert.match(await enelPage.locator('#tariffSourceLink').getAttribute('href'),/Octubre%20de%202026\.pdf/);
 await enelPage.selectOption('#tariffCommune','La Reina');
 await enelPage.selectOption('#tariffNetwork','BT_AA');
 await enelPage.selectOption('#tariffEtr','T1');
 assert.match(await enelPage.locator('#tariffEnelStatus').textContent(),/La Reina.*BT_AA.*T1/);
 assert.match(await enelPage.locator('.tariff-component').textContent(),/162,041/);
 assert.match(await enelPage.locator('.tariff-component').textContent(),/No es el precio completo/);
 assert.equal(await enelPage.locator('#homeChargeRate').inputValue(),beforeHomeRate); // el pliego no sustituye la tarifa residencial
 const metadata=await enelPage.evaluate(async()=>fetch('./data/tarifas-bt1-enel-oct2026.json').then(r=>r.json()));
 assert.equal(metadata.documentMonth,'2026-10');
 assert.equal(metadata.completeMarginalRateClpPerKwh,null);
 assert(metadata.coveredMunicipalities.includes('Peñalolén'));
 await enelPage.locator('#homeTariffDirectory summary').click();
 assert.deepEqual(enelErrors,[]);
 await enelPage.close();
});

await test('Jerarquía visual: gasto anual visible y fecha de homologación no duplicada',async()=>{
 const {page:p,errors:issues}=await open(1250,900);
 await p.fill('#query','Corolla Cross');await p.click('#searchButton');
 const card=p.locator('.vehicle-card').first();
 assert(await card.locator('.vehicle-annual').isVisible());
 assert(await card.locator('.vehicle-five-year').isVisible());
 const heading=await card.locator('.vehicle-heading').textContent();
 assert.equal((heading.match(/Homologad/g)||[]).length,1,heading);
 assert.match(heading,/código …/);
 assert.match(await card.locator('.vehicle-annual span').textContent(),/15\.000 km/);
 assert.equal(await card.locator('.vehicle-performance').count(),1);
 assert.equal(await card.locator('.vehicle-cost').count(),1);
 const styles=await card.evaluate(el=>{
  const pick=s=>el.querySelector(s),size=s=>parseFloat(getComputedStyle(pick(s)).fontSize);
  const actions=[...el.querySelectorAll('.vehicle-actions .button')].map(x=>({label:x.textContent,px:x.getBoundingClientRect().height}));
  return {heading:size('.vehicle-heading h3'),value:size('.vehicle-annual-value'),note:size('.vehicle-meta'),button:size('.vehicle-actions .button'),actions,body:getComputedStyle(document.body).fontFamily};
 });
 assert(styles.heading>=18,JSON.stringify(styles));
 assert(styles.value>=22,JSON.stringify(styles));
 assert(styles.note>=13,JSON.stringify(styles));
 assert(styles.button>=15,JSON.stringify(styles));
 assert(styles.actions.every(x=>x.px>=44),JSON.stringify(styles.actions));
 assert(styles.actions[0].label.includes('Ver ficha'));
 assert(styles.body.includes('Inter'));
 assert.deepEqual(issues,[]);
 await p.close();
});
await test('Gasto anual destacado responde al kilometraje sin variar el rendimiento 3CV',async()=>{
 const {page:p}=await open(1280,850);
 await p.fill('#query','Corolla Cross');await p.click('#searchButton');
 const a=await p.locator('.vehicle-card').first().locator('.vehicle-annual-value').textContent();
 const performance=await p.locator('.vehicle-card').first().locator('.vehicle-performance strong').textContent();
 await p.selectOption('#annualKm','20000');
 const b=await p.locator('.vehicle-card').first().locator('.vehicle-annual-value').textContent();
 assert.notEqual(a,b);
 assert.match(await p.locator('.vehicle-card').first().locator('.vehicle-annual span').textContent(),/20\.000 km/);
 assert.equal(await p.locator('.vehicle-card').first().locator('.vehicle-performance strong').textContent(),performance);
 await p.close();
});
await test('Fuentes 3CV permanecen accesibles mediante aviso compacto',async()=>{
 const {page:p}=await open(1280,850);
 await p.fill('#query','Corolla Cross');await p.click('#searchButton');
 assert(await p.locator('#sourceLegend').isVisible());
 assert(!(await p.locator('#sourceLegend').evaluate(x=>x.open)));
 assert(await p.locator('#sourceLegend summary').isVisible());
 await p.locator('#sourceLegend summary').click();
 assert(await p.locator('#sourceLegend').evaluate(x=>x.open));
 assert.match(await p.locator('#sourceLegend').textContent(),/NEDC o WLTP/);
 assert.match(await p.locator('#sourceLegend').textContent(),/Homologaciones MTT pendientes/);
 assert.match(await p.locator('#sourceLegend').textContent(),/kilometraje seleccionado/);
 assert.equal(await p.locator('#sourceLegend a[href="#fuentes"]').count(),1);
 await p.close();
});
await test('Contraste de etiquetas secundarias y entradas de 16 píxeles',async()=>{
 const {page:p,errors:issues}=await open(1220,830);
 await p.fill('#query','Corolla Cross');await p.click('#searchButton');
 const colors=await p.evaluate(()=>{
  const ratio=(a,b)=>{
   const parse=s=>[...s.matchAll(/[\d.]+/g)].slice(0,3).map(v=>Number(v[0])/255);
   const luminosity=rgb=>rgb.map(c=>c<=0.04045?c/12.92:Math.pow((c+0.055)/1.055,2.4))
     .reduce((sum,v,i)=>sum+v*[0.2126,0.7152,0.0722][i],0);
   const x=luminosity(parse(a)),y=luminosity(parse(b));return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05);
  };
  const labels=['#scenarioSummaryText','.vehicle-heading .vehicle-meta','.vehicle-annual small','.vehicle-five-year'];
  return {ratios:labels.map(sel=>({selector:sel,ratio:ratio(getComputedStyle(document.querySelector(sel)).color,
   sel==='.vehicle-annual small'?'rgb(240,248,250)':'rgb(255,255,255)')})),
   querySize:parseFloat(getComputedStyle(document.querySelector('#query')).fontSize),
   brandSize:parseFloat(getComputedStyle(document.querySelector('#brand')).fontSize)};
 });
 assert(colors.ratios.every(x=>x.ratio>=4.5),JSON.stringify(colors));
 assert(colors.querySize>=16,JSON.stringify(colors));
 assert(colors.brandSize>=16,JSON.stringify(colors));
 assert.deepEqual(issues,[]);
 await p.close();
});
for(const w of [320,390]){
 await test('Nueva tarjeta y menú legibles en móvil '+w+' px',async()=>{
  const {page:p,errors:issues}=await open(w,820);
  await p.fill('#query','Corolla Cross');await p.click('#searchButton');
  const x=await p.evaluate(()=>{
   const c=document.querySelector('.vehicle-card'),heading=c.querySelector('.vehicle-heading h3');
   return {doc:document.documentElement.scrollWidth,screen:innerWidth,
    heading:parseFloat(getComputedStyle(heading).fontSize),
    annual:parseFloat(getComputedStyle(c.querySelector('.vehicle-annual-value')).fontSize),
    input:parseFloat(getComputedStyle(document.querySelector('#query')).fontSize),
    buttons:[...c.querySelectorAll('.vehicle-actions button')].map(b=>b.getBoundingClientRect().height),
    navHeight:document.querySelector('.mobile-nav summary').getBoundingClientRect().height,
    annualBox:c.querySelector('.vehicle-annual').getBoundingClientRect().width};
  });
  assert(x.doc<=x.screen+3,JSON.stringify(x));
  assert(x.heading>=18&&x.annual>=22&&x.input>=16,JSON.stringify(x));
  assert(x.buttons.every(n=>n>=44)&&x.navHeight>=44,JSON.stringify(x));
  assert(x.annualBox>100,JSON.stringify(x));
  assert.deepEqual(issues,[]);
  await p.close();
 });
}
await test('Cotizador conserva legibilidad y presupuesto en móvil estrecho',async()=>{
 const p=await browser.newPage({viewport:{width:320,height:820},isMobile:true,hasTouch:true});
 const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(base+'cotizador.html',{waitUntil:'networkidle'});
 await p.waitForFunction(()=>document.querySelectorAll('.quote-version').length>0);
 await p.selectOption('#quoteBrand','Toyota');await p.selectOption('#quoteFamily','Corolla Cross');await p.fill('#quoteSearch','XEI');
 await p.locator('.quote-version button').click();
 const m=await p.evaluate(()=>({
  width:document.documentElement.scrollWidth,screen:innerWidth,
  input:parseFloat(getComputedStyle(document.querySelector('#quoteSearch')).fontSize),
  title:parseFloat(getComputedStyle(document.querySelector('.quote-version strong')).fontSize),
  total:document.querySelector('#quoteTotal').textContent}));
 assert(m.width<=m.screen+3,JSON.stringify(m));
 assert(m.input>=16&&m.title>=17,JSON.stringify(m));
 assert.equal(m.total,'$27.990.000');
 assert.deepEqual(errors,[]);
 await p.close();
});

await test('Inter autoalojada: WOFF2 real disponible, sin solicitudes a Google Fonts',async()=>{
 const p=await browser.newPage({viewport:{width:1280,height:850}});
 const external=[],errors=[];
 p.on('request',r=>{if(/fonts\\.(?:googleapis|gstatic)\\.com/.test(r.url()))external.push(r.url())});
 p.on('pageerror',e=>errors.push(e.message));
 const response=await p.goto(base,{waitUntil:'networkidle'});
 assert.equal(response.status(),200);
 const result=await p.evaluate(async()=>{
  await document.fonts.ready;
  const r=await fetch('./fonts/inter-latin-wght-normal.woff2');
  const buf=await r.arrayBuffer(),b=new Uint8Array(buf);
  return {font:getComputedStyle(document.body).fontFamily,loaded:document.fonts.check('400 16px Inter'),
   status:r.status,length:b.length,magic:String.fromCharCode(...b.slice(0,4)),
   hasLocal:[...document.styleSheets].filter(x=>x.href?.includes('v6.css')).length>0};
 });
 assert.deepEqual(external,[]);
 assert.equal(result.status,200);assert.equal(result.magic,'wOF2');assert.equal(result.length,48256);
 assert(result.font.startsWith('Inter'),JSON.stringify(result));
 assert(result.loaded,JSON.stringify(result));
 assert(result.hasLocal);
 assert.deepEqual(errors,[]);
 await p.close();
});
await test('Ficha SII y precios comerciales mantienen textos legibles en pantalla de 320 px',async()=>{
 const {page:p,errors}=await open(320,820);
 await p.fill('#query','Corolla Cross');await p.click('#searchButton');
 await p.locator('.vehicle-card button[data-detail]').first().click();
 await p.waitForFunction(()=>document.querySelectorAll('.sii-price-item').length===2);
 const measured=await p.evaluate(()=>{
  const size=s=>{const el=document.querySelector(s);return el?parseFloat(getComputedStyle(el).fontSize):null};
  return {price:size('.sii-price-amount'),source:size('.sii-price-item span'),
   vehicleName:size('.sii-price-item strong'),action:size('.sii-price-actions .button'),
   kpiLabel:size('.sii-kpis small'),
   doc:document.documentElement.scrollWidth,viewport:innerWidth};
 });
 assert(measured.price>=14&&measured.source>=13&&measured.vehicleName>=15&&measured.action>=15,JSON.stringify(measured));
 if(measured.kpiLabel!==null)assert(measured.kpiLabel>=13,JSON.stringify(measured)); // KPI tributaria se renderiza solo al seleccionar un código SII
 assert(measured.doc<=measured.viewport+3,JSON.stringify(measured));
 await p.locator('#siiShowLookup').click();
 await p.waitForFunction(()=>document.querySelector('#siiModelQuery')?.offsetParent!==null);
 const inputSize=await p.locator('#siiModelQuery').evaluate(e=>parseFloat(getComputedStyle(e).fontSize));
 assert(inputSize>=16,'El campo SII debe evitar zoom iOS: '+inputSize);
 assert.deepEqual(errors,[]);
 await p.close();
});
for(const pageName of ['cobertura.html','versiones.html','homologaciones.html','novedades-3cv.html']){
 await test('Auditoría '+pageName+' mantiene lectura y tablas sin desbordar 320 px',async()=>{
  const p=await browser.newPage({viewport:{width:320,height:800},isMobile:true,hasTouch:true});
  const errors=[];p.on('pageerror',e=>errors.push(e.message));
  const r=await p.goto(base+pageName,{waitUntil:'networkidle'});
  assert.equal(r.status(),200);
  await p.waitForFunction(()=>!!document.querySelector('.coverage-table tbody tr'),{timeout:25000});
  const m=await p.evaluate(()=>{
   const read=s=>{const x=document.querySelector(s);return x?parseFloat(getComputedStyle(x).fontSize):null};
   const nav=[...document.querySelectorAll('.coverage-nav a')].map(x=>({label:x.textContent,height:x.getBoundingClientRect().height}));
   return {w:document.documentElement.scrollWidth,viewport:innerWidth,nav,
     table:read('.coverage-table'),th:read('.coverage-table th'),
     metric:read('.coverage-metrics small'),inputs:[...document.querySelectorAll('.coverage-filters input,.coverage-filters select,.delta-filters input,.delta-filters select')].map(x=>parseFloat(getComputedStyle(x).fontSize))};
  });
  assert(m.w<=m.viewport+3,JSON.stringify(m));
  assert(m.nav.every(x=>x.height>=44),JSON.stringify(m.nav));
  assert(m.table>=13&&m.th>=13&&m.metric>=13,JSON.stringify(m));
  assert(m.inputs.every(x=>x>=16),JSON.stringify(m));
  assert.deepEqual(errors,[]);
  await p.close();
 });
}
await test('Submódulos Inter no usan servicios de Google Fonts',async()=>{
 const pages=['cotizador.html','cobertura.html','versiones.html','homologaciones.html','novedades-3cv.html'];
 const p=await browser.newPage({viewport:{width:1200,height:850}});
 const external=[];
 p.on('request',r=>{if(/fonts\\.(?:googleapis|gstatic)\\.com/.test(r.url()))external.push(r.url())});
 for(const name of pages){
  const res=await p.goto(base+name,{waitUntil:'networkidle'});
  assert.equal(res.status(),200);
  const loaded=await p.evaluate(async()=>{
   await document.fonts.ready;
   return {font:getComputedStyle(document.body).fontFamily,valid:document.fonts.check('500 16px Inter')};
  });
  assert(loaded.font.startsWith('Inter')&&loaded.valid,name+': '+JSON.stringify(loaded));
 }
 assert.deepEqual(external,[]);
 await p.close();
});

await test('Búsqueda como primera tarea: escenario breve y resultados antes de ajustes',async()=>{
 const {page:p,errors:issues}=await open(1280,830);
 assert.match(await p.locator('#title').textContent(),/cuánto gastarías/i);
 assert(await p.locator('.scenario-method').evaluate(x=>!x.open));
 assert.match(await p.locator('#scenarioSummaryText').textContent(),/15\.000 km al año/);
 await p.fill('#query','Corolla Cross');await p.click('#searchButton');
 const layout=await p.evaluate(()=>{
  const r=id=>document.getElementById(id).getBoundingClientRect().top+scrollY;
  return {search:r('buscador'),summary:r('scenarioSummary'),results:r('results'),scenario:r('supuestos')};
 });
 assert(layout.search<layout.summary&&layout.summary<layout.results&&layout.results<layout.scenario,JSON.stringify(layout));
 assert.match(await p.locator('#resultsTitle').textContent(),/versiones para comparar/);
 await p.selectOption('#annualKm','20000');
 assert.match(await p.locator('#scenarioSummaryText').textContent(),/20\.000 km al año/);
 assert.deepEqual(issues,[]);
 await p.close();
});
await test('Detalle de compra prioriza indicadores, sin CO₂ N/D ni precio de compra inventado',async()=>{
 const {page:p,errors:issues}=await open(1240,850);
 await p.fill('#query','Dolphin Mini');await p.click('#searchButton');
 await p.locator('.vehicle-card button[data-detail]').first().click();
 assert(await p.locator('#detailContent .detail-kpis').isVisible());
 const kpis=await p.locator('#detailContent .detail-kpi').allTextContents();
 assert(kpis[0].includes('Gasto energético anual estimado'));
 assert(kpis.some(x=>x.includes('Cada 100 km')));
 assert(kpis.some(x=>x.includes('Rendimiento oficial')));
 assert(kpis.every(x=>!x.includes('CO₂ homologado')));
 assert.equal(await p.locator('#detailContent .detail-technical').evaluate(x=>x.open),false);
 const technical=await p.locator('#detailContent .details-list').textContent();
 assert(!/Combustible\s+N\/D|Cilindrada\s+0(?:\.0)?|CO₂\s+N\/D/.test(technical),technical);
 assert.match(await p.locator('#detailContent .detail-purchase').textContent(),/no suma un precio de compra/i);
 assert.match(await p.locator('#detailContent .detail-purchase a').getAttribute('href'),/cotizador\.html\?marca=BYD/);
 assert.deepEqual(issues,[]);
 await p.close();
});
for(const pageName of ['index.html','cotizador.html']){
 await test('Menú móvil simple y visible en '+pageName,async()=>{
  const p=await browser.newPage({viewport:{width:320,height:820},isMobile:true,hasTouch:true});
  await p.goto(base+pageName,{waitUntil:'networkidle'});
  assert(await p.locator('#mobileNav summary').isVisible());
  assert(await p.locator('.header-links').isHidden());
  await p.locator('#mobileNav summary').click();
  const nav=p.locator('#mobileNav nav');
  assert(await nav.isVisible());
  assert.equal(await nav.locator('a').count(),5);
  const targets=await nav.locator('a').allTextContents();
  assert(targets.some(x=>x.includes('Cotizar auto')));
  const bounds=await p.evaluate(()=>({doc:document.documentElement.scrollWidth,view:innerWidth}));
  assert(bounds.doc<=bounds.view+3,JSON.stringify(bounds));
  await p.close();
 });
}
await browser.close();console.log('\n'+passed+' aprobadas · '+failed+' fallidas');
if(failed)process.exit(1);
})().catch(e=>{console.error(e);process.exit(1)});
