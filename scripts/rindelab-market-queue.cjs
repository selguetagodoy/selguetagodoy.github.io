/* Cola auditable de 100 familias/tecnologías con campos o fotos pendientes.
 * No constituyen nuevas altas verificadas. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),C=require('../rindelab/sii/catalog-identity.js');
const records=require('../rindelab/sii/commercial-2026.json').filter(C.valid);
const window={};
vm.runInNewContext(fs.readFileSync(path.join(root,'rindelab/v2-photos.js'),'utf8'),{window,document:{addEventListener(){}}});
const photos=window.RindelabPhotos,groups=new Map();
for(const p of records.filter(C.active)){
 const key=C.key(p.brand,p.family)+'|'+(p.technology||'?');
 if(!groups.has(key))groups.set(key,[]);
 groups.get(key).push(p);
}
const summary={generatedDate:'2026-10-21',commercialRecords:records.length,activeFamiliesTechnologies:groups.size,photosInLibrary:photos.count,withoutFamilyPhoto:0,missingTechnologyFamilies:0,missingModelYearFamilies:0,finishedCampaignFamilies:0};
const out=[];
for(const [key,items] of groups){
 const p=items[0],knownTech=items.some(x=>x.technology),knownYear=items.some(x=>x.modelYear);
 const photo=items.map(x=>photos.findCommercial(x)).find(Boolean)||null;
 const campaign=items.every(x=>C.expired(x,'2026-10-21'));
 if(!photo)summary.withoutFamilyPhoto++;
 if(!knownTech)summary.missingTechnologyFamilies++;
 if(!knownYear)summary.missingModelYearFamilies++;
 if(campaign)summary.finishedCampaignFamilies++;
 const min=items.reduce((a,b)=>a.priceListClp<b.priceListClp?a:b);
 const priority=(!photo?3:0)+(!knownTech?2:0)+(!knownYear?1:0)+(campaign?2:0);
 out.push({key,brand:p.brand,family:p.family,technology:p.technology||null,versions:items.length,referencePriceClp:min.priceListClp,source:min.source,checkedAt:min.checkedAt,photo:photo?.src||null,photoSource:photo?.source||null,photoLicense:photo?.license||null,technologyMissing:!knownTech,modelYearMissing:!knownYear,campaignExpired:campaign,priority});
}
out.sort((a,b)=>b.priority-a.priority||a.brand.localeCompare(b.brand,'es')||a.family.localeCompare(b.family,'es'));
const queue=out.slice(0,100);
const doc=['# RINDELAB — Cola prioritaria de 100 familias comerciales','',
 'Corte: 21 de octubre de 2026. NO son 100 vehículos nuevos verificados ni 100 altas: son familias/tecnologías de las referencias existentes con información, fotografías o vigencia pendientes de revisión.',
 '',
 'Origen: commercial-2026.json y fotografías con atribución documental de RINDELAB. Ningún dato faltante se infiere.',
 '',
 '| N.º | Marca | Familia comercial | Tecnología | Versiones | Precio referencial | Foto | Año | Campaña vencida | Origen |',
 '|---:|---|---|---|---:|---:|---|---|---|---|'];
for(const [i,x] of queue.entries()){
 const cell=s=>String(s||'').replace(/\|/g,'/');
 doc.push('| '+(i+1)+' | '+cell(x.brand)+' | '+cell(x.family)+' | '+cell(x.technology||'SIN INFORMAR')+' | '+x.versions+' | $'+Number(x.referencePriceClp).toLocaleString('es-CL')+' | '+(x.photo?'Sí':'No')+' | '+(x.modelYearMissing?'Pendiente':'Alguna versión')+' | '+(x.campaignExpired?'Sí':'No')+' | [Fuente]('+x.source+') |');
}
doc.push('','Revisión: contrastar tecnología y generación con el fabricante; obtener imagen con licencia y atribución verificadas; actualizar fecha de comprobación exclusivamente si se revalida la fuente.');
const result={schemaVersion:1,summary,priorityQueue:queue,allGroups:out};
const json=path.join(root,'rindelab/data/catalog-coverage-20261021.json'),md=path.join(root,'rindelab/sii/LOTE-PENDIENTES-100-20261021.md');
const jsonText=JSON.stringify(result,null,2)+'\n',mdText=doc.join('\n')+'\n';
if(process.argv.includes('--check')){
 if(!fs.existsSync(json)||fs.readFileSync(json,'utf8')!==jsonText||!fs.existsSync(md)||fs.readFileSync(md,'utf8')!==mdText)throw Error('La cola cambió; actualizar mediante node scripts/rindelab-market-queue.cjs --write');
}else if(process.argv.includes('--write')){
 fs.writeFileSync(json,jsonText);fs.writeFileSync(md,mdText);
}
console.log(JSON.stringify({...summary,queueCount:queue.length,topQueue:queue.slice(0,4).map(x=>x.brand+' '+x.family)},null,2));
