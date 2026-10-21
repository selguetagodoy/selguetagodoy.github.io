/* Inventario auditable de coincidencias nuevas de concesionaria (no homologaciones). */
'use strict';
const fs=require('node:fs'),path=require('node:path'),C=require('../rindelab/sii/catalog-identity.js');
const root=path.resolve(__dirname,'..');
const old=require('../rindelab/sii/commercial-2026.json');
const data=require('../rindelab/data/dealer-new-models-20261021.json');
const known=new Set(old.map(x=>C.key(x.brand,x.family)));
const unmatched=new Map();
for(const record of data.records){
 const k=C.key(record.brand,record.family);
 if(known.has(k))continue;
 if(!unmatched.has(k))unmatched.set(k,{brand:record.brand,family:record.family,entries:[]});
 unmatched.get(k).entries.push(record);
}
const rows=[...unmatched.values()].sort((a,b)=>(a.brand+' '+a.family).localeCompare(b.brand+' '+b.family,'es'));
const lines=[
 '# RINDELAB — ampliación documental de la oferta de vehículos nuevos (21/10/2026)',
 '',
 '## Alcance y metodología',
 '',
 'Se revisaron fichas públicas de dos redes chilenas de concesionarios. Se obtuvieron '+data.records.length+' publicaciones enlazadas: '+
 data.records.filter(x=>x.retailer==='Pompeyo Carrasco').length+' de Pompeyo y '+
 data.records.filter(x=>x.retailer==='Salazar Israel').length+' de Salazar Israel. '+
 data.records.filter(x=>x.listPriceClp).length+' publicaciones de Pompeyo indican expresamente «Precio lista». Los precios de Salazar muestran bonos y no se trasladan como precios de lista.',
 '',
 'El cruce por identidad normalizada marca/familia encontró '+rows.length+' **denominaciones sin correspondencia textual** con las 1.504 referencias comerciales almacenadas. Esto NO acredita '+rows.length+' modelos realmente distintos: hay nombres de acabado, tecnologías y generaciones que requieren conciliación manual. La web usa la nueva fuente sin alterar los registros existentes.',
 '',
 'Los enlaces siguientes permiten comprobar la procedencia de cada fila. «Sin precio lista» significa que la fuente no lo acredita bajo esa etiqueta; no significa gratis o precio cero.',
 '',
 '| N.º | Marca | Denominación del distribuidor | Red | Precio lista publicado | Tecnología declarada | Fuente |',
 '|---:|---|---|---|---:|---|---|'
];
for(const [i,g] of rows.entries()){
 const list=g.entries.find(x=>x.listPriceClp)||g.entries[0];
 const t=list.technology||'No informada';
 const price=list.listPriceClp?'$'+list.listPriceClp.toLocaleString('es-CL')+(list.taxIncluded===false?' + IVA':''):'Sin precio lista';
 const cell=v=>String(v??'').replace(/[|]/g,'/');
 lines.push('| '+(i+1)+' | '+cell(g.brand)+' | '+cell(g.family)+' | '+cell(g.entries.map(x=>x.retailer).join(' y '))+' | '+price+' | '+cell(t)+' | [Publicación]('+list.source+') |');
}
lines.push('','## Fotografías incorporadas','',
 'Se agregaron cinco fotografías con metadatos de Wikimedia Commons, licencia abierta verificada y atribución local: Subaru Trailseeker, BYD Sealion 7, Honda ZR-V, Audi Q5 Sportback y MG S5 EV. Ninguna se presenta como fotografía de la versión exacta comercial.',
 '','## Qué queda pendiente','',
 'Vincular generaciones y versiones equivalentes mediante documentación técnica, completar registros sin precio de lista, confirmar disponibilidad comercial, ampliar el inventario fotográfico con licencias y continuar la vigilancia incremental del 3CV. No inferir rendimientos a partir de nombres de modelo.');
const file=path.join(root,'rindelab/sii/AMPLIACION-OFERTA-CHILE-20261021.md');
const text=lines.join('\n')+'\n';
if(process.argv.includes('--check')){
 if(!fs.existsSync(file)||fs.readFileSync(file,'utf8')!==text)throw Error('Informe comercial obsoleto; regenerar con --write');
}else if(process.argv.includes('--write'))fs.writeFileSync(file,text);
console.log({reviewed:data.records.length,unmatchedFamilyLabels:rows.length,explicitListPrices:data.records.filter(x=>x.listPriceClp).length});
