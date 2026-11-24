'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const source=require('../data/historical-photo-import-batch5-20261123.json'),cover=require('../data/real-3cv-photo-coverage-20261123.json');
assert.equal(source.searched,44);assert.equal(source.imported,38);assert.equal(source.photos.length,38);
assert.equal(source.errors.length,0);assert.equal(source.rejectedAfterVisualReview.length,6);
assert.equal(cover.total,8394);assert.equal(cover.withPhoto,3921);assert.equal(cover.withoutPhoto,4473);
assert.equal(cover.historicalCommonsBatch520261123.newlyCovered,159);assert.equal(cover.historicalCommonsBatch520261123.photoAssetsAdded,38);
assert.equal(cover.historicalCommonsBatch420261123.newlyCovered,146);
for(const p of source.photos){
 assert(p.brand&&p.pattern&&p.author&&p.license&&p.licenseUrl&&p.source&&p.sha256);
 assert(p.source.startsWith('https://commons.wikimedia.org/wiki/File:'));
 assert(/^CC BY(?:-SA)? [234]\.0$|^CC0$/.test(p.license));
 assert(p.licenseUrl.startsWith('https://creativecommons.org/'));
 const b=fs.readFileSync(path.resolve(root,p.localSrc));assert.equal(crypto.createHash('sha256').update(b).digest('hex'),p.sha256);assert.equal(b.length,p.bytes);assert(b.length>12000&&b.subarray(0,2).toString('hex')==='ffd8');
}
const ctx={window:{},document:{addEventListener(){}},HTMLImageElement:class{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'v2-photos.js'),'utf8'),ctx);
assert.equal(ctx.window.RindelabPhotos.count,975);
const F={BRAND:0,MODEL:1,TECH:2,DATE:8};const find=(b,m,y)=>ctx.window.RindelabPhotos.find([b,m,'Bencina',null,null,null,null,null,y+'-05-01'],F);
const no=[['Audi','A3 Hatchback 3P.','2015','audi-a3-8v-3door'],['BMW','320i Sedán','2020','bmw-g20'],['Foton','Terracota Camioneta Doble Cabina','2016','foton-terracota-sc'],['Skoda','Rapid Sedán 5P.','2015','skoda-rapid-nh'],['Volvo','S60 CC Sedán','2016','volvo-s60'],['Porsche','911 Targa 4 GTS','2017','porsche-991-targa']];
for(const [b,m,y,id] of no)assert(!find(b,m,y)?.src.includes('rindelab-historical-batch5-'+id),'Wrong body '+b+' '+m);
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');assert(html.includes('3.921 de 8.394 fichas'));assert(html.includes('4.473 fichas sin foto'));assert(html.includes('historical-commons8'));
console.log('PASS batch5: 38 licensed pictures, 159 new records, 4.473 pending.');
