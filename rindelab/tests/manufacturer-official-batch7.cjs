'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..');const cover=require('../data/catalog-coverage-20261122.json');
const x=require('../data/manufacturer-photo-batch7-20261122.json');assert.equal(x.images.length,13);
const c={window:{},document:{addEventListener(){}},HTMLImageElement:class{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'rindelab/v2-photos.js'),'utf8'),c);
assert(c.window.RindelabPhotos.count>=605);
assert(cover.summary.photosInLibrary>=605);
assert(cover.summary.withoutFamilyPhoto<=46);
for(const p of x.images){
 assert(p.localSrc.startsWith('https://') && p.source.startsWith('https://'));
 assert.equal(p.license,'Derechos reservados');
 const photo=c.window.RindelabPhotos.findCommercial({brand:p.brand,family:p.family,technology:p.tech||null,modelYear:'2026'});
 assert(photo,'Not mapped '+p.brand+' '+p.family);
}
assert(c.window.RindelabPhotos.findCommercial({brand:'Foton',family:'FT Crew'}),'FT Crew later-batch manufacturer image missing');
console.log('PASS OEM batch7 13 exact-family external references; groups pending '+cover.summary.withoutFamilyPhoto);
