/* Cola reproducible: primero ficha chilena del modelo; después licencia de foto.
   Las URLs comerciales sirven para identificación, NO dan permiso de copiar fotos.
 */
'use strict';
const fs=require('node:fs'),path=require('node:path');
const C=require('../rindelab/sii/catalog-identity.js');
const root=path.resolve(__dirname,'..');
const coverage=require('../rindelab/data/catalog-coverage-20261021.json');
const commercials=require('../rindelab/sii/commercial-2026.json').filter(C.active);
const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'');
const groups=new Map();
for(const row of commercials){
 const key=C.key(row.brand,row.family);
 if(!groups.has(key))groups.set(key,[]);
 groups.get(key).push(row);
}
const domainType=(domain)=>{
 if(/autocosmos/.test(domain))return 'catalogo_editorial';
 if(/(portillo|rosselot|auto\.cl|gildemeister|callegari|cartoni|astara|guillermo|kaufmann)/.test(domain))return 'concesionaria_chile';
 return 'fabricante_o_importador';
};
const output=coverage.allGroups.filter(x=>!x.photo).map(g=>{
 const relevant=groups.get(C.key(g.brand,g.family))||[];
 const urls=[g.source,...relevant.map(x=>x.source)].filter(x=>{try{return new URL(x).protocol==='https:'}catch{return false}});
 const sources=[...new Set(urls)].map(url=>{
  const domain=new URL(url).hostname.replace(/^www\./,'');
  const pathname=decodeURIComponent(new URL(url).pathname);
  const normalizedName=normalize(g.family),normalizedPath=normalize(pathname);
  const specific=normalizedName.length>2 && normalizedPath.includes(normalizedName);
  return {url,domain,kind:domainType(domain),specificity:specific?'nombre_en_ruta':'verificar_en_pagina',use:'identificacion_de_modelo',photoReuse:'sin_permiso_acreditado'};
 }).sort((a,b)=>Number(b.specificity==='nombre_en_ruta')-Number(a.specificity==='nombre_en_ruta'));
 const query=[g.brand,g.family].filter(Boolean).join(' ');
 return {key:g.key,brand:g.brand,family:g.family,technology:g.technology||null,versions:g.versions,
   referenceYear:relevant.filter(x=>x.modelYear).map(x=>x.modelYear).sort((a,b)=>b-a)[0]||null,
   evidenceDate:g.checkedAt,sourceCount:sources.length,sources,
   search:{autocosmos:'https://www.google.com/search?q='+encodeURIComponent('site:autocosmos.cl/catalogo '+query),
      chile:'https://www.google.com/search?q='+encodeURIComponent(query+' Chile fabricante concesionaria fotos'),
      openverse:'https://openverse.org/search/image?q='+encodeURIComponent(query)},
   status:'busqueda_fotografica_pendiente',licenseStatus:'no_verificada',
   caution:g.technology===null?'Tecnologia no documentada; no asignar foto de motorizacion incompatible':'No confundir modelo ni generacion'};
}).sort((a,b)=>b.versions-a.versions||a.brand.localeCompare(b.brand,'es'));
const stats={date:'2026-10-22',missingGroups:output.length,withDirectChileanSource:output.filter(x=>x.sources.length).length,
  uniqueDirectSources:new Set(output.flatMap(x=>x.sources.map(s=>s.url))).size,
  photoRightsCleared:0,byDomain:{}};
for(const g of output){const key=g.sources[0]?.domain||'sin_fuente';
 stats.byDomain[key]=(stats.byDomain[key]||0)+1;}
const result={schemaVersion:1,notes:'Sources are commercial identification references only, not free photos, licensed images or evidence of current stock.',stats,groups:output};
const filename=path.join(root,'rindelab/data/photo-source-priority-20261022.json');
fs.writeFileSync(filename,JSON.stringify(result,null,2)+'\n');
const top=Object.entries(stats.byDomain).sort((a,b)=>b[1]-a[1]).slice(0,15);
const text=['# RINDELAB — Matriz de investigación fotográfica orientada al mercado chileno','','**Corte 22/10/2026.** Se utiliza la misma agrupación que el catálogo comercial y se conservan los permisos fotográficos separados de la identificación.','',`- Grupos pendientes: **${stats.missingGroups}**.`,`- Con al menos una URL de referencia comercial: **${stats.withDirectChileanSource}**.`,`- URLs directas distintas de las fichas existentes: **${stats.uniqueDirectSources}**.`,'- **0 imágenes aprobadas por estos enlaces:** la ficha comercial no confiere licencia de reproducción.','','## Procedencia de la fuente principal','','| Dominio registrado | Grupos sin fotografía |','|---|---:|',...top.map(([h,n])=>`| ${h} | ${n} |`),'','## Protocolo obligatorio','','1. Identificar vehículo vigente en Chile con la URL ya archivada del fabricante, importador o concesionario; registrar generación, carrocería, tecnología y año.','2. Corroborar la identificación en una segunda fuente chilena independiente cuando existan denominaciones ambiguas o inconsistentes.','3. Buscar fotografía libre reutilizable en Openverse, Flickr con licencia comercial, Wikimedia u otro repositorio autorizado, o gestionar autorización directa con el titular del material oficial.','4. Validar visualmente exterior, modelo y generación, almacenar archivo optimizado local con origen, autor, licencia, dimensiones y SHA-256.','5. Recalcular la cobertura solo después de integrar la fotografía aprobada y pasar QA en móvil y escritorio.','','**Caso que requiere cautela:** la página chilena de MINI Cooper lista versiones llamadas E y SE, pero también muestra campos de combustible bencina en varias fichas. Se requieren atributos técnicos independientes antes de asignar una fotografía específica a EV.','',`La cola completa de ${output.length} grupos está en \`rindelab/data/photo-source-priority-20261022.json\`.`];
fs.writeFileSync(path.join(root,'rindelab/sii/FUENTES-FOTOGRAFICAS-CHILE-20261022.md'),text.join('\n')+'\n');
if(output.length!==coverage.summary.withoutFamilyPhoto)throw Error('La cola no coincide con las brechas');
if(output.some(x=>!x.sources.length))throw Error('Hay grupos sin fuente comercial en catálogo');
if(output.some(x=>x.sources.some(s=>s.photoReuse!=='sin_permiso_acreditado')))throw Error('Licencia inventada');
console.log(JSON.stringify({missing:stats.missingGroups,withSources:stats.withDirectChileanSource,uniqueUrls:stats.uniqueDirectSources,byDomain:top.slice(0,9)},null,2));
