'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..');
const manifest=require('../data/manufacturer-photo-batch6-20261122.json');
const coverage=require('../data/catalog-coverage-20261122.json');
const ctx={window:{},document:{addEventListener(){}},HTMLImageElement:class{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'rindelab/v2-photos.js'),'utf8'),ctx);
const library=ctx.window.RindelabPhotos;
assert.equal(manifest.images.length,21);
assert(library.count>=592);
assert(coverage.summary.photosInLibrary>=592);
assert(coverage.summary.withoutFamilyPhoto<=59);
for(const photo of manifest.images){
 assert(photo.localSrc.startsWith('https://') && photo.source.startsWith('https://'),'Only HTTPS external sources allowed');
 assert(photo.license==='Derechos reservados','Do not incorrectly assign Creative Commons');
 assert(photo.licenseUrl===photo.source);
 assert(photo.rightsStatus.includes('No se verificó una licencia abierta'));
 const found=library.findCommercial({brand:photo.brand,family:photo.family,modelYear:'2026'});
 assert(found,'No family image mapped for '+photo.brand+' '+photo.family);
}
console.log('PASS OEM external photo references: 21 images, current library '+library.count+', missing '+coverage.summary.withoutFamilyPhoto);
