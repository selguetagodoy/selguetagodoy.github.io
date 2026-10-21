import fs from 'node:fs';import vm from 'node:vm';
const sandbox={window:{},document:{addEventListener(){}},HTMLImageElement:class{}};
vm.runInNewContext(fs.readFileSync('rindelab/v2-photos.js','utf8'),sandbox);
const api=sandbox.window.RindelabPhotos,F={BRAND:0,MODEL:1,TECH:2,DATE:8};
const vehicles=Array.from({length:9},(_,i)=>JSON.parse(fs.readFileSync('vehiculos/data/vehiculos_0'+(i+1)+'.json','utf8'))).flat();
const prices=JSON.parse(fs.readFileSync('rindelab/sii/commercial-2026.json','utf8'));
const matched=vehicles.filter(x=>api.find(x,F)),matchedPrices=prices.filter(x=>api.findCommercial(x));
const summary={totalPhotos:api.count,total3CVRows:vehicles.length,photo3CVRows:matched.length,totalCommercialPrices:prices.length,photoCommercialPrices:matchedPrices.length,photoFamilies3CV:new Set(matched.map(x=>x[0]+'|'+x[1])).size,brandsWith3CVPhoto:new Set(matched.map(x=>x[0])).size,brandsWithPricePhoto:new Set(matchedPrices.map(x=>x.brand)).size};
console.log('PHOTO_COVERAGE '+JSON.stringify(summary));
