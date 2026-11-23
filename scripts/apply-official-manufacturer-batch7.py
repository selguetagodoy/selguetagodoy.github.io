import pathlib,json,re,urllib.parse
R=pathlib.Path(__file__).resolve().parents[1];D=R/'rindelab/data';JS=R/'rindelab/v2-photos.js'
items=json.loads((D/'official-batch7-shortlist.json').read_text(encoding='utf8'))
items=[p for p in items if p['target']!='Foton|FT Crew']
assert len(items)==13
def pattern(name):
 words=[x for x in re.split(r'[\s,_-]+',name) if x]
 return r'\b'+r'[\s,_-]+'.join(map(re.escape,words))+r'(?=$|[^A-Za-z0-9])'
data={'date':'2026-11-22','method':'Enlace externo directo a fotografía de distribuidor oficial; NO copiar ni rehostear imágenes','rights':'Derechos reservados por titulares','images':[]}
for p in items:
 assert 'error' not in p and p['width']>=400 and p['height']>=300,repr(p)
 brand,family=p['target'].split('|',1)
 page=p['page']
 # Imagen Sail Hatch del menú oficial Chevrolet; no corresponde a N400.
 if family=='sail-hatchback':page='https://www.chevrolet.cl/'
 author={'Foton':'CIDEF · Foton Chile','DFSK':'DFSK Chile','Chevrolet':'Chevrolet Chile'}[brand]
 photo={'brand':brand,'family':family,'pattern':pattern(family),'from':'2020','to':'2027',
 'model':brand+' '+family+' (fotografía referencial del modelo)',
 'author':author,'license':'Derechos reservados','licenseUrl':page,'source':page,
 'localSrc':p['url'],'imageSource':'distribuidor / fabricante oficial',
 'rightsStatus':'Sin licencia abierta verificada: imagen enlazada desde servidor original','size':[p['width'],p['height']]}
 data['images'].append(photo)
path=D/'manufacturer-photo-batch7-20261122.json'
path.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
js=JS.read_text(encoding='utf8')
assert 'const officialManufacturerBatch720261122=' not in js
js=js.replace('const entries=localEntries.concat(','const officialManufacturerBatch720261122='+json.dumps(data['images'],ensure_ascii=False,indent=2)+';\nconst entries=localEntries.concat(',1)
old='officialManufacturerBatch620261122).map(';assert old in js
js=js.replace(old,'officialManufacturerBatch620261122,officialManufacturerBatch720261122).map(',1)
JS.write_text(js,encoding='utf8')
print('NEW REFERENCED PHOTOS',len(data['images']))
for x in data['images']:print(x['brand'],x['family'],x['localSrc'][:110])
