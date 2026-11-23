'use strict';
const fs=require('node:fs'),crypto=require('node:crypto'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..');
const manifest=require('../data/commons-gap4-20261122.json');
const cover=require('../data/catalog-coverage-20261122.json');
assert.equal(manifest.missingBefore,143);
assert.equal(manifest.photos.length,39);
assert(cover.summary.photosInLibrary>=557);
assert(cover.summary.withoutFamilyPhoto<=96);
assert.equal(cover.summary.activeFamiliesTechnologies,700);
const js=fs.readFileSync(path.join(root,'rindelab/v2-photos.js'),'utf8');
const ctx={window:{},document:{addEventListener(){}},HTMLImageElement:class{}};
vm.runInNewContext(js,ctx);
const photos=ctx.window.RindelabPhotos;
assert(photos.count>=557);
let families=0;
for(const p of manifest.photos){
 assert(p.brand&&p.family&&p.author&&p.source.startsWith('https://commons.wikimedia.org/wiki/File:'));
 assert(/^CC0|^CC BY(?:-SA)? [234]\.0(?: [a-z]{2})?$/i.test(p.license),p.license);
 assert(p.licenseUrl.startsWith('https://creativecommons.org/'));
 const f=path.resolve(root,'rindelab',p.localSrc);
 const b=fs.readFileSync(f);
 assert.equal(b.length,p.bytes);
 assert(b.length>12000&&b.length<1200000);
 assert.equal(crypto.createHash('sha256').update(b).digest('hex'),p.sha256);
 assert.equal(b[0],255); assert.equal(b[1],216);
 const pic=photos.findCommercial({brand:p.brand,family:p.family,technology:p.tech||null,modelYear:'2026'});
 assert(pic,'Photo not associated: '+p.brand+' '+p.family);
 families++;
}
for(const p of [
 {brand:'Chevrolet',family:'N400 Cargo'},
 {brand:'RAM',family:'V1000'},
 {brand:'Foton',family:'TM3'},
 {brand:'Mini',family:'JCW Eléctrico',technology:'EV'}
])assert(!photos.findCommercial(p),'Unverified substitute photo for '+p.brand+' '+p.family);
console.log('PASS photo batch 4: '+manifest.photos.length+' photos; '+families+' linked, 557 library, 96 groups missing.');
