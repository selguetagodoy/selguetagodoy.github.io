'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'..'),vroot=path.resolve(root,'../vehiculos');
const manifest=require(path.join(vroot,'data/manifest.json'));
const legacy=manifest.files.flatMap(f=>require(path.join(vroot,f))).filter(r=>r&&r[0]&&r[1]&&r[8]&&r[8]<=manifest.published);
const api=require('../sii/official-api-mapper.js');
const batch=[1,2,3,4].map(i=>require(path.join(root,'data','oficial-api-20261018-'+String(i).padStart(2,'0')+'.json')));
const previous=api.load(batch,legacy);
const delta=api.loadIncremental(require('../data/oficial-api-20261122.json'),legacy,previous);
const rows=legacy.concat(previous,delta);
const context={window:{},document:{addEventListener(){}},HTMLImageElement:class{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'v2-photos.js'),'utf8'),context);
const photos=context.window.RindelabPhotos;
const F={BRAND:0,MODEL:1,TECH:2,DATE:8};
let ok=0;const perBrand={};
const aliases={'M. Benz':'Mercedes-Benz','Ram':'RAM','LEAPMOTOR':'Leapmotor','Faw':'FAW','Lynk Co':'Lynk & Co','ZX Auto':'Zxauto','Ssangyong':'KGM','Haval':'Great Wall','DFM':'Dongfeng','Mitsubishi Fuso':'Fuso','Exeed Born For More':'Exeed'};
for(const original of rows){
 const row=original.slice();row[0]=aliases[row[0]]||row[0];
 const brand=row[0],present=!!photos.find(row,F);
 if(present)ok++;
 perBrand[brand]??={total:0,withPhoto:0,missing:0};
 perBrand[brand].total++;if(present)perBrand[brand].withPhoto++;else perBrand[brand].missing++;
}
const ranked=Object.entries(perBrand).filter(([name,g])=>g.total>=15).sort((a,b)=>b[1].missing-a[1].missing).slice(0,25);
const previousAudit=require('../data/real-3cv-photo-coverage-20261123.json');
const sourceAudit=require('../data/historical-photo-import-20261123.json');
const sourceBatch2=require('../data/historical-photo-import-batch2-20261123.json');
const sourceBatch3=require('../data/historical-photo-import-batch3-20261123.json');
const sourceBatch4=require('../data/historical-photo-import-batch4-20261123.json');
const sourceBatch5=require('../data/historical-photo-import-batch5-20261123.json');
const sourceBatch6=require('../data/historical-photo-import-batch6-20261123.json');
const sourceBatch7=require('../data/historical-photo-import-batch7-20261123.json');
const sourceBatch8=require('../data/historical-photo-import-batch8-20261123.json');
const result={time:'2026-11-23',legacy:legacy.length,october:previous.length,november:delta.length,total:rows.length,withPhoto:ok,withoutPhoto:rows.length-ok,byBrand:perBrand,topMissingBrands:ranked,
 beforeGenerationReuse:previousAudit.beforeGenerationReuse,generationReuse20261123:previousAudit.generationReuse20261123,
 historicalCommons20261123:{withPhotoBefore:2425,withoutPhotoBefore:5969,newlyCovered:264,photoAssetsAdded:sourceAudit.photos.length,
 source:'data/historical-photo-import-20261123.json',method:'Fotografías Commons verificadas y asociadas por marca, patrón estricto, carrocería y generación; imagen referencial, no la versión exacta homologada'}};
result.historicalCommonsBatch220261123={
 withPhotoBefore:2689,withoutPhotoBefore:5705,newlyCovered:176,
 photoAssetsAdded:sourceBatch2.photos.length,
 source:'data/historical-photo-import-batch2-20261123.json',
 method:'Fotografías CC verificadas en Commons con 16 reglas por familia y carrocería; exclusiones explícitas de Cabrio y RS; asociación referencial 3CV'
};

result.historicalCommonsBatch320261123={
 withPhotoBefore:2865,withoutPhotoBefore:5529,newlyCovered:337,
 photoAssetsAdded:sourceBatch3.photos.length,
 source:'data/historical-photo-import-batch3-20261123.json',
 method:'52 imágenes Wikimedia Commons CC con revisión visual manual y filtros de generación/carrocería; imágenes referenciales, no versiones exactas.'
};
result.historicalCommonsBatch420261123={withPhotoBefore:3202,withoutPhotoBefore:5192,newlyCovered:146,photoAssetsAdded:sourceBatch4.photos.length,source:'data/historical-photo-import-batch4-20261123.json',method:'Commons: licencias verificadas y revisión visual de carrocería y generación'};
result.historicalCommonsBatch520261123={withPhotoBefore:3348,withoutPhotoBefore:5046,newlyCovered:159,photoAssetsAdded:sourceBatch5.photos.length,source:'data/historical-photo-import-batch5-20261123.json',method:'Commons: licencia y revision visual de generacion y carroceria'};
result.historicalCommonsBatch620261123={withPhotoBefore:3507,withoutPhotoBefore:4887,newlyCovered:89,photoAssetsAdded:sourceBatch6.photos.length,source:'data/historical-photo-import-batch6-20261123.json',method:'Commons: busqueda masiva, licencia y revision visual por generacion y carroceria'};
result.historicalCommonsBatch720261123={withPhotoBefore:3596,withoutPhotoBefore:4798,newlyCovered:177,photoAssetsAdded:sourceBatch7.photos.length,source:'data/historical-photo-import-batch7-20261123.json',method:'Commons: busqueda masiva sin repetir grupos, licencia y revision visual, nuevas fotos solo para fichas pendientes'};
result.historicalCommonsBatch820261123={withPhotoBefore:3773,withoutPhotoBefore:4621,newlyCovered:ok-3773,photoAssetsAdded:sourceBatch8.photos.length,source:'data/historical-photo-import-batch8-20261123.json',method:'Commons: reutilizacion del barrido300; licencias verificadas y revision visual; conservar fotos previas'};
fs.writeFileSync(path.join(root,'data/real-3cv-photo-coverage-20261123.json'),JSON.stringify(result,null,2)+'\n');
console.log('ACTUAL_3CV',rows.length,'WITH_PHOTO',ok,'WITHOUT_PHOTO',rows.length-ok,'RATE',(100*ok/rows.length).toFixed(1)+'%');
console.log('BAIC',Object.entries(perBrand).filter(([b])=>/^baic$|^beijing$/i.test(b)));
console.log('TOP MISSING BRANDS',ranked.slice(0,15));
