/* Control de homologaciones RINDELAB — las fuentes son comparables solo tras validación documental. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const formatter=new Intl.NumberFormat('es-CL');
let report=null;
const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase();
function td(row,s){const cell=document.createElement('td');cell.textContent=String(s??'');row.append(cell);return cell;}
function external(parent,url,title){
 if(!url)return;
 const link=document.createElement('a');link.href=url;link.target='_blank';link.rel='noopener noreferrer';
 link.textContent=title;parent.append(link);return link;
}
function visible(){
 if(!report)return [];
 const q=norm($('regSearch').value),brand=$('regBrand').value,shared=$('regShared').value;
 return report.cases.filter(c=>(!brand||c.brand===brand)&&(!shared||(shared==='multiple'?c.commercialVersions.length>1:c.commercialVersions.length===1))&&
 (!q||norm(c.brand+' '+c.code+' '+c.homologationModel+' '+c.commercialVersions.map(v=>v.version).join(' ')).includes(q)));
}
function render(){
 if(!report)return;
 const items=visible(),target=$('regRows');target.replaceChildren();
 $('regCount').textContent=formatter.format(items.length)+' de '+formatter.format(report.preliminaryCodes)+' códigos 3CV candidatos';
 for(const group of items){
  const tr=document.createElement('tr');
  const code=td(tr,group.code);code.className='reg-code';
  const model=document.createElement('strong');model.textContent=group.brand+' · '+group.homologationModel;code.append(model);
  const date=document.createElement('small');date.textContent='Homologación registrada: '+group.homologationDate;code.append(date);
  const specs=document.createElement('small');specs.textContent='3CV mayo: '+group.threeCvTechnology+' · '+group.threeCvEngine+' L · transmisión '+group.threeCvTransmission+' · '+group.threeCvDrive;code.append(specs);
  const certificate=document.createElement('small');certificate.className='reg-certificate';
  certificate.textContent='Nómina MTT 28/09: '+group.septemberCertificate+' · fila Excel '+group.septemberExcelRow+' · homologación '+group.septemberDate;code.append(certificate);
  const sepModel=document.createElement('small');sepModel.textContent='Modelo en nómina: '+group.septemberModel;code.append(sepModel);
  const versions=td(tr,'');versions.className='reg-versions';
  for(const item of group.commercialVersions){
   const p=document.createElement('p');p.textContent=item.family+' · '+item.version;versions.append(p);
   if(item.officialManufacturerSpecsUrl){
    external(versions,item.officialManufacturerSpecsUrl,'Ficha del fabricante ↗');
   }
  }
  if(group.commercialVersions.length>1){
   const note=document.createElement('small');note.className='reg-shared-note';
   note.textContent=group.commercialVersions.length+' versiones comerciales comparten este código candidato; no son homologaciones exclusivas.';
   versions.append(note);
  }
  const status=td(tr,'Código presente en nómina MTT');status.className='reg-status';
  const detail=document.createElement('small');detail.textContent='Registro contrastado con XLS oficial (código y certificado). Correspondencia exacta con la versión comercial: pendiente de documento probatorio.';status.append(detail);
  if(group.technologyTaxonomyNote){const difference=document.createElement('small');difference.className='reg-taxonomy';difference.textContent=group.technologyTaxonomyNote;status.append(difference);}
  target.append(tr);
 }
 if(!items.length){const tr=document.createElement('tr');td(tr,'No hay códigos para los filtros seleccionados.').colSpan=3;target.append(tr);}
}
function esc(s){return '"'+String(s??'').replace(/"/g,'""')+'"';}
function csv(){
 if(!report)return;
 const header=['marca','codigo_3cv_candidato','modelo_3cv_mayo','fecha_3cv','tecnologia_3cv_mayo','motor_3cv','transmision_3cv','traccion_3cv','certificado_mtt_septiembre','modelo_mtt_septiembre','fila_xls_mtt','tecnologia_mtt_septiembre','combustible_mtt_septiembre','nota_clasificacion','versiones_comerciales','cantidad_versiones','fuentes_fabricante','estado_codigo','nomina_mtt_cotejada','identidad_sku_certificada'];
 const lines=visible().map(x=>[x.brand,x.code,x.homologationModel,x.homologationDate,x.threeCvTechnology,x.threeCvEngine,x.threeCvTransmission,x.threeCvDrive,x.septemberCertificate,x.septemberModel,x.septemberExcelRow,x.septemberTechnology,x.septemberFuel,x.technologyTaxonomyNote||'',x.commercialVersions.map(v=>v.version).join(' | '),x.commercialVersions.length,x.commercialVersions.map(v=>v.officialManufacturerSpecsUrl||'').filter(Boolean).join(' | '),x.status,'SÍ','NO']);
 const data='\ufeff'+[header,...lines].map(r=>r.map(esc).join(';')).join('\r\n')+'\r\n';
 const href=URL.createObjectURL(new Blob([data],{type:'text/csv;charset=utf-8'}));
 const a=document.createElement('a');a.href=href;a.download='rindelab-control-documental-3cv.csv';document.body.append(a);a.click();a.remove();URL.revokeObjectURL(href);
}
async function fetchJson(path){const r=await fetch(path);if(!r.ok)throw Error('No se pudo cargar '+path);return r.json();}
async function load(){
 try{
  if(!window.RindelabVersionAudit||!window.RindelabHomologations)throw Error('Motor de auditoría no disponible');
  const [prices,manifest,manufacturer,notes,ledger,nomina]=await Promise.all([
   fetchJson('./sii/commercial-2026.json?v=20261018-list122'),
   fetchJson('../vehiculos/data/manifest.json'),
   fetchJson('./sii/manufacturer-evidence-2026.json?v=20261018-sources22'),
   fetchJson('./sii/review-notes-2026.json?v=20261018-qa24'),
   fetchJson('./sii/verification-ledger-2026.json?v=20261018-nomina15'),
   fetchJson('./sii/mtt-nomina-20260928-extract.json?v=20261018-nomina15')
  ]);
  const files=await Promise.all(manifest.files.map(name=>fetchJson('../vehiculos/'+name)));
  const candidates=window.RindelabVersionAudit.audit(prices,files.flat(),manifest.published,manufacturer);
  report=window.RindelabHomologations.review(candidates,ledger,notes,nomina);
  $('regCodes').textContent=formatter.format(report.preliminaryCodes);
  $('regVersions').textContent=formatter.format(report.preliminaryCommercialVersions);
  $('regConflicts').textContent=formatter.format(report.conflictVersions);
  $('regCertified').textContent=formatter.format(report.manualSkuCodeVerifications);
  $('regStatus').textContent='Rendimientos 3CV '+report.commercialSourcesCut+' · Nómina MTT '+report.septemberSourceDate+': '+report.septemberCodesFound+' de '+report.preliminaryCodes+' códigos encontrados en el XLS original. Correspondencias comerciales certificadas: ninguna.';
  $('regMttSource').href=report.septemberRegistryLandingPage;
  const brands=[...new Set(report.cases.map(c=>c.brand))].sort((a,b)=>a.localeCompare(b,'es'));
  for(const brand of brands)$('regBrand').add(new Option(brand,brand));
  const conflicts=$('regConflictsList');conflicts.replaceChildren();
  for(const c of report.conflicts){
   const p=document.createElement('p');p.className='reg-conflict';
   const b=document.createElement('strong');b.textContent=c.brand+' '+c.family+' '+c.version+' · '+c.code;p.append(b);
   const text=document.createElement('span');text.textContent=' Fabricante: transmisión '+c.commercialTransmission+' · base de rendimientos 3CV: '+c.registeredTransmission+' · nueva nómina MTT: '+c.septemberRegisteredTransmission+' (certificado '+c.septemberCertificate+', fila '+c.septemberExcelRow+'). La contradicción persiste.';p.append(text);
   external(p,c.manufacturerEvidenceUrl,'Ver fuente comercial ↗');conflicts.append(p);
  }
  $('regDownload').disabled=false;render();
 }catch(e){
  $('regStatus').textContent='No fue posible generar el expediente: '+e.message+'. No se publicarán cifras parciales.';
  const table=$('regRows');table.replaceChildren();
  const row=document.createElement('tr');td(row,'Control documental no disponible').colSpan=3;table.append(row);
 }
}
for(const id of ['regBrand','regSearch','regShared'])$(id).addEventListener(id==='regSearch'?'input':'change',render);
$('regDownload').addEventListener('click',csv);
load();
})();