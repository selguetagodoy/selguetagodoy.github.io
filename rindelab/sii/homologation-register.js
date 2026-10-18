/* Auditoría de homologaciones 3CV: sin confundir candidatura con certificado. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.RindelabHomologations=api;
})(typeof globalThis!=='undefined'?globalThis:null,function(){
 'use strict';
 const N=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z0-9-]+/g,' ').trim();
 const isHttps=value=>{try{return new URL(value).protocol==='https:';}catch{return false;}};
 function review(audit,ledger,notes){
  if(!audit||audit.schemaVersion!==1||!Array.isArray(audit.cases))throw Error('Cotejo por versión inexistente');
  if(!ledger||ledger.schemaVersion!==1||!Array.isArray(ledger.sources)||!Array.isArray(ledger.codeChecks)||!Array.isArray(ledger.manualValidations))throw Error('Registro de certificaciones inválido');
  if(!notes||notes.schemaVersion!==1||!Array.isArray(notes.cases))throw Error('Notas de contradicciones inexistentes');
  const mtt=ledger.sources.find(s=>s.id==='mtt-homologados-20260928');
  const energy=ledger.sources.find(s=>s.id==='energy-3cv-20260508');
  if(!mtt||mtt.date!=='2026-09-28'||!isHttps(mtt.url)||!isHttps(mtt.landingPage))throw Error('Nómina 3CV MTT sin origen oficial trazable');
  if(!energy||energy.date!==audit.sourceCut||!isHttps(energy.url))throw Error('Fuente 3CV de rendimiento sin correspondencia de corte');
  // El archivo MTT aún no fue descargado/parseado: registrar expresamente la ausencia de cotejo.
  // No se aceptan validaciones por defecto ni declaraciones manuales sin evidencia.
  if(ledger.manualValidations.length)throw Error('Validaciones manuales no implementadas: no atribuir homologaciones hasta auditar documento fuente y evidencia comercial');
  if(ledger.codeChecks.length)throw Error('Importación de nómina sin validador oficial: no publicar supuestas coincidencias');
  if(mtt.inspected!==false)throw Error('La nómina de septiembre no se ha inspeccionado; no atribuirlo como verificado');
  const candidates=new Map();
  for(const c of audit.cases){
   if(c.status!=='un_candidato_preliminar')continue;
   if(!c.singleCandidateCode)throw Error('Candidato sin código 3CV');
   const sample=c.examples.find(x=>x.code3cv===c.singleCandidateCode);
   if(!sample)throw Error('No se encontró la evidencia del código '+c.singleCandidateCode);
   const code=c.singleCandidateCode;
   if(!candidates.has(code))candidates.set(code,{
    code,brand:c.brand,homologationModel:sample.model,homologationDate:sample.date,
    threeCvTechnology:sample.technology,threeCvEngine:sample.engine,
    threeCvTransmission:sample.transmission,threeCvDrive:sample.drive,
    commercialVersions:[],status:'pendiente_documento_3cv',
    septemberRegistryCrossChecked:false,verifiedSkuMatch:false,
    manualCertificateUrl:null
   });
   const group=candidates.get(code);
   if(N(group.brand)!==N(c.brand))throw Error('Código 3CV candidato compartido entre marcas');
   group.commercialVersions.push({
    brand:c.brand,family:c.family,version:c.version,source:c.source,
    officialManufacturerSpecsUrl:c.manufacturerEvidence?.url||null,
    checkedManufacturer:c.manufacturerEvidence!==null
   });
  }
  const cases=[...candidates.values()].sort((a,b)=>a.brand.localeCompare(b.brand,'es')||a.homologationModel.localeCompare(b.homologationModel,'es')||a.code.localeCompare(b.code));
  const conflicts=notes.cases.map(c=>({
   brand:c.brand,family:c.family,version:c.version,code:c.candidateCode3cv,
   model3cv:c.model3cv,commercialTransmission:c.commercialTransmission,
   registeredTransmission:c.source3cvTransmission,manufacturerEvidenceUrl:c.manufacturerEvidenceUrl,
   status:'contradiccion_3cv_no_resuelta'
  }));
  if(cases.length!==audit.singleCandidateUniqueCodes)throw Error('Número de códigos preliminares inconsistente');
  if(cases.reduce((n,c)=>n+c.commercialVersions.length,0)!==audit.counts.un_candidato_preliminar)throw Error('Faltan versiones comerciales');
  if(conflicts.some(c=>cases.some(x=>x.code===c.code)))throw Error('Contradicción promovida a candidato aprobado');
  return {
   schemaVersion:1,commercialSourcesCut:audit.sourceCut,
   septemberSourceDate:mtt.date,
   septemberRegistryUrl:mtt.url,
   septemberRegistryLandingPage:mtt.landingPage,
   septemberRegistryCrossChecked:false,
   independentHomologationDocumentObtained:false,
   manualSkuCodeVerifications:0,
   preliminaryCodes:cases.length,preliminaryCommercialVersions:audit.counts.un_candidato_preliminar,
   duplicateCommercialVersions:cases.filter(x=>x.commercialVersions.length>1).reduce((sum,x)=>sum+x.commercialVersions.length,0),
   conflictVersions:conflicts.length,conflicts,cases
  };
 }
 return {review};
});