/* RINDELAB · mercado de autos usados por modelo/año, sin inferir precios ni generaciones.
 * Los precios son avisos o rangos de terceros observados en su fecha documental,
 * NO transacciones cerradas ni tasaciones tributarias SII. */
(()=>{'use strict';
const DATA='./sii/data/used-market-20261021.json';
const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/&/g,' y ').replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');
const key=(b,m)=>norm(b)+'|'+norm(m);
const clp=n=>Number.isFinite(n)?'$'+n.toLocaleString('es-CL'):'N/D';
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let available=[],ready=false;
const toFamily=x=>norm(x).replace(/^(all new|new|nuevo|nueva) /,'');
const known=new Map();
const alias=new Map([
 ['citroen|c3 aircross','citroen|c3 aircross'],
 ['hyundai|veloster','hyundai|veloster'],
 ['chevrolet|spark gt','chevrolet|spark gt'],
 ['ford|eco sport','ford|ecosport'],
 ['toyota|corolla cross','toyota|corolla cross']
]);
function familyKey(b,m){const k=key(b,toFamily(m));return alias.get(k)||k;}
function marketFor(b,m){
 const k=familyKey(b,m);
 return known.get(k)||[];
}
function selectedYear(b,m){
 try{return Number(localStorage.getItem('rindelab:used-year:'+familyKey(b,m)))||null;}catch{return null;}
}
function selectYear(b,m,y){
 try{localStorage.setItem('rindelab:used-year:'+familyKey(b,m),String(y));}catch{}
}
function selected(b,m){
 const year=selectedYear(b,m);
 return year?marketFor(b,m).find(x=>x.year===year)||null:null;
}
function marketLabel(p){
 if(p.source==='AutoExplora')return 'Mediana de avisos '+clp(p.medianClp);
 return 'Rango comercial aproximado '+clp(p.lowClp)+'–'+clp(p.highClp);
}
function renderBody(box,b,m,year){
 const arr=marketFor(b,m);
 box.replaceChildren();
 const title=document.createElement('div');title.className='sii-section-head';
 title.innerHTML='<div><span class="sii-overline">MERCADO DE SEGUNDA MANO · CHILE</span><h3>Valor comercial de autos usados</h3></div><span class="sii-origin">PRECIOS OBSERVADOS</span>';
 box.append(title);
 const intro=document.createElement('p');intro.className='sii-small';
 intro.textContent='Precios solicitados por vendedores o rangos publicados por terceros, no precios de compraventa cerrada. Corresponden a modelo y año, no necesariamente a la misma versión, kilometraje, región o estado. La tasación fiscal SII se consulta aparte.';
 box.append(intro);
 if(!arr.length){
  const p=document.createElement('p');p.className='sii-pending';p.textContent='Aún no hay una referencia de mercado respaldada para esta familia y año en el corte disponible. No se estima un precio con depreciaciones supuestas.';
  box.append(p);
 }else{
  const row=document.createElement('div');row.className='sii-actions';
  const lbl=document.createElement('label');lbl.textContent='Año de fabricación del usado ';
  const pick=document.createElement('select');pick.className='sii-used-year';pick.setAttribute('aria-label','Año de fabricación del auto usado');
  pick.append(new Option('Ver precios por año (elige uno)',''));
  arr.forEach(x=>pick.append(new Option(String(x.year),String(x.year))));
  const valid=arr.some(x=>x.year===year);if(valid)pick.value=String(year);
  pick.addEventListener('change',()=>{const yr=Number(pick.value)||null;if(yr)selectYear(b,m,yr);renderBody(box,b,m,yr);});
  lbl.append(pick);row.append(lbl);box.append(row);
  const focus=valid?arr.filter(x=>x.year===year):arr;
  const small=document.createElement('div');small.className='sii-used-records';
  for(const p of focus){
   const card=document.createElement('article');card.className='sii-item';
   const title=document.createElement('strong');title.textContent=b+' '+m+' · '+p.year;
   const stats=document.createElement('div');stats.className='sii-item-values';
   const main=document.createElement('b');main.className='sii-used-market-price';main.textContent=p.medianClp?clp(p.medianClp):clp(p.lowClp)+' – '+clp(p.highClp);
   const detail=document.createElement('span');
   detail.textContent=p.source==='AutoExplora'?'Mediana · rango p10–p90 '+clp(p.p10Clp)+' a '+clp(p.p90Clp)+' · '+p.sampleSize+' avisos'+(p.medianKm?' · '+p.medianKm.toLocaleString('es-CL')+' km medianos':''):
    'Rango mínimo–máximo aproximado del proveedor; muestra no publicada';
   const link=document.createElement('a');link.href=p.sourceUrl;link.target='_blank';link.rel='noopener noreferrer';
   link.textContent='Consultar fuente '+p.source+' ↗';
   const observed=document.createElement('small');observed.textContent='Corte documentado '+p.observedAt+' · información sujeta a cambios';
   const left=document.createElement('div');left.append(title,document.createElement('p'),detail,document.createElement('p'),observed,document.createElement('p'),link);
   stats.append(main);card.append(left,stats);small.append(card);
  }
  box.append(small);
  if(!valid){const note=document.createElement('p');note.className='sii-small';note.textContent='Valores disponibles para los años indicados; selecciona el año real de fabricación para utilizarlo en el comparador.';box.append(note);}
 }
 const links=document.createElement('p');links.className='sii-links';
 links.innerHTML='<a href="https://www.autoexplora.cl/precios" target="_blank" rel="noopener noreferrer">Ver referencias actualizadas en AutoExplora ↗</a> · <a href="https://www.autofact.cl/valor-comercial-autos.href" target="_blank" rel="noopener noreferrer">Consultar otro modelo en Autofact ↗</a>';
 box.append(links);
}
function mount(section,b,m){
 if(!section||!b||!m)return;
 let box=section.querySelector('.sii-used-market');if(box)box.remove();
 box=document.createElement('section');box.className='sii-used-market';
 box.setAttribute('aria-label','Precio comercial de autos usados');
 section.prepend(box);
 if(!ready){box.textContent='Cargando referencias del mercado de usados…';loaded.then(()=>{if(box.isConnected)renderBody(box,b,m,selectedYear(b,m));});}
 else renderBody(box,b,m,selectedYear(b,m));
}
const loaded=fetch(DATA).then(r=>{if(!r.ok)throw Error('No disponible');return r.json()}).then(obj=>{
 if(obj.schemaVersion!==1||!Array.isArray(obj.records))throw Error('Fuente de usados inválida');
 available=obj.records.filter(x=>x.year>=1980&&x.year<=2026&&/^(AutoExplora|Autofact)$/.test(x.source)&&x.sourceUrl.startsWith('https://'));
 known.clear();
 for(const p of available){const k=familyKey(p.brandSlug,p.modelSlug.replace(/-/g,' '));if(!known.has(k))known.set(k,[]);known.get(k).push(p);}
 for(const arr of known.values())arr.sort((a,b)=>b.year-a.year);
 ready=true;
}).catch(()=>{ready=true;known.clear()});
window.RindelabUsed=Object.freeze({mount,selected,selectedYear,marketFor,marketLabel,ready:loaded,count:()=>available.length});
})();