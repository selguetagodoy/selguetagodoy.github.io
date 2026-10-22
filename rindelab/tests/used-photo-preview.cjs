'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
const browser=await chromium.launch(process.platform==='win32'?{headless:true,channel:'chrome'}:{headless:true,args:['--no-sandbox']});
try{
 const base=(process.env.RINDELAB_BASE_URL||'http://127.0.0.1:8765/rindelab/').replace(/\/$/,'/');
 for(const width of [390,1280]){
  const page=await browser.newPage({viewport:{width,height:880},isMobile:width===390});
  let errors=[];page.on('pageerror',x=>errors.push(x.message));
  await page.goto(base+'usados.html?modo=prices&modelo=Nissan%20March&anio=2018',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>!!document.querySelector('.used-result .used-historic-photo img')&&!!document.querySelector('.used-result .used-sii-direct'),{timeout:35000});
  const image=page.locator('.used-result .used-historic-photo img').first();
  assert.match(await image.getAttribute('src'),/^\.\/images\/historic\//);
  await image.evaluate(el=>el.decode());assert(await image.evaluate(el=>el.naturalWidth)>400);
  await page.waitForFunction(()=>document.querySelector('.used-result .used-sii-values')?.textContent.includes('Tasación:'),{timeout:20000});
  const card=page.locator('.used-result').first();
  assert.match(await card.textContent(),/March.*2018/);assert.match(await card.textContent(),/Permiso:/);
  await page.goto(base+'usados.html?modo=documentary&modelo=Kia%20Rio&anio=2015',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelectorAll('.used-result').length===3,{timeout:35000});
  await page.waitForFunction(()=>document.querySelectorAll('.used-historic-photo img').length===2,{timeout:10000});
  assert.equal(await page.locator('.used-historic-photo img').count(),2,'Rio 4 no debe usar foto de Rio 5');
  await page.goto(base+'usados.html?modo=retired&modelo=Mitsubishi%20Lancer&anio=2018',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>!!document.querySelector('.used-retired-card'),{timeout:20000});
  await page.waitForTimeout(450);
  assert.equal(await page.locator('.used-historic-photo img').count(),0,'No utilizar Lancer 2014 para año 2018');
  assert((await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth))<=3);
  assert.deepEqual(errors,[]);
  await page.close();
  console.log('PASS ficha única: foto local, mercado, SII, generación y responsive '+width);
 }
}finally{await browser.close();}
})().catch(e=>{console.error(e.stack);process.exit(1)});
