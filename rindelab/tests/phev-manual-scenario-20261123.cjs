'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const js=fs.readFileSync(path.join(root,'v6.js'),'utf8');
const start=js.indexOf('function plugInCostPer100('),end=js.indexOf('function plugInProfile(',start);
assert(start>0&&end>start,'Pure manual PHEV calculator function should exist');
const f=vm.runInNewContext('('+js.slice(start,end).trim()+')');
let x=f(60,6,10,200,1535);
assert(x&&Number.isFinite(x.total));
assert.equal(x.electric,2000);
assert.equal(x.combustion,6140);
assert.equal(x.total,8140);
assert.equal(x.total*15000/100,1221000);
assert(Math.abs(f(100,6,null,200,null).total-3333.333333333333)<.001);
assert.equal(f(0,null,10,null,1535).total,15350);
for(const args of [[-1,6,10,200,1535],[101,6,10,200,1535],[60,0,10,200,1535],[60,6,null,200,1535],[60,6,10,null,1535],[60,6,10,200,0]]){
 assert.equal(f(...args),null,'Must not estimate with invalid assumptions '+JSON.stringify(args));
}
assert(js.includes('No uses aquí el valor ponderado 3CV'),'Should warn against using weighted PHEV performance for combustion-only rate');
assert(js.includes('Año de modelo/fabricación acreditado en esta ficha 3CV'),'Homologation date must be distinct from model year');
assert(js.includes('carga pública consultada 18/10/2026'),'Public charging price reference date must be visible');
assert(fs.readFileSync(path.join(root,'index.html'),'utf8').includes('v6.js?v=20261123-phev-scenario'));
console.log('PASS PHEV/REEV manual simulator: 60% 6km/kWh 10km/L = $8.140/100km and $1.221.000/year; invalid inputs rejected; source assumptions explicit');
