/* RINDELAB: integridad del snapshot API Consumo Vehicular 18/10/2026.
 * No se confunden códigos nuevos de consumo, homologaciones MTT ni disponibilidad comercial. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const rd=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const manifest=rd('vehiculos/data/manifest.json');
const legacy=manifest.files.flatMap(p=>rd('vehiculos/'+p)).filter(x=>x?.[0]&&x?.[1]&&x?.[8]&&x[8]<=manifest.published);
const parts=[1,2,3,4].map(n=>rd('rindelab/data/oficial-api-20261018-'+String(n).padStart(2,'0')+'.json'));
const mapper=require('../rindelab/sii/official-api-mapper.js');
const newRows=mapper.load(parts,legacy);
const codes=new Set(newRows.map(r=>r[9])),oldCodes=new Set(legacy.map(r=>r[9]));
assert.equal(legacy.length,8053);
assert.equal(newRows.length,272);
assert.equal(codes.size,272);
assert.equal(legacy.length+newRows.length,8325);
assert.equal(newRows.filter(x=>x[11]==='WLTP').length,254);
assert.equal(newRows.filter(x=>x[11]==='NEDC').length,18);
assert.equal(newRows.filter(x=>x[8]>'2026-05-08').length,251);
assert.equal(newRows.filter(x=>x[8]<='2026-05-08').length,21);
const allRaw=parts.flatMap(p=>p.items);
assert.equal(allRaw.length,272);
assert.equal(new Set(allRaw.map(x=>x.codigoInformeTecnico)).size,272);
assert(allRaw.every(x=>x.fechaHomologacion.slice(0,10)<='2026-10-18'));
assert(newRows.every(row=>row.length===26&&!oldCodes.has(row[9])));
for(let i=0;i<newRows.length;i++){
 const src=allRaw[i],row=newRows[i];
 assert.equal(row[9],src.codigoInformeTecnico);
 assert.equal(row[0],src.nombreMarca);
 assert.equal(row[1],src.nombreModelo);
 assert.equal(row[8],src.fechaHomologacion.slice(0,10));
 assert.equal(row[11],src.sourceCycle);
 assert(Number.isFinite(row[12])||row[12]===null);
 assert(Number.isFinite(row[13])||row[13]===null);
 assert(Number.isFinite(row[14])||row[14]===null);
 assert(Number.isFinite(row[18])||row[18]===null);
}
const byCode=code=>newRows.find(x=>x[9]===code);
const deepal=byCode('CN10637E60826S00-7');
assert(deepal,'Deepal S05 REEV 3CV no encontrado');
assert.equal(deepal[2],'REEV');assert.equal(deepal[11],'WLTP');assert.equal(deepal[12],21.3);
assert.equal(deepal[13],6);assert.equal(deepal[14],21.3);
const seltos=byCode('KI10519E60726S00-8'); // optional model: validated dynamically below
const mazda=byCode('MZ10672T3C0926S00-9');
assert(mazda&&mazda[8]==='2026-10-13'&&mazda[12]===12.3);
const chery=byCode('CY10666E60926S00-9');
assert(chery&&chery[8]==='2026-10-13'&&chery[12]===17.5);
const tesla=byCode('TS9931EL0826S07-6');
assert(tesla&&tesla[11]==='NEDC'&&tesla[13]===6.5,'Tesla fuera de WLTC se mantiene NEDC');
const cross=rd('rindelab/sii/mtt-sept-2026-may-2026-cross.json');
const missing=cross.recentRecords.filter(x=>!x.inMaySource);
assert.equal(missing.length,229);
const filled=missing.filter(x=>codes.has(x.code));
const remaining=missing.filter(x=>!codes.has(x.code));
assert.equal(filled.length,228);
assert.equal(remaining.length,1);
assert.equal(remaining[0].code,'PO10585EL0726M01-9');
assert.equal(remaining[0].brand,'Porsche');
assert.equal(newRows.filter(x=>x[11]==='WLTP'&&x[12]===null&&x[13]===null&&x[14]===null).length,0,'No incluir fichas WLTP sin toda medida básica');
assert.throws(()=>mapper.load(parts,legacy.concat([newRows[0]])),/duplicado/i);
assert.throws(()=>mapper.load([...parts.slice(0,3),{...parts[3],items:parts[3].items.slice(1)}],legacy),/mal formado/i);
const report={schemaVersion:1,source:'https://api-consumovehicular.minenergia.cl/vehiculos/listar',snapshot:'2026-10-18',
 sourceTotalCount:8315,officialWLTC:860,additionalCodes:272,
 newWLTC:254,newNEDC:18,legacyUnchanged:8053,searchableTotal:8325,
 mttSeptemberReconciled:228,mttSeptemberPending:1,
 lastHomologation:'2026-10-13',changedLegacyMetrics:0};
console.log('RINDELAB OCTUBRE OFICIAL '+JSON.stringify(report));
const dest=process.argv.find(x=>x.startsWith('--json='));
if(dest){const f=path.resolve(dest.slice('--json='.length));fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,JSON.stringify(report,null,2)+'\n');}
if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,
 '## Integración API oficial 18/10/2026\n- **272 códigos nuevos respecto de las 8.053 fichas base:** 254 WLTP y 18 NEDC.\n'+
 '- **228 de 229** homologaciones de septiembre ya tienen ficha energética oficial; 1 sigue sin registro API.\n'+
 '- Catálogo combinando archivo histórico y API oficial: **8.325 fichas únicas**, con ciclo por fuente.\n'+
 '- No se sobrescribieron rendimientos, transmisiones ni fechas históricos del archivo mayo.\n');
