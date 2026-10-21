/* RINDELAB / SII 2026 — consulta explícita de tasación y permiso por código y año.
   Nunca asigna automáticamente un código SII a una homologación 3CV. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const clean=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z0-9]+/g,' ').trim();
const escapeHTML=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clp=v=>Number.isFinite(v)?'$'+v.toLocaleString('es-CL'):'No informado';
const siiUrl='https://www.sii.cl/servicios_online/1049-3526.html';
const siiFile='https://www.sii.cl/servicios_online/tasacion_fiscal_vehiculos/liv2026.xlsx';
let indexPromise=null,commercialPromise=null,current=null;
const cache=new Map();
function loadIndex(){return indexPromise??=(fetch('./sii/data/index.json').then(r=>{if(!r.ok)throw Error('No se pudo abrir el índice SII');return r.json();}).catch(e=>{indexPromise=null;throw e}));}
function loadCommercial(){return commercialPromise??=(fetch('./sii/commercial-2026.json').then(r=>r.ok?r.json():[]).catch(()=>[]));}
function storedKey(row){return 'rindelab:sii2026:'+String(row[9]||'')+'|'+clean(row[0]+' '+row[1]);}
function getStored(row){
 try{const raw=localStorage.getItem(storedKey(row));if(!raw)return null;
 const obj=JSON.parse(raw);
 return obj&&Array.isArray(obj.entry)&&obj.entry.length>=7&&/^[A-Z]{2}\d{7}$/.test(obj.entry[0])?obj:null;
 }catch{return null;}
}
function store(row,entry){try{localStorage.setItem(storedKey(row),JSON.stringify({entry,chosenAt:new Date().toISOString()}))}catch{}}
function remove(row){try{localStorage.removeItem(storedKey(row))}catch{}}
function commercialFor(row,family,items){
 const rb=clean(row[0]),rm=clean(family);
 return items.find(x=>clean(x.brand)===rb&&clean(x.model)===rm)||null;
}
function reportSelected(obj){
 const r=obj.entry;return '<div class="sii-selected"><div class="sii-kpis">'+
 '<div><small>Tasación fiscal SII 2026</small><strong>'+clp(r[5])+'</strong></div>'+
 '<div><small>Permiso circulación 2026</small><strong>'+clp(r[6])+'</strong></div></div>'+
 '<p>Registro elegido: <strong>'+escapeHTML(r[2]+' '+r[3]+' '+r[4])+'</strong>, fabricación '+escapeHTML(r[1])+', código SII <strong>'+escapeHTML(r[0])+'</strong>.</p>'+
 '<p class="sii-small">Selección manual de una versión SII. No equivale al código de homologación 3CV.</p></div>';
}
async function show(row,family){
 current={row,family};
 const detail=$('detailContent');if(!detail)return;
 const section=document.createElement('section');section.className='sii-section';section.id='siiSection';
 section.innerHTML='<div class="sii-section-head"><div><span class="sii-overline">REFERENCIA TRIBUTARIA · AÑO 2026</span><h3>Tasación, permiso y precio</h3></div><span class="sii-origin">SII 2026</span></div>'+
 '<p class="sii-small">El permiso corresponde al valor publicado por el SII para el año y código seleccionados. La tasación no es el precio comercial de reventa.</p>'+
 '<div id="siiCurrentValue">'+(getStored(row)?reportSelected(getStored(row)):'<p class="sii-pending">Elige el año y la versión del SII para conocer los valores oficiales. No se asignan automáticamente.</p>')+'</div>'+
 '<div class="sii-actions"><button id="siiShowLookup" type="button" class="button primary">Consultar tasación y permiso</button><button id="siiClear" type="button" class="button secondary" '+(getStored(row)?'':'hidden')+'>Quitar selección</button></div>'+
 '<div id="siiLookup" class="sii-lookup" hidden></div>'+
 '<div id="siiCommercial" class="sii-commercial"><small>Precio comercial nuevo</small><p>Buscando precios oficiales documentados…</p></div>'+
 '<div class="sii-links"><a href="'+siiUrl+'" target="_blank" rel="noopener noreferrer">Consulta oficial SII ↗</a><a href="'+siiFile+'" target="_blank" rel="noopener noreferrer">Planilla SII 2026 ↗</a></div>';
 detail.append(section);
 window.RindelabUsed?.mount(section,row[0],family);
 const button=section.querySelector('#siiShowLookup');
 button.addEventListener('click',()=>openLookup(section,row,family));
 section.querySelector('#siiClear').addEventListener('click',()=>{
  remove(row);section.querySelector('#siiCurrentValue').innerHTML='<p class="sii-pending">No hay una versión SII seleccionada para esta ficha.</p>';
  section.querySelector('#siiClear').hidden=true;
 });
 const commercial=await loadCommercial();
 if(!section.isConnected)return;
 const match=commercialFor(row,family,commercial),dest=section.querySelector('#siiCommercial');
 if(match){
  dest.innerHTML='<small>Precio comercial NUEVO · REFERENCIA POR MODELO</small><strong>'+clp(match.price)+' <span>desde</span></strong>'+
  '<p>No corresponde necesariamente a esta versión ni a este año de fabricación. Condiciones, bonos y disponibilidad sujetos a confirmación; registro revisado el '+escapeHTML(match.date)+'.</p>'+
  '<a target="_blank" rel="noopener noreferrer" href="'+escapeHTML(match.source)+'">Ver precio publicado por la marca ↗</a>';
 }else{
  dest.innerHTML='<small>Precio comercial NUEVO</small><p>No hay un precio de venta nuevo verificado para esta versión en el catálogo de RINDELAB. Puede estar descontinuada; no se infiere un precio desde la tasación SII.</p>';
 }
}
/* Acceso independiente para publicaciones comerciales sin ficha 3CV.
 * La asignación SII requiere año y selección explícita de versión, nunca automática. */
