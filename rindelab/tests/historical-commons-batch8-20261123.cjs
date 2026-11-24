'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),s=require('../data/historical-photo-import-batch8-20261123.json'),a=require('../data/real-3cv-photo-coverage-20261123.json');
assert.equal(s.photos.length,57);assert.equal(s.errors.length,0);assert.equal(s.rejectedAfterVisualReview.length,18);
assert.equal(a.withPhoto,3921);assert.equal(a.withoutPhoto,4473);assert.equal(a.historicalCommonsBatch820261123.newlyCovered,148);
for(const p of s.photos){assert(p.author&&p.source&&p.licenseUrl&&p.sha256);assert(/^CC BY(?:-SA)? [234]\.0$|^CC0$/.test(p.license));const b=fs.readFileSync(path.resolve(root,p.localSrc));assert.equal(crypto.createHash('sha256').update(b).digest('hex'),p.sha256);assert.equal(b.length,p.bytes);}
const ctx={window:{},document:{addEventListener(){}},HTMLImageElement:class{}};vm.runInNewContext(fs.readFileSync(path.join(root,'v2-photos.js'),'utf8'),ctx);assert.equal(ctx.window.RindelabPhotos.count,975);
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');assert(html.includes('3.921 de 8.394 fichas'));assert(html.includes('4.473 fichas sin foto'));assert(html.includes('historical-commons8'));
console.log('PASS batch8: 57 licensed images, 148 additional records, 4473 pending');
