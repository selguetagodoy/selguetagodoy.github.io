'use strict';
const assert=require('node:assert/strict'),{chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch(process.platform==='win32'?{headless:true,channel:'chrome'}:{headless:true,args:['--no-sandbox']});
 try{
  const base=process.env.RINDELAB_BASE_URL||'http://127.0.0.1:8765/rindelab/';
  for(const width of [390,1280]){
   const page=await browser.newPage({viewport:{width,height:820},isMobile:width===390});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(base+'fotos-fuentes.html',{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>document.getElementById('total')?.textContent==='432',{timeout:20000});
   assert.equal(await page.locator('#urls').textContent(),'327');
   assert.equal(await page.locator('#results article').count(),40);
   await page.locator('#brand').fill('Mini Cooper');
   await page.waitForFunction(()=>document.querySelectorAll('#results article').length>=1);
   const t=await page.locator('#results').textContent();
   assert.match(t,/COOPER/i);assert.match(t,/Foto|Fotograf/i);
   assert((await page.locator('#results a[href*="portillosur.cl/mini/cooper"]').count())>0);
   assert((await page.locator('#results a[href*="openverse.org"]').count())>0);
   assert.equal(await page.locator('#results img').count(),0,'No reproducir fotos sin licencia');
   assert((await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth))<=3,'Desborde horizontal');
   assert.deepEqual(errors,[]);
   console.log('PASS fuentes Chile '+width+'px');
   await page.close();
  }
 }finally{await browser.close()}
})().catch(e=>{console.error(e.stack);process.exit(1)});
