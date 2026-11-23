import pathlib,json,re,requests,io,urllib.parse
from PIL import Image
R=pathlib.Path(__file__).resolve().parents[1];D=R/'rindelab/data';JS=R/'rindelab/v2-photos.js'
data=[
 {'family':'Serie M','url':'https://acroadtrip.blob.core.windows.net/catalogo-imagenes/l/RT_V_e0e82d1b11974c2283b1a4e5c573d5cd.webp','source':'https://www.autocosmos.cl/catalogo/2025/changan/m201-furgon/12l-ac/178846','author':'Autocosmos Chile / Changan M201','model':'Changan Serie M M201 (imagen referencial de gama)'},
 {'family':'Serie M Cargo BOX','url':'https://assets.auto.cl/nvi/changan-serie-m-cargo-box-12-g-mt-2p-ch-cs-md201-cargo-box-da-1pl-rHyNQeRJibf52SKc3C35UA.jpeg','source':'https://www.auto.cl/nuevos/marcas/changan/serie-m-cargo-box/12-g-mt-2p-ch-cs-md201-cargo-box-da-1pl','author':'Auto.cl / Changan','model':'Changan Serie M MD201 Cargo Box'},
 {'family':'Serie M Furgon','url':'https://assets.auto.cl/nvi/changan-serie-m-furgon-12-g-mt-5p-m201-cargo-da-aa-ahnVHiEn3qC3LHU6Jq6rXS.jpeg','source':'https://www.auto.cl/nuevos/marcas/changan/serie-m-furgon/12-g-mt-5p-m201-cargo-da-aa','author':'Auto.cl / Changan','model':'Changan Serie M M201 Furgón'},
]
def pat(s):return r'\b'+r'[\s,_-]+'.join(re.escape(t) for t in re.split(r'[\s,_-]+',s))+r'(?=$|[^A-Za-z0-9])'
rows=[]
for item in data:
 req=requests.get(item['url'],timeout=18,headers={'User-Agent':'Mozilla/5.0'})
 req.raise_for_status();im=Image.open(io.BytesIO(req.content))
 assert im.width>=450 and im.height>=400,(item['family'],im.size)
 rows.append({'brand':'Changan','family':item['family'],'pattern':pat(item['family']),
 'from':'2020','to':'2027','model':item['model'],'author':item['author'],
 'license':'Derechos reservados','licenseUrl':item['source'],'source':item['source'],
 'localSrc':item['url'],'imageSource':'Concesionario / portal automotor Chile (encontrado en buscador de imágenes)',
 'rightsStatus':'Sin licencia abierta; archivo enlazado a servidor original, sin rehosting','size':[im.width,im.height]})
M={'date':'2026-11-22','photos':rows,'note':'3 enlaces externos de modelo preciso Changan Serie M, no alojados en GitHub'}
(D/'manufacturer-photo-batch11-20261122.json').write_text(json.dumps(M,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
js=JS.read_text(encoding='utf8')
assert 'officialManufacturerBatch1120261122' not in js
js=js.replace('const entries=localEntries.concat(','const officialManufacturerBatch1120261122='+json.dumps(rows,ensure_ascii=False,indent=2)+';\nconst entries=localEntries.concat(',1)
old='officialManufacturerBatch1020261122).map(';assert old in js
js=js.replace(old,'officialManufacturerBatch1020261122,officialManufacturerBatch1120261122).map(',1)
JS.write_text(js,encoding='utf8')
print('IMPORTED',len(rows))
