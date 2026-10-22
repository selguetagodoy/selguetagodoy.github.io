/* RINDELAB · Auditoría conservadora de cobertura de autos retirados y mercado usado. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const market=require('../rindelab/sii/data/used-market-20261021.json');
const lifecycle=require('../rindelab/sii/model-lifecycle-2026.json');
const norm=x=>String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const k=(a,b)=>norm(a)+'|'+norm(b);
assert.equal(market.schemaVersion,1);
assert.equal(lifecycle.schemaVersion,1);
const available=market.records.filter(x=>!x.qualityStatus);
const withheld=market.records.filter(x=>x.qualityStatus==='held-for-manual-review');
const wrongStatuses=market.records.filter(x=>x.qualityStatus&&x.qualityStatus!=='held-for-manual-review');
assert.equal(wrongStatuses.length,0,'Market record with unexpected quality state');
const observedByFamily=new Map();
for(const m of available){
 assert(['AutoExplora','Autofact'].includes(m.source));
 const key=k(m.brandSlug,m.modelSlug);
 if(!observedByFamily.has(key))observedByFamily.set(key,[]);
 observedByFamily.get(key).push(m);
}
const rows=lifecycle.models
 .filter(x=>x.brand&&x.model&&x.sourceUrl?.startsWith('https://')&&['discontinued-cl','previous-generation-cl'].includes(x.status))
 .map(x=>{
  const whole=x.match==='whole-family'&&x.status==='discontinued-cl';
  const records=whole?(observedByFamily.get(k(x.brand,x.model))||[]):[];
  return {brand:x.brand,model:x.model,status:x.status,scope:x.match,verifiedRetirementUrl:x.sourceUrl,
   familyLevel:whole,observedYears:[...new Set(records.map(x=>x.year))].sort((a,b)=>b-a),
   statusSummary:whole?(records.length?'value-for-some-years':'no-value-for-any-year'):'no-family-level-valuation'};
 }).sort((a,b)=>(a.brand+' '+a.model).localeCompare(b.brand+' '+b.model,'es'));
const whole=rows.filter(x=>x.familyLevel),partial=rows.filter(x=>!x.familyLevel);
const priced=whole.filter(x=>x.observedYears.length),without=whole.filter(x=>!x.observedYears.length);
const summary={date:market.observedAt,observationsTotal:market.records.length,usableObservations:available.length,withheldObservations:withheld.length,
 statusCases:rows.length,wholeFamilyCases:whole.length,scopeLimitedCases:partial.length,
 wholeFamiliesWithAnyYearObserved:priced.length,wholeFamiliesWithoutObservedValues:without.length};
assert(summary.statusCases>=90,'Retiro documental incompleto');
assert(summary.withheldObservations===3,'Revisar retenciones de fuente');
const lines=[
 '# RINDELAB · Brechas de valor comercial de modelos retirados',
 '',
 '**Corte documental:** '+summary.date+'. Las cifras corresponden a publicaciones de terceros, no a ventas efectivas ni a valores tributarios.',
 '',
 '| Control de integridad | Resultado |','|---|---:|',
 ...Object.entries({
 'Observaciones guardadas':summary.observationsTotal,
 'Publicaciones habilitadas':summary.usableObservations,
 'Observaciones retenidas para revisión':summary.withheldObservations,
 'Retiros de familias, generaciones y variantes':summary.statusCases,
 'Retiros documentados de familia completa':summary.wholeFamilyCases,
 'Retiros de alcance limitado sin asignación automática de precio':summary.scopeLimitedCases,
 'Familias retiradas con referencias para algún año':summary.wholeFamiliesWithAnyYearObserved,
 'Familias retiradas sin referencias de mercado':summary.wholeFamiliesWithoutObservedValues
 }).map(([name,n])=>'| '+name+' | '+n+' |'),
 '',
 'Los valores de una familia están asociados a años concretos. **Tener algún año con precio no significa que existan precios para todos los años.** En retiros de generación/versión la coincidencia textual de familia no habilita un valor.',
 '',
 '## Retirados de familia completa sin valor de mercado publicado',
 '',
 '| Marca | Familia | Estado | Fuente documental |','|---|---|---|---|',
 ...without.map(r=>'| '+r.brand+' | '+r.model+' | Sin referencia para cualquier año documentado | [Fuente del retiro]('+r.verifiedRetirementUrl+') |'),
 '',
 '## Retiros limitados que requieren valoración específica de generación, carrocería o versión',
 '',
 '| Marca | Modelo o generación | Alcance | Fuente |','|---|---|---|---|',
 ...partial.map(r=>'| '+r.brand+' | '+r.model+' | '+r.scope+' | [Fuente del retiro]('+r.verifiedRetirementUrl+') |'),
 '',
 '## Metodología',
 '',
 '- Las fuentes de mercado son AutoExplora (medianas y p10–p90 de avisos con muestra) y Autofact (mínimo y máximo aproximados).',
 '- El listado de retirados se toma del registro de ciclo de vida con evidencia documental, sin deducir retiros de una ficha 3CV antigua.',
 '- Los tres rangos retenidos por anomalías no se muestran como valores disponibles.',
 '- Sin una observación que corresponda a la familia y año solicitados, RINDELAB informa ausencia de precio, sin interpolar ni depreciar.',
 '- La tasación fiscal SII y permiso de circulación se consultan por año y versión tributaria elegida; no se equiparan al precio comercial.'
];
const doc=lines.join('\n')+'\n';
const f=path.join(root,'rindelab/sii/BRECHAS-USADOS-DESCONTINUADOS-20261021.md');
if(process.argv.includes('--check')){
 assert(fs.existsSync(f),'Informe de brechas ausente');
 assert.equal(fs.readFileSync(f,'utf8'),doc,'Reporte no coincide con el estado de las fuentes');
}else if(process.argv.includes('--write'))fs.writeFileSync(f,doc,'utf8');
console.log(JSON.stringify(summary,null,2));
