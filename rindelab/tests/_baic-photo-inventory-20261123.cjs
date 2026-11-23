'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'..');
const legacyDir=path.resolve(root,'../vehiculos');
const manifest=require(path.join(legacyDir,'data/manifest.json'));
const rows=manifest.files.flatMap(f=>require(path.join(legacyDir,f))).filter(x=>x&&/BAIC|BAW|BEIJING/i.test(x[0]||''));
const files=['oficial-api-20261018-01.json','oficial-api-20261018-02.json','oficial-api-20261018-03.json','oficial-api-20261018-04.json','oficial-api-20261122.json'];
const modern=files.flatMap(n=>require(path.join(root,'data',n)).items||[]).filter(x=>/BAIC|BAW|BEIJING/i.test(x.nombreMarca||'')).map(x=>[x.nombreMarca,x.nombreModelo,x.propulsion,x.fechaHomologacion?.slice(0,10),x.codigoInformeTecnico]);
const ctx={window:{},document:{addEventListener(){}},HTMLImageElement:class{}};vm.runInNewContext(fs.readFileSync(path.join(root,'v2-photos.js'),'utf8'),ctx);
const F={BRAND:0,MODEL:1,TECH:2,DATE:8};
const photo=ctx.window.RindelabPhotos;
const grouped=new Map();
for(const r of rows){
 const k=(r[0]||'')+'|'+(r[1]||'');
 let v=grouped.get(k);
 if(!v){v={brand:r[0],model:r[1],total:0,withPhoto:0,earliest:r[8],latest:r[8],tech:[],examples:[]};grouped.set(k,v);}
 v.total++; const p=photo.find(r,F);
 if(p)v.withPhoto++;if(r[8]&&r[8]<v.earliest)v.earliest=r[8];if(r[8]&&r[8]>v.latest)v.latest=r[8];
 if(r[2]&&!v.tech.includes(r[2]))v.tech.push(r[2]);
 if(v.examples.length<2)v.examples.push({date:r[8],code:r[9],picture:p?.src||null});
}
const data={groupCount:grouped.size,legacyCount:rows.length,legacyPhotoRows:rows.filter(r=>!!photo.find(r,F)).length,modernCount:modern.length,modern:modern.slice(0,40),groups:[...grouped.values()].sort((a,b)=>a.model.localeCompare(b.model))};
const out=path.join(root,'data','baic-photo-audit-20261123.json');fs.writeFileSync(out,JSON.stringify(data,null,2));
console.log('BAIC',data.groupCount,'models',data.legacyCount,'historic fichas',data.legacyPhotoRows,'with photo','modern',data.modernCount);
for(const g of data.groups)console.log(g.model.padEnd(47),String(g.withPhoto).padStart(3)+'/'+String(g.total).padEnd(3),g.earliest,'→',g.latest,g.tech.join(','),g.examples[0]?.picture||'-');
console.log('SAVED',out);
