/* RINDELAB | Vigilancia automática y paginada de la API oficial de Consumo Vehicular.
 * Los datos externos se comparan por código, pero NO se incorporan sin validación. */
'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const DEFAULT_3CV='https://api-consumovehicular.minenergia.cl/vehiculos/listar';
const sources=[
 {name:'3CV',url:process.env.RINDELAB_3CV_FEED_URL||DEFAULT_3CV,paginated:true},
 {name:'MTT',url:process.env.RINDELAB_MTT_FEED_URL||'',paginated:false}
];
const today=new Date().toISOString().slice(0,10),manifest=require('../vehiculos/data/manifest.json');
const codeFrom=row=>Array.isArray(row)?row[9]:(row?.codigoInformeTecnico||row?.code||row?.codigo||row?.codigoHomologacion||row?.homologationCode);
const known=new Set();
for(const f of manifest.files){
 for(const row of require(path.join(root,'vehiculos',f)))if(row?.[0]&&row?.[1]&&row?.[8]&&row[8]<=manifest.published&&row[9])known.add(row[9]);
}
for(let i=1;i<=4;i++){
 const data=require('../rindelab/data/oficial-api-20261018-'+String(i).padStart(2,'0')+'.json');
 for(const row of data.items||[]){const code=codeFrom(row);if(code)known.add(code);}
}
const allowedDomain=host=>host==='api-consumovehicular.minenergia.cl'||host==='consumovehicular.minenergia.cl'||host==='mtt.gob.cl'||host.endsWith('.mtt.gob.cl');
async function getJson(uri){
 const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),22000);
 try{
  const r=await fetch(uri,{signal:controller.signal,headers:{accept:'application/json'}});
  if(!r.ok)throw Error('HTTP '+r.status);
  const len=Number(r.headers.get('content-length'))||0;
  if(len>15000000)throw Error('Respuesta demasiado grande');
  const text=await r.text();if(text.length>15000000)throw Error('Respuesta JSON excesiva');
  return JSON.parse(text);
 }finally{clearTimeout(timeout);}
}
async function loadSource(s){
 const uri=new URL(s.url);
 if(uri.protocol!=='https:'||!allowedDomain(uri.hostname)||uri.username||uri.password)throw Error('URL de organismo no autorizado: '+uri.hostname);
 if(!s.paginated){
  const x=await getJson(uri);
  const rows=Array.isArray(x)?x:Array.isArray(x.items)?x.items:Array.isArray(x.records)?x.records:null;
  if(!rows||rows.length>20000)throw Error('Feed MTT no contiene una lista comprobable');
  return {rows,total:rows.length,pages:1};
 }
 // Parámetros comprobados mediante GET oficial el 21/10/2026.
 uri.searchParams.set('pageSize','1000');uri.searchParams.set('pageIndex','1');
 const first=await getJson(uri);
 if(!Array.isArray(first.items)||!Number.isInteger(first.totalCount)||first.pageIndex!==1||
 first.items.length!==Math.min(first.totalCount,first.pageSize)||first.totalPages>100||first.totalCount>100000)
  throw Error('Respuesta 3CV con paginación incompatible');
 const rows=[...first.items],pages=first.totalPages;
 // Evitar cargar todas las páginas simultáneamente sobre el servicio público.
 for(let k=2;k<=pages;k++){
  uri.searchParams.set('pageIndex',String(k));
  const data=await getJson(uri);
  if(data.pageIndex!==k||data.totalCount!==first.totalCount||!Array.isArray(data.items))throw Error('La API cambió mientras se recorrían las páginas');
  rows.push(...data.items);
 }
 if(rows.length!==first.totalCount)throw Error('La API 3CV entregó un total incompleto');
 return {rows,total:first.totalCount,pages};
}
(async()=>{
 const report={schemaVersion:2,generatedAt:today,knownLocalCodes:known.size,officialSources:sources.map(s=>({name:s.name,url:s.url||null})),checks:[],pending:[]};
 for(const s of sources){
  if(!s.url){report.checks.push({name:s.name,status:'NOT_CONFIGURED',message:'No se confirmó URL JSON oficial; no se fabrican endpoints.'});continue;}
  try{
   const {rows,total,pages}=await loadSource(s);
   const seen=new Set(),duplicates=new Set(),newRecords=[];
   for(const row of rows){
    const code=String(codeFrom(row)||'').trim();
    if(!/^[A-Za-z0-9-]{8,70}$/.test(code))continue;
    if(seen.has(code)){duplicates.add(code);continue;}
    seen.add(code);
    if(!known.has(code))newRecords.push({code,source:s.name,raw:row});
   }
   report.checks.push({name:s.name,status:'CHECKED',records:total,pages,validCodes:seen.size,duplicates:duplicates.size,newCodes:newRecords.length});
   report.pending.push(...newRecords);
  }catch(error){
   report.checks.push({name:s.name,status:'FETCH_OR_SCHEMA_ERROR',message:String(error.message||error)});
   process.exitCode=1;
  }
 }
 const dir=process.env.GITHUB_WORKSPACE||root;
 fs.writeFileSync(path.join(dir,'rindelab-incremental-audit.json'),JSON.stringify(report,null,2)+'\n');
 const md=['# RINDELAB — vigilancia de API 3CV y homologaciones MTT','','Corte '+today,'',
  'Los resultados representan diferencias de códigos respecto de fuentes preservadas, no altas comerciales ni rendimientos certificados para una misma versión.',
  '',...report.checks.map(x=>'- '+x.name+': '+x.status+(x.records!==undefined?' · '+x.records+' registros, '+x.pages+' páginas, '+x.newCodes+' códigos candidatos':'')+(x.message?' · '+x.message:'')),'',
  'Candidatos a revisión: '+report.pending.length+'. No se actualiza la base oficial sin QA de ciclo, campos técnicos y código.'].join('\n');
 fs.writeFileSync(path.join(dir,'rindelab-incremental-audit.md'),md+'\n');
 console.log(JSON.stringify({knownLocal:known.size,checks:report.checks,pending:report.pending.length},null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
