'use strict';
// Auditoría automática: un candidato NO es prueba de descontinuación en Chile.
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.join(__dirname,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(ROOT,p),'utf8'));
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z0-9]+/g,' ').replace(/\s+/g,' ').trim();
const aliases={'M BENZ':'MERCEDES BENZ','MERCEDES':'MERCEDES BENZ','KIA MOTORS':'KIA','GWM':'GREAT WALL','HAVAL':'GREAT WALL','DFM':'DONGFENG','DFLZ':'DONGFENG','DFLM':'DONGFENG','SSANGYONG':'KGM','EXEED BORN FOR MORE':'EXEED','MG MOTOR':'MG','ZX AUTO':'ZXAUTO'};
const canonical=s=>aliases[norm(s)]||norm(s);
function clean(brand,model){
 let name=norm(model);
 for(let i=0;i<3;i++){
  let before=name;
  for(const prefix of [norm(brand),canonical(brand)]){
   if(prefix&&name.startsWith(prefix+' '))name=name.slice(prefix.length+1);
  }
  name=name.replace(/^(?:(?:THE |ALL )?NEW |NUEVO |NUEVA )/,'');
  if(before===name)break;
 }
 return name;
}
const compounds=[
 /^RANGE ROVER (?:SPORT|VELAR|EVOQUE)\b/,/^RANGE ROVER\b/,
 /^DISCOVERY SPORT\b/,/^GRAND CHEROKEE\b/,/^GRAND I10\b/,
 /^LAND CRUISER (?:PRADO|300)\b/,/^LAND CRUISER\b/,
 /^TIGGO [0-9]+\b/,/^CX [0-9]+\b/,/^C [0-9]+\b/,
 /^T CROSS\b/,/^T ROC\b/,/^T5 EVO\b/,/^X TRAIL\b/,
 /^COROLLA CROSS\b/,/^GR COROLLA\b/,/^YARIS CROSS\b/,
 /^CRETA GRAND\b/,/^BRONCO SPORT\b/,/^MUSTANG MACH E\b/,
 /^S PRESSO\b/,/^S CROSS\b/,/^NEW BEETLE\b/,
 /^C4 CACTUS\b/,/^SPARK EUV\b/,/^K3 CROSS\b/,/^CS 35 (?:PLUS|MAX)\b/,
 /^CS 55 PLUS\b/,/^JOLION MAX\b/,/^TANK [0-9]+\b/,
 /^HAVAL H[0-9]+\b/,/^HAVAL JOLION\b/,/^ORA 03\b/
];
function family(brand,model,prices=[]){
 const name=clean(brand,model);
 for(const rx of compounds){const m=name.match(rx);if(m)return m[0]}
 const possible=prices.filter(p=>name===p||name.startsWith(p+' ')).sort((a,b)=>b.length-a.length);
 if(possible.length)return possible[0];
 const tokens=name.split(' ');
 if(tokens[0]==='GRAND'&&tokens[1])return tokens.slice(0,2).join(' ');
 return tokens[0]||'SIN MODELO';
}
function matches(r,item){
 if(canonical(r[0])!==canonical(item.brand))return false;
 const name=clean(r[0],r[1]),target=norm(item.familyPrefix||item.model);
 const rawName=norm(r[1]);
 const prefixMatches=p=>{const k=norm(p);return rawName===k||rawName.startsWith(k+' ')||name===k||name.startsWith(k+' ')};
 const same=name===target||name.startsWith(target+' ');
 if(item.match==='whole-family')return same;
 if(item.match==='model-prefix-exclusions')return same&&!(item.excludePrefixes||[]).some(p=>{const k=norm(p);return name===k||name.startsWith(k+' ')});
 if(item.match==='model-prefix-list')return (item.modelPrefixes||[]).some(prefixMatches);
 if(item.match==='model-prefix-list-cutoff')return r[8]<=item.homologationCutoff&&(item.modelPrefixes||[]).some(prefixMatches);
 if(item.match==='body-style-hatchback')return same&&/\b(?:HB|HATCHBACK)\b/.test(name);
 if(item.match==='previous-generation-cutoff')return same&&r[8]<=item.homologationCutoff;
 if(item.match==='variant-only-manual')return same&&/\b(?:5P|5D|5 PUERTAS)\b/.test(name);
 return false;
}
function evaluate({manifest,files,commercial,lifecycle,marketExclusions=[]}){
 if(!manifest?.files||!Array.isArray(files)||!Array.isArray(commercial)||!Array.isArray(lifecycle?.models))throw Error('Fuentes incompletas');
 const input=files.flat();
 if(input.length!==manifest.count)throw Error('El número de filas 3CV cambió');
 const excluded=input.filter(r=>!r[9]||!r[8]||r[8]>manifest.published);
 if(excluded.length!==manifest.excluded)throw Error('No concilian exclusiones de fecha 3CV');
 const rows=input.filter(r=>r[9]&&r[8]&&r[8]<=manifest.published);
 const pricesByBrand=new Map();
 for(const p of commercial){
  if(!p.brand||!p.family)continue;
  const b=canonical(p.brand);
  if(!pricesByBrand.has(b))pricesByBrand.set(b,new Set());
  pricesByBrand.get(b).add(norm(p.family));
 }
 const excludedNoSale=new Map(marketExclusions.map(e=>[canonical(e.brand)+'|'+norm(e.family),e]));
 const groups=new Map();let taggedCodes=0;
 for(const r of rows){
  const b=canonical(r[0]),name=clean(r[0],r[1]),prices=[...(pricesByBrand.get(b)||[])];
  const f=family(r[0],r[1],prices),key=b+'|'+f;
  const tagged=lifecycle.models.filter(item=>matches(r,item));
  if(tagged.length)taggedCodes++;
  if(!groups.has(key))groups.set(key,{brand:b,family:f,first:'9999',last:'',count:0,codes:new Set(),examples:new Set(),tagged:0});
  const g=groups.get(key);g.count++;g.codes.add(r[9]);
  if(g.examples.size<4)g.examples.add(r[1]);
  if(r[8]<g.first)g.first=r[8];
  if(r[8]>g.last)g.last=r[8];
  if(tagged.length)g.tagged++;
 }
 const candidates=[];
 for(const g of groups.values()){
  const priceFamilies=[...(pricesByBrand.get(g.brand)||[])];
  const priced=priceFamilies.some(f=>f===g.family||f.startsWith(g.family+' ')||g.family.startsWith(f+' '));
  let status,score=0;
  const noSale=excludedNoSale.get(g.brand+'|'+g.family);
  if(noSale)status='homologado_sin_venta_comercial';
  else if(g.tagged===g.count)status='clasificado_con_fuente';
  else if(priced)status='familia_con_precio_registrado';
  else if(g.family.length<2||/^\d+$/.test(g.family))status='familia_por_normalizar';
  else if(g.last<='2020-12-31'){status='candidato_antiguo_prioridad_alta';score=100}
  else if(g.last<='2023-12-31'){status='candidato_antiguo_prioridad_media';score=60}
  else {status='sin_precio_no_concluyente';score=20}
  if(g.tagged>0&&g.tagged<g.count)score+=25;
  score+=Math.min(25,g.codes.size);
  candidates.push({brand:g.brand,family:g.family,threeCvRecords:g.codes.size,firstHomologation:g.first,lastHomologation:g.last,
   examples:[...g.examples],status,priorityScore:score,hasPriceReference:priced,alreadyTaggedCodes:g.tagged,
   evidenceUrl:noSale?noSale.sourceUrl:null});
 }
 candidates.sort((a,b)=>b.priorityScore-a.priorityScore||b.threeCvRecords-a.threeCvRecords||a.brand.localeCompare(b.brand,'es')||a.family.localeCompare(b.family,'es'));
 const tally={};for(const x of candidates)tally[x.status]=(tally[x.status]||0)+1;
 return {schemaVersion:1,summary:{sourceCut:manifest.published,originalRows:input.length,
  valid3cvRecords:rows.length,excludedAfterCut:excluded.length,priceReferences:commercial.length,
  knownLifecycleCases:lifecycle.models.length,tagged3cvRecords:taggedCodes,families:candidates.length,
  counts:tally,warning:'La ausencia de precio o la antigüedad de homologación NO prueban descontinuación.'},candidates};
}
function asMarkdown(report){
 const s=report.summary,all=report.candidates.filter(x=>x.status.startsWith('candidato_antiguo'));
 const lines=['# RINDELAB — Triaje documental masivo de modelos históricos','',
  '**Fuente 3CV:** '+s.sourceCut+' · **Alcance:** vehículos homologados en Chile, no inventario nuevo.',
  '', '**ADVERTENCIA:** Esta es una bandeja de candidatos; NO una nómina acreditada de vehículos retirados. La ausencia de precios NO demuestra descontinuación.',
  '','## Universo y controles','',
  '- Fichas de origen: '+s.originalRows+'; válidas al corte: '+s.valid3cvRecords+'; registros con fecha posterior al corte excluidos: '+s.excludedAfterCut+'.',
  '- Referencias comerciales de contraste: '+s.priceReferences+'. Estados comerciales ya documentados: '+s.knownLifecycleCases+'.',
  '- Códigos históricos alcanzados por etiquetas editoriales existentes: '+s.tagged3cvRecords+'. Familias nominales generadas: '+s.families+'.',
  '','## Resultado por estado',''];
 for(const [state,n] of Object.entries(s.counts))lines.push('- '+state+': **'+n+'** familias.');
 lines.push('','**Excepciones verificadas:** Los casos homologados sin venta regular en Chile no son descontinuados. Incluyen Borgward BX5 y BX7.');
 lines.push('','## Candidatos con revisión prioritaria','',
  '| Marca | Familia orientativa | Homologaciones | Última homologación | Grupo | Ejemplo |',
  '|---|---|---:|---|---|---|');
 for(const x of all)lines.push('| '+x.brand+' | '+x.family+' | '+x.threeCvRecords+' | '+x.lastHomologation+' | '+
  (x.status.endsWith('alta')?'Alta':'Media')+' | '+(x.examples[0]||'').replace(/\|/g,'/')+' |');
 lines.push('','## Protocolo de verificación','',
  '1. Contrastar catálogo oficial chileno de la marca y al menos otra publicación comercial vigente. No inferir retiro solamente por ausencia.',
  '2. Exigir evidencia fechada de cese, sustitución o fin de venta nacional, con URL individual para cada caso.',
  '3. Precisar carrocería, generación y relanzamientos antes de etiquetar en el JSON editorial.',
  '4. Revisar las familias con precio registrado: este indicador es protección provisional, no prueba de venta o de identidad de generación.',
  '5. Ninguna homologación, precio ni etiqueta pública se cambia automáticamente.',
  '','El JSON complementario incluye todos los grupos para filtrar por fabricante.','');
 return lines.join('\n');
}
function main(){
 const manifest=read('vehiculos/data/manifest.json');
 const result=evaluate({manifest,files:manifest.files.map(p=>read('vehiculos/'+p)),
  commercial:read('rindelab/sii/commercial-2026.json'),
  lifecycle:read('rindelab/sii/model-lifecycle-2026.json'),
  marketExclusions:read('rindelab/sii/lifecycle-exceptions-2026.json').cases});
 const args=process.argv.slice(2),json=(args.find(x=>x.startsWith('--json='))||'--json=discontinued-triage.json').slice(7),
 md=(args.find(x=>x.startsWith('--md='))||'--md=discontinued-triage.md').slice(5);
 fs.writeFileSync(json,JSON.stringify(result,null,2)+'\n');
 fs.writeFileSync(md,asMarkdown(result));
 console.log(JSON.stringify(result.summary,null,2));
}
if(require.main===module)main();
module.exports={evaluate,asMarkdown,canonical,clean,family,matches};