function commercialRow(brand,family,technology=''){
 const row=Array(10).fill('');
 row[0]=brand;row[1]=family;row[9]='COMERCIAL-'+clean(technology||'NO INFORMADA');
 return row;
}
function getCommercialSelection(brand,family,technology=''){
 return getStored(commercialRow(brand,family,technology))?.entry||null;
}
function openCommercial(brand,family,technology=''){
 if(!brand||!family)return;
 const row=commercialRow(brand,family,technology);
 let dialog=$('siiCommercialDialog');
 if(!dialog){
  dialog=document.createElement('dialog');
  dialog.id='siiCommercialDialog';dialog.className='modal sii-standalone-modal';
  dialog.setAttribute('aria-labelledby','siiCommercialTitle');
  dialog.style.width='min(860px,calc(100% - 20px))';
  dialog.style.maxHeight='90vh';dialog.style.overflowY='auto';
  document.body.append(dialog);
 }
 if(dialog.open)dialog.close();
 const stored=getStored(row);
 dialog.innerHTML='<div class="modal-head"><div><h2 id="siiCommercialTitle">Tasación y permiso SII 2026</h2><p>'+escapeHTML(brand+' '+family)+'</p></div>'+
  '<button class="button secondary" id="siiCommercialClose" type="button">Cerrar ×</button></div>'+
  '<section class="sii-section"><p class="sii-small">Selecciona el año de fabricación y la versión que coincida con el registro del SII. Una denominación comercial no acredita identidad con el código tributario ni con una homologación 3CV. Los vehículos nuevos de 2026 pueden requerir su factura según las reglas del SII.</p>'+
  '<div id="siiCurrentValue">'+(stored?reportSelected(stored):'<p class="sii-pending">Sin versión tributaria elegida. La tasación fiscal no es el precio comercial del vehículo.</p>')+'</div>'+
  '<div class="sii-actions"><button type="button" class="button primary" id="siiCommercialSearch">Buscar tasación 2026</button>'+
  '<button type="button" class="button secondary" id="siiClear" '+(stored?'':'hidden')+'>Quitar selección</button></div>'+
  '<div id="siiLookup" class="sii-lookup" hidden></div>'+
  '<div class="sii-links"><a href="'+siiUrl+'" target="_blank" rel="noopener noreferrer">Consulta oficial SII ↗</a>'+
  '<a href="'+siiFile+'" target="_blank" rel="noopener noreferrer">Planilla SII 2026 ↗</a></div></section>';
 const section=dialog.querySelector('.sii-section');
 window.RindelabUsed?.mount(section,brand,family);
 dialog.querySelector('#siiCommercialClose').addEventListener('click',()=>dialog.close());
 dialog.querySelector('#siiCommercialSearch').addEventListener('click',()=>openLookup(section,row,family));
 dialog.querySelector('#siiClear').addEventListener('click',()=>{
  remove(row);
  section.querySelector('#siiCurrentValue').innerHTML='<p class="sii-pending">Sin versión SII seleccionada.</p>';
  section.querySelector('#siiClear').hidden=true;
 });
 dialog.showModal();
 openLookup(section,row,family);
}
function options(select,list,placeholder){
 select.replaceChildren(new Option(placeholder,''),...list.map(x=>new Option(x.label,x.value)));
}
async function openLookup(section,row,family){
 const area=section.querySelector('#siiLookup');
 if(!area.hidden){area.hidden=true;return}
 area.hidden=false;area.innerHTML='<p class="sii-small">Cargando índice SII…</p>';
 try{
  const index=await loadIndex();if(!area.isConnected)return;
  area.innerHTML='<div class="sii-lookup-grid">'+
   '<div class="field"><label for="siiBrand">Marca según SII</label><select id="siiBrand"></select></div>'+
   '<div class="field"><label for="siiYear">Año de fabricación</label><select id="siiYear"></select></div>'+
   '<div class="field sii-model-search"><label for="siiModelQuery">Modelo o versión SII</label><input id="siiModelQuery" type="search" placeholder="Ej. Corolla Cross, Hilux, XEI"></div></div>'+
   '<p class="sii-small">El año corresponde a fabricación, no a homologación 3CV. Revisa equipamiento y versión antes de asociar un registro.</p>'+
   '<button type="button" id="siiSearch" class="button primary">Buscar en tasaciones SII</button>'+
   '<div id="siiMatches" role="status" aria-live="polite"></div>';
  const brand=area.querySelector('#siiBrand'),year=area.querySelector('#siiYear'),query=area.querySelector('#siiModelQuery');
  options(brand,index.brands.map(x=>({value:x.name,label:x.name})),'Selecciona marca SII');
  const brandKey=clean(row[0]),aliases={'MERCEDES BENZ':'MERCEDES BENZ','M BENZ':'MERCEDES BENZ','GREAT WALL':'GREAT WALL'};
  const expected=aliases[brandKey]||brandKey;
  const found=index.brands.find(x=>clean(x.name)===expected);
  if(found)brand.value=found.name;
  options(year,Array.from({length:52},(_,i)=>({label:String(2026-i),value:String(2026-i)})),'Selecciona año');
  const stored=getStored(row);if(stored&&stored.entry[1])year.value=String(stored.entry[1]);
  query.value=family||'';
  area.querySelector('#siiSearch').addEventListener('click',()=>lookup(area,index,row));
 }catch(e){area.textContent='No se pudo cargar la base SII: '+e.message+'. Puedes utilizar el enlace de consulta oficial.'}
}
async function lookup(area,index,row){
 const brand=area.querySelector('#siiBrand').value,yr=Number(area.querySelector('#siiYear').value),q=clean(area.querySelector('#siiModelQuery').value);
 const box=area.querySelector('#siiMatches');box.replaceChildren();
 if(!brand||!yr){box.innerHTML='<p class="sii-error">Selecciona la marca y el año de fabricación para consultar.</p>';return;}
 const brandInfo=index.brands.find(x=>x.name===brand);if(!brandInfo)return;
 const bucket=index.buckets.find(x=>x.bucket===brandInfo.bucket);
 if(!bucket){box.textContent='No se encontró el archivo para esta marca.';return;}
 try{
  if(!cache.has(bucket.file))cache.set(bucket.file,fetch('./sii/data/'+bucket.file).then(r=>{if(!r.ok)throw Error('Archivo no disponible');return r.json()}));
  const records=await cache.get(bucket.file);
  if(!box.isConnected)return;
  const tokens=q.split(' ').filter(Boolean);
  const matches=records.filter(r=>clean(r[2])===clean(brand)&&r[1]===yr&&tokens.every(token=>clean(r[3]+' '+r[4]).includes(token)));
  if(!matches.length){
   box.innerHTML='<p class="sii-error">No aparecen registros con estos filtros. Verifica el año de fabricación o prueba una búsqueda más corta; el SII puede registrar parte del nombre en «Versión».</p>';return;
  }
  box.innerHTML='<p class="sii-found">'+matches.length.toLocaleString('es-CL')+' registro(s) SII. '+(matches.length>30?'Se muestran los primeros 30; agrega palabras de la versión para acotar.':'Selecciona únicamente el que coincida con tu versión.')+'</p>';
  const list=document.createElement('div');list.className='sii-results';
  matches.sort((a,b)=>(a[3]+' '+a[4]).localeCompare(b[3]+' '+b[4],'es',{numeric:true}));
  for(const r of matches.slice(0,30)){
   const item=document.createElement('article');item.className='sii-item';
   item.innerHTML='<div><strong>'+escapeHTML(r[3]+' · '+r[4])+'</strong><span>Código SII: '+escapeHTML(r[0])+' · '+escapeHTML(r[1])+' · '+escapeHTML(r[7]||'')+'</span></div>'+
    '<div class="sii-item-values"><small>Tasación</small><b>'+clp(r[5])+'</b><small>Permiso</small><b>'+clp(r[6])+'</b></div>'+
    '<button type="button" class="button secondary">Seleccionar esta versión</button>';
   item.querySelector('button').addEventListener('click',()=>{
    store(row,r);
    const panel=area.closest('.sii-section');panel.querySelector('#siiCurrentValue').innerHTML=reportSelected({entry:r});
    panel.querySelector('#siiClear').hidden=false;
    area.hidden=true;
    area.querySelector('#siiMatches').replaceChildren();
   });
   list.append(item);
  }
  box.append(list);
 }catch(e){cache.delete(bucket.file);box.textContent='No fue posible consultar esta marca: '+e.message;}
}
function decorateComparison(vehicles){
 const table=$('compareContent')?.querySelector('.comparison-table tbody');if(!table||!vehicles.length)return;
 const tuples=vehicles.map(x=>x.row||x);
 const commercial=window.__rindelabCommercial||[];
 const rowDefs=[
  ['Valor de mercado usado (año elegido)',r=>{const p=window.RindelabUsed?.selected(r[0],window.RindelabSII.family?.(r)||String(r[1]).split(' ')[0]);return p?window.RindelabUsed.marketLabel(p):'Sin año/precio de usado seleccionado'}],
  ['Tasación fiscal SII 2026',r=>{const o=getStored(r);return o?clp(o.entry[5]):'Seleccionar versión SII en ficha'}],
  ['Permiso de circulación 2026',r=>{const o=getStored(r);return o?clp(o.entry[6]):'Seleccionar versión SII en ficha'}],
  ['Precio comercial nuevo (desde)',r=>{const m=commercialFor(r,window.RindelabSII.family?.(r)||String(r[1]).split(' ')[0],commercial);return m?clp(m.price)+' · por modelo':'Sin precio publicado verificado'}]
 ];
 for(const [name,format] of rowDefs){
  const tr=document.createElement('tr');tr.className='compare-row';
  const th=document.createElement('th');th.scope='row';th.className='compare-label';th.textContent=name;tr.append(th);
  for(const r of tuples){const td=document.createElement('td');td.className='compare-data';td.textContent=format(r);tr.append(td)}
  table.append(tr);
 }
}
loadCommercial().then(a=>{window.__rindelabCommercial=a});
window.RindelabSII={show,decorateComparison,openCommercial,getCommercialSelection};
})();
