'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch(process.platform==='win32'?{channel:'chrome',headless:true}:{headless:true,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1300,height:850}});
 const base=process.env.RINDELAB_BASE_URL||'http://127.0.0.1:8766/rindelab/';
 const errors=[];page.on('pageerror',err=>errors.push(err.message));
 try{
  await page.goto(base,{waitUntil:'networkidle'});
  await page.waitForFunction(()=>!document.querySelector('#searchButton').disabled,{timeout:30000});
  await page.selectOption('#catalogScope','recent-no-price');
  await page.locator('#query').fill('Mokka');
  await page.locator('#searchButton').click();
  const cards=page.locator('.vehicle-card');
  assert(await cards.count()>0,'Mokka EV homologado debe estar visible en su categoria');
  const mokka=cards.filter({hasText:'Mokka Electric'}).first();
  assert(await mokka.count(),'Mokka Electric no encontrado');
  const text=await mokka.innerText();
  assert.match(text,/Homologación.*Precio por comprobar/s);
  assert.doesNotMatch(text,/22\.890\.000|24\.890\.000/,'Se atribuyo precio de gasolina a Mokka EV');
  assert(await mokka.locator('.rinde-status-recent').count(),'No aparece distintivo');
  assert.equal(await page.locator('#commercialResults').isVisible(),false,'Catalogo comercial no debe mezclarse en el filtro pendiente');
  await page.locator('#query').fill('');
  await page.locator('#searchButton').click();
  const count=parseInt(await page.locator('#resultCount').innerText(),10);
  assert.equal(count,227,'Tras el cuarto cruce quedan 227 fichas pendientes de precio de versión');
  assert(await page.locator('.vehicle-card-recent').count()>0,'Faltan tarjetas de nueva categoria');
  // La única ficha MTT sin rendimiento tiene ahora precio EV documentado en Chile:
  // no corresponde etiquetarla como «sin precio» dentro de esta categoría.
  assert.equal(await page.locator('#mttSearchSection').isVisible(),false);
  await page.locator('#statsOpen').click();
  await page.selectOption('#statsTech','EV');
  await page.selectOption('#statsCycle','WLTP');
  const ranking=await page.locator('#statsRanking').innerText();
  assert.doesNotMatch(ranking,/Mokka Electric/i,'Vehiculo sin precio aun aparece en ranking');
  await page.locator('#statsClose').click();
  assert.deepEqual(errors,[],'Errores JS detectados');
  console.log('PASS nuevas homologaciones: Mokka EV sin precio bencinero,',count,'fichas recientes sin precio, MTT con precio excluido, fuera del ranking');
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack);process.exit(1)});
