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
const exception=evaluate({manifest:{count:1,excluded:0,published:'2026-05-08',files:['test']},
 files:[[['Borgward','BX7 2.0',null,null,null,null,null,null,'2017-01-01','BX7-1']]],
 commercial:[],lifecycle:{models:[]},marketExclusions:[{brand:'Borgward',family:'BX7',sourceUrl:'https://noticias.autocosmos.cl/2022/04/13/nuevamente-es-el-fin-del-camino-para-borgward'}]});
assert.equal(exception.candidates[0].status,'homologado_sin_venta_comercial');
assert.equal(exception.candidates[0].evidenceUrl.startsWith('https://'),true);
const navaraPrevious={brand:'Nissan',match:'model-prefix-list-cutoff',modelPrefixes:['Navara (D23)','NP300 NAVARA (D23)','NP300 (D23)'],homologationCutoff:'2025-12-31'};
assert(matches(['Nissan','NP300 NAVARA (D23) DC',null,null,null,null,null,null,'2019-04-15','N1'],navaraPrevious));
assert(matches(['Nissan','Navara (D23) AT',null,null,null,null,null,null,'2024-12-31','N2'],navaraPrevious));
assert(!matches(['Nissan','Navara Pro PHEV',null,null,null,null,null,null,'2026-04-15','N3'],navaraPrevious),'Navara Pro no es D23');
const mazdaGJ={brand:'Mazda',match:'model-prefix-list-cutoff',modelPrefixes:['Mazda6','Mazda 6'],homologationCutoff:'2025-12-31'};
assert(matches(['Mazda','Mazda6 2.5 AT',null,null,null,null,null,null,'2023-04-03','M1'],mazdaGJ));
assert(matches(['Mazda','Mazda 6 2.0',null,null,null,null,null,null,'2018-08-28','M2'],mazdaGJ));
assert(!matches(['Mazda','Mazda 6e Electric',null,null,null,null,null,null,'2026-05-01','M3'],mazdaGJ),'Mazda 6e no es GJ');
assert(!matches(['Mazda','Mazda6 2.5',null,null,null,null,null,null,'2026-02-01','M4'],mazdaGJ),'El corte temporal prevalece incluso con nombre repetido');
const jukeF15={brand:'Nissan',match:'previous-generation-cutoff',familyPrefix:'Juke',homologationCutoff:'2018-12-31'};
assert(matches(['Nissan','Juke (F15) 1.6',null,null,null,null,null,null,'2015-04-02','J1'],jukeF15));
assert(!matches(['Nissan','Juke eléctrico 2027',null,null,null,null,null,null,'2026-01-01','J2'],jukeF15));
console.log('OK: alias, versiones vigentes, corte temporal, candidatos sin baja automática');
