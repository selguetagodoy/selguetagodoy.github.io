/* RINDELAB · usados y descontinuados, valor comercial por año y SII separado. */
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
   await page.waitForFunction(()=>window.RindelabUsed?.count()===106&&document.querySelector('#usedCount')?.textContent.includes('90 modelos'),{timeout:30000});
   assert.equal(await page.locator('#usedScope').inputValue(),'discontinued','Los descontinuados deben ser el modo inicial');
   assert.match(await page.locator('#usedCount').textContent(),/90 modelos o generaciones/);
   await page.fill('#usedQuery','Nissan March');
   assert.match(await page.locator('#usedCount').textContent(),/1 modelos o generaciones/);
   await page.selectOption('#usedYear','2018');
   assert.match(await page.locator('.used-history-card').first().textContent(),/5\.100\.000/);
   assert.match(await page.locator('.used-history-card').first().textContent(),/7\.400\.000/);
   await page.locator('[data-history-sii]').first().click();
   assert(await page.locator('#siiCommercialDialog').evaluate(el=>el.open));
   await page.waitForFunction(()=>!!document.querySelector('#siiCommercialDialog #siiBrand option[value="NISSAN"]'),{timeout:25000});
   assert.equal(await page.locator('#siiCommercialDialog #siiBrand').inputValue(),'NISSAN');
   assert.equal(await page.locator('#siiCommercialDialog #siiYear').inputValue(),'2018');
   assert.match(await page.locator('#siiCommercialDialog #siiCurrentValue').textContent(),/Sin versi[oó]n/i);
   await page.locator('#siiCommercialClose').click();
   await page.selectOption('#usedScope','priced');
   await page.fill('#usedQuery','Ford Focus');
   await page.selectOption('#usedYear','2017');
   assert.equal(await page.locator('.used-result').count(),1,'Una observación de Ford Focus 2017');
   assert.match(await page.locator('.used-result').first().textContent(),/6\.986\.608/);
   await page.selectOption('#usedYear','');
   await page.fill('#usedQuery','Suzuki Baleno');
   assert(await page.locator('.used-result').count()>0,'Baleno tiene valor comercial');
   await page.selectOption('#usedScope','missing');
   await page.fill('#usedQuery','Suzuki');
   assert((await page.locator('.used-history-card').count())>0,'Mostrar retiros sin precio, sin interpolación');
   const missingText=await page.locator('.used-history-card').first().textContent();
   assert.match(missingText,/Valor comercial sin referencia comprobada/);
   assert(!missingText.includes('$0'),'Nunca confundir ausencia de mercado con valor cero');
   assert(await page.locator('#usedCount').textContent().then(s=>s.includes('modelos o generaciones documentadas')));
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
   assert(overflow<=3,'Desbordamiento '+width+'='+overflow);
   assert.deepEqual(errors,[],'Errores JavaScript '+width);
   await page.close();
   console.log('PASS consulta usada 106 observaciones, 90 retiros, SII manual, cobertura 390/1280 — '+width);
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack);process.exit(1);});
