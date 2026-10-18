/* Revisión del control 3CV: documental, sin validar equivalencias por aproximación. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const base=path.resolve(__dirname,'..');
const load=p=>JSON.parse(fs.readFileSync(path.join(base,p),'utf8'));
require('../rindelab/sii/coverage-matcher.js');
const versionAudit=require('../rindelab/sii/version-audit.js');
const register=require('../rindelab/sii/homologation-register.js');
const manifest=load('vehiculos/data/manifest.json');
const prices=load('rindelab/sii/commercial-2026.json');
const manufacturer=load('rindelab/sii/manufacturer-evidence-2026.json');
const ledger=load('rindelab/sii/verification-ledger-2026.json');
const notes=load('rindelab/sii/review-notes-2026.json');
const rows=manifest.files.flatMap(file=>load('vehiculos/'+file));
const audit=versionAudit.audit(prices,rows,manifest.published,manufacturer);
const result=register.review(audit,ledger,notes);
assert.equal(result.schemaVersion,1);
assert.equal(result.preliminaryCodes,14);
assert.equal(result.preliminaryCommercialVersions,22);
assert.equal(result.duplicateCommercialVersions,15);
assert.equal(result.conflictVersions,2);
assert.equal(result.manualSkuCodeVerifications,0);
assert.equal(result.septemberRegistryCrossChecked,false);
assert.equal(result.independentHomologationDocumentObtained,false);
assert.equal(result.septemberSourceDate,'2026-09-28');
assert.equal(result.commercialSourcesCut,'2026-05-08');
assert.equal(result.cases.length,14);
const allVersions=result.cases.flatMap(x=>x.commercialVersions);
assert.equal(allVersions.length,22);
assert(allVersions.every(x=>x.checkedManufacturer&&x.officialManufacturerSpecsUrl.startsWith('https://')));
assert(result.cases.every(x=>x.status==='pendiente_documento_3cv'&&!x.verifiedSkuMatch&&!x.manualCertificateUrl&&!x.septemberRegistryCrossChecked));
assert(result.cases.some(x=>x.code==='HY10456E60226S00-5'&&x.commercialVersions.length===2));
assert(result.cases.some(x=>x.code==='VW9935T3C0425S00-5'&&x.commercialVersions.length===3));
assert(result.conflicts.every(x=>x.code==='VW9988E60525S00-6'&&x.registeredTransmission==='A'&&x.commercialTransmission==='M'));
assert(!result.cases.some(x=>x.code==='VW9988E60525S00-6'));
assert.throws(()=>register.review(audit,{...ledger,manualValidations:[{code:'VW9935T3C0425S00-5',verified:true}]},notes),/Validaciones manuales no implementadas/);
assert.throws(()=>register.review(audit,{...ledger,codeChecks:[{code:'VW9935T3C0425S00-5',matched:true}]},notes),/Importación de nómina sin validador oficial/);
assert.throws(()=>register.review(audit,{...ledger,sources:ledger.sources.map(s=>s.id==='mtt-homologados-20260928'?{...s,inspected:true}:s)},notes),/nómina de septiembre no se ha inspeccionado/);
assert.throws(()=>register.review(audit,{...ledger,sources:ledger.sources.map(s=>s.id==='mtt-homologados-20260928'?{...s,date:'2026-11-01'}:s)},notes),/Nómina 3CV MTT/);
assert.throws(()=>register.review({...audit,singleCandidateUniqueCodes:15},ledger,notes),/Número de códigos preliminares inconsistente/);
const arg=process.argv.find(v=>v.startsWith('--json='));
if(arg){const file=path.resolve(arg.slice('--json='.length));fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,JSON.stringify(result,null,2)+'\n');}
console.log('CONTROL DOCUMENTAL 3CV: '+JSON.stringify({
 candidates:result.preliminaryCodes,commercialVersions:result.preliminaryCommercialVersions,
 shared:result.duplicateCommercialVersions,conflicts:result.conflictVersions,
 septemberOfficialList:result.septemberSourceDate,septemberInspected:result.septemberRegistryCrossChecked,
 certifiedCommercialMatches:result.manualSkuCodeVerifications
}));
if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,
 '## Control documental 3CV (nómina MTT 28-09-2026)\n'+
 '- 14 códigos candidatos para 22 versiones comerciales, 15 versiones con código compartido, 2 contradicciones.\n'+
 '- Nómina MTT no inspeccionada código a código. **Correspondencias comerciales certificadas: ninguna.**\n');
