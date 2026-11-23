'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..'),rd=p=>require(path.join(root,p));
const data=rd('rindelab/data/licensed-photos-november-2026.json');
assert.equal(data.images.length,19);
const commercialCover=rd('rindelab/data/catalog-coverage-20261122.json');
assert(commercialCover.summary.photosInLibrary>=292);
assert.equal(commercialCover.summary.activeFamiliesTechnologies,700);
assert(commercialCover.summary.withoutFamilyPhoto<=407);
assert.equal(commercialCover.summary.generatedDate,'2026-11-22');
const seen=new Set();
for(const pic of data.images){
 assert(/^CC0$|^CC BY(?:-SA)? [234]\.0$/.test(pic.license),pic.license);
 assert(pic.source.startsWith('https://commons.wikimedia.org/wiki/File:'));
 assert(pic.author&&pic.model&&pic.brand&&pic.pattern);
 assert(pic.localSrc.startsWith('./images/commons/rindelab-'));
 const f=path.join(root,'rindelab',pic.localSrc);
 const b=fs.readFileSync(f);
 assert(b.length>=10000&&b.length<=2000000,pic.localSrc);
 assert.equal(b[0],0xff);assert.equal(b[1],0xd8);
 assert.equal(b.length,pic.bytes);
 assert.equal(crypto.createHash('sha256').update(b).digest('hex'),pic.sha256);
 assert(!seen.has(pic.localSrc),'Foto repetida');seen.add(pic.localSrc);
}
const s=fs.readFileSync(path.join(root,'rindelab/v2-photos.js'),'utf8');
const context={window:{},document:{addEventListener(){}},HTMLImageElement:class{}};
vm.runInNewContext(s,context);
const find=context.window.RindelabPhotos.find;
const F={BRAND:0,MODEL:1,TECH:2,DATE:8};
const rows=rd('rindelab/data/oficial-api-20261122.json').items.map(rd('rindelab/sii/official-api-mapper.js').convert);
const matches=rows.map(row=>({row,photo:find(row,F)}));
assert.equal(rows.length,69);
assert(matches.filter(x=>x.photo).length>=51);
const pv5=matches.filter(x=>x.row[0]==='Kia'&&x.row[1].includes('PV5'));
assert.equal(pv5.length,8);
assert.equal(pv5.filter(x=>x.photo).length,7);
assert(pv5.find(x=>x.row[1].includes('Pick-Up')).photo===null,'No asignar la van cerrada como pickup');
assert(pv5.filter(x=>x.photo).every(x=>x.photo.model.includes('Cargo')),'Foto de pasajeros no corresponde a Cargo');
for(const brand of ['Hyundai','Arcfox','BMW','Changan','Citroen','Skoda','Land Rover']){
 assert(matches.some(x=>x.row[0]===brand&&x.photo),'Foto modelo nuevo no disponible: '+brand);
}
const arizon=matches.filter(x=>x.row[0]==='Nissan'&&x.row[1].includes('Arizon'));
assert(arizon.every(x=>!x.photo),'No sustituir Nissan Arizon por NX8');
for(const name of ['index','cotizador','electromovilidad']){
 const html=fs.readFileSync(path.join(root,'rindelab',name+'.html'),'utf8');
 assert(/v2-photos\.js\?v=(?:20261122-(?:licensed33|carimages|commonsmass|commonsmass2|photo700-r1)|20261123-baic-audit1)/.test(html));
}
console.log('PASS: 19 fotografías Wikimedia Commons con autor/licencia/hash. 51/69 fichas nuevas con foto, Kia PV5 Cargo 7/8, sin cruces de carrocería Nissan Arizon ni PV5 pickup.');
