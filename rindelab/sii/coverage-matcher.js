/* RINDELAB: coincidencia NOMINAL de familia; no verifica versiones comerciales ni equivalencia técnica. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.RindelabCoverage=api;
})(typeof globalThis!=='undefined'?globalThis:null,function(){
 'use strict';
 const normalized=value=>String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z0-9]+/g,' ').replace(/\s+/g,' ').trim();
 const special={
  'Toyota|Corolla Cross':/^COROLLA CROSS(?= |$)/,
  'Toyota|Corolla Sedán':/^COROLLA (?:SD|SEDAN)(?= |$)/,
  'Toyota|Yaris':/^YARIS(?! CROSS)(?= |$)/,
  'Hyundai|Creta':/^CRETA(?! GRAND)(?= |$)/,
  'Hyundai|Creta Grand':/^CRETA GRAND(?= |$)/,
  'Changan|CS35 Max':/^CS ?35 MAX(?= |$)/,
  'Changan|CS55 Plus':/^CS ?55 PLUS(?= |$)/,
  'Changan|Hunter':/^HUNTER(?! (?:E(?: |$)|EREV(?: |$)|REEV(?: |$)))(?= |$)/,
  'MG|MG3':/^MG ?3(?= |$)/,
  'MG|ZS':/^(?:MG ?)?ZS(?= |$)/,
  'MG|S5':/^(?:MG ?)?S5(?= |$)/,
  'Mazda|CX-3':/^CX ?3(?= |$)/,
  'Mazda|CX-5':/^CX ?5(?= |$)/,
  'Mazda|CX-30':/^CX ?30(?= |$)/,
  'Volkswagen|ID.4':/^ID ?4(?= |$)/
 };
 const exactPrefix=family=>new RegExp('^'+normalized(family)+'(?= |$)');
 function cleanModel(brand,name){
  let model=normalized(name),prefix=normalized(brand)+' ';
  for(let i=0;i<5;i++){
   const old=model;
   if(model.startsWith(prefix))model=model.slice(prefix.length);
   model=model.replace(/^(?:(?:THE |ALL )?NEW |NUEVO |NUEVA )/,'');
   if(old===model)break;
  }
  return model;
 }
 function matches(brand,family,row){
  if(!Array.isArray(row)||normalized(row[0])!==normalized(brand)||!row[1])return false;
  const rule=special[brand+'|'+family]||exactPrefix(family);
  return rule.test(cleanModel(brand,row[1]));
 }
 function analyze(prices,rows,published){
  if(!Array.isArray(prices)||!Array.isArray(rows)||!published)throw Error('Fuentes de cobertura no disponibles');
  const active=rows.filter(x=>Array.isArray(x)&&x[0]&&x[1]&&x[8]&&x[8]<=published);
  const groups=new Map();
  for(const p of prices){
   if(!p.brand||!p.family||!p.version)throw Error('Registro comercial sin identificación');
   const key=p.brand+'|'+p.family;
   if(!groups.has(key))groups.set(key,{brand:p.brand,family:p.family,commercialVersions:0,sourceUrls:new Set()});
   const g=groups.get(key);
   g.commercialVersions++;g.sourceUrls.add(p.source);
  }
  const table=[];
  for(const g of groups.values()){
   const candidates=active.filter(row=>matches(g.brand,g.family,row));
   const models=[...new Set(candidates.map(x=>x[1]))];
   const lastDate=candidates.map(x=>x[8]).sort().at(-1)||null;
   table.push({brand:g.brand,family:g.family,commercialVersions:g.commercialVersions,
    candidateRecords:candidates.length,examples:models.slice(0,3),latestHomologation:lastDate,
    sourceUrls:[...g.sourceUrls],status:candidates.length?'coincidencia_nominal':'sin_coincidencia_nominal'});
  }
  table.sort((a,b)=>a.brand.localeCompare(b.brand,'es')||a.family.localeCompare(b.family,'es'));
  const withCandidates=table.filter(x=>x.candidateRecords>0);
  return {
   methodology:'Coincidencia nominal de marca y familia, no equivalencia técnica ni disponibilidad de venta.',
   commercialPrices:prices.length,commercialFamilies:table.length,
   threeCvRecords:active.length,published,
   matchedFamilies:withCandidates.length,unmatchedFamilies:table.length-withCandidates.length,
   pricesInMatchedFamilies:withCandidates.reduce((sum,x)=>sum+x.commercialVersions,0),
   technicallyValidatedVersions:null,
   rows:table
  };
 }
 return {normalized,cleanModel,matches,analyze};
});
