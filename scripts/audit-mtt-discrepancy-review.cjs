'use strict';
/* Auditoría documental sin corregir datos de origen ni certificar relaciones por inferencia. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const cross=read('rindelab/sii/mtt-sept-2026-may-2026-cross.json');
const review=read('rindelab/sii/mtt-discrepancy-review-2026.json');
assert.equal(review.schemaVersion,1);assert.equal(cross.counts.matchedCodeTransmissionOrEngineConflicts,12);
assert.equal(review.sourceMayCut,cross.source.mayCut);
assert.equal(review.sourceMttCut,'2026-09-28');
assert.equal(review.cases.length,12);
assert.equal(new Set(review.cases.map(c=>c.code3cv)).size,12);
const original=new Map(cross.matchedCodeTechnicalDifferences.map(x=>[x.code,x]));
const groups={};
for(const c of review.cases){
 const raw=original.get(c.code3cv);
 assert(raw,'Código inventado: '+c.code3cv);
 assert.equal(c.officialModel,raw.mtt.model);
 assert.equal(c.kind,raw.kind);
 assert.equal(c.mtt.excelRow,raw.mtt.row);
 assert.equal(c.mtt.transmission,raw.mtt.transmission);
 assert.equal(c.may.transmission,raw.may.transmission);
 assert.equal(Number(c.mtt.engineL),Number(raw.mtt.engineL));
 assert.equal(Number(c.may.engineL),Number(raw.may.engineL));
 assert.equal(c.mtt.value,String(raw.kind==='engine'?raw.mtt.engineL:raw.mtt.transmission));
 assert.equal(c.may.value,String(raw.kind==='engine'?raw.may.engineL:raw.may.transmission));
 assert.equal(c.certifiedResolved,false);
 assert.equal(c.official3cvRectification,null);
 assert.equal(c.verificationStatus,'evidencia_fabricante_consultada_pendiente_rectificacion_3cv');
 assert(c.manufacturer.observation.length>40);
 const u=new URL(c.manufacturer.url);
 assert.equal(u.protocol,'https:');
 assert(['etiqueta_código_exactamente','familia_modelo_no_identidad_codigo'].includes(c.manufacturer.scope));
 assert.equal(c.group,c.family);
 groups[c.group]=(groups[c.group]||0)+1;
}
assert.deepEqual(groups,review.groups);
assert.equal(Object.keys(groups).length,6);
assert.equal(review.cases.filter(c=>c.kind==='engine').length,1);
assert.equal(review.cases.filter(c=>c.kind==='transmission').length,11);
assert.equal(review.cases.filter(c=>c.manufacturer.scope==='etiqueta_código_exactamente').length,1);
assert(review.cases.some(x=>x.code3cv==='KI9911E60325S00-5'&&x.manufacturer.scope==='etiqueta_código_exactamente'));
assert(review.cases.some(x=>x.code3cv==='MB6988E60517M00-3'&&x.kind==='engine'&&Number(x.mtt.value)===3&&Number(x.may.value)===2));
const summary={schemaVersion:1,reviewed:review.cases.length,transmission:11,engine:1,
 manufacturerFamilyOrModel:11,manufacturerCodeSpecific:1,certifiedResolved:0,groups};
console.log('RINDELAB QA 12 DIFERENCIAS '+JSON.stringify(summary));
const out=process.argv.find(x=>x.startsWith('--json='));
if(out){const p=path.resolve(out.slice('--json='.length));fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(summary,null,2)+'\n');}
if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,
 '## Expediente de discrepancias MTT / 3CV\n'+
 '- 12 casos revisados documentalmente (11 transmisión; 1 cilindrada) con fuente primaria del fabricante.\n'+
 '- 1 fuente de etiqueta energética que identifica código exacto; otras 11 describen familia o modelo, sin resolver identidad de certificado.\n'+
 '- **0 rectificaciones 3CV demostradas y 0 campos sobrescritos.**\n');
