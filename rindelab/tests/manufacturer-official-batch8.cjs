'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),data=require('../data/manufacturer-photo-batch8-20261122.json'),cover=require('../data/catalog-coverage-20261122.json');
const c={window:{},document:{addEventListener(){}},HTMLImageElement:class{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'rindelab/v2-photos.js'),'utf8'),c);
assert.equal(data.images.length,4);assert(c.window.RindelabPhotos.count>=609);
assert(cover.summary.photosInLibrary>=609);assert(cover.summary.withoutFamilyPhoto<=42);
for(const p of data.images){
 assert(p.localSrc.startsWith('https://'));assert.equal(p.license,'Derechos reservados');
 assert(p.rightsStatus.includes('Sin licencia abierta'));
 const photo=c.window.RindelabPhotos.findCommercial({brand:p.brand,family:p.family,technology:p.tech||null,modelYear:'2026'});
 assert(photo,'Unmapped OEM image '+p.brand+' '+p.family);
}
console.log('PASS OEM batch8: 4 images; 609 photo references and 42 groups remaining');
