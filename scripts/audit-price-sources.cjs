/* Revisión semanal de integridad y vigencia documental de precios de lista RINDELAB.
   No afirma verificar los importes actuales de fabricantes: la comprobación de valores
   requiere revisar el contenido publicado y sus condiciones comerciales. */
'use strict';
const fs=require('node:fs'),path=require('node:path');
const file=path.join(__dirname,'../rindelab/sii/commercial-2026.json');
const entries=JSON.parse(fs.readFileSync(file,'utf8'));
const allowed=new Set(['tienda.toyota.cl','www.hyundai.cl','www.kia.cl','www.suzuki.cl','suzuki.cl','www.mgmotor.cl','www.changan.cl','www.ford.cl','www.mazda.cl','www.subaru.cl']);
const ages=[],sources=new Set(),errors=[],warnings=[],keys=new Set(),today=Date.now();
const iso=/^\d{4}-\d{2}-\d{2}$/;
const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().trim().replace(/\s+/g,' ');
for(const [index,r] of entries.entries()){
 const place='Registro '+(index+1)+' '+(r.brand||'?')+' '+(r.family||'?')+' '+(r.version||'?');
 const key=[r.brand,r.family,r.version,r.modelYear||''].map(normalize).join('|');
 if(keys.has(key))errors.push(place+': registro duplicado');
 keys.add(key);
 if(!r.brand||!r.family||!r.version||!Number.isSafeInteger(r.priceListClp)||r.priceListClp<=0||r.currency!=='CLP')errors.push(place+': datos de precio o versión inválidos');
 try{
  const u=new URL(r.source);
  if(u.protocol!=='https:'||!allowed.has(u.hostname))errors.push(place+': fuente no autorizada '+r.source);
  else sources.add(u.href);
 }catch{errors.push(place+': URL de origen inválida');}
 const date=Date.parse(String(r.checkedAt||'')+'T00:00:00Z');
 if(!iso.test(r.checkedAt)||!Number.isFinite(date)||date>today+86400000){errors.push(place+': fecha de consulta inválida');continue;}
 const age=Math.max(0,Math.floor((today-date)/86400000));
 ages.push(age);
 if(age>=30)warnings.push(place+': última consulta hace '+age+' días, revalidar precio y versión');
}
async function checkLinks(){
 const links=[...sources],out=[];
 for(let i=0;i<links.length;i+=4){
  const results=await Promise.all(links.slice(i,i+4).map(async url=>{
   try{
    // Accesibilidad != confirmación de precio. Errores 403 pueden ser anti-bot.
    const r=await fetch(url,{method:'GET',redirect:'follow',signal:AbortSignal.timeout(10000),headers:{'User-Agent':'RINDELAB-Link-Audit/1.0'}});
    return {url,status:r.status,ok:r.ok};
   }catch(e){return {url,status:'sin respuesta',ok:false,error:String(e.message).slice(0,80)};}
  }));
  out.push(...results);
 }
 return out;
}
(async()=>{
 if(!Array.isArray(entries))throw Error('El catálogo no es un arreglo');
 const links=process.argv.includes('--online')?await checkLinks():[];
 const inaccessible=links.filter(x=>!x.ok);
 if(inaccessible.length)warnings.push(...inaccessible.map(x=>'Revisar acceso a '+x.url+' (HTTP '+x.status+'). No demuestra que el precio sea incorrecto.'));
 const report=[
  '# RINDELAB — auditoría de fuentes y vigencia',
  '',
  '- Versión del catálogo: '+entries.length+' fichas comerciales, '+new Set(entries.map(x=>x.brand)).size+' marcas.',
  '- URLs oficiales únicas revisadas: '+sources.size+'.',
  '- Edad máxima de la última consulta: '+Math.max(0,...ages)+' días.',
  '- Registros con fecha de consulta de 30 días o más: '+ages.filter(x=>x>=30).length+'.',
  '- Incidencias de estructura/duplicados: '+errors.length+'.',
  '- Enlaces con respuesta no exitosa o inaccesibles: '+inaccessible.length+'.',
  '',
  '**Alcance:** valida estructura, fecha y acceso a URLs. **No valida automáticamente que los precios continúen vigentes ni que estén disponibles para compra.** Requiere contraste humano de cada valor, versión y fecha.',
  '',
  '## Errores de datos',
  ...(errors.length?errors.map(s=>'- '+s):['- Ninguno']),
  '',
  '## Revisión pendiente',
  ...(warnings.length?warnings.map(s=>'- '+s):['- Sin advertencias']),
  ''
 ].join('\n');
 console.log(report);
 if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,report);
 if(process.env.GITHUB_ACTIONS){
  for(const e of errors)console.log('::error::'+e.replace(/\n/g,' '));
  for(const w of warnings)console.log('::warning::'+w.replace(/\n/g,' '));
 }
 if(errors.length)process.exitCode=1;
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
