/* Vista de homologaciones posteriores al corte; rendimientos permanecen sin imputación. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const countFmt=new Intl.NumberFormat('es-CL');
let report=null;
let historicGroups=[];
function normalized(s){return String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().trim();}
const categories={
 ICE:'Combustión interna',
 BEV:'Eléctrico a batería (BEV)',
 HEV:'Híbrido sin recarga (HEV)',
 PHEV:'Híbrido enchufable (PHEV)',
 REEV:'Eléctrico de rango extendido (REEV)'
};
function technology(row){
 const v=normalized(row.technology+' '+row.fuel);
 if(v.includes('RANGO EXTENDIDO')||v.includes('REEV'))return 'REEV';
 if(v.includes('BATERIA')||v.includes('BEV'))return 'BEV';
 if(v.includes('SIN RECARGA')||v.includes('HEV'))return 'HEV';
 if(v.includes('CON RECARGA')||v.includes('PHEV'))return 'PHEV';
 return 'ICE';
}
function td(tr,value,cls){
 const c=document.createElement('td');c.textContent=String(value??'');if(cls)c.className=cls;tr.append(c);return c;
}
function addSub(parent,text,tag='small'){
 const el=document.createElement(tag);el.textContent=text;parent.append(el);return el;
}
function groupHistorical(rows){
 const groups=new Map();
 for(const r of rows){
  if(!r.code||!r.brand||!r.date||r.date>'2026-05-08')throw Error('Fila histórica inválida en MTT');
  if(!groups.has(r.code))groups.set(r.code,{
   ...r,models:[],certificates:[],variants:0,dates:[],technologies:[],fuels:[]
  });
  const g=groups.get(r.code);
  if(!g.models.includes(r.model))g.models.push(r.model);
  if(!g.certificates.includes(r.certificate))g.certificates.push(r.certificate);
  if(!g.dates.includes(r.date))g.dates.push(r.date);
  if(!g.technologies.includes(r.technology))g.technologies.push(r.technology);
  if(!g.fuels.includes(r.fuel))g.fuels.push(r.fuel);
  g.variants++;
 }
 const result=[...groups.values()].sort((a,b)=>b.date.localeCompare(a.date)||a.brand.localeCompare(b.brand,'es')||a.code.localeCompare(b.code));
 if(result.length!==325||result.reduce((total,x)=>total+x.variants,0)!==373)throw Error('Los 325 códigos históricos o sus 373 filas no son consistentes');
 return result;
}
function dataset(){return $('deltaGroup').value==='historical'?historicGroups:report.recentRecords;}
function updateBrandChoices(){
 const brand=$('deltaBrand'),previous=brand.value;
 brand.replaceChildren(new Option('Todas',''));
 for(const name of [...new Set(dataset().map(r=>r.brand))].sort((a,b)=>a.localeCompare(b,'es')))brand.add(new Option(name,name));
 if([...brand.options].some(x=>x.value===previous))brand.value=previous;
}
function switchGroup(){
 const old=$('deltaGroup').value==='historical';
 $('deltaMonth').value='';
 $('deltaPresence').value='';
 $('deltaMonth').disabled=old;$('deltaPresence').disabled=old;
 $('deltaMonth').closest('.field').classList.toggle('delta-disabled',old);
 $('deltaPresence').closest('.field').classList.toggle('delta-disabled',old);
 $('deltaTableTitle').textContent=old?'Códigos históricos MTT sin ficha en mayo':'Homologaciones fechadas después de mayo';
 $('deltaGroupDescription').textContent=old?
  '325 códigos distintos en 373 filas MTT con fecha hasta el 8 de mayo. No son altas nuevas, ni se puede concluir que estén a la venta.':
  '230 registros posteriores al corte, de los cuales 229 no aparecen en la base de rendimientos anterior.';
 updateBrandChoices();render();
}
function visible(){
 if(!report)return [];
 const b=$('deltaBrand').value, tech=$('deltaTech').value,month=$('deltaMonth').value,
 q=normalized($('deltaSearch').value),state=$('deltaPresence').value;
 return dataset().filter(x=>
  (!b||x.brand===b)&&(!tech||technology(x)===tech)&&(!month||x.date.startsWith(month))&&
  (!q||normalized(x.code+' '+x.brand+' '+x.model+' '+x.certificate+' '+(x.models||[]).join(' ')+' '+(x.certificates||[]).join(' ')).includes(q))&&
  (!state||(state==='present'?x.inMaySource:!x.inMaySource))
 );
}
function render(){
 if(!report)return;
 const list=visible();const tbody=$('deltaRows');tbody.replaceChildren();
 const historical=$('deltaGroup').value==='historical';
 $('deltaCount').textContent=historical?
  countFmt.format(list.length)+' de 325 códigos históricos exclusivos de MTT (373 filas documentales)':
  countFmt.format(list.length)+' de '+countFmt.format(report.counts.afterMayRows)+' homologaciones posteriores a mayo';
 for(const x of list){
  const tr=document.createElement('tr');
  const model=td(tr,x.model,'delta-model');const small=document.createElement('small');small.textContent=x.brand;model.prepend(small);
  if(historical&&x.models.length>1){
   const variants=document.createElement('details');variants.className='delta-variants';
   const summary=document.createElement('summary');summary.textContent=x.models.length+' denominaciones de modelo';variants.append(summary);
   const ul=document.createElement('ul');
   for(const v of x.models){const li=document.createElement('li');li.textContent=v;ul.append(li);}
   variants.append(ul);model.append(variants);
  }
  const code=td(tr,x.code,'delta-code');addSub(code,historical?x.certificates.join(' · '):x.certificate);
  if(historical&&x.variants>1)addSub(code,x.variants+' filas de la nómina MTT bajo este código');
  td(tr,x.date,'delta-date');
  const tech=td(tr,categories[technology(x)],'delta-technology');
  addSub(tech,'Transmisión '+x.transmission+(x.engineL>0?' · '+x.engineL+' L':'')+(x.fuel&&x.fuel!=='N/A'?' · '+x.fuel:''));
  const state=td(tr,historical?'Ausente de la base de mayo · histórico':
    (x.inMaySource?'Ya aparece en mayo':'Sin ficha en la base de mayo'),
    'delta-status'+(x.inMaySource?' present':''));
  addSub(state,historical?
   'Homologación con fecha hasta el 8 de mayo; su ausencia en la base de rendimiento no representa una alta reciente.':
   (x.inMaySource?'La fecha MTT posterior no acredita un modelo nuevo.':'No se atribuye rendimiento comparable ni disponibilidad comercial.'));
  tbody.append(tr);
 }
 if(!list.length){const tr=document.createElement('tr');td(tr,'No hay registros con los filtros seleccionados.').colSpan=5;tbody.append(tr);}
}
function renderDifferences(){
 const tbody=$('deltaConflicts');tbody.replaceChildren();
 for(const x of report.matchedCodeTechnicalDifferences){
  const tr=document.createElement('tr'),main=td(tr,x.code);
  addSub(main,x.mtt.brand+' · '+x.mtt.model,'strong');
  addSub(main,'Transmisión '+x.mtt.transmission+' · '+x.mtt.engineL+' L');
  const mtt=td(tr,x.mtt.transmission+' · '+x.mtt.engineL+' L');
  addSub(mtt,'Registro MTT septiembre');
  const may=td(tr,x.may.transmission+' · '+x.may.engineL+' L');
  addSub(may,'Registro 3CV mayo');
  tbody.append(tr);
 }
}
function csvCell(s){
 const v=String(s??'');
 const safe=/^[=+\-@\t\r]/.test(v)?"'"+v:v;
 return '"'+safe.replace(/"/g,'""')+'"';
}
function download(){
 if(!report)return;
 const historical=$('deltaGroup').value==='historical';
 const header=['grupo_documental','marca','modelos_registrados_mtt','codigo_3cv','certificados','fechas_homologacion_mtt',
  'tecnologia_mtt','combustible_mtt','transmision_mtt','cilindrada_l','filas_agrupadas','presencia_base_mayo','rendimiento_imputado'];
 const rows=visible().map(r=>[historical?'HISTORICO HASTA MAYO':'POSTERIOR A MAYO',r.brand,
  historical?r.models.join(' | '):r.model,r.code,historical?r.certificates.join(' | '):r.certificate,
  historical?r.dates.join(' | '):r.date,r.technology,r.fuel,r.transmission,r.engineL,
  historical?r.variants:1,r.inMaySource?'PRESENTE':'NO ENCONTRADO','NO']);
 const content='\ufeff'+[header,...rows].map(r=>r.map(csvCell).join(';')).join('\r\n')+'\r\n';
 const href=URL.createObjectURL(new Blob([content],{type:'text/csv;charset=utf-8'}));
 const a=document.createElement('a');a.href=href;a.download=historical?'rindelab-codigos-historicos-mtt-20260928.csv':'rindelab-homologaciones-recientes-mtt-20260928.csv';
 document.body.append(a);a.click();a.remove();URL.revokeObjectURL(href);
}
async function load(){
 try{
  const res=await fetch('./sii/mtt-sept-2026-may-2026-cross.json?v=20261018-delta1');
  if(!res.ok)throw Error('Archivo de cotejo no disponible');
  const data=await res.json();
  if(data.schemaVersion!==1||data.counts?.afterMayRows!==230||data.counts.afterMayNewCodes!==229||
    data.counts.codesInBoth!==7491||data.counts.matchedCodeTransmissionOrEngineConflicts!==12||
    data.recentRecords?.length!==230||data.historicMissingRecords?.length!==373||
    data.counts.olderMttRowsNotInMay!==373||data.matchedCodeTechnicalDifferences?.length!==12)throw Error('Cifras documentales incompletas');
  report=data;historicGroups=groupHistorical(data.historicMissingRecords);
  $('metricRecentNew').textContent=countFmt.format(report.counts.afterMayNewCodes);
  $('metricCommon').textContent=countFmt.format(report.counts.codesInBoth);
  $('metricMttOnly').textContent=countFmt.format(report.counts.mttCodesNotInMay);
  $('metricDiffs').textContent=countFmt.format(report.counts.matchedCodeTransmissionOrEngineConflicts);
  $('deltaStatus').textContent='Cortes: 3CV mayo '+report.source.mayCut+' · MTT septiembre 2026-09-28. '+report.counts.afterMayNewCodes+' códigos recientes sin ficha en mayo. Datos de rendimiento añadidos: ninguno.';
  $('deltaDownload').disabled=false;switchGroup();renderDifferences();
 }catch(error){
  $('deltaStatus').textContent='No fue posible completar el análisis: '+error.message+'. No se publican resultados parciales.';
  $('deltaDownload').disabled=true;
  const tbody=$('deltaRows');tbody.replaceChildren();const tr=document.createElement('tr');td(tr,'Cruce documental no disponible.').colSpan=5;tbody.append(tr);
 }
}
$('deltaGroup').addEventListener('change',switchGroup);
for(const id of ['deltaBrand','deltaTech','deltaMonth','deltaSearch','deltaPresence']){
 $(id).addEventListener(id==='deltaSearch'?'input':'change',render);
}
$('deltaDownload').addEventListener('click',download);
load();
})();