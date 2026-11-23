'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const C=require('../sii/catalog-identity.js');
const official=require('../sii/commercial-2026.json');
const first=require('../data/dealer-new-models-20261021.json');
const portillo=require('../data/dealer-portillo-20261021.json');
const gildemeister=require('../data/dealer-gildemeister-20261021.json');
const aliases=require('../data/commercial-family-aliases-20261021.json');
const elements=new Map();
function el(){
 return {hidden:false,value:'',textContent:'',innerHTML:'',style:{},
  addEventListener(){},setAttribute(){},append(){},prepend(){},replaceChildren(...children){this.children=children;},
  querySelector(){return null;},classList:{add(){},remove(){}},close(){},showModal(){}};
}
const document={
 getElementById(id){if(!elements.has(id))elements.set(id,el());return elements.get(id);},
 querySelectorAll(){return[];},createElement(){return el();}
};
const payloads=[
 {records:first.records},{records:portillo.records},{records:gildemeister.records},aliases
];
let n=0;
const window={
 RindelabIdentity:C,
 RindelabCommercial:{records:()=>official,ready:()=>Promise.resolve()},
 RindelabPhotos:{commercialNode:()=>null},
 dispatchEvent(){}
};
const context={window,document,location:{search:'',href:'https://selguetagodoy.github.io/rindelab/'},
 URLSearchParams,URL,Event:class Event{constructor(type){this.type=type;}},
 navigator:{},fetch:async()=>({ok:true,json:async()=>payloads[n++]||{records:[]}}),
 console,Promise};
vm.runInNewContext(fs.readFileSync(path.join(root,'market-catalog.js'),'utf8'),context,{filename:'market-catalog.js'});
(async()=>{
 await new Promise(resolve=>setTimeout(resolve,50));
 const criteria={scope:'commercial',brand:'BYD',model:'Yuan Pro DM-i',q:'',tech:''};
 const count=window.RindelabMarket.render(criteria,[]);
 assert.equal(count,1,'The official PHEV reference and unspecified-tech BYD dealer entry must render only ONE card');
 const card=elements.get('commercialResultList').children[0];
 assert(card.innerHTML.includes('BYD Yuan Pro DM-i'),'Official family card retained');
 assert(!card.innerHTML.includes('Publicado como vehículo nuevo por concesionaria'),'Unclassified dealer not shown as a second card');
 const dealer=window.RindelabMarket.records().filter(x=>C.key(x.brand,x.family)===C.key('BYD','Yuan Pro DM-i'));
 assert(dealer.length>=1,'Source dealer observation retained for audit');
 assert(dealer.some(x=>!x.technology),'No unverified motorization inferred');
 console.log('PASS BYD duplicate prevention: 1 commercial card, retailer observation preserved, no motorization inference');
})().catch(e=>{console.error(e);process.exitCode=1;});
