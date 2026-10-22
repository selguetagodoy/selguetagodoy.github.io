/* Precios de lista nuevos — fuentes oficiales por versión; nunca se asocian automáticamente a fichas 3CV. */
(()=>{'use strict';
const api=window.RindelabSII,C=window.RindelabIdentity;if(!api||!C)return;
const originalShow=api.show,originalCompare=api.decorateComparison;
const clp=n=>Number.isFinite(n)?'$'+Math.round(n).toLocaleString('es-CL'):'Sin precio';
const displayPrice=p=>clp(p.priceListClp)+(p.taxIncluded===false?' + IVA':'');
const priceKind=p=>p.priceType==='oferta'?'Oferta publicada':p.priceType==='desde'||p.version.startsWith('Precio desde')?'Precio desde publicado':p.priceType==='lista'?'Precio de lista acreditado':'Precio publicado · tipo sin acreditar';
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z0-9]+/g,' ').trim();
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const makeIdentity=p=>norm([p.brand,p.family,p.version,p.modelYear||'N/A'].join(' '));
function ageDays(value){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(String(value||'')))return null;
 const checked=Date.parse(value+'T00:00:00Z');
 return Number.isFinite(checked)?Math.max(0,Math.floor((Date.now()-checked)/86400000)):null;
}
function ageWarning(record){
 const days=ageDays(record?.checkedAt);
 return days!==null&&days>=30?'Datos revisados hace '+days+' días. Confirma el precio de lista en el sitio enlazado antes de comparar o comprar.':'';
}
const storageKey=row=>'rindelab:priceList2026:'+String(row[9]||'')+'|'+norm(row[0]+' '+row[1]);
let promise=null,loaded=[],byFamily=new Map();
function catalog(){
 return promise??=(fetch('./sii/commercial-2026.json?v=20261022-list1514').then(r=>{if(!r.ok)throw Error('catálogo no disponible');return r.json();}).then(list=>{
  if(!Array.isArray(list))throw Error('formato de precios inválido');
  loaded=list.filter(C.valid);byFamily=C.index(loaded);
  window.dispatchEvent(new Event("rindelab:prices-ready"));
  return loaded;
 }).catch(()=>{loaded=[];return []}));
}
function match(row,family){
 return C.familyRecords(byFamily,row,family);
}
function selected(row){
 try{const key=localStorage.getItem(storageKey(row));return loaded.find(x=>C.active(x)&&C.compatible(row,x)&&makeIdentity(x)===key)||null;}catch{return null;}
}
function persist(row,p){try{localStorage.setItem(storageKey(row),makeIdentity(p));}catch{}}
function clear(row){try{localStorage.removeItem(storageKey(row));}catch{}}
function render(section,row,family){
 const dst=section.querySelector('#siiCommercial');if(!dst)return;
 const available=match(row,family),compatible=available.filter(p=>C.compatible(row,p)),chosen=selected(row);
 dst.replaceChildren();
 const title=document.createElement('div');title.className='sii-price-head';
 title.innerHTML='<small>PRECIOS COMERCIALES PUBLICADOS · REVISAR CONDICIONES</small>'+
 '<p>Precios documentados de familias comerciales. No prueban equivalencia con la ficha homologada ni disponibilidad vigente. Se muestran otras motorizaciones únicamente como referencias de la familia y no pueden seleccionarse para esta ficha; las motorizaciones no informadas deben verificarse. Revisa vigencia, IVA y condiciones en la fuente.</p>';
 dst.append(title);
 if(chosen){
  const summary=document.createElement('div');summary.className='sii-selected-price';
  summary.innerHTML='<small>VERSIÓN COMERCIAL SELECCIONADA</small><strong>'+displayPrice(chosen)+'</strong>'+
   '<p>'+esc(chosen.brand+' '+chosen.family+' · '+chosen.version)+(chosen.modelYear?' · modelo '+chosen.modelYear:' · año de modelo no informado')+'</p>'+
   '<p class="sii-small">Fuente consultada: '+esc(chosen.checkedAt)+(chosen.sourceOfferEnd?' · Campaña documentada hasta '+esc(chosen.sourceOfferEnd):'')+'. El fabricante puede modificar el precio sin previo aviso.</p>'+
   (C.expired(chosen)?'<p class="sii-price-age" role="status">Campaña documentada terminada; precio histórico sin vigencia confirmada.</p>':'')+
   (ageWarning(chosen)?'<p class="sii-price-age" role="status">'+esc(ageWarning(chosen))+'</p>':'')+
   '<a href="'+esc(chosen.source)+'" target="_blank" rel="noopener noreferrer">Ver precio publicado ↗</a>';
  const remove=document.createElement('button');remove.type='button';remove.className='button secondary';remove.textContent='Quitar versión comercial';
  remove.addEventListener('click',()=>{clear(row);render(section,row,family);});
  const quote=document.createElement('a');
  quote.href='./cotizador.html?marca='+encodeURIComponent(chosen.brand)+'&modelo='+encodeURIComponent(chosen.family);
  quote.className='button secondary';quote.textContent='Preparar presupuesto de compra ↗';
  quote.title='Elegir versión en cotizador; no se equipara a homologación 3CV';
  summary.append(remove,quote);dst.append(summary);
 }else if(available.length){
  const p=document.createElement('p');p.className='sii-pending';
  p.textContent=compatible.length?'Hay '+compatible.length+' referencia(s) comerciales compatibles o sin motorización declarada. Elige manualmente la versión: no se certifica equivalencia con la homologación 3CV.': 'Esta familia tiene precios publicados, pero ninguno declara la misma motorización: se presentan solo como referencia, sin permitir asociarlos a esta homologación.';
  dst.append(p);
 }
 if(!available.length){
  const missing=document.createElement('p');missing.className='sii-pending';missing.textContent='Sin precio publicado de esta motorización. La homologación no acredita venta, stock ni lanzamiento; nunca se asignan precios de otra tecnología ni tasaciones SII como precio nuevo.';
  dst.append(missing);return;
 }
 const list=document.createElement('div');list.className='sii-price-list';
 for(const p of available){
  const otherTech=!C.compatible(row,p);
  const item=document.createElement('article');item.className='sii-price-item';
  item.innerHTML='<div><strong>'+esc(p.version)+'</strong><span>'+esc(p.brand+' '+p.family)+(p.modelYear?' · modelo '+p.modelYear:' · año no informado')+'</span><span>'+priceKind(p)+(p.taxIncluded===false?' · + IVA no incluido':'')+' · fuente consultada '+esc(p.checkedAt)+'</span>'+ (p.sourceOfferEnd?'<span class="sii-price-age">Campaña documentada hasta '+esc(p.sourceOfferEnd)+'</span>':'')+
    (otherTech?'<span class="sii-price-age">Otra motorización: no seleccionable para esta ficha 3CV</span>':'')+
    (C.expired(p)?'<span class="sii-price-age">Campaña finalizada: referencia histórica, verificar valor actual</span>':'')+
    (!p.technology?'<span class="sii-price-age">Motorización no informada por la fuente comercial</span>':'')+
    (ageWarning(p)?'<span class="sii-price-age">'+esc(ageWarning(p))+'</span>':'')+
    '</div><div class="sii-price-amount">'+displayPrice(p)+'</div>';
  const actions=document.createElement('div');actions.className='sii-price-actions';
  const choose=document.createElement('button');choose.type='button';choose.className='button secondary';choose.textContent='Elegir esta versión';
  choose.disabled=otherTech||(!!chosen&&makeIdentity(chosen)===makeIdentity(p));
  choose.addEventListener('click',()=>{persist(row,p);render(section,row,family);});
  const a=document.createElement('a');a.href=p.source;a.target='_blank';a.rel='noopener noreferrer';a.textContent='Ver fuente ↗';
  actions.append(choose,a);item.append(actions);list.append(item);
 }
 dst.append(list);
}
api.show=async function(row,family){
 await originalShow(row,family);
 const section=document.getElementById('siiSection');if(!section)return;
 await catalog();if(!section.isConnected)return;
 render(section,row,family);
};
api.decorateComparison=function(vehicles){
 originalCompare(vehicles);
 const table=document.querySelector('#compareContent .comparison-table tbody');
 if(!table)return;
 const rows=[...table.querySelectorAll('tr')],r=rows.find(x=>x.querySelector('th')?.textContent?.startsWith('Precio comercial nuevo'));
 if(!r)return;
 r.querySelector('th').textContent='Precio de lista nuevo (sin bonos)';
 const cells=[...r.querySelectorAll('td')],cars=vehicles.map(x=>x.row||x);
 cars.forEach((car,i)=>{const p=selected(car);if(cells[i])cells[i].textContent=p?displayPrice(p)+' · versión elegida':'Elegir versión comercial en ficha';});
};
window.RindelabCommercial={
 ready:catalog,
 records:()=>loaded.slice(),
 selected,
 available:(row,family)=>match(row,family),
 hasReference:(row,family)=>Boolean(C.priceReference(byFamily,row,family)),
 minimum:(row,family)=>C.priceReference(byFamily,row,family),
 cleanPrice:record=>record&&C.active(record)&&!C.expired(record)&&record.taxIncluded!==false&&record.priceType!=='oferta'&&record.priceType!=='desde'&&!/^Precio desde/i.test(record.version)&&record.priceListClp>0,
 clp,
 ageWarning
};
catalog();
})();
