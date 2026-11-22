'use strict';
const fs=require('node:fs'),path=require('node:path');
const source='https://api-consumovehicular.minenergia.cl/vehiculos/listar';
const manifest=require('../vehiculos/data/manifest.json');
const legacy=manifest.files.flatMap(f=>require('../vehiculos/'+f)).filter(r=>r&&r[0]&&r[1]&&r[8]&&r[8]<=manifest.published);
const old=[1,2,3,4].flatMap(i=>require('../rindelab/data/oficial-api-20261018-'+String(i).padStart(2,'0')+'.json').items);
const known=new Set([...legacy.map(r=>r[9]),...old.map(r=>r.codigoInformeTecnico)]);
if(known.size!==8325||old.length!==272||legacy.length!==8053)throw Error('Base anterior no coincide');
async function get(k){
 const res=await fetch(source+'?pageSize=1000&pageIndex='+k,{headers:{accept:'application/json'},signal:AbortSignal.timeout(30000)});
 if(!res.ok)throw Error('HTTP '+res.status);return res.json();
}
(async()=>{
 const first=await get(1);
 if(first.totalCount!==8384||first.totalPages!==9||first.pageIndex!==1)throw Error('La fuente oficial cambió');
 const rows=[...first.items];
 for(let k=2;k<=9;k++){const v=await get(k);if(v.totalCount!==8384||v.pageIndex!==k)throw Error('Paginación inconsistente');rows.push(...v.items);}
 if(rows.length!==8384||new Set(rows.map(r=>r.codigoInformeTecnico)).size!==8384)throw Error('No hay 8.384 códigos únicos');
 const added=rows.filter(r=>!known.has(r.codigoInformeTecnico));
 if(added.length!==69)throw Error('Se esperaban 69 códigos nuevos y llegaron '+added.length);
 const mapper=require('../rindelab/sii/official-api-mapper.js');
 const items=added.map(r=>{
  const a=r.combinado!=null||r.wltpRendimientoElectricoPuro!=null;
  const b=r.rendimientoMixto!=null||r.rendimientoElectrico!=null;
  if(!a||b)throw Error('Ciclo no verificable '+r.codigoInformeTecnico);
  const row={...r,sourceCycle:'WLTP'},mapped=mapper.convert(row);
  if(mapped.length!==26||mapped[8]>'2026-11-22'||(mapped[2]==='EV'?!Number.isFinite(mapped[13]):!Number.isFinite(mapped[12])))throw Error('Dato inválido '+r.codigoInformeTecnico);
  return row;
 });
 const doc={schemaVersion:1,source,retrieved:'2026-11-22',sourceTotalCount:8384,knownPriorCodes:8325,newCodes:69,sourcePages:9,items};
 fs.writeFileSync(path.join(__dirname,'../rindelab/data/oficial-api-20261122.json'),JSON.stringify(doc,null,2)+'\n');
 console.log(JSON.stringify({official:rows.length,previous:known.size,newRecords:items.length,newOctober:items.filter(r=>r.fechaHomologacion.startsWith('2026-10')).length,newNovember:items.filter(r=>r.fechaHomologacion.startsWith('2026-11')).length,searchable:known.size+items.length}));
})().catch(e=>{console.error(e);process.exit(1)});
