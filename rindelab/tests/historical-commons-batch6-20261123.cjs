'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const source=require('../data/historical-photo-import-batch6-20261123.json'),cover=require('../data/real-3cv-photo-coverage-20261123.json');
const scan=require('../data/fotos-rapidas/barrido120/candidatos.json');
assert.equal(scan.length,120);assert.equal(scan.filter(x=>x.choices.length>0).length,103);
assert.equal(scan.filter(x=>x.choices.length>0).reduce((n,x)=>n+Number(x.fichas),0),794);
assert.equal(scan.filter(x=>x.error).length,0);
assert.equal(source.searched,34);assert.equal(source.imported,25);assert.equal(source.photos.length,25);
assert.equal(source.errors.length,0);assert.equal(source.rejectedAfterVisualReview.length,9);
assert.equal(cover.total,8394);assert.equal(cover.withPhoto,3773);assert.equal(cover.withoutPhoto,4621);
assert.equal(cover.historicalCommonsBatch620261123.newlyCovered,89);assert.equal(cover.historicalCommonsBatch620261123.photoAssetsAdded,25);
assert.equal(cover.historicalCommonsBatch520261123.newlyCovered,159);
for(const p of source.photos){
 assert(p.brand&&p.pattern&&p.author&&p.license&&p.licenseUrl&&p.source&&p.sha256);
 assert(p.source.startsWith('https://commons.wikimedia.org/wiki/File:'));
 assert(/^CC BY(?:-SA)? [234]\.0$|^CC0$/.test(p.license));
 assert(p.licenseUrl.startsWith('https://creativecommons.org/'));
 const b=fs.readFileSync(path.resolve(root,p.localSrc));assert.equal(crypto.createHash('sha256').update(b).digest('hex'),p.sha256);assert.equal(b.length,p.bytes);assert(b.length>12000&&b.subarray(0,2).toString('hex')==='ffd8');
}
const ctx={window:{},document:{addEventListener(){}},HTMLImageElement:class{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'v2-photos.js'),'utf8'),ctx);
assert.equal(ctx.window.RindelabPhotos.count,918);
const F={BRAND:0,MODEL:1,TECH:2,DATE:8};const find=(b,m,y)=>ctx.window.RindelabPhotos.find([b,m,'Bencina',null,null,null,null,null,y+'-05-01'],F);
const no=[['Jeep','Wrangler Sahara 3P.','2013','wrangler-jk-unlimited'],['Mercedes-Benz','Vito 116 Furgon','2023','vito-tourer-2023'],['Suzuki','Swift Sport 1.4 MT','2023','swift-az-fl'],['Land Rover','Range Rover Evoque 5P.','2012','evoque-l538-3p'],['RAM','1500 Rebel Crew Cab','2017','ram-quad-2014'],['Mini','Cooper SD Roadster','2013','mini-r57-sd']];
for(const [b,m,y,id] of no)assert(!find(b,m,y)?.src.includes('rindelab-historical-batch6-'+id),'Wrong body '+b+' '+m);
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');assert(html.includes('3.773 de 8.394 fichas'));assert(html.includes('4.621 fichas sin foto'));assert(html.includes('historical-commons7'));
console.log('PASS batch6: 120 groups searched, 25 licensed pictures, 89 new records, 4.621 pending.');
