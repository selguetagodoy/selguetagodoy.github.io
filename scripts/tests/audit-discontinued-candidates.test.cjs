'use strict';
const assert=require('node:assert/strict');
const {evaluate,canonical,clean,family,matches,asMarkdown}=require('../audit-discontinued-candidates.cjs');
assert.equal(canonical('M. Benz'),'MERCEDES BENZ');
assert.equal(canonical('Haval'),'GREAT WALL');
assert.equal(clean('Kia','Kia Rio 4 1.4'),'RIO 4 1 4');
assert.equal(family('Chery','Tiggo 7 Pro Max 1.5'),'TIGGO 7');
const lifecycle={models:[
 {brand:'Chevrolet',model:'Spark antiguo',match:'model-prefix-exclusions',familyPrefix:'Spark',excludePrefixes:['Spark EUV']},
 {brand:'BMW',model:'i3 hatchback',match:'previous-generation-cutoff',familyPrefix:'i3',homologationCutoff:'2022-12-31'}
]};
const rows=[
 ['Chevrolet','Spark GT 1.2',null,null,null,null,null,null,'2019-01-20','C1'],
 ['Chevrolet','Spark EUV',null,null,null,null,null,null,'2026-04-20','C2'],
 ['Kia','Rio 4 1.4',null,null,null,null,null,null,'2020-02-20','K1'],
 ['Kia','K3 Cross',null,null,null,null,null,null,'2026-03-01','K2'],
 ['BMW','i3 REX',null,null,null,null,null,null,'2022-05-01','B1'],
 ['BMW','i3 nueva berlina',null,null,null,null,null,null,'2026-03-20','B2'],
 ['Kia','Futuro',null,null,null,null,null,null,'2026-12-15','F1']
];
assert(matches(rows[0],lifecycle.models[0]));
assert(!matches(rows[1],lifecycle.models[0]));
assert(matches(rows[4],lifecycle.models[1]));
assert(!matches(rows[5],lifecycle.models[1]));
const report=evaluate({manifest:{count:7,excluded:1,published:'2026-05-08',files:['test']},
 files:[rows],commercial:[{brand:'Chevrolet',family:'Spark EUV'},{brand:'Kia',family:'K3 Cross'}],lifecycle});
assert.equal(report.summary.valid3cvRecords,6);
assert.equal(report.summary.excludedAfterCut,1);
assert.equal(report.summary.tagged3cvRecords,2);
assert.equal(report.candidates.find(x=>x.brand==='KIA'&&x.family==='RIO').status,'candidato_antiguo_prioridad_alta');
assert.equal(report.candidates.find(x=>x.brand==='KIA'&&x.family==='K3 CROSS').status,'familia_con_precio_registrado');
assert.equal(report.candidates.find(x=>x.brand==='CHEVROLET'&&x.family==='SPARK').status,'clasificado_con_fuente');
assert.match(asMarkdown(report),/NO una nómina acreditada/);
assert(!report.candidates.some(x=>x.status==='discontinued-cl'));
console.log('OK: alias, versiones vigentes, corte temporal, candidatos sin baja automática');
