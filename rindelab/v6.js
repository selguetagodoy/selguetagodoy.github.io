/* RINDELAB 7 — búsqueda verificable, comparador y escenarios energéticos editables */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const F={BRAND:0,MODEL:1,TECH:2,FUEL:3,BODY:4,DRIVE:5,TRANS:6,ENGINE:7,DATE:8,CODE:9,CLASS:10,CYCLE:11,KM:12,EL:13,PH:14,BAT:15,AC:16,DC:17,CO2:18,NORM:19};
const aliases={'M. Benz':'Mercedes-Benz','Ram':'RAM','LEAPMOTOR':'Leapmotor','Faw':'FAW','Lynk Co':'Lynk & Co','ZX Auto':'Zxauto','Ssangyong':'KGM','Haval':'Great Wall','DFM':'Dongfeng','Mitsubishi Fuso':'Fuso','Exeed Born For More':'Exeed'};
const money=n=>n===null||!Number.isFinite(n)?'Sin dato comparable':'$'+Math.round(n).toLocaleString('es-CL');
const fmt=n=>Number(n).toLocaleString('es-CL');
const techHuman={EV:'Eléctrico',HEV:'Híbrido',MHEV:'Híbrido suave',PHEV:'Híbrido enchufable',REEV:'Eléctrico con extensor',Bencina:'Bencina',Diésel:'Diésel'};
function updateScenarioSummary(){
 const km=Number($('annualKm').value)||15000;
 const mode=$('chargeScenario').value,place=mode==='home'?'carga en casa':mode==='mixed'?'carga mixta (80/20 editable)':mode==='manual'?'tarifa manual':'carga pública';
 $('scenarioSummaryText').textContent='Calculado para '+fmt(km)+' km al año · '+place+' · precios editables';
}
const safe=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();
const number=n=>n!==null&&n!==''&&Number.isFinite(Number(n))&&Number(n)>0?Number(n):null;
const fixed=n=>number(n)?Number(n).toLocaleString('es-CL',{maximumFractionDigits:2}):'N/D';
let all=[],results=[],selected=[],submitted=false,limit=10,cut='2026-05-08';
let discontinuedModels=[];
function archivedModel(row){
 const brand=normalize(row[F.BRAND]),name=normalize(row[F.MODEL]);
 return discontinuedModels.find(item=>{
  if(normalize(item.brand)!==brand)return false;
  const target=normalize(item.familyPrefix||item.model);
  const sameFamily=name===target||name.startsWith(target+' ');
  if(item.match==='whole-family')return sameFamily;
  if(item.match==='model-prefix-exclusions')return sameFamily&&!(item.excludePrefixes||[]).some(x=>{const k=normalize(x);return name===k||name.startsWith(k+' ');});
  if(item.match==='model-prefix-list')return (item.modelPrefixes||[]).some(x=>{const k=normalize(x);return name===k||name.startsWith(k+' ');});
  if(item.match==='model-prefix-list-cutoff')return String(row[F.DATE]||'')<=item.homologationCutoff&&(item.modelPrefixes||[]).some(x=>{const k=normalize(x);return name===k||name.startsWith(k+' ');});
  if(item.match==='body-style-hatchback')return sameFamily&&(/hatchback| hb /.test(' '+name+' '));
  if(item.match==='previous-generation-cutoff')return sameFamily&&String(row[F.DATE]||'')<=item.homologationCutoff;
  // Solo Jimny 5P, sin confundir Jimny 3P; se exige mención inequívoca de puertas.
  return item.match==='variant-only-manual'&&brand==='suzuki'&&name.startsWith('jimny ')&&/\b(5p|5d|5 puertas)\b/.test(name);
 })||null;
}
let costSortCycleNotice='';
// Fichas 3CV nuevas sin precio equivalente NO son vehículos descontinuados.
const RECENT_DAYS=365;
const recentCutoff=()=>{
 const d=new Date(),utc=Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate());
 return new Date(utc-RECENT_DAYS*86400000).toISOString().slice(0,10);
};
function validCurrentPrice(row){
 const price=window.RindelabCommercial?.minimum(row,family(row));
 return Boolean(price&&!price.campaignExpired&&price.priceListClp>0&&
  window.RindelabIdentity?.techKnown(price)===row[F.TECH]);
}
function recentNoPrice(row){
 return Boolean(!archivedModel(row)&&/^20\d\d-\d\d-\d\d$/.test(row[F.DATE]||'')&&
  row[F.DATE]>=recentCutoff()&&!validCurrentPrice(row));
}
// Evidencia editorial por modelo 3CV exacto. No implica coincidencia automática
// de versión, precio, stock o fecha comercial.
let marketEvidence=new Map();
let priceAssociationAudit=new Map();
let marketPriceFollowup=new Map();
let marketPriceThirdpass=new Map();
let marketPriceFinal=new Map();
let marketPriceFifthpass=new Map();
function fifthPriceFor(row){
 const k=normalize(row[F.BRAND]+' '+row[F.MODEL])+'|'+row[F.DATE]+'|'+String(row[F.CODE]||'').slice(-9).toUpperCase();
 return marketPriceFifthpass.get(k)||null;
}
function finalPriceFor(row){
 const k=normalize(row[F.BRAND]+' '+row[F.MODEL])+'|'+row[F.DATE]+'|'+String(row[F.CODE]||'').slice(-9).toUpperCase();
 return marketPriceFinal.get(k)||null;
}
function thirdPriceFor(row){
 const k=normalize(row[F.BRAND]+' '+row[F.MODEL])+'|'+row[F.DATE]+'|'+String(row[F.CODE]||'').slice(-9).toUpperCase();
 return marketPriceThirdpass.get(k)||null;
}
function marketFollowupFor(row){
 const k=normalize(row[F.BRAND]+' '+row[F.MODEL])+'|'+row[F.DATE]+'|'+String(row[F.CODE]||'').slice(-9).toUpperCase();
 return marketPriceFollowup.get(k)||null;
}
function hasFamilyPriceEvidence(row){
 const a=auditedPriceFor(row),e=marketFollowupFor(row);
 return a?.category==='family-price-undocumented-tech'||
  (a?.category==='unmatched-catalog'&&(e?.reference?.samePowertrain===true||
    e?.dealers?.some(d=>Number.isInteger(d.listPriceClp)&&d.listPriceClp>0)))||Boolean(thirdPriceFor(row))||Boolean(finalPriceFor(row))||Boolean(fifthPriceFor(row));
}
function auditedPriceFor(row){
 const key=normalize(row[F.BRAND]+' '+row[F.MODEL])+'|'+row[F.DATE]+'|'+String(row[F.CODE]||'').slice(-9).toUpperCase();
 return priceAssociationAudit.get(key)||null;
}
function marketEvidenceFor(row){
 const item=marketEvidence.get(normalize(row[F.BRAND]+' '+row[F.MODEL]))||null;
 if(!item)return null;
 // Una misma denominación puede existir en años y ciclos 3CV diferentes.
 // La referencia comercial se asocia solo a la homologación documentada.
 if(item.homologationDate)return item.homologationDate===row[F.DATE]?item:null;
 return row[F.DATE]>=recentCutoff()?item:null;
}
const reviewedEnergyCodes=new Set(['BM9746EL1224S00-3']); // 10,6 km/kWh NEDC: verificación del documento original pendiente.
let mttRecords=[],mttMatches=[],mttLimit=6,mttLoadError='';
const officialCodes=new Set();
const searchIndex=new WeakMap();
function cleanRow(row){
 const r=row.slice();
 Object.defineProperty(r,'sourceBrand',{value:row[F.BRAND]});
 Object.defineProperty(r,'sourceTech',{value:row[F.TECH]});
 r[F.BRAND]=aliases[r[F.BRAND]]||r[F.BRAND];
 // No inferir MHEV/HEV a partir del nombre comercial: la tecnología es la declarada por 3CV.
 // Las denominaciones Hybrid con tecnología de origen Bencina se aclaran únicamente en la ficha.
 return r;
}
function family(row){
 let name=String(row[F.MODEL]||'').trim(),brand=String(row[F.BRAND]||'').trim();
 if(name.toLowerCase().startsWith((brand+' ').toLowerCase()))name=name.slice(brand.length).trim();
 name=name.replace(/^(?:(?:The[\s-]+New|All[\s-]+New|New|Nuevo|Nueva)\s+)+/i,'').trim();
 if(!name)return row[F.MODEL];
 // El All New CX-5 de octubre 2026 no comparte catálogo de precio con la generación anterior.
 if(/^Mazda$/i.test(brand)&&/^CX-5 2\.5 AWD$/i.test(name)&&String(row[F.DATE])>='2026-10-01')return 'All New CX-5';
 const patterns=[
  // Subfamilias declaradas explícitamente, sin equiparar generaciones comerciales distintas.
  [/^Hilux\s+BEV\b/i,'Hilux BEV'],[/^ATTO\s+8\s+DM[-\s]?i\b/i,'Atto 8 DM-i'],[/^ATTO\s+8\s+DM[-\s]?p\b/i,'Atto 8 DM-p'],
  [/^CS35\s+MAX\b/i,'CS35 Max'],[/^CS35\s+Plus\b/i,'CS35 Plus'],[/^CS75\s+Plus\b/i,'CS75 Plus'],
  [/^CS\s*55\s+Plus\b/i,'CS55 Plus'],[/^X7\s+Plus\b/i,'X7 Plus'],
  [/^Hunter\s+(?:EREV|E-?REEV|REEV)\b/i,'Hunter REEV'],
  [/^Hunter\s+E\b/i,'Hunter eléctrico'],
  [/^GR\s+Corolla\b/i,'GR Corolla'],[/^Corolla\s+Cross\b/i,'Corolla Cross'],[/^Creta\s+Grand\b/i,'Creta Grand'],
  [/^Corolla\s+(?:SD|SEDAN|SEDÁN)\b/i,'Corolla Sedán'],
  [/^Corolla\s+(?:HB|HATCHBACK)\b/i,'Corolla Hatchback'],
  [/^Yaris\s+Cross\b/i,'Yaris Cross'],[/^Land\s+Cruiser\s+Prado\b/i,'Land Cruiser Prado'],
  [/^Land\s+Cruiser\b/i,'Land Cruiser'],[/^Range\s+Rover\s+(Sport|Velar|Evoque)\b/i,null],
  [/^Range\s+Rover\b/i,'Range Rover'],[/^Discovery\s+Sport\b/i,'Discovery Sport'],
  [/^Defender\s+(90|110|130)\b/i,null],[/^Grand\s+Vitara\b/i,'Grand Vitara'],
  [/^LPM\s+(?:B10|C10)\b/i,null],[/^Avatr\s+\d+\b/i,null],
  [/^Outlander\s+P(?:\s|-)?HEV\b/i,'Outlander PHEV'],[/^Outlander\s+Sport\b/i,'Outlander Sport'],[/^Outlander\b/i,'Outlander'],
  [/^Eclipse\s+Cross\b/i,'Eclipse Cross'],[/^Torres\s+(?:HEV|Hybrid)\b/i,'Torres HEV'],
  [/^RAV4\b/i,'RAV4'],[/^Evoque\b/i,'Range Rover Evoque'],
  [/^Dolphin\s+Mini\b/i,'Dolphin Mini'],[/^Yuan\s+Pro\s+DM[-\s]?i\b/i,'Yuan Pro DM-i'],[/^Yuan\s+Plus\b/i,'Yuan Plus'],[/^Song\s+Plus\b/i,'Song Plus'],[/^Song\s+Pro\b/i,'Song Pro'],
  [/^Deepal\s+[A-Z0-9-]+\b/i,null],
  [/^Haval\s+Jolion\s+Max\b/i,'Haval Jolion Max'],[/^Haval\s+(H6|H9|Jolion(?:\s+Pro)?|Dargo)\b/i,null],[/^ORA\s*0?3\b/i,'ORA 03'],
  [/^Tiggo\s+2\s+Pro\s+Max\b/i,'Tiggo 2 Pro Max'],[/^Tiggo\s+4\s+Pro\s+Max\b/i,'Tiggo 4 Pro Max'],[/^Tiggo\s+7\s+Pro\s+Max\b/i,'Tiggo 7 Pro Max'],[/^Tiggo\s+8\s+Pro\s+Max\b/i,'Tiggo 8 Pro Max'],[/^Tiggo\s+\d+\b/i,null],
  [/^GS3\s+Power\b/i,'GS3 Power'],[/^Emzoom\b/i,'Emzoom'],[/^Emkoo\b/i,'Emkoo'],[/^GS8\b/i,'GS8'],[/^C3\s+Aircross\b/i,'C3 Aircross'],[/^ATTO\s+\d+\b/i,null],
  [/^Model\s+[3SYX]\b/i,null],[/^F[\s-]?(150|250|350)\b/i,null],
  [/^e[\s-]?Vitara\b/i,'e Vitara'],[/^e[\s-]?208\b/i,'e-208'],[/^e[\s-]?2008\b/i,'e-2008']
 ];
 for(const [pattern,label] of patterns){const m=name.match(pattern);if(m)return label||m[0].replace(/^F[\s-]?(\d+)/i,'F-$1');}
 const words=name.split(/\s+/).filter(Boolean);
 return ['Serie','Series','Clase','Class','Model','Grand','Range'].includes(words[0])&&words[1]?words.slice(0,2).join(' '):words[0];
}
function queryText(row){
 const cached=searchIndex.get(row);if(cached)return cached;
 const brand=row[F.BRAND],model=row[F.MODEL],extra=[];
 if(/^(M\.?\s*Benz|Mercedes[\s-]?Benz)$/i.test(brand))extra.push('mercedes benz mercedes');
 if(/^(Great Wall|GWM)$/i.test(brand))extra.push('gwm great wall haval');
 if(/^Leapmotor$/i.test(brand))extra.push('leap motor leapmotor');
 if(/\bF[\s-]?150\b/i.test(model))extra.push('f150 f 150');
 if(/\bCR[\s-]?V\b/i.test(model))extra.push('crv cr v');
 if(/\bRAV[\s-]?4\b/i.test(model))extra.push('rav4 rav 4');
 const value=normalize([brand,model,row[F.CODE],row[F.TECH],...extra].join(' '));
 const out={words:value,compact:value.replace(/\s/g,'')};searchIndex.set(row,out);return out;
}
function matchesText(row,q){
 if(!q)return true;
 const hay=queryText(row),words=q.split(' ');
 // No usar dígitos sueltos de los códigos 3CV para hacer coincidir motores (p. ej. Hunter 2.0 ≠ Hunter E).
 const modelWords=normalize(row[F.BRAND]+' '+row[F.MODEL]).split(' ');
 return hay.words.includes(q)||hay.compact.includes(q.replace(/\s/g,''))||
  words.every(w=>/^\d{1,2}$/.test(w)?modelWords.includes(w):hay.words.includes(w));
}
function inputCriteria(){
 return {q:normalize($('query').value),brand:$('brand').value,model:$('model').value,tech:$('tech').value,body:$('bodytype').value,cycle:$('cycle').value,year:$('year').value,scope:$('catalogScope').value};
}
const groupSUV=['Station Wagon','Jeep','Tipo Jeep'];
function matchesScope(row,scope){
 if(scope==='all')return true;
 if(scope==='commercial')return false;
 const pending=recentNoPrice(row);
 if(scope==='upcoming')return pending&&marketEvidenceFor(row)?.kind==='upcoming';
 if(scope==='market-priced')return !archivedModel(row)&&marketEvidenceFor(row)?.kind==='market-priced'&&validCurrentPrice(row);
 if(scope==='family-price-review')return pending&&!marketEvidenceFor(row)&&hasFamilyPriceEvidence(row);
 if(scope==='recent-no-price')return pending&&!marketEvidenceFor(row)&&!hasFamilyPriceEvidence(row);
 return !archivedModel(row)&&(validCurrentPrice(row)||pending);
}
function bodyFits(selectedBody,actual){return !selectedBody||selectedBody==='__SUV_GROUP__'?(!selectedBody||groupSUV.includes(actual)):actual===selectedBody;}
function matchesFilters(row,f){
 return (!f.brand||row[F.BRAND]===f.brand)&&(!f.model||normalize(family(row))===f.model)&&
  (!f.tech||row[F.TECH]===f.tech)&&bodyFits(f.body,row[F.BODY])&&
  (!f.cycle||row[F.CYCLE]===f.cycle)&&(!f.year||row[F.DATE].slice(0,4)>=f.year);
}

