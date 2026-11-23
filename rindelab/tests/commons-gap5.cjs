'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..');
const manifest=require('../data/commons-gap5-20261122.json');
const cover=require('../data/catalog-coverage-20261122.json');
const src=fs.readFileSync(path.join(root,'rindelab/v2-photos.js'),'utf8');
const env={window:{},document:{addEventListener(){}},HTMLImageElement:class{}};
vm.runInNewContext(src,env);
const photos=env.window.RindelabPhotos;
assert.equal(manifest.photos.length,14);
assert(photos.count>=571);
assert(cover.summary.photosInLibrary>=571);
assert(cover.summary.withoutFamilyPhoto<=81);
assert.equal(cover.summary.activeFamiliesTechnologies,700);
for(const p of manifest.photos){
 assert(p.brand&&p.family&&p.author,'Missing attribution fields');
 assert(p.source.startsWith('https://commons.wikimedia.org/wiki/File:'));
 assert(/^CC0|^CC BY(?:-SA)? [234]\.0(?: [a-z]{2})?$/i.test(p.license),'Bad license '+p.license);
 const file=path.resolve(root,'rindelab',p.localSrc);
 const bytes=fs.readFileSync(file);
 assert.equal(bytes.length,p.bytes);assert(bytes.length>12000&&bytes.length<1200000);
 assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),p.sha256);
 const linked=photos.findCommercial({brand:p.brand,family:p.family,technology:p.tech||null,modelYear:'2026'});
 assert(linked,'Photo not linked for '+p.brand+' '+p.family);
}
for(const g of [
 {brand:'RAM',family:'V1000'},{brand:'Chery',family:'cl-tiggo-2-pro'},
 {brand:'Chery',family:'cl-tiggo-3-pro'}
])assert(photos.findCommercial(g),'New verified image missing for '+g.brand+' '+g.family);
console.log('PASS Commons gap5: 14 licensed JPEG photos, 571 library entries and 81 pending groups');
