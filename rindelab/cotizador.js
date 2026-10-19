/* RINDELAB | Cotización independiente de precios comerciales, sin inferir vínculo con homologación 3CV. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const clp=n=>Number.isFinite(n)?'$'+Math.round(n).toLocaleString('es-CL'):'—';
const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const normal=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const positive=s=>s!==''&&s!==null&&Number.isFinite(Number(s))&&Number(s)>=0?Number(s):null;
const identity=x=>[x.brand,x.family,x.version,x.modelYear??''].join('|');
let catalog=[],visible=[],chosen=null,limit=24;
const dealerPages={Hyundai:'https://www.hyundai.cl/cotizador/',Changan:'https://www.changan.cl/formulario/cotizacion/'};
function ageDays(s){const n=Date.parse(String(s||'')+'T00:00:00Z');return Number.isFinite(n)?Math.max(0,Math.floor((Date.now()-n)/86400000)):null}
function statusText(rec){
 const days=ageDays(rec.checkedAt);
 return days===null?'Fecha no indicada':days>=30?'Revisión antigua ('+days+' días); confirma la vigencia':'Revisado el '+rec.checkedAt;
}
function options(node,values,placeholder){
 const selected=node.value;
 node.replaceChildren(new Option(placeholder,''),...values.map(v=>new Option(v,v)));
 if(values.includes(selected))node.value=selected;
}
function buildFilters(){
 const b=$('quoteBrand'),fam=$('quoteFamily');
 options(b,[...new Set(catalog.map(x=>x.brand))].sort((a,b)=>a.localeCompare(b,'es')),'Todas las marcas');
 if(new URLSearchParams(location.search).has('marca')){
  const param=new URLSearchParams(location.search).get('marca');
  if([...b.options].some(x=>normal(x.value)===normal(param)))b.value=[...b.options].find(x=>normal(x.value)===normal(param)).value;
 }
 updateFamilies();
 const params=new URLSearchParams(location.search),family=params.get('modelo');
 if(family&&[...fam.options].some(x=>normal(x.value)===normal(family)))fam.value=[...fam.options].find(x=>normal(x.value)===normal(family)).value;
 filter();
}
function updateFamilies(){
 const brand=$('quoteBrand').value;
 const families=[...new Set(catalog.filter(x=>!brand||x.brand===brand).map(x=>x.family))].sort((a,b)=>a.localeCompare(b,'es'));
 options($('quoteFamily'),families,'Todos los modelos');
}
function filter(){
 const q=normal($('quoteSearch').value),brand=$('quoteBrand').value,family=$('quoteFamily').value;
 visible=catalog.filter(x=>(!brand||x.brand===brand)&&(!family||x.family===family)&&
  (!q||normal([x.brand,x.family,x.version,x.modelYear||''].join(' ')).includes(q)));
 const sort=$('quoteSort').value;
 visible.sort((a,b)=>sort==='low'?a.priceListClp-b.priceListClp:
  sort==='high'?b.priceListClp-a.priceListClp:
  sort==='recent'?String(b.checkedAt).localeCompare(String(a.checkedAt)):
  (a.brand+' '+a.family+' '+a.version).localeCompare(b.brand+' '+b.family+' '+b.version,'es'));
 limit=24;render();
}
function render(){
 $('catalogCount').textContent=visible.length+' versiones comerciales encontradas de '+catalog.length+' precios documentados';
 const box=$('quoteResults');box.replaceChildren();
 if(!visible.length){const p=document.createElement('p');p.className='quote-empty';p.textContent='No hay versiones con precio de lista documentado para esos filtros. No se inventa una cotización.';box.append(p);}
 visible.slice(0,limit).forEach(x=>{
  const card=document.createElement('article');card.className='quote-version';
  const active=chosen&&identity(x)===identity(chosen);
  card.innerHTML='<div><strong>'+safe(x.brand+' '+x.family)+'</strong><span>'+safe(x.version)+(x.modelYear?' · modelo '+safe(x.modelYear):' · año no indicado')+'</span>'+
   '<small>'+safe(statusText(x))+'</small></div><div class="quote-version-price"><strong>'+clp(x.priceListClp)+'</strong><span>Lista sin bonos</span></div>';
  const actions=document.createElement('div');actions.className='quote-version-actions';
  const btn=document.createElement('button');btn.type='button';btn.className='button '+(active?'primary':'secondary');btn.textContent=active?'Versión seleccionada':'Cotizar esta versión';
  btn.disabled=!!active;btn.addEventListener('click',()=>select(x));
  const a=document.createElement('a');a.href=x.source;a.target='_blank';a.rel='noopener noreferrer';a.textContent='Precio oficial ↗';
  actions.append(btn,a);card.append(actions);box.append(card);
 });
 $('quoteMore').hidden=limit>=visible.length;
}
function extras(){
 const ids=['quoteGreen','quoteRegistration','quoteOther'],values=ids.map(id=>positive($(id).value));
 return values.every(x=>x!==null)?values.reduce((a,b)=>a+b,0):null;
}
function amount(){
 const other=extras();
 return chosen&&other!==null?chosen.priceListClp+other:null;
}
function finance(total){
 const out=$('quoteFinanceOut');
 if(total===null){out.textContent='Selecciona una versión y completa gastos válidos.';return}
 const entered=$('quoteAnnualRate').value.trim();
 if(entered===''){out.textContent='Ingresa una tasa para estimar cuotas.';return}
 const rate=Number(entered),pie=positive($('quoteDeposit').value),n=Number($('quoteMonths').value);
 if(!Number.isFinite(rate)||rate<0||rate>100||pie===null||pie>total){out.textContent='Revisa tasa, pie y monto financiado. El pie no puede superar el total.';return}
 const principal=total-pie,monthly=rate/100/12;
 const quota=principal===0?0:monthly===0?principal/n:principal*monthly/(1-Math.pow(1+monthly,-n));
 if(!Number.isFinite(quota)){out.textContent='No se pudo estimar una cuota con esos valores.';return}
 out.textContent='Monto financiado '+clp(principal)+' · cuota matemática '+clp(quota)+' mensuales × '+n+' meses · total pie + cuotas '+clp(pie+quota*n)+'. No incluye CAE, comisiones, seguros ni costos contractuales.';
}
function updateBudget(){
 const selected=$('quoteSelected'),total=amount();
 if(!chosen){
  selected.innerHTML='<p>Selecciona una versión del catálogo para calcular su presupuesto.</p>';
  $('quoteTotal').textContent='—';
  $('quoteTotalNote').textContent='Sin versión comercial seleccionada.';
  $('quoteSource').hidden=true;$('quoteDealer').hidden=true;
 }else{
  selected.innerHTML='<small>VERSIÓN COMERCIAL SELECCIONADA</small><h3>'+safe(chosen.brand+' '+chosen.family)+'</h3><p>'+safe(chosen.version)+
    (chosen.modelYear?' · '+safe(chosen.modelYear):' · año de modelo no informado')+'</p><strong>'+clp(chosen.priceListClp)+'</strong>'+
    '<p class="quote-date">Fuente consultada '+safe(chosen.checkedAt)+' · '+safe(statusText(chosen))+'.</p>';
  $('quoteTotal').textContent=total===null?'Revisa los gastos':clp(total);
  $('quoteTotalNote').textContent='Precio de lista '+clp(chosen.priceListClp)+' + gastos ingresados '+(extras()===null?'inválidos':clp(extras()))+'. Sin bonos.';
  $('quoteSource').href=chosen.source;$('quoteSource').hidden=false;
  const dealer=dealerPages[chosen.brand];$('quoteDealer').hidden=!dealer;
  if(dealer)$('quoteDealer').href=dealer;
 }
 $('quoteCopy').disabled=!chosen||total===null;
 $('quotePrint').disabled=!chosen||total===null;
 finance(total);
}
function select(item){chosen=item;updateBudget();render();$('quoteSummaryTitle').scrollIntoView({block:'nearest',behavior:'smooth'});}
function quoteText(){
 const total=amount();if(!chosen||total===null)return '';
 const parts=[
 'RINDELAB | Presupuesto referencial de automóvil nuevo',
 'Fecha de generación: '+new Date().toLocaleDateString('es-CL'),
 'Modelo comercial: '+chosen.brand+' '+chosen.family,
 'Versión seleccionada: '+chosen.version,
 'Año modelo: '+(chosen.modelYear||'No informado'),
 'Precio de lista sin bonos: '+clp(chosen.priceListClp),
 'Impuesto verde ingresado: '+clp(positive($('quoteGreen').value)),
 'Patente/inscripción y trámites ingresados: '+clp(positive($('quoteRegistration').value)),
 'Otros gastos ingresados: '+clp(positive($('quoteOther').value)),
 'TOTAL REFERENCIAL AL CONTADO: '+clp(total),
 'Precio revisado: '+chosen.checkedAt,
 'Fuente oficial: '+chosen.source,
 'No es una oferta vinculante ni disponibilidad confirmada. Los gastos deben verificarse con la marca. No se asume correspondencia con una ficha 3CV.'
 ];return parts.join('\n');
}
$('mobileNav').querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{$('mobileNav').open=false;}));
$('quoteBrand').addEventListener('change',()=>{updateFamilies();filter();});
$('quoteFamily').addEventListener('change',filter);
$('quoteSearch').addEventListener('input',filter);
$('quoteSort').addEventListener('change',filter);
$('quoteMore').addEventListener('click',()=>{limit+=24;render();});
for(const id of ['quoteGreen','quoteRegistration','quoteOther','quoteDeposit','quoteAnnualRate','quoteMonths'])$(id).addEventListener('input',updateBudget);
$('quoteCopy').addEventListener('click',async()=>{
 const content=quoteText();if(!content)return;
 try{await navigator.clipboard.writeText(content);$('quoteFeedback').textContent='Presupuesto copiado; confirma valores en la fuente oficial.';}
 catch{
  const field=document.createElement('textarea');field.value=content;field.readOnly=true;field.style.cssText='position:fixed;top:0;left:0;width:1px;height:1px';document.body.append(field);field.focus();field.select();const ok=document.execCommand('copy');field.remove();
  $('quoteFeedback').textContent=ok?'Presupuesto copiado.':'No se pudo copiar automáticamente; utiliza Imprimir para conservar tu cotización.';
 }
});
$('quotePrint').addEventListener('click',()=>{if(amount()!==null)window.print();});
async function init(){
 for(const id of ['quoteCopy','quotePrint'])$(id).disabled=true;
 try{
  const resp=await fetch('./sii/commercial-2026.json?v=20261018-list212');
  if(!resp.ok)throw Error('No disponible');
  const data=await resp.json();if(!Array.isArray(data))throw Error('Formato incorrecto');
  catalog=data.filter(x=>x&&x.currency==='CLP'&&Number.isInteger(x.priceListClp)&&x.priceListClp>0&&
   /^https:\/\//.test(x.source)&&x.brand&&x.family&&x.version&&/^2026-\d{2}-\d{2}$/.test(x.checkedAt));
  if(!catalog.length)throw Error('Catálogo vacío');
  $('quoteCatalogNumber').textContent=catalog.length+' registros de '+new Set(catalog.map(x=>x.brand)).size+' marcas';
  buildFilters();updateBudget();
 }catch(e){$('catalogCount').textContent='No se pudo abrir la base de precios de lista; vuelve a cargar la página.';$('quoteFeedback').textContent='Las cotizaciones quedan deshabilitadas hasta que el catálogo pueda verificarse.';}
}
init();
})();