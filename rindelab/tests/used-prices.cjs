/* RINDELAB · cotizaciones usadas por año: fuente ≠ SII. */
'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch(process.platform==='win32'?{headless:true,channel:'chrome'}:{headless:true,args:['--no-sandbox']});
 try{
  for(const width of [390,1280]){
   const page=await browser.newPage({viewport:{width,height:900},isMobile:width===390});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   const base=(process.env.RINDELAB_BASE_URL||'http://127.0.0.1:8765/rindelab/').replace(/\/$/,'/');
   await page.goto(base+'usados.html',{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>window.RindelabUsed?.count()>=178&&document.querySelectorAll('.used-result').length>0,{timeout:30000});
   await page.fill('#usedQuery','Nissan March');
   await page.waitForFunction(()=>Number(document.querySelector('#usedCount').textContent.match(/^\d+/)?.[0])>=5);
   assert(await page.locator('.used-result').count()>=5);
   assert(await page.locator('.used-result .used-retired-status').count()>0,'Falta estado de retiro respaldado');
   await page.selectOption('#usedYear','2018');
   assert.equal(await page.locator('.used-result').count(),1);
   assert.match(await page.locator('.used-result').first().textContent(),/5\.100\.000/);
   assert.match(await page.locator('.used-result').first().textContent(),/7\.400\.000/);
   await page.locator('.used-result button[data-used-sii]').first().click();
   assert(await page.locator('#siiCommercialDialog').evaluate(x=>x.open));
   await page.waitForFunction(()=>!!document.querySelector('#siiCommercialDialog #siiBrand option[value="NISSAN"]'),{timeout:30000});
   assert.equal(await page.locator('#siiCommercialDialog #siiBrand').inputValue(),'NISSAN');
   assert.equal(await page.locator('#siiCommercialDialog #siiYear').inputValue(),'2018');
   assert.match(await page.locator('#siiCommercialDialog #siiCurrentValue').textContent(),/Sin versi[oó]n/i);
   assert.match(await page.locator('#siiCommercialDialog .sii-used-market').textContent(),/5\.100\.000/);
   await page.locator('#siiCommercialClose').click();
   await page.fill('#usedQuery','Ford Focus');
   await page.selectOption('#usedYear','2017');
   assert.equal(await page.locator('.used-result').count(),1);
   assert.match(await page.locator('.used-result').first().textContent(),/6\.986\.608/);
   await page.locator('#usedOnlyDiscontinued').uncheck();
   await page.fill('#usedQuery','Toyota Yaris');
   await page.selectOption('#usedYear','2022');
   assert.equal(await page.locator('.used-result').count(),1,'Filtro debe permitir también modelos vigentes');
   assert.match(await page.locator('.used-result').first().textContent(),/10\.690\.000/);
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
   assert(overflow<=3,'Overflow '+width+'='+overflow);
   assert.deepEqual(errors,[]);
   await page.close();console.log('PASS usados reales y SII por año '+width);
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack);process.exit(1);});