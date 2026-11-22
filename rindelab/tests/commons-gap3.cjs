'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..');
const manifest=require('../data/commons-gap3-20261122.json');
const cover=require('../data/catalog-coverage-20261122.json');
assert.equal(manifest.missingBefore,185);
assert.equal(manifest.photos.length,19);
const js=fs.readFileSync(path.join(root,'rindelab/v2-photos.js'),'utf8');
const ctx={window:{},document:{addEventListener(){}},HTMLImageElement:class{}};
vm.runInNewContext(js,ctx);
const photos=ctx.window.RindelabPhotos;
assert.equal(photos.count,499+manifest.photos.length);
assert.equal(cover.summary.photosInLibrary,photos.count);
assert.equal(cover.summary.withoutFamilyPhoto,143);
for(const p of manifest.photos){
 assert(p.brand&&p.family&&p.author&&p.source.includes('commons.wikimedia.org/wiki/File:'));
 assert(/^CC0|^CC BY(?:-SA)? [234]\.0(?: [a-z]{2})?$/i.test(p.license),'license for '+p.family);
 const file=path.resolve(root,'rindelab',p.localSrc);
 const b=fs.readFileSync(file);
 assert.equal(b.length,p.bytes);
 assert(b.length>12000&&b.length<1200000);
 assert.equal(crypto.createHash('sha256').update(b).digest('hex'),p.sha256);
 assert.equal(b[0],255);assert.equal(b[1],216);
 const found=photos.findCommercial({brand:p.brand,family:p.family,modelYear:'2026',checkedAt:'2026-11-22'});
 assert(found&&found.source===p.source,'New photo not selected for '+p.brand+' '+p.family);
}
for(const [brand,family,tech] of [
 ['Great Wall','Haval H6','HEV'],['Great Wall','Tank 500',''],['Honda','Pilot',''],
 ['Mini','Aceman','EV'],['Porsche','Taycan','EV']
])assert(photos.findCommercial({brand,family,technology:tech,modelYear:'2027'}),'Expected generation carry-forward for '+brand+' '+family);
for(const [brand,family,tech] of [
 ['Porsche','Cayenne','EV'],['Great Wall','Poer P500','PHEV'],
 ['Mazda','All New CX-5','Bencina']
])assert(!photos.findCommercial({brand,family,technology:tech,modelYear:'2027'}),'Wrong body must remain unpictured: '+brand+' '+family);
console.log('PASS Commons gap3: 19 verified photographs, 518 library, 143 gaps, 2027 compatibility rules');
