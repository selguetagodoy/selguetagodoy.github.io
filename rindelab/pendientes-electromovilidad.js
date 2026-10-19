(()=>{'use strict';
const $=id=>document.getElementById(id),fmt=n=>Number(n).toLocaleString('es-CL'),norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
let rows=[],visible=[],limit=50;
function readCsv(src){
 let s=String(src).replace(/^\uFEFF/,''),r=[],field='',line=[],quoted=false;
 for(let i=0;i<s.length;i++){
  let c=s[i];
  if(c==='"'){if(quoted&&s[i+1]==='"'){field+='"';i++;}else quoted=!quoted;continue;}
  if(!quoted&&(c===','||c==='\n'||c==='\r')){
   if(c===','){line.push(field);field='';continue;}
   if(c==='\r'&&s[i+1]==='\n')i++;
   line.push(field);field='';if(line.some(v=>v!==''))r.push(line);line=[];continue;
  }
  field+=c;
 }
 if(quoted)throw Error('Archivo CSV incompleto');
 if(field||line.length){line.push(field);r.push(line);}
 const head=r.shift();if(!head||!head.includes('marca_fuente_3cv')||!head.includes('estado'))throw Error('Esquema CSV no reconocido');
 return r.map(v=>Object.fromEntries(head.map((h,i)=>[h,v[i]||''])));
}
function td(tr,text){const el=document.createElement('td');el.textContent=String(text);tr.appendChild(el);return el;}
function display(){
 const q=norm($('q').value).trim(),brand=$('brand').value,tech=$('tech').value,state=$('state').value,level=$('level').value;
 visible=rows.filter(r=>(!q||norm(r.marca_grupo+' '+r.marca_fuente_3cv+' '+r.modelo_fuente_3cv+' '+r.version_comercial).includes(q))&&(!brand||r.marca_grupo===brand)&&(!tech||r.tecnologia_3cv===tech)&&(!state||r.estado===state)&&(!level||r.prioridad.startsWith(level+'_')));
 const target=$('rows');target.replaceChildren();
 for(const r of visible.slice(0,limit)){
  const tr=document.createElement('tr');td(tr,r.prioridad.split('_')[0]).className='strong';
  const brandCell=td(tr,r.marca_grupo);if(r.marca_fuente_3cv!==r.marca_grupo){const detail=document.createElement('small');detail.textContent='3CV: '+r.marca_fuente_3cv;brandCell.append(detail);}
  const mod=td(tr,r.modelo_fuente_3cv);const detail=document.createElement('small');detail.textContent=r.codigo_3cv_referencia+' · '+r.cantidad_fichas_3cv+' ficha(s)';mod.append(detail);
  const techCell=td(tr,'');const pill=document.createElement('span');pill.className='pill';pill.textContent=r.tecnologia_3cv;techCell.append(pill);
  td(tr,r.fecha_ultima_ficha_3cv);
  td(tr,r.estado.replaceAll('_',' '));
  td(tr,r.precio_lista_clp?'$'+fmt(r.precio_lista_clp):'Pendiente de documentar');
  target.append(tr);
 }
 if(!visible.length){const tr=document.createElement('tr');td(tr,'No hay registros con estos filtros.').colSpan=7;target.append(tr);}
 $('shown').textContent='Mostrando '+fmt(Math.min(limit,visible.length))+' de '+fmt(visible.length)+' filas';
 $('more').hidden=visible.length<=limit;
 $('status').textContent=fmt(visible.length)+' revisiones en la selección';
}
async function init(){
 try{
  const response=await fetch('./sii/bandeja-precios-electromovilidad.csv?v=20261019-988');
  if(!response.ok)throw Error('No se pudo abrir matriz CSV');
  rows=readCsv(await response.text());
  $('total').textContent=fmt(rows.length);
  $('priority').textContent=fmt(rows.filter(x=>x.prioridad.startsWith('A_')).length);
  $('ready').textContent=fmt(rows.filter(x=>x.estado==='listo_para_importar').length);
  $('loaded').textContent=fmt(rows.filter(x=>x.estado==='ya_importado').length);
  [...new Set(rows.map(x=>x.marca_grupo))].sort((a,b)=>a.localeCompare(b,'es')).forEach(x=>$('brand').add(new Option(x,x)));
  display();
 }catch(e){$('status').textContent='Error: '+e.message;const tr=document.createElement('tr');td(tr,'No se pudo cargar el archivo de trabajo.').colSpan=7;$('rows').replaceChildren(tr);}
}
for(const id of ['q','brand','tech','state','level'])$(id).addEventListener(id==='q'?'input':'change',()=>{limit=50;display();});
$('more').addEventListener('click',()=>{limit+=50;display()});
init();
})();