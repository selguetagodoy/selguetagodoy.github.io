import fs from 'node:fs';
const main='rindelab/v2-photos.js',orig=fs.readFileSync(main,'utf8');
const prior='licenseUrl:licenseUrls[p.license]';
if(!orig.includes(prior))throw Error('License mapping marker missing');
fs.writeFileSync(main,orig.replace(prior,'licenseUrl:p.licenseUrl||licenseUrls[p.license]'));
for(const file of ['rindelab/index.html','rindelab/cotizador.html','rindelab/electromovilidad.html']){
 const content=fs.readFileSync(file,'utf8');if(!content.includes('v2-photos.js?v=20261020-local100'))throw Error(file+' old script not found');
 fs.writeFileSync(file,content.replace('v2-photos.js?v=20261020-local100','v2-photos.js?v=20261020-local150'));
}
const test='rindelab/tests/v2-stage2.cjs';let s=fs.readFileSync(test,'utf8');
const target="assert.equal(m.downloaded,96);assert.equal(m.skipped,0);assert.equal(m.results.filter(x=>x.status==='local').length,96);assert.equal(await p.evaluate(()=>window.RindelabPhotos.count),100);";
const updated="assert.equal(m.downloaded,146);assert.equal(m.skipped,0);assert.equal(m.results.filter(x=>x.status==='local').length,146);assert.equal(await p.evaluate(()=>window.RindelabPhotos.count),150);";
if(!s.includes(target))throw Error('Photos E2E expectation missing');s=s.replace(target,updated);
const marker=" await check('El escenario desplegable mantiene las tarifas y cálculos originales',async()=>{";
if(!s.includes(marker))throw Error('Insertion marker missing');
const addition=[
" await check('150 referencias: fotos locales de eléctricos, SUV y nuevos modelos',async()=>{",
"  const targets=[['Nissan','X-Trail 2.5','Bencina','2025-01-01'],['MG','S5 EV','EV','2025-01-01'],",
"    ['Hyundai','Inster EV','EV','2025-01-01'],['Kia','Niro HEV','HEV','2025-01-01'],",
"    ['Peugeot','408 1.6','Bencina','2024-01-01'],['Jeep','Commander Limited','Bencina','2025-01-01']];",
"  const found=await p.evaluate(targets=>targets.map(([brand,model,tech,date])=>window.RindelabPhotos.find([brand,model,tech,'','','','','',date],{BRAND:0,MODEL:1,TECH:2,DATE:8})?.src||null),targets);",
"  assert(found.every(src=>src?.startsWith('./images/commons/')),JSON.stringify(found));",
"  const wrong=await p.evaluate(()=>window.RindelabPhotos.find(['Ford','Transit Courier','','','','','','','2024-01-01'],{BRAND:0,MODEL:1,TECH:2,DATE:8}));",
"  assert.equal(wrong,null,'No asociar foto de Ford Transit a Ford Transit Courier');",
" });",
""].join('\n');
s=s.replace(marker,addition+marker);fs.writeFileSync(test,s);
console.log('Patched photo license fallback, 150 references and new E2E');
