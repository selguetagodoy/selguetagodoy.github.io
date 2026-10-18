/* Vista de homologaciones posteriores al corte; rendimientos permanecen sin imputación. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const countFmt=new Intl.NumberFormat('es-CL');
let report=null;
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
function visible(){
 if(!report)return [];
 const b=$('deltaBrand').value, tech=$('deltaTech').value,month=$('deltaMonth').value,
 q=normalized($('deltaSearch').value),state=$('deltaPresence').value;
 return report.recentRecords.filter(x=>
  (!b||x.brand===b)&&(!tech||technology(x)===tech)&&(!month||x.date.startsWith(month))&&
  (!q||normalized(x.code+' '+x.brand+' '+x.model+' '+x.certificate).includes(q))&&
  (!state||(state==='present'?x.inMaySource:!x.inMaySource))
 );
}
function render(){
 if(!report)return;
 const list=visible();const tbody=$('deltaRows');tbody.replaceChildren();
 $('deltaCount').textContent=countFmt.format(list.length)+' de '+countFmt.format(report.counts.afterMayRows)+' homologaciones posteriores a mayo';
 for(const x of list){
  const tr=document.createElement('tr');
  const model=td(tr,x.model,'delta-model');const small=document.createElement('small');small.textContent=x.brand;model.prepend(small);
  const code=td(tr,x.code,'delta-code');addSub(code,x.certificate);
  td(tr,x.date,'delta-date');
  const tech=td(tr,categories[technology(x)],'delta-technology');
  addSub(tech,'Transmisión '+x.transmission+(x.engineL>0?' · '+x.engineL+' L':'')+(x.fuel&&x.fuel!=='N/A'?' · '+x.fuel:''));
  const state=td(tr,x.inMaySource?'Ya aparece en mayo':'Sin ficha en la base de mayo','delta-status'+(x.inMaySource?' present':''));
  addSub(state,x.inMaySource?'La fecha MTT posterior no acredita un modelo nuevo.':'No se atribuye rendimiento comparable ni disponibilidad comercial.');
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
 const header=['marca','modelo_mtt','codigo_3cv','numero_certificado','fecha_homologacion_mtt',
  'tecnologia_mtt','combustible_mtt','transmision_mtt','cilindrada_l','presencia_base_mayo','rendimiento_imputado'];
 const rows=visible().map(r=>[r.brand,r.model,r.code,r.certificate,r.date,r.technology,r.fuel,r.transmission,r.engineL,
  r.inMaySource?'PRESENTE':'NO ENCONTRADO','NO']);
 const content='\ufeff'+[header,...rows].map(r=>r.map(csvCell).join(';')).join('\r\n')+'\r\n';
 const href=URL.createObjectURL(new Blob([content],{type:'text/csv;charset=utf-8'}));
 const a=document.createElement('a');a.href=href;a.download='rindelab-homologaciones-recientes-mtt-20260928.csv';
 document.body.append(a);a.click();a.remove();URL.revokeObjectURL(href);
}
async function load(){
 try{
  const res=await fetch('./sii/mtt-sept-2026-may-2026-cross.json?v=20261018-delta1');
  if(!res.ok)throw Error('Archivo de cotejo no disponible');
  const data=await res.json();
  if(data.schemaVersion!==1||data.counts?.afterMayRows!==230||data.counts.afterMayNewCodes!==229||
    data.counts.codesInBoth!==7491||data.counts.matchedCodeTransmissionOrEngineConflicts!==12||
    data.recentRecords?.length!==230||data.matchedCodeTechnicalDifferences?.length!==12)throw Error('Cifras documentales incompletas');
  report=data;
  $('metricRecentNew').textContent=countFmt.format(report.counts.afterMayNewCodes);
  $('metricCommon').textContent=countFmt.format(report.counts.codesInBoth);
  $('metricMttOnly').textContent=countFmt.format(report.counts.mttCodesNotInMay);
  $('metricDiffs').textContent=countFmt.format(report.counts.matchedCodeTransmissionOrEngineConflicts);
  $('deltaStatus').textContent='Cortes: 3CV mayo '+report.source.mayCut+' · MTT septiembre 2026-09-28. '+report.counts.afterMayNewCodes+' códigos recientes sin ficha en mayo. Datos de rendimiento añadidos: ninguno.';
  for(const name of [...new Set(data.recentRecords.map(r=>r.brand))].sort((a,b)=>a.localeCompare(b,'es'))) $('deltaBrand').add(new Option(name,name));
  $('deltaDownload').disabled=false;render();renderDifferences();
 }catch(error){
  $('deltaStatus').textContent='No fue posible completar el análisis: '+error.message+'. No se publican resultados parciales.';
  $('deltaDownload').disabled=true;
  const tbody=$('deltaRows');tbody.replaceChildren();const tr=document.createElement('tr');td(tr,'Cruce documental no disponible.').colSpan=5;tbody.append(tr);
 }
}
for(const id of ['deltaBrand','deltaTech','deltaMonth','deltaSearch','deltaPresence']){
 $(id).addEventListener(id==='deltaSearch'?'input':'change',render);
}
$('deltaDownload').addEventListener('click',download);
load();
})();