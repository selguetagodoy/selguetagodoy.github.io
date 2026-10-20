/* Auditoría XLS MTT 28/09/2026 con trazabilidad por código, fila y certificado. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
require('../rindelab/sii/coverage-matcher.js');
const versionAudit=require('../rindelab/sii/version-audit.js');
const register=require('../rindelab/sii/homologation-register.js');
const manifest=read('vehiculos/data/manifest.json');
const prices=read('rindelab/sii/commercial-2026.json');
const manufacturer=read('rindelab/sii/manufacturer-evidence-2026.json');
const ledger=read('rindelab/sii/verification-ledger-2026.json');
const notes=read('rindelab/sii/review-notes-2026.json');
const nomina=read('rindelab/sii/mtt-nomina-20260928-extract.json');
const rows=manifest.files.flatMap(f=>read('vehiculos/'+f));
const audit=versionAudit.audit(prices,rows,manifest.published,manufacturer);
const report=register.review(audit,ledger,notes,nomina);
assert.equal(report.schemaVersion,2);
assert.equal(report.preliminaryCodes,14);
assert(report.preliminaryCommercialVersions>=22,'No perder las 22 versiones documentales del corte MTT, aunque el catálogo comercial haya crecido');
assert(report.preliminaryCommercialVersionsOutsideExtract>=1,'Conservar candidato Subaru documentado, sin certificarlo');
const subaruOutside=report.preliminaryCodesOutsideExtract.find(x=>x.code==='SB9848T3C0225S00-9');
assert(subaruOutside,'No perder candidato Subaru no certificado');
assert(subaruOutside.commercialVersions.some(x=>x.version==='2.0I HYBRID AWD CVT TOURING ES'));
assert(report.preliminaryCodesOutsideExtract.every(x=>!report.cases.some(c=>c.code===x.code)),'No elevar candidatos nuevos a homologaciones certificadas');
assert(!report.cases.some(x=>x.code==='SB9848T3C0225S00-9'),'El nuevo candidato no está certificado en el extracto congelado de 15 filas');
assert.equal(report.duplicateCommercialVersions,15);
assert.equal(report.conflictVersions,2);
assert.equal(report.manualSkuCodeVerifications,0);
assert.equal(report.septemberRegistryCrossChecked,true);
assert.equal(report.septemberCodesFound,14);
assert.equal(report.septemberCodesNotFound,0);
assert.equal(report.independentHomologationDocumentObtained,false);
assert.equal(report.septemberSourceDate,'2026-09-28');
assert.equal(report.commercialSourcesCut,'2026-05-08');
assert.equal(report.cases.length,14);
assert.equal(nomina.records.length,15);
assert.equal(nomina.sourceFileSha256,'6b013ee19be8e78757efa171a262badf793d0148aa35ca2154224858caaa5afa');
const allVersions=report.cases.flatMap(x=>x.commercialVersions);
assert.equal(allVersions.length,22);
assert(allVersions.every(x=>x.checkedManufacturer&&x.officialManufacturerSpecsUrl.startsWith('https://')));
assert(report.cases.every(x=>x.status==='codigo_presente_en_nomina_no_validado_para_version'&&!x.verifiedSkuMatch&&!x.manualCertificateUrl&&x.septemberRegistryCrossChecked&&x.septemberCertificate));
assert(report.cases.some(x=>x.code==='HY10456E60226S00-5'&&x.commercialVersions.length===2&&x.septemberCertificate==='C.H. 7730'));
assert(report.cases.some(x=>x.code==='VW9935T3C0425S00-5'&&x.commercialVersions.length===3&&x.septemberCertificate==='C.H. 7373'));
assert(report.cases.some(x=>x.code==='SZ9173E60623S00-4'&&x.technologyTaxonomyNote&&x.septemberTechnology==='Combustión Interna'&&x.threeCvTechnology==='MHEV'));
assert(report.conflicts.every(x=>x.code==='VW9988E60525S00-6'&&x.registeredTransmission==='A'&&x.septemberRegisteredTransmission==='A'&&x.commercialTransmission==='M'&&x.septemberCertificate==='C.H. 7304'));
assert(!report.cases.some(x=>x.code==='VW9988E60525S00-6'));
const tamper=(code,change)=>({...nomina,records:nomina.records.map(x=>x.code===code?{...x,...change}:x)});
const unchecked=(changes)=>({...ledger,sources:ledger.sources.map(x=>x.id==='mtt-homologados-20260928'?{...x,...changes}:x)});
assert.throws(()=>register.review(audit,{...ledger,manualValidations:[{code:'VW9935T3C0425S00-5',verified:true}]},notes,nomina),/Validaciones manuales no implementadas/);
assert.throws(()=>register.review(audit,{...ledger,codeChecks:[{code:'VW9935T3C0425S00-5',matched:true}]},notes,nomina),/Registro duplicado/);
assert.throws(()=>register.review(audit,unchecked({inspected:false}),notes,nomina),/extracto oficial MTT no está contrastado/);
assert.throws(()=>register.review(audit,unchecked({sourceSha256:'0'.repeat(64)}),notes,nomina),/extracto oficial MTT no está contrastado/);
assert.throws(()=>register.review(audit,ledger,notes,tamper('HY10456E60226S00-5',{transmission:'A'})),/Discrepancia de transmisión entre fuentes 3CV/);
assert.throws(()=>register.review(audit,ledger,notes,tamper('VW9988E60525S00-6',{transmission:'M'})),/discrepancia Tera no fue confirmada/i);
assert.throws(()=>register.review(audit,ledger,notes,tamper('SZ9173E60623S00-4',{engineL:1.7})),/Discrepancia de cilindrada/);
assert.throws(()=>register.review(audit,ledger,notes,{...nomina,records:nomina.records.filter(x=>x.code!=='HY9487E60424S00-1')}),/extracto oficial MTT no está contrastado/);
const arg=process.argv.find(x=>x.startsWith('--json='));
if(arg){const dest=path.resolve(arg.slice('--json='.length));fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,JSON.stringify(report,null,2)+'\n');}
console.log('CONTROL DOCUMENTAL 3CV: '+JSON.stringify({
 codesLocated:report.septemberCodesFound,commercialVersions:report.preliminaryCommercialVersions,
 shared:report.duplicateCommercialVersions,conflicts:report.conflictVersions,
 sourceDate:report.septemberSourceDate,sourceSha256:report.septemberSourceSha256,
 sourceInspected:report.septemberRegistryCrossChecked,verifiedSkuCodes:report.manualSkuCodeVerifications
}));
if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,
 '## Nómina MTT 28/09/2026 — cotejo real sobre archivo XLS adjunto\n'+
 '- 14/14 códigos candidatos encontrados (22 versiones comerciales), 2 versiones Tera MT mantienen contradicción A vs M.\n'+
 '- Fuente con trazabilidad SHA256 '+nomina.sourceFileSha256+'; 15 filas extraídas (14 códigos + Tera).\n'+
 '- **Identidades de versión comercial ↔ código homologado certificadas: 0.**\n');
