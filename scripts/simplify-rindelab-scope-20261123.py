from pathlib import Path
import re
R=Path(__file__).resolve().parents[1]/'rindelab'
def change(f,a,b,count=1):
 p=R/f;s=p.read_text(encoding='utf8');n=s.count(a);assert n==count,(f,n,a[:100])
 p.write_text(s.replace(a,b),encoding='utf8')
 print('UPDATED',f,flush=True)
p=R/'index.html';txt=p.read_text(encoding='utf8')
old=re.search(r'<div class="rinde-catalog-scope"><label for="catalogScope">.*?</div>',txt)
assert old,'Missing old search scope'
replacement="""<details class="rinde-catalog-scope rinde-catalog-scope-details" id="catalogScopeDetails">
 <summary>Más opciones de búsqueda (para explorar el catálogo)</summary>
 <div class="rinde-catalog-scope-controls">
  <label for="catalogScope">Tipo de resultados</label>
  <select id="catalogScope" aria-describedby="catalogScopeHint">
   <optgroup label="Búsqueda habitual">
    <option value="all" selected>Todos los vehículos (incluye modelos antiguos)</option>
    <option value="priced">Con información de compra o novedades recientes</option>
    <option value="commercial">Catálogo comercial de modelos nuevos</option>
   </optgroup>
   <optgroup label="Investigación avanzada">
    <option value="upcoming">Modelos anunciados que aún no se venden</option>
    <option value="market-priced">Ofertas comerciales con precio publicado</option>
    <option value="family-price-review">Precio de la familia; falta confirmar la versión</option>
    <option value="recent-no-price">Homologaciones recientes sin precio comprobado</option>
   </optgroup>
  </select>
  <small id="catalogScopeHint">Las fichas 3CV incluyen vehículos antiguos. Tener una ficha no significa que el vehículo esté a la venta ni que el precio corresponda a esa versión.</small>
 </div>
</details>"""
txt=txt[:old.start()]+replacement+txt[old.end():]
needle='<section id="results" class="results" aria-labelledby="resultsTitle" hidden>'
assert txt.count(needle)==1
txt=txt.replace(needle,needle+"""
  <div class="rinde-results-scope" role="group" aria-label="Mostrar resultados de búsqueda">
   <strong>Ver resultados</strong>
   <button type="button" class="scope-quick-button" data-scope-quick="all" aria-pressed="true">Todos los vehículos</button>
   <button type="button" class="scope-quick-button" data-scope-quick="priced" aria-pressed="false">Con información de compra</button>
   <small>Incluye fichas antiguas; un vehículo homologado no necesariamente está a la venta.</small>
  </div>
  <details class="rinde-photo-coverage-info">
   <summary>¿Por qué faltan algunas fotos?</summary>
   <p>La biblioteca comercial de fotografías no cubre todo el historial 3CV. Al 23/11/2026, había foto referencial asociada a <strong>2.018 de 8.394 fichas</strong> (24,0 %). Las fotos no certifican versión exacta. <a href="./data/real-3cv-photo-coverage-20261123.json" target="_blank" rel="noopener">Consultar auditoría de cobertura por marca</a>.</p>
  </details>
""",1)
p.write_text(txt,encoding='utf8')
print('UPDATED index.html: search simplified and transparent photo counts')
change('v6.js',"$('catalogScope').value='priced';","$('catalogScope').value='all';")
change('v6.js',"function performSearch({scroll=true}={}){","""function updateScopeQuickButtons(){
 const scope=$('catalogScope').value;
 document.querySelectorAll('[data-scope-quick]').forEach(button=>{
  button.setAttribute('aria-pressed',String(button.dataset.scopeQuick===scope));
 });
}
function performSearch({scroll=true}={}){""")
change('v6.js'," render();textSuggestions(criteria);\n if(scroll)$('results').scrollIntoView"," updateScopeQuickButtons();render();textSuggestions(criteria);\n if(scroll)$('results').scrollIntoView")
change('v6.js',"""$('catalogScope').addEventListener('change',()=>{choices();if(submitted)performSearch({scroll:false});});""",
"""$('catalogScope').addEventListener('change',()=>{choices();if(submitted)performSearch({scroll:false});updateScopeQuickButtons();});
document.querySelectorAll('[data-scope-quick]').forEach(button=>button.addEventListener('click',()=>{
 const next=button.dataset.scopeQuick;
 if($('catalogScope').value===next)return;
 $('catalogScope').value=next;
 choices();
 if(all.length)performSearch({scroll:false});
 updateScopeQuickButtons();
}));""")
# Default all must not be changed to empty if prices unavailable (already all).
change('v6.js',""" $('results').hidden=true;$('mttSearchSection').hidden=true;$('sourceLegend').hidden=true;$('energyResultsHeading').hidden=true;$('suggestions').replaceChildren();$('filterHint').textContent='';""",
""" $('results').hidden=true;$('mttSearchSection').hidden=true;$('sourceLegend').hidden=true;$('energyResultsHeading').hidden=true;$('suggestions').replaceChildren();$('filterHint').textContent='';updateScopeQuickButtons();""")
# Accessibility and scannability of closed disclosure; no 7-category select on first view
p=R/'v6.css'
with p.open('a',encoding='utf8') as f:
 f.write("""

/* 23/11 · Buscador normal: la segmentación avanzada se oculta hasta solicitarla. */
.rinde-catalog-scope-details{margin:14px 0 6px;border:1px solid #d7e3eb;border-radius:11px;background:#f9fcfe;padding:0 14px}
.rinde-catalog-scope-details>summary{cursor:pointer;min-height:44px;display:flex;align-items:center;font-size:13px;font-weight:680;color:#24556c}
.rinde-catalog-scope-controls{padding:7px 0 14px;display:grid;gap:7px}
.rinde-catalog-scope-controls label{font-size:13px;font-weight:750}
.rinde-catalog-scope-controls select{display:block;width:100%;max-width:560px;min-height:44px;padding:8px 12px;font-size:14px;text-overflow:ellipsis}
.rinde-catalog-scope-controls small{line-height:1.55;color:#536d7b}
.rinde-results-scope{display:flex;align-items:center;gap:8px;flex-wrap:wrap;border:1px solid #d9e6ec;border-radius:12px;background:#f7fafc;padding:12px;margin-bottom:14px}
.rinde-results-scope>strong{font-size:13px;color:#224b61;margin-right:4px}
.scope-quick-button{border:1px solid #b9ccd7;border-radius:999px;background:white;color:#1a465c;min-height:44px;padding:9px 13px;font-size:13px;font-weight:700;cursor:pointer}
.scope-quick-button[aria-pressed="true"]{color:#fff;background:#195870;border-color:#195870}
.rinde-results-scope>small{flex-basis:100%;font-size:11px;color:#63798a;line-height:1.55}
.rinde-photo-coverage-info{font-size:12px;color:#506b7d;margin:7px 0 18px}
.rinde-photo-coverage-info summary{cursor:pointer;min-height:38px;display:flex;align-items:center;font-weight:650}
.rinde-photo-coverage-info p{line-height:1.65}
@media(max-width:600px){.rinde-results-scope{gap:7px;padding:10px}.scope-quick-button{flex:1 1 130px}.rinde-catalog-scope-controls select{max-width:100%}}
""")
change('index.html','./v6.js?v=20261123-phev-scenario','./v6.js?v=20261123-baic-audit1')
change('index.html','./v6.css?v=20261123-phev-scenario','./v6.css?v=20261123-baic-audit1')
change('index.html','./v2-photos.js?v=20261122-photo700-r1','./v2-photos.js?v=20261123-baic-audit1')
# E2E: advanced controls are intentionally collapsed, open before programmatic selection.
for p in (R/'tests').glob('*.cjs'):
 s=p.read_text(encoding='utf8')
 if p.name=='catalog-ui.cjs':
  s=s.replace("assert.equal(await page.locator('#catalogScope').inputValue(),'priced');","assert.equal(await page.locator('#catalogScope').inputValue(),'all');")
  s=s.replace("const priced=parseInt(await page.locator('#resultCount').innerText(),10);",
  """const allAtFirst=parseInt(await page.locator('#resultCount').innerText(),10);
  await page.locator('#catalogScopeDetails').evaluate(el=>el.open=true);
  await page.selectOption('#catalogScope','priced');
  const priced=parseInt(await page.locator('#resultCount').innerText(),10);""")
  s=s.replace("assert(archival>=priced,'Cambiar al historial completo oculta resultados');","assert(archival>=priced&&archival===allAtFirst,'Cambiar al historial completo oculta resultados');")
 if p.name=='ux-buyer-audit-20261123.cjs':
  s=s.replace("""assert(read('v6.js').includes("$('catalogScope').value='priced';"),'Reset must restore catalog scope');""",
  """assert(read('v6.js').includes("$('catalogScope').value='all';"),'Reset must return to the whole 3CV catalog');""")
 if p.name in ('e2e.cjs','market-stages.cjs','market-status-evidence.cjs','catalog-ui.cjs'):
  # Nonvisual test selectors need open container after UI hides advanced categories by default.
  s=re.sub(r"await (\w+)\.selectOption\('#catalogScope',",r"await \1.locator('#catalogScopeDetails').evaluate(el=>el.open=true);await \1.selectOption('#catalogScope',",s)
 p.write_text(s,encoding='utf8') if s!=p.read_text(encoding='utf8') else None
 print('TEST',p.name) if p.name in ('e2e.cjs','market-stages.cjs','market-status-evidence.cjs','catalog-ui.cjs','ux-buyer-audit-20261123.cjs') else None
print('DONE UX scoped')
