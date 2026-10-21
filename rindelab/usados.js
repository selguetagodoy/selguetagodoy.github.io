/* RINDELAB · Valorización de usados: inventario histórico vs precios por año. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const clean=x=>String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const fmt=n=>Number(n).toLocaleString('es-CL');
const money=n=>'$'+fmt(n);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cap=x=>String(x).split(' ').map(w=>w.length<4&&/^\d+$/.test(w)?w:w.charAt(0).toUpperCase()+w.slice(1)).join(' ');
const labels=p=>({brand:cap(p.brandSlug.replace(/-/g,' ')),model:cap(p.modelSlug.replace(/-/g,' '))});
const byId=p=>p.source+'|'+p.brandSlug+'|'+p.modelSlug+'|'+p.year;
let all=[],archived=[],filtered=[],count=18;
let currentMode='discontinued';
function familyPrices(rec){
 // A family-classified retirement is not evidence for a particular generation or trim.
 if(rec.match!=='whole-family')return [];
 return window.RindelabUsed?.marketFor(rec.brand,rec.model)||[];
}
function selectPrices(){
 const existing=$('usedBrand').value,scope=$('usedScope').value;
 const names=scope==='priced'?[...new Set(all.map(p=>p.brandSlug))].sort((a,b)=>a.localeCompare(b,'es')):
 [...new Set(archived.map(p=>clean(p.brand)))].sort((a,b)=>a.localeCompare(b,'es'));
 $('usedBrand').replaceChildren(new Option('Todas las marcas',''));
 for(const name of names)$('usedBrand').append(new Option(cap(name.replace(/-/g,' ')),name));
 if(names.includes(existing))$('usedBrand').value=existing;
}
async function populate(){
 await window.RindelabUsed.ready;
 all=window.RindelabUsed.records().sort((a,b)=>a.brandSlug.localeCompare(b.brandSlug,'es')||a.modelSlug.localeCompare(b.modelSlug,'es')||b.year-a.year);
 try{
  const response=await fetch('./sii/model-lifecycle-2026.json?v=20261021-used-index');
  if(!response.ok)throw Error('No se cargó el registro de modelos descontinuados');
  const obj=await response.json();
  if(obj.schemaVersion!==1||!Array.isArray(obj.models))throw Error('Registro histórico sin formato comprobable');
  archived=obj.models.filter(p=>p.brand&&p.model&&(p.status==='discontinued-cl'||p.status==='previous-generation-cl'))
    .sort((a,b)=>(a.brand+' '+a.model).localeCompare(b.brand+' '+b.model,'es'));
 }catch(e){console.error('Historial de modelos no disponible',e);archived=[];currentMode='priced';}
 const years=[...new Set([...all.map(x=>x.year),...Array.from({length:37},(_,i)=>2026-i)])].sort((a,b)=>b-a);
 $('usedYear').replaceChildren(new Option('Todos los años',''));
 for(const yr of years)$('usedYear').append(new Option(yr,yr));
 const url=new URL(location.href);
 const q=url.searchParams.get('modelo');if(q)$('usedQuery').value=q;
 const y=url.searchParams.get('anio');if(y&&years.includes(Number(y)))$('usedYear').value=y;
 const mode=url.searchParams.get('modo');if(['priced','missing','discontinued'].includes(mode))currentMode=mode;
 $('usedScope').value=currentMode;
 selectPrices();render();
}
function renderPrices(list,rows){
 for(const [i,p] of rows.slice(0,count).entries()){
  const x=labels(p),card=document.createElement('article');card.className='used-result';
  const price=p.source==='AutoExplora'?money(p.medianClp):money(p.lowClp)+' – '+money(p.highClp);
  const detail=p.source==='AutoExplora'?'Mediana de avisos · p10–p90 '+money(p.p10Clp)+' a '+money(p.p90Clp)+' · '+p.sampleSize+' publicaciones'+(p.medianKm?' · '+fmt(p.medianKm)+' km medianos':''):
    'Rango mínimo–máximo aproximado del proveedor · muestra no publicada';
  card.innerHTML='<h3>'+esc(x.brand+' '+x.model)+' <small>'+p.year+'</small></h3>'+
   '<div class="used-result-main">'+esc(price)+'</div>'+
   '<p class="used-result-metrics">'+esc(detail)+'</p>'+
   '<p class="used-source-note">Fuente: '+esc(p.source)+' · corte '+esc(p.observedAt)+' · no precio de compraventa cerrado</p>'+
   '<div class="used-result-links"><a href="'+esc(p.sourceUrl)+'" target="_blank" rel="noopener noreferrer">Ver publicación de origen ↗</a>'+
   '<button type="button" data-used-sii="'+i+'">Tasación y permiso SII</button></div>';
  list.append(card);
 }
}
function renderHistorical(list,rows,year){
 for(const [i,p] of rows.slice(0,count).entries()){
  const choices=familyPrices(p);
  const matching=year?choices.filter(r=>r.year===year):choices;
  const item=matching[0]||null; // Observación más reciente, expresamente etiquetada por año.
  const card=document.createElement('article');card.className='used-result used-history-card';
  card.innerHTML='<h3>'+esc(p.brand+' '+p.model)+'</h3>'+
   '<p class="used-status">'+esc(p.statusLabel||'Fuera de la oferta de nuevos')+'</p>'+
   '<p class="used-source-note">'+esc(p.effectiveNote||'Antecedente documentado de ciclo comercial anterior')+'</p>'+
   (item?
     '<p class="used-price-year">Referencia comercial publicada para el año <strong>'+item.year+'</strong></p>'+
     '<div class="used-result-main">'+esc(item.source==='AutoExplora'?money(item.medianClp):money(item.lowClp)+' – '+money(item.highClp))+'</div>'+
     '<p class="used-result-metrics">'+esc(item.source==='AutoExplora'?
       'Mediana de '+item.sampleSize+' avisos (p10–p90: '+money(item.p10Clp)+'–'+money(item.p90Clp)+')':
       'Rango comercial aproximado; tamaño de muestra no informado')+'</p>'+
     '<p class="used-source-note">Fuente '+esc(item.source)+' · corte '+esc(item.observedAt)+' · modelo/año, no versión ni generación comprobadas</p>':
     '<p class="used-unavailable">Valor comercial sin referencia comprobada'+(year?' para '+year:'')+'. No estimamos depreciación ni equiparamos generaciones.</p>')+
    '<div class="used-result-links">'+(item?'<a href="'+esc(item.sourceUrl)+'" target="_blank" rel="noopener noreferrer">Ver valor y fuente ↗</a>':'')+
    (p.sourceUrl?'<a href="'+esc(p.sourceUrl)+'" target="_blank" rel="noopener noreferrer">Antecedente comercial ↗</a>':'')+
    '<button type="button" data-history-sii="'+i+'">Buscar tasación SII</button>'+
    (choices.length?'<a href="./usados.html?modo=priced&amp;modelo='+encodeURIComponent(p.brand+' '+p.model)+'">Consultar otros años ↗</a>':'')+'</div>';
  if(p.match!=='whole-family')card.innerHTML+='<p class="used-source-note"><strong>Precaución:</strong> retiro limitado a generación, carrocería o versión. No se atribuye automáticamente una tasación de familia.</p>';
  list.append(card);
 }
}
function render(){
 const q=clean($('usedQuery').value),brand=$('usedBrand').value,yr=Number($('usedYear').value)||null,scope=$('usedScope').value;
 currentMode=scope;
 if(scope==='priced'){
  filtered=all.filter(p=>(!brand||p.brandSlug===brand)&&(!yr||p.year===yr)&&
   (!q||clean(p.brandSlug.replace(/-/g,' ')+' '+p.modelSlug.replace(/-/g,' ')).includes(q)));
 }else{
  filtered=archived.filter(p=>(!brand||clean(p.brand)===brand)&&(!q||clean(p.brand+' '+p.model).includes(q))&&
   (scope!=='missing'||!familyPrices(p).some(x=>!yr||x.year===yr)));
 }
 const list=$('usedGrid');list.replaceChildren();
 if(scope==='priced'){
  $('usedCount').textContent=fmt(filtered.length)+' observaciones de mercado por modelo, año y fuente · corte 21-10-2026';
  renderPrices(list,filtered);
 }else{
  const priced=filtered.filter(p=>familyPrices(p).some(x=>!yr||x.year===yr)).length;
  $('usedCount').textContent=fmt(filtered.length)+' modelos o generaciones documentadas · '+fmt(priced)+' con referencia de precio'+(yr?' para '+yr:'')+' · corte 21-10-2026';
  renderHistorical(list,filtered,yr);
 }
 $('usedMore').hidden=filtered.length<=count;
 $('usedEmpty').hidden=filtered.length>0;
}
$('usedGrid').addEventListener('click',e=>{
 const q=e.target.closest('[data-used-sii]');
 if(q){
  const p=filtered[Number(q.dataset.usedSii)];if(!p)return;
  const x=labels(p);
  window.RindelabUsed?.selectYear?.(x.brand,x.model,p.year);
  window.RindelabSII?.openCommercial?.(x.brand,x.model);
  return;
 }
 const b=e.target.closest('[data-history-sii]');if(!b)return;
 const p=filtered[Number(b.dataset.historySii)];if(!p)return;
 const yr=Number($('usedYear').value)||null;
 if(yr)window.RindelabUsed?.selectYear?.(p.brand,p.model,yr);
 window.RindelabSII?.openCommercial?.(p.brand,p.model);
});
$('usedMore').addEventListener('click',()=>{count+=18;render()});
$('usedScope').addEventListener('change',()=>{count=18;selectPrices();render()});
for(const id of ['usedQuery','usedBrand','usedYear'])$(id).addEventListener(id==='usedQuery'?'input':'change',()=>{count=18;render()});
window.RindelabUsed?.ready.then(populate);
})();