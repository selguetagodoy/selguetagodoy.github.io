'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..');
const b9=require('../data/manufacturer-photo-batch9-20261122.json');
const b10=require('../data/manufacturer-photo-batch10-20261122.json');
const coverage=require('../data/catalog-coverage-20261122.json');
const c={window:{},document:{addEventListener(){}},HTMLImageElement:class{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'rindelab/v2-photos.js'),'utf8'),c);
const lib=c.window.RindelabPhotos;
assert.equal(b9.images.length,7);
assert.equal(b10.images.length,4);
assert(lib.count>=620);
assert(coverage.summary.photosInLibrary>=620);
assert(coverage.summary.withoutFamilyPhoto<=30);
assert.equal(coverage.summary.activeFamiliesTechnologies,700);
for(const p of [...b9.images,...b10.images]){
 assert(p.localSrc.startsWith('https://'),'External HTTPS required '+p.family);
 assert(p.source.startsWith('https://'),'Official source required '+p.family);
 assert.equal(p.license,'Derechos reservados');
 assert(p.rightsStatus.includes('Sin licencia abierta'));
 assert(p.size[0]>=300&&p.size[1]>=140,'Tiny or invalid image '+p.family);
 const found=lib.findCommercial({brand:p.brand,family:p.family,technology:p.tech||null,modelYear:'2026'});
 assert(found,'Photo missing '+p.brand+' '+p.family);
}
for(const p of [{brand:'Karry',family:'Q22 Cargo BOX'},{brand:'RAM',family:'V1000'}]){
 assert(lib.findCommercial(p),'Verified final-batch image missing: '+p.brand+' '+p.family);
}
console.log('PASS OEM batches9/10: 11 references, 620 photo references, 30 groups pending');
