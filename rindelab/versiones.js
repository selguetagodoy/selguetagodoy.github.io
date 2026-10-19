/* RINDELAB — interfaz de cotejo exploratorio; no asocia automáticamente códigos 3CV. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const number=new Intl.NumberFormat('es-CL');
const CLP=new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP',maximumFractionDigits:0});
const names={
 un_candidato_preliminar:'Un candidato preliminar',
 varios_candidatos_preliminares:'Varios candidatos preliminares',
 informacion_insuficiente:'Información insuficiente',
 solo_contradicciones:'Solo candidatos contradictorios',
 sin_familia_3cv:'Sin familia nominal en 3CV'
};
const labels={technology:'Tecnología',engine:'Cilindrada (L)',transmission:'Transmisión 3CV',drive:'Tracción',generation:'Código generación',fuel:'Combustible'};
let report=null;
let reviewNotes=[];
const formatSpecs=s=>Object.entries(s).map(([k,v])=>(labels[k]||k)+': '+v).join(' · ')||'Sin atributos explícitos utilizables';
const norm=s=>window.RindelabCoverage.normalized(s);
function td(tr,value){
 const cell=document.createElement('td');cell.textContent=String(value??'—');tr.append(cell);return cell;
}
function showCandidates(x,container){
 const summary=document.createElement('details');summary.className='version-details';
 const trigger=document.createElement('summary');trigger.textContent='Ver evidencia 3CV';summary.append(trigger);
 const inside=document.createElement('div');inside.className='version-evidence';
 const intro=document.createElement('p');
 intro.textContent='Familia nominal: '+x.familyCandidates+' fichas · sin contradicción: '+x.consistentCandidates+
  ' · con contradicciones: '+x.conflictingCandidates+'. Se muestran muestras limitadas; los conteos abarcan todas las fichas.';
 inside.append(intro);
 const addEvidence=(heading,items)=>{
  if(!items.length)return;
  const h=document.createElement('strong');h.textContent=heading;inside.append(h);
  const list=document.createElement('ul');
  for(const item of items){
   const li=document.createElement('li');
   const title=document.createElement('b');title.textContent=item.model+' · 3CV '+item.code3cv;li.append(title);
   const details=document.createElement('span');
   details.textContent=' · '+item.date+' · '+item.technology+' · '+item.engine+' L · transmisión '+item.transmission+' · '+item.drive;
   li.append(details);
   const why=document.createElement('small');
   const conflict=item.conflicts.map(c=>c.label+': comercial '+c.expected+' / 3CV '+c.observed);
   why.textContent=conflict.length?'Contradicciones: '+conflict.join('; '):
    'Atributos coincidentes: '+(item.agrees.join(', ')||'ninguno declarado')+
    (item.notStated.length?'. Sin dato en 3CV: '+item.notStated.join(', '):'');
   li.append(why);list.append(li);
  }
  inside.append(list);
 };
 addEvidence('Sin contradicciones en los atributos cotejados',x.examples);
 addEvidence('Con contradicciones documentales',x.conflictsExamples);
 const note=document.createElement('p');note.textContent='No se ha realizado confirmación técnica de identidad comercial ni de equipamiento; consulta el documento 3CV y el sitio oficial antes de vincular códigos.';
 inside.append(note);summary.append(inside);container.append(summary);
}
function visible(){
 if(!report)return [];
 const brand=$('versionsBrand').value,status=$('versionsFilter').value,q=norm($('versionsSearch').value);
 return report.cases.filter(x=>(!brand||x.brand===brand)&&(!status||x.status===status)&&(!q||norm(x.brand+' '+x.family+' '+x.version).includes(q))&&(!$('versionsPriorityOnly').checked||x.status==='un_candidato_preliminar'||x.status==='solo_contradicciones'));
}
function render(){
 if(!report)return;
 const tbody=$('versionsRows'),items=visible();tbody.replaceChildren();
 $('versionsCount').textContent=number.format(items.length)+' de '+number.format(report.catalogCount)+' versiones comerciales';
 for(const x of items){
  const tr=document.createElement('tr');
  const name=td(tr,x.brand+' · '+x.family);
  name.className='version-name';
  const v=document.createElement('strong');v.textContent=x.version;name.append(v);
  const amount=document.createElement('small');
  amount.textContent=CLP.format(x.priceListClp)+(x.modelYear?' · modelo '+x.modelYear:' · año modelo no informado');
  name.append(amount);
  const link=document.createElement('a');link.href=x.source;link.target='_blank';link.rel='noopener noreferrer';link.textContent='Precio de lista en fuente oficial ↗';name.append(link);
  td(tr,formatSpecs(x.expressedSpecifications));
  const counts=td(tr,'Familia: '+x.familyCandidates+' · Preliminares: '+x.reviewableCandidates);
  counts.className='version-numbers';
  const state=td(tr,names[x.status]||'Pendiente');
  state.className='version-status';
  if(x.singleCandidateCode){
   const code=document.createElement('p');code.className='candidate-identity';
   code.textContent='Código 3CV candidato: '+x.singleCandidateCode;
   state.append(code);
  }
  if(x.manufacturerEvidence){
   const evidence=document.createElement('details');evidence.className='manufacturer-evidence';
   const h=document.createElement('summary');h.textContent='Ver atributos respaldados por fabricante';evidence.append(h);
   const note=document.createElement('p');note.textContent=x.manufacturerEvidence.observation;evidence.append(note);
   const source=document.createElement('a');source.href=x.manufacturerEvidence.url;source.rel='noopener noreferrer';source.target='_blank';source.textContent='Consultar ficha oficial ↗';evidence.append(source);
   const warning=document.createElement('small');warning.textContent='No confirma que el código 3CV corresponda exactamente a esta versión.';evidence.append(warning);
   state.append(evidence);
  }
  if(x.sharedPreliminaryCandidate){
   const shared=document.createElement('p');shared.className='candidate-shared';
   shared.textContent='Atención: mismo código candidato usado por '+x.sharedWithOtherVersions+' otra(s) versión(es) comerciales. No demuestra equivalencia de equipamiento.';
   state.append(shared);
  }
  const manual=reviewNotes.find(note=>note.brand===x.brand&&note.family===x.family&&note.version===x.version);
  if(manual){
   const note=document.createElement('div');note.className='reviewed-discrepancy';
   const lead=document.createElement('strong');lead.textContent='Discrepancia contrastada con fabricante · pendiente aclaración 3CV';
   note.append(lead);
   const p=document.createElement('p');p.textContent=manual.manufacturerEvidenceSummary+' La ficha 3CV '+manual.candidateCode3cv+' registra transmisión '+manual.source3cvTransmission+'. No se ha resuelto la discrepancia con la fuente 3CV.';
   note.append(p);
   const manufacturer=document.createElement('a');manufacturer.href=manual.manufacturerEvidenceUrl;manufacturer.rel='noopener noreferrer';manufacturer.target='_blank';manufacturer.textContent='Ver especificación Volkswagen ↗';note.append(manufacturer);
   state.append(note);
  }
  if(x.familyCandidates)showCandidates(x,state);
  tbody.append(tr);
 }
 if(!items.length){const row=document.createElement('tr');td(row,'Sin versiones para los filtros seleccionados.').colSpan=4;tbody.append(row);}
}
function esc(s){return '"'+String(s??'').replace(/"/g,'""')+'"';}
function download(){
 if(!report)return;
 const header=['marca','familia','version','año_modelo','precio_lista_clp','fuente_precio','atributos_explicitos','candidatos_familia','sin_contradicciones','con_contradicciones','candidatos_preliminares','estado','codigos_3cv_de_muestra'];
 const rows=visible().map(x=>[x.brand,x.family,x.version,x.modelYear??'',x.priceListClp,x.source,formatSpecs(x.expressedSpecifications),x.familyCandidates,x.consistentCandidates,x.conflictingCandidates,x.reviewableCandidates,x.status,x.examples.map(e=>e.code3cv).join(' | ')]);
 const csv='\ufeff'+[header,...rows].map(r=>r.map(esc).join(';')).join('\r\n')+'\r\n';
 const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
 const a=document.createElement('a');a.href=url;a.download='rindelab-cotejo-versiones-preliminar.csv';
 document.body.append(a);a.click();a.remove();URL.revokeObjectURL(url);
}
async function load(){
 try{
  if(!window.RindelabVersionAudit||!window.RindelabCoverage)throw Error('Cotejo de versiones no disponible');
  const [prices,manifest,notes,manufacturer]=await Promise.all([
   fetch('./sii/commercial-2026.json?v=20261019-cotejo273').then(r=>{if(!r.ok)throw Error('Catálogo no disponible');return r.json();}),
   fetch('../vehiculos/data/manifest.json').then(r=>{if(!r.ok)throw Error('Manifiesto 3CV no disponible');return r.json();}),
   fetch('./sii/review-notes-2026.json?v=20261018-qa1').then(r=>{if(!r.ok)throw Error('Registro de discrepancias no disponible');return r.json();}),
   fetch('./sii/manufacturer-evidence-2026.json?v=20261018-sources1').then(r=>{if(!r.ok)throw Error('Evidencia de fabricantes no disponible');return r.json();})
  ]);
  if(notes.schemaVersion!==1||!Array.isArray(notes.cases))throw Error('Notas de auditoría inválidas');
  reviewNotes=notes.cases;
  const files=await Promise.all(manifest.files.map(p=>fetch('../vehiculos/'+p).then(r=>{if(!r.ok)throw Error('Falta archivo 3CV: '+p);return r.json();})));
  report=window.RindelabVersionAudit.audit(prices,files.flat(),manifest.published,manufacturer);
  $('versionTotal').textContent=number.format(report.catalogCount);
  $('versionSingle').textContent=number.format(report.counts.un_candidato_preliminar||0);
  $('versionMultiple').textContent=number.format(report.counts.varios_candidatos_preliminares||0);
  $('versionUnresolved').textContent=number.format(report.catalogCount-(report.counts.un_candidato_preliminar||0)-(report.counts.varios_candidatos_preliminares||0));
  $('versionsStatus').textContent='Corte 3CV '+report.sourceCut+' · '+number.format(report.threeCvRecords)+' homologaciones al corte · '+report.sourceReviewedVersions+' versiones contrastadas con ficha de fabricante. Equivalencias técnicas certificadas: ninguna.';
  const brands=[...new Set(report.cases.map(x=>x.brand))].sort((a,b)=>a.localeCompare(b,'es'));
  for(const b of brands)$('versionsBrand').add(new Option(b,b));
  $('versionsPrioritySummary').textContent=(report.counts.solo_contradicciones||0)+' discrepancias · '+(report.counts.un_candidato_preliminar||0)+' candidatos únicos · '+report.singleCandidateUniqueCodes+' códigos 3CV distintos entre estos últimos';
  $('versionsDownload').disabled=false;render();
 }catch(err){
  $('versionsStatus').textContent='No fue posible completar el cotejo: '+err.message+'. Reintenta actualizando la página.';
  $('versionsRows').replaceChildren();
  const tr=document.createElement('tr');td(tr,'Auditoría no disponible.').colSpan=4;$('versionsRows').append(tr);
 }
}
for(const id of ['versionsBrand','versionsFilter','versionsSearch','versionsPriorityOnly'])$(id).addEventListener(id==='versionsSearch'?'input':'change',render);
$('versionsDownload').addEventListener('click',download);
load();
})();
