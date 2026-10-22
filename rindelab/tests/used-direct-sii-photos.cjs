'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch(process.platform==='win32'?{channel:'chrome',headless:true}:{headless:true,args:['--no-sandbox']});
 try{
 const base=process.env.RINDELAB_BASE_URL||'http://127.0.0.1:8765/rindelab/';
 for(const width of [390,1280]){
  const page=await browser.newPage({viewport:{width,height:850},isMobile:width===390});
  await page.goto(base+'usados.html?modo=documentary',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.RindelabHistoricPhotos&&window.RindelabDirectSII&&document.querySelector('#usedCount')?.textContent.includes('antecedentes'),{timeout:30000});
  assert.equal(await page.locator('[data-used-sii],[data-doc-sii],[data-retired-sii]').count(),0);
  await page.fill('#usedQuery','Kia Rio');
  await page.waitForFunction(()=>document.querySelector('.used-result .used-sii-direct')?.textContent.includes('Tasación:')||document.querySelector('.used-result .used-sii-direct')?.textContent.includes('Sin coincidencia'),{timeout:30000});
  const exact=await page.evaluate(async()=>({
   march:(await window.RindelabDirectSII.get('Nissan','March',2018)).matches.length,
   prius:(await window.RindelabDirectSII.get('Toyota','Prius C',2018)).matches,
   rio:(await window.RindelabDirectSII.get('Kia','Rio',2015)).matches.length,
   falseMatches:(await window.RindelabDirectSII.get('Nissan','March',2030)).matches.length
  }));
  assert(exact.march>=2,'March 2018 debe tener diversas versiones reales');
  assert.equal(exact.prius.length,1,'Prius C no debe recibir registros de Prius genérico');
  assert.equal(exact.prius[0][3],'PRIUS');
  assert.match(exact.prius[0][4],/^C /);
  assert(exact.rio>=2,'Debe resolver alias KIA MOTORS');
  assert.equal(exact.falseMatches,0);
  const pic=await page.evaluate(async()=>{
   const library=await window.RindelabHistoricPhotos.load();
   const f=(b,m,y,v='')=>window.RindelabHistoricPhotos.lookup(library,b,m,y,v);
   return {n:library.length,rio5:!!f('Kia','Rio',2015,'Rio 5'),rio4:!!f('Kia','Rio',2015,'Rio 4'),
    prius2018:!!f('Toyota','Prius C',2018),prius2021:!!f('Toyota','Prius C',2021),
    mini:!!f('Mini','Clubman',2016),lancer2018:!!f('Mitsubishi','Lancer',2018),
    march2018:!!f('Nissan','March',2018)};
  });
  assert.equal(pic.n,8);
  assert(pic.rio5&&!pic.rio4&&pic.prius2018&&!pic.prius2021&&pic.mini&&!pic.lancer2018&&pic.march2018);
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  assert(overflow<=3,'overflow '+width+': '+overflow);
  await page.close();
  console.log('PASS SII directo, alias por marca, generaciones fotos y móvil '+width);
 }
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack);process.exit(1)});