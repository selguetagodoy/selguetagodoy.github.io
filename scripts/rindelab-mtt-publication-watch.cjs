/* RINDELAB — vigila el enlace público de nómina MTT, sin afirmar importación de XLS.
 * El expediente de septiembre permanece independiente del registro energético 3CV. */
'use strict';
const fs=require('node:fs'),path=require('node:path');
const page='https://www.subtrans.gob.cl/3cv/homologacion-de-vehiculos-livianos-medianos-y-motocicletas/';
const baseline='https://www.subtrans.gob.cl/wp-content/uploads/2026/10/e1_Nomina-Vehiculos-Livianos-y-Medianos-Homologados_27_oct_2026.xls';
const report={schemaVersion:1,checkedAt:new Date().toISOString(),sourcePage:page,baselinePublication:baseline,status:'PENDING',documentUrl:null,publicationChanged:false,ingestion:'XLS_PENDING_VERIFICATION',note:'Identificar una publicación no equivale a integrar su contenido al buscador'};
(async()=>{
 try{
  const res=await fetch(page,{headers:{accept:'text/html'},signal:AbortSignal.timeout(20000)});
  if(!res.ok)throw Error('HTTP '+res.status);
  const html=await res.text();
  const i=html.indexOf('e1) Homologación de Vehículos Livianos y Medianos');
  if(i<0)throw Error('La sección oficial e1 no está disponible');
  const fragment=html.slice(i,i+1800);
  const m=fragment.match(/href="(https:\/\/www\.subtrans\.gob\.cl\/wp-content\/uploads\/[^"]+\.xlsx?)"/i);
  if(!m)throw Error('Enlace XLS/XLSX oficial e1 ausente');
  const url=new URL(m[1]);
  if(url.hostname!=='www.subtrans.gob.cl'||!url.pathname.startsWith('/wp-content/uploads/')||!/\.xlsx?$/i.test(url.pathname))
    throw Error('URL fuente no autorizada');
  report.documentUrl=url.href;
  report.status='PUBLISHED_SOURCE_FOUND';
  report.publicationChanged=url.href!==baseline;
 }catch(e){
  report.status='SOURCE_UNAVAILABLE';
  report.error=String(e.message||e);
 }
 const root=process.env.GITHUB_WORKSPACE||path.resolve(__dirname,'..');
 fs.writeFileSync(path.join(root,'rindelab-mtt-publication-audit.json'),JSON.stringify(report,null,2)+'\n');
 const lines=['# RINDELAB · fuente oficial MTT', '', 'Revisión: '+report.checkedAt, 'Página: '+page, 'Documento e1: '+(report.documentUrl||'No recuperado'), 'Estado: '+report.status, 'Cambió respecto al XLS 27/10/2026: '+(report.publicationChanged?'Sí':'No'), '', '**El archivo XLS no se incorpora automáticamente**: se requiere cotejo por código, fecha y discrepancias.'];
 fs.writeFileSync(path.join(root,'rindelab-mtt-publication-audit.md'),lines.join('\n')+'\n');
 console.log(JSON.stringify(report));
})();
