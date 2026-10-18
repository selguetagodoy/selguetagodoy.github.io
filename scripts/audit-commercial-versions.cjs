/* Pruebas y exportación del cotejo técnico exploratorio RINDELAB. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const here=path.resolve(__dirname,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(here,p),'utf8'));
const matcher=require('../rindelab/sii/coverage-matcher.js');
const audit=require('../rindelab/sii/version-audit.js');
const manifest=read('vehiculos/data/manifest.json');
const commercial=read('rindelab/sii/commercial-2026.json');
const records=manifest.files.flatMap(file=>read('vehiculos/'+file));
function version(label,brand='Prueba',family='Modelo'){
 return {brand,family,version:label};
}
function row(brand,model,technology,drive,transmission,engine){
 return [brand,model,technology,'Gasolina','Station Wagon',drive,transmission,engine,'2026-05-01','PRUEBA-3CV','LPO','WLTP'];
}
assert.deepEqual(audit.specsFor(version('2.0L MT 4X2 HEV')),
 {engine:2,technology:'HEV',transmission:'M',drive:'4x2'});
assert.deepEqual(audit.specsFor(version('2.5T 6AT AWD Híbrida')),
 {engine:2.5,technology:'HEV',transmission:'A',drive:'4x4'});
assert.deepEqual(audit.specsFor(version('Pro 82 kWh EV')).technology,'EV');
assert.equal(audit.specsFor(version('Premium')).engine,undefined);
assert.equal(audit.specsFor(version('Premium')).technology,undefined);
const mt=audit.specsFor(version('Trend 1.6 MSI MT'));
assert.deepEqual(audit.compare(mt,row('Volkswagen','Tera 1.6 MT','Bencina','4x2','A','1.6')).conflicts.map(x=>x.field),['transmission']);
assert.deepEqual(audit.compare(mt,row('Volkswagen','Tera 1.6 MT','Bencina','4x2','M','1.6')).agrees,['cilindrada','transmisión']);
assert(matcher.matches('Changan','Hunter',row('Changan','Hunter 2.0 MT 2WD','Diésel','4x2','M','2.0')));
assert(!matcher.matches('Changan','Hunter',row('Changan','HUNTER EREV 4x2','REEV','4x2','A','2.0')));
assert(!matcher.matches('Mazda','CX-3',row('Mazda','CX30 2.0','Bencina','4x2','A','2.0')));
assert(!matcher.matches('Hyundai','Creta',row('Hyundai','Creta Grand 2.0','Bencina','4x2','M','2.0')));
const report=audit.audit(commercial,records,manifest.published);
assert.equal(report.schemaVersion,1);
assert.equal(report.catalogCount,122);
assert.equal(report.cases.length,122);
assert.equal(report.threeCvRecords,8053);
assert.equal(report.certificationPerformed,false);
assert.equal(report.certifiedTechnicalMatches,0);
assert.equal(Object.values(report.counts).reduce((a,b)=>a+b,0),122);
assert(report.cases.every(x=>x.familyCandidates===x.consistentCandidates+x.conflictingCandidates));
assert(report.cases.every(x=>x.reviewableCandidates<=x.consistentCandidates));
const get=(brand,family,version)=>report.cases.find(x=>x.brand===brand&&x.family===family&&x.version===version);
assert.equal(get('Volkswagen','Tera','Trend 1.6 MSI MT').status,'solo_contradicciones','Tera 1.6 MT debería exigir revisión');
assert(get('Volkswagen','Tera','Trend 1.6 MSI MT').conflictsExamples.some(x=>x.conflicts.some(c=>c.field==='transmission')));
assert(get('Changan','Hunter','Hunter 2.0T 4X2 Comfort MT').examples.every(x=>!x.model.toUpperCase().includes('EREV')));
assert.equal(get('Subaru','Outback','Premium').status,'informacion_insuficiente','No completar atributos de Premium');
assert.equal(get('MG','S5','MG S5 EV 49kW COM').expressedSpecifications.technology,'EV');
assert(get('Mazda','CX-30','CORE 2.0 2WD 6AT 7G').expressedSpecifications.engine===2);
const out=process.argv.find(s=>s.startsWith('--json='));
if(out){
 const file=path.resolve(out.slice('--json='.length));
 fs.mkdirSync(path.dirname(file),{recursive:true});
 fs.writeFileSync(file,JSON.stringify(report,null,2)+'\n');
}
console.log('RINDELAB: cotejo exploratorio de '+report.catalogCount+' precios versus '+report.threeCvRecords+' fichas 3CV.');
console.log('Estados documentales: '+JSON.stringify(report.counts));
console.log('Equivalencias técnicas certificadas: 0; el proceso NO certifica versiones.');
if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,
 '## Cotejo exploratorio de versiones RINDELAB\n\n'+
 '- Catálogo: '+report.catalogCount+' precios.\n'+
 '- Estados: '+JSON.stringify(report.counts)+'\n'+
 '- **Equivalencias certificadas: ninguna.** Solo contradicciones y atributos explícitos para revisión.\n');
