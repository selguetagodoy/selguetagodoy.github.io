/* Auditoría reproducible: presencia nominal de familias comerciales en datos 3CV. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {matches,analyze}=require('../rindelab/sii/coverage-matcher.js');
const here=path.resolve(__dirname,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(here,p),'utf8'));
const manifest=read('vehiculos/data/manifest.json');
const prices=read('rindelab/sii/commercial-2026.json');
const records=manifest.files.flatMap(p=>read('vehiculos/'+p));
function fixture(brand,name){return [brand,name,'Bencina','Gasolina','','','','','2026-05-01'];}
const cases=[
 ['Mazda','CX-3','CX30 2.0 6AT',false],
 ['Mazda','CX-30','CX-3 2.0 6AT',false],
 ['Mazda','CX-3','Mazda CX3 2.0 MT',true],
 ['Mazda','CX-30','CX30 2.0 MT',true],
 ['Hyundai','Creta','Creta Grand 2.0 MPI',false],
 ['Hyundai','Creta Grand','Creta SU2id 1.5',false],
 ['Toyota','Yaris','Yaris Cross 1.5 HEV',false],
 ['Toyota','Corolla Sedán','Corolla Cross HEV',false],
 ['Toyota','Corolla Sedán','Corolla SD 1.8',true],
 ['Changan','Hunter','Hunter E',false],
 ['Changan','Hunter','HUNTER EREV 4x2',false],
 ['Changan','Hunter','Hunter 2.0 MT 4WD',true],
 ['Changan','CS55 Plus','CS55 1.5 Turbo',false],
 ['MG','MG3','New MGZS 1.5 MT',false],
 ['MG','ZS','New MGZS 1.5 MT',true],
 ['MG','S5','MG S5 EV',true],
 ['Volkswagen','ID.4','ID.4 Pro 77kWh',true]
];
for(const [brand,family,model,expected] of cases)
 assert.equal(matches(brand,family,fixture(brand,model)),expected,brand+' '+family+' / '+model);
const report=analyze(prices,records,manifest.published);
assert.equal(report.threeCvRecords,manifest.count-manifest.excluded,'3CV al corte');
assert.equal(report.commercialPrices,prices.length,'Catálogo comercial');
assert.equal(report.commercialFamilies,new Set(prices.map(p=>p.brand+'|'+p.family)).size);
assert.equal(report.matchedFamilies+report.unmatchedFamilies,report.commercialFamilies);
assert.equal(report.technicallyValidatedVersions,null,'No hay cotejo técnico automático');
assert(report.rows.every(x=>x.commercialVersions>0&&x.candidateRecords>=0));
const filename=process.argv.find(x=>x.startsWith('--json='));
if(filename){
 const dst=path.resolve(filename.slice('--json='.length));
 fs.mkdirSync(path.dirname(dst),{recursive:true});
 fs.writeFileSync(dst,JSON.stringify(report,null,2)+'\n');
}
console.log('RINDELAB: '+report.commercialPrices+' precios, '+report.commercialFamilies+' familias comerciales, '+report.threeCvRecords+' registros 3CV al corte '+report.published);
console.log('Familias con coincidencia nominal: '+report.matchedFamilies+'; sin coincidencia: '+report.unmatchedFamilies+'; precios agrupados en familias con coincidencia: '+report.pricesInMatchedFamilies+'.');
console.log('Cotejo técnico por versión: NO REALIZADO, no debe interpretarse como homologación confirmada.');
for(const x of report.rows)console.log((x.candidateRecords>0?'NOMINAL':'PENDIENTE')+' '+x.brand+' '+x.family+': '+x.commercialVersions+' precios, '+x.candidateRecords+' fichas candidatas.');
if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,
 '## RINDELAB — cobertura nominal 3CV\n\n'+
 '- Familias comerciales: '+report.commercialFamilies+'\n'+
 '- Con coincidencia nominal: '+report.matchedFamilies+'\n'+
 '- Sin coincidencia: '+report.unmatchedFamilies+'\n'+
 '- Precios comerciales: '+report.commercialPrices+'\n\n'+
 '**Advertencia:** no equivale a vinculación de versiones comerciales con homologaciones individuales.\n');