/* Las homologaciones MTT no tienen rendimiento en la base energética de mayo.
 * Se consultan como un universo documental separado; jamás ingresan a all[]. */
function mttTechnology(source){
 const tech=normalize(source.technology),fuel=normalize(source.fuel);
 if(tech.includes('rango extendido'))return 'REEV';
 if(tech.includes('electrico a bateria'))return 'EV';
 if(tech.includes('hibrido con recarga exterior'))return 'PHEV';
 if(tech.includes('hibrido sin recarga exterior'))return 'HEV';
 if(tech==='combustion interna'&&fuel==='diesel')return 'Diésel';
 if(tech==='combustion interna'&&fuel==='gasolina')return 'Bencina';
 return '';
}
function prepareMTT(source){
 if(source.schemaVersion!==1||source.counts?.afterMayNewCodes!==229||source.counts.afterMayRows!==230||
   source.recentRecords?.length!==230)throw Error('Cotejo oficial de septiembre incompleto');
 const unique=new Set();
 const items=source.recentRecords.filter(item=>!item.inMaySource).map(item=>{
  if(!item.code||!item.brand||!item.model||!item.date||!item.certificate||
    item.date<=cut||item.date>'2026-09-28'||unique.has(item.code))throw Error('Registro MTT inválido o duplicado');
  unique.add(item.code);
  const branded=aliases[item.brand]||item.brand;
  const row=[];
  row[F.BRAND]=branded;row[F.MODEL]=item.model;
  row[F.TECH]=mttTechnology(item);row[F.DATE]=item.date;row[F.CODE]=item.code;
  row[F.BODY]='';row[F.CYCLE]='';
  return {source:item,row};
 });
 if(items.length!==229||unique.size!==229)throw Error('Las 229 homologaciones MTT no cuadran con la fuente');
 return items;
}
function filterMTT(f){
 // La nómina MTT no informa carrocería ni ciclo de rendimiento equiparables.
 if(f.body||f.cycle||f.scope==='upcoming'||f.scope==='market-priced'||f.scope==='family-price-review')return [];
 return mttRecords.filter(item=>(f.scope!=='recent-no-price'||(recentNoPrice(item.row)&&!marketEvidenceFor(item.row)))&&matchesText(item.row,f.q)&&matchesFilters(item.row,f));
}
function renderMTT(){
 // MTT sin rendimiento no es resultado comparable ni oferta comercial.
 // Un enlace al expediente aparece solo al buscar explícitamente su código o modelo.
 const section=$('mttSearchSection'),q=normalize($('query').value),fScope=$('catalogScope').value;
 const matches=mttMatches.filter(item=>fScope==='recent-no-price'||q===normalize(item.source.code)||(q.length>=10&&normalize(item.source.model).includes(q)));
 section.hidden=!matches.length;
 if(matches.length){$('mttSearchLink').href='./novedades-3cv.html?codigo='+encodeURIComponent(matches[0].source.code);
  $('mttNoticeHeading').textContent=fScope==='recent-no-price'?'Homologación reciente · Precio pendiente de comprobar.':'Solo homologación, sin rendimiento oficial.';
  $('mttNoticeBody').textContent=fScope==='recent-no-price'?matches.map(x=>x.row[F.BRAND]+' '+x.row[F.MODEL]).join(' · ')+' · Ficha energética y precio de versión pendiente de comprobar; no implica ausencia de venta.':'El modelo buscado aparece en una nómina técnica, pero no tiene ficha de consumo comparable.';
 }
}

function setOptions(id,items,placeholder){
 const element=$(id),current=element.value;
 element.replaceChildren(new Option(placeholder,''),...items.map(item=>new Option(item.label||item.value,item.value)));
 const valid=items.some(item=>item.value===current);
 if(valid)element.value=current;
 return !!current&&!valid;
}
function choices(){
 // Only compatible brand/model options; never quietly invent or repeat empty entries.
 const t=$('tech').value,body=$('bodytype').value,cycle=$('cycle').value,year=$('year').value,scope=$('catalogScope').value;
 const pool=all.filter(r=>matchesScope(r,scope)&&(!t||r[F.TECH]===t)&&bodyFits(body,r[F.BODY])&&(!cycle||r[F.CYCLE]===cycle)&&(!year||r[F.DATE].slice(0,4)>=year));
 const mtPool=(scope==='all'||scope==='recent-no-price')&&!body&&!cycle?mttRecords.filter(item=>(!t||item.row[F.TECH]===t)&&(!year||item.row[F.DATE].slice(0,4)>=year)):[];
 const commercial=(scope==='priced'||scope==='commercial')?[...(window.RindelabCommercial?.records()||[]),...(window.RindelabMarket?.records()||[])].filter(x=>x.commercialStatus!=='discontinued-cl'&&(!t||x.technology===t)&&!body&&!cycle&&!year):[];
 const brandNames=new Map();
 for(const name of [...pool.map(r=>r[F.BRAND]),...mtPool.map(item=>item.row[F.BRAND]),...commercial.map(x=>x.brand)]){
  const key=window.RindelabIdentity?.brand(name)||normalize(name);
  if(!brandNames.has(key))brandNames.set(key,name);
 }
 const brands=[...brandNames.values()].sort((a,b)=>a.localeCompare(b,'es')).map(x=>({value:x}));
 const brandCleared=setOptions('brand',brands,'Todas las marcas');
 const activeBrand=$('brand').value;
 const modelSelect=$('model');
 if(!activeBrand){modelSelect.disabled=true;modelSelect.replaceChildren(new Option('Primero selecciona una marca',''));}
 else{
  const families=new Map();
  for(const r of pool){if(r[F.BRAND]!==activeBrand)continue;const label=family(r),k=normalize(label);if(!k)continue;families.set(k,label);}
  for(const item of mtPool){const r=item.row;if(r[F.BRAND]!==activeBrand)continue;const label=family(r),k=normalize(label);if(k&&!families.has(k))families.set(k,label);}
  for(const p of commercial){if((window.RindelabIdentity?.brand(p.brand)||normalize(p.brand))!==(window.RindelabIdentity?.brand(activeBrand)||normalize(activeBrand)))continue;const k=normalize(p.family);if(k&&!families.has(k))families.set(k,p.family);}
  const items=[...families].sort((a,b)=>a[1].localeCompare(b[1],'es',{numeric:true})).map(([value,label])=>({value,label}));
  setOptions('model',items,'Todos los modelos');modelSelect.disabled=!items.length;
 }
 if(brandCleared)$('filterHint').textContent='La marca seleccionada no tiene versiones con esos filtros; se restableció la marca.';
}
function updateSuggestions(){
 const q=normalize($('query').value),box=$('suggestions');
 if(q.length<2){box.replaceChildren();return;}
 const hit=[],seen=new Set();
 for(const r of [...all,...mttRecords.map(item=>item.row)]){
  const label=r[F.BRAND]+' '+family(r),k=normalize(label);
  if((k.includes(q)||k.replace(/\s/g,'').includes(q.replace(/\s/g,'')))&&!seen.has(k)){
   hit.push(new Option('',label));seen.add(k);if(hit.length===12)break;
  }
 }
 box.replaceChildren(...hit);
}

