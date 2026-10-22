/* Directorio RINDELAB de valores observados de autos usados: sin proyecciones. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const clean=x=>String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const fmt=x=>Number(x).toLocaleString('es-CL');
const money=x=>'$'+fmt(x);
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cap=x=>x.split(' ').map(w=>w.length<4&&/^\d+$/.test(w)?w:w.charAt(0).toUpperCase()+w.slice(1)).join(' ');
const display=p=>({brand:cap(p.brandSlug.replace(/-/g,' ')),model:cap(p.modelSlug.replace(/-/g,' '))});
let all=[],filtered=[],count=18,retired=new Map(),lifecycleReady=false,retirementRecords=[],documentary=[];
const docFamily=r=>clean(r.brandSlug)+'|'+clean(r.modelSlug);
const documentaryFor=(b,m,year)=>documentary.filter(x=>docFamily(x)===clean(b)+'|'+clean(m)&&(!year||x.year===year));
const docAmount=p=>p.kind==='individual-listing'?money(p.priceClp):money(p.lowClp)+' – '+money(p.highClp);
const docLabel=p=>p.kind==='individual-listing'?'Aviso individual (histórico, vigencia no confirmada)':'Rango histórico publicado (no cotización actual)';
const isRetired=p=>retired.has(clean(p.brandSlug)+'|'+clean(p.modelSlug));
function populate(lifecycle){
 retirementRecords=(lifecycle?.models||[]).filter(x=>x.brand&&x.model&&x.sourceUrl?.startsWith('https://')&&['discontinued-cl','previous-generation-cl'].includes(x.status))
  .sort((a,b)=>(a.brand+' '+a.model).localeCompare(b.brand+' '+b.model,'es'));
 retired=new Map(retirementRecords
  .filter(x=>x.match==='whole-family'&&x.status==='discontinued-cl')
  .map(x=>[clean(x.brand)+'|'+clean(x.model),x]));
 lifecycleReady=retired.size>0;
 $('usedOnlyDiscontinued').disabled=!lifecycleReady;
 if(!lifecycleReady)$('usedOnlyDiscontinued').checked=false;
 all=window.RindelabUsed.records().sort((a,b)=>Number(isRetired(b))-Number(isRetired(a))||
  a.brandSlug.localeCompare(b.brandSlug,'es')||a.modelSlug.localeCompare(b.modelSlug,'es')||b.year-a.year);
 const brands=[...new Set([...all.map(x=>x.brandSlug),...retirementRecords.map(x=>clean(x.brand).replace(/\s+/g,'-'))])].sort((a,b)=>a.localeCompare(b,'es'));
 for(const b of brands)$('usedBrand').append(new Option(cap(b),b));
 const years=[...new Set([...all.map(x=>x.year),...Array.from({length:37},(_,i)=>2026-i)])].sort((a,b)=>b-a);
 for(const y of years)$('usedYear').append(new Option(y,y));
 const url=new URL(location.href);
 const q=url.searchParams.get('modelo');if(q)$('usedQuery').value=q;
 const mode=url.searchParams.get('modo');if(['prices','retired','missing','documentary'].includes(mode))$('usedHistoryView').value=mode;
 const year=url.searchParams.get('anio');if(year&&years.includes(Number(year)))$('usedYear').value=year;
 render();
}
function familyValues(record,year){
 // Cuando el retiro se refiere solo a una generación o variante, no se
 // adjudican valores de toda la familia por coincidencia del nombre.
 if(record.match!=='whole-family'||record.status!=='discontinued-cl')return [];
 const records=window.RindelabUsed?.marketFor(record.brand,record.model)||[];
 return records.filter(p=>!year||p.year===year);
}
function renderRetirements(list,items,year){
 for(const [i,r] of items.slice(0,count).entries()){
  const family=familyValues(r,year);
  const supplementary=documentaryFor(r.brand, r.model==='Lancer (sedán original)'?'Lancer':r.model,year);
  const price=family[0]||null; // Orden documental: no calcular medias o depreciaciones.
  const card=document.createElement('article');card.className='used-result used-retired-card';
  const historyUrl=r.sourceUrl?.startsWith('https://')?r.sourceUrl:null;
  const precise=r.match!=='whole-family';
  const label=r.statusLabel||'Salida de la oferta de nuevos en Chile';
  const range=price?(price.source==='AutoExplora'?money(price.medianClp):money(price.lowClp)+' – '+money(price.highClp)):'';
  card.innerHTML='<h3>'+esc(r.brand+' '+r.model)+'</h3>'+
   '<p class="used-retired-context"><strong>'+esc(label)+'</strong> · '+esc(r.effectiveNote||'Antecedente histórico documentado')+'</p>'+
   (price?'<p class="used-source-note">Referencia por familia / año '+price.year+' · '+esc(price.source)+' · No identifica versión ni generación exacta</p><div class="used-result-main">'+esc(range)+'</div>':
    '<p class="used-no-value">Sin precio comercial documentado'+(year?' para '+year:'')+'. No se calcula depreciación.</p>')+
   (supplementary.length?'<p class="used-source-note">'+supplementary.length+' antecedente(s) documental(es) separados; no cierran automáticamente la brecha comercial. <a href="?modo=documentary&modelo='+encodeURIComponent(r.brand+' '+(r.model==='Lancer (sedán original)'?'Lancer':r.model))+'">Ver avisos y rangos históricos ↗</a></p>':'')+
   (precise?'<p class="used-retired-context">Retiro limitado a generación, carrocería o variante; no se asigna el valor de otra generación.</p>':'')+
   '<div class="used-result-links">'+(price?'<a href="'+esc(price.sourceUrl)+'" target="_blank" rel="noopener noreferrer">Fuente del precio ↗</a>':'')+
   (historyUrl?'<a href="'+esc(historyUrl)+'" target="_blank" rel="noopener noreferrer">Antecedente del retiro ↗</a>':'')+
   '<button type="button" data-retired-sii="'+i+'">Buscar tasación fiscal SII</button></div>';
  list.append(card);
 }
}
function render(){
 const query=clean($('usedQuery').value),brand=$('usedBrand').value,year=Number($('usedYear').value)||null,onlyRetired=$('usedOnlyDiscontinued').checked,mode=$('usedHistoryView').value;
 $('usedActiveOnlyLabel').hidden=mode!=='prices';
 if(mode==='documentary'){
  filtered=documentary.filter(p=>(!brand||clean(p.brandSlug)===clean(brand))&&(!year||p.year===year)&&(!query||clean(p.brandSlug+' '+p.modelSlug+' '+p.variant).includes(query)));
  $('usedCount').textContent=fmt(filtered.length)+' antecedentes documentales, sin vigencia comercial confirmada';
  const list=$('usedGrid');list.replaceChildren();
  for(const [i,p] of filtered.slice(0,count).entries()){
   const c=document.createElement('article');c.className='used-result';
   c.innerHTML='<h3>'+esc(cap(p.brandSlug)+' '+p.variant)+' <small>'+p.year+'</small></h3><div class="used-result-main">'+esc(docAmount(p))+'</div><p class="used-result-metrics">'+esc(docLabel(p))+' · '+esc(p.identityStatus==='requires-generation-confirmation'?'Generación por confirmar':'Familia identificada; variante separada')+'</p><p class="used-source-note">'+esc(p.source)+' · fuente documental '+esc(p.observedAt)+(p.sourcePrecision==='paged-list-not-permalink'?' · enlace a listado paginado, no a ficha individual':'')+'</p><div class="used-result-links"><a href="'+esc(p.sourceUrl)+'" target="_blank" rel="noopener noreferrer">Consultar antecedente ↗</a><button type="button" data-doc-sii="'+i+'">Consultar SII por separado</button></div>';
   list.append(c);
  }
  $('usedMore').hidden=filtered.length<=count;$('usedEmpty').hidden=filtered.length>0;return;
 }
 if(mode!=='prices'){
  filtered=retirementRecords.filter(r=>(!brand||clean(r.brand)===clean(brand))&&(!query||clean(r.brand+' '+r.model).includes(query))&&(mode!=='missing'||!familyValues(r,year).length));
  $('usedCount').textContent=fmt(filtered.length)+' modelos o generaciones retirados'+(mode==='missing'?' sin precio documentado'+(year?' para '+year:''):'')+' · registro histórico Chile';
  const list=$('usedGrid');list.replaceChildren();renderRetirements(list,filtered,year);
  $('usedMore').hidden=filtered.length<=count;$('usedEmpty').hidden=filtered.length>0;return;
 }
 filtered=all.filter(x=>(!brand||clean(x.brandSlug)===clean(brand))&&(!year||x.year===year)&&(!onlyRetired||isRetired(x))&&
  (!query||clean(x.brandSlug.replace(/-/g,' ')+' '+x.modelSlug.replace(/-/g,' ')).includes(query)));
 $('usedCount').textContent=fmt(filtered.length)+' referencias observadas, por modelo y año'+(onlyRetired?' · solo familias descontinuadas acreditadas':'')+' · corte 21-10-2026';
 const list=$('usedGrid');list.replaceChildren();
 for(const [i,p] of filtered.slice(0,count).entries()){
  const x=display(p),card=document.createElement('article');card.className='used-result';
  const price=p.source==='AutoExplora'?money(p.medianClp):money(p.lowClp)+' – '+money(p.highClp);
  const description=p.source==='AutoExplora'?'Mediana · p10–p90: '+money(p.p10Clp)+' a '+money(p.p90Clp)+' · '+p.sampleSize+' avisos'+(p.medianKm?' · '+fmt(p.medianKm)+' km medianos':''):
    'Mínimo–máximo aproximado · muestra no informada';
  const archived=retired.get(clean(p.brandSlug)+'|'+clean(p.modelSlug));
  card.innerHTML='<h3>'+esc(x.brand+' '+x.model)+' <small>'+p.year+'</small></h3>'+
   (archived?'<p class="used-retired-status"><a href="'+esc(archived.sourceUrl)+'" target="_blank" rel="noopener noreferrer">Fuera de la oferta chilena de autos nuevos · Ver antecedente ↗</a></p>':'')+
   '<div class="used-result-main">'+esc(price)+'</div>'+
   '<p class="used-result-metrics">'+esc(description)+'</p>'+
   '<p class="used-source-note">Fuente: '+esc(p.source)+' · consulta registrada '+esc(p.observedAt)+' · no precio de transacción</p>'+
   '<div class="used-result-links"><a href="'+esc(p.sourceUrl)+'" target="_blank" rel="noopener noreferrer">Ver fuente actual ↗</a>'+
   '<button type="button" data-used-sii="'+i+'">Tasación y permiso SII</button></div>';
  list.append(card);
 }
 $('usedMore').hidden=filtered.length<=count;
 $('usedEmpty').hidden=filtered.length>0;
}
$('usedGrid').addEventListener('click',e=>{
 const doc=e.target.closest('[data-doc-sii]');
 if(doc){const r=filtered[Number(doc.dataset.docSii)];if(r)window.RindelabSII?.openCommercial?.(cap(r.brandSlug),r.modelSlug);return;}
 const historic=e.target.closest('[data-retired-sii]');
 if(historic){
  const r=filtered[Number(historic.dataset.retiredSii)];
  if(!r)return;
  const year=Number($('usedYear').value)||null;
  if(year)window.RindelabUsed?.selectYear?.(r.brand,r.model,year);
  window.RindelabSII?.openCommercial?.(r.brand,r.model);
  return;
 }
 const b=e.target.closest('[data-used-sii]');if(!b)return;
 const p=filtered[Number(b.dataset.usedSii)];if(!p)return;
 const x=display(p);
 window.RindelabUsed?.selectYear?.(x.brand,x.model,p.year);
 window.RindelabSII?.openCommercial?.(x.brand,x.model);
});
$('usedMore').addEventListener('click',()=>{count+=18;render()});
for(const id of ['usedQuery','usedBrand','usedYear','usedOnlyDiscontinued','usedHistoryView'])$(id).addEventListener(id==='usedQuery'?'input':'change',()=>{count=18;render()});
Promise.all([window.RindelabUsed?.ready,
 fetch('./sii/data/used-documentary-listings-20261021.json').then(r=>{if(!r.ok)throw Error('Sin suplemento documental');return r.json()}).then(d=>{documentary=(d.records||[]).filter(p=>p.qualityStatus==='documentary-reference'&&p.sourceUrl?.startsWith('https://'))}).catch(()=>{documentary=[]}),
 fetch('./sii/model-lifecycle-2026.json').then(r=>{if(!r.ok)throw Error('Sin catálogo de ciclo de vida');return r.json()}).catch(()=>({models:[]}))
]).then(([, ,lifecycle])=>populate(lifecycle));
})();