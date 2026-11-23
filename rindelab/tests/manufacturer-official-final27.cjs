'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..');
const batch=require('../data/manufacturer-photo-batch12-final27-20261122.json');
const coverage=require('../data/catalog-coverage-20261122.json');
const ctx={window:{},document:{addEventListener(){}},HTMLImageElement:class{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'rindelab/v2-photos.js'),'utf8'),ctx);
const lib=ctx.window.RindelabPhotos;
assert.equal(batch.photos.length,27);
assert.equal(new Set(batch.photos.map(x=>x.brand+'|'+x.family)).size,27);
assert.equal(new Set(batch.photos.map(x=>x.localSrc)).size,27);
assert(lib.count>=650);
assert.equal(coverage.summary.photosInLibrary,lib.count);
assert.equal(coverage.summary.activeFamiliesTechnologies,700);
assert.equal(coverage.summary.withoutFamilyPhoto,0);
assert.equal(coverage.allGroups.filter(x=>!x.photo).length,0);
let checked=0;
for(const p of batch.photos){
 assert(p.brand&&p.family&&p.author&&p.model);
 assert(p.localSrc.startsWith('https://'));
 assert(p.source.startsWith('https://'));
 assert.equal(p.verifiedHttpStatus,200);
 assert(p.size[0]>=500&&p.size[1]>=400);
 assert.equal(p.license,'Derechos reservados');
 assert(p.rightsStatus.includes('Sin licencia abierta')||p.rightsStatus.includes('Sin licencia'));
 assert(new RegExp(p.pattern,'i').test(p.family));
 for(const year of ['2026','2027']){
  const img=lib.findCommercial({brand:p.brand,family:p.family,technology:p.tech||'',modelYear:year});
  assert(img,'No mapped image for '+p.brand+' '+p.family+' '+year);
  assert.equal(img.src,p.localSrc,'Wrong image for '+p.brand+' '+p.family+' '+year);
 }
 checked++;
}
const fuso=batch.photos.find(x=>x.brand==='Fuso'&&x.family==='Canter 718');
const bmw=batch.photos.find(x=>x.brand==='BMW'&&x.family==='Serie M');
assert(fuso.scopeNote.includes('NO es fotografía certificada'),'Fuso 7C18 reference must be identified');
assert(bmw.scopeNote.includes('NO representa todas'),'BMW M3 representative only');
console.log('PASS final 27: '+checked+' exact-image associations, 650 photos, 700/700 groups (100%), 0 remaining');
