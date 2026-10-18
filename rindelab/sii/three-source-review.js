/* Tres fuentes oficiales por código: MTT septiembre, rendimientos mayo y API octubre.
 * Concordancia con otra fuente NO es rectificación oficial. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.RindelabThreeSourceReview=api;
})(typeof globalThis!=='undefined'?globalThis:null,function(){
 'use strict';
 const same=(a,b)=>String(a??'').trim()===String(b??'').trim();
 function compare(review,snapshot){
  if(review?.schemaVersion!==1||!Array.isArray(review.cases)||review.cases.length!==12)throw Error('Expediente mayo-septiembre no válido');
  if(snapshot?.schemaVersion!==1||snapshot.checkedDate!=='2026-10-18'||snapshot.sourceTotalCount!==8315||
    snapshot.sourceRows!==8315||!Array.isArray(snapshot.records)||snapshot.records.length!==12||
    !/^https:\/\/api-consumovehicular\.minenergia\.cl\/vehiculos\/listar/.test(snapshot.source)||
    !/^[a-f0-9]{64}$/.test(snapshot.sourceRawSha256))throw Error('Captura API oficial inválida');
  const unique=new Map();
  for(const item of snapshot.records){
   if(!item.code||unique.has(item.code)||!Array.isArray(item.api)||item.api.length!==1||item.apiRecords!==1)throw Error('Código API duplicado, ausente o ambiguo');
   unique.set(item.code,item);
  }
  const out=[],totals={may:0,mtt:0,neither:0};
  for(const c of review.cases){
   const d=unique.get(c.code3cv);
   if(!d||!same(d.model,c.officialModel)||!same(d.kind,c.kind)||!same(d.mtt.transmission,c.mtt.transmission)||
       !same(d.may.transmission,c.may.transmission)||Number(d.mtt.engineL)!==Number(c.mtt.engineL)||
       Number(d.may.engineL)!==Number(c.may.engineL)||d.mtt.excelRow!==c.mtt.excelRow||
       c.certifiedResolved!==false||c.official3cvRectification!==null)throw Error('La API no corresponde al código o al expediente: '+c.code3cv);
   const x=d.api[0];
   if(!x||typeof x.id!=='number'||!x.model||!x.date||x.date>snapshot.checkedDate||
      !['A','M'].includes(x.transmission)||!Number.isFinite(Number(x.engineL))||
      !x.modified||x.modified.slice(0,10)>snapshot.checkedDate)throw Error('Registro API no verificable '+c.code3cv);
   const apiValue=c.kind==='engine'?Number(x.engineL):x.transmission;
   const mttValue=c.kind==='engine'?Number(c.mtt.value):c.mtt.value;
   const mayValue=c.kind==='engine'?Number(c.may.value):c.may.value;
   // En una discrepancia verdadera, API no puede coincidir con ambos valores.
   if(same(mttValue,mayValue))throw Error('La discrepancia de origen se perdió');
   const match= same(apiValue,mayValue)?'may':same(apiValue,mttValue)?'mtt':'neither';
   totals[match]++;
   out.push({
    ...c,
    octoberApi:{url:snapshot.source,checkDate:snapshot.checkedDate,code3cv:c.code3cv,
      recordId:x.id,model:x.model,date:x.date,modified:x.modified,transmission:x.transmission,
      engineL:Number(x.engineL),value:apiValue,alignedWith:match},
    certifiedResolved:false,official3cvRectification:null
   });
  }
  if(unique.size!==out.length||totals.may+totals.mtt+totals.neither!==12)throw Error('Expediente incompleto');
  return {schemaVersion:1,snapshotDate:snapshot.checkedDate,source:snapshot.source,sha256:snapshot.sourceRawSha256,
   sourceTotalCount:snapshot.sourceTotalCount,counts:{...totals,found:out.length,rectifications:0},cases:out};
 }
 return {compare};
});