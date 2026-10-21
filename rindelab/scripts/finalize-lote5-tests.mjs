import fs from 'node:fs';
const path='rindelab/tests/v2-stage2.cjs';let s=fs.readFileSync(path,'utf8');
const old="assert.equal(m.downloaded,146);assert.equal(m.skipped,0);assert.equal(m.results.filter(x=>x.status==='local').length,146);assert.equal(await p.evaluate(()=>window.RindelabPhotos.count),150);";
const next="assert.equal(m.downloaded,196);assert.equal(m.skipped,0);assert.equal(m.results.filter(x=>x.status==='local').length,196);assert.equal(await p.evaluate(()=>window.RindelabPhotos.count),200);";
if(!s.includes(old))throw Error('Expected 150 baseline test missing');
s=s.replace(old,next);
const marker=" await check('El escenario desplegable mantiene las tarifas y cálculos originales',async()=>{";
const insert=[
" await check('200 referencias: coincidencias por familia y exclusión de generaciones equivocadas',async()=>{",
"  const targets=[['Subaru','Forester AWD','Bencina','2024-01-01'],['Volkswagen','T-Cross 1.0','Bencina','2025-01-01'],",
"    ['BYD','Dolphin EV','EV','2025-01-01'],['BYD','Atto 3 EV','EV','2024-01-01'],",
"    ['Ford','Maverick HEV','HEV','2025-01-01'],['KGM','Rexton 2.2','Diésel','2024-01-01']];",
"  const results=await p.evaluate(targets=>targets.map(([brand,model,tech,date])=>window.RindelabPhotos.find([brand,model,tech,'','','','','',date],{BRAND:0,MODEL:1,TECH:2,DATE:8})?.src||null),targets);",
"  assert(results.every(src=>src?.startsWith('./images/commons/')),JSON.stringify(results));",
"  const old=await p.evaluate(()=>window.RindelabPhotos.find(['Volvo','XC60 2.4','Diésel','','','','','','2010-01-01'],{BRAND:0,MODEL:1,TECH:2,DATE:8}));",
"  assert.equal(old,null,'No asociar fotografías 2024 a una generación Volvo 2010');",
" });",
""].join('\n');
if(!s.includes(marker))throw Error('Test marker not found');
s=s.replace(marker,insert+marker);fs.writeFileSync(path,s);
for(const page of ['rindelab/index.html','rindelab/cotizador.html','rindelab/electromovilidad.html']){
 let h=fs.readFileSync(page,'utf8');
 if(!h.includes('v2-photos.js?v=20261020-local150'))throw Error('Missing 150 script in '+page);
 fs.writeFileSync(page,h.replace('v2-photos.js?v=20261020-local150','v2-photos.js?v=20261021-local200'));
}
console.log('TESTS and three pages prepared for 200 photos');
