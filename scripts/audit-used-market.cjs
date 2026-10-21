/* Valida observaciones del mercado usado y documenta cobertura de retiros en Chile.
 * Sin inferencias de precios, sin mezclar generaciones o fuentes.
 */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const base=path.resolve(__dirname,'..');
const data=require('../rindelab/sii/data/used-market-20261021.json');
const history=require('../rindelab/sii/model-lifecycle-2026.json');
assert.equal(data.schemaVersion,1);
assert.equal(data.observedAt,'2026-10-21');
assert(Array.isArray(data.records)&&data.records.length>=100,'El inventario comprobado debe superar 100 referencias');
assert.equal(history.schemaVersion,1);
const norm=x=>String(x??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/&/g,' y ').replace(/[^a-z0-9]+/g,' ').trim();
const key=(b,m)=>norm(b)+'|'+norm(m);
const seen=new Set(),families=new Set(),bySource={};
for(const p of data.records){
 assert(['Autofact','AutoExplora'].includes(p.source),'Fuente no autorizada');
 assert.equal(p.observedAt,data.observedAt,'Fecha de auditoría incongruente');
 assert(Number.isInteger(p.year)&&p.year>=1990&&p.year<=2026,'Año inválido');
 assert(p.brandSlug&&p.modelSlug&&p.sourceUrl,'Identificador o URL vacío');
 const url=new URL(p.sourceUrl);
 assert.equal(url.protocol,'https:','Fuente no HTTPS');
 assert.equal(url.hostname,p.source==='Autofact'?'www.autofact.cl':'www.autoexplora.cl','Fuente ajena al proveedor');
 assert.equal(url.pathname,'/'+(p.source==='Autofact'?'valor-comercial-autos':'precios')+'/'+p.brandSlug+'/'+p.modelSlug+'/'+p.year,'La URL no respalda el mismo modelo/año');
 const pk=p.source+'|'+p.brandSlug+'|'+p.modelSlug+'|'+p.year;
 assert(!seen.has(pk),'Registro duplicado: '+pk);seen.add(pk);
 families.add(key(p.brandSlug,p.modelSlug));
 bySource[p.source]=(bySource[p.source]||0)+1;
 if(p.source==='Autofact'){
  assert.equal(p.scope,'approximate-published-range');
  assert(Number.isSafeInteger(p.lowClp)&&Number.isSafeInteger(p.highClp)&&p.lowClp>500000&&p.highClp>=p.lowClp,'Rango incorrecto');
  assert(!('medianClp' in p),'Autofact no acredita mediana');
 }else{
  assert(Number.isSafeInteger(p.medianClp)&&p.medianClp>500000,'Mediana no documentada');
  assert(Number.isInteger(p.sampleSize)&&p.sampleSize>=5,'Muestra insuficiente');
  assert(Number.isSafeInteger(p.p10Clp)&&Number.isSafeInteger(p.p90Clp)&&p.p10Clp<=p.medianClp&&p.medianClp<=p.p90Clp,'Rango p10–p90 inconsistente');
 }
}
assert(bySource.Autofact>=80&&bySource.AutoExplora>=20,'Falta integración de ambas fuentes');
const retired=history.models.filter(x=>['discontinued-cl','previous-generation-cl'].includes(x.status));
const whole=retired.filter(x=>x.match==='whole-family');
const covered=whole.filter(x=>families.has(key(x.brand,x.model)));
const unavailable=whole.filter(x=>!families.has(key(x.brand,x.model)));
const stats={
 date:data.observedAt,totalObservations:data.records.length,
 totalModelFamilies:families.size,
 retiredStatuses:retired.length,
 wholeFamilyRetirements:whole.length,
 wholeFamilyWithObservedValue:covered.length,
 wholeFamilyWithoutObservedValue:unavailable.length,
 sourceCounts:bySource
};
const lines=[
 '# RINDELAB — Control de valores comerciales de autos usados',
 '',
 'Fecha de corte documental: **21 de octubre de 2026**. Precios expresados en pesos chilenos.',
 '',
 '| Indicador | Resultado |','|---|---:|',
 ...Object.entries({
 'Referencias por modelo/año y proveedor':stats.totalObservations,
 'Familias con valor publicado':stats.totalModelFamilies,
 'Retiros documentados (familia/generación/versión)':stats.retiredStatuses,
 'Retiros de familia completa':stats.wholeFamilyRetirements,
 'Familias retiradas con valor por algún año':stats.wholeFamilyWithObservedValue,
 'Familias retiradas sin observación verificable':stats.wholeFamilyWithoutObservedValue,
 'Rangos aproximados de Autofact':bySource.Autofact,
 'Medianas de anuncios AutoExplora':bySource.AutoExplora
 }).map(([a,b])=>'| '+a+' | '+b+' |'),
 '',
 '**Importante:** un valor de la misma familia, aunque corresponda a otro año, no sirve para valorar una unidad de un año distinto. Una coincidencia de familia no demuestra equivalencia de generación, motor ni acabado. Los retiros de una generación concreta quedan fuera del cruce automático.',
 '',
 '## Familias descontinuadas sin valor documentado',
 '',
 '| Marca | Familia | Alcance | Fuente del estado |',
 '|---|---|---|---|',
 ...unavailable.map(x=>'| '+x.brand.replaceAll('|','/')+' | '+x.model.replaceAll('|','/')+' | '+x.statusLabel+' | '+(x.sourceUrl?'[Antecedente]('+x.sourceUrl+')':'N/D')+' |'),
 '',
 '## Metodología y límites',
 '',
 '- **Autofact:** mínimo–máximo aproximado publicado; la fuente no publica el tamaño de la muestra para estos rangos.',
 '- **AutoExplora:** mediana de avisos más intervalo p10–p90 y número de publicaciones, cuando la muestra es suficiente.',
 '- No representan compraventas cerradas, tasaciones SII 2026 ni valor asegurado.',
 '- No se extrapolan valores por edad del automóvil, kilometraje, versión, año o generación.',
 '- La tasación fiscal 2026 exige selección explícita del código, año de fabricación y versión SII.',
 '- Los precios provienen de documentos del corte indicado, no de un feed comercial en tiempo real.'
];
const output=lines.join('\n')+'\n';
const f=path.join(base,'rindelab/sii/COBERTURA-VALORES-USADOS-20261021.md');
if(process.argv.includes('--check')){
 assert(fs.existsSync(f)&&fs.readFileSync(f,'utf8')===output,'Actualizar informe con node scripts/audit-used-market.cjs --write');
}else if(process.argv.includes('--write')){
 fs.writeFileSync(f,output,'utf8');
}
console.log(JSON.stringify(stats,null,2));
