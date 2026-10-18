/* Auditoría reproducible del cruce de códigos de la nómina MTT vs 3CV de mayo.
 * La presencia de código no aporta rendimiento comparable ni vigencia de comercialización. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const base=path.resolve(__dirname,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(base,p),'utf8'));
const manifest=read('vehiculos/data/manifest.json');
const index=read('rindelab/sii/mtt-sept-2026-code-index.json');
const audit=read('rindelab/sii/mtt-sept-2026-may-2026-cross.json');
const norm=s=>String(s??'').trim();
const hash=codes=>crypto.createHash('sha256').update([...new Set(codes)].sort().join('\n')+'\n').digest('hex');
assert.equal(index.schemaVersion,1);
assert.equal(audit.schemaVersion,1);
assert.equal(index.codes.length,8045);
assert.equal(new Set(index.codes).size,index.codes.length);
assert.equal(hash(index.codes),index.codeSetSHA256);
assert.equal(audit.source.codeSetSHA256,index.codeSetSHA256);
assert.equal(audit.source.uploadedOriginalSHA256,index.sourceSha256);
assert.equal(audit.source.mayCut,manifest.published);
assert.equal(index.codeSetSHA256,'6411ec4b6c6ee7f9b7aabc8fbf66f5e7bd3becf1b2202fe169dd180e9de5082e');
assert.equal(audit.source.recentCodesSHA256,'45ff31e431e7729e3393ddc24396ae0e07c97fb3656de32396898ae0277bf5aa');
const may=manifest.files.flatMap(p=>read('vehiculos/'+p)).filter(r=>r&&r[0]&&r[1]&&r[8]&&r[8]<=manifest.published);
const mayByCode=new Map();
for(const row of may){const c=norm(row[9]);if(!c)throw Error('Código de rendimiento vacío');if(mayByCode.has(c))throw Error('Código 3CV de mayo duplicado: '+c);mayByCode.set(c,row);}
const mttSet=new Set(index.codes),maySet=new Set(mayByCode.keys());
const common=[...mttSet].filter(x=>maySet.has(x)),mttOnly=[...mttSet].filter(x=>!maySet.has(x)),mayOnly=[...maySet].filter(x=>!mttSet.has(x));
const c=audit.counts;
assert.equal(c.mayRows,may.length);
assert.equal(c.mayUniqueCodes,maySet.size);
assert.equal(c.mttUniqueCodes,mttSet.size);
assert.equal(c.codesInBoth,common.length);
assert.equal(c.mttCodesNotInMay,mttOnly.length);
assert.equal(c.mayCodesNotInMtt,mayOnly.length);
assert.equal(c.codesInBoth+c.mttCodesNotInMay,c.mttUniqueCodes);
assert.equal(c.codesInBoth+c.mayCodesNotInMtt,c.mayUniqueCodes);
assert.deepEqual(audit.mayOnlyCodes.slice().sort(),mayOnly.sort());
assert.equal(c.mttRows,8093);
assert.equal(c.mttDuplicateCodes,39);
assert.equal(audit.recentRecords.length,230);
const afterMayCodes=audit.recentRecords.map(x=>x.code);
assert.equal(new Set(afterMayCodes).size,230);
assert.equal(hash(afterMayCodes),audit.source.recentCodesSHA256);
assert(audit.recentRecords.every(x=>x.code&&mttSet.has(x.code)&&x.date>manifest.published&&x.date<='2026-09-28'&&x.brand&&x.model&&x.certificate));
assert(audit.recentRecords.every(x=>x.inMaySource===maySet.has(x.code)));
const recentNew=audit.recentRecords.filter(x=>!x.inMaySource);
const recentlyPresent=audit.recentRecords.filter(x=>x.inMaySource);
assert.equal(recentNew.length,229);
assert.equal(recentlyPresent.length,1);
assert.equal(recentlyPresent[0].code,'SB6195E60815S00-0');
assert.equal(recentNew.length,c.afterMayNewCodes);
assert.equal(recentlyPresent.length,c.afterMayAlreadyInMay);
assert.equal(c.afterMayRows,audit.recentRecords.length);
const historical=audit.historicMissingRecords;
const datedHistorical=historical.filter(x=>x.date&&x.date<=manifest.published);
const undated=historical.filter(x=>!x.date);
const datedCodes=new Set(datedHistorical.map(x=>x.code));
const undatedCodes=new Set(undated.map(x=>x.code));
assert.equal(historical.length,373);
assert.equal(datedHistorical.length,c.olderMttRowsNotInMay);
assert.equal(undated.length,c.undatedMttRowsNotInMay);
assert.equal(datedCodes.size,c.olderMttUniqueCodesNotInMay);
assert.equal(undatedCodes.size,c.undatedMttUniqueCodesNotInMay);
assert.equal(datedHistorical.length,372);
assert.equal(datedCodes.size,324);
assert.equal(undated.length,1);
assert.equal(undatedCodes.size,1);
assert.equal(undated[0].code,'EX10292E60925S00-K');
assert.deepEqual(audit.missingDateRecords,undated);
assert(historical.every(x=>mttSet.has(x.code)&&!maySet.has(x.code)));
assert(datedHistorical.every(x=>x.date&&x.date<=manifest.published));
assert([...datedCodes].every(x=>!undatedCodes.has(x)));
assert.equal(datedCodes.size+undatedCodes.size+recentNew.length,mttOnly.length);
assert.equal(c.mttOnlyCodesTotalReconciled,mttOnly.length);
assert(c.mttRows>=mttSet.size);
const diff=audit.matchedCodeTechnicalDifferences;
assert.equal(diff.length,c.matchedCodeTransmissionOrEngineConflicts);
assert.equal(diff.length,12);
for(const x of diff){
 assert(maySet.has(x.code)&&mttSet.has(x.code));
 const row=mayByCode.get(x.code);
 const transmission=x.mtt.transmission!==row[6];
 const engine=Math.abs(Number(x.mtt.engineL)-Number(String(row[7]).replace(',','.')))>0.02;
 assert.equal(x.kind,[transmission?'transmission':'',engine?'engine':''].filter(Boolean).join('+'),'La evidencia no describe el conflicto real para '+x.code);
 assert.equal(x.may.model,row[1]);assert.equal(x.may.transmission,row[6]);
}
assert(diff.some(x=>x.code==='JM10011E60525M00-7'&&x.kind==='transmission'));
assert(diff.some(x=>x.code==='MB6988E60517M00-3'&&x.kind==='engine'));
assert(!recentNew.some(x=>maySet.has(x.code)));
const grouped={};
for(const x of audit.recentRecords)grouped[x.brand]=(grouped[x.brand]||0)+1;
assert.deepEqual(grouped,audit.brandAfterMay);
const status={recordsSeptember:c.mttRows,uniqueSeptember:c.mttUniqueCodes,recordsMay:c.mayRows,
 codesShared:c.codesInBoth,onlySeptember:c.mttCodesNotInMay,onlyMay:c.mayCodesNotInMtt,
 homologatedAfterMay:c.afterMayRows,notInMaySource:c.afterMayNewCodes,alreadyInMay:c.afterMayAlreadyInMay,
 datedBeforeOrAtMay:c.olderMttUniqueCodesNotInMay,withoutHomologationDate:c.undatedMttUniqueCodesNotInMay,
 transmissionsOrEnginesToReview:c.matchedCodeTransmissionOrEngineConflicts,imputedConsumptionValues:0};
console.log('RINDELAB MTT COMPLETO '+JSON.stringify(status));
const dest=process.argv.find(x=>x.startsWith('--json='));
if(dest){const output=path.resolve(dest.slice('--json='.length));fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify({schemaVersion:1,source:audit.source,results:status},null,2)+'\n');}
if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,
 '## Nómina MTT septiembre vs 3CV mayo\n\n- **229 códigos posteriores a mayo ausentes de la base de rendimientos**; 1 posterior ya figuraba.\n'+
 '- 7.491 códigos compartidos; 554 exclusivos de MTT: 229 posteriores a mayo, 324 hasta mayo y 1 sin fecha.\n'+
 '- Otros 562 códigos aparecen solo en la base de rendimiento de mayo.\n'+
 '- 12 diferencias de transmisión/cilindrada, para revisión, sin alterar datos.\n'+
 '- **0 rendimientos imputados.** Se mantienen cortes y fines distintos.\n');
