/* RINDELAB v2 | Fuente pública 3CV (mayo 2026) | Indicadores trazables */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const F={BRAND:0,MODEL:1,TECH:2,FUEL:3,BODY:4,DRIVE:5,TRANS:6,ENGINE:7,DATE:8,CODE:9,CLASS:10,CYCLE:11,KM:12,EL:13,PH:14,BAT:15,AC:16,DC:17,CO2:18,NORM:19,CITY:20,ROAD:21};
const VALID=['Bencina','Diésel','MHEV','HEV','PHEV','REEV','EV','Híbrido por verificar'];
const tariffs={ac22:{cityValley:340,cityPeak:395,road:395},dc50:{cityValley:395,cityPeak:450,road:450},dc120:{cityValley:440,cityPeak:495,road:495}};
const defaults={p93:1535,p95:1572,p97:1613,diesel:1503,customKwh:'',losses:'0',octane:'p93',charge:'ac22',zone:'city',period:'valley',annualKm:15000};
let all=[],filtered=[],selected=[],page=0,loading=true,validDate='2026-05-08';
const pageSize=25;
const safe=s=>String(s===null||s===undefined?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const number=n=>n!==null&&n!==''&&Number.isFinite(Number(n))?Number(n):null;
const positive=n=>number(n)>0?number(n):null;
const fmt=n=>Math.round(n).toLocaleString('es-CL');
const cash=n=>Number.isFinite(n)?'$'+fmt(n):'N/D';
const fixed=n=>positive(n)?Number(n).toLocaleString('es-CL',{maximumFractionDigits:2}):'N/D';
const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
/* Búsqueda global: elimina tildes y separadores, maneja marcas abreviadas y variantes de modelo. */
const normalizeSearch=s=>normalize(s).replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();
const searchCache=new WeakMap();
function searchDocument(r){
 let saved=searchCache.get(r);if(saved)return saved;
 const brand=String(r[F.BRAND]||''),model=String(r[F.MODEL]||'');
 const aliases=[];
 if(/^(M\.?\s*Benz|Mercedes[\s-]?Benz)$/i.test(brand))aliases.push('mercedes benz mercedes-benz mercedes');
 if(/^(Great Wall|GWM)$/i.test(brand))aliases.push('gwm great wall haval');
 if(/^Leapmotor$/i.test(brand))aliases.push('leap motor leapmotor');
 if(/\bF[\s-]?150\b/i.test(model))aliases.push('f150 f-150 f 150');
 if(/\bCR[\s-]?V\b/i.test(model))aliases.push('crv cr-v');
 if(/\bRAV[\s-]?4\b/i.test(model))aliases.push('rav4 rav 4');
 const normalized=normalizeSearch([brand,model,r[F.CODE],r[F.TECH],...aliases].join(' '));
 saved={normalized,compact:normalized.replace(/\s+/g,'')};
 searchCache.set(r,saved);
 return saved;
}
function searchMatches(r,query){
 const words=normalizeSearch(query).split(' ').filter(Boolean);
 if(!words.length)return true;
 const record=searchDocument(r),phrase=words.join(' '),compact=words.join('');
 return record.normalized.includes(phrase)||record.compact.includes(compact)||words.every(word=>record.normalized.includes(word));
}
function searchRelevance(r,query){
 const phrase=normalizeSearch(query),compact=phrase.replace(/\s+/g,'');
 const record=searchDocument(r),head=normalizeSearch(r[F.BRAND]+' '+r[F.MODEL]);
 if(head===phrase)return 0;
 if(head.startsWith(phrase))return 1;
 if(record.normalized.includes(phrase))return 2;
 if(record.compact.includes(compact))return 3;
 return 4;
}
const brandAlias={'M. Benz':'Mercedes-Benz','RAM':'RAM','Ram':'RAM','LEAPMOTOR':'Leapmotor','Leapmotor':'Leapmotor','Faw':'FAW','FAW':'FAW'};
function cleanRecord(source){
 const r=source.slice();r[F.BRAND]=brandAlias[r[F.BRAND]]||r[F.BRAND];
 const name=r[F.MODEL]||'';
 if(r[F.TECH]==='Bencina'&&/\b(?:HYBRID|HIBRID[OA]|HÍBRID[OA]|E-HYBRID|HEV)\b/i.test(name)){
   // Fiat 600 Hybrid y Jeep Avenger E-Hybrid corroborados por documentación de fabricante.
   // Para otros nombres "Hybrid" sin ficha revisada no se infiere HEV ni MHEV.
   const verifiedMhev=/^Fiat 600 Hybrid$/i.test(r[F.BRAND]+' '+name)||/^Jeep(?: Jeep)? Avenger .*E-Hybrid$/i.test(r[F.BRAND]+' '+name);
   r[F.TECH]=verifiedMhev||/\bMHEV\b|MILD[\s-]?HYBRID|\bISG\b|48V/i.test(name)?'MHEV':'Híbrido por verificar';
 }
 if(r[F.TECH]==='MHEV' && !/ISG|MHEV|MILD[\s-]?HYBRID|48V/i.test(name)){
   r[F.TECH]='Híbrido por verificar';
 }
 return r;
}
const fuelCost=()=>Math.max(0,Number($( $('octane').value)?.value)||0);
const dieselCost=()=>Math.max(0,Number($('diesel').value)||0);
function energyPrice(){
 const manual=positive($('customKwh').value);
 if(manual)return manual;
 const group=tariffs[$('charge').value]||tariffs.ac22;
 const zone=$('zone').value==='road'?'road':$('period').value==='peak'?'cityPeak':'cityValley';
 return group[zone];
}
const overhead=()=>1+Math.max(0,Number($('losses').value)||0)/100;
const elecPrice=()=>energyPrice()*overhead();
function dcCompatible(r){
 if($('charge').value==='ac22')return true;
 const connection=String(r[F.DC]||'').toLowerCase();
 return /ccs|combinado|combo|chademo|gb\/t|gbt|dc/.test(connection);
}
function cost(r){
 const t=r[F.TECH],electric=positive(r[F.EL]),mixed=positive(r[F.KM]),ponderedFuel=positive(r[F.PH]);
 if(t==='EV'){
  const base=electric&&dcCompatible(r)?100/electric*elecPrice():null;
  return {base,electricReference:base,fuelReference:null,mode:'EV',supported:dcCompatible(r)};
 }
 if(t==='PHEV'||t==='REEV'){
  return {base:null,electricReference:electric&&dcCompatible(r)?100/electric*elecPrice():null,
   fuelReference:ponderedFuel?100/ponderedFuel*fuelCost():null,mode:'Ponderado',supported:dcCompatible(r)};
 }
 if(t==='Híbrido por verificar')return {base:null,electricReference:null,fuelReference:null,mode:'Por verificar',supported:true};
 const litre=r[F.FUEL]==='Diésel'||t==='Diésel'?dieselCost():fuelCost();
 return {base:mixed?100/mixed*litre:null,electricReference:null,fuelReference:null,mode:r[F.FUEL]||'Combustible',supported:true};
}
function rateDescription(){
 const labels={ac22:'AC ≤22 kW',dc50:'DC 50 kW',dc120:'DC ≥120 kW'};
 const zone=$('zone').value==='road'?'carretera':$('period').value==='valley'?'ciudad valle':'ciudad punta';
 const manual=positive($('customKwh').value);
 return (manual?'Tarifa manual':labels[$('charge').value]+' · '+zone)+' · $'+fmt(energyPrice())+'/kWh';
}
function setTariff(){
 $('activeTariff').textContent=rateDescription();
 $('lossDescription').textContent='Costo calculado con '+fixed(energyPrice())+' $/kWh y un '+$('losses').value+' % adicional supuesto por recarga; sin cobros por tiempo, estacionamiento ni penalizaciones.';
}
function metric(r){
 const out=[],t=r[F.TECH],n=positive(r[F.KM]),el=positive(r[F.EL]),pf=positive(r[F.PH]);
 if((t==='EV')&&el)out.push(fixed(el)+' km/kWh eléctrico');
 else if(t==='PHEV'||t==='REEV'){
  if(el)out.push(fixed(el)+' km/kWh ponderado');
  if(pf)out.push(fixed(pf)+' km/L ponderado');
 }else if(n)out.push(fixed(n)+' km/L mixto');
 return out.join(' · ')||'No informado';
}
function warningRow(r){
 const t=r[F.TECH];
 return t==='PHEV'||t==='REEV'?'Los rendimientos de etiqueta son ponderados: no equivalen a consumo eléctrico puro ni a combustible con batería descargada.':t==='Híbrido por verificar'?'Propulsión sin clasificación HEV/MHEV validada: se omite costo hasta revisarla.':null;
}
function fillSelect(id,idx){
 const current=$(id).value;
 const values=[...new Set(all.map(r=>r[idx]).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es'));
 $(id).innerHTML=$(id).options[0].outerHTML+values.map(x=>'<option value="'+safe(x)+'">'+safe(x)+'</option>').join('');
 if(values.includes(current))$(id).value=current;
}
function filters(){
 const raw=$('search').value.trim(),t=$('tech').value,b=$('brand').value,body=$('bodytype').value,cycle=$('cycle').value,year=$('year').value;
 const query=normalizeSearch(raw);
 const candidates=all.filter(r=>searchMatches(r,query));
 filtered=candidates.filter(r=>(!t||r[F.TECH]===t)&&(!b||r[F.BRAND]===b)&&(!body||r[F.BODY]===body)&&(!cycle||r[F.CYCLE]===cycle)&&(!year||r[F.DATE].slice(0,4)>=year));
 const hidden=candidates.length>0&&filtered.length===0;
 const contextActive=Boolean(t||b||body||cycle||year);
 $('searchStatus').textContent=query?(
  hidden?'Se encontraron '+fmt(candidates.length)+' coincidencias en la base, pero los filtros activos las están ocultando.':
  filtered.length?fmt(filtered.length)+' coincidencias para «'+raw+'»'+(contextActive?' dentro de los filtros seleccionados.': ' en todo el catálogo histórico.'):
  'No se encontró «'+raw+'» en la base 3CV. Intenta con otra marca, modelo o escritura.'
 ):'Busca por marca o modelo entre '+fmt(all.length)+' homologaciones históricas, incluidos NEDC y WLTP.';
 $('showAllSearch').hidden=!(query&&hidden);
 $('search').setAttribute('aria-invalid',query&&hidden?'true':'false');
 let sort=$('sort').value;
 const canRank=t&&cycle&&!['PHEV','REEV','Híbrido por verificar'].includes(t);
 if(!canRank&&(sort==='cheapest'||sort==='expensive')){
  $('sort').value='recent';sort='recent';
  $('sortWarning').textContent='Para ordenar por costo, selecciona una sola tecnología con consumo no ponderado y un ciclo de ensayo.';
 }else $('sortWarning').textContent='';
 if(sort==='recent'){
  filtered.sort((a,b)=>{
   const relevance=query?searchRelevance(a,query)-searchRelevance(b,query):0;
   return relevance||b[F.DATE].localeCompare(a[F.DATE]);
  });
 }
 if(sort==='name')filtered.sort((a,b)=>(a[F.BRAND]+' '+a[F.MODEL]).localeCompare(b[F.BRAND]+' '+b[F.MODEL],'es'));
 if(sort==='cheapest'||sort==='expensive'){
  filtered.sort((a,b)=>{
   const c=cost(a).base,d=cost(b).base;
   if(c===null)return d===null?0:1;
   if(d===null)return -1;
   return sort==='cheapest'?c-d:d-c;
  });
 }
 page=0;render();
}
function rowCost(r){
 const p=cost(r),t=r[F.TECH];
 if(t==='PHEV'||t==='REEV'){
  return '<span class="pill pill-warn">Sin costo por modo validado</span><div class="subline">Ver referencias ponderadas en ficha</div>';
 }
 if(t==='Híbrido por verificar')return '<span class="pill pill-warn">Revisar tecnología</span>';
 if(p.base===null)return '<span class="subline">'+(t==='EV'&&!p.supported?'Sin carga DC verificada':'Dato no disponible')+'</span>';
 return '<span class="cost">'+cash(p.base)+'</span><div class="subline">Estimación energética/100 km</div>';
}
function cardInfo(r){
 const p=cost(r), t=r[F.TECH],info=[
  ['Ciclo',r[F.CYCLE]],['Fecha homologación',r[F.DATE]],['Rendimiento de etiqueta',metric(r)],['Código 3CV',r[F.CODE]],
  ['Carrocería',r[F.BODY]],['Octanaje',t==='Diésel'?'No aplica':'No verificado por versión'],
  ['Costo por 100 km',p.base===null?'No comparable / no disponible':cash(p.base)],
  ['Costo anual (escenario)',p.base===null?'No estimable':cash(p.base*(Math.max(0,Number($('annualKm').value)||0)/100))]
 ];
 return '<article class="cmp"><span class="flag '+safe(t.toLowerCase())+'">'+safe(t)+'</span><h3>'+safe(r[F.BRAND]+' '+r[F.MODEL])+'</h3>'+
 '<div class="big">'+(p.base===null?'No estimable':cash(p.base))+'</div><span class="subline">Escenario de energía cada 100 km</span>'+
 info.map(x=>'<div class="meta"><strong>'+safe(x[0])+': </strong>'+safe(x[1])+'</div>').join('')+
 (warningRow(r)?'<p class="warning-copy">'+safe(warningRow(r))+'</p>':'')+
 '<button class="button" data-compare="'+all.indexOf(r)+'">Quitar</button></article>';
}
function render(){
 $('sTotal').textContent=fmt(filtered.length);
 $('sBrands').textContent=fmt(new Set(filtered.map(r=>r[F.BRAND])).size);
 $('sWLTP').textContent=fmt(filtered.filter(r=>r[F.CYCLE]==='WLTP').length);
 $('sCompare').textContent=selected.length+'/4';
 $('resultInfo').textContent=fmt(filtered.length)+' homologaciones en filtros · fecha oficial de base '+validDate+' · no equivale a inventario vigente.';
 $('cyclePill').textContent=$('cycle').value||'NEDC / WLTP';
 $('heroTotal').textContent=fmt(all.length);
 $('yearNote').textContent='Se muestra desde '+($('year').value||'el inicio de la base')+' y ciclo '+($('cycle').value||'mixto: no comparar entre ciclos')+'.';
 setTariff();
 const start=page*pageSize,sub=filtered.slice(start,start+pageSize);
 $('tbody').innerHTML=sub.length?sub.map(r=>{
  const idx=all.indexOf(r),t=r[F.TECH],checked=selected.includes(idx);
  return '<tr>'+
   '<td data-label="Modelo"><div class="model">'+safe(r[F.BRAND])+'</div><div>'+safe(r[F.MODEL])+'</div><div class="date">'+safe(r[F.BODY]||'')+'</div></td>'+
   '<td data-label="Tecnología"><span class="flag '+safe(t.toLowerCase())+'">'+safe(t)+'</span><div class="subline">'+safe(r[F.FUEL]||'')+'</div></td>'+
   '<td data-label="Homologación"><span class="pill">'+safe(r[F.CYCLE])+'</span><div class="date">'+safe(r[F.DATE])+'</div></td>'+
   '<td data-label="Rendimiento"><span class="metric-content">'+safe(metric(r))+'</span></td>'+
   '<td data-label="Costo por 100 km">'+rowCost(r)+'</td>'+
   '<td data-label="Acciones"><button class="mini-btn" data-detail="'+idx+'">Ver ficha</button><button class="mini-btn" data-compare="'+idx+'">'+(checked?'Quitar del comparador':'Comparar +')+'</button></td>'+
  '</tr>';
 }).join(''):'<tr><td colspan="6"><div class="empty">No se encontraron versiones. Revisa filtros y ciclo de ensayo.</div></td></tr>';
 const count=Math.max(1,Math.ceil(filtered.length/pageSize));
 $('pageInfo').textContent=filtered.length?'Mostrando '+fmt(start+1)+'–'+fmt(Math.min(filtered.length,start+pageSize))+' de '+fmt(filtered.length):'Sin registros';
 $('pagenum').textContent=(page+1)+' de '+count;
 $('prev').disabled=page===0;$('next').disabled=page+1>=count;
 $('comparison').innerHTML=selected.length?selected.map(i=>cardInfo(all[i])).join(''):'<div class="empty">Selecciona hasta cuatro versiones con «Comparar +». No se generan equivalencias si las fichas usan ciclos diferentes.</div>';
 renderExtremes();
}
function renderExtremes(){
 const cycle=$('cycle').value,tech=$('tech').value;
 if(!tech||!cycle){
  $('chart').innerHTML='<div class="empty"><strong>Selecciona una tecnología y un ciclo de ensayo.</strong><p>Un ranking de todos los vehículos mezclaría mediciones y segmentos no equivalentes. Usa también el filtro de carrocería para mejorar la comparación.</p></div>';
  return;
 }
 if(['PHEV','REEV','Híbrido por verificar'].includes(tech)){
  $('chart').innerHTML='<div class="empty"><strong>Sin ranking monetario automático para esta tecnología.</strong><p>Los indicadores ponderados PHEV/REEV no permiten calcular costos por modo con batería descargada. Usa el simulador de escenarios con tus propios consumos.</p></div>';return;
 }
 const points=filtered.map(r=>({r,c:cost(r).base})).filter(x=>x.c!==null).sort((a,b)=>a.c-b.c);
 if(!points.length){$('chart').innerHTML='<div class="empty">No hay registros con consumo aplicable al escenario de carga o combustible seleccionado.</div>';return;}
 const ends=[{label:'Menor costo estimado',items:points.slice(0,5)},{label:'Mayor costo estimado',items:points.slice(-5).reverse()}];
 const max=Math.max(...points.map(x=>x.c),1);
 $('chart').innerHTML='<div class="chart-notice">Ranking solo para '+safe(tech)+' / '+safe(cycle)+'. '+($('bodytype').value?'Carrocería: '+safe($('bodytype').value)+'.':'Puedes filtrar carrocería para una muestra más comparable.')+'</div>'+
 ends.map(g=>'<div class="chart-group"><h3>'+g.label+'</h3>'+
 g.items.map(x=>'<div class="chart-row"><span class="chart-label" title="'+safe(x.r[F.BRAND]+' '+x.r[F.MODEL])+'">'+safe(x.r[F.BRAND]+' '+x.r[F.MODEL])+'</span><div class="track"><div class="bar" style="width:'+Math.max(1,x.c/max*100)+'%"></div></div><strong>'+cash(x.c)+'</strong></div>').join('')+'</div>').join('');
}
function details(i){
 const r=all[i],t=r[F.TECH],p=cost(r),url='https://consumovehicular.minenergia.cl/';
 const labels=[['Marca',r[F.BRAND]],['Modelo y versión',r[F.MODEL]],['Tecnología clasificada',t],['Combustible',r[F.FUEL]],['Carrocería',r[F.BODY]],['Tracción',r[F.DRIVE]],['Transmisión',r[F.TRANS]],['Cilindrada',r[F.ENGINE]],['Homologado el',r[F.DATE]],['Código del informe 3CV',r[F.CODE]],['Categoría 3CV',r[F.CLASS]],['Ciclo',r[F.CYCLE]],['Mixto combustión (km/L)',r[F.KM]],['Rendimiento eléctrico de etiqueta (km/kWh)',r[F.EL]],['Rendimiento ponderado combustible PHEV/REEV (km/L)',r[F.PH]],['Batería (kWh)',r[F.BAT]],['Conector AC',r[F.AC]],['Conector DC',r[F.DC]],['CO₂ (g/km)',r[F.CO2]],['Norma emisiones',r[F.NORM]],['Costo estimado por 100 km',p.base===null?'No calculable de forma comparable':cash(p.base)]];
 let note=warningRow(r)||'Rendimiento de homologación en laboratorio: no equivale a consumo real observado.';
 if(t==='PHEV'||t==='REEV')note+=' Solo como referencia matemática, la conversión aislada de cada indicador ponderado arroja '+(p.electricReference===null?'N/D':cash(p.electricReference))+' eléctrico y '+(p.fuelReference===null?'N/D':cash(p.fuelReference))+' combustible por 100 km; estas cifras NO son costos de conducción por modo, ni deben sumarse.';
 if(t==='EV'&&!p.supported)note+=' El tipo de conexión DC elegido no se encuentra verificado en esta ficha.';
 $('detailTitle').textContent=r[F.BRAND]+' '+r[F.MODEL];
 $('detailBody').innerHTML='<div class="notice info-notice" style="margin:0 0 15px"><strong>Interpretación de ficha:</strong> '+safe(note)+'</div>'+
 '<p class="source-caption">Fecha de homologación: '+safe(r[F.DATE])+'. No acredita disponibilidad comercial actual ni octanaje requerido.</p>'+
 labels.map(x=>'<div class="kv"><span>'+safe(x[0])+'</span><strong>'+safe(x[1]===null||x[1]===''?'N/D':x[1])+'</strong></div>').join('')+
 '<p><a target="_blank" rel="noopener noreferrer" href="'+url+'">Consultar fuente oficial 3CV ↗</a></p>';
 $('detail').showModal();
 const link=new URL(location.href);link.searchParams.set('codigo',r[F.CODE]);history.replaceState(null,'',link.pathname+link.search+link.hash);
}
function closeDetail(){
 if($('detail').open)$('detail').close();
 const link=new URL(location.href);link.searchParams.delete('codigo');history.replaceState(null,'',link.pathname+link.search+link.hash);
}
function toggle(i){
 const at=selected.indexOf(i);
 if(at>=0)selected.splice(at,1);
 else if(selected.length>=4){alert('El máximo es cuatro versiones. Quita una para seguir.');return;}
 else selected.push(i);
 render();
}
function csv(){
 const head=['Marca','Modelo y versión','Tecnología revisada','Combustible','Carrocería','Tracción','Transmisión','Cilindrada','Fecha homologación','Código 3CV','Categoría','Ciclo','Mixto km/L','Ponderado eléctrico km/kWh','Ponderado combustible km/L','Batería kWh','Conector AC','Conector DC','CO₂ g/km','Norma','Costo energético comparable CLP/100km','Advertencia'];
 const escapeCell=v=>{let s=String(v===null||v===undefined?'':v);if(/^[=+\-@\t\r]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';};
 const lines=[head.map(escapeCell).join(';')];
 for(const r of filtered){const p=cost(r);const record=r.slice(0,20);record.push(p.base===null?'':Math.round(p.base));record.push(warningRow(r)||'Indicador homologado; no prueba de consumo real');lines.push(record.map(escapeCell).join(';'));}
 const blob=new Blob(['\uFEFF',lines.join('\r\n')],{type:'text/csv;charset=utf-8'});
 const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='rindelab_3cv_homologaciones_filtradas.csv';document.body.appendChild(a);a.click();
 setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},300);
}
function renderManual(){
 const share=Math.min(100,Math.max(0,Number($('mixShare').value)||0));$('mixShareLabel').textContent=share+' %';
 const kwh=positive($('mixKwh').value),litres=positive($('mixLitres').value);
 const price=($('mixFuel').value==='diesel'?dieselCost():Math.max(0,Number($( $('mixFuel').value)?.value)||0));
 if(!kwh||!litres){
  $('mixResult').innerHTML='<strong>Completa ambos consumos.</strong><p>Esta simulación no usa rendimientos ponderados del 3CV como si fueran mediciones por modo.</p>';return;
 }
 const eCost=(share/100)*kwh*elecPrice(),fuelCost=((100-share)/100)*litres*price,total=eCost+fuelCost,year=total*(Math.max(0,Number($('annualKm').value)||0)/100);
 $('mixResult').innerHTML='<div class="mix-totals"><div><small>Costo por 100 km</small><strong>'+cash(total)+'</strong></div><div><small>Costo anual estimado</small><strong>'+cash(year)+'</strong></div></div><div class="mix-breakdown">Electricidad: '+cash(eCost)+' · Combustible: '+cash(fuelCost)+' · Carga efectiva: '+fixed(energyPrice())+' $/kWh</div><p>Escenario personalizado basado <strong>exclusivamente en consumos ingresados por ti</strong>, no validado para ningún modelo. El porcentaje es de distancia recorrida con energía eléctrica.</p>';
}
function restoreEnergy(){
 for(const [id,v] of Object.entries(defaults))$(id).value=v;
 $('mixShare').value=50;$('mixKwh').value='';$('mixLitres').value='';$('mixFuel').value='p93';
 if(!loading)filters();renderManual();
}
function populate(){
 const m=$('brand').value,b=$('bodytype').value;fillSelect('brand',F.BRAND);fillSelect('bodytype',F.BODY);
 if([...$('brand').options].some(x=>x.value===m))$('brand').value=m;
 if([...$('bodytype').options].some(x=>x.value===b))$('bodytype').value=b;
}
async function initialize(){
 try{
  const manifest=await fetch('../vehiculos/data/manifest.json',{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error('No se pudo leer el manifiesto oficial');return r.json();});
  validDate=manifest.published||validDate;
  const sets=await Promise.all(manifest.files.map(file=>fetch('../vehiculos/'+file).then(r=>{if(!r.ok)throw Error('Archivo no disponible: '+file);return r.json();})));
  all=sets.flat().filter(r=>r&&r[F.BRAND]&&r[F.MODEL]&&r[F.DATE]&&r[F.DATE]<=validDate).map(cleanRecord);
  all.sort((a,b)=>b[F.DATE].localeCompare(a[F.DATE]));
  populate();loading=false;filters();
  const code=new URLSearchParams(location.search).get('codigo');
  if(code){const i=all.findIndex(r=>r[F.CODE]===code);if(i>=0)details(i);}
  $('catalogCount').textContent=fmt(all.length);
 }catch(err){
  loading=false;$('tbody').innerHTML='<tr><td colspan="6" class="empty">Error al abrir los datos: '+safe(err.message)+'. Recarga la página.</td></tr>';
  $('resultInfo').textContent='No se pudo cargar el registro oficial';$('chart').innerHTML='<div class="empty">Sin datos</div>';
 }
}
for(const id of ['search','tech','brand','bodytype','cycle','year','sort','charge','zone','period','customKwh','octane','losses','p93','p95','p97','diesel','annualKm']){
 $(id).addEventListener(id==='search'||['p93','p95','p97','diesel','customKwh','annualKm'].includes(id)?'input':'change',()=>{
  if(loading)return;
  filters();renderManual();
 });
}
/* Búsqueda explícita del catálogo: realiza búsqueda global y navega a resultados. */
$('catalogSearchForm').addEventListener('submit',event=>{
 event.preventDefault();
 const query=$('search').value.trim();
 $('search').value=query;
 $('heroSearchInput').value=query;
 ['tech','brand','bodytype','cycle','year'].forEach(id=>$(id).value='');
 $('sort').value='recent';
 if(!loading){
  filters();
  $('results').scrollIntoView({behavior:'smooth',block:'start'});
 }
});
/* Hero y catálogo comparten la misma búsqueda global. */
$('heroSearchForm').addEventListener('submit',event=>{
 event.preventDefault();
 $('search').value=$('heroSearchInput').value.trim();
 ['tech','brand','bodytype','cycle','year'].forEach(id=>$(id).value='');
 $('sort').value='recent';
 if(!loading)filters();
 $('catalogo').scrollIntoView({behavior:'smooth',block:'start'});
});
$('search').addEventListener('input',()=>{$('heroSearchInput').value=$('search').value;});
$('showAllSearch').addEventListener('click',()=>{
 ['tech','brand','bodytype','cycle','year'].forEach(id=>$(id).value='');
 $('sort').value='recent';
 if(!loading)filters();
 $('search').focus();
});
for(const id of ['mixKwh','mixLitres','mixShare','mixFuel'])$(id).addEventListener('input',renderManual);
$('tbody').addEventListener('click',e=>{
 const d=e.target.closest('[data-detail]'),c=e.target.closest('[data-compare]');
 if(d)details(Number(d.dataset.detail));else if(c)toggle(Number(c.dataset.compare));
});
$('comparison').addEventListener('click',e=>{const btn=e.target.closest('[data-compare]');if(btn)toggle(Number(btn.dataset.compare));});
$('reset').addEventListener('click',()=>{['search','brand','bodytype','tech','cycle','year'].forEach(id=>$(id).value='');$('heroSearchInput').value='';$('sort').value='recent';if(!loading)filters();});
$('resetEnergy').addEventListener('click',restoreEnergy);
$('export').addEventListener('click',()=>{if(!loading)csv()});
$('prev').addEventListener('click',()=>{if(page>0){page--;render();$('results').scrollIntoView({behavior:'smooth'});}});
$('next').addEventListener('click',()=>{if((page+1)*pageSize<filtered.length){page++;render();$('results').scrollIntoView({behavior:'smooth'});}});
$('clearCompare').addEventListener('click',()=>{selected=[];render();});
$('closeDetail').addEventListener('click',closeDetail);
$('detail').addEventListener('close',()=>{const u=new URL(location.href);if(u.searchParams.has('codigo')){u.searchParams.delete('codigo');history.replaceState(null,'',u.pathname+u.search+u.hash);}});
setTariff();renderManual();initialize();
})();