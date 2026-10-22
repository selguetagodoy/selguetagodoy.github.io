/* Regresión autónoma del catálogo: node rindelab/tests/catalog-identity.cjs */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const C=require('../sii/catalog-identity.js');
const root=path.join(__dirname,'..');
const records=JSON.parse(fs.readFileSync(path.join(root,'sii','commercial-2026.json'),'utf8'));
const idx=C.index(records),today='2026-10-21';
assert.equal(C.key('Peugeot','new 2008'),C.key('Peugeot','2008'));
assert.equal(C.key('Chery','cl-tiggo-2-pro'),C.key('Chery','Tiggo 2 Pro'));
assert.notEqual(C.key('Toyota','Corolla Cross'),C.key('Toyota','Corolla'));
assert.notEqual(C.key('Subaru','All New Forester'),C.key('Subaru','Forester'));
assert.notEqual(C.key('Chery','Tiggo 2 Pro Max'),C.key('Chery','Tiggo 2 Pro'));
const examples=[
 {brand:'Hyundai',model:'Kona',tech:'EV',minTech:'EV'},
 {brand:'Hyundai',model:'Kona',tech:'HEV',minTech:'HEV'},
 {brand:'Leapmotor',model:'B10',tech:'REEV',minTech:'REEV'},
 {brand:'Leapmotor',model:'B10',tech:'EV',minTech:'EV'},
 {brand:'Lexus',model:'NX',tech:'PHEV',minTech:'PHEV'}
];
for(const x of examples){
 const selected=C.priceReference(idx,[x.brand,x.model,x.tech],x.model,today);
 assert(selected,'Sin precio de prueba: '+JSON.stringify(x));
 assert.equal(selected.technology,x.minTech,'Precio de tecnología ajena: '+JSON.stringify(x));
}
// Regresion: el Opel Mokka Electric homologado no puede heredar precios gasolina.
const mokkaEV=['Opel','New Mokka Electric GS','EV'];
const mokkaGas=['Opel','Mokka GS Gasolina','Bencina'];
assert.equal(C.priceReference(idx,mokkaEV,'Mokka',today),null,
 'Mokka Electric con precio ajeno al tipo de motorizacion');
assert.equal(C.priceReference(idx,mokkaGas,'Mokka',today)?.priceListClp,22890000,
 'El Mokka a gasolina debe conservar su referencia comercial');
assert.equal(C.compatible(mokkaEV,{version:'Mokka Elegance Gasolina 130HP AT'}),false);
assert.equal(C.compatible(mokkaEV,{version:'Precio desde sin especificacion'}),false,
 'Motorizacion no informada no acredita precio exacto');
assert.equal(C.techKnown({version:'Mokka Elegance Gasolina 130HP AT'}),'Bencina');
const expired=records.filter(r=>C.expired(r,today));
assert(expired.length>=200,'No se detectaron campañas comerciales documentadas como vencidas');
const photoScript=fs.readFileSync(path.join(root,'v2-photos.js'),'utf8');
const photoPaths=[...photoScript.matchAll(/"localSrc": "\.\/images\/commons\/([^"]+)"/g)].map(x=>x[1]);
assert(photoPaths.length>=190,'Biblioteca de Commons incompleta');
for(const name of photoPaths)assert(fs.existsSync(path.join(root,'images','commons',name)),'Falta fotografía: '+name);
const demo={brand:'MarcaTest',family:'Prueba',version:'EV',priceListClp:20000000,currency:'CLP',source:'https://test.cl',technology:'EV',sourceOfferEnd:'2026-10-01'};
const mock=C.index([{...demo},{...demo,version:'mas caro',sourceOfferEnd:'2026-11-15',priceListClp:21000000}]);
const preferred=C.priceReference(mock,['MarcaTest','Prueba','EV'],'Prueba',today);
assert.equal(preferred.priceListClp,21000000,'La referencia vencida no debe reemplazar una no vencida');
console.log('OK catálogo:',records.length,'registros;',expired.length,'referencias con campaña vencida;',photoPaths.length,'fotografías Commons verificadas');
