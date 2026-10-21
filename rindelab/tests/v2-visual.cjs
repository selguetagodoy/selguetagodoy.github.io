/* RINDELAB V2 — smoke tests de UX, diseño y regresiones visuales.
 * npm / npx deben proporcionar Playwright; Chrome se utiliza en Windows. */
const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const base=process.env.RINDELAB_BASE_URL||'http://127.0.0.1:8765/rindelab/';
 const browser=await chromium.launch(process.platform==='win32'?{channel:'chrome',headless:true}:{headless:true,args:['--no-sandbox']});
 let passed=0;
 for(const width of [320,360,390,768,1024,1440,1920]){
  const page=await browser.newPage({viewport:{width,height:900},isMobile:width<600,hasTouch:width<600});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const r=await page.goto(base,{waitUntil:'domcontentloaded',timeout:30000});
  assert.equal(r.status(),200);
  await page.waitForFunction(()=>document.getElementById('recordCount')?.textContent==='8.325',{timeout:30000});
  await page.locator('.hero-image img').evaluate(el=>el.decode());
  const layout=await page.evaluate(()=>{
   const box=s=>document.querySelector(s).getBoundingClientRect();
   return {overflow:document.documentElement.scrollWidth-innerWidth,
    searchTop:box('#searchButton').top+scrollY,
    heroTitleColor:getComputedStyle(document.querySelector('.visual-hero h1')).webkitTextFillColor,
    heroImage:document.querySelector('.hero-image img').naturalWidth};
  });
  assert(layout.overflow<=3,'Overflow '+width+': '+JSON.stringify(layout));
  assert(layout.heroTitleColor==='rgb(255, 255, 255)','Low contrast headline '+width);
  assert(layout.heroImage>0,'Hero image unavailable '+width);
  if(width<=390)assert(layout.searchTop<900,'Search button not quickly accessible '+width);
  await page.locator('#query').fill('Corolla Cross');await page.locator('#searchButton').click();
  assert(await page.locator('.vehicle-card').count()>0);
  assert.match(await page.locator('.vehicle-monthly-value').first().textContent(),/\$|No estimable/);
  assert(await page.locator('.vehicle-visual').first().isVisible());
  assert.deepEqual(errors,[],'Javascript errors '+width);
  console.log('PASS '+width+'px — responsive, buscador, tarjetas y cálculo mensual');passed++;
  await page.close();
 }
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 await page.goto(base,{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.querySelector('#recordCount')?.textContent==='8.325',{timeout:30000});
 await page.locator('[data-quick-tech="EV"]').click();
 assert.equal(await page.locator('[data-quick-tech="EV"]').getAttribute('aria-pressed'),'true');
 assert(await page.locator('.vehicle-card').count()>0);
 const badges=await page.locator('.vehicle-card .vehicle-tech').evaluateAll(items=>items.map(x=>x.dataset.tech));
 assert(badges.every(x=>x==='EV'),'Quick filter inconsistent '+JSON.stringify(badges));
 console.log('PASS — filtro rápido eléctrico vinculado al motor real');passed++;
 await page.locator('[data-open-rankings]').first().click();
 assert(await page.locator('#statsDialog').evaluate(x=>x.open));
 console.log('PASS — navegación a rankings activa el diálogo');passed++;
 await page.locator('#statsClose').click();await page.locator('#resetButton').click();
 assert.equal(await page.locator('[data-quick-tech=""]').getAttribute('aria-pressed'),'true');
 console.log('PASS — restablecimiento sincroniza chips con los filtros');passed++;
 await page.close();await browser.close();
 console.log(passed+' pruebas V2 aprobadas');
})().catch(e=>{console.error('FAIL '+e.stack);process.exit(1)});
