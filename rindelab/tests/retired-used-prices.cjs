/* RINDELAB · Precios usados en catálogo de modelos descontinuados.
 * No se atribuye un valor genérico a generaciones/variantes específicas. */
'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch(process.platform==='win32'?{headless:true,channel:'chrome'}:{headless:true,args:['--no-sandbox']});
 try{
  const base=(process.env.RINDELAB_BASE_URL||'http://127.0.0.1:8765/rindelab/').replace(/\/$/,'/');
  for(const width of [320,390,1280]){
   const page=await browser.newPage({viewport:{width,height:860},isMobile:width<500});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(base+'/descontinuados.html',{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>document.querySelector('#modelRows tr')&&document.querySelector('#modelCount')?.textContent.includes('90 de 90'),{timeout:35000});
   assert.equal(await page.locator('#modelRows tr').count(),90,'No deben desaparecer casos sin precio');
   const march=page.locator('#modelRows tr').filter({hasText:/March/});
   assert.equal(await march.count(),1);
   assert.match(await march.locator('.retired-market').textContent(),/Rango|Mediana/);
   assert.match(await march.locator('.retired-market').textContent(),/20(17|18|19|20)/);
   await page.selectOption('#priceFilter','missing');
   await page.fill('#searchModel','Suzuki Jimny 5 puertas');
   assert.equal(await page.locator('#modelRows tr').count(),1);
   const jimny=await page.locator('#modelRows tr').first().textContent();
   assert.match(jimny,/Sin valor de mercado documentado/);
   assert.match(jimny,/Retiro acotado a generación o variante/);
   await page.locator('#modelRows button').first().click();
   assert(await page.locator('#siiCommercialDialog').evaluate(x=>x.open),'SII debe abrir sin asignación automática de precio');
   await page.locator('#siiCommercialClose').click();
   await page.fill('#searchModel','');
   await page.selectOption('#priceFilter','all');
   await page.selectOption('#statusFilter','previous-generation-cl');
   assert.equal(await page.locator('#modelRows tr').count(),11);
   await page.selectOption('#statusFilter','discontinued-cl');
   assert.equal(await page.locator('#modelRows tr').count(),79);
   assert.equal(await page.locator('#modelRows a[target="_blank"]').count(),79,'Enlaces de antecedentes conservados');
   const widths=await page.evaluate(()=>({doc:document.documentElement.scrollWidth,win:innerWidth,wrap:document.querySelector('.table-wrap').clientWidth}));
   assert(widths.doc<=widths.win+3,'Desbordamiento fuera de tabla '+JSON.stringify(widths));
   assert.deepEqual(errors,[],'Consola JS sin errores');
   await page.close();
   console.log('PASS retirados 90, precios observados, sin estimaciones generacionales, SII y '+width+' px');
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack);process.exit(1)});
