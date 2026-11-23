#!/usr/bin/env python3
"""Final RINDELAB image pass: 27/27 gaps, verified direct image URLs.
Images remain on owner servers; no copyrighted file redistributed.
"""
from pathlib import Path
import json,re,requests,io,urllib.parse
from PIL import Image,ImageOps
R=Path(__file__).resolve().parents[1]
D=R/'rindelab/data'
JS=R/'rindelab/v2-photos.js'
base=json.loads((D/'photo27-initial-validation-20261122.json').read_text(encoding='utf8'))
end=json.loads((D/'photo27-final-four-candidates.json').read_text(encoding='utf8'))
all_entries={}
for x in base:
 assert x.get('http')==200 and x.get('w',0)>=500 and x.get('h',0)>=400,(x['brand'],x['family'],'unavailable')
 all_entries[(x['brand'],x['family'])]=x
for k in [
 ('Karry','Q22 Cabina Simple'),
 ('Karry','Q51 Cabina Simple'),
 ('BYD','Yuan Pro DM-i'),
 ('Fuso','Canter 718')
]:
 opts=[v for v in end if (v['brand'],v['family'])==k and v.get('http')==200]
 assert opts,'unavailable '+str(k)
 # BYD original official manufacturer asset; Fuso 7C18 family; Karry Autocosmos matched image
 all_entries[k]=next((v for v in opts if
    (k[0]!='BYD' or 'www.byd.com' in v['url']) and
    (k[0]!='Fuso' or 'squarespace-cdn' in v['url'])),opts[0])
assert len(all_entries)==27,len(all_entries)
coverage=json.loads((D/'catalog-coverage-20261122.json').read_text(encoding='utf8'))
gap=[(x['brand'],x['family']) for x in coverage['allGroups'] if not x['photo']]
assert len(gap)==27 and set(gap)==set(all_entries),str(set(gap)^set(all_entries))
def pat(s):
 return r'\b'+r'[\s,_-]+'.join(re.escape(part) for part in re.split(r'[\s,_-]+',s) if part)+r'(?=$|[^A-Za-z0-9])'
tech={('DFSK','Cargo Van EC35'):'EV',
 ('BYD','Yuan Pro DM-i'):'PHEV',
 ('Gac','Emkoo'):'HEV',
 ('Soueast','S08 PHEV'):'PHEV',
 ('Suzuki','Across Hybrid'):'MHEV'}
notes={
 ('Fuso','Canter 718'):'Imagen referencial de Fuso Canter 7C18 Euro VI, plataforma equivalente; NO es fotografía certificada de la versión 718 chilena',
 ('BMW','Serie M'):'Fotografía referencial de BMW M3 Competition dentro de la familia Serie M, NO representa todas las versiones M',
 ('Chery','cl-tiggo-2-pro'):'Foto de Chery Tiggo 2 Pro en anuncio de usado 2024, modelo/generación verificados visualmente',
 ('Chery','cl-tiggo-3-pro'):'Foto de Chery Tiggo 3 Pro en anuncio de usado 2024, modelo/generación verificados visualmente',
 ('BYD','Yuan Pro DM-i'):'Foto específica oficial de Yuan Pro DM-i híbrido enchufable (NO EV)',
 ('Gac','Emkoo'):'Foto de lanzamiento del GAC Emkoo HEV en Chile, no Emkoo gasolina',
 ('Suzuki','Across Hybrid'):'Foto de Suzuki Across Hybrid 2026 MHEV chileno, no Suzuki Across PHEV europeo',
 ('Karry','Q22 Cabina Simple'):'Alternativa Autocosmos verificable; imagen directa oficial Karry Chile rechazó acceso HTTP 403',
 ('Karry','Q51 Cabina Simple'):'Alternativa Autocosmos verificable; imagen directa oficial Karry Chile rechazó acceso HTTP 403'
}
rows=[]
for brand,family in gap:
 r=all_entries[(brand,family)]
 assert r['url'].startswith('https://') and r['source'].startswith('https://')
 assert r['w']>=500 and r['h']>=400,(brand,family,r['w'],r['h'])
 author=urllib.parse.urlparse(r['source']).hostname or ''
 p={'brand':brand,'family':family,'pattern':pat(family),'from':'2020','to':'2027',
 'model':brand+' '+family+' (imagen referencial auditada)',
 'author':author,'license':'Derechos reservados','licenseUrl':r['source'],'source':r['source'],
 'localSrc':r['url'],'imageSource':'fabricante / catálogo comercial / fotografía de concesionario',
 'rightsStatus':'Enlace directo al titular. Sin licencia abierta; no se aloja ni redistribuye esta imagen en GitHub.',
 'size':[r['w'],r['h']],'verifiedHttpStatus':r['http']}
 if (brand,family) in tech:p['tech']=tech[(brand,family)]
 if (brand,family) in notes:p['scopeNote']=notes[(brand,family)]
 rows.append(p)
assert len(rows)==27
manifest={'date':'2026-11-22','baselineMissing':27,'afterMissingExpected':0,'photoCount':len(rows),
 'notes':'No es una transferencia de licencias. Los enlaces externos son susceptibles a cambios, bloqueos/hotlink y condiciones de cada titular. La cobertura significa fotografía referencial por familia/tecnología, no versión ni equipamiento.',
 'photos':rows}
(D/'manufacturer-photo-batch12-final27-20261122.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
js=JS.read_text(encoding='utf8')
marker='const entries=localEntries.concat('
assert 'const officialManufacturerBatch1220261122' not in js and marker in js
js=js.replace(marker,'const officialManufacturerBatch1220261122='+json.dumps(rows,ensure_ascii=False,indent=2)+';\n'+marker,1)
old='officialManufacturerBatch1120261122).map('
assert old in js
js=js.replace(old,'officialManufacturerBatch1120261122,officialManufacturerBatch1220261122).map(',1)
JS.write_text(js,encoding='utf8')
print('ADDED',len(rows),'VERIFY URLS',len(set(p['localSrc'] for p in rows)),'GAPS BEFORE',len(gap))
