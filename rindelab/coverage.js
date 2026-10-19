/* Vista pública de cobertura nominal RINDELAB, sin equiparar versiones comerciales. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const formatter=new Intl.NumberFormat('es-CL');
let report=null;
const fmt=n=>formatter.format(n);
const norm=s=>window.RindelabCoverage.normalized(s);
const cell=(row,text)=>{
 const td=document.createElement('td');td.textContent=String(text??'—');row.append(td);return td;
};
function visibleRows(){
 if(!report)return [];
 const brand=$('brandFilter').value, status=$('statusFilter').value, term=norm($('familyFilter').value);
 return report.rows.filter(x=>(!brand||x.brand===brand)&&(!status||x.status===status)&&(!term||norm(x.brand+' '+x.family).includes(term)));
}
function render(){
 if(!report)return;
 const items=visibleRows(),out=$('coverageRows');out.replaceChildren();
 $('coverageResultCount').textContent=fmt(items.length)+' de '+fmt(report.commercialFamilies)+' familias comerciales';
 for(const x of items){
  const tr=document.createElement('tr');
  const family=cell(tr,x.brand+' · '+x.family);
  family.className='coverage-family';
  const examples=document.createElement('small');examples.textContent=x.examples.length?'Ejemplos 3CV: '+x.examples.join(' / '):'Sin modelos candidatos en la base';
  family.append(examples);
  cell(tr,fmt(x.commercialVersions));
  cell(tr,fmt(x.candidateRecords));
  cell(tr,x.latestHomologation||'—');
  const status=cell(tr,x.candidateRecords?'Coincidencia nominal; versión sin cotejar':'No se encontró la familia');
  status.className='coverage-verdict';
  const source=document.createElement('a');source.href=x.sourceUrls[0];source.target='_blank';source.rel='noopener noreferrer';
  source.textContent=x.sourceUrls.length>1?'Fuente oficial y otras ('+x.sourceUrls.length+')':'Fuente oficial';
  status.append(source);
  out.append(tr);
 }
 if(!items.length){const tr=document.createElement('tr');cell(tr,'Sin familias para los filtros seleccionados.').colSpan=5;out.append(tr);}
}
function csvEscape(value){return '"'+String(value??'').replace(/"/g,'""')+'"';}
function downloadCsv(){
 if(!report)return;
 const header=['marca','familia','precios_de_lista','fichas_3cv_nominales','ultima_homologacion','estado','fuentes_oficiales'];
 const rows=visibleRows().map(x=>[x.brand,x.family,x.commercialVersions,x.candidateRecords,x.latestHomologation||'',x.status,x.sourceUrls.join(' | ')]);
 const csv='\ufeff'+[header,...rows].map(r=>r.map(csvEscape).join(';')).join('\r\n')+'\r\n';
 const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
 const a=document.createElement('a');a.href=url;a.download='rindelab-cobertura-nominal-3cv.csv';
 document.body.append(a);a.click();a.remove();URL.revokeObjectURL(url);
}
async function load(){
 try{
  if(!window.RindelabCoverage)throw Error('Motor de auditoría no disponible');
  const [prices,manifest]=await Promise.all([
   fetch('./sii/commercial-2026.json?v=20261019-coverage273').then(r=>{if(!r.ok)throw Error('Catálogo no disponible');return r.json();}),
   fetch('../vehiculos/data/manifest.json').then(r=>{if(!r.ok)throw Error('Índice 3CV no disponible');return r.json();})
  ]);
  const files=await Promise.all(manifest.files.map(name=>fetch('../vehiculos/'+name).then(r=>{
   if(!r.ok)throw Error('No se pudo cargar '+name);return r.json();
  })));
  report=window.RindelabCoverage.analyze(prices,files.flat(),manifest.published);
  $('metricPrices').textContent=fmt(report.commercialPrices);
  $('metricFamilies').textContent=fmt(report.commercialFamilies);
  $('metricMatched').textContent=fmt(report.matchedFamilies);
  $('metricUnmatched').textContent=fmt(report.unmatchedFamilies);
  const date=new Date(manifest.published+'T12:00:00Z');
  $('sourceDate').textContent=date.toLocaleDateString('es-CL',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'});
  $('coverageStatus').textContent='Corte 3CV: '+report.published+' · '+fmt(report.threeCvRecords)+' homologaciones históricas al corte. Coincidencia de familia, no identificación de versión.';
  const brands=[...new Set(report.rows.map(x=>x.brand))].sort((a,b)=>a.localeCompare(b,'es'));
  for(const brand of brands)$('brandFilter').add(new Option(brand,brand));
  $('downloadCoverage').disabled=false;render();
 }catch(error){
  $('coverageStatus').textContent='No se pudo calcular la cobertura: '+error.message+'. Actualiza la página para intentarlo nuevamente.';
  $('coverageRows').replaceChildren();
  const tr=document.createElement('tr');cell(tr,'Auditoría no disponible; no se mostrarán porcentajes incompletos.').colSpan=5;$('coverageRows').append(tr);
 }
}
for(const id of ['brandFilter','statusFilter','familyFilter'])$(id).addEventListener(id==='familyFilter'?'input':'change',render);
$('downloadCoverage').addEventListener('click',downloadCsv);
load();
})();
