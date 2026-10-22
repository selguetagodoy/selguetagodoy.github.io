/* QA: modelos descontinuados siempre visibles, incluso sin precio comercial. */
'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch(process.platform==='win32'?{channel:'chrome',headless:true}:{headless:true,args:['--no-sandbox']});
 try{
  for(const width of [390,1280]){
   const page=await browser.newPage({viewport:{width,height:850},isMobile:width===390});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   const base=(process.env.RINDELAB_BASE_URL||'http://127.0.0.1:8765/rindelab/').replace(/\/$/,'/');
   await page.goto(base+'usados.html',{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>window.RindelabUsed?.count()===296&&document.querySelector('#usedHistoryView')&&document.querySelector('#usedCount').textContent.startsWith(''),{timeout:35000});
   await page.selectOption('#usedHistoryView','retired');
   await page.waitForFunction(()=>document.querySelector('#usedCount').textContent.startsWith('90 '),{timeout:30000});
   assert.match(await page.locator('#usedCount').textContent(),/90 modelos o generaciones retirados/);
   assert(await page.locator('.used-retired-card').count()>0);
   await page.fill('#usedQuery','Toyota Prius C');
   assert.equal(await page.locator('.used-retired-card').count(),1);
   assert.match(await page.locator('.used-retired-card').textContent(),/Sin precio comercial documentado/);
   assert.equal(await page.locator('.used-retired-card .used-result-main').count(),0,'No asignar un valor de otra versión/año');
   await page.selectOption('#usedYear','2018');
   assert.match(await page.locator('.used-retired-card').textContent(),/Sin precio comercial documentado para 2018/);
   await page.locator('.used-retired-card [data-retired-sii]').click();
   assert(await page.locator('#siiCommercialDialog').evaluate(x=>x.open));
   await page.waitForFunction(()=>!!document.querySelector('#siiCommercialDialog #siiBrand option[value="TOYOTA"]'),{timeout:30000});
   assert.equal(await page.locator('#siiCommercialDialog #siiBrand').inputValue(),'TOYOTA');
   assert.equal(await page.locator('#siiCommercialDialog #siiYear').inputValue(),'2018');
   assert.match(await page.locator('#siiCommercialDialog #siiCurrentValue').textContent(),/Sin versi[oó]n/i);
   await page.locator('#siiCommercialClose').click();
   await page.selectOption('#usedHistoryView','missing');
   await page.fill('#usedQuery','Chevrolet Spark antiguo');
   assert.equal(await page.locator('.used-retired-card').count(),1);
   assert.match(await page.locator('.used-retired-card').textContent(),/Retiro limitado a generación/);
   assert.match(await page.locator('.used-retired-card').textContent(),/Sin precio comercial documentado/);
   await page.selectOption('#usedHistoryView','prices');
   await page.fill('#usedQuery','Nissan March');
   await page.selectOption('#usedYear','2018');
   assert.equal(await page.locator('.used-result').count(),1);
   assert.match(await page.locator('.used-result').first().textContent(),/5\.100\.000/);
   assert.match(await page.locator('.used-result').first().textContent(),/7\.400\.000/);
   assert.equal(await page.locator('.used-retired-card').count(),0);
   const over=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
   assert(over<=3,'Viewport overflow '+width+' = '+over);
   assert.deepEqual(errors,[],'Page JS errors '+width);
   await page.close();
   console.log('PASS histórico completo, sin valor, SII año y mercado 296 · viewport '+width);
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack);process.exitCode=1});
