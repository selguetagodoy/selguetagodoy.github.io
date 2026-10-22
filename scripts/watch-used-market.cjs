/* Weekly provider check. Only observed AutoExplora summaries are readable without credentials.
 * This workflow never changes the published market data; it only audits deltas. */
'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const source=require('../rindelab/sii/data/used-market-20261021.json');
const limit=Number(process.argv.find(s=>s.startsWith('--limit='))?.split('=')[1]||0);
const targets=source.records.filter(x=>x.source==='AutoExplora').slice(0,limit>0?limit:100);
const date=new Date().toISOString().slice(0,10);
const report={schemaVersion:1,runDate:date,baseDate:source.observedAt,provider:'AutoExplora',checked:0,changes:[],failures:[],unchanged:0,warning:'Public website asking prices; not transactions. This audit cannot validate Autofact ranges (site disallows direct automated HTTP access). No automatic publication.'};
const number=x=>Number(x.replace(/\./g,''));
async function fetchOne(row){
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),18000);
 try{
  const url=new URL(row.sourceUrl);
  if(url.protocol!=='https:'||url.hostname!=='www.autoexplora.cl'||!url.pathname.startsWith('/precios/'))throw Error('Source URL domain not trusted');
  const response=await fetch(url,{signal:controller.signal,headers:{'User-Agent':'RINDELAB public used market audit/1.0','Accept':'text/html'}});
  if(!response.ok)throw Error('HTTP '+response.status);
  const h=await response.text();if(h.length>2000000)throw Error('HTML unexpectedly large');
  const meta=h.match(/<meta[^>]+name="description"[^>]+content="([^"]*)"/i)?.[1]||h.match(/<meta[^>]+content="([^"]*)"[^>]+name="description"/i)?.[1]||'';
  const match=meta.match(/Mediana de \$([\d.]+) y rango habitual de \$([\d.]+) a \$([\d.]+), seg[^ ]* (\d+) /i);
  if(!match)throw Error('No published median with sufficient listings (or changed website format)');
  const current={medianClp:number(match[1]),p10Clp:number(match[2]),p90Clp:number(match[3]),sampleSize:Number(match[4])};
  if(current.sampleSize<5||current.p10Clp>current.medianClp||current.medianClp>current.p90Clp)throw Error('Provider numbers invalid');
  return current;
 }finally{clearTimeout(timer)}
}
(async()=>{
 // Bounded concurrency to reduce load on the public source.
 for(let i=0;i<targets.length;i+=2){
  const set=targets.slice(i,i+2);
  await Promise.all(set.map(async row=>{
   report.checked++;
   try{
    const current=await fetchOne(row);
    const previous={medianClp:row.medianClp,p10Clp:row.p10Clp,p90Clp:row.p90Clp,sampleSize:row.sampleSize};
    if(Object.keys(previous).some(k=>previous[k]!==current[k]))
     report.changes.push({brandSlug:row.brandSlug,modelSlug:row.modelSlug,year:row.year,sourceUrl:row.sourceUrl,previous,current});
    else report.unchanged++;
   }catch(e){report.failures.push({brandSlug:row.brandSlug,modelSlug:row.modelSlug,year:row.year,sourceUrl:row.sourceUrl,error:String(e.message||e)});}
  }));
 }
 const out=process.env.GITHUB_WORKSPACE||root;
 fs.writeFileSync(path.join(out,'rindelab-used-market-watch.json'),JSON.stringify(report,null,2)+'\n');
 fs.writeFileSync(path.join(out,'rindelab-used-market-watch.md'),[
  '# RINDELAB — control de precios de usados','',
  'Corte de auditoría '+date+'; base documental '+source.observedAt+'.',
  '',
  '- Fuentes consultadas: '+report.checked,
  '- Respuestas idénticas: '+report.unchanged,
  '- Cambios numéricos pendientes de revisión: '+report.changes.length,
  '- Fuentes no disponibles o sin muestra suficiente: '+report.failures.length,
  '',
  '## Cambios',
  ...report.changes.map(x=>'- '+x.brandSlug+' '+x.modelSlug+' '+x.year+': '+x.previous.medianClp+' → '+x.current.medianClp+' ('+x.sourceUrl+')'),
  '',
  'No actualiza los datos publicados, no modela depreciaciones y no extrapola a otras versiones.'
 ].join('\n')+'\n');
 console.log(JSON.stringify({checked:report.checked,unchanged:report.unchanged,changes:report.changes.length,failures:report.failures.length},null,2));
 if(report.failures.length>=report.checked&&report.checked>0)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
