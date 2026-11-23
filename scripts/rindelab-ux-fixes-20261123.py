from pathlib import Path
import json,re
ROOT=Path(__file__).resolve().parents[1]/'rindelab'
def edit(path,old,new,number=1):
 p=ROOT/path;s=p.read_text(encoding='utf-8')
 actual=s.count(old)
 if actual!=number:raise RuntimeError(f'{path}: expected {number} occurrences; found {actual}: {old[:100]}')
 p.write_text(s.replace(old,new),encoding='utf-8')
 print('PATCH',path,'replacements',actual,flush=True)

# Versión y fuente correctas: ficha de un distribuidor que publica ambas variantes.
p=ROOT/'sii/commercial-2026.json'
catalog=json.loads(p.read_text(encoding='utf-8'))
byd=[x for x in catalog if x.get('brand')=='BYD' and x.get('family')=='Yuan Pro DM-i' and x.get('version') in ('Yuan Pro DM-i GL','Yuan Pro DM-i GS')]
assert len(byd)==2 and {x['version']:x['priceListClp'] for x in byd}=={'Yuan Pro DM-i GL':19990000,'Yuan Pro DM-i GS':22990000}
for x in byd:
 x['source']='https://astararetail.cl/byd-yuan-pro/'
 x['checkedAt']='2026-11-22'
 x['sourceOfferEnd']='2026-11-30'
 x['priceType']='lista'
 x['priceBasis']=f'Lista por versión {x["version"]} publicada por Astara Retail, vigencia declarada hasta el 30-11-2026. No incluye descuentos de financiamiento ni prueba equivalencia con un código 3CV.'
