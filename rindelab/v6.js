/* RINDELAB v6 — búsqueda, resultados y comparación; sin motores de simulación paralelos */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const F={BRAND:0,MODEL:1,TECH:2,FUEL:3,BODY:4,DRIVE:5,TRANS:6,ENGINE:7,DATE:8,CODE:9,CLASS:10,CYCLE:11,KM:12,EL:13,PH:14,BAT:15,AC:16,DC:17,CO2:18,NORM:19};
const aliases={'M. Benz':'Mercedes-Benz','Ram':'RAM','LEAPMOTOR':'Leapmotor','Faw':'FAW'};
const money=n=>n===null||!Number.isFinite(n)?'Sin dato comparable':'$'+Math.round(n).toLocaleString('es-CL');
const fmt=n=>Number(n).toLocaleString('es-CL');
const safe=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();
const number=n=>n!==null&&n!==''&&Number.isFinite(Number(n))&&Number(n)>0?Number(n):null;
const fixed=n=>number(n)?Number(n).toLocaleString('es-CL',{maximumFractionDigits:2}):'N/D';
let all=[],results=[],selected=[],submitted=false,limit=10,cut='2026-05-08';
const searchIndex=new WeakMap();
function cleanRow(row){
 const r=row.slice();
 Object.defineProperty(r,'sourceBrand',{value:row[F.BRAND]});
 Object.defineProperty(r,'sourceTech',{value:row[F.TECH]});
 r[F.BRAND]=aliases[r[F.BRAND]]||r[F.BRAND];
 const name=r[F.MODEL]||'';
 if(r[F.TECH]==='Bencina'&&/\b(?:HYBRID|HIBRID[OA]|HÍBRID[OA]|E-HYBRID|HEV)\b/i.test(name)){
  const verified=/^Fiat 600 Hybrid$/i.test(r[F.BRAND]+' '+name)||/^Jeep(?: Jeep)? Avenger .*E-Hybrid$/i.test(r[F.BRAND]+' '+name);
  r[F.TECH]=verified||/\bMHEV\b|MILD[\s-]?HYBRID|\bISG\b|48V/i.test(name)?'MHEV':'Híbrido por verificar';
 }
 if(r[F.TECH]==='MHEV'&&!/ISG|MHEV|MILD[\s-]?HYBRID|48V/i.test(name))r[F.TECH]='Híbrido por verificar';
 return r;
}
function family(row){
 let name=String(row[F.MODEL]||'').trim(),brand=String(row[F.BRAND]||'').trim();
 if(name.toLowerCase().startsWith((brand+' ').toLowerCase()))name=name.slice(brand.length).trim();
 name=name.replace(/^(?:(?:All[\s-]+New|New|Nuevo|Nueva)\s+)+/i,'').trim();
 if(!name)return row[F.MODEL];
 const patterns=[
  [/^GR\s+Corolla\b/i,'GR Corolla'],[/^Corolla\s+Cross\b/i,'Corolla Cross'],
  [/^Corolla\s+(?:SD|SEDAN|SEDÁN)\b/i,'Corolla Sedán'],
  [/^Corolla\s+(?:HB|HATCHBACK)\b/i,'Corolla Hatchback'],
  [/^Yaris\s+Cross\b/i,'Yaris Cross'],[/^Land\s+Cruiser\s+Prado\b/i,'Land Cruiser Prado'],
  [/^Land\s+Cruiser\b/i,'Land Cruiser'],[/^Range\s+Rover\s+(Sport|Velar|Evoque)\b/i,null],
  [/^Range\s+Rover\b/i,'Range Rover'],[/^Discovery\s+Sport\b/i,'Discovery Sport'],
  [/^Defender\s+(90|110|130)\b/i,null],[/^Grand\s+Vitara\b/i,'Grand Vitara'],
  [/^LPM\s+(?:B10|C10)\b/i,null],[/^Avatr\s+\d+\b/i,null],
  [/^RAV4\b/i,'RAV4'],[/^Evoque\b/i,'Range Rover Evoque'],
  [/^Dolphin\s+Mini\b/i,'Dolphin Mini'],
  [/^Deepal\s+[A-Z0-9-]+\b/i,null],
  [/^Haval\s+(H6|H9|Jolion(?:\s+Pro)?|Dargo)\b/i,null],
  [/^Tiggo\s+\d+\b/i,null],[/^ATTO\s+\d+\b/i,null],
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
 return hay.words.includes(q)||hay.compact.includes(q.replace(/\s/g,''))||words.every(w=>hay.words.includes(w));
}
function inputCriteria(){
 return {q:normalize($('query').value),brand:$('brand').value,model:$('model').value,tech:$('tech').value,body:$('bodytype').value,cycle:$('cycle').value,year:$('year').value};
}
function matchesFilters(row,f){
 return (!f.brand||row[F.BRAND]===f.brand)&&(!f.model||normalize(family(row))===f.model)&&
  (!f.tech||row[F.TECH]===f.tech)&&(!f.body||row[F.BODY]===f.body)&&
  (!f.cycle||row[F.CYCLE]===f.cycle)&&(!f.year||row[F.DATE].slice(0,4)>=f.year);
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
 const t=$('tech').value,body=$('bodytype').value,cycle=$('cycle').value,year=$('year').value;
 const pool=all.filter(r=>(!t||r[F.TECH]===t)&&(!body||r[F.BODY]===body)&&(!cycle||r[F.CYCLE]===cycle)&&(!year||r[F.DATE].slice(0,4)>=year));
 const brands=[...new Set(pool.map(r=>r[F.BRAND]))].sort((a,b)=>a.localeCompare(b,'es')).map(x=>({value:x}));
 const brandCleared=setOptions('brand',brands,'Todas las marcas');
 const activeBrand=$('brand').value;
 const modelSelect=$('model');
 if(!activeBrand){modelSelect.disabled=true;modelSelect.replaceChildren(new Option('Primero selecciona una marca',''));}
 else{
  const families=new Map();
  for(const r of pool){if(r[F.BRAND]!==activeBrand)continue;const label=family(r),k=normalize(label);if(!k)continue;families.set(k,label);}
  const items=[...families].sort((a,b)=>a[1].localeCompare(b[1],'es',{numeric:true})).map(([value,label])=>({value,label}));
  setOptions('model',items,'Todos los modelos');modelSelect.disabled=!items.length;
 }
 if(brandCleared)$('filterHint').textContent='La marca seleccionada no tiene versiones con esos filtros; se restableció la marca.';
}
function updateSuggestions(){
 const q=normalize($('query').value),box=$('suggestions');
 if(q.length<2){box.replaceChildren();return;}
 const hit=[],seen=new Set();
 for(const r of all){
  const label=r[F.BRAND]+' '+family(r),k=normalize(label);
  if((k.includes(q)||k.replace(/\s/g,'').includes(q.replace(/\s/g,'')))&&!seen.has(k)){
   hit.push(new Option('',label));seen.add(k);if(hit.length===12)break;
  }
 }
 box.replaceChildren(...hit);
}
function cost(row){
 const t=row[F.TECH];
 if(t==='PHEV'||t==='REEV'||t==='Híbrido por verificar')return null;
 if(t==='EV'){const k=number(row[F.EL]),price=number($('electricPrice').value);return k&&price?100/k*price:null;}
 const k=number(row[F.KM]),price=number($(t==='Diésel'||row[F.FUEL]==='Diésel'?'dieselPrice':'gasPrice').value);
 return k&&price?100/k*price:null;
}
function metric(row){
 const t=row[F.TECH];
 if(t==='EV')return number(row[F.EL])?fixed(row[F.EL])+' km/kWh':'No informado';
 if(t==='PHEV'||t==='REEV'){
  const portions=[];
  if(number(row[F.PH]))portions.push(fixed(row[F.PH])+' km/L ponderado');
  if(number(row[F.EL]))portions.push(fixed(row[F.EL])+' km/kWh ponderado');
  return portions.join(' · ')||'No informado';
 }
 return number(row[F.KM])?fixed(row[F.KM])+' km/L mixto':'No informado';
}
function sortRows(rows,sort){
 const copy=[...rows];const cmpCost=(a,b)=>{const x=cost(a),y=cost(b);if(x===null)return y===null?0:1;if(y===null)return -1;return sort==='cheapest'?x-y:y-x;};
 if(sort==='name')copy.sort((a,b)=>(a[F.BRAND]+' '+a[F.MODEL]).localeCompare(b[F.BRAND]+' '+b[F.MODEL],'es'));
 else if(sort==='recent')copy.sort((a,b)=>b[F.DATE].localeCompare(a[F.DATE]));
 else if(sort==='cheapest'||sort==='expensive'){
  // Una sola lista global por costo. El ciclo permanece visible en cada ficha;
  // el orden no implica equivalencia experimental NEDC/WLTP.
  copy.sort((a,b)=>cmpCost(a,b)||b[F.DATE].localeCompare(a[F.DATE]));
 }
 return copy;
}
function textSuggestions(criteria){
 const box=$('suggested');box.replaceChildren();box.hidden=true;
 if(!criteria.q||results.length)return;
 // If the query exists but another facet hides it, offer a one-click global query.
 const global=all.filter(r=>matchesText(r,criteria.q));
 if(global.length){
  const button=document.createElement('button');button.type='button';button.textContent='Buscar '+fmt(global.length)+' coincidencias sin filtros';button.dataset.global='true';
  box.append('Hay coincidencias fuera de tus filtros. ',button);box.hidden=false;return;
 }
 const options=new Map();
 for(const row of all){
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
function render(){
 if(!submitted)return;
 const sorted=sortRows(results,$('sort').value),visible=sorted.slice(0,limit),sort=$('sort').value;
 $('resultCount').textContent=fmt(results.length)+' '+(results.length===1?'versión encontrada':'versiones encontradas');
 $('emptyState').hidden=!!results.length;
 if(!results.length)$('emptyState').innerHTML='<strong>Sin coincidencias</strong>Prueba con otra marca, modelo o quita un filtro técnico.';
 $('sortNote').hidden=!['cheapest','expensive'].includes(sort);
 if(!$('sortNote').hidden)$('sortNote').textContent='Orden único por costo estimado. Cada ficha indica WLTP o NEDC: son ensayos distintos y sus resultados no son directamente equivalentes. Los precios de energía son referenciales.';
 const list=$('resultList');list.replaceChildren();
 for(const row of visible){
  const index=all.indexOf(row),article=document.createElement('article');article.className='vehicle-card';
  const selectedNow=selected.includes(index);
  article.innerHTML='<div class="vehicle-heading"><h3>'+safe(row[F.BRAND]+' '+row[F.MODEL])+'</h3>'+
   '<div class="vehicle-badges"><span class="vehicle-tech" data-tech="'+safe(row[F.TECH])+'">'+safe(row[F.TECH])+'</span><span class="cycle-badge" data-cycle="'+safe(row[F.CYCLE]||'')+'">'+safe(row[F.CYCLE]||'Ciclo no informado')+'</span></div><p>Homologación '+safe(row[F.DATE]||'sin fecha')+'</p></div>'+
   '<div class="vehicle-cell"><small>Rendimiento oficial</small><strong>'+safe(metric(row))+'</strong></div>'+
   '<div class="vehicle-cell"><small>Costo estimado /100 km</small><strong'+(cost(row)===null?' class="no-data"':'')+'>'+safe(money(cost(row)))+'</strong></div>'+
   '<div class="vehicle-actions"><button type="button" class="button secondary" data-detail="'+index+'">Ver ficha</button>'+
   '<button type="button" class="button '+(selectedNow?'primary':'secondary')+'" data-compare="'+index+'" aria-pressed="'+selectedNow+'">'+(selectedNow?'Quitar':'Comparar +')+'</button></div>';
  list.append(article);
 }
 $('more').hidden=limit>=results.length;
}
function performSearch({scroll=true}={}){
 const criteria=inputCriteria();
 results=all.filter(r=>matchesText(r,criteria.q)&&matchesFilters(r,criteria));
 submitted=true;limit=10;
 $('results').hidden=false;
 $('filterHint').textContent='';
 render();textSuggestions(criteria);
 if(scroll)$('results').scrollIntoView({block:'start',behavior:'instant'});
}
function showDetail(i){
 const r=all[i];if(!r)return;
 $('detailTitle').textContent=r[F.BRAND]+' '+r[F.MODEL];
 const items=[
  ['Marca de origen 3CV',r.sourceBrand],['Modelo y versión',r[F.MODEL]],
  ['Motorización declarada 3CV',r.sourceTech],['Clasificación para filtros',r[F.TECH]],
  ['Combustible',r[F.FUEL]],['Carrocería',r[F.BODY]],['Tracción',r[F.DRIVE]],
  ['Transmisión',r[F.TRANS]],['Cilindrada',r[F.ENGINE]],
  ['Ciclo de homologación',r[F.CYCLE]],['Fecha de homologación',r[F.DATE]],
  ['Código 3CV',r[F.CODE]],['Rendimiento oficial',metric(r)],
  ['Costo energético estimado/100 km',money(cost(r))],
  ['Batería (kWh)',r[F.BAT]],['Conector AC',r[F.AC]],['Conector DC',r[F.DC]],
  ['CO₂ (g/km)',r[F.CO2]],['Norma de emisiones',r[F.NORM]]
 ];
 $('detailContent').innerHTML='<p class="note">Datos de homologación, no un rendimiento medido en ruta ni una oferta de venta. Los costos usan los precios editables de Metodología y fuentes.</p>'+
  '<dl class="details-list">'+items.map(([k,v])=>'<dt>'+safe(k)+'</dt><dd>'+safe(v===null||v===''?'N/D':v)+'</dd>').join('')+'</dl>';
 $('detailDialog').showModal();
}
const MAX_COMPARE=5;
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
function renderComparisonContent(){
 const vehicles=selected.map(i=>({index:i,row:all[i]})).filter(x=>x.row);
 if(vehicles.length<2)return;
 const uniqueCycles=new Set(vehicles.map(x=>x.row[F.CYCLE]).filter(Boolean));
 const mixedCycles=uniqueCycles.size>1;
 const columns=vehicles.length;
 const dataRows=[
  ['Motorización',r=>r[F.TECH]],
  ['Rendimiento oficial',r=>metric(r)],
  ['Costo estimado /100 km',r=>money(cost(r))],
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
 $('compareScrollHint').hidden=false;
}
function openCompare(){
 if(selected.length<2)return;
 renderComparisonContent();
 if(!$('compareDialog').open)$('compareDialog').showModal();
}
// Estadísticas independientes del catálogo: rankings homogéneos por ciclo, sin proxies para PHEV/REEV.
const rankingBodies={
 sw:['Station Wagon','Jeep','Tipo Jeep'],
 sedan:['Sedán','Limusina'],
 hatch:['Hatchback'],
 pickup:['Camioneta'],
 sport:['Coupé','Cabriolet','Convertible','Descapotable','Roadster'],
 van:['Furgón','Van','Minivan','Microvan'],
 bus:['Bus','Minibus']
};
function rankingPerformance(row){
 const t=row[F.TECH];
 if(['PHEV','REEV','Híbrido por verificar'].includes(t))return null;
 return t==='EV'?number(row[F.EL]):number(row[F.KM]);
}
function rankingTitle(metric,ascending){
 if(metric==='cost')return ascending?'Top 10 · menor costo energético':'Top 10 · mayor costo energético';
 return ascending?'Top 10 · menor rendimiento':'Top 10 · mayor rendimiento';
}
function renderStatistics(){
 const metric=$('statsMetric').value,tech=$('statsTech').value,body=$('statsBody').value,cycle=$('statsCycle').value,ascending=$('statsOrder').value==='asc';
 const note=$('statsNotice'),ranking=$('statsRanking');
 const isPerformance=metric==='performance';
 $('statsSummaryTitle').textContent=rankingTitle(metric,ascending);
 const cycleLabel=(cycle||'NEDC + WLTP')+' · '+(tech||'Todas las motorizaciones')+' · '+(body?$('statsBody').selectedOptions[0].text:'Todas las carrocerías');
 $('statsSummarySubtitle').textContent=cycleLabel;
 ranking.replaceChildren();
 note.textContent='';
 $('statsResultCount').textContent='';
 if(!all.length){note.textContent='Cargando datos oficiales…';return;}
 if(isPerformance&&(!tech||['PHEV','REEV','Híbrido por verificar'].includes(tech))){
  note.textContent='Para ordenar rendimiento, elige una motorización Bencina, Diésel, MHEV, HEV o EV. Los km/L y km/kWh no son equivalentes; los rendimientos ponderados PHEV/REEV no permiten un ranking comparable por modo.';
  return;
 }
 const candidate=all.filter(row=>(!tech||row[F.TECH]===tech)&&(!cycle||row[F.CYCLE]===cycle)&&(!body||(rankingBodies[body]||[]).includes(row[F.BODY])));
 const scored=candidate.map(row=>({row,value:isPerformance?rankingPerformance(row):cost(row)})).filter(entry=>entry.value!==null&&Number.isFinite(entry.value)&&entry.value>0);
 scored.sort((a,b)=>(ascending?a.value-b.value:b.value-a.value)||b.row[F.DATE].localeCompare(a.row[F.DATE])||(a.row[F.BRAND]+' '+a.row[F.MODEL]).localeCompare(b.row[F.BRAND]+' '+b.row[F.MODEL],'es'));
 $('statsResultCount').textContent=fmt(scored.length)+' fichas comparables';
 if(!scored.length){
  ranking.innerHTML='<div class="stats-empty"><strong>No hay registros comparables con estos filtros.</strong><p>Prueba otro ciclo, carrocería o motorización.</p></div>';return;
 }
 if(metric==='cost')note.textContent='Ranking único de costos energéticos estimados. Cada vehículo indica su ciclo (WLTP o NEDC). Los ensayos no son directamente equivalentes y pueden existir distintas motorizaciones; el orden es orientativo, no una comparación técnica homogénea. Precios referenciales editables.';
 if(isPerformance)note.textContent='Ranking orientativo dentro de una sola motorización, en '+(tech==='EV'?'km/kWh':'km/L')+'. '+(cycle?'Ciclo seleccionado: '+cycle+'.':'Incluye NEDC y WLTP identificados por vehículo; los ensayos no son directamente equivalentes.')+' Las diferencias de carrocería, peso y uso también pueden afectar las cifras.';
 const ten=scored.slice(0,10),maxValue=Math.max(...ten.map(p=>p.value),1);
 for(let i=0;i<ten.length;i++){
  const {row,value}=ten[i],index=all.indexOf(row);
  const label=metric==='cost'?money(value):(fixed(value)+(tech==='EV'?' km/kWh':' km/L'));
  const item=document.createElement('button');item.type='button';item.className='rank-item';item.dataset.statsDetail=String(index);
  item.setAttribute('aria-label','Ver ficha de '+row[F.BRAND]+' '+row[F.MODEL]+', '+label);
  item.innerHTML='<span class="rank-number">'+String(i+1).padStart(2,'0')+'</span>'+
   '<span class="rank-main"><strong>'+safe(row[F.BRAND]+' '+row[F.MODEL])+'</strong>'+
   '<small>'+safe(row[F.TECH])+' · '+safe(row[F.BODY]||'Carrocería no informada')+' <span class="rank-cycle" data-cycle="'+safe(row[F.CYCLE]||'')+'">'+safe(row[F.CYCLE]||'Ciclo no informado')+'</span></small>'+
   '<span class="rank-track"><span class="rank-fill" style="width:'+Math.max(4,value/maxValue*100).toFixed(2)+'%"></span></span></span>'+
   '<span class="rank-value">'+safe(label)+'<span class="rank-arrow" aria-hidden="true">↗</span></span>';
  ranking.append(item);
 }
}
$('statsOpen').disabled=true;
$('statsOpen').addEventListener('click',()=>{
 $('statsDialog').showModal();renderStatistics();
});
$('statsClose').addEventListener('click',()=>$('statsDialog').close());
for(const id of ['statsMetric','statsTech','statsBody','statsCycle','statsOrder'])$(id).addEventListener('change',renderStatistics);
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
  all=files.flat().filter(r=>r&&r[F.BRAND]&&r[F.MODEL]&&r[F.DATE]&&r[F.DATE]<=cut).map(cleanRow);
  all.sort((a,b)=>b[F.DATE].localeCompare(a[F.DATE]));
  $('recordCount').textContent=fmt(all.length);
  $('statsOpen').disabled=false;
  const bodies=[...new Set(all.map(r=>r[F.BODY]).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es')).map(value=>({value}));
  setOptions('bodytype',bodies,'Todas las carrocerías');choices();
  $('searchButton').disabled=false;
  // Preserve direct navigation from older ficha permalinks.
  const code=new URLSearchParams(location.search).get('codigo');
  if(code){const i=all.findIndex(r=>r[F.CODE]===code);if(i>=0)showDetail(i);}
 }catch(error){
  $('filterHint').textContent='No se pudo cargar la base oficial: '+error.message+'. Intenta actualizar la página.';
  $('searchButton').disabled=true;
 }
}
$('searchButton').disabled=true;
$('vehicleForm').addEventListener('submit',event=>{event.preventDefault();if(all.length)performSearch();});
$('resetButton').addEventListener('click',()=>{
 for(const id of ['query','brand','model','tech','bodytype','cycle','year'])$(id).value='';
 choices();$('sort').value='recent';submitted=false;results=[];compareUpdate();
 $('results').hidden=true;$('suggestions').replaceChildren();$('filterHint').textContent='';
});
for(const id of ['brand','tech','bodytype','cycle','year'])$(id).addEventListener('change',()=>{
 if(id==='brand')$('model').value='';
 if(id!=='model')choices();
 $('filterHint').textContent='Pulsa «Buscar vehículos» para ver los resultados de esta selección.';
});
$('model').addEventListener('change',()=>{$('filterHint').textContent='Pulsa «Buscar vehículos» para ver los resultados de esta selección.';});
$('query').addEventListener('input',()=>{updateSuggestions();$('filterHint').textContent=$('query').value?'Pulsa «Buscar vehículos» para ver las coincidencias.':'';});
$('sort').addEventListener('change',render);
for(const id of ['gasPrice','dieselPrice','electricPrice'])$(id).addEventListener('change',()=>{if(submitted)render();if($('statsDialog').open)renderStatistics();if($('compareDialog').open)renderComparisonContent();});
$('resultList').addEventListener('click',event=>{
 const detail=event.target.closest('[data-detail]'),comparison=event.target.closest('[data-compare]');
 if(detail)showDetail(Number(detail.dataset.detail));
 if(comparison)selectForCompare(Number(comparison.dataset.compare));
});
$('more').addEventListener('click',()=>{limit+=10;render();});
$('suggested').addEventListener('click',event=>{
 const btn=event.target.closest('button');if(!btn)return;
 if(btn.dataset.global){for(const id of ['brand','model','tech','bodytype','cycle','year'])$(id).value='';choices();}
 else if(btn.dataset.suggestion){$('query').value=btn.dataset.suggestion;for(const id of ['brand','model','tech','bodytype','cycle','year'])$(id).value='';choices();}
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
$('detailClose').addEventListener('click',()=>$('detailDialog').close());
$('detailDialog').addEventListener('close',()=>{const url=new URL(location.href);if(url.searchParams.has('codigo')){url.searchParams.delete('codigo');history.replaceState(null,'',url.pathname+url.search+url.hash);}});
init();
})();