function evCostForTariff(row,rate){
 const perf=row[F.TECH]==='EV'?number(row[F.EL]):null;
 return perf&&rate?100/perf*rate:null;
}
function sessionCost(rate){
 const kwh=number($('chargeKwh').value);
 return kwh&&kwh<=200&&rate?kwh*rate:null;
}
function fixedNumber(n){return Number(n).toLocaleString('es-CL',{maximumFractionDigits:2});}
function updateChargingExample(){
 const home=number($('homeChargeRate').value),publicRate=number($('publicChargeRate').value);
 const homePrice=sessionCost(home),publicPrice=sessionCost(publicRate);
 $('homeSessionCost').textContent=homePrice===null?'Ingresa tu tarifa':money(homePrice);
 $('homeSessionRate').textContent=home?'Tarifa residencial elegida: '+money(home)+'/kWh':'Revisa tu boleta para conocer el precio';
 $('publicSessionCost').textContent=publicPrice===null?'Ingresa kWh':money(publicPrice);
 $('publicSessionRate').textContent='Copec Voltex · '+$('publicChargeRate').selectedOptions[0].textContent;
 if(homePrice===null||publicPrice===null){
  $('chargeDifference').textContent=(!number($('chargeKwh').value)||number($('chargeKwh').value)>200)?'Ingresa una cantidad válida de energía (1 a 200 kWh).':'Agrega tu tarifa domiciliaria para comparar.';
 }else if(homePrice<publicPrice){
  $('chargeDifference').textContent='Para esta energía, cargar en casa costaría '+money(publicPrice-homePrice)+' menos que la tarifa pública seleccionada.';
 }else if(homePrice>publicPrice){
  $('chargeDifference').textContent='Para esta energía, cargar en casa costaría '+money(homePrice-publicPrice)+' más que la tarifa pública seleccionada.';
 }else{
  $('chargeDifference').textContent='Ambas modalidades cuestan lo mismo para esta cantidad de energía.';
 }
}
function calculateHomeFromBill(){
 const total=number($('homeBillAmount').value),used=number($('homeBillKwh').value);
 const fixedText=$('homeBillFixed').value.trim(),fixed=fixedText===''?0:Number(fixedText);
 const result=$('homeBillStatus');
 if(!total||!used||!Number.isFinite(fixed)||fixed<0||total<=fixed){
  result.textContent='Verifica que el total y los kWh sean mayores que cero, y que los cargos fijos no superen el total.';
  return;
 }
 const tariff=(total-fixed)/used;
 if(tariff<1||tariff>10000){
  result.textContent='La tarifa estimada está fuera del rango permitido. Revisa los montos y el consumo.';
  return;
 }
 const approx=Math.round(tariff*100)/100;
 $('homeChargeRate').value=String(approx);
 result.textContent='Precio medio aproximado: $'+fixedNumber(approx)+'/kWh ('+money(total-fixed)+' ÷ '+fixedNumber(used)+' kWh). No equivale necesariamente al costo de añadir más consumo: revisa tramo, descuentos y cargos variables.';
 updateChargeScenario();
 refreshEnergyViews();
}
// Tarifas Copec Voltex de referencia verificadas el 18/10/2026; no se actualizan automáticamente.
// La tarifa domiciliaria se introduce manualmente, sin medias supuestas.
function updateChargeScenario(){
 const mode=$('chargeScenario').value;
 const publicRate=number($('publicChargeRate').value);
 const homeRate=number($('homeChargeRate').value);
 const homePart=Number($('homeChargeShare').value)/100;
 const effective=$('electricPrice');
 $('publicChargeField').hidden=mode==='home'||mode==='manual';
 $('homeChargeField').hidden=mode==='public'||mode==='manual';
 $('homeShareField').hidden=mode!=='mixed';
 $('homeBillHelper').hidden=mode!=='home'&&mode!=='mixed';
 effective.readOnly=mode!=='manual';
 if(mode!=='manual'&&document.activeElement===effective)effective.blur();
 let price=null,detail='';
 if(mode==='public'){
  price=publicRate;
  detail='Copec Voltex · '+$('publicChargeRate').selectedOptions[0].textContent+'. Tarifa publicada, consulta 18/10/2026.';
 }else if(mode==='home'){
  price=homeRate;
  detail=price?'Domicilio · tarifa ingresada por el usuario.':'Introduce tu precio de electricidad domiciliaria por kWh para calcular costos.';
 }else if(mode==='mixed'){
  if(homeRate&&publicRate)price=homeRate*homePart+publicRate*(1-homePart);
  detail=price?'Escenario mixto: '+Math.round(homePart*100)+' % casa y '+Math.round((1-homePart)*100)+' % carga pública; promedio ponderado de tarifas, no de rendimientos.':
   'Introduce tu tarifa de domicilio por kWh para calcular un escenario mixto.';
 }else{
  price=number(effective.value);
  detail=price?'Tarifa manual elegida por el usuario.':'Introduce una tarifa manual positiva por kWh.';
 }
 if(mode!=='manual')effective.value=price===null?'':String(Math.round(price*100)/100);
 $('chargeStatus').textContent=detail+(price!==null?' Tarifa efectiva: $'+Number(effective.value).toLocaleString('es-CL',{maximumFractionDigits:2})+'/kWh.':'');
 updateChargingExample();
}
function refreshEnergyViews(){
 updateScenarioSummary();
 if(submitted)render();
 if($('statsDialog').open)renderStatistics();
 if($('compareDialog').open)renderComparisonContent();
}
function cost(row){
 const t=row[F.TECH];
 if(t==='PHEV'||t==='REEV'||reviewedEnergyCodes.has(row[F.CODE]))return null;
 if(t==='EV'){const k=number(row[F.EL]),price=number($('electricPrice').value);return k&&price?100/k*price:null;}
 const k=number(row[F.KM]),price=number($(t==='Diésel'||row[F.FUEL]==='Diésel'?'dieselPrice':'gasPrice').value);
 return k&&price?100/k*price:null;
}
function annualEnergy(row,years=1){
 const unit=cost(row),distance=number($('annualKm').value);
 return unit===null||!distance?null:unit*distance/100*years;
}
function metric(row){
 const t=row[F.TECH];
 if(t==='EV')return number(row[F.EL])?fixed(row[F.EL])+' km/kWh':'No informado';
 if(t==='PHEV'||t==='REEV'){
  const portions=[];
  if(number(row[F.EL]))portions.push('Eléctrico: '+fixed(row[F.EL])+' km/kWh');
  if(number(row[F.PH]))portions.push('Ponderado: '+fixed(row[F.PH])+' km/L');
  return portions.join(' · ')||'No informado';
 }
 return number(row[F.KM])?fixed(row[F.KM])+' km/L mixto':'No informado';
}
function sortRows(rows,sort){
 const copy=[...rows];const cmpCost=(a,b)=>{const x=cost(a),y=cost(b);if(x===null)return y===null?0:1;if(y===null)return -1;return sort==='cheapest'?x-y:y-x;};
 if(sort==='name')copy.sort((a,b)=>(a[F.BRAND]+' '+a[F.MODEL]).localeCompare(b[F.BRAND]+' '+b[F.MODEL],'es'));
 else if(sort==='recent')copy.sort((a,b)=>b[F.DATE].localeCompare(a[F.DATE]));
 else if(sort==='cheapest'||sort==='expensive'){
  // Un ordenamiento por gasto se ejecuta únicamente con un ciclo seleccionado.
  copy.sort((a,b)=>cmpCost(a,b)||b[F.DATE].localeCompare(a[F.DATE]));
 }
 return copy;
}
function textSuggestions(criteria){
 const box=$('suggested');box.replaceChildren();box.hidden=true;
 if(!criteria.q||results.length||mttMatches.length||window.RindelabMarket?.getCount()>0)return;
 // If the query exists but another facet hides it, offer a one-click global query.
 const global=all.filter(r=>matchesText(r,criteria.q)).concat(mttRecords.filter(item=>matchesText(item.row,criteria.q)).map(item=>item.row));
 if(global.length){
  const button=document.createElement('button');button.type='button';button.textContent='Buscar '+fmt(global.length)+' coincidencias sin filtros (historial completo)';button.dataset.global='true';
  box.append('Hay coincidencias fuera de tus filtros. ',button);box.hidden=false;return;
 }
 const options=new Map();
 for(const row of [...all,...mttRecords.map(item=>item.row)]){
  const name=family(row);
  for(const label of [name,row[F.BRAND]+' '+name]){const key=normalize(label);if(key&&!options.has(key))options.set(key,label);}
 }
 const d=(a,b)=>{
  if(Math.abs(a.length-b.length)>4)return 99;
  const vals=Array.from({length:b.length+1},(_,i)=>i);
  for(let i=1;i<=a.length;i++){let old=vals[0];vals[0]=i;for(let j=1;j<=b.length;j++){const before=vals[j];vals[j]=Math.min(vals[j]+1,vals[j-1]+1,old+(a[i-1]===b[j-1]?0:1));old=before;}}
  return vals[b.length];
 };
 const picks=[...options].map(([key,label])=>({label,d:d(criteria.q,key)})).filter(x=>x.d>0&&x.d<=Math.max(2,Math.floor(criteria.q.length*.24))).sort((a,b)=>a.d-b.d||a.label.length-b.label.length).slice(0,3);
 if(picks.length){box.append('¿Buscabas otro nombre? ');for(const x of picks){const btn=document.createElement('button');btn.type='button';btn.dataset.suggestion=x.label;btn.textContent=x.label;box.append(btn);}box.hidden=false;}
}
function ensureCostSortCycle(){
 if(!['cheapest','expensive'].includes($('sort').value)){costSortCycleNotice='';return;}
 if($('cycle').value)return;
 const available=new Set(results.filter(r=>cost(r)!==null).map(r=>r[F.CYCLE]).filter(c=>c==='WLTP'||c==='NEDC'));
 const target=available.has('WLTP')?'WLTP':available.has('NEDC')?'NEDC':null;
 if(!target)return;
 $('cycle').value=target;
 const scoped=inputCriteria();
 results=all.filter(r=>matchesScope(r,scoped.scope)&&matchesText(r,scoped.q)&&matchesFilters(r,scoped));
 mttMatches=filterMTT(scoped);limit=10;
 costSortCycleNotice='Se aplicó '+target+' para ordenar costos sin mezclar NEDC y WLTP. Puedes cambiar el ciclo en filtros técnicos.';
}
function syncSortAvailability(){
 const hasCost=results.some(row=>cost(row)!==null);
 for(const value of ['cheapest','expensive']){
  const option=$('sort').querySelector('option[value="'+value+'"]');
  if(option)option.disabled=!hasCost;
 }
 if(!hasCost&&['cheapest','expensive'].includes($('sort').value))$('sort').value='recent';
 return hasCost;
}
function render(){
 if(!submitted)return;
 const costAvailable=syncSortAvailability();
 const sorted=sortRows(results,$('sort').value),visible=sorted.slice(0,limit),sort=$('sort').value;
 $('sourceLegend').hidden=!(results.length||mttMatches.length);
 $('energyResultsHeading').hidden=!results.length;
 $('energyResultsCount').textContent=fmt(results.length)+' fichas en esta búsqueda';
 $('resultCount').textContent=fmt(results.length)+' '+(results.length===1?'versión encontrada':'versiones encontradas')+
  (normalize($('query').value).length>=4&&mttMatches.length?' · registro MTT sin rendimiento disponible':'');
 $('emptyState').hidden=!!results.length||!!mttMatches.length;
 if(!results.length&&!mttMatches.length)$('emptyState').innerHTML='<strong>Sin coincidencias en este ámbito</strong>Prueba con otro modelo o cambia a «Todas las homologaciones 3CV (historial)».';
 renderMTT();
 $('sortNote').hidden=costAvailable&&!['cheapest','expensive'].includes(sort);
 if(!costAvailable&&results.length){
  $('sortNote').textContent='No hay costo energético combinado calculable con los datos 3CV para esta selección. Se muestran por fecha de homologación. Para PHEV/REEV, consulta los rendimientos eléctrico y ponderado en Estadísticas.';
  $('sortNote').hidden=false;
 }else if(!costAvailable){
  $('sortNote').hidden=true;
 }else if(!$('sortNote').hidden){
  $('sortNote').textContent=(costSortCycleNotice?costSortCycleNotice+' ':'')+'Orden por gasto energético estimado cada 100 km · ciclo '+($('cycle').value||'no definido')+'. No incluye precio de compra, seguros ni mantención. Supuestos energéticos editables.';
 }
 const list=$('resultList');list.replaceChildren();
 $('resultsTitle').textContent=results.length===1?'1 versión encontrada':fmt(results.length)+' versiones para comparar';
 for(const row of visible){
  const index=all.indexOf(row),article=document.createElement('article');article.className='vehicle-card';
  const selectedNow=selected.includes(index);
  const suffix=String(row[F.CODE]||'').slice(-9);
  const stamp=String(row[F.DATE]||'');
  const displayDate=/^\d{4}-\d{2}-\d{2}$/.test(stamp)?stamp.slice(8)+'-'+stamp.slice(5,7)+'-'+stamp.slice(0,4):stamp||'sin fecha';
  const annual=annualEnergy(row),fiveYears=annualEnergy(row,5),per100=cost(row);
  const annualKm=Number($('annualKm').value);
  const flaggedEnergy=reviewedEnergyCodes.has(row[F.CODE]);
  const flaggedNote=flaggedEnergy?'<p class="energy-quality-note" role="note">Dato atípico pendiente de revisión documental: 10,6 km/kWh en NEDC. No equiparar con valores WLTP ni considerarlo el vehículo más eficiente del mercado.</p>':'';
  const status=archivedModel(row);
  const lifecycleHTML=status?'<p class="vehicle-lifecycle">'+(status.status==='previous-generation-cl'?'Generación anterior retirada de la oferta chilena':'Modelo descontinuado en la oferta chilena')+' · <a href="'+safe(status.sourceUrl)+'" target="_blank" rel="noopener noreferrer">Ver antecedente ↗</a></p>':'';
  const recent=recentNoPrice(row);
  const evidence=marketEvidenceFor(row);
  const audit=recent?auditedPriceFor(row):null;
  const extra=recent?marketFollowupFor(row):null;
  const third=recent?thirdPriceFor(row):null;
  const fourth=recent?finalPriceFor(row):null;
  const fifth=recent?fifthPriceFor(row):null;
  const verifiedFamily=recent&&hasFamilyPriceEvidence(row);
  if(recent)article.classList.add('vehicle-card-recent');
  const offer=!status&&!recent?window.RindelabCommercial?.minimum(row,family(row)):null;
  const offerCaption=offer?(offer.campaignExpired?'Referencia con campaña terminada · ': 'Precio publicado · ')+(offer.association==='same-tech'?'misma tecnología, versión sin verificar':'motorización de fuente no informada'):'';
  const evidenceTitle=evidence?.kind==='upcoming'?'Próximamente en Chile · Lanzamiento anunciado':'Oferta comercial en Chile · Precio de lista publicado';
  const evidencedHTML=evidence?'<div class="rinde-commercial rinde-recent rinde-market-status" data-market-status="'+safe(evidence.kind)+'" role="note"><strong>'+safe(evidenceTitle)+'</strong>'+(evidence.kind==='market-priced'&&offer?'<strong>Desde '+safe(money(offer.priceListClp))+' · precio de lista o preventa por acabado comercial</strong>':'')+'<small>'+safe(evidence.launchWindow)+'</small><small>'+safe(evidence.note)+'</small><small>Revisado el '+safe(evidence.verifiedAt)+' · no acredita stock ni equivalencia exacta de acabado con la homologación.</small><a href="'+safe(evidence.sourceUrl)+'" target="_blank" rel="noopener noreferrer">Ver precios y condiciones de la fuente ↗</a></div>':'';
  const auditedTitle=audit?.category==='family-price-undocumented-tech'?'Precio publicado para la familia · Motor y versión por verificar':
   audit?.category==='other-powertrain'?'Hay precio de otra motorización':
   audit?.category==='expired-price-reference'?'Referencias antiguas de la familia · Motor y vigencia por revisar':
   'Homologado recientemente · Precio por comprobar';
  const auditedDescription=audit?.category==='family-price-undocumented-tech'?
   'Hay publicaciones comerciales para '+audit.family+', pero no acreditan el precio de la tecnología '+row[F.TECH]+' ni de esta versión 3CV. No se asigna un importe.' :
   audit?.category==='other-powertrain'?'Solo encontramos precios de la familia con otro tipo de motor; no los asignamos a este vehículo.':
   audit?.category==='expired-price-reference'?'Las publicaciones comerciales de la familia están vencidas y tampoco acreditan necesariamente esta motorización. No se asigna su precio.':
   'No hay precio de esta familia conciliado en nuestro catálogo. Esto NO significa que no se venda en Chile.';
  const auditSource=audit?.category==='family-price-undocumented-tech'&&Array.isArray(audit.sources)?audit.sources.find(s=>/^https:\/\//.test(s.url||'')):null;
  const officialReference=extra?.reference;
  const dealerReference=extra?.dealers?.[0];
  const supplementalHTML=fifth?
   '<small>'+safe(fifth.reference.priceKind==='lista-septiembre-vencida'?'Referencia histórica de septiembre 2026, promoción vencida':fifth.reference.priceKind==='listado-portal-sin-vigencia'?'Precio referencial de directorio, vigencia no acreditada':fifth.reference.priceKind==='precio-lanzamiento-historico'?'Precio de lanzamiento histórico':'Precio de lista de otra versión comercial')+': <strong>'+safe(money(fifth.reference.priceListClp))+(fifth.reference.taxTreatment==='+ IVA'?' + IVA':'')+'</strong> · '+safe(fifth.reference.commercialVersion)+'</small><small>'+safe(fifth.reference.notes)+'</small><a href="'+safe(fifth.reference.sourceUrl)+'" target="_blank" rel="noopener noreferrer">Ver fuente y condiciones ↗</a>':
   fourth?
   '<small>'+safe(fourth.reference.sourceValidUntil&&fourth.reference.sourceValidUntil<'2026-10-22'?'Lista histórica; condición promocional vencida':fourth.reference.sourceValidUntil?'Lista de precio publicada con vigencia indicada':'Lista comercial publicada; vigencia a verificar')+': <strong>'+safe(money(fourth.reference.priceListClp))+'</strong> · '+safe(fourth.reference.version)+'</small><small>'+safe(fourth.reference.note)+'</small><a href="'+safe(fourth.reference.url)+'" target="_blank" rel="noopener noreferrer">Consultar versión y condiciones oficiales ↗</a>':
   third?
   '<small>'+safe(third.reference.availability==='anunciado-proximamente'?'Anunciado, sin venta acreditada':third.reference.priceType.includes('bonos')?'Precio de otra versión, con condición promocional':'Referencia comercial de otra versión')+(Number.isInteger(third.reference.priceClp)?': <strong>'+safe(money(third.reference.priceClp))+(third.reference.priceType.includes('+IVA')?' + IVA':'')+'</strong>':'')+' · '+safe(third.reference.commercialVersion)+'</small><small>'+safe(third.reference.note)+'</small><a href="'+safe(third.reference.url)+'" target="_blank" rel="noopener noreferrer">Ver fuente del fabricante o importador ↗</a>':
   officialReference?
   '<small>'+safe(officialReference.priceType==='lista-vencida'?'Referencia comercial caducada':officialReference.priceType==='desde'?'Valor promocional «desde»':officialReference.priceType==='lista+IVA'?'Precio de lista, sin IVA':'Precio de lista de otra versión')+': <strong>'+safe(money(officialReference.referencePriceClp))+(officialReference.priceType==='lista+IVA'?' + IVA':'')+'</strong> · '+safe(officialReference.commercialVersion)+'</small><small>'+safe(officialReference.note)+'</small><a href="'+safe(officialReference.url)+'" target="_blank" rel="noopener noreferrer">Comprobar precio y condiciones comerciales ↗</a>':
   dealerReference?'<small>'+safe(dealerReference.seller)+(Number.isInteger(dealerReference.listPriceClp)&&audit?.category==='unmatched-catalog'?' publicó una referencia de '+safe(money(dealerReference.listPriceClp))+(dealerReference.taxIncluded===false?' + IVA':'')+' para la familia, sin acabado 3CV homologado.':' publicó la familia, sin precio de versión comprobado.')+'</small><a href="'+safe(dealerReference.url)+'" target="_blank" rel="noopener noreferrer">Ver anuncio de concesionaria ↗</a>':'';
  const shownTitle=fifth?(fifth.reference.priceKind==='lista-septiembre-vencida'?'Referencia histórica · Promoción vencida':fifth.reference.matchedLevel==='familia-motor-caja-acabado-solo-GL'?'Precio GL publicado · GB sin cotización propia':'Precio de familia · Acabado por conciliar'):
   fourth?'Precio documentado de familia · Acabado 3CV por conciliar':
   third?(third.reference.availability==='anunciado-proximamente'?'Lanzamiento anunciado · Precio referencial':third.reference.matchConfidence==='family-only'?'Precio de familia publicado · Versión sin verificar':'Precio publicado de otra versión · No imputable al 3CV'):
   officialReference?.samePowertrain?'Precio comercial de familia · Versión 3CV pendiente':
   officialReference?'Referencia de otra versión · Revisar vigencia y motor':
   dealerReference&&audit?.category==='unmatched-catalog'?(Number.isInteger(dealerReference.listPriceClp)?'Precio publicado de familia · Versión por verificar':'Anuncio en concesionaria · Precio por comprobar'):auditedTitle;
  const shownDescription=fifth?'Importe documentado de una versión comercial de Chile, no de este código 3CV; deben comprobarse motor, versión, carrocería y vigencia.':
   fourth?'Existe precio de lista publicado para una versión de la familia; no confirma correspondencia exacta con el código 3CV, stock ni vigencia de promociones.':
   third?'La fuente documenta una versión comercial de esta familia, no necesariamente esta homologación; no se atribuye automáticamente el precio al código técnico.':
   officialReference?.samePowertrain?
   'Existe precio publicado de una versión con esta tecnología, pero el acabado no está conciliado con el código 3CV. El importe no se asigna automáticamente.':
   officialReference?'El precio corresponde a una variante comercial de referencia y no debe atribuirse a esta homologación.':
   dealerReference&&audit?.category==='unmatched-catalog'?'El modelo o familia tiene una publicación comercial, pero no la equivalencia exacta de esta homologación.':auditedDescription;
  const auditNote=recent?'<div class="rinde-commercial rinde-recent rinde-price-audit" data-price-audit="'+safe(audit?.category||'pending')+'" role="note"><strong>'+safe(shownTitle)+'</strong><small>'+safe(shownDescription)+'</small>'+supplementalHTML+'<small>Chequeo 22-10-2026 · Precio de versión comercial, no del código 3CV · Stock y vigencia por verificar.</small>'+(!supplementalHTML&&auditSource?'<a href="'+safe(auditSource.url)+'" target="_blank" rel="noopener noreferrer">Ver referencia de otra versión de familia ↗</a>':'')+'</div>':'';
  const offerHTML=evidencedHTML||auditNote||(offer?'<div class="rinde-commercial"><small>'+safe(offerCaption)+'</small> <strong>'+safe(money(offer.priceListClp))+(offer.taxIncluded===false?' + IVA':'')+'</strong> <a href="./cotizador.html?marca='+encodeURIComponent(offer.brand)+'&modelo='+encodeURIComponent(offer.family)+'">Ver versiones y fuente ↗</a></div>':'');
  const source=officialCodes.has(row[F.CODE])?'Consumo Vehicular · API oficial octubre 2026':'3CV oficial · base mayo 2026';
  article.innerHTML='<div class="vehicle-heading"><div class="vehicle-title"><h3>'+safe(row[F.BRAND]+' '+row[F.MODEL])+'</h3>'+
   '<p class="vehicle-meta">Homologado '+safe(displayDate)+' · código …'+safe(suffix)+'</p>'+lifecycleHTML+(evidence?.kind==='market-priced'?'<span class="rinde-status-recent">Oferta chilena · Precio publicado</span>':recent?'<span class="rinde-status-recent">'+safe(evidence?.kind==='upcoming'?'Lanzamiento anunciado en Chile':verifiedFamily?'Precio de familia · Versión sin conciliar':'Homologación · Precio por comprobar')+'</span>':'')+'</div'+'>'+
   '<div class="vehicle-badges"><span class="vehicle-tech" data-tech="'+safe(row[F.TECH])+'" title="Categoría declarada en 3CV: '+safe(row[F.TECH])+'">'+safe(techHuman[row[F.TECH]]||row[F.TECH])+'</span><span class="cycle-badge" data-cycle="'+safe(row[F.CYCLE]||'')+'" title="'+safe(row[F.CYCLE]==='NEDC'?'Ensayo NEDC; no es directamente comparable con WLTP':row[F.CYCLE]==='WLTP'?'Ensayo WLTP; no es directamente comparable con NEDC':'Ciclo no informado')+'">'+safe(row[F.CYCLE]||'Ciclo no informado')+'</span></div></div>'+
   '<div class="vehicle-cell vehicle-performance"><small>Rendimiento oficial</small><strong>'+safe(metric(row))+'</strong></div>'+
   '<div class="vehicle-cell vehicle-cost"><small>Costo estimado /100 km</small><strong'+(per100===null?' class="no-data"':'')+'>'+safe(money(per100))+'</strong><small class="annual-result" aria-hidden="true">'+(annual===null?'Sin proyección de energía':safe(money(annual))+' / año · '+safe(money(fiveYears))+' / 5 años')+'</small></div>'+
   offerHTML+flaggedNote+
   '<div class="vehicle-actions"><button type="button" class="button primary" data-detail="'+index+'">'+(status?'Consultar valor usado y ficha':'Ver ficha')+'</button>'+
   '<button type="button" class="button secondary" data-compare="'+index+'" aria-pressed="'+selectedNow+'">'+(selectedNow?'Quitar':'Comparar +')+'</button></div>'+
   '<div class="vehicle-annual"><div class="vehicle-monthly"><small>Gasto mensual estimado</small><strong class="vehicle-monthly-value'+(annual===null?' no-data':'')+'">'+(annual===null?'No estimable':safe(money(annual/12)))+'</strong></div><small>Gasto energético anual estimado</small><strong class="vehicle-annual-value'+(annual===null?' no-data':'')+'">'+(annual===null?'No estimable':safe(money(annual)))+'</strong>'+
   '<span>'+(annual===null?'Faltan datos de rendimiento o tarifa para calcularlo':'Con '+safe(fmt(annualKm))+' km al año · tarifas constantes')+'</span></div>'+
   '<div class="vehicle-foot"><span class="vehicle-five-year">'+(fiveYears===null?'Sin proyección a 5 años':'5 años: '+safe(money(fiveYears))+' · tarifas constantes')+'</span>'+
   '<small class="energy-source-line">Fuente: '+safe(source)+'</small></div>'+
   (window.RindelabPhotos?.render(row,F,safe)||'<div class="vehicle-visual" aria-label="Fotografía de este vehículo no disponible"><svg viewBox="0 0 120 48" aria-hidden="true"><path d="M8 32h104l-3-12-17-4-13-10H38L22 20l-12 3z"/><path d="M37 19h48M12 32v6h13m70 0h13v-6"/><circle cx="31" cy="35" r="8"/><circle cx="89" cy="35" r="8"/></svg><small>Fotografía no disponible</small></div>');
  list.append(article);
 }
 $('more').hidden=limit>=results.length;
 const commercial=window.RindelabMarket?.render(inputCriteria(),all)||0;
 if(commercial){
  $('emptyState').hidden=true;
  $('resultCount').textContent+=' · '+fmt(commercial)+' familias comerciales';
  if(!results.length)$('resultsTitle').textContent='Resultados del catálogo comercial';
 }
}
function performSearch({scroll=true}={}){
 const criteria=inputCriteria();
 results=all.filter(r=>matchesScope(r,criteria.scope)&&matchesText(r,criteria.q)&&matchesFilters(r,criteria));
 mttMatches=criteria.scope==='commercial'?[]:filterMTT(criteria);
 submitted=true;limit=10;mttLimit=6;
 window.RindelabMarket?.resetPage();
 ensureCostSortCycle();
 $('results').hidden=false;
 $('filterHint').textContent='';
 render();textSuggestions(criteria);
 if(scroll)$('results').scrollIntoView({block:'start',behavior:'instant'});
}
function co2Annual(row){
 const km=number($('annualKm').value);
 if(!km)return null;
 if(row[F.TECH]==='EV')return 0; // Solo emisiones directas, no ciclo de vida ni electricidad del SEN.
 const grams=number(row[F.CO2]);return grams===null?null:grams*km/1000000;
}
function percentileFor(row){
 const tech=row[F.TECH],cycle=row[F.CYCLE],body=row[F.BODY];
 const idx=tech==='EV'||tech==='PHEV'||tech==='REEV'?F.EL:F.KM;
 const value=number(row[idx]);if(!value||!cycle||!body)return null;
 const sample=all.map(r=>r[F.TECH]===tech&&r[F.CYCLE]===cycle&&r[F.BODY]===body?number(r[idx]):null).filter(v=>v!==null);
 if(sample.length<10)return null;
 const lower=sample.filter(v=>v<value).length,eq=sample.filter(v=>v===value).length;
 return {pct:Math.round(100*(lower+eq/2)/sample.length),n:sample.length,measure:idx===F.EL?'km/kWh eléctrico':'km/L'};
}
function drivingProfile(row){
 const t=row[F.TECH];
 if(t==='PHEV'||t==='REEV')return;
 const root=$('detailContent'),id='rindeProfile';
 const field=document.createElement('section');field.className='rinde-profile';
 field.innerHTML='<h3>Simular ciudad y carretera con tus rendimientos</h3><p class="note">La ficha actual contiene rendimiento combinado 3CV, no los valores urbano y extraurbano individualizados. Ingresa ambos rendimientos para este vehículo: son <strong>supuestos tuyos, no cifras 3CV</strong>. No modifican la homologación.</p>'+
 '<div class="rinde-profile-fields"><label>Ciudad ('+(t==='EV'?'km/kWh':'km/L')+') <input type="number" id="rindeUrban" min="0.1" max="100" step="0.1" inputmode="decimal" placeholder="Ingresa dato"></label>'+
 '<label>Carretera ('+(t==='EV'?'km/kWh':'km/L')+') <input type="number" id="rindeRoad" min="0.1" max="100" step="0.1" inputmode="decimal" placeholder="Ingresa dato"></label>'+
 '<label>Perfil de circulación <select id="rindeTrip"><option value="1">100 % ciudad</option><option value=".7" selected>70 % ciudad / 30 % carretera</option><option value=".3">30 % ciudad / 70 % carretera</option><option value="0">100 % carretera</option></select></label></div>'+
 '<p id="rindeProfileResult" role="status" aria-live="polite">Introduce rendimientos de ciudad y carretera para calcular.</p>';
 root.append(field);
 const update=()=>{
  const a=number($('rindeUrban').value),b=number($('rindeRoad').value),u=Number($('rindeTrip').value),km=number($('annualKm').value);
  if(!a||!b||a>100||b>100||!km){$('rindeProfileResult').textContent='Introduce rendimientos positivos y realistas para ambos recorridos.';return;}
  const cityRate=t==='EV'?number($('electricPrice').value):number($(t==='Diésel'||row[F.FUEL]==='Diésel'?'dieselPrice':'gasPrice').value);
  const roadRate=t==='EV'?number($('publicChargeRate').value):cityRate;
  if(!cityRate||!roadRate){$('rindeProfileResult').textContent='Revisa las tarifas de energía para este cálculo.';return;}
  const per100=100*u/a*cityRate+100*(1-u)/b*roadRate;
  $('rindeProfileResult').textContent='Costo supuesto por 100 km: '+money(per100)+' · anual: '+money(per100*km/100)+'. Se pondera el consumo, no el rendimiento; para eléctricos la ruta usa la tarifa pública seleccionada. No es medición 3CV.';
 };
 field.addEventListener('input',update);field.addEventListener('change',update);
}
function showDetail(i){
 const r=all[i];if(!r)return;
 $('detailTitle').textContent=r[F.BRAND]+' '+r[F.MODEL];
 const link=new URL(location.href);link.searchParams.set('codigo',r[F.CODE]);link.searchParams.delete('comparar');
 history.replaceState(null,'',link.pathname+link.search+link.hash);
 const items=[
  ['Marca de origen 3CV',r.sourceBrand],['Modelo y versión',r[F.MODEL]],
  ['Motorización declarada 3CV',r.sourceTech],
  ...(r.sourceTech!==r[F.TECH]?[['Motorización mostrada',r[F.TECH]]]:[]),
  ...((r.sourceTech==='Bencina'&&/\b(?:HYBRID|HIBRID[OA]|HÍBRID[OA]|E-HYBRID|HEV)\b/i.test(r[F.MODEL]))?
   [['Aclaración sobre el nombre comercial','El nombre contiene una referencia a tecnología híbrida, pero la fuente 3CV declara Bencina. RINDELAB no infiere una subtecnología.']]:[]),
  ['Combustible',r[F.FUEL]],['Carrocería',r[F.BODY]],['Tracción',r[F.DRIVE]],
  ['Transmisión',r[F.TRANS]],['Cilindrada',r[F.ENGINE]],
  ['Ciclo de homologación',r[F.CYCLE]],['Fecha de homologación',r[F.DATE]],
  ['Código 3CV',r[F.CODE]],
  ...(isPlugInTechnology(r[F.TECH])?
   [['Rendimiento eléctrico informado (km/kWh)',number(r[F.EL])?fixed(r[F.EL]):'N/D'],
    ['Rendimiento ponderado informado (km/L)',number(r[F.PH])?fixed(r[F.PH]):'N/D']]:
   [['Rendimiento oficial',metric(r)]]),
  ['Costo energético estimado/100 km',isPlugInTechnology(r[F.TECH])?'No calculable sin supuestos de uso eléctrico y combustible':money(cost(r))],
  ['Gasto energético anual estimado ('+fmt(Number($('annualKm').value))+' km)',money(annualEnergy(r))],
  ['Gasto energético estimado a 3 años',money(annualEnergy(r,3))],
  ['Gasto energético estimado a 5 años',money(annualEnergy(r,5))],
  ['Emisiones directas anuales de CO₂ (t)',co2Annual(r)===null?'No disponible':co2Annual(r).toLocaleString('es-CL',{maximumFractionDigits:3})],
  ...(r[F.TECH]==='EV'?[
    ['Costo de 100 km cargando en casa',money(evCostForTariff(r,number($('homeChargeRate').value)))],
    ['Costo de 100 km en electrolinera seleccionada',money(evCostForTariff(r,number($('publicChargeRate').value)))],
    ['Costo de recarga en casa ('+fixedNumber(Number($('chargeKwh').value))+' kWh)',money(sessionCost(number($('homeChargeRate').value)))],
    ['Costo de recarga pública ('+fixedNumber(Number($('chargeKwh').value))+' kWh)',money(sessionCost(number($('publicChargeRate').value)))]
  ]:[]),
  ...(r[F.TECH]==='EV'||isPlugInTechnology(r[F.TECH])?
    [['Batería (kWh)',r[F.BAT]],['Conector AC',r[F.AC]],['Conector DC',r[F.DC]]].filter(([,v])=>v!==null&&v!==''&&v!=='N/D'):[]),
  ['CO₂ (g/km)',r[F.CO2]],['Norma de emisiones',r[F.NORM]]
 ];
 const displayItems=items.filter(([k,v])=>{
   const val=String(v??'').trim();
   if(!val||val==='N/D'||val==='No aplica'||val==='0.0'||val==='0')return false;
   if(r[F.TECH]==='EV'&&['Combustible','Cilindrada','CO₂ (g/km)'].includes(k))return false;
   return true;
  });
  const annually=annualEnergy(r),km=Number($('annualKm').value),co2=number(r[F.CO2]);
  const primary=[
   ['Gasto energético anual estimado',annually===null?'No estimable':money(annually)],
   ['Cada 100 km',cost(r)===null?'No estimable':money(cost(r))],
   ['Rendimiento oficial',metric(r)],
   ...(co2!==null&&r[F.TECH]!=='EV'?[['CO₂ homologado',fmt(co2)+' g/km']]:[]),
   ...(co2Annual(r)!==null?[['CO₂ directo por año',co2Annual(r).toLocaleString('es-CL',{maximumFractionDigits:3})+' t']]:[])
  ];
  $('detailContent').innerHTML='<div class="detail-kpis">'+primary.map(([name,value],i)=>
   '<div class="detail-kpi'+(i===0?' highlight':'')+'"><small>'+safe(name)+'</small><strong>'+safe(value)+'</strong></div>').join('')+'</div>'+
   '<p class="detail-cost-context">Estimación con '+safe(fmt(km))+' km al año y tarifas editables; no es gasto medido. Gasto energético a cinco años, manteniendo precios constantes: <strong>'+safe(money(annualEnergy(r,5)))+'</strong>.</p>'+
   '<div class="detail-purchase"><strong>¿Cuánto pagarías por comprarlo?</strong><p>El precio de lista depende de la versión comercial exacta. La homologación 3CV no demuestra esa correspondencia, por lo que RINDELAB no suma un precio de compra a esta ficha sin acreditarla.</p><a href="./cotizador.html?marca='+encodeURIComponent(r[F.BRAND])+'" class="button secondary">Consultar precios de lista por versión ↗</a></div>'+
   '<details class="detail-technical"><summary>Datos técnicos y homologación oficial</summary><p class="note">'+
   (isPlugInTechnology(r[F.TECH])?
    'Los rendimientos eléctrico (km/kWh) y ponderado (km/L) son datos registrados en 3CV, bajo condiciones de ensayo. No se infiere un costo combinado.':
    'Datos de homologación, no consumo garantizado en ruta. WLTP y NEDC corresponden a ensayos distintos.')+
   '</p><dl class="details-list">'+displayItems.map(([k,v])=>'<dt>'+safe(k)+'</dt><dd>'+safe(v)+'</dd>').join('')+'</dl></details>';
 const ranking=percentileFor(r);
 if(ranking){const p=document.createElement('div');p.className='rinde-percentile';const t=document.createElement('p');t.textContent='Percentil '+ranking.pct+' de eficiencia · '+ranking.n+' fichas con misma tecnología, carrocería y ciclo '+r[F.CYCLE]+' ('+ranking.measure+'). Percentil calculado sobre fichas, no ventas ni modelos únicos.';const meter=document.createElement('meter');meter.min=0;meter.max=100;meter.value=ranking.pct;meter.setAttribute('aria-label','Percentil relativo de eficiencia');meter.style.width='100%';p.append(t,meter);$('detailContent').append(p);}
 const emission=co2Annual(r);
 if(r[F.TECH]==='EV'){
  const p=document.createElement('p');p.className='note';p.textContent='Vehículo eléctrico: 0 toneladas/año de CO₂ en tubo de escape. Las emisiones indirectas dependen de la generación eléctrica; no representan emisiones de ciclo de vida.';$('detailContent').append(p);
  const grid=document.createElement('section');grid.className='rinde-profile';
  grid.innerHTML='<h3>Emisiones indirectas por electricidad (SEN)</h3>'+
    '<p class="note">Introduce un factor de emisión SEN para el período que quieras representar, en kg CO₂eq/MWh (numéricamente igual a g CO₂eq/kWh). No se asigna un factor nacional actual sin identificar el año y fuente. <a href="https://energia.gob.cl/node/20185" target="_blank" rel="noopener noreferrer">Consultar indicador oficial del Ministerio de Energía ↗</a>.</p>'+
    '<label>Factor SEN (kg CO₂eq/MWh) <input id="rindeSENFactor" type="number" min="0.01" max="1500" step="0.01" placeholder="Ingresa factor del período"></label><p id="rindeSENResult" role="status" aria-live="polite">Introduce el factor para estimar emisiones indirectas de generación eléctrica.</p>';
  $('detailContent').append(grid);
  grid.querySelector('#rindeSENFactor').addEventListener('input',()=>{
    const factor=number($('rindeSENFactor').value),efficiency=number(r[F.EL]),km=number($('annualKm').value);
    $('rindeSENResult').textContent=(!factor||factor>1500||!efficiency||!km)?
     'Requiere factor positivo, rendimiento eléctrico homologado y kilometraje.' :
     'Electricidad estimada: '+fmt(Math.round(km/efficiency))+' kWh/año · Emisiones indirectas aproximadas: '+((km/efficiency)*factor/1000000).toLocaleString('es-CL',{maximumFractionDigits:3})+' t CO₂eq/año. Sin pérdidas de recarga ni otras emisiones del ciclo de vida.';
  });
}
 else if(emission!==null){const p=document.createElement('p');p.className='note';p.textContent='CO₂ directo: '+emission.toLocaleString('es-CL',{maximumFractionDigits:3})+' t/año según g/km 3CV y '+fmt(Number($('annualKm').value))+' km/año. No incluye emisiones del ciclo de vida.';$('detailContent').append(p);}
 drivingProfile(r);
 if(reviewedEnergyCodes.has(r[F.CODE])){const note=document.createElement('p');note.className='energy-quality-note';note.textContent='Advertencia de calidad: esta homologación NEDC registra 10,6 km/kWh, mientras otra homologación NEDC de esta familia (2023) registra 6,3 km/kWh. No se reemplaza el dato oficial ni se afirma que sea un error; requiere cotejar el expediente 3CV y no es comparable con WLTP.';$('detailContent').append(note);}
 $('detailDialog').showModal();
 if(window.RindelabSII)window.RindelabSII.show(r,family(r));
}
const MAX_COMPARE=5;
function syncCompareScrollControls(){
 const scroller=$('compareContent').querySelector('.compare-scroller');
 const buttons=document.querySelector('.compare-scroll-actions');
 const overflow=!!scroller&&$('compareDialog').open&&scroller.scrollWidth>scroller.clientWidth+2;
 buttons.hidden=!overflow;
 $('compareScrollHint').hidden=!overflow;
 $('comparePrev').disabled=!overflow||scroller.scrollLeft<=1;
 $('compareNext').disabled=!overflow||scroller.scrollLeft>=scroller.scrollWidth-scroller.clientWidth-1;
}
function compareUpdate(message=''){
 const n=selected.length;
 $('compareTray').hidden=n===0;
 document.body.classList.toggle('has-tray',n>0);
 const nLabel=n===1?'1 vehículo seleccionado · agrega al menos uno más.':
   n===MAX_COMPARE?'5 de 5 vehículos · puedes comparar o quitar uno para cambiarlo.':
   n+' de 5 vehículos seleccionados · '+(n>=2?'puedes comparar o agregar otros.':'agrega otro vehículo.');
 $('compareStatus').textContent=message||nLabel;
 $('compareOpen').disabled=n<2;
 $('compareOpen').textContent=n>=2?'Comparar '+n+' vehículos':'Comparar';
 $('compareAdd').textContent=n===MAX_COMPARE?'Cambiar un vehículo':'+ Agregar otro';
 const chipBox=$('compareSelected');chipBox.replaceChildren();
 selected.forEach(i=>{
  const r=all[i];if(!r)return;
  const chip=document.createElement('div');chip.className='selected-vehicle-chip';
  const label=document.createElement('span');label.className='selected-chip-label';
  label.textContent=r[F.BRAND]+' '+r[F.MODEL];label.title=label.textContent;
  const remove=document.createElement('button');remove.type='button';remove.className='selected-chip-remove';
  remove.dataset.removeCompare=String(i);remove.setAttribute('aria-label','Quitar '+label.textContent+' de la comparación');
  remove.textContent='×';chip.append(label,remove);chipBox.append(chip);
 });
 if($('compareDialog').open){
  if(n<2)$('compareDialog').close();
  else renderComparisonContent();
  syncCompareScrollControls();
 }
}
function selectForCompare(i){
 if(!Number.isInteger(i)||!all[i])return;
 const found=selected.indexOf(i);
 if(found>=0)selected.splice(found,1);
 else if(selected.length>=MAX_COMPARE){
  compareUpdate('Ya seleccionaste cinco vehículos. Quita uno de la bandeja para agregar otro.');
  return;
 }else selected.push(i);
 compareUpdate();if(submitted)render();
}
function goAddVehicle(){
 if($('compareDialog').open)$('compareDialog').close();
 const message=selected.length>=MAX_COMPARE?
  'Ya tienes cinco vehículos. Quita uno de la bandeja para agregar otro modelo.':
  'Escribe otra marca o modelo y pulsa Buscar. Conservaremos los vehículos seleccionados.';
 compareUpdate(message);
 $('query').scrollIntoView({block:'center',behavior:'instant'});
 $('query').focus({preventScroll:true});
}
function renderPayback(vehicles,mixedCycles){
 const area=$('compareContent'),el=document.createElement('section');el.className='rinde-payback';
 if(vehicles.length!==2){el.innerHTML='<strong>Equilibrio de compra</strong><p>Para contrastar recuperación de precio, compara exactamente dos vehículos con versiones comerciales seleccionadas manualmente.</p>';area.append(el);return;}
 if(mixedCycles){el.innerHTML='<strong>Equilibrio de compra</strong><p>No se calcula retorno entre ciclos NEDC y WLTP distintos.</p>';area.append(el);return;}
 const api=window.RindelabCommercial,rows=vehicles.map(x=>x.row),prices=rows.map(r=>api?.selected(r));
 const e=rows.map(r=>annualEnergy(r));
 if(prices.some(p=>!api?.cleanPrice(p))||e.some(x=>x===null)){
  el.innerHTML='<strong>Equilibrio de compra</strong><p>Selecciona manualmente en cada ficha una versión comercial con precio individual (no «desde») y asegúrate de que ambos consumos energéticos sean calculables. No se emparejan automáticamente versiones con códigos 3CV.</p>';area.append(el);return;
 }
 const low=e[0]<=e[1]?0:1,high=1-low,save=e[high]-e[low],premium=prices[low].priceListClp-prices[high].priceListClp;
 const delta=e[high]-e[low];
 const name=rows[low][F.BRAND]+' '+rows[low][F.MODEL];
 const h=document.createElement('h3');h.textContent='Equilibrio energético del precio de compra';
 const p=document.createElement('p');
 p.textContent=save<=0?'El ahorro energético es nulo: no hay recuperación calculable.':
 'Vehículo de menor gasto energético ('+name+'): ahorro estimado '+money(delta/12)+'/mes y '+money(delta)+'/año. '+(premium<=0?'No presenta sobreprecio de compra frente a la versión elegida del otro vehículo.':'Diferencia de precio elegida: '+money(premium)+'; recuperación por ahorro energético en '+(premium/save).toLocaleString('es-CL',{maximumFractionDigits:1})+' años y '+fmt(Math.round(premium/save*Number($('annualKm').value)))+' km.');
 const note=document.createElement('p');note.className='note';note.textContent='Escenario referencial: mismas distancias y precios de energía constantes; no incluye depreciación, seguros, mantenimiento ni crédito. La versión comercial fue seleccionada por el usuario; no hay equivalencia certificada con la homologación 3CV.';
 el.append(h,p,note);area.append(el);
}
function renderComparisonContent(){
 const vehicles=selected.map(i=>({index:i,row:all[i]})).filter(x=>x.row);
 if(vehicles.length<2)return;
 const uniqueCycles=new Set(vehicles.map(x=>x.row[F.CYCLE]).filter(Boolean));
 const mixedCycles=uniqueCycles.size>1;
 const columns=vehicles.length;
 const containsPlugIn=vehicles.some(({row})=>isPlugInTechnology(row[F.TECH]));
 const dataRows=[
  ['Motorización',r=>r[F.TECH]],
  ['Rendimiento oficial',r=>metric(r)],
  ...(containsPlugIn?[
   ['Rendimiento eléctrico (km/kWh)',r=>(isPlugInTechnology(r[F.TECH])||r[F.TECH]==='EV')&&number(r[F.EL])?fixed(r[F.EL]):'No aplica'],
   ['Rendimiento ponderado (km/L)',r=>isPlugInTechnology(r[F.TECH])&&number(r[F.PH])?fixed(r[F.PH]):'No aplica']
  ]:[]),
  ['Costo estimado /100 km',r=>money(cost(r))],
  ['Gasto anual ('+fmt(Number($('annualKm').value))+' km)',r=>money(annualEnergy(r))],
  ['Gasto energético en 3 años',r=>money(annualEnergy(r,3))],
  ['Gasto energético en 5 años',r=>money(annualEnergy(r,5))],
  ['Emisiones directas CO₂ anual (t)',r=>co2Annual(r)===null?'Sin dato 3CV':co2Annual(r).toLocaleString('es-CL',{maximumFractionDigits:3})],
  ['Ciclo de ensayo',r=>r[F.CYCLE]],
  ['Homologación',r=>r[F.DATE]],
  ['Carrocería',r=>r[F.BODY]],
  ['Código 3CV',r=>r[F.CODE]]
 ];
 const esc=value=>safe(value===undefined||value===null||value===''?'N/D':value);
 const header='<thead><tr class="compare-row header"><th scope="col" class="compare-label">Indicador</th>'+
  vehicles.map(({index,row})=>'<th scope="col" class="compare-data compare-model-cell">'+
   '<span class="compare-model-name">'+esc(row[F.BRAND]+' '+row[F.MODEL])+'</span>'+
   '<span class="cycle-badge" data-cycle="'+esc(row[F.CYCLE])+'">'+esc(row[F.CYCLE]||'Sin ciclo')+'</span>'+
   '<button type="button" data-remove-compare="'+index+'" class="compare-remove" aria-label="Quitar '+esc(row[F.BRAND]+' '+row[F.MODEL])+' de la comparación">Quitar ×</button></th>').join('')+'</tr></thead>';
 const body='<tbody>'+dataRows.map(([title,get])=>'<tr class="compare-row"><th scope="row" class="compare-label">'+esc(title)+'</th>'+
  vehicles.map(({row})=>'<td class="compare-data">'+esc(get(row))+'</td>').join('')+'</tr>').join('')+'</tbody>';
 $('compareDialogSummary').textContent=columns+' de 5 vehículos seleccionados';
 $('compareDialogAdd').textContent=columns===MAX_COMPARE?'Cambiar un vehículo':'+ Agregar otro vehículo';
 $('compareContent').innerHTML=(mixedCycles?
  '<div class="note"><strong>Atención:</strong> aquí hay ensayos NEDC y WLTP. Se muestran juntos, pero sus cifras no son directamente equivalentes.</div>':'')+
  '<div class="compare-scroller" tabindex="0" role="region" aria-label="Tabla comparativa desplazable horizontalmente">'+
  '<table class="comparison-table" style="--compare-columns:'+columns+'">'+header+body+'</table></div>'+
  '<p class="compare-note">Costos energéticos referenciales por 100 km, no costo de propiedad ni consumo real. Para comparar rendimientos directamente, utiliza un mismo ciclo y tecnología.</p>';
 if(window.RindelabSII)window.RindelabSII.decorateComparison(vehicles);
 renderPayback(vehicles,mixedCycles);
 const scroller=$('compareContent').querySelector('.compare-scroller');
 scroller.addEventListener('scroll',syncCompareScrollControls,{passive:true});
 syncCompareScrollControls();
}
function openCompare(){
 if(selected.length<2)return;
 renderComparisonContent();
 if(!$('compareDialog').open)$('compareDialog').showModal();
 requestAnimationFrame(syncCompareScrollControls);
}
// Estadísticas independientes del catálogo: mostrar ciclo original y excluir proxies de costo PHEV/REEV.
// Grupos exclusivos derivados de las 18 denominaciones exactas de carrocería 3CV.
// «Station Wagon» no equivale a SUV comercial; «Jeep/Tipo Jeep» se agrupan aparte.
const rankingBodies={
 suv:['Station Wagon','Jeep','Tipo Jeep'],
 station:['Station Wagon'],
 offroad:['Jeep','Tipo Jeep'],
 sedan:['Sedán','Limusina'],
 hatch:['Hatchback'],
 pickup:['Camioneta'],
 sport:['Coupé','Cabriolet','Convertible','Descapotable','Roadster'],
 van:['Furgón','Van','Minivan','Microvan'],
 bus:['Bus','Minibus']
};
function rankingPerformance(row){
 return row[F.TECH]==='EV'?number(row[F.EL]):number(row[F.KM]);
}
function isPlugInTechnology(tech){return tech==='PHEV'||tech==='REEV';}
function configureStatsMetric(){
 const t=$('statsTech').value,isPlugIn=isPlugInTechnology(t),select=$('statsMetric');
 for(const option of select.options){
  if(option.value==='electric'||option.value==='weighted')option.disabled=!isPlugIn;
  if(option.value==='cost'||option.value==='performance')option.disabled=isPlugIn;
 }
 if(isPlugIn&&['cost','performance'].includes(select.value))select.value='electric';
 if(!isPlugIn&&['electric','weighted'].includes(select.value))select.value='cost';
 $('statsMetricHint').textContent=isPlugIn?
  'Para '+t+' se muestran rendimientos homologados registrados. No se calcula un costo energético combinado con datos ponderados.':
  'Costo energético estimado por 100 km. En rendimiento, selecciona una motorización: las unidades deben ser homogéneas.';
}
function rankingTitle(metric,ascending){
 const sort=ascending?'menor a mayor':'mayor a menor';
 if(metric==='cost')return 'Top 10 · costo energético ('+sort+')';
 if(metric==='performance')return 'Top 10 · rendimiento homologado ('+sort+')';
 if(metric==='electric')return 'Top 10 · rendimiento eléctrico informado ('+sort+')';
 return 'Top 10 · rendimiento ponderado informado ('+sort+')';
}
function rankingValue(row,metric){
 if(metric==='cost')return cost(row);
 if(metric==='performance')return rankingPerformance(row);
 if(metric==='electric')return number(row[F.EL]);
 if(metric==='weighted')return number(row[F.PH]);
 return null;
}
function renderStatistics(){
 const metric=$('statsMetric').value,tech=$('statsTech').value,body=$('statsBody').value,cycle=$('statsCycle').value,ascending=$('statsOrder').value==='asc';
 const note=$('statsNotice'),ranking=$('statsRanking');
 const isPerformance=metric==='performance',isElectric=metric==='electric',isWeighted=metric==='weighted';
 $('statsSummaryTitle').textContent=cycle?rankingTitle(metric,ascending):'Exploración de fichas sin ranking · NEDC y WLTP';
 $('statsSummarySubtitle').textContent=(cycle||'NEDC + WLTP')+' · '+(tech||'Todas las motorizaciones')+' · '+(body?$('statsBody').selectedOptions[0].text:'Todas las carrocerías');
 $('statsBodyHint').textContent=body==='suv'?'Agrupación exploratoria de Station Wagon, Jeep y Tipo Jeep; no equivale a una clasificación oficial de todos los SUV.':body==='station'?'El 3CV declara «Station Wagon», categoría que puede incluir modelos comercializados como SUV; no es un ranking exclusivo de SUV.':body==='offroad'?'Agrupa únicamente las carrocerías «Jeep» y «Tipo Jeep» declaradas al 3CV; no incluye todos los SUV.':'';
 ranking.replaceChildren();note.textContent='';$('statsResultCount').textContent='';
 if(!all.length){note.textContent='Cargando datos oficiales…';return;}
 if(isPerformance&&!tech){
  note.textContent='Selecciona una motorización para ordenar por rendimiento: km/L y km/kWh no son unidades equivalentes.';
  return;
 }
 if((isElectric||isWeighted)&&!isPlugInTechnology(tech)){
  note.textContent='Selecciona PHEV o REEV para revisar sus datos eléctricos o ponderados informados por 3CV.';
  return;
 }
 if(isPlugInTechnology(tech)&&metric==='cost'){
  note.textContent='No se estima un costo combinado de PHEV o REEV desde consumos ponderados. Elige rendimiento eléctrico o rendimiento ponderado, ambos disponibles en la fuente.';
  return;
 }
 // Ranking técnico de consumos homologados: excluir las fichas recientes sin precio
 // comercial de motorización coincidente. El ranking NO acredita stock físico.
 const candidate=all.filter(row=>(!tech||row[F.TECH]===tech)&&(!cycle||row[F.CYCLE]===cycle)&&(!body||(rankingBodies[body]||[]).includes(row[F.BODY])));
 const measured=candidate.filter(row=>!reviewedEnergyCodes.has(row[F.CODE])).map(row=>({row,value:rankingValue(row,metric)})).filter(entry=>entry.value!==null&&Number.isFinite(entry.value)&&entry.value>0);
 const scored=measured.filter(({row})=>!recentNoPrice(row));
 scored.sort((a,b)=>(cycle?(ascending?a.value-b.value:b.value-a.value):0)||b.row[F.DATE].localeCompare(a.row[F.DATE])||(a.row[F.BRAND]+' '+a.row[F.MODEL]).localeCompare(b.row[F.BRAND]+' '+b.row[F.MODEL],'es'));
 $('statsResultCount').textContent=fmt(measured.length)+' fichas con esta medida · recientes sin precio de motorización acreditado excluidas · stock no verificado';
 if(!scored.length){
  ranking.innerHTML='<div class="stats-empty"><strong>No hay fichas comparables en este filtro.</strong><p>Las homologaciones recientes sin precio asignado a la motorización no ingresan al ranking. Algunas tienen precios de otras versiones; el ranking no acredita stock.</p></div>';
  return;
 }
 if(metric==='cost')note.textContent=cycle?
  'Ranking de gastos energéticos estimados por 100 km solo para '+cycle+'. No considera precio de compra, mantenimiento ni depreciación; tarifas editables.':
  'Exploración documental por fecha de homologación, SIN RANKING. Los consumos NEDC y WLTP no se deben ordenar juntos.';
 if(isPerformance)note.textContent='Rendimiento homologado de una sola motorización, en '+(tech==='EV'?'km/kWh':'km/L')+'. '+(cycle?'Ciclo: '+cycle+'.':'Muestra por fecha, sin ranking: NEDC y WLTP no son directamente equivalentes.');
 if(isElectric)note.textContent='Rendimiento eléctrico informado por el 3CV (km/kWh). No constituye un costo combinado ni garantiza el rendimiento en conducción real. Los ensayos WLTP y NEDC permanecen identificados y no son directamente equivalentes.';
 if(isWeighted)note.textContent='Rendimiento ponderado informado por el 3CV (km/L). Depende del procedimiento y supuestos del ensayo, incluida la utilización de energía eléctrica; no equivale al rendimiento con batería descargada ni permite estimar un costo combinado confiable.';
 const ten=scored.slice(0,10),maxValue=Math.max(...ten.map(p=>p.value),1);
 for(let i=0;i<ten.length;i++){
  const {row,value}=ten[i],index=all.indexOf(row);
  const label=metric==='cost'?money(value):fixed(value)+(isElectric?' km/kWh':isWeighted?' km/L pond.':tech==='EV'?' km/kWh':' km/L');
  const item=document.createElement('button');item.type='button';item.className='rank-item';item.dataset.statsDetail=String(index);
  item.setAttribute('aria-label','Ver ficha de '+row[F.BRAND]+' '+row[F.MODEL]+', '+label);
  const valuesExtra=isPlugInTechnology(tech)?
   ' · Eléc. '+fixed(row[F.EL])+' km/kWh · Ponderado '+fixed(row[F.PH])+' km/L':'';
  item.innerHTML='<span class="rank-number">'+(cycle?String(i+1).padStart(2,'0'):'—')+'</span>'+
   '<span class="rank-main"><strong>'+safe(row[F.BRAND]+' '+row[F.MODEL])+'</strong>'+
   '<small>'+safe(row[F.TECH])+' · '+safe(row[F.BODY]||'Carrocería no informada')+
   ' <span class="rank-cycle" data-cycle="'+safe(row[F.CYCLE]||'')+'">'+safe(row[F.CYCLE]||'Ciclo no informado')+'</span></small>'+
   (isPlugInTechnology(tech)?'<small class="rank-metrics">'+safe(valuesExtra)+'</small>':'')+
   (reviewedEnergyCodes.has(row[F.CODE])?'<small class="energy-quality-note">Dato NEDC atípico, sujeto a revisión de fuente.</small>':'')+
   (cycle?'<span class="rank-track"><span class="rank-fill" style="width:'+Math.max(4,value/maxValue*100).toFixed(2)+'%"></span></span>':'')+'</span>'+
   '<span class="rank-value">'+safe(label)+'<span class="rank-arrow" aria-hidden="true">↗</span></span>';
  ranking.append(item);
 }
}
$('statsOpen').disabled=true;
// El enlace compartible #rankings abre el mismo panel que el botón.
function revealRankings(){if(location.hash==='#rankings'&&all.length&&!$('statsDialog').open){$('statsDialog').showModal();configureStatsMetric();renderStatistics();}}
window.addEventListener('hashchange',revealRankings);
document.querySelectorAll('[data-open-rankings]').forEach(link=>link.addEventListener('click',event=>{event.preventDefault();history.replaceState(null,'',location.pathname+location.search+'#rankings');revealRankings();}));
$('statsOpen').addEventListener('click',()=>{
 $('statsDialog').showModal();configureStatsMetric();renderStatistics();
});
$('statsClose').addEventListener('click',()=>$('statsDialog').close());
$('statsTech').addEventListener('change',()=>{configureStatsMetric();renderStatistics();});
for(const id of ['statsMetric','statsBody','statsCycle','statsOrder'])$(id).addEventListener('change',renderStatistics);
$('statsRanking').addEventListener('click',event=>{
 const button=event.target.closest('[data-stats-detail]');
 if(!button)return;
 $('statsDialog').close();showDetail(Number(button.dataset.statsDetail));
});

async function init(){
 try{
  const manifest=await fetch('../vehiculos/data/manifest.json').then(r=>{if(!r.ok)throw Error('No se pudo cargar el manifiesto 3CV');return r.json();});
  cut=manifest.published||cut;
  const files=await Promise.all(manifest.files.map(file=>fetch('../vehiculos/'+file).then(r=>{if(!r.ok)throw Error('Falta '+file);return r.json();})));
  const legacy=files.flat().filter(r=>r&&r[F.BRAND]&&r[F.MODEL]&&r[F.DATE]&&r[F.DATE]<=cut);
  if(!window.RindelabOfficialAPI)throw Error('Falta el módulo de actualización de Consumo Vehicular');
  const officialFiles=await Promise.all([1,2,3,4].map(i=>{
   const name='./data/oficial-api-20261018-'+String(i).padStart(2,'0')+'.json';
   return fetch(name).then(r=>{if(!r.ok)throw Error('No disponible '+name);return r.json();});
  }));
  const additional=window.RindelabOfficialAPI.load(officialFiles,legacy);
  for(const row of additional)officialCodes.add(row[F.CODE]);
  all=legacy.concat(additional).map(cleanRow);
  try{const r=await fetch('./sii/model-lifecycle-2026.json?v=20261021-modelos90');if(r.ok){const d=await r.json();if(d.schemaVersion===1&&Array.isArray(d.models))discontinuedModels=d.models;}}catch{/* El estado comercial no impide consultar las homologaciones oficiales. */}
  all.sort((a,b)=>b[F.DATE].localeCompare(a[F.DATE]));
  $('recordCount').textContent=fmt(all.length);
  const prices=await window.RindelabCommercial?.ready?.();
  if(!prices?.length){$('catalogScope').value='all';$('catalogScopeHint').textContent='No se pudo cargar el catálogo comercial; se presenta la base oficial 3CV completa.';}
  // Evidencia comercial externa: en fallos de red conservar la clasificación prudente.
  try{
   const response=await fetch('./data/market-status-evidence-20261022.json?v=20261022-price-audit5');
   if(!response.ok)throw Error('Evidencia comercial no disponible');
   const dataset=await response.json();
   if(dataset.schemaVersion!==1||!Array.isArray(dataset.records))throw Error('Esquema inválido');
   const next=new Map();
   for(const item of dataset.records){
    if(!item||!['upcoming','market-priced'].includes(item.kind)||
     !/^https:\/\//.test(item.sourceUrl||'')||!item.model||!item.note||
     !item.launchWindow||!/^2026-\d\d-\d\d$/.test(item.verifiedAt||''))continue;
    const key=normalize(item.model);
    if(next.has(key))throw Error('Evidencia duplicada: '+key);
    next.set(key,item);
   }
   marketEvidence=next;
  }catch(error){marketEvidence=new Map();console.warn('RINDELAB: evidencia comercial opcional no disponible',error.message);}
  // Auditoría documental de las homologaciones recientes: NO asignar precios de
  // otras versiones o motorizaciones a una ficha energética 3CV.
  try{
   const response=await fetch('./data/price-association-audit-20261022.json?v=20261022-price-audit5');
   if(!response.ok)throw Error('Auditoría 3CV no disponible');
   const dataset=await response.json();
   if(dataset.schemaVersion!==1||!Array.isArray(dataset.records)||dataset.records.length!==572)throw Error('Cantidad de fichas no coincide');
   const next=new Map();
   for(const item of dataset.records){
    if(!item?.model||!item?.homologationDate||!item?.homologationCodeSuffix||
      !['family-price-undocumented-tech','other-powertrain','expired-price-reference','unmatched-catalog'].includes(item.category))throw Error('Registro inválido');
    const key=normalize(item.model)+'|'+item.homologationDate+'|'+item.homologationCodeSuffix.toUpperCase();
    if(next.has(key))throw Error('Ficha duplicada '+key);
    next.set(key,item);
   }
   priceAssociationAudit=next;
  }catch(error){
   priceAssociationAudit=new Map();
   console.warn('RINDELAB: auditoría de conciliación no disponible; se mantiene clasificación conservadora',error.message);
  }
  // Segundo cruce: comprobación oficial de versiones comerciales y publicaciones de tres redes.
  try{
   const res=await fetch('./data/market-price-followup-20261022.json?v=20261022-followup6');
   if(!res.ok)throw Error('Segundo chequeo no disponible');
   const doc=await res.json();
   if(doc.schemaVersion!==1||!Array.isArray(doc.records)||doc.summary?.auditedHomologations!==572)throw Error('Datos no conciliables con auditoría base');
   const map=new Map();
   for(const x of doc.records){
    const k=normalize(x.model)+'|'+x.homologationDate+'|'+x.homologationCodeSuffix.toUpperCase();
    if(!priceAssociationAudit.has(k)||map.has(k)||(x.reference&&!/^https:\/\//.test(x.reference.url)))throw Error('Identidad 3CV o URL no verificable');
    map.set(k,x);
   }
   marketPriceFollowup=map;
  }catch(err){marketPriceFollowup=new Map();console.warn('RINDELAB: segundo chequeo pendiente',err.message);}
  // Tercer cruce comercial. Los importes referenciales nunca son precios asignados al código 3CV.
  try{
   const response=await fetch('./data/market-price-thirdpass-20261022.json?v=20261022-thirdpass7');
   if(!response.ok)throw Error('Tercer cruce no disponible');
   const dataset=await response.json();
   if(dataset.schemaVersion!==1||!Array.isArray(dataset.records)||dataset.summary?.baselinePending!==274)throw Error('Esquema incompatible');
   const next=new Map();
   for(const item of dataset.records){
    const key=normalize(item.model)+'|'+item.homologationDate+'|'+item.homologationCodeSuffix.toUpperCase();
    if(next.has(key)||!priceAssociationAudit.has(key)||!/^https:\/\//.test(item.reference?.url||''))throw Error('Registro de homologación o fuente inválidos');
    next.set(key,item);
   }
   if(next.size!==dataset.summary.additionalFamilyReference)throw Error('Resumen inconsistente');
   marketPriceThirdpass=next;
  }catch(error){marketPriceThirdpass=new Map();console.warn('RINDELAB: tercer cruce pendiente',error.message);}
  // Cuarto chequeo: importes de versiones comerciales, sin asignación a homologación 3CV.
  try{
   const response=await fetch('./data/market-price-final-review-20261022.json?v=20261022-finalpass8');
   if(!response.ok)throw Error('Cuarto cruce no disponible');
   const dataset=await response.json();
   if(dataset.schemaVersion!==1||!Array.isArray(dataset.records)||dataset.summary?.originalPending!==237)throw Error('Esquema inválido');
   const next=new Map();
   for(const item of dataset.records){
    const key=normalize(item.model)+'|'+item.homologationDate+'|'+item.homologationCodeSuffix.toUpperCase();
    if(next.has(key)||!priceAssociationAudit.has(key)||!/^https:\/\//.test(item.reference?.url||''))throw Error('Fuente o identidad no verificables');
    next.set(key,item);
   }
   if(next.size!==dataset.summary.additionalFamilyReferences)throw Error('Cantidad incompatible');
   marketPriceFinal=next;
  }catch(error){marketPriceFinal=new Map();console.warn('RINDELAB: cuarto chequeo pendiente',error.message);}
  // Quinto cruce: referencias verificadas de Maxus, GAC, Citroën, Audi, KYC y Foton.
  try{
   const res=await fetch('./data/market-price-fifthpass-20261022.json?v=20261022-pricepass9');
   if(!res.ok)throw Error('Quinto cruce no disponible');
   const dataset=await res.json();
   if(dataset.schemaVersion!==1||dataset.baselinePending!==227||!Array.isArray(dataset.records))throw Error('Datos incompatibles');
   const map=new Map();
   for(const r of dataset.records){
    const k=normalize(r.model)+'|'+r.homologationDate+'|'+r.homologationCodeSuffix.toUpperCase();
    if(map.has(k)||!priceAssociationAudit.has(k)||!/^https:\/\//.test(r.reference?.sourceUrl||''))throw Error('Identidad o URL comercial inválidas');
    map.set(k,r);
   }
   if(map.size!==dataset.newFamilyReferences)throw Error('Cantidad comercial inconsistente');
   marketPriceFifthpass=map;
  }catch(error){marketPriceFifthpass=new Map();console.warn('RINDELAB: quinta revisión no disponible',error.message);}
  const availableYears=[...new Set(all.map(r=>String(r[F.DATE]).slice(0,4)).filter(y=>/^20\d\d$/.test(y)))].sort().reverse();
  $('year').replaceChildren(new Option('Todo el historial',''),...availableYears.map(y=>new Option(y,y)));
  $('statsOpen').disabled=false;
  revealRankings();
  // La base MTT es opcional: un fallo de red nunca impide la búsqueda energética.
  try{
   const response=await fetch('./sii/mtt-sept-2026-may-2026-cross.json?v=20261018-mtt229-search');
   if(!response.ok)throw Error('HTTP '+response.status);
   mttRecords=prepareMTT(await response.json()).filter(item=>!officialCodes.has(item.row[F.CODE]));
   if(mttRecords.length!==1||mttRecords[0].row[F.CODE]!=='PO10585EL0726M01-9')throw Error('Brecha MTT/API inconsistente');
   mttLoadError='';
  }catch(e){
   mttRecords=[];mttLoadError='No se pudo cargar el cruce MTT; los rendimientos de mayo y octubre siguen disponibles.';
  }
  $('mttLoadNotice').hidden=!mttLoadError;
  $('mttLoadNotice').textContent=mttLoadError;
  const bodies=[{value:'__SUV_GROUP__',label:'SUV / Station Wagon / Todo terreno (agrupación 3CV)'},...[...new Set(all.map(r=>r[F.BODY]).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es')).map(value=>({value}))];
  setOptions('bodytype',bodies,'Todas las carrocerías');choices();
  $('searchButton').disabled=false;
  // Preserve direct navigation from older ficha permalinks.
  const query=new URLSearchParams(location.search),code=query.get('codigo');
  if(code){const i=all.findIndex(r=>r[F.CODE]===code);if(i>=0)showDetail(i);}
  const comparisonCodes=(query.get('comparar')||'').split(',').filter(Boolean).slice(0,MAX_COMPARE);
  if(!code&&comparisonCodes.length>=2){
   selected=[...new Set(comparisonCodes.map(c=>all.findIndex(r=>r[F.CODE]===c)).filter(i=>i>=0))];
   if(selected.length>=2){compareUpdate();openCompare();}
  }
 }catch(error){
  $('filterHint').textContent='No se pudo cargar la base oficial: '+error.message+'. Intenta actualizar la página.';
  $('searchButton').disabled=true;
 }
}
$('searchButton').disabled=true;
$('vehicleForm').addEventListener('submit',event=>{event.preventDefault();if(all.length)performSearch();});
$('resetButton').addEventListener('click',()=>{
 for(const id of ['query','brand','model','tech','bodytype','cycle','year'])$(id).value='';
 choices();$('sort').value='recent';costSortCycleNotice='';submitted=false;results=[];mttMatches=[];mttLimit=6;compareUpdate();
 $('results').hidden=true;$('mttSearchSection').hidden=true;$('sourceLegend').hidden=true;$('energyResultsHeading').hidden=true;$('suggestions').replaceChildren();$('filterHint').textContent='';
});
for(const id of ['brand','tech','bodytype','cycle','year'])$(id).addEventListener('change',()=>{
 if(id==='brand')$('model').value='';
 if(id==='cycle')costSortCycleNotice='';
 if(id!=='model')choices();
 $('filterHint').textContent='Pulsa «Buscar vehículos» para ver los resultados de esta selección.';
});
$('model').addEventListener('change',()=>{$('filterHint').textContent='Pulsa «Buscar vehículos» para ver los resultados de esta selección.';});
$('catalogScope').addEventListener('change',()=>{choices();if(submitted)performSearch({scroll:false});});
$('query').addEventListener('input',()=>{updateSuggestions();$('filterHint').textContent=$('query').value?'Pulsa «Buscar vehículos» para ver las coincidencias.':'';});
$('sort').addEventListener('change',()=>{ensureCostSortCycle();render();});

for(const id of ['gasPrice','dieselPrice','annualKm'])$(id).addEventListener('change',refreshEnergyViews);
window.addEventListener('rindelab:prices-ready',()=>{choices();if(submitted)render();if($('compareDialog').open)renderComparisonContent();});
window.addEventListener('rindelab:market-ready',()=>{choices();if(submitted)render();});
document.querySelectorAll('[data-rinde-explore]').forEach(button=>button.addEventListener('click',()=>{
 if(!all.length)return;
 for(const id of ['query','brand','model','bodytype','cycle','year'])$(id).value='';
 if(button.dataset.rindeExplore==='lowest'){$('catalogScope').value='all';$('tech').value='';$('cycle').value='WLTP';$('sort').value='cheapest';costSortCycleNotice='Orden de gasto energético limitado al ciclo WLTP; no incluye precio de compra.';}
 else{$('tech').value=button.dataset.rindeExplore;$('sort').value='recent';}
 choices();performSearch();
}));
for(const id of ['chargeScenario','publicChargeRate','homeChargeShare']){
 $(id).addEventListener('change',()=>{updateChargeScenario();refreshEnergyViews();});
}
$('homeChargeRate').addEventListener('input',()=>{
 updateChargeScenario();
 refreshEnergyViews();
});
const tariffDirectory={
 enel:{url:'https://www.enel.cl/es/clientes/tarifas-y-regulacion/tarifas.htmlSi.html',label:'Enel Distribución: documento BT1 publicado para octubre 2026. La comuna por sí sola no determina el costo completo por kWh.'},
 cge:{url:'https://www.sec.cl/contactar-distribuidora/',label:'CGE: revisa la distribuidora y las condiciones del pliego desde el directorio SEC; no se infiere una tarifa por comuna.'},
 chilquinta:{url:'https://www.sec.cl/contactar-distribuidora/',label:'Chilquinta: verifica los pliegos BT1 y la red de conexión desde las fuentes oficiales SEC.'},
 saesa:{url:'https://web.gruposaesa.cl/es/web/saesa/pago-y-boleta/tarifas-vigentes',label:'Saesa: consulta los pliegos vigentes por comuna y tipo de red; no hay precio por kWh precargado.'},
 frontel:{url:'https://web.gruposaesa.cl/web/frontel/pago-y-boleta/tarifas-vigentes',label:'Frontel: consulta los pliegos de suministro regulado en su portal oficial.'},
 otra:{url:'https://www.sec.cl/contactar-distribuidora/',label:'Otra empresa: identifica tu distribuidora y accede al pliego oficial mediante SEC.'}
};
let enelDocument=null,enelPending=null;
function updateBt1Description(){
 if(!enelDocument)return;
 const commune=$('tariffCommune').value,network=$('tariffNetwork').value,etr=$('tariffEtr').value;
 const status=$('tariffEnelStatus');
 if(!commune){status.textContent='Selecciona la comuna y revisa la RED y el tramo ETR en la boleta. No hay un precio BT1 único nacional.';return;}
 const incomplete=[!network?'tipo de RED':'',!etr?'tramo ETR':''].filter(Boolean);
 status.textContent='Pliego Enel '+enelDocument.documentMonth+' · '+commune+' · '+(network||'RED por confirmar')+' · '+(etr||'ETR por confirmar')+'. '+
  (incomplete.length?'Falta verificar '+incomplete.join(' y ')+'. ':'')+
  'La tarifa completa no está normalizada para esta combinación; abre el PDF de la distribuidora. El componente cargo por energía no representa el costo marginal de cargar.';
}
async function showBt1Directory(){
 const key=$('tariffDistributor').value,info=tariffDirectory[key],link=$('tariffSourceLink');
 $('tariffSourceDescription').textContent=info?.label||'Selecciona tu distribuidora desde la boleta. La comuna sola no basta para determinar la tarifa.';
 link.href=info?.url||'https://www.sec.cl/contactar-distribuidora/';
 link.textContent=info?'Abrir pliego o directorio oficial ↗':'Directorio de distribuidoras y tarifas SEC ↗';
 $('tariffEnelDetails').hidden=key!=='enel';
 if(key!=='enel')return;
 try{
  enelPending??=fetch('./data/tarifas-bt1-enel-oct2026.json?v=20261018-bt1oct').then(r=>{if(!r.ok)throw Error('Fuente BT1 no disponible');return r.json();});
  const doc=await enelPending;
  if(doc.schemaVersion!==1||doc.tariff!=='BT1'||doc.documentMonth!=='2026-10'||!Array.isArray(doc.coveredMunicipalities)||doc.completeMarginalRateClpPerKwh!==null)throw Error('Documento BT1 sin garantías de vigencia o tarifa');
  enelDocument=doc;
  $('tariffCommune').replaceChildren(new Option('Selecciona una comuna del pliego',''),...doc.coveredMunicipalities.map(x=>new Option(x,x)));
  $('tariffSourceLink').href=doc.officialDocumentUrl;
  $('tariffSourceLink').textContent='Abrir pliego Enel BT1 octubre 2026 (PDF) ↗';
  updateBt1Description();
 }catch(err){enelPending=null;$('tariffEnelStatus').textContent='No fue posible cargar el índice del pliego oficial: '+err.message+'. Revisa el sitio Enel desde el enlace.';}
}
$('tariffDistributor').addEventListener('change',showBt1Directory);
$('useHomeTariff').addEventListener('click',()=>{ $('chargeScenario').value='home'; updateChargeScenario(); refreshEnergyViews(); $('scenarioAdvanced').open=true; $('homeChargeRate').focus(); $('homeChargeRate').scrollIntoView({block:'center',behavior:'smooth'}); });
for(const id of ['tariffCommune','tariffNetwork','tariffEtr'])$(id).addEventListener('change',updateBt1Description);
$('calcHomeFromBill').addEventListener('click',calculateHomeFromBill);
$('chargeKwh').addEventListener('input',updateChargingExample);
$('electricPrice').addEventListener('change',()=>{
 // Un change diferido al perder foco no debe reactivar tarifa manual después de
 // seleccionar casa/mixto/público. El campo es editable solo en modo manual.
 if($('chargeScenario').value!=='manual'){
  updateChargeScenario();
  return;
 }
 updateChargeScenario();refreshEnergyViews();
});
$('resultList').addEventListener('click',event=>{
 const detail=event.target.closest('[data-detail]'),comparison=event.target.closest('[data-compare]');
 if(detail)showDetail(Number(detail.dataset.detail));
 if(comparison)selectForCompare(Number(comparison.dataset.compare));
});
$('more').addEventListener('click',()=>{limit+=10;render();});
$('suggested').addEventListener('click',event=>{
 const btn=event.target.closest('button');if(!btn)return;
 if(btn.dataset.global){for(const id of ['brand','model','tech','bodytype','cycle','year'])$(id).value='';$('catalogScope').value='all';choices();}
 else if(btn.dataset.suggestion){$('query').value=btn.dataset.suggestion;for(const id of ['brand','model','tech','bodytype','cycle','year'])$(id).value='';$('catalogScope').value='all';choices();}
 performSearch();
});
$('compareOpen').addEventListener('click',openCompare);
$('compareAdd').addEventListener('click',goAddVehicle);
$('compareDialogAdd').addEventListener('click',goAddVehicle);
$('compareSelected').addEventListener('click',event=>{
 const remove=event.target.closest('[data-remove-compare]');if(remove)selectForCompare(Number(remove.dataset.removeCompare));
});
$('compareContent').addEventListener('click',event=>{
 const remove=event.target.closest('[data-remove-compare]');if(remove)selectForCompare(Number(remove.dataset.removeCompare));
});
for(const [id,direction] of [['comparePrev',-1],['compareNext',1]]){
 $(id).addEventListener('click',()=>{
  const scroller=$('compareContent').querySelector('.compare-scroller');if(!scroller)return;
  const cells=scroller.querySelectorAll('thead .compare-data');
  const step=cells[0]?.getBoundingClientRect().width||190;
  scroller.scrollBy({left:direction*step,behavior:'smooth'});
 });
}
$('compareClear').addEventListener('click',()=>{selected=[];compareUpdate();if(submitted)render();});
$('compareClose').addEventListener('click',()=>$('compareDialog').close());
$('shareCompare').addEventListener('click',async()=>{
 if(selected.length<2)return;
 const url=new URL(location.href);
 url.searchParams.delete('codigo');
 url.searchParams.set('comparar',selected.map(i=>all[i][F.CODE]).join(','));
 const link=url.toString(),field=$('compareShareLink');
 field.hidden=false;field.value=link;field.focus();field.select();
 try{if(!navigator.clipboard?.writeText)throw Error('No clipboard');await navigator.clipboard.writeText(link);
  $('shareFeedback').textContent='Enlace copiado. Incluye los códigos de los vehículos seleccionados.';
 }catch{
  $('shareFeedback').textContent='Selecciona y copia el enlace del campo para compartir la comparación.';
 }
});
window.addEventListener('resize',syncCompareScrollControls);
$('detailClose').addEventListener('click',()=>$('detailDialog').close());
$('mobileNav').querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{$('mobileNav').open=false;}));
$('detailDialog').addEventListener('close',()=>{const url=new URL(location.href);if(url.searchParams.has('codigo')){url.searchParams.delete('codigo');history.replaceState(null,'',url.pathname+url.search+url.hash);}});
if(window.RindelabSII)window.RindelabSII.family=family;
updateChargeScenario();
updateScenarioSummary();
init();
})();