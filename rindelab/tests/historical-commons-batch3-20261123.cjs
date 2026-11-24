'use strict';
/* Batch 3: licensed Commons provenance + manually reviewed exterior photos. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const source=require('../data/historical-photo-import-batch3-20261123.json');
const cover=require('../data/real-3cv-photo-coverage-20261123.json');
assert.equal(source.searched,53);
assert.equal(source.imported,52);
assert.equal(source.photos.length,52);
assert.equal(source.errors.length,0);
assert.equal(source.rejectedAfterVisualReview.length,1);
assert.equal(source.rejectedAfterVisualReview[0].id,'chevrolet-camaro-2013');
assert.equal(cover.total,8394);
assert.equal(cover.withPhoto,3921);
assert.equal(cover.withoutPhoto,4473);
assert.equal(cover.historicalCommonsBatch320261123.withPhotoBefore,2865);
assert.equal(cover.historicalCommonsBatch320261123.newlyCovered,337);
assert.equal(cover.historicalCommonsBatch320261123.photoAssetsAdded,52);
assert.equal(cover.historicalCommonsBatch220261123.newlyCovered,176);
assert.equal(cover.historicalCommons20261123.newlyCovered,264);
assert.equal(cover.byBrand.Baic.withPhoto,38);
for(const p of source.photos){
 assert(p.brand&&p.pattern&&p.model&&p.author&&p.license&&p.licenseUrl&&p.source&&p.sha256);
 assert(p.source.startsWith('https://commons.wikimedia.org/wiki/File:'));
 assert(/^CC BY(?:-SA)? [234]\.0$|^CC0$/.test(p.license),'Invalid CC license '+p.license);
 assert(p.licenseUrl.startsWith('https://creativecommons.org/'));
 assert(p.from<=p.to&&+p.from>=2010&&+p.to<=2026);
 new RegExp(p.pattern,'i');
 const file=path.resolve(root,p.localSrc);
 const buf=fs.readFileSync(file);
 assert(buf.length>12000&&buf.subarray(0,2).toString('hex')==='ffd8','Bad JPEG '+p.file);
 assert.equal(crypto.createHash('sha256').update(buf).digest('hex'),p.sha256,'Checksum '+p.file);
 assert.equal(buf.length,p.bytes,'Size audit '+p.file);
}
const ctx={window:{},document:{addEventListener(){}},HTMLImageElement:class{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'v2-photos.js'),'utf8'),ctx);
const library=ctx.window.RindelabPhotos;assert.equal(library.count,975);
const F={BRAND:0,MODEL:1,TECH:2,DATE:8};
const find=(brand,model,year)=>library.find([brand,model,'Bencina',null,null,null,null,null,year+'-05-01'],F);
const yes=[
 ['Mercedes-Benz','C 200 1,5 Lts. Sedán 4P. T/A Otto','2018','mb-c-w205'],
 ['Mercedes-Benz','E 350 Bluetec 3,0 Lts. DOHC Sedán 4P. T/A Diésel','2014','mb-e-w212'],
 ['Mercedes-Benz','CLE 300 4matic Coupé','2026','mb-cle-2024'],
 ['Audi','Q5 3,0 Lts. T-FSI DOHC Station Wagon 5P. 4x4 T/A Motor Otto','2013','audi-q5-8r'],
 ['Hyundai','Tucson LM 2,0 Lts. CRDi DOHC Station Wagon 5P. T/M 4WD Motor Diésel','2014','hyundai-tucson-lm'],
 ['Nissan','MARCH (K13) 1.6 AT 4x2','2016','nissan-march-2014'],
 ['Suzuki','Vitara 1,6 Lts. Station Wagon 5P. T/A 4x4 Otto','2018','suzuki-vitara-2017'],
 ['Volkswagen','Tiguan 2,0 Lts. Station Wagon 5 Asientos 5P. T/A 4x4 Otto','2017','vw-tiguan-2017'],
 ['BMW','X1 sDrive18i','2022','bmw-x1-f48-lci']
];
for(const [brand,model,year,id] of yes){
 const p=find(brand,model,year);
 assert(p?.src.includes('rindelab-historical-batch3-'+id),'Missing matching family '+brand+' '+model+' => '+p?.src);
}
const no=[
 ['Mercedes-Benz','C 300 2,0 Lts. Cabriolet 4P. T/A Otto','2017','mb-c-w205'],
 ['Mercedes-Benz','A 200 1,3 Lts. Hatchback 4P. T/M Otto','2018','mb-a-w176'],
 ['Ford','F150 Raptor 3,5 Lts. Camioneta 4P. T/A 4x4 Otto','2017','ford-f150-2017'],
 ['Volkswagen','Tiguan 2,0 Lts. Station Wagon 7 Asientos 5P. T/A 4x4 Otto','2017','vw-tiguan-2017'],
 ['Chevrolet','Camaro ZL1 6,2 Lts. OHV Coupé 2P. T/A Motor Otto','2012','chevrolet-camaro-2013']
];
for(const [brand,model,year,id] of no){
 const p=find(brand,model,year);
 assert(!p?.src.includes('rindelab-historical-batch3-'+id),'Wrong vehicle body / rejected photo '+brand+' '+model);
}
const page=fs.readFileSync(path.join(root,'index.html'),'utf8');
assert(page.includes('3.921 de 8.394 fichas'));
assert(page.includes('4.473 fichas sin foto'));
assert(page.includes('20261123-historical-commons8'));
console.log('PASS batch3 52 CC-licensed photos, +337 3CV, 4.473 still without photos; visual and body QA preserved');
