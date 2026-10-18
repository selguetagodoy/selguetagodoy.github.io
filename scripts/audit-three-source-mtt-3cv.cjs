'use strict';
/* Contraste exacto entre 3CV mayo, nómina MTT septiembre y API oficial octubre.
   No declara corrección documental ni altera rendimiento histórico. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const review=read('rindelab/sii/mtt-discrepancy-review-2026.json');
const snapshot=read('rindelab/sii/mtt-discrepancy-api-20261018.json');
const compare=require('../rindelab/sii/three-source-review.js').compare;
const report=compare(review,snapshot);
assert.equal(report.schemaVersion,1);
assert.equal(report.counts.found,12);
assert.equal(report.counts.may,10);
assert.equal(report.counts.mtt,2);
assert.equal(report.counts.neither,0);
assert.equal(report.counts.rectifications,0);
assert.equal(report.sourceTotalCount,8315);
assert.equal(report.sha256,'8afd3c284d7435aa5f47d94021ad21b41a340d677c360aeb0961fc4c6872ebf8');
assert(report.cases.every(x=>!x.certifiedResolved&&x.official3cvRectification===null&&x.octoberApi?.recordId));
assert.equal(report.cases.filter(x=>x.kind==='transmission').length,11);
assert.equal(report.cases.filter(x=>x.kind==='engine').length,1);
assert.equal(report.cases.filter(x=>x.octoberApi.alignedWith==='mtt').length,2);
const lookup=c=>report.cases.find(x=>x.code3cv===c);
assert.equal(lookup('MA9923E60425M00-6').octoberApi.transmission,'M');
assert.equal(lookup('NS10421T3C0126S00-7').octoberApi.transmission,'A');
assert.equal(lookup('KI9911E60325S00-5').octoberApi.alignedWith,'may');
assert.equal(lookup('JM10011E60525M00-7').octoberApi.transmission,'A');
assert.equal(lookup('KR8299E50421S00-7').octoberApi.transmission,'M');
assert.equal(lookup('MB6988E60517M00-3').octoberApi.engineL,2);
assert.equal(lookup('MB6988E60517M00-3').mtt.engineL,3);
const tamperRecord=(code,edit)=>({...snapshot,records:snapshot.records.map(x=>x.code===code?{...x,...edit}:x)});
assert.throws(()=>compare(review,{...snapshot,records:snapshot.records.slice(1)}),/captura API oficial inválida/i);
assert.throws(()=>compare(review,tamperRecord('JM10011E60525M00-7',{apiRecords:2})),/Código API duplicado/);
assert.throws(()=>compare(review,tamperRecord('JM10011E60525M00-7',{model:'Modelo inventado'})),/expediente/);
assert.throws(()=>compare(review,{...snapshot,sourceRawSha256:'INVALID'}),/Captura API oficial inválida/);
assert.throws(()=>compare({...review,cases:review.cases.map((x,i)=>i===0?{...x,certifiedResolved:true}:x)},snapshot),/expediente/);
const short={schemaVersion:1,snapshot:report.snapshotDate,source:report.source,sourceTotalCount:report.sourceTotalCount,rawSha256:report.sha256,
 cases:report.counts.found,agreeMay:report.counts.may,agreeMtt:report.counts.mtt,
 newThirdDiscrepancies:report.counts.neither,officialRectifications:report.counts.rectifications,
 notes:'Concordancia entre publicaciones ≠ rectificación formal 3CV. No se sobreescriben las bases de mayo o septiembre.'};
console.log('RINDELAB TERCERA FUENTE '+JSON.stringify(short));
const arg=process.argv.find(a=>a.startsWith('--json='));
if(arg){const output=path.resolve(arg.slice(7));fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(short,null,2)+'\n');}
if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,
 '## Tercera fuente oficial: API Consumo Vehicular (18-10-2026)\n- Los **12 códigos exactos** aparecen una vez en la API: 10 coinciden con mayo y 2 con septiembre.\n'+
 '- **Nissan Kait y MAN TGE** concuerdan con septiembre; JMC, Kia, Karry y GLE concuerdan con mayo.\n'+
 '- **0 rectificaciones oficiales acreditadas.** No sobrescribir campos fuente ni inferir identidad comercial.\n');
