/* Vigilancia incremental 3CV/MTT: requiere URL JSON primaria confirmada.
 * No reescribe la base homologada ni publica filas externas sin validación humana. */
'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const sources=[
 {name:'3CV',url:process.env.RINDELAB_3CV_FEED_URL||''},
 {name:'MTT',url:process.env.RINDELAB_MTT_FEED_URL||''}
];
const today=new Date().toISOString().slice(0,10);
const manifest=require('../vehiculos/data/manifest.json');
const known=new Set();
for(const f of manifest.files){
 const a=require(path.join(root,'vehiculos',f));
 for(const row of a)if(row[9])known.add(row[9]);
}
for(let i=1;i<=4;i++){
 const data=require('../rindelab/data/oficial-api-20261018-'+String(i).padStart(2,'0')+'.json');
 for(const row of data.items||[])if(typeof row==='object'&&row){
  const code=Array.isArray(row)?row[9]:(row.code||row.codigo||row.homologationCode);
  if(code)known.add(code);
 }
}
const allowedDomain=host=>host==='consumovehicular.cl'||host.endsWith('.consumovehicular.cl')||host==='mtt.gob.cl'||host.endsWith('.mtt.gob.cl')||host==='transportes.gob.cl'||host.endsWith('.transportes.gob.cl');
const codeFrom=row=>Array.isArray(row)?row[9]:(row?.code||row?.codigo||row?.codigoHomologacion||row?.homologationCode);
(async()=>{
 const report={schemaVersion:1,generatedAt:today,knownLocalCodes:known.size,officialSources:sources.map(s=>({name:s.name,url:s.url||null})),checks:[],pending:[]};
 for(const source of sources){
  if(!source.url){report.checks.push({name:source.name,status:'NOT_CONFIGURED',message:'Falta URL verificada de un feed JSON oficial. La programación no inventa un endpoint.'});continue;}
  const uri=new URL(source.url);
  if(uri.protocol!=='https:'||!allowedDomain(uri.hostname)||uri.username||uri.password)throw Error(source.name+': fuente no autorizada '+uri.hostname);
  const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),20000);
  try{
   const response=await fetch(uri,{signal:controller.signal,headers:{accept:'application/json'}});
   if(!response.ok)throw Error('HTTP '+response.status);
   const length=Number(response.headers.get('content-length'))||0;
   if(length>15000000)throw Error('Archivo remoto demasiado grande');
   const text=await response.text();
   if(text.length>15000000)throw Error('Payload JSON remoto demasiado grande');
   const data=JSON.parse(text),items=Array.isArray(data)?data:Array.isArray(data.records)?data.records:Array.isArray(data.items)?data.items:null;
   if(!items||items.length>20000)throw Error('JSON sin lista de registros válida');
   const duplicates=new Set(),newRecords=[],seen=new Set();
   for(const row of items){
    const code=String(codeFrom(row)||'').trim();
    if(!/^[A-Za-z0-9-]{8,70}$/.test(code))continue;
    if(seen.has(code)){duplicates.add(code);continue;}seen.add(code);
    if(!known.has(code))newRecords.push({code,source:source.name,raw:row});
   }
   report.checks.push({name:source.name,status:'CHECKED',records:items.length,validCodes:seen.size,duplicates:duplicates.size,newCodes:newRecords.length});
   report.pending.push(...newRecords);
  }catch(err){report.checks.push({name:source.name,status:'FETCH_OR_SCHEMA_ERROR',message:String(err.message||err)});process.exitCode=1;}finally{clearTimeout(timeout);}
 }
 const dir=process.env.GITHUB_WORKSPACE||root;
 fs.writeFileSync(path.join(dir,'rindelab-incremental-audit.json'),JSON.stringify(report,null,2)+'\n');
 const md=['# RINDELAB — vigilancia incremental oficial', '', 'Ejecución '+today,'','Fuentes habilitadas: '+report.checks.filter(x=>x.status==='CHECKED').length+' de 2. Nuevos códigos pendientes de revisión: '+report.pending.length+'.','', ...report.checks.map(c=>'- '+c.name+': '+c.status+(c.message?' · '+c.message:'')+(c.newCodes!==undefined?' · nuevos '+c.newCodes:'')), '', 'Ningún nuevo código ni consumo se publica sin comprobación documental; el feed configurado debe ser oficial, estable y legible como JSON.'].join('\n');
 fs.writeFileSync(path.join(dir,'rindelab-incremental-audit.md'),md+'\n');
 console.log(JSON.stringify({checks:report.checks,pending:report.pending.length},null,2));
})();
