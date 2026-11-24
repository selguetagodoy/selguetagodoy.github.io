'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),s=require('../data/historical-photo-import-batch7-20261123.json'),a=require('../data/real-3cv-photo-coverage-20261123.json'),scan=require('../data/fotos-rapidas/barrido300/candidatos.json');
assert.equal(scan.length,300);assert.equal(scan.filter(x=>x.choices.length).length,256);assert.equal(scan.filter(x=>x.error).length,0);
assert.equal(s.photos.length,60);assert.equal(s.errors.length,0);assert.equal(s.rejectedAfterVisualReview.length,10);
assert.equal(a.withPhoto,3921);assert.equal(a.withoutPhoto,4473);assert.equal(a.historicalCommonsBatch720261123.newlyCovered,177);
for(const p of s.photos){assert(p.author&&p.source&&p.licenseUrl&&p.sha256);assert(/^CC BY(?:-SA)? [234]\.0$|^CC0$/.test(p.license));const b=fs.readFileSync(path.resolve(root,p.localSrc));assert.equal(crypto.createHash('sha256').update(b).digest('hex'),p.sha256);assert.equal(b.length,p.bytes);}
const ctx={window:{},document:{addEventListener(){}},HTMLImageElement:class{}};vm.runInNewContext(fs.readFileSync(path.join(root,'v2-photos.js'),'utf8'),ctx);assert.equal(ctx.window.RindelabPhotos.count,975);
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');assert(html.includes('3.921 de 8.394 fichas'));assert(html.includes('4.473 fichas sin foto'));assert(html.includes('historical-commons8'));
console.log('PASS batch7: 300 new searches, 60 licensed images, 177 additional records, 4473 pending');
