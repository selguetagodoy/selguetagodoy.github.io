'use strict';
const fs=require('node:fs'),crypto=require('node:crypto'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..');
const manifest=require(path.join(root,'rindelab/data/commons-mass-20261122.json'));
const cover=require(path.join(root,'rindelab/data/catalog-coverage-20261122.json'));
assert.equal(manifest.missingBefore,359);
assert(manifest.searched>=30);
assert(cover.summary.photosInLibrary>=335+manifest.photos.length);
assert(cover.summary.withoutFamilyPhoto<=359);
const js=fs.readFileSync(path.join(root,'rindelab/v2-photos.js'),'utf8');
const context={window:{},document:{addEventListener(){}},HTMLImageElement:class{}};
vm.runInNewContext(js,context);
const photos=context.window.RindelabPhotos;
assert(photos.count>=335+manifest.photos.length);
const used=new Set();
for(const p of manifest.photos){
 assert(p.brand&&p.family&&p.model&&p.author);
 assert(p.source.startsWith('https://commons.wikimedia.org/wiki/File:'));
 assert(/^CC0|^CC BY(?:-SA)? [234]\.0(?: [a-z]{2})?$/i.test(p.license));
 assert(p.licenseUrl.startsWith('https://creativecommons.org/'));
 assert(!used.has(p.localSrc),'Duplicate photo source');used.add(p.localSrc);
 const buffer=fs.readFileSync(path.join(root,'rindelab',p.localSrc));
 assert(buffer.length>=12000&&buffer.length<=1200000);
 assert.equal(buffer[0],255);assert.equal(buffer[1],216);
 assert.equal(buffer.at(-2),255);assert.equal(buffer.at(-1),217);
 assert.equal(buffer.length,p.bytes);
 assert.equal(crypto.createHash('sha256').update(buffer).digest('hex'),p.sha256);
 const photo=photos.findCommercial({brand:p.brand,family:p.family,checkedAt:'2026-11-22',technology:null});
 assert(photo,'Photo association failed for '+p.brand+' '+p.family);
 assert.equal(photo.source,p.source,'Photo ambiguous/mismatch');
}
for(const page of ['index.html','cotizador.html','electromovilidad.html']){
 assert(fs.readFileSync(path.join(root,'rindelab',page),'utf8').match(/v2-photos\.js\?v=(?:20261122-photo700-r1|20261123-(?:baic-audit1|generation-reuse1|historical-commons1|historical-commons2|historical-commons3|historical-commons4|historical-commons5|historical-commons6|historical-commons7|historical-commons8))/));
}
console.log('PASS Commons mass import',manifest.photos.length,'photos; groups without images',cover.summary.withoutFamilyPhoto);
