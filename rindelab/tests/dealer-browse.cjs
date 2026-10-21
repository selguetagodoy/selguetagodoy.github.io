/* Cobertura por distribuidor y cinco fotografías licenciadas en producción local. */
const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch(process.platform==='win32'?{channel:'chrome',headless:true}:{headless:true,args:['--no-sandbox']});
 try{
  for(const viewport of [{width:390,height:844},{width:1280,height:900}]){
   const page=await browser.newPage({viewport,isMobile:viewport.width<500});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(process.env.RINDELAB_BASE_URL||'http://127.0.0.1:8765/rindelab/',{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>window.RindelabMarket?.getTotal()>700&&document.querySelector('#searchButton')&&!document.querySelector('#searchButton').disabled,{timeout:90000});
   await page.selectOption('#catalogScope','commercial');
   await page.fill('#query','Trailseeker');await page.click('#searchButton');
   assert((await page.locator('.market-card').count())>=1,'No se muestra Subaru Trailseeker sin ficha 3CV');
   assert.match(await page.locator('.market-card').first().textContent(),/Consultar precio en fuente/);
   assert(await page.locator('.market-card img').count()>=1,'Falta fotografía Trailseeker licenciada');
   await page.fill('#query','LK5 EV Cargobox');await page.click('#searchButton');
   const landking=await page.locator('.market-card').first().textContent();
   assert.match(landking,/\$42\.828\.100/);
   assert.match(landking,/\+ IVA/);
   assert.equal(await page.locator('a[href="https://www.pompeyo.cl/producto/lk5-ev-cargobox/"]').count(),1);
   await page.fill('#query','Sq5');await page.click('#searchButton');
   assert(await page.locator('.market-card').count()>0,'No muestra Audi SQ5 observado por Salazar Israel');
   assert.match(await page.locator('.market-card').first().textContent(),/Consultar precio en fuente/);
   await page.fill('#query','Sealion 7');await page.click('#searchButton');
   assert(await page.locator('.market-card').count()>0,'No encuentra BYD Sealion 7');
   assert(await page.locator('.market-card img').count()>0,'No figura nueva foto BYD con licencia');
   const dimensions=await page.evaluate(()=>({doc:document.documentElement.scrollWidth,viewport:innerWidth}));
   assert(dimensions.doc<=dimensions.viewport+3,'Desbordamiento '+JSON.stringify(dimensions));
   assert.deepEqual(errors,[],'Errores JavaScript en interfaz ampliada');
   console.log('PASS directorio 0 km, precio lista/no informado, imágenes licenciadas y ancho '+viewport.width);
   await page.close();
  }
 } finally{await browser.close();}
})().catch(e=>{console.error(e.stack);process.exit(1)});
