/* RINDELAB · Consolidar solo rangos comerciales verificables de fuentes públicas. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
// The verified batches are consolidated into a version-controlled, auditable input.
// Temporary extraction files from the collection session are not required in CI.
const source=require('../rindelab/sii/data/used-autofact-additions-20261021.json');
const records=source.records,failed=source.candidatesWithoutUsableRange;
assert.equal(records.length,80);
const byUrl=new Set();
for(const r of records){
 assert.equal(r.source,'Autofact');
 assert.equal(r.scope,'approximate-published-range');
 assert.equal(r.observedAt,'2026-10-21');
 assert(Number.isSafeInteger(r.lowClp)&&Number.isSafeInteger(r.highClp)&&r.lowClp>=1000000&&r.lowClp<=r.highClp);
 assert(/^https:\/\/www\.autofact\.cl\/valor-comercial-autos\//.test(r.sourceUrl));
 assert(!byUrl.has(r.sourceUrl),'Duplicated source URL '+r.sourceUrl);byUrl.add(r.sourceUrl);
 assert(r.sourceUrl.endsWith('/'+r.brandSlug+'/'+r.modelSlug+'/'+r.year));
}
const report={
 schemaVersion:1,cutoff:'2026-10-21',
 methodology:'Autofact approximate min/max ranges, not transactions, not medians, not equivalent to SII, not necessarily identical trim.',
 records:records.sort((a,b)=>(a.brandSlug+a.modelSlug+a.year).localeCompare(b.brandSlug+b.modelSlug+b.year,'es')),
 candidatesWithoutUsableRange:failed
};
const manifest=path.join(root,'rindelab/sii/data/used-autofact-additions-20261021.json');
const content=JSON.stringify(report,null,2)+'\n';
if(process.argv.includes('--check'))assert.equal(fs.readFileSync(manifest,'utf8').replace(/\r\n/g,'\n'),content);
else fs.writeFileSync(manifest,content);
const base=require('../rindelab/sii/data/used-market-20261021.json');
const addedIds=new Set(records.map(p=>p.source+'|'+p.brandSlug+'|'+p.modelSlug+'|'+p.year));
const original=base.records.filter(p=>!addedIds.has(p.source+'|'+p.brandSlug+'|'+p.modelSlug+'|'+p.year));
const all=[...original,...records];
const unique=new Set();
for(const p of all){
 const key=p.source+'|'+p.brandSlug+'|'+p.modelSlug+'|'+p.year;
 assert(!unique.has(key),'Duplicate price observation '+key);
 unique.add(key);
}
assert.equal(original.length,26);
const expanded={...base,notes:'AutoExplora: observed median/p10-p90 on 5+ sale listings; Autofact: approximate provider low/high range with undisclosed sample. These are NOT tax valuations or transaction prices, and do not define exact trim/generation. No year or depreciation interpolation.',records:all.sort((a,b)=>a.brandSlug.localeCompare(b.brandSlug,'es')||a.modelSlug.localeCompare(b.modelSlug,'es')||b.year-a.year||a.source.localeCompare(b.source))};
const final=path.join(root,'rindelab/sii/data/used-market-20261021.json');
const newText=JSON.stringify(expanded,null,2)+'\n';
if(process.argv.includes('--check'))assert.equal(fs.readFileSync(final,'utf8').replace(/\r\n/g,'\n'),newText);
else fs.writeFileSync(final,newText);
console.log(JSON.stringify({original:base.records.length,added:records.length,total:all.length,bySources:Object.fromEntries([...new Set(all.map(x=>x.source))].map(s=>[s,all.filter(x=>x.source===s).length])),failedCandidates:failed.length},null,2));
