'use strict';
/* Batch2: strict Commons provenance, JPEG files, audit and body/generation exclusions. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const source=require('../data/historical-photo-import-batch2-20261123.json');
const coverage=require('../data/real-3cv-photo-coverage-20261123.json');
assert.equal(source.photos.length,16);
assert.equal(source.errors.length,0);
assert.equal(source.imported,16);
assert.equal(coverage.total,8394);
assert.equal(coverage.withPhoto,3507);
assert.equal(coverage.withoutPhoto,4887);
assert.equal(coverage.withPhoto+coverage.withoutPhoto,coverage.total);
assert.equal(coverage.historicalCommonsBatch220261123.newlyCovered,176);
assert.equal(coverage.historicalCommonsBatch220261123.photoAssetsAdded,16);
assert.equal(coverage.historicalCommons20261123.newlyCovered,264);
assert.equal(coverage.byBrand.Baic.withPhoto,38);
for(const p of source.photos){
 assert(p.brand&&p.model&&p.pattern&&p.author&&p.license&&p.licenseUrl&&p.source,'Missing attribution');
 assert(p.source.startsWith('https://commons.wikimedia.org/wiki/File:'),'Not a Commons file');
 assert(/^CC BY(?:-SA)? [234]\.0$|^CC0$/.test(p.license),'Disallowed license '+p.license);
 assert(p.licenseUrl.startsWith('https://creativecommons.org/'),'Invalid license URL');
 assert(+p.from_year>=2010&&+p.to_year<=2026&&p.from_year<=p.to_year,'Unsafe year window');
 new RegExp(p.pattern,'i');
 const file=path.resolve(root,p.localSrc);
 assert(fs.statSync(file).size>12000,'Missing/empty image '+p.file);
 const buffer=fs.readFileSync(file);
 assert.equal(buffer.subarray(0,2).toString('hex'),'ffd8','Not JPEG '+p.file);
 assert.equal(crypto.createHash('sha256').update(buffer).digest('hex'),p.sha256,'Image checksum mismatch '+p.file);
}
const ctx={window:{},document:{addEventListener(){}},HTMLImageElement:class{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'v2-photos.js'),'utf8'),ctx);
const photos=ctx.window.RindelabPhotos;
assert.equal(photos.count,833,'Historical additions do not change the 668-file commercial library');
const F={BRAND:0,MODEL:1,TECH:2,DATE:8};
function find(brand,model,year){
 return photos.find([brand,model,'Bencina',null,null,null,null,null,year+'-05-01'],F);
}
const shouldMatch=[
 ['Land Rover','Range Rover Evoque 1.5i PHEV S','2025','landrover-evoque'],
 ['Jaguar','F-Pace 2.0i R-Dynamic S PHEV','2023','jaguar-fpace'],
 ['Ford','Ranger Raptor','2020','ford-ranger-raptor'],
 ['Ford','Focus 2,0 Lts. Hatchback 5P. T/A Otto','2018','ford-focus-mk3-hatch'],
 ['Ford','Focus 2,0 Lts. Sedán 4P. T/A Otto','2018','ford-focus-mk3-sedan'],
 ['Ford','Explorer ST','2024','ford-explorer'],
 ['Jeep','Grand Cherokee L Limited 3.6L 4x4','2021','jeep-grand-cherokee'],
 ['Mercedes-Benz','Sprinter 315 CDI','2024','mercedes-sprinter'],
 ['Mercedes-Benz','GLC 300d Coupé 4Matic','2019','mercedes-glc-coupe'],
 ['Audi','A5 2,0 Lts. Hatchback 5P. T/A Otto','2015','audi-a5-sportback']
];
for(const [b,m,y,needle] of shouldMatch){
 const photo=find(b,m,y);
 assert(photo&&photo.src.includes('rindelab-historical-batch2-'+needle),'Wrong photo for '+b+' '+m);
}
const forbidden=[
 ['Ford','Focus RS 2,3 Lts. Hatchback 5P. T/M 4x4 Otto','2017','ford-focus-mk3-hatch'],
 ['Audi','A5 Sportback 1,8 Lts. T-FSI DOHC Cabio 2P. T/A Motor CJEB Otto','2012','audi-a5-sportback'],
 ['Mercedes-Benz','GLC 300d 4Matic','2019','mercedes-glc-coupe'],
 ['Ford','Ranger XL','2020','ford-ranger-raptor'],
 ['Citroen','Jumpy Furgón Escolar 2,0 Lts. HDI 3P. 21 Asientos T/M Diésel','2019','citroen-jumpy']
];
for(const [b,m,y,needle] of forbidden){
 const photo=find(b,m,y);
 assert(!photo?.src.includes('rindelab-historical-batch2-'+needle),'Wrong body '+b+' '+m);
}
const page=fs.readFileSync(path.join(root,'index.html'),'utf8');
assert(page.includes('3.507 de 8.394 fichas'));
assert(page.includes('4.887 fichas sin foto'));
assert(page.includes('20261123-historical-commons5'));
console.log('PASS 16 licensed Commons photos, +176 genuine 3CV associations (3.507/8.394), 4.887 pending, correct bodies, checksums');
