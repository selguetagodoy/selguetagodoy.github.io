'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const source=require('../data/historical-photo-import-batch4-20261123.json'),cover=require('../data/real-3cv-photo-coverage-20261123.json');
assert.equal(source.searched,25);assert.equal(source.imported,18);assert.equal(source.photos.length,18);
assert.equal(source.errors.length,3);assert.equal(source.rejectedAfterVisualReview.length,4);
assert.equal(cover.total,8394);assert.equal(cover.withPhoto,3921);assert.equal(cover.withoutPhoto,4473);
assert.equal(cover.historicalCommonsBatch420261123.newlyCovered,146);assert.equal(cover.historicalCommonsBatch420261123.photoAssetsAdded,18);
assert.equal(cover.historicalCommonsBatch320261123.newlyCovered,337);
for(const p of source.photos){
 assert(p.brand&&p.pattern&&p.author&&p.license&&p.licenseUrl&&p.source&&p.sha256);
 assert(p.source.startsWith('https://commons.wikimedia.org/wiki/File:'));
 assert(/^CC BY(?:-SA)? [234]\.0$|^CC0$/.test(p.license));
 assert(p.licenseUrl.startsWith('https://creativecommons.org/'));
 const b=fs.readFileSync(path.resolve(root,p.localSrc));assert.equal(crypto.createHash('sha256').update(b).digest('hex'),p.sha256);assert.equal(b.length,p.bytes);
 assert(b.length>12000&&b.subarray(0,2).toString('hex')==='ffd8');
}
const ctx={window:{},document:{addEventListener(){}},HTMLImageElement:class{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'v2-photos.js'),'utf8'),ctx);
assert.equal(ctx.window.RindelabPhotos.count,975);
const F={BRAND:0,MODEL:1,TECH:2,DATE:8};const find=(b,m,y)=>ctx.window.RindelabPhotos.find([b,m,'Bencina',null,null,null,null,null,y+'-05-01'],F);
const no=[['Foton','Terracota Cabina Doble','2016','foton-terracota-double'],['Subaru','Forester XT','2015','subaru-forester-sj'],['BMW','118d 2,0 Lts. Hatchback 3P.','2016','bmw-f20-lci'],['Mercedes-Benz','E 300 Coupé','2019','mb-e-cabrio-a238'],['Jaguar','XF Sportbrake','2023','jaguar-xf-x260-fl'],['Volkswagen','Saveiro 1,6 CS T/M','2023','vw-saveiro-double']];
for(const [b,m,y,id]of no)assert(!find(b,m,y)?.src.includes('rindelab-historical-batch4-'+id),'Wrong body '+b+' '+m);
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');assert(html.includes('3.921 de 8.394 fichas'));assert(html.includes('4.473 fichas sin foto'));assert(html.includes('historical-commons8'));
console.log('PASS batch4: 18 licensed pictures, 146 new records, 4.473 pending.');
