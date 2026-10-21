/* Conciliación conservadora de nombres comerciales: familia, jamás versión homologada. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),C=require('../rindelab/sii/catalog-identity.js');
const dir=path.resolve(__dirname,'..'),old=require('../rindelab/sii/commercial-2026.json');
const whitelist=[
['BYD','Atto 8 Dm','Atto 8'],['BYD','Sealion 7 Ev','Sealion 7'],
['Chery','Tiggo 4 Pro Max Hibrido','TIGGO 4 PRO MAX'],['Chery','Tiggo 7 Pro Max Hibrido','tiggo 7 pro max hybrid'],
['DFSK','E5 Plus Phev','E5 Plus'],['DFSK','SUV E5 PLUS','E5 Plus'],
['Ford','Maverick Fhev','Maverick'],['Ford','Territory Fhev','Territory'],
['Geely','Ex5 Emi-i','EX5-EMi'],['Honda','Zr-v Hybrid','ZR-V'],
['Honda','Cr-v Advanced Hybrid','CR-V'],['Kia','Carnival Hev','Carnival'],
['Kia','CARNIVAL HÍBRIDO','Carnival'],['Kia','Sorento Hev','Sorento'],
['Kia','SORENTO HÍBRIDO','Sorento'],['Kia','Sportage Hev','Sportage'],
['Kia','NUEVO SPORTAGE HÍBRIDO','Sportage'],['Kia','TASMAN','All New TASMAN'],
['MG','NEW MG3 HYBRID+','MG3'],['MG','NEW MG HS HYBRID+','HS Hybrid'],
['MG','MG S5 EV','S5'],['MG','Mg S5 Electrico','S5'],
['Mitsubishi','L200 Dakar','L200'],['Subaru','CROSSTREK HÍBRIDO','Crosstrek'],
['Subaru','Crosstrek Hybrid','Crosstrek'],['Subaru','WRX SEDAN','WRX'],
['Land Rover','Evoque','Range Rover Evoque'],['RAM','2500','ram2500'],
['Landking','Lk5 Ev','LK5']
];
const byBrandFamily=new Set(old.map(p=>C.key(p.brand,p.family)));
const data={schemaVersion:1,checkedAt:'2026-10-21',scope:'family-only; versions, technical generation, engines and homologation are never inferred',aliases:[],pending:[]};
for(const [brand,sourceFamily,canonicalFamily] of whitelist){
 const sourceKey=C.key(brand,sourceFamily),canonicalKey=C.key(brand,canonicalFamily);
 const item={brand,sourceFamily,canonicalFamily,sourceKey,canonicalKey,level:'same-commercial-family-only'};
 if(sourceKey===canonicalKey){data.pending.push({...item,reason:'already-normalized'});continue;}
 if(!byBrandFamily.has(canonicalKey)){data.pending.push({...item,reason:'unconfirmed-canonical-family'});continue;}
 data.aliases.push(item);
}
const keys=data.aliases.map(x=>x.sourceKey);
if(new Set(keys).size!==keys.length)throw Error('Duplicated alias source');
const out=path.join(dir,'rindelab/data/commercial-family-aliases-20261021.json');
if(process.argv.includes('--check')){
 const oldText=fs.readFileSync(out,'utf8');if(oldText!==JSON.stringify(data,null,2)+'\n')throw Error('Alias table changed; regenerate');
}else fs.writeFileSync(out,JSON.stringify(data,null,2)+'\n');
console.log('APPROVED FAMILY ALIASES',data.aliases.length,'REQUIRE REVIEW',data.pending.length);
console.log('PENDING',data.pending.map(x=>x.sourceKey+' => '+x.canonicalKey));
