'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const versionByPage={'index.html':'20261123-historical-commons5','cotizador.html':'20261122-photo700-r1','electromovilidad.html':'20261122-photo700-r1'};
for(const page of ['index.html','cotizador.html','electromovilidad.html']){
 const html=fs.readFileSync(path.join(root,page),'utf8');
 const matches=[...html.matchAll(/<script\b[^>]+src=["']([^"']*v2-photos\.js[^"']*)["'][^>]*>/g)];
 assert.equal(matches.length,1,'Exactly one photo script on '+page);
 assert.equal(matches[0][1],'./v2-photos.js?v='+versionByPage[page],'Photo URL must change with library version '+page);
}
const photos=fs.readFileSync(path.join(root,'v2-photos.js'),'utf8');
assert(photos.includes('officialManufacturerBatch1220261122'),'Complete final batch must load');
console.log('PASS: 3 UI entry points use new photos cache key and latest 27 model batch');
