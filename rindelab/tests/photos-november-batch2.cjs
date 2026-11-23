'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),vm=require('node:vm');
const root=path.resolve(__dirname,'../..'),load=p=>require(path.join(root,p));
const latest=load('rindelab/data/licensed-photos-november-2026-batch2.json');
assert.equal(latest.images.length,14);
const known=new Set();
for(const x of latest.images){
 assert(x.brand&&x.model&&x.pattern&&x.author&&x.source&&x.license,'Metadata incomplete');
 assert(/^CC0$|^CC BY(?:-SA)? [234]\.0$/.test(x.license),'Unsupported license '+x.license);
 assert(x.source.startsWith('https://commons.wikimedia.org/wiki/File:'),'Not Wikimedia source');
 assert(x.licenseUrl.startsWith('https://creativecommons.org/'),'License URL missing');
 assert(x.localSrc.startsWith('./images/commons/rindelab-')&&x.localSrc.endsWith('.jpg'));
 const file=path.join(root,'rindelab',x.localSrc),b=fs.readFileSync(file);
 assert(b.length>=10000&&b.length<=2000000);
 assert.equal(b[0],255);assert.equal(b[1],216);
 assert.equal(b.length,x.bytes);assert.equal(crypto.createHash('sha256').update(b).digest('hex'),x.sha256);
 assert(!known.has(x.localSrc),'Duplicated file');known.add(x.localSrc);
}
const source=fs.readFileSync(path.join(root,'rindelab/v2-photos.js'),'utf8');
const context={window:{},document:{addEventListener(){}},HTMLImageElement:class{}};
vm.runInNewContext(source,context);
const photos=context.window.RindelabPhotos;
assert(photos.count>=292,'Library photo count regressed');
const coverage=load('rindelab/data/catalog-coverage-20261122.json');
assert(coverage.summary.photosInLibrary>=292);
assert.equal(coverage.summary.activeFamiliesTechnologies,700);
assert(coverage.summary.withoutFamilyPhoto<=407);
assert.equal(coverage.summary.generatedDate,'2026-11-22');
assert.equal(coverage.summary.missingTechnologyFamilies,486);
const items=load('rindelab/data/oficial-api-20261122.json').items.map(load('rindelab/sii/official-api-mapper.js').convert);
const F={BRAND:0,MODEL:1,TECH:2,DATE:8};
assert.equal(items.length,69);assert(items.filter(r=>photos.find(r,F)).length>=51);
assert(photos.find(items.find(x=>x[0]==='Geely'&&/CITYRAY/i.test(x[1])),F)?.src.includes('geely-cityray'),'Missing Geely Cityray photo');
for(const [brand,model] of [['Nissan','Arizon'],['Maxus','Deliver 7']]){
 assert(items.filter(r=>r[0]===brand&&r[1].toLowerCase().includes(model.toLowerCase())).every(r=>!photos.find(r,F)),'Do not substitute another vehicle for '+brand+' '+model);
}
assert(items.filter(x=>x[0]==='Kia'&&x[1].includes('PV5')&&!x[1].includes('Pick-Up')).every(x=>photos.find(x,F)),'Cargo van photo must remain');
assert(!photos.find(items.find(x=>x[0]==='Kia'&&x[1].includes('PV5')&&x[1].includes('Pick-Up')),F),'Pickup needs verified body photo');
const commercial=[
 ['Jetour','X70'],['Jetour','X90 PLUS'],['Peugeot','landtrek'],['Alfa Romeo','Tonale'],['Aston Martin','DBX'],['Audi','Q2'],['RAM','ram700'],['JMC','All New Vigus Plus'],['Citroen','jumpy']
];
for(const [brand,family] of commercial){
 const p=photos.findCommercial({brand,family,checkedAt:'2026-10-21'});
 assert(p,brand+' '+family+' has no licensed photo');
 assert(p.source.startsWith('https://commons.wikimedia.org/'));
}
for(const name of ['index','cotizador','electromovilidad']){
 assert(fs.readFileSync(path.join(root,'rindelab',name+'.html'),'utf8') .match(/v2-photos\.js\?v=20261122-(?:licensed33|carimages|commonsmass|commonsmass2|photo700-r1)/));
}
console.log('PASS: 14 licensed second-batch images with sources, author and SHA256; photo library 292; commercial missing 407; 51/69 new homologations with verified photo.');
