/* Directorio RINDELAB de valores observados de autos usados: sin proyecciones. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const clean=x=>String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const fmt=x=>Number(x).toLocaleString('es-CL');
const money=x=>'$'+fmt(x);
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cap=x=>x.split(' ').map(w=>w.length<4&&/^\d+$/.test(w)?w:w.charAt(0).toUpperCase()+w.slice(1)).join(' ');
const display=p=>({brand:cap(p.brandSlug.replace(/-/g,' ')),model:cap(p.modelSlug.replace(/-/g,' '))});
let all=[],filtered=[],count=18;
function populate(){
 all=window.RindelabUsed.records().sort((a,b)=>a.brandSlug.localeCompare(b.brandSlug,'es')||a.modelSlug.localeCompare(b.modelSlug,'es')||b.year-a.year);
 const brands=[...new Set(all.map(x=>x.brandSlug))].sort((a,b)=>a.localeCompare(b,'es'));
 for(const b of brands)$('usedBrand').append(new Option(cap(b),b));
 const years=[...new Set(all.map(x=>x.year))].sort((a,b)=>b-a);
 for(const y of years)$('usedYear').append(new Option(y,y));
 const url=new URL(location.href);
 const q=url.searchParams.get('modelo');if(q)$('usedQuery').value=q;
 const year=url.searchParams.get('anio');if(year&&years.includes(Number(year)))$('usedYear').value=year;
 render();
}
function render(){
 const query=clean($('usedQuery').value),brand=$('usedBrand').value,year=Number($('usedYear').value)||null;
 filtered=all.filter(x=>(!brand||x.brandSlug===brand)&&(!year||x.year===year)&&
  (!query||clean(x.brandSlug.replace(/-/g,' ')+' '+x.modelSlug.replace(/-/g,' ')).includes(query)));
 $('usedCount').textContent=fmt(filtered.length)+' referencias observadas, por modelo y año · corte 21-10-2026';
 const list=$('usedGrid');list.replaceChildren();
 for(const [i,p] of filtered.slice(0,count).entries()){
  const x=display(p),card=document.createElement('article');card.className='used-result';
  const price=p.source==='AutoExplora'?money(p.medianClp):money(p.lowClp)+' – '+money(p.highClp);
  const description=p.source==='AutoExplora'?'Mediana · p10–p90: '+money(p.p10Clp)+' a '+money(p.p90Clp)+' · '+p.sampleSize+' avisos'+(p.medianKm?' · '+fmt(p.medianKm)+' km medianos':''):
    'Mínimo–máximo aproximado · muestra no informada';
  card.innerHTML='<h3>'+esc(x.brand+' '+x.model)+' <small>'+p.year+'</small></h3>'+
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
 const b=e.target.closest('[data-used-sii]');if(!b)return;
 const p=filtered[Number(b.dataset.usedSii)];if(!p)return;
 const x=display(p);
 window.RindelabUsed?.selectYear?.(x.brand,x.model,p.year);
 window.RindelabSII?.openCommercial?.(x.brand,x.model);
});
$('usedMore').addEventListener('click',()=>{count+=18;render()});
for(const id of ['usedQuery','usedBrand','usedYear'])$(id).addEventListener(id==='usedQuery'?'input':'change',()=>{count=18;render()});
window.RindelabUsed?.ready.then(populate);
})();