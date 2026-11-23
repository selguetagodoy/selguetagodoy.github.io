'use strict';
/* Historical photo provenance and 3CV coverage audit: no mislabelled vehicle bodies. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const audit=require('../data/historical-photo-import-20261123.json');
const coverage=require('../data/real-3cv-photo-coverage-20261123.json');
const ctx={window:{},document:{addEventListener(){}},HTMLImageElement:class{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'v2-photos.js'),'utf8'),ctx);
const photos=ctx.window.RindelabPhotos;
assert.equal(audit.photos.length,41);
assert.equal(audit.failures.length,0);
assert.equal(photos.count,725);
for(const p of audit.photos){
 assert(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/.test(p.source),'Source must be Commons: '+p.model);
 assert(/^(?:CC BY(?:-SA)?(?:\s|$)|CC0|Public domain)/.test(p.license),'Unlicensed photo: '+p.model);
 assert(p.author&&p.licenseUrl&&p.model&&p.pattern,'Missing attribution metadata');
 const y1=Number(p.from),y2=Number(p.to);
 assert(y1>=2010&&y1<=y2&&y2<=2026,'Unsafe year interval: '+p.model);
 assert(!/generic|stock/i.test(p.model),'Generic photo: '+p.model);
 const f=path.resolve(root,p.localSrc);
 assert(fs.statSync(f).size>25_000,'Missing/small photo: '+p.localSrc);
 const b=Buffer.alloc(2),fd=fs.openSync(f,'r');fs.readSync(fd,b,0,2,0);fs.closeSync(fd);
 assert.equal(b.toString('hex'),'ffd8','Expected JPEG');
}
const F={BRAND:0,MODEL:1,TECH:2,DATE:8};
function get(brand,model,year,tech='Bencina'){
 return photos.find([brand,model,tech,null,null,null,null,null,year+'-05-01'],F);
}
const mustNotUseNew=[
 ['Mercedes-Benz','GLC 300d Coupé 4Matic','2019'],
 ['Mercedes-Benz','C 200 Coupé','2019'],
 ['Mercedes-Benz','GLE 500 Coupé','2017'],
 ['Audi','A3 2,0 Lts. Hatchback 3P. T/A Otto','2016'],
 ['Kia','Rio 3 (SC) 1,6 Lts. Hatchback 3P. T/M Otto','2017'],
 ['Porsche','911 Carrera GTS 3,0 Lts. Cabriolet 2P. T/A Otto','2017'],
 ['Ford','Ranger Raptor','2020'],
 ['Ford','Ranger Storm','2021']
];
for(const [brand,model,year] of mustNotUseNew){
 const p=get(brand,model,year);
 assert(!p?.src.includes('rindelab-historical-')||p.src.includes('rindelab-historical-batch2-'),
   'Wrong body attributed to first historical batch '+brand+' '+model);
}
const positive=[
 ['Jaguar','XE 2.0i R-Dynamic SE','2023'],
 ['BMW','X3 xDrive30d','2020'],
 ['Mercedes-Benz','GLC 300d 4Matic','2019'],
 ['Audi','A3 2,0 Lts. Sedán 4P. T/A Otto','2016'],
 ['Hyundai','Tucson TL 1,6 Lts. T GDI Station Wagon 5P. T/A 4WD Otto','2018'],
 ['Kia','Sorento (UM) 2,2 Lts. Station Wagon 4P. 7 Asientos T/A 4x4 Diésel','2017','Diésel'],
 ['Opel','Grandland 1.2L T/M','2020']
];
for(const [brand,model,year,tech] of positive){
 const p=get(brand,model,year,tech||'Bencina');
 assert(p?.src.includes('rindelab-historical-'),'Expected new licensed image: '+brand+' '+model);
}
assert.equal(coverage.total,8394);
assert.equal(coverage.withPhoto,2865);
assert.equal(coverage.withoutPhoto,5529);
assert.equal(coverage.historicalCommons20261123.newlyCovered,264);
assert.equal(coverage.historicalCommons20261123.photoAssetsAdded,41);
assert.equal(coverage.generationReuse20261123.newlyCovered,299);
assert.equal(coverage.byBrand.Baic.withPhoto,38);
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
assert(html.includes('2.865 de 8.394 fichas'));
assert(html.includes('5.529 fichas sin foto'));
assert(html.includes('20261123-historical-commons2'));
console.log('PASS: 41 imágenes Commons descargadas y atribuidas, 264 fichas 3CV adicionales, 8 exclusiones de carrocería, BAIC 38/39 conservado; 2.865/8.394 con foto');
