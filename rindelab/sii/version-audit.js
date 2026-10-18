/* Cotejo exploratorio RINDELAB — no certifica equivalencia de versiones ni precios. */
(function(root,factory){
 const api=factory(root&&root.RindelabCoverage);
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.RindelabVersionAudit=api;
})(typeof globalThis==='undefined'?null:globalThis,function(coverage){
 'use strict';
 if(!coverage||typeof coverage.matches!=='function')throw Error('Falta el clasificador nominal 3CV');
 const N=coverage.normalized;
 const fields=[
  ['technology','tecnología'],['engine','cilindrada'],['transmission','transmisión'],
  ['drive','tracción'],['generation','código de generación'],['fuel','combustible']
 ];
 function specsFor(price,evidence){
  const v=N(price.version), result={};
  const engine=String(price.version).toUpperCase().replace(/,/g,'.').match(/(?:^|[^0-9A-Z])([0-9][.][0-9])(?:L|T|I)?(?=[^0-9A-Z]|$)/);
  if(engine)result.engine=Number(engine[1].replace(',','.'));
  if(/\b(?:REEV|EREV)\b/.test(v))result.technology='REEV';
  else if(/\bPHEV\b/.test(v))result.technology='PHEV';
  else if(/\bMHEV\b/.test(v))result.technology='MHEV';
  else if(/\b(?:FHEV|HEV|HIBRIDA|HIBRIDO|HYBRID)\b/.test(v))result.technology='HEV';
  else if(/\b(?:BEV|EV|ELECTRICO|ELECTRICA)\b/.test(v))result.technology='EV';
  // AT incluye CVT/DCT/AMT en la nomenclatura agregada 3CV.
  if(/\b(?:[0-9]*(?:AMT|DCT|CVT|AT)|AUTOMATICA|AUTOMATICO)\b/.test(v))result.transmission='A';
  else if(/\b(?:[0-9]*MT|MANUAL)\b/.test(v))result.transmission='M';
  if(/\b(?:AWD|4WD|4X4)\b/.test(v))result.drive='4x4';
  else if(/\b(?:FWD|RWD|2WD|4X2)\b/.test(v))result.drive='4x2';
  if(/\bDIESEL\b/.test(v))result.fuel='DIESEL';
  const generation=v.match(/\b(SU2ID|SU2I|NX4C|NX4|LX3|SX2|QU2I|AX1)\b/);
  if(generation)result.generation=generation[1];
  if(evidence){
   if(evidence.brand!==price.brand||evidence.family!==price.family||evidence.version!==price.version)throw Error('Evidencia asignada a una versión distinta');
   for(const [key,value] of Object.entries(evidence.specifications)){
    if(!fields.some(([name])=>name===key))throw Error('Atributo no cotejable: '+key);
    if(result[key]!==undefined&&N(result[key])!==N(value))throw Error('Contradicción en nombre comercial y fabricante: '+price.brand+' '+price.family+' '+price.version+' · '+key);
    result[key]=value;
   }
  }
  return result;
 }
 function forRow(row){
  const model=N(row[1]);
  const generation=model.match(/\b(SU2ID|SU2I|NX4C|NX4|LX3|SX2|QU2I|AX1)\b/);
  const engine=Number(String(row[7]??'').replace(',','.'));
  return {
   technology:N(row[2]),
   engine:Number.isFinite(engine)&&engine>0?engine:null,
   transmission:N(row[6]),
   drive:N(row[5]).replace(/^4X2$/,'4x2').replace(/^4X4$/,'4x4').toUpperCase(),
   generation:generation?generation[1]:null,
   fuel:N(row[3])
  };
 }
 function compare(specs,row){
  const source=forRow(row),agrees=[],conflicts=[],notStated=[];
  for(const [key,label] of fields){
   if(specs[key]===undefined)continue;
   let found=source[key];
   if(found===null||found===undefined||found===''){notStated.push(label);continue;}
   let ok;
   if(key==='engine')ok=Math.abs(specs[key]-found)<=0.02;
   else ok=N(specs[key])===N(found);
   // Un código comercial de generación solo se considera presente si aparece literalmente en la ficha 3CV.
   // Si el 3CV carece de ese código, no se trata como contradicción.
   if(ok)agrees.push(label);
   else conflicts.push({field:key,label,expected:String(specs[key]),observed:String(found)});
  }
  return {agrees,conflicts,notStated};
 }
 const preview=row=>({
  model:row[1],code3cv:row[9],date:row[8],technology:row[2],
  engine:row[7],transmission:row[6],drive:row[5],fuel:row[3]
 });
 function audit(prices,rows,published,manufacturer){
  if(!Array.isArray(prices)||!Array.isArray(rows)||!published)throw Error('Fuentes de cotejo técnico incompletas');
  const active=rows.filter(r=>Array.isArray(r)&&r[0]&&r[1]&&r[8]&&r[8]<=published);
  const byBrand=new Map();
  for(const row of active){
   const b=N(row[0]);if(!byBrand.has(b))byBrand.set(b,[]);
   byBrand.get(b).push(row);
  }
  const evidenceMap=new Map();
  if(manufacturer){
   if(manufacturer.schemaVersion!==1||!Array.isArray(manufacturer.entries))throw Error('Fuentes de fabricante inválidas');
   const keyFor=p=>[p.brand,p.family,p.version].join('|');
   const commercialKeys=new Set(prices.map(keyFor));
   for(const entry of manufacturer.entries){
    const key=keyFor(entry);
    if(evidenceMap.has(key)||!commercialKeys.has(key))throw Error('Evidencia duplicada o versión no encontrada: '+key);
    if(!entry.sourceUrl||!entry.sourceUrl.startsWith('https://')||!entry.asOf||!entry.observation||!entry.specifications||!Object.keys(entry.specifications).length)throw Error('Evidencia incompleta: '+key);
    evidenceMap.set(key,entry);
   }
  }
  const cases=prices.map((p,index)=>{
   const evidence=evidenceMap.get([p.brand,p.family,p.version].join('|'))||null;
   const spec=specsFor(p,evidence);
   const candidates=(byBrand.get(N(p.brand))||[]).filter(r=>coverage.matches(p.brand,p.family,r));
   const consistent=[],contradicted=[];
   for(const c of candidates){
    const compared=compare(spec,c);
    const outcome={...preview(c),...compared};
    if(compared.conflicts.length)contradicted.push(outcome);
    else consistent.push(outcome);
   }
   consistent.sort((a,b)=>b.agrees.length-a.agrees.length||b.date.localeCompare(a.date)||a.model.localeCompare(b.model));
   contradicted.sort((a,b)=>a.conflicts.length-b.conflicts.length||b.date.localeCompare(a.date));
   const documented=Object.keys(spec).length;
   // Exigir al menos dos rasgos expresos y consistentes para un candidato preseleccionable,
   // sin declarar por ello equivalencia técnica verificada.
   const reviewable=consistent.filter(c=>c.agrees.length>=2);
   let status='informacion_insuficiente';
   if(!candidates.length)status='sin_familia_3cv';
   else if(consistent.length===0&&documented>=1)status='solo_contradicciones';
   else if(reviewable.length===1)status='un_candidato_preliminar';
   else if(reviewable.length>1)status='varios_candidatos_preliminares';
   return {
    id:index+1,brand:p.brand,family:p.family,version:p.version,
    modelYear:p.modelYear,priceListClp:p.priceListClp,source:p.source,checkedAt:p.checkedAt,
    expressedSpecifications:spec,expressedCount:documented,
    manufacturerEvidence:evidence?{url:evidence.sourceUrl,asOf:evidence.asOf,observation:evidence.observation,specifications:evidence.specifications}:null,
    familyCandidates:candidates.length,consistentCandidates:consistent.length,
    conflictingCandidates:contradicted.length,reviewableCandidates:reviewable.length,status,
    // La lista truncada es solo visual; los conteos provienen del universo completo.
    examples:consistent.slice(0,6),
    conflictsExamples:contradicted.slice(0,4)
   };
  });
  // La preselección es una ficha técnica, no un SKU. Diversos niveles de equipamiento
  // pueden remitir al mismo código de homologación. Hacer visible esa reutilización.
  const codeUsers=new Map();
  for(const item of cases){
   if(item.status!=='un_candidato_preliminar')continue;
   const candidate=item.examples.find(e=>e.agrees.length>=2);
   if(!candidate||!candidate.code3cv)throw Error('Candidato individual sin código 3CV documentado');
   item.singleCandidateCode=candidate.code3cv;
   if(!codeUsers.has(candidate.code3cv))codeUsers.set(candidate.code3cv,[]);
   codeUsers.get(candidate.code3cv).push(item.id);
  }
  for(const item of cases){
   if(!item.singleCandidateCode){item.sharedPreliminaryCandidate=false;item.sharedWithOtherVersions=0;continue;}
   const userIds=codeUsers.get(item.singleCandidateCode);
   item.sharedWithOtherVersions=userIds.length-1;
   item.sharedPreliminaryCandidate=userIds.length>1;
  }
  const statuses={};
  for(const item of cases)statuses[item.status]=(statuses[item.status]||0)+1;
  return {schemaVersion:1,sourceCut:published,threeCvRecords:active.length,
   catalogCount:prices.length,certifiedTechnicalMatches:0,certificationPerformed:false,
   scope:'Filtro exploratorio de rasgos declarados en nombres de versiones y columnas 3CV. No verifica identidad comercial, generación ni disponibilidad.',
   singleCandidateUniqueCodes:codeUsers.size,
   sharedCandidateVersions:cases.filter(x=>x.sharedPreliminaryCandidate).length,
   sourceReviewedVersions:cases.filter(x=>x.manufacturerEvidence!==null).length,
   manufacturerCertifiedMatches:0,
   counts:statuses,cases};
 }
 return {specsFor,compare,audit};
});
