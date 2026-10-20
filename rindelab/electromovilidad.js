(()=>{'use strict';
const $=id=>document.getElementById(id),fmt=n=>Number(n).toLocaleString('es-CL');
const money=n=>'$'+fmt(n);
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const techNames={EV:'100 % eléctrico',HEV:'Híbrido',PHEV:'Híbrido enchufable',REEV:'Eléctrico con extensor',MHEV:'Híbrido suave'};
const brandAlias={'LEAPMOTOR':'Leapmotor','M. Benz':'Mercedes-Benz','Gac Gonow':'Gac'};
let prices=[],audit=null,page=30,gapExpanded=false;
function td(tr,value){const c=document.createElement('td');c.textContent=String(value);tr.append(c);return c}
function status(msg){$('electroStatus').textContent=msg}
function populate(){
 const brands=[...new Set(prices.map(p=>p.brand))].sort((a,b)=>a.localeCompare(b,'es'));
 for(const b of brands)$('eBrand').add(new Option(b,b));
 $('mPrices').textContent=fmt(prices.length);
 $('mBrands').textContent=fmt(brands.length);
}
function priceRows(){
 const term=norm($('eSearch').value),tech=$('eTech').value,brand=$('eBrand').value,sort=$('eSort').value;
 const result=prices.filter(p=>(!brand||p.brand===brand)&&(!tech||p.technology===tech)&&(!term||norm(p.brand+' '+p.family+' '+p.version).includes(term)));
 result.sort((a,b)=>sort==='high'?b.priceListClp-a.priceListClp:sort==='brand'?(a.brand+' '+a.family+' '+a.version).localeCompare(b.brand+' '+b.family+' '+b.version,'es'):sort==='recent'?b.checkedAt.localeCompare(a.checkedAt):a.priceListClp-b.priceListClp);
 $('electroRows').replaceChildren();
 for(const p of result.slice(0,page)){
  const tr=document.createElement('tr');
  const name=td(tr,p.brand+' '+p.family);name.replaceChildren();
  const title=document.createElement('strong');title.textContent=p.brand+' '+p.family;
  const description=document.createElement('small');description.textContent=p.version+(p.modelYear?' · año modelo '+p.modelYear:'');
  name.append(title,description);
  const t=td(tr,'');const badge=document.createElement('span');badge.className='tag';badge.textContent=techNames[p.technology]||p.technology;t.append(badge);
  const cost=td(tr,money(p.priceListClp));cost.className='price';
  const src=td(tr,'');const link=document.createElement('a');link.href=p.source;link.target='_blank';link.rel='noopener noreferrer';link.textContent='Ver fuente ↗';const date=document.createElement('small');date.textContent='Consultado: '+p.checkedAt+(p.sourceOfferEnd?' · campaña informada hasta '+p.sourceOfferEnd:'');src.append(link,date);
  $('electroRows').append(tr);
 }
 if(!result.length){const tr=document.createElement('tr');td(tr,'Sin precios documentados para los filtros seleccionados.').colSpan=4;$('electroRows').append(tr);}
 $('electroShowing').textContent='Mostrando '+Math.min(page,result.length)+' de '+result.length+' versiones';
 $('eMore').hidden=page>=result.length;
 status(result.length+' versiones con fuente, fecha y tecnología');
}
function gapRows(){
 if(!audit)return;
 const counts=new Map();
 for(const p of prices){const k=norm(p.brand);counts.set(k,(counts.get(k)||0)+1);}
 const rows=[...audit.brands].sort((a,b)=>b.records-a.records||a.brand.localeCompare(b.brand,'es'));
 $('gapRows').replaceChildren();
 for(const b of rows.slice(0,gapExpanded?rows.length:18)){
  const tr=document.createElement('tr');const raw=brandAlias[b.brand]||b.brand,found=counts.get(norm(raw))||0;
  td(tr,b.brand);td(tr,fmt(b.records));td(tr,fmt(found));
  const c=td(tr,found?'Con precios documentados':'Pendiente de investigación comercial');c.className=found?'gap-partial':'gap-open';
  $('gapRows').append(tr);
 }
 $('gapMore').hidden=gapExpanded||rows.length<=18;
 $('gapStatus').textContent=fmt(audit.brands.length)+' marcas con homologaciones recientes';
}
async function init(){
 try{
  const [p,a]=await Promise.all([
   fetch('./sii/commercial-2026.json?v=20261020-electro1081').then(r=>{if(!r.ok)throw Error('catálogo inaccesible');return r.json();}),
   fetch('./data/electromobility-3cv-audit-20261019.json').then(r=>{if(!r.ok)throw Error('auditoría no disponible');return r.json();})
  ]);
  if(!Array.isArray(p)||!a||!Array.isArray(a.brands))throw Error('estructura no válida');
  prices=p.filter(r=>techNames[r.technology]&&Number.isSafeInteger(r.priceListClp)&&r.priceListClp>0&&/^https:\/\//.test(r.source));
  audit=a;
  populate();priceRows();$('mRecords').textContent=fmt(audit.records);gapRows();
 }catch(e){status('No se pudieron cargar los datos: '+e.message);$('gapStatus').textContent='Auditoría no disponible';$('electroRows').replaceChildren();const tr=document.createElement('tr');td(tr,'Error de carga, recarga la página.').colSpan=4;$('electroRows').append(tr)}
}
for(const k of ['eSearch','eTech','eBrand','eSort'])$(k).addEventListener(k==='eSearch'?'input':'change',()=>{page=30;priceRows()});
$('eMore').addEventListener('click',()=>{page+=30;priceRows()});
$('gapMore').addEventListener('click',()=>{gapExpanded=true;gapRows()});
init();
})();