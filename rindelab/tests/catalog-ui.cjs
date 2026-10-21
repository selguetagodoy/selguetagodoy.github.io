/* Comprueba que el filtro comercial no confunde oferta con homologación. */
const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch(process.platform==='win32'?{channel:'chrome',headless:true}:{headless:true,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1280,height:820}});
 const base=process.env.RINDELAB_BASE_URL||'http://127.0.0.1:8765/rindelab/';
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto(base,{waitUntil:'networkidle'});
  await page.waitForFunction(()=>!document.querySelector('#searchButton').disabled,{timeout:30000});
  assert.equal(await page.locator('#catalogScope').inputValue(),'priced');
  assert(await page.locator('#year option[value="2023"]').count(),'Falta un año intermedio');
  assert(await page.locator('#year option[value="2026"]').count(),'Falta el año de homologación actual');
  await page.locator('#query').fill('Corolla Cross');
  await page.locator('#searchButton').click();
  const priced=parseInt(await page.locator('#resultCount').innerText(),10);
  assert(priced>0,'El catálogo comercial no devuelve Corolla Cross');
  await page.selectOption('#catalogScope','all');
  const archival=parseInt(await page.locator('#resultCount').innerText(),10);
  assert(archival>=priced,'Cambiar al historial completo oculta resultados');
  // Independiente de los filtros, ninguna referencia HEV puede quedar asignada a Kona EV.
  const identities=await page.evaluate(()=>({
   ev:window.RindelabCommercial.minimum(['Hyundai','Kona','EV'],'Kona'),
   hev:window.RindelabCommercial.minimum(['Hyundai','Kona','HEV'],'Kona')
  }));
  assert.equal(identities.ev.technology,'EV');
  assert.equal(identities.hev.technology,'HEV');
  await page.locator('#query').fill('BM9746EL1224S00-3');
  await page.locator('#searchButton').click();
  assert(await page.locator('.energy-quality-note').count(),'Dato atípico debería estar identificado');
  assert.match(await page.locator('.vehicle-monthly-value').first().innerText(),/No estimable/);
  assert.deepEqual(errors,[]);
  console.log('PASS: alcance comercial/histórico, años dinámicos, tecnología de precios y BMW atípico');
 } finally {await browser.close();}
})().catch(err=>{console.error(err.stack);process.exit(1)});