p.write_text(json.dumps(catalog,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('PATCH commercial BYD 2 variants, documented 30/11',flush=True)

# Mostrar en 3CV la referencia de la variante GL o GS homologada por nombre,
# sin presentar el mínimo familiar GL en la ficha GS.
prices="""function priceForHomologation(row,family){
 const ref=C.priceReference(byFamily,row,family);
 if(!ref)return null;
 if(C.brand(row[0])!=='BYD'||C.family(family,row[0])!=='YUAN PRO DM I')return ref;
 const model=C.norm(row[1]||''),variant=model.match(/\\b(GL|GS)$/);
 if(!variant)return null;
 const matching=match(row,family).find(p=>
  C.norm(p.version||'').endsWith(' '+variant[1])&&
  C.compatible(row,p)&&!C.expired(p));
 // Solo es una referencia comercial homónima, no equivalencia de código 3CV.
 return matching?{...matching,association:'same-tech',campaignExpired:false,referenceOnly:true}:null;
}
"""
edit('sii/prices.js',"function selected(row){",prices+"function selected(row){")
edit('sii/prices.js',"minimum:(row,family)=>C.priceReference(byFamily,row,family),","minimum:priceForHomologation,")
edit('sii/prices.js',"'./sii/commercial-2026.json?v=20261022-list1514'","'./sii/commercial-2026.json?v=20261123-byd-variants'")
edit('cotizador.js',"'./sii/commercial-2026.json?v=20261020-list1504'","'./sii/commercial-2026.json?v=20261123-byd-variants'")
edit('cotizador.js',"a.textContent='Ver fuente ↗';","a.textContent='Ver precio de esta versión en fuente ↗';")

# Búsqueda textual: las fichas de homologación cuyo nombre comienza por la marca
# no deben generar una repetición que degrade una búsqueda libre.
edit('v6.js'," const value=normalize([brand,model,row[F.CODE],row[F.TECH],...extra].join(' '));",
""" const modelName=normalize(model).startsWith(normalize(brand)+' ')?
  model.slice(brand.length).trim():model;
 const value=normalize([brand,modelName,row[F.CODE],row[F.TECH],...extra].join(' '));""")
edit('v6.js',"""  const offerCaption=offer?(offer.campaignExpired?'Referencia con campaña terminada · ': 'Precio publicado · ')+(offer.association==='same-tech'?'misma tecnología, versión sin verificar':'motorización de fuente no informada'):'';""",
"""  const offerCaption=offer?(offer.referenceOnly?'Versión comercial '+offer.version+' · no certifica equivalencia con código 3CV':
   (offer.campaignExpired?'Referencia con campaña terminada · ': 'Precio de familia · ')+(offer.association==='same-tech'?'misma tecnología, versión sin verificar':'motorización de fuente no informada')):'';""")
edit('v6.js',"""  article.innerHTML='<div class="vehicle-heading"><div class="vehicle-title"><h3>'+safe(row[F.BRAND]+' '+row[F.MODEL])+'</h3>'+""",
"""  const modelName=normalize(row[F.MODEL]).startsWith(normalize(row[F.BRAND])+' ')?row[F.MODEL]:row[F.BRAND]+' '+row[F.MODEL];
  article.innerHTML='<div class="vehicle-heading"><div class="vehicle-title"><h3>'+safe(modelName)+'</h3>'+""")
edit('v6.js',"""  $('searchButton').disabled=false;
  // Preserve direct navigation from older ficha permalinks.""",
"""  $('searchButton').disabled=false;
  // Si el usuario escribió mientras se cargaban las fichas, buscar en cuanto
  // el catálogo esté listo en lugar de exigir que presione otra vez.
  if($('query').value.trim()&&!submitted)performSearch({scroll:false});
  // Preserve direct navigation from older ficha permalinks.""")
edit('v6.js',"$('vehicleForm').addEventListener('submit',event=>{event.preventDefault();if(all.length)performSearch();});",
"""$('vehicleForm').addEventListener('submit',event=>{
 event.preventDefault();
 if(all.length)performSearch();
 else $('filterHint').textContent='Cargando fichas oficiales: se realizará la búsqueda automáticamente cuando estén disponibles.';
});""")
edit('v6.js',""" for(const id of ['query','brand','model','tech','bodytype','cycle','year'])$(id).value='';
 choices();$('sort').value='recent';""",
""" for(const id of ['query','brand','model','tech','bodytype','cycle','year'])$(id).value='';
 $('catalogScope').value='priced';
 choices();$('sort').value='recent';""")
# Permite que un texto libre encuentre resultados históricos cuando el subconjunto
# comercial está vacío; el cambio de ámbito se anuncia expresamente.
edit('v6.js',""" results=all.filter(r=>matchesScope(r,criteria.scope)&&matchesText(r,criteria.q)&&matchesFilters(r,criteria));
 mttMatches=criteria.scope==='commercial'?[]:filterMTT(criteria);""",
""" results=all.filter(r=>matchesScope(r,criteria.scope)&&matchesText(r,criteria.q)&&matchesFilters(r,criteria));
 if(!results.length&&criteria.q&&!criteria.brand&&!criteria.model&&criteria.scope==='priced'){
  const historical=all.filter(r=>matchesText(r,criteria.q)&&matchesFilters(r,{...criteria,scope:'all'}));
  if(historical.length){
   $('catalogScope').value='all';
   results=historical;
   $('filterHint').textContent='No encontramos esta búsqueda en el subconjunto comercial. Mostramos '+fmt(results.length)+' homologaciones históricas 3CV; no significa que estén a la venta.';
  }
 }
 mttMatches=criteria.scope==='commercial'?[]:filterMTT(inputCriteria());""")

# Mobile compare: tablas 900px no deben ocultar información esencial al abrir.
edit('market-catalog.js',""" compareBody.innerHTML='<p class="market-comparison-warning">Comparación comercial de familias, no de versiones homologadas. La tasación y el permiso solo aparecen después de elegir manualmente un año, versión y código SII desde cada tarjeta. Esa elección tampoco certifica equivalencia con el código 3CV. Precios comerciales sujetos a vigencia, IVA y condiciones.</p><div class="market-table-scroll" role="region" tabindex="0" aria-label="Tabla comercial desplazable">'+table+'</div>';""",
""" const mobileCards='<div class="market-compare-mobile" aria-label="Comparación de vehículos en tarjetas">'+xs.map(x=>
  '<article class="market-compare-mobile-card"><h3>'+safe(x.brand+' '+x.family)+'</h3><small>'+safe(labelTech(x.tech))+'</small><dl>'+
  rows.map(([label,get])=>'<div><dt>'+safe(label)+'</dt><dd>'+safe(get(x))+'</dd></div>').join('')+
  '</dl><a href="'+safe(x.ref.source)+'" target="_blank" rel="noopener noreferrer">Ver fuente comercial de '+safe(x.brand+' '+x.family)+' ↗</a></article>').join('')+'</div>';
 compareBody.innerHTML='<p class="market-comparison-warning">Comparación comercial de familias, no de versiones homologadas. La tasación y el permiso solo aparecen después de elegir manualmente un año, versión y código SII desde cada tarjeta. Esa elección tampoco certifica equivalencia con el código 3CV. Precios comerciales sujetos a vigencia, IVA y condiciones.</p>'+
 '<p class="market-mobile-hint">En teléfono, compara cada modelo en una tarjeta con sus indicadores y precios identificados.</p>'+mobileCards+
 '<div class="market-table-scroll" role="region" tabindex="0" aria-label="Tabla comercial desplazable">'+table+'</div>';""")
css=ROOT/'market.css'
with css.open('a',encoding='utf-8') as f:
 f.write("""

/* QA comprador móvil · 23/11/2026: 908 px en modal de 352 px ocultaba precios. */
.market-compare-mobile,.market-mobile-hint{display:none}
@media(max-width:760px){
 .market-table-scroll{display:none}
 .market-compare-mobile{display:grid;grid-template-columns:minmax(0,1fr);gap:14px}
 .market-mobile-hint{display:block;font-size:13px;line-height:1.5;color:#31546b;margin:10px 0}
 .market-compare-mobile-card{border:1px solid #cbdde6;border-radius:12px;background:#fff;padding:14px;min-width:0}
 .market-compare-mobile-card h3{font-size:17px;line-height:1.35;color:#103c55;margin:0 0 3px;overflow-wrap:anywhere}
 .market-compare-mobile-card>small{display:block;color:#536b7b;margin-bottom:10px}
 .market-compare-mobile-card dl{margin:0}
 .market-compare-mobile-card dl>div{padding:8px 0;border-top:1px solid #e3ebef}
 .market-compare-mobile-card dt{font-size:12px;color:#587082;font-weight:650}
 .market-compare-mobile-card dd{font-size:14px;color:#19384a;font-weight:700;margin:3px 0 0;overflow-wrap:anywhere}
 .market-compare-mobile-card>a{display:inline-flex;align-items:center;min-height:44px;margin-top:9px;font-size:13px;overflow-wrap:anywhere}
}
""")
print('PATCH market.css mobile cards')

# Áreas táctiles adecuadas sin reducir espacio disponible a otras secciones.
with (ROOT/'v2-secondary.css').open('a',encoding='utf-8') as f:
 f.write("""

/* QA móvil: botones de navegación secundarios con área táctil >=44 px. */
@media(max-width:760px){
 .site-header .coverage-nav a,.site-header .header-links a,
 .rindelab-brand-directory header nav a:not(.logo){
  display:inline-flex;align-items:center;justify-content:center;
  min-height:44px;padding:9px 10px;line-height:1.3;
 }
 .rindelab-brand-directory header nav{gap:5px;flex-wrap:wrap}
}
""")
with (ROOT/'electromovilidad.css').open('a',encoding='utf-8') as f:
 f.write("""

/* QA móvil 390px: navegación de electromovilidad operable con el dedo. */
@media(max-width:760px){
 .top .nav nav a{display:inline-flex;align-items:center;min-height:44px;
  padding:10px 9px;line-height:1.3}
}
""")
with (ROOT/'v6.css').open('a',encoding='utf-8') as f:
 f.write("""

/* QA: chips de filtros táctiles, conservando el desplazamiento horizontal. */
@media(max-width:640px){
 .quick-filters button{min-height:44px;padding-top:10px;padding-bottom:10px}
}
""")

# El título debe explicar la ventana real de ese cruce histórico, no insinuar que
# toda la sección ya contiene homologaciones de noviembre.
edit('novedades-3cv.html','<h1>¿Qué cambió entre mayo y septiembre?</h1>',
 '<h1>Cruce documental 3CV: mayo–septiembre 2026</h1>')

# Invalidar caches de CSS, JS y las dos cargas del mismo JSON en ambas vistas.
edit('index.html','./v6.js?v=20261122-official69','./v6.js?v=20261123-search-reset')
edit('index.html','./sii/prices.js?v=20261022-list1514','./sii/prices.js?v=20261123-byd-variants')
edit('cotizador.html','./cotizador.js?v=20261020-descontinuados','./cotizador.js?v=20261123-byd-variants')
edit('index.html','./market-catalog.js?v=20261122-photo700-dedupe1','./market-catalog.js?v=20261123-mobile-compare')
edit('index.html','./market.css?v=20261021-etapas234','./market.css?v=20261123-mobile-compare')
edit('index.html','./v6.css?v=20261022-pricepass11','./v6.css?v=20261123-touch-search')
for page in ['cotizador.html','metodologia.html','marcas.html','novedades-3cv.html']:
 edit(page,'./v2-secondary.css?v=20261019-v2a','./v2-secondary.css?v=20261123-touch-targets')
edit('electromovilidad.html','./electromovilidad.css?v=20261020-fotos25','./electromovilidad.css?v=20261123-touch-targets')
print('DONE UX fixes')
