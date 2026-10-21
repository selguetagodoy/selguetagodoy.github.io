/* RINDELAB — catálogo comercial independiente del registro 3CV.
 * Un precio por familia no identifica una versión homologada ni confirma inventario.
 * Comparador de compra separado: NUNCA infiere rendimientos de otras versiones. */
(()=>{'use strict';
const C=window.RindelabIdentity,api=window.RindelabCommercial;
if(!C||!api)return;
const $=id=>document.getElementById(id);
const fmt=n=>Number(n).toLocaleString('es-CL');
const money=n=>Number.isFinite(n)&&n>0?'$'+fmt(Math.round(n)):'Consultar precio en fuente';
const safe=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
let familyAliases=new Map();
const keyOf=p=>{const original=C.key(p.brand,p.family);return (familyAliases.get(original)||original)+'|'+(p.technology||'?');};
const labelTech=t=>({Bencina:'Bencina','Diésel':'Diésel',MHEV:'Híbrido suave',HEV:'Híbrido',PHEV:'Híbrido enchufable',REEV:'Eléctrico de rango extendido',EV:'Eléctrico'})[t]||'Motorización no documentada';
let groups=[],selection=[],shown=12,lastCriteria=null,lastOfficial=[],filtered=[],dealerListings=[];
const groupIndex=new Map();
const compareDialog=$('commercialCompareDialog'),compareBody=$('commercialCompareContent');
function reference(items){
 const priced=items.filter(x=>Number.isSafeInteger(x.priceListClp)&&x.priceListClp>0);
 if(!priced.length)return items[0];
 const exact=priced.filter(p=>!p.dealerObserved);
 const pool=exact.length?exact:priced;
 const dated=pool.filter(p=>!C.expired(p));
 const all=dated.length?dated:pool;
 return all.reduce((a,b)=>a.priceListClp<=b.priceListClp?a:b);
}
function rebuild(){
 const records=api.records().filter(C.active);
 const map=new Map();
 for(const p of records){const k=keyOf(p);if(!map.has(k))map.set(k,[]);map.get(k).push(p);}
 // El dato de concesionaria es una observación de catálogo 0 km, no una
 // variante homologada ni un importe editable del cotizador. No duplicar
 // familias con la misma identidad comercial documentada.
 for(const p of dealerListings){
  const k=keyOf(p);
  if(!map.has(k))map.set(k,[]);
  if(!map.get(k).some(r=>!r.dealerObserved))map.get(k).push(p);
 }
 groups=[...map].map(([k,items])=>({key:k,items,ref:reference(items),brand:items[0].brand,family:items[0].family,tech:items[0].technology||''}));
 groupIndex.clear();groups.forEach(x=>groupIndex.set(x.key,x));
 // No inferir que se vende actualmente: sólo se conoce la referencia publicada.
 const params=new URLSearchParams(location.search).get('comerciales');
 if(params&&!selection.length){selection=[...new Set(params.split('~').map(s=>decodeURIComponent(s)))].filter(x=>groupIndex.has(x)).slice(0,5);}
 updateTray();
}
function compatibleOfficial(group,official){
 return official.some(row=>C.key(row[0],window.RindelabSII.family(row))===C.key(group.brand,group.family)&&
 (!group.tech||group.tech===row[2]));
}
function meets(group,f){
 if(f.brand&&C.brand(f.brand)!==C.brand(group.brand))return false;
 if(f.model&&C.family(group.family,group.brand)!==C.family(f.model,group.brand))return false;
 if(f.tech&&group.tech!==f.tech)return false;
 if(f.body||f.cycle||f.year)return false; // Campos exclusivamente 3CV.
 if(f.q){
  const a=C.norm(group.brand+' '+group.family+' '+group.items.map(p=>p.version).join(' '));
  const b=C.norm(f.q);if(!a.includes(b)&&!a.replace(/\s/g,'').includes(b.replace(/\s/g,'')))return false;
 }
 return true;
}
function catalogGroups(criteria,official){
 if(criteria.scope==='all')return [];
 let pool=groups.filter(x=>meets(x,criteria));
 if(criteria.scope!=='commercial')pool=pool.filter(x=>!compatibleOfficial(x,official));
 const sort=$('commercialSort')?.value||'name';
 const price=x=>Number.isFinite(x.ref.priceListClp)&&x.ref.priceListClp>0?x.ref.priceListClp:Infinity;
 pool.sort((a,b)=>sort==='low'?price(a)-price(b):sort==='high'?
  (Number.isFinite(price(b))?price(b):0)-(Number.isFinite(price(a))?price(a):0):
  (a.brand+' '+a.family).localeCompare(b.brand+' '+b.family,'es'));
 return pool;
}
function renderGroup(group){
 const p=group.ref,article=document.createElement('article');
 article.className='market-card';
 const selected=selection.includes(group.key);
 const end=C.expired(p)?'Campaña documentada terminada; verificar valor actual':p.dealerObserved?'Modelo publicado como nuevo por concesionaria; stock y vigencia no verificados':'Referencia comercial publicada, vigencia no confirmada';
 const condition=p.dealerObserved?(p.priceListClp?'Precio de lista de familia; versión sin identificar':'Sin precio de lista documentado'):p.priceType==='oferta'?'Oferta publicada':p.priceType==='desde'||/^Precio desde/.test(p.version)?'Precio desde':p.priceType==='lista'?'Precio de lista declarado':'Precio publicado (tipo sin acreditar)';
 const source=p.source;
 article.innerHTML='<div class="market-card-copy"><h4>'+safe(group.brand+' '+group.family)+'</h4><p>'+safe(labelTech(group.tech))+' · '+fmt(group.items.length)+' referencias</p>'+
  '<small>'+safe(condition)+' · '+safe(end)+'</small><div class="market-price">'+money(p.priceListClp)+(p.taxIncluded===false?' + IVA':'')+'</div>'+
  '<small>Publicación revisada '+safe(p.checkedAt||'sin fecha')+' · Sin rendimiento homologado vinculado a esta versión</small></div>'+
  '<div class="market-card-actions"><a class="button secondary" href="'+safe(source)+'" target="_blank" rel="noopener noreferrer">Fuente ↗</a>'+
  (p.dealerObserved?'':'<a class="button secondary" href="./cotizador.html?marca='+encodeURIComponent(group.brand)+'&modelo='+encodeURIComponent(group.family)+'">Ver versiones</a>')+
  '<button type="button" class="button primary" data-market-compare="'+safe(group.key)+'" aria-pressed="'+selected+'">'+(selected?'Quitar de comparación':'Comparar compra +')+'</button></div>';
 const photo=window.RindelabPhotos?.commercialNode(p);
 if(photo){const img=photo.querySelector('img');if(img){img.loading='lazy';}article.prepend(photo);}
 return article;
}
function render(criteria=lastCriteria,official=lastOfficial){
 if(!criteria)return 0;
 lastCriteria=criteria;lastOfficial=official;
 filtered=catalogGroups(criteria,official);
 const area=$('commercialResults'),items=$('commercialResultList');
 area.hidden=!filtered.length;
 $('commercialResultCount').textContent=fmt(filtered.length)+' familias y tecnologías con referencias comerciales'+(criteria.scope==='commercial'?' · sin homologación automática':' sin ficha energética enlazada');
 items.replaceChildren(...filtered.slice(0,shown).map(renderGroup));
 $('commercialMore').hidden=shown>=filtered.length;
 // Vista comercial sin 3CV: no mostrar erróneamente «sin coincidencias».
 if(filtered.length){$('emptyState').hidden=true;$('suggested').hidden=true;}
 return filtered.length;
}
function updateTray(){
 const bar=$('commercialCompareTray');bar.hidden=!selection.length;
 $('commercialSelectedCount').textContent=selection.length+' de 5 modelos comerciales';
 $('commercialOpenCompare').disabled=selection.length<2;
 document.querySelectorAll('[data-market-compare]').forEach(b=>{
  const active=selection.includes(b.dataset.marketCompare);
  b.textContent=active?'Quitar de comparación':'Comparar compra +';
  b.setAttribute('aria-pressed',String(active));
 });
}
function toggle(k){
 if(selection.includes(k))selection=selection.filter(x=>x!==k);
 else if(selection.length<5)selection.push(k);
 else{$('commercialSelectionNote').textContent='El límite es de cinco familias comerciales; quita una para agregar otra.';return;}
 $('commercialSelectionNote').textContent='';
 updateTray();
}
function comparison(){
 if(selection.length<2)return;
 const xs=selection.map(k=>groupIndex.get(k)).filter(Boolean);
 const rows=[
 ['Tecnología',x=>labelTech(x.tech)],
 ['Precio publicado de referencia',x=>money(x.ref.priceListClp)+(x.ref.taxIncluded===false?' + IVA':'')],
 ['Tipo de precio',x=>x.ref.dealerObserved?(x.ref.priceListClp?'Lista publicada por familia, sin versión identificada':'No publicado como precio de lista'):(x.ref.priceType||'No acreditado')],
 ['Campaña documentada',x=>C.expired(x.ref)?'Finalizada; verificar':x.ref.sourceOfferEnd?'Hasta '+x.ref.sourceOfferEnd:'Sin fecha de término acreditada'],
 ['Referencias disponibles',x=>fmt(x.items.length)],
 ['Fecha de revisión',x=>x.ref.checkedAt||'Sin fecha'],
 ['Rendimiento 3CV de esta versión',()=> 'Sin correspondencia técnica certificada'],
 ['Gasto energético de esta versión',()=> 'No calculable sin rendimiento de la versión']
 ];
 let table='<table class="market-compare-table"><thead><tr><th>Indicador</th>'+xs.map(x=>'<th>'+safe(x.brand+' '+x.family)+'<br>'+safe(labelTech(x.tech))+'</th>').join('')+'</tr></thead><tbody>';
 table+=rows.map(([label,get])=>'<tr><th>'+safe(label)+'</th>'+xs.map(x=>'<td>'+safe(get(x))+'</td>').join('')+'</tr>').join('');
 table+='<tr><th>Fuente de referencia</th>'+xs.map(x=>'<td><a href="'+safe(x.ref.source)+'" target="_blank" rel="noopener noreferrer">Consultar fuente ↗</a></td>').join('')+'</tr></tbody></table>';
 compareBody.innerHTML='<p class="market-comparison-warning">Comparación comercial de familias, no de versiones homologadas. Precios publicados sujetos a vigencia, IVA y condiciones; sin equivalencia 3CV ni estimaciones energéticas inventadas.</p><div class="market-table-scroll" role="region" tabindex="0" aria-label="Tabla comercial desplazable">'+table+'</div>';
 compareDialog.showModal();
}
$('commercialResultList').addEventListener('click',event=>{const b=event.target.closest('[data-market-compare]');if(b)toggle(b.dataset.marketCompare);});
$('commercialMore').addEventListener('click',()=>{shown+=12;render();updateTray();});
$('commercialSort').addEventListener('change',()=>{shown=12;render();updateTray();});
$('commercialOpenCompare').addEventListener('click',comparison);
$('commercialClear').addEventListener('click',()=>{selection=[];updateTray();$('commercialSelectionNote').textContent='';});
$('commercialCloseCompare').addEventListener('click',()=>compareDialog.close());
$('commercialShare').addEventListener('click',()=>{
 const url=new URL(location.href);
 url.searchParams.set('comerciales',selection.map(encodeURIComponent).join('~'));
 const field=$('commercialShareLink');field.value=url.toString();field.hidden=false;field.select();
 if(navigator.clipboard?.writeText)navigator.clipboard.writeText(field.value).then(()=>$('commercialShareMessage').textContent='Enlace copiado.').catch(()=>$('commercialShareMessage').textContent='Selecciona y copia el enlace.');
 else $('commercialShareMessage').textContent='Selecciona y copia el enlace.';
});
$('resetButton').addEventListener('click',()=>{shown=12;lastCriteria=null;$('commercialResults').hidden=true;});
window.RindelabMarket=Object.freeze({render,rebuild,resetPage:()=>shown=12,getCount:()=>filtered.length,records:()=>dealerListings.slice(),getTotal:()=>groups.length,getAliasCount:()=>familyAliases.size});
Promise.all([
 api.ready(),
 ...[
  './data/dealer-new-models-20261021.json?v=20261021-discovery',
  './data/dealer-portillo-20261021.json?v=20261021-expansion',
  './data/dealer-gildemeister-20261021.json?v=20261021-expansion'
 ].map(url=>fetch(url).then(r=>{if(!r.ok)throw Error('Snapshot no disponible '+url);return r.json();}).catch(()=>({records:[]}))),
 fetch('./data/commercial-family-aliases-20261021.json?v=20261021-review').then(r=>r.ok?r.json():{aliases:[]}).catch(()=>({aliases:[]}))
]).then(([,first,portillo,gildemeister,aliases])=>{
 familyAliases=new Map((aliases.aliases||[]).map(a=>[a.sourceKey,a.canonicalKey]));
 dealerListings=[...(first.records||[]),...(portillo.records||[]),...(gildemeister.records||[])].filter(x=>x.listing==='new'&&x.brand&&x.family&&/^https:\/\/www\.(pompeyo\.cl\/producto\/|salazarisrael\.cl\/marcas\/|portillo\.cl\/marcas\/|gildemeisterretail\.cl\/marcas\/)/.test(x.source))
  .map(x=>({
   ...x,priceListClp:Number.isSafeInteger(x.listPriceClp)&&x.listPriceClp>0?x.listPriceClp:null,
   version:'Publicado como vehículo nuevo por concesionaria; versión no identificada',
   priceType:x.listPriceClp?'lista':null,checkedAt:x.observedAt,
   dealerObserved:true,currency:'CLP'
  }));
 rebuild();
 window.dispatchEvent(new Event('rindelab:market-ready'));
 if(lastCriteria){render();updateTray();}
}).catch(()=>{});
})();