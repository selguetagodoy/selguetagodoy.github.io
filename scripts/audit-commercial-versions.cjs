/* Pruebas y exportación del cotejo técnico exploratorio RINDELAB. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const here=path.resolve(__dirname,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(here,p),'utf8'));
const matcher=require('../rindelab/sii/coverage-matcher.js');
const audit=require('../rindelab/sii/version-audit.js');
const manifest=read('vehiculos/data/manifest.json');
const commercial=read('rindelab/sii/commercial-2026.json');
const official=read('rindelab/sii/manufacturer-evidence-2026.json');
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
const report=audit.audit(commercial,records,manifest.published,official);
assert.equal(report.schemaVersion,1);
assert.equal(report.catalogCount,127);
assert.equal(report.cases.length,127);
assert.equal(report.threeCvRecords,8053);
assert.equal(report.certificationPerformed,false);
assert.equal(report.certifiedTechnicalMatches,0);
assert.equal(report.sourceReviewedVersions,22);
assert.equal(report.manufacturerCertifiedMatches,0);
assert.equal(Object.values(report.counts).reduce((a,b)=>a+b,0),127);
assert(report.cases.every(x=>x.familyCandidates===x.consistentCandidates+x.conflictingCandidates));
assert(report.cases.every(x=>x.reviewableCandidates<=x.consistentCandidates));
const get=(brand,family,version)=>report.cases.find(x=>x.brand===brand&&x.family===family&&x.version===version);
assert.equal(get('Volkswagen','Tera','Trend 1.6 MSI MT').status,'solo_contradicciones','Tera 1.6 MT debería exigir revisión');
assert(get('Volkswagen','Tera','Trend 1.6 MSI MT').conflictsExamples.some(x=>x.conflicts.some(c=>c.field==='transmission')));
assert(get('Changan','Hunter','Hunter 2.0T 4X2 Comfort MT').examples.every(x=>!x.model.toUpperCase().includes('EREV')));
assert.equal(get('Subaru','Outback','Premium').status,'informacion_insuficiente','No completar atributos de Premium');
assert.equal(get('MG','S5','MG S5 EV 49kW COM').expressedSpecifications.technology,'EV');
assert.equal(get('Suzuki','Fronx','1.5 GL AT').expressedSpecifications.technology,'MHEV');
assert.equal(get('Changan','Hunter','Hunter 2.0T 4X2 Comfort MT').expressedSpecifications.fuel,'DIESEL');
assert.equal(get('Changan','Hunter','Hunter 2.0T 4X2 Comfort MT').expressedSpecifications.technology,'DIESEL');
assert.equal(get('Changan','Avatr 07','AVATR 07 4x2 REEV RWD').expressedSpecifications.transmission,'A');
assert.equal(get('MG','MG3','MG3 HEV 1.5L COM').expressedSpecifications.transmission,undefined);
assert.equal(get('Hyundai','Venue','Venue QU2i 1.0T MT GO').manufacturerEvidence.url,'https://www.hyundai.cl/nuestros-modelos/suv/all-new-venue/especificaciones-tecnicas/');
assert.throws(()=>audit.specsFor({brand:'Suzuki',family:'Fronx',version:'1.5 GL AT'},{brand:'Suzuki',family:'Fronx',version:'1.5 GL AT',specifications:{transmission:'M'}}),/Contradicción en nombre comercial/);
assert(get('Mazda','CX-30','CORE 2.0 2WD 6AT 7G').expressedSpecifications.engine===2);

const notes=read('rindelab/sii/review-notes-2026.json');
assert.equal(notes.schemaVersion,1);
assert.equal(notes.cases.length,2);
assert.equal(report.counts.solo_contradicciones,3);
const foresterHybrid=get('Subaru','Forester','2.5 HEV AWD CVT SPORT ES');
assert.equal(foresterHybrid.status,'solo_contradicciones','No atribuir a un Forester HEV 2026 una ficha histórica contradictoria de 3CV mayo');
assert.equal(foresterHybrid.reviewableCandidates,0);
assert(foresterHybrid.conflictsExamples.some(x=>x.conflicts.some(y=>y.field==='technology')));
assert.equal(get('Subaru','Crosstrek','2.0I HYBRID AWD CVT TOURING ES').status,'un_candidato_preliminar');
assert.equal(report.counts.un_candidato_preliminar,23);
assert(report.singleCandidateUniqueCodes>=1&&report.singleCandidateUniqueCodes<=23);
assert(report.sharedCandidateVersions>0,'Algunas versiones distintas deben compartir el candidato 3CV');
for(const note of notes.cases){
 const item=get(note.brand,note.family,note.version);
 assert(item,'Nota asociada a una versión comercial existente');
 assert.equal(item.status,'solo_contradicciones');
 assert(item.conflictsExamples.some(x=>x.code3cv===note.candidateCode3cv&&x.conflicts.some(y=>y.field==='transmission'&&y.observed===note.source3cvTransmission)));
 assert.equal(note.commercialTransmission,'M');
 assert(note.manufacturerEvidenceUrl.startsWith('https://www.volkswagen.cl/'));
}
const priority=report.cases.filter(x=>x.status==='solo_contradicciones'||x.status==='un_candidato_preliminar');
assert.equal(priority.length,26);
const priorityPayload={
 schemaVersion:1,sourceCut:manifest.published,catalogCount:report.catalogCount,
 scope:'26 prioridades documentales, incluidas dos contradicciones Tera revisadas y una Forester HEV frente al corte histórico de mayo. Ninguna correspondencia comercial certificada.',
 priorities:priority.map(c=>({
  brand:c.brand,family:c.family,version:c.version,priceListClp:c.priceListClp,
  source:c.source,status:c.status,expressedSpecifications:c.expressedSpecifications,manufacturerEvidence:c.manufacturerEvidence,
  candidates:c.reviewableCandidates,code3cv:c.singleCandidateCode||null,
  sharedWithOtherVersions:c.sharedWithOtherVersions||0,
  evidence:c.status==='solo_contradicciones'?c.conflictsExamples:c.examples.filter(e=>e.code3cv===c.singleCandidateCode).slice(0,1),
  note:notes.cases.find(n=>n.brand===c.brand&&n.family===c.family&&n.version===c.version)||null
 }))
};
function outputArg(prefix){return process.argv.find(x=>x.startsWith(prefix));}
function writeFile(name,content){
 const dst=path.resolve(name);fs.mkdirSync(path.dirname(dst),{recursive:true});fs.writeFileSync(dst,content);
}
const priorityJson=outputArg('--priority-json=');
if(priorityJson)writeFile(priorityJson.slice('--priority-json='.length),JSON.stringify(priorityPayload,null,2)+'\n');
const priorityMd=outputArg('--priority-md=');
if(priorityMd){
 const lines=[
 '# RINDELAB — 26 revisiones técnicas pendientes','',
 'Fuente 3CV al '+manifest.published+'. Ninguna de las correspondencias está certificada.',
 '',
 '| Estado | Marca y versión comercial | Código candidato | Uso del código | Fuente |',
 '|---|---|---|---|---|'
 ];
 for(const p of priorityPayload.priorities){
  const state=p.status==='solo_contradicciones'?'Contradicción documentada':'Preselección pendiente de validar';
  const name=(p.brand+' '+p.family+' '+p.version).replace(/\|/g,' ');
  lines.push('| '+state+' | '+name+' | '+(p.code3cv||'No asociar; contradicción')+
   ' | '+(p.code3cv?'Compartido con '+p.sharedWithOtherVersions+' otra(s) versión(es)':'Revisar fuente 3CV')+
   ' | '+p.source+' |');
 }
 lines.push('','## Discrepancia Volkswagen Tera',
 'La web oficial registra transmisión manual de 5 velocidades para Tera 1.6 MSI MT. La ficha 3CV VW9988E60525S00-6 dice TERA 1.6 MT, pero registra A en transmisión. Revisar con 3CV antes de asociar o modificar.',
 '','Fuentes: https://www.volkswagen.cl/tera/tera y '+manifest.source,
 '','## Subaru Forester HEV frente a registros históricos',
 'El precio comercial 2026 corresponde a Forester 2.5 HEV AWD CVT Sport ES, pero no tiene candidato compatible entre fichas de mayo. Las coincidencias por familia muestran discrepancias de tecnología, cilindrada o tracción. Esto no equivale a una rectificación ni implica que falte homologación posterior; ver la consulta oficial de octubre por separado.',
 '','Fuente comercial: https://www.subaru.cl/vehiculos/all-new-forester-hibrido/','');
 writeFile(priorityMd.slice('--priority-md='.length),lines.join('\n'));
}
console.log('PRIORIDADES '+JSON.stringify({total:priority.length,contradictions:report.counts.solo_contradicciones,documentedVW:notes.cases.length,single:report.counts.un_candidato_preliminar,uniqueCodes:report.singleCandidateUniqueCodes,sharedVersionCandidates:report.sharedCandidateVersions}));
for(const x of priorityPayload.priorities)console.log('PRIORIDAD '+JSON.stringify({brand:x.brand,family:x.family,version:x.version,status:x.status,code:x.code3cv,shared:x.sharedWithOtherVersions}));

const out=process.argv.find(s=>s.startsWith('--json='));
if(out){
 const file=path.resolve(out.slice('--json='.length));
 fs.mkdirSync(path.dirname(file),{recursive:true});
 fs.writeFileSync(file,JSON.stringify(report,null,2)+'\n');
}
console.log('RINDELAB: cotejo exploratorio de '+report.catalogCount+' precios versus '+report.threeCvRecords+' fichas 3CV.');
console.log('Estados documentales: '+JSON.stringify(report.counts));
console.log('Equivalencias técnicas certificadas: 0; el proceso NO certifica versiones.');
console.log('Fuentes oficiales de fabricante para versiones individuales: '+report.sourceReviewedVersions+'; certificaciones 3CV: '+report.manufacturerCertifiedMatches);
if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,
 '## Cotejo exploratorio de versiones RINDELAB\n\n'+
 '- Catálogo: '+report.catalogCount+' precios.\n'+
 '- Estados: '+JSON.stringify(report.counts)+'\n'+
 '- **Equivalencias certificadas: ninguna.** Solo contradicciones y atributos explícitos para revisión.\n');
