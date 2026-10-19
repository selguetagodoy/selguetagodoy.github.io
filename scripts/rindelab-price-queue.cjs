#!/usr/bin/env node
/* RINDELAB: bandeja editorial separada de los precios publicados.
   Uso:
   node scripts/rindelab-price-queue.cjs --check
   node scripts/rindelab-price-queue.cjs --report
   node scripts/rindelab-price-queue.cjs --dry-run
   node scripts/rindelab-price-queue.cjs --apply
   SIN --apply NUNCA se modifica el catálogo comercial. */
'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const queueFile=path.join(root,'rindelab/sii/bandeja-precios-electromovilidad.csv');
const catalogFile=path.join(root,'rindelab/sii/commercial-2026.json');
const reportFile=path.join(root,'rindelab/sii/bandeja-precios-resumen.json');
const statuses=new Set(['pendiente_revision','en_busqueda','fuente_encontrada','sin_precio_publicado','listo_para_importar','ya_importado','fuera_de_alcance']);
const technologies=new Set(['EV','HEV','PHEV','REEV','MHEV']);
const headers=['id','marca_fuente_3cv','marca_grupo','modelo_fuente_3cv','tecnologia_3cv','codigo_3cv_referencia','fecha_ultima_ficha_3cv','cantidad_fichas_3cv','prioridad','estado','marca_comercial','familia_comercial','version_comercial','anio_modelo','tecnologia_comercial','precio_lista_clp','moneda','tipo_precio','fuente_precio_url','fecha_consulta','fin_campana','evidencia_documental','observaciones'];
function parseCSV(input){
 const s=String(input).replace(/^\uFEFF/,'');let current='',row=[],out=[],quoted=false;
 for(let i=0;i<s.length;i++){
  const c=s[i];
  if(c==='"'){if(quoted&&s[i+1]==='"'){current+='"';i++;}else quoted=!quoted;continue;}
  if(!quoted&&(c===','||c==='\r'||c==='\n')){
   if(c===','){row.push(current);current='';continue;}
   if(c==='\r'&&s[i+1]==='\n')i++;
   row.push(current);current='';
   if(row.some(x=>x!==''))out.push(row);
   row=[];continue;
  }
  current+=c;
 }
 if(quoted)throw Error('CSV contiene comillas sin cierre');
 if(current!==''||row.length){row.push(current);if(row.some(x=>x!==''))out.push(row);}
 if(!out.length)throw Error('CSV vacío');
 if(JSON.stringify(out[0])!==JSON.stringify(headers))throw Error('Columnas del CSV han cambiado. Conservar orden y nombres del formato maestro.');
 return out.slice(1).map((values,index)=>{
  if(values.length!==headers.length)throw Error('Línea '+(index+2)+': '+values.length+' columnas; se requieren '+headers.length);
  return Object.fromEntries(headers.map((key,i)=>[key,values[i]]));
 });
}
function csv(rows){
 const q=x=>{const v=String(x??'');return /[",\r\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v;};
 return '\uFEFF'+headers.map(q).join(',')+'\n'+rows.map(r=>headers.map(h=>q(r[h])).join(',')).join('\n')+'\n';
}
function iso(v){return /^\d{4}-\d{2}-\d{2}$/.test(v)&&!Number.isNaN(Date.parse(v+'T00:00:00Z'));}
function norm(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().trim().replace(/\s+/g,' ');}
function identity(r){return [r.brand,r.family,r.version,r.modelYear||''].map(norm).join('|');}
function allowedHosts(){
 const source=fs.readFileSync(path.join(root,'scripts/audit-price-sources.cjs'),'utf8');
 const list=source.match(/const allowed=new Set\(\[([^\]]+)\]\)/);
 if(!list)throw Error('No se pudo leer la lista de hosts permitidos del auditor comercial.');
 return new Set([...list[1].matchAll(/'([^']+)'/g)].map(x=>x[1]));
}
function readyRecord(row,hosts,errors){
 const at='ID '+row.id;
 const required=['marca_comercial','familia_comercial','version_comercial','tecnologia_comercial','precio_lista_clp','moneda','tipo_precio','fuente_precio_url','fecha_consulta','evidencia_documental'];
 for(const key of required)if(!row[key].trim())errors.push(at+': campo obligatorio pendiente '+key);
 if(row.tipo_precio!=='lista_sin_bonos')errors.push(at+': tipo_precio debe ser lista_sin_bonos');
 if(row.moneda!=='CLP')errors.push(at+': moneda debe ser CLP');
 if(!technologies.has(row.tecnologia_comercial))errors.push(at+': tecnología comercial no reconocida');
 if(!/^[1-9]\d*$/.test(row.precio_lista_clp)||!Number.isSafeInteger(Number(row.precio_lista_clp)))errors.push(at+': precio de lista inválido');
 if(row.anio_modelo&&(!/^\d{4}$/.test(row.anio_modelo)||Number(row.anio_modelo)<2000||Number(row.anio_modelo)>2100))errors.push(at+': año modelo inválido');
 if(!iso(row.fecha_consulta))errors.push(at+': fecha_consulta no es ISO YYYY-MM-DD');
 if(row.fin_campana&&!iso(row.fin_campana))errors.push(at+': fin_campana no es ISO YYYY-MM-DD');
 try{
  const url=new URL(row.fuente_precio_url);
  if(url.protocol!=='https:'||!hosts.has(url.hostname))errors.push(at+': dominio no habilitado en auditor de fuentes oficiales '+url.hostname);
 }catch{errors.push(at+': URL de fuente oficial inválida');}
 return {
  brand:row.marca_comercial,family:row.familia_comercial,version:row.version_comercial,
  modelYear:row.anio_modelo?Number(row.anio_modelo):null,
  technology:row.tecnologia_comercial,priceListClp:Number(row.precio_lista_clp),
  currency:'CLP',source:row.fuente_precio_url,checkedAt:row.fecha_consulta,
  priceBasis:'Precio de lista documentado en fuente oficial, separado de bonos o financiamiento. Evidencia textual: '+row.evidencia_documental.trim()+'. No implica disponibilidad comercial ni equivalencia homologada 3CV.',
  ...(row.fin_campana?{sourceOfferEnd:row.fin_campana}:{})
 };
}
function main(){
 const args=new Set(process.argv.slice(2));
 if(args.has('--apply')&&args.has('--dry-run'))throw Error('Elegir --apply o --dry-run, nunca ambos');
 const queue=parseCSV(fs.readFileSync(queueFile,'utf8'));
 const catalog=JSON.parse(fs.readFileSync(catalogFile,'utf8'));
 if(!Array.isArray(catalog))throw Error('Catálogo no es un arreglo');
 const ids=new Set(),errors=[],states={},groups={},priorities={};
 const byId=new Map(catalog.map(r=>[identity(r),r]));
 const hosts=allowedHosts(),candidates=[],staged=new Set(),repeated=[];
 for(const row of queue){
  if(!row.id||ids.has(row.id))errors.push('ID duplicado o vacío: '+row.id);
  ids.add(row.id);
  if(!statuses.has(row.estado))errors.push('ID '+row.id+': estado inválido '+row.estado);
  if(!technologies.has(row.tecnologia_3cv)&&row.tecnologia_3cv!=='')errors.push('ID '+row.id+': tecnología 3CV inválida');
  states[row.estado]=(states[row.estado]||0)+1;
  priorities[row.prioridad]=(priorities[row.prioridad]||0)+1;
  let b=groups[row.marca_grupo]??={marca:row.marca_grupo,total:0,pendientes:0,listos:0,importados:0};
  b.total++;if(row.estado==='ya_importado')b.importados++;else if(row.estado==='listo_para_importar')b.listos++;else if(row.estado!=='fuera_de_alcance')b.pendientes++;
  if(row.estado!=='listo_para_importar')continue;
  const p=readyRecord(row,hosts,errors),key=identity(p);
  if(staged.has(key))errors.push('Duplicado entre aprobados: '+row.id+' / '+key);
  staged.add(key);
  if(byId.has(key)){
   const previous=byId.get(key);
   if(previous.priceListClp!==p.priceListClp||previous.source!==p.source)errors.push('Conflicto con catálogo público: '+row.id+' / '+key+' (no se sobreescribe)');
   else repeated.push(row);
  }else candidates.push({row,price:p});
 }
 const result={
  schemaVersion:1,sourceScope:'Modelos y versiones técnicas electrificadas del archivo oficial 3CV de mayo de 2026, incluidos históricos. No son precios faltantes certificados ni catálogo vigente.',
  queueRows:queue.length,commercialPrices:catalog.length,groups:Object.keys(groups).length,
  statuses:states,priorities,readyNew:candidates.length,readyAlreadyInCatalog:repeated.length,
  errors,byGroup:Object.values(groups).sort((a,b)=>b.pendientes-a.pendientes||a.marca.localeCompare(b.marca,'es'))
 };
 if(args.has('--report')&& !errors.length){fs.writeFileSync(reportFile,JSON.stringify(result,null,2)+'\n');}
 process.stdout.write(JSON.stringify(result,null,2)+'\n');
 if(errors.length)process.exitCode=1;
 if(args.has('--apply')&& !errors.length){
  const updated=[...catalog,...candidates.map(x=>x.price)];
  const imported=new Set([...candidates.map(x=>x.row.id),...repeated.map(x=>x.id)]);
  for(const r of queue)if(imported.has(r.id))r.estado='ya_importado';
  fs.writeFileSync(catalogFile,JSON.stringify(updated,null,2)+'\n');
  fs.writeFileSync(queueFile,csv(queue));
  result.appliedNew=candidates.length;
  fs.writeFileSync(reportFile,JSON.stringify(result,null,2)+'\n');
  process.stdout.write('Importación aplicada: '+candidates.length+' fichas; '+repeated.length+' duplicados idénticos ya existentes. Ejecuta auditor y pruebas antes de publicar.\n');
 }else if(args.has('--dry-run'))process.stdout.write('Simulación: no se modificó ningún archivo.\n');
}
try{main();}catch(e){process.stderr.write('ERROR: '+String(e.message||e)+'\n');process.exitCode=1;}
