/* RINDELAB · tasación fiscal SII directamente en la tarjeta del modelo/año.
 * La tasación se publica por código/versión SII, NO por un precio comercial genérico.
 * Una coincidencia única se muestra identificada; múltiples se presentan como intervalo
 * de registros reales y el usuario puede escoger una versión sin un segundo buscador.
 */
(()=>{'use strict';
const clean=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z0-9]+/g,' ').trim();
const money=n=>Number.isFinite(n)?'$'+n.toLocaleString('es-CL'):'No informado';
const source='https://www.sii.cl/servicios_online/1049-3526.html';
const aliases={'KIA':'KIA MOTORS','MERCEDES BENZ':'MERCEDES BENZ','MINI COOPER':'MINI'};
const storage=new Map();let indexPromise;
const index=()=>indexPromise??=fetch('./sii/data/index.json').then(r=>{if(!r.ok)throw Error('Índice SII no disponible');return r.json()}).catch(e=>{indexPromise=null;throw e});
function entries(file){
 if(!storage.has(file))storage.set(file,fetch('./sii/data/'+file).then(r=>{if(!r.ok)throw Error('Archivo SII no disponible');return r.json()}).catch(e=>{storage.delete(file);throw e}));
 return storage.get(file);
}
function tokens(model){
 const x=clean(model).replace(/\b\d{4}\b/g,'').replace(/\b(?:SEDAN ORIGINAL|GENERACION ANTERIOR|PRIMERA GENERACION|ORIGINAL)\b/g,'').trim();
 return x.split(' ').filter(Boolean);
}
function hits(records,brand,model,year,variant='',body=''){
 const bk=aliases[clean(brand)]||clean(brand),ts=tokens(model),vs=tokens(variant);
 if(!ts.length)return [];
 // Sólo tokens completos, nunca coincidencias por subcadenas (RIO no es SORRENTO).
 const has=(value,token)=>(' '+clean(value)+' ').includes(' '+token+' ');
 return records.filter(r=>clean(r[2])===bk&&r[1]===year&&
  ts.every(t=>has(r[3]+' '+r[4],t))&&
  (!vs.length||vs.every(t=>has(r[3]+' '+r[4],t)))&&
  (!body||clean(r[7])===clean(body))&&Number.isFinite(r[5])&&Number.isFinite(r[6]));
}
async function get(brand,model,year,variant='',body=''){
 const data=await index();const bk=aliases[clean(brand)]||clean(brand);
 const b=data.brands.find(x=>clean(x.name)===bk);
 if(!b)return {matches:[],reason:'Marca no encontrada en el índice tributario de 2026.'};
 const bucket=data.buckets.find(x=>x.bucket===b.bucket);
 if(!bucket)return {matches:[],reason:'No se encontró el archivo tributario de esta marca.'};
 return {matches:hits(await entries(bucket.file),brand,model,year,variant,body),reason:''};
}
function node(tag,cls,value){const el=document.createElement(tag);if(cls)el.className=cls;if(value!==undefined)el.textContent=value;return el}
function fiscalValues(container,rows,selected=null){
 const taxes=rows.map(x=>x[5]),permits=rows.map(x=>x[6]);
 if(selected){
  const v=node('div','used-sii-values');
  v.append(node('div','','Tasación: '+money(selected[5])),node('div','','Permiso: '+money(selected[6])));
  container.append(v,node('small','used-sii-caption','SII '+selected[1]+' · '+selected[3]+' '+selected[4]+' · código '+selected[0]));return;
 }
 const a=Math.min(...taxes),b=Math.max(...taxes),c=Math.min(...permits),d=Math.max(...permits);
 const val=node('div','used-sii-values');
 val.append(node('div','','Tasación: '+money(a)+(a===b?'':' – '+money(b))),node('div','','Permiso: '+money(c)+(c===d?'':' – '+money(d))));
 container.append(val,node('small','used-sii-caption','Intervalos entre '+rows.length+' registros tributarios del mismo modelo/año, no una tasación de versión específica.'));
}
function mount(card,{brand,model,year,variant='',body='',onSelected=null}) {
 if(!card)return;
 const section=node('section','used-sii-direct');
 section.setAttribute('aria-label','Tasación fiscal SII del vehículo');
 section.append(node('strong','used-sii-title','Tasación fiscal y permiso SII 2026'));
 card.append(section);
 if(!Number.isInteger(year)||year<1975||year>2026){
  section.append(node('p','used-sii-muted','Selecciona el año de fabricación arriba para consultar automáticamente las tasaciones de este modelo.'));
  return;
 }
 section.append(node('p','used-sii-muted','Cargando registros del modelo · '+year+'…'));
 get(brand,model,year,variant,body).then(({matches,reason})=>{
  if(!section.isConnected)return;
  section.replaceChildren(node('strong','used-sii-title','Tasación fiscal y permiso SII 2026'));
  if(!matches.length){
   section.append(node('p','used-sii-muted',reason||'Sin coincidencia inequívoca de modelo, versión y año en el registro SII; no se estima una tasación.'));
  }else if(matches.length===1){
   fiscalValues(section,matches,matches[0]);
   section.append(node('p','used-sii-muted','Único registro coincidente. Confirma que la versión y carrocería son las de tu vehículo.'));
  }else{
   fiscalValues(section,matches);
   const label=node('label','used-sii-select-label','Ver tasación de una versión específica');
   const select=node('select','used-sii-select');select.setAttribute('aria-label','Seleccionar versión tributaria');
   select.append(new Option('Selecciona una de '+matches.length+' versiones',''));
   const ordered=matches.slice().sort((a,b)=>(a[3]+' '+a[4]).localeCompare(b[3]+' '+b[4],'es',{numeric:true}));
   ordered.forEach((r,i)=>select.append(new Option(r[3]+' · '+r[4]+' ('+r[7]+') · '+r[0],String(i))));
   const detail=node('div','used-sii-exact');
   select.addEventListener('change',()=>{
    detail.replaceChildren();
    if(select.value!==''){
     const choice=ordered[Number(select.value)];
     fiscalValues(detail,[choice],choice);
     if(typeof onSelected==='function')onSelected(choice);
    }
   });
   label.append(select);section.append(label,detail);
  }
  const link=node('a','used-sii-source','Fuente oficial SII ↗');link.href=source;link.target='_blank';link.rel='noopener noreferrer';section.append(link);
 }).catch(()=>{
  if(section.isConnected){section.replaceChildren(node('strong','used-sii-title','Tasación fiscal y permiso SII 2026'),node('p','used-sii-muted','No se pudo cargar la información tributaria.'));const a=node('a','used-sii-source','Consultar SII ↗');a.href=source;a.target='_blank';a.rel='noopener noreferrer';section.append(a);}
 });
}
function mountYearPicker(card,{brand,model,variant='',body='',onSelected=null}){
 if(!card)return;
 const section=node('section','used-sii-direct');
 section.append(node('strong','used-sii-title','Tasación fiscal y permiso SII 2026'));
 const label=node('label','used-sii-select-label','Año de fabricación');
 const select=node('select','used-sii-select');select.setAttribute('aria-label','Año de fabricación para tasación SII');
 select.append(new Option('Selecciona el año de fabricación',''));
 for(let y=2026;y>=1975;y--)select.append(new Option(String(y),String(y)));
 const output=node('div','used-sii-by-year');
 label.append(select);section.append(label,node('p','used-sii-muted','El modelo ya está identificado. Selecciona únicamente el año; los valores de todas las versiones SII compatibles se cargarán aquí.'),output);
 select.addEventListener('change',()=>{
  output.replaceChildren();const y=Number(select.value);
  if(y)mount(output,{brand,model,variant,body,year:y,onSelected});
 });
 card.append(section);
}
window.RindelabDirectSII=Object.freeze({mount,mountYearPicker,hits,get});
})();