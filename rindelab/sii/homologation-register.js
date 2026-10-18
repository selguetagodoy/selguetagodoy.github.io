/* Registro documental RINDELAB. Presencia oficial de códigos != vinculación certificada a SKU. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.RindelabHomologations=api;
})(typeof globalThis!=='undefined'?globalThis:null,function(){
 'use strict';
 const N=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z0-9-]+/g,' ').trim();
 const isHttps=value=>{try{return new URL(value).protocol==='https:';}catch{return false;}};
 function review(audit,ledger,notes,nomina){
  if(!audit||audit.schemaVersion!==1||!Array.isArray(audit.cases))throw Error('Cotejo por versión inexistente');
  if(!ledger||ledger.schemaVersion!==1||!Array.isArray(ledger.sources)||!Array.isArray(ledger.codeChecks)||!Array.isArray(ledger.manualValidations))throw Error('Registro de certificaciones inválido');
  if(!notes||notes.schemaVersion!==1||!Array.isArray(notes.cases))throw Error('Notas de contradicciones inexistentes');
  if(!nomina||nomina.schemaVersion!==1||!Array.isArray(nomina.records)||nomina.officialCut!=='2026-09-28')throw Error('Extracto MTT no validado');
  const mtt=ledger.sources.find(s=>s.id==='mtt-homologados-20260928');
  const energy=ledger.sources.find(s=>s.id==='energy-3cv-20260508');
  if(!mtt||mtt.date!==nomina.officialCut||!isHttps(mtt.url)||!isHttps(mtt.landingPage))throw Error('Nómina 3CV MTT sin origen oficial trazable');
  if(!energy||energy.date!==audit.sourceCut||!isHttps(energy.url))throw Error('Fuente 3CV de rendimiento sin correspondencia de corte');
  if(ledger.manualValidations.length)throw Error('Validaciones manuales no implementadas: falta documento que vincule SKU y código de homologación');
  if(ledger.codeChecks.length)throw Error('Registro duplicado de comprobaciones MTT: usar extracto XLS trazable');
  const inspected=mtt.inspected===true;
  if(!inspected||mtt.sourceSha256!==nomina.sourceFileSha256||mtt.verifiedRows!==nomina.records.length)throw Error('El extracto oficial MTT no está contrastado con archivo y hash de origen');
  if(!/^[a-f0-9]{64}$/.test(nomina.sourceFileSha256)||!nomina.sourceSheet.includes('2013 - 2026')||nomina.records.length!==15)throw Error('Extracto MTT sin procedencia suficiente');
  const records=new Map();
  for(const r of nomina.records){
   if(!r.code||!r.brand||!r.model||!r.certificate||!r.date||!Number.isInteger(r.excelRow)||r.excelRow<5||!['A','M'].includes(r.transmission)||!Number.isFinite(r.engineL))throw Error('Fila de nómina MTT incompleta: '+r.code);
   if(records.has(r.code))throw Error('Código duplicado en el extracto MTT: '+r.code);
   if(r.date>nomina.officialCut)throw Error('Fecha de homologación posterior al corte oficial: '+r.code);
   records.set(r.code,r);
  }
  // Alcance: el extracto XLS congelado contiene únicamente 14 códigos candidatos y un Tera en conflicto.
  // Nuevas versiones comerciales pueden introducir candidatos adicionales que requieren otro cotejo,
  // sin volver incompleto el expediente original ni declarar ausentes esos códigos del MTT completo.
  const candidates=new Map(),outsideExtract=new Map();
  for(const c of audit.cases){
   if(c.status!=='un_candidato_preliminar')continue;
   if(!c.singleCandidateCode)throw Error('Candidato sin código 3CV');
   const sample=c.examples.find(x=>x.code3cv===c.singleCandidateCode);
   if(!sample)throw Error('No se encontró la evidencia original de '+c.singleCandidateCode);
   const code=c.singleCandidateCode;
   const record=records.get(code);
   if(!record){
    if(!outsideExtract.has(code))outsideExtract.set(code,{code,brand:c.brand,commercialVersions:[]});
    outsideExtract.get(code).commercialVersions.push({brand:c.brand,family:c.family,version:c.version});
    continue;
   }
   if(!candidates.has(code)){
    if(N(record.brand)!==N(c.brand))throw Error('Discrepancia de marca con nómina MTT para '+code);
    if(record.date!==sample.date)throw Error('Fecha de homologación cambió entre fuentes para '+code);
    if(record.transmission!==sample.transmission)throw Error('Discrepancia de transmisión entre fuentes 3CV para '+code);
    if(Math.abs(Number(record.engineL)-Number(sample.engine))>0.02)throw Error('Discrepancia de cilindrada entre fuentes 3CV para '+code);
    candidates.set(code,{
     code,brand:c.brand,homologationModel:sample.model,homologationDate:sample.date,
     threeCvTechnology:sample.technology,threeCvEngine:sample.engine,
     threeCvTransmission:sample.transmission,threeCvDrive:sample.drive,
     septemberCertificate:record.certificate,septemberModel:record.model,
     septemberDate:record.date,septemberTransmission:record.transmission,
     septemberTechnology:record.technology,septemberFuel:record.fuel,
     septemberSheet:nomina.sourceSheet,septemberExcelRow:record.excelRow,
     commercialVersions:[],status:'codigo_presente_en_nomina_no_validado_para_version',
     septemberRegistryCrossChecked:true,verifiedSkuMatch:false,manualCertificateUrl:null,
     technologyTaxonomyNote: N(sample.technology)==='MHEV'&&N(record.technology)==='COMBUSTION INTERNA'?'El registro de rendimiento clasifica MHEV; la nómina MTT consigna Combustión Interna. Se conservan ambas categorías sin inferir equivalencia tecnológica.':null
    });
   }
   const group=candidates.get(code);
   if(N(group.brand)!==N(c.brand))throw Error('Código 3CV candidato compartido entre marcas');
   group.commercialVersions.push({
    brand:c.brand,family:c.family,version:c.version,source:c.source,
    officialManufacturerSpecsUrl:c.manufacturerEvidence?.url||null,
    checkedManufacturer:c.manufacturerEvidence!==null
   });
  }
  const cases=[...candidates.values()].sort((a,b)=>a.brand.localeCompare(b.brand,'es')||a.homologationModel.localeCompare(b.homologationModel,'es')||a.code.localeCompare(b.code));
  const conflicts=notes.cases.map(c=>{
   const r=records.get(c.candidateCode3cv);
   if(!r||r.transmission!=='A'||r.model.toUpperCase().indexOf('TERA 1.6 MT')<0||N(r.brand)!=='VOLKSWAGEN')throw Error('La discrepancia Tera no fue confirmada en nómina MTT');
   return {
    brand:c.brand,family:c.family,version:c.version,code:c.candidateCode3cv,model3cv:c.model3cv,
    commercialTransmission:c.commercialTransmission,registeredTransmission:c.source3cvTransmission,
    septemberRegisteredTransmission:r.transmission,septemberCertificate:r.certificate,
    septemberExcelRow:r.excelRow,septemberModel:r.model,manufacturerEvidenceUrl:c.manufacturerEvidenceUrl,
    status:'contradiccion_3cv_ratificada_por_nomina_septiembre'
   };
  });
  if(cases.length!==mtt.candidateCodesFound||cases.length!==mtt.candidateCodesChecked||cases.length+outsideExtract.size!==audit.singleCandidateUniqueCodes)throw Error('Total de códigos de la nómina MTT inconsistente');
  const versionsInside=cases.reduce((n,c)=>n+c.commercialVersions.length,0);
  const versionsOutside=[...outsideExtract.values()].reduce((n,c)=>n+c.commercialVersions.length,0);
  if(versionsInside+versionsOutside!==audit.counts.un_candidato_preliminar)throw Error('Faltan versiones comerciales');
  if(conflicts.some(c=>cases.some(x=>x.code===c.code)))throw Error('Contradicción promovida a candidato validado');
  if(records.size!==cases.length+new Set(conflicts.map(c=>c.code)).size)throw Error('El extracto MTT contiene códigos ajenos al universo auditado');
  return {
   schemaVersion:2,commercialSourcesCut:audit.sourceCut,septemberSourceDate:mtt.date,
   septemberRegistryUrl:mtt.url,septemberRegistryLandingPage:mtt.landingPage,
   septemberSourceSha256:nomina.sourceFileSha256,septemberRegistryCrossChecked:true,
   septemberCodesFound:cases.length,septemberCodesNotFound:0,
   independentHomologationDocumentObtained:false,manualSkuCodeVerifications:0,
   preliminaryCodes:cases.length,preliminaryCommercialVersions:versionsInside,
   preliminaryCodesOutsideExtract:[...outsideExtract.values()],preliminaryCommercialVersionsOutsideExtract:versionsOutside,
   duplicateCommercialVersions:cases.filter(x=>x.commercialVersions.length>1).reduce((sum,x)=>sum+x.commercialVersions.length,0),
   conflictVersions:conflicts.length,conflicts,cases
  };
 }
 return {review};
});