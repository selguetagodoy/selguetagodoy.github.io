'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const r=path.resolve(__dirname,'../..');
const data=require('../data/manufacturer-photo-batch11-20261122.json');
const cover=require('../data/catalog-coverage-20261122.json');
const leads=require('../data/karry-official-leads-20261122.json');
const c={window:{},document:{addEventListener(){}},HTMLImageElement:class{}};
vm.runInNewContext(fs.readFileSync(path.join(r,'rindelab/v2-photos.js'),'utf8'),c);
const photos=c.window.RindelabPhotos;
assert.equal(data.photos.length,3);
assert.equal(photos.count,623);
assert.equal(cover.summary.photosInLibrary,623);
assert.equal(cover.summary.withoutFamilyPhoto,27);
for(const p of data.photos){
 assert(p.localSrc.startsWith('https://')&&p.source.startsWith('https://'));
 assert.equal(p.license,'Derechos reservados');
 assert(p.rightsStatus.includes('Sin licencia abierta'));
 assert(p.size[0]>=450&&p.size[1]>=400);
 assert(photos.findCommercial({brand:'Changan',family:p.family,modelYear:'2026'}),'Missing '+p.family);
}
assert.equal(leads.models.length,4);
for(const p of leads.models.filter(x=>x.image))assert(!photos.findCommercial({brand:'Karry',family:p.family}),'Blocked Karry model incorrectly counted '+p.family);
console.log('PASS OEM batch11: 623 references, 673/700 groups covered; Karry 403 links not counted');
