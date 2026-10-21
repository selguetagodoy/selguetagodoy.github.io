/* Informe de brechas normalizadas después de cuatro redes; no identifica modelos únicos. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),C=require('../rindelab/sii/catalog-identity.js'),root=path.resolve(__dirname,'..');
const files=['dealer-new-models-20261021.json','dealer-portillo-20261021.json','dealer-gildemeister-20261021.json'];
const d=files.map(x=>require('../rindelab/data/'+x));
const aliases=require('../rindelab/data/commercial-family-aliases-20261021.json');
const aliasMap=new Map(aliases.aliases.map(a=>[a.sourceKey,a.canonicalKey]));
const commercial=require('../rindelab/sii/commercial-2026.json').filter(C.active);
const existing=new Set(commercial.map(x=>C.key(x.brand,x.family)));
const sourceRows=d.flatMap(x=>x.records);
const key=x=>aliasMap.get(C.key(x.brand,x.family))||C.key(x.brand,x.family);
const originalUnmatched=new Set(sourceRows.filter(x=>!existing.has(C.key(x.brand,x.family))).map(x=>C.key(x.brand,x.family)));
const matchedByAlias=new Set(sourceRows.filter(x=>aliasMap.has(C.key(x.brand,x.family))).map(x=>C.key(x.brand,x.family)));
const pending=new Map();
for(const p of sourceRows){
 const orig=C.key(p.brand,p.family),resolved=key(p);
 if(existing.has(resolved))continue;
 if(!pending.has(resolved))pending.set(resolved,{brand:p.brand,family:p.family,retailers:new Set(),links:[]});
 const group=pending.get(resolved);
 group.retailers.add(p.retailer);
 if(!group.links.includes(p.source))group.links.push(p.source);
}
const unresolved=[...pending.entries()].sort((a,b)=>a[0].localeCompare(b[0],'es'));
const stats={
 oldCommercialRows:commercial.length,
 sourceListingRows:sourceRows.length,
 networks:Object.fromEntries([...new Set(sourceRows.map(x=>x.retailer))].map(name=>[name,sourceRows.filter(x=>x.retailer===name).length])),
 commercialFamilies:[...existing].length,
 rawDealerNamesNotInOld:originalUnmatched.size,
 approvedFamilyAliases:aliases.aliases.length,
 aliasesObserved:matchedByAlias.size,
 unresolvedFamilyLabels:unresolved.length,
 postReconciliationObservedFamilies:new Set(sourceRows.map(key)).size,
 caveat:'One family may cover multiple commercial generations/technologies. No automatic version or 3CV matching.'
};
const lines=[
 '# RINDELAB — Conciliación comercial de cuatro redes (21/10/2026)','',
 '## Alcance','',
 'Observaciones de publicaciones 0 km en Pompeyo, Salazar Israel, Portillo y Gildemeister Retail. Las fichas no acreditan inventario actual ni equivalencia de versiones. Se mantiene intacta la base energética homologada.',
 '',
 '**Observaciones por URL:** '+sourceRows.length+'. **Alias de familia revisados:** '+aliases.aliases.length+'. **Alias observados en publicaciones:** '+matchedByAlias.size+'. **Nombres comerciales que aún no coinciden con una familia del catálogo base:** '+unresolved.length+'.',
 '',
 'Una denominación no conciliada puede ser un modelo genuinamente faltante, una versión, una nueva generación o una grafía alternativa; no se interpreta automáticamente como modelo único nuevo.',
 '',
 '## Equivalencias comerciales controladas','',
 '| Marca | Denominación en red de venta | Familia comercial de referencia | Alcance |','|---|---|---|---|',
 ...aliases.aliases.map(a=>'| '+a.brand+' | '+a.sourceFamily+' | '+a.canonicalFamily+' | Familia, no versión, año ni tecnología |'),
 '',
 '## Denominaciones restantes con fuente','',
 '| N.º | Marca | Denominación | Redes | Evidencia original |',
 '|---:|---|---|---|---|'
];
unresolved.forEach(([key,x],i)=>lines.push('| '+(i+1)+' | '+x.brand.replace(/[|]/g,'/')+' | '+x.family.replace(/[|]/g,'/')+' | '+[...x.retailers].join(' y ')+' | '+x.links.slice(0,2).map((u,j)=>'[Fuente '+(j+1)+']('+u+')').join(' · ')+' |'));
lines.push('','## Reglas de calidad','',
 '- Conservar «All New» cuando designa una generación distinta; no fundir Corolla Cross con Corolla, ZS EV con ZS híbrido ni vehículos REEV y EV.',
 '- «Híbrido» genérico en una concesionaria no acredita HEV: conservar tecnología nula cuando el fabricante no indique el tren motriz.',
 '- No trasladar precios «Desde» con bonos ni resultados de promociones al campo de precio de lista.',
 '- Fotografías Commons son referenciales por familia/generación, siempre con autor y licencia.')
const report=path.join(root,'rindelab/sii/CONCILIACION-REDES-COMERCIALES-20261021.md'),content=lines.join('\n')+'\n';
if(process.argv.includes('--check')){
 if(fs.readFileSync(report,'utf8')!==content)throw Error('Report stale, regenerate');
}else fs.writeFileSync(report,content);
console.log(JSON.stringify(stats,null,2));
