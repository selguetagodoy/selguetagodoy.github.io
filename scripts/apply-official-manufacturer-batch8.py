import pathlib,json,re,urllib.parse
R=pathlib.Path(__file__).resolve().parents[1];D=R/'rindelab/data';JS=R/'rindelab/v2-photos.js'
items=json.loads((D/'official-batch8-shortlist.json').read_text(encoding='utf8'))
assert len(items)==4
def pat(s):
 return r'\b'+r'[\s,_-]+'.join(re.escape(x) for x in re.split(r'[\s,_-]+',s))+r'(?=$|[^A-Za-z0-9])'
batch={'date':'2026-11-22','method':'Fotografías desde sitios de marcas oficiales, enlazadas sin rehosting','rights':'Derechos reservados; enlace externo no constituye licencia abierta','images':[]}
for p in items:
 brand,family=p['key'].split('|',1)
 host=urllib.parse.urlparse(p['image']).hostname or ''
 assert (host.endswith('ram.com') if brand=='RAM' else host.endswith('landking.cl') if brand=='Landking' else host.endswith('mini.cl')),p
 assert p['width']>=300 and p['height']>=150,p
 batch['images'].append({'brand':brand,'family':family,'pattern':pat(family),'from':'2020','to':'2027',
 'model':brand+' '+family+' (referencial de vehículo oficial)','author':brand+' Chile · fabricante',
 'source':p['page'],'license':'Derechos reservados','licenseUrl':p['page'],
 'localSrc':p['image'],'imageSource':'fabricante oficial',
 'rightsStatus':'Sin licencia abierta verificada; imagen enlazada al servidor original','size':[p['width'],p['height']]})
(D/'manufacturer-photo-batch8-20261122.json').write_text(json.dumps(batch,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
js=JS.read_text(encoding='utf8');assert 'const officialManufacturerBatch820261122=' not in js
js=js.replace('const entries=localEntries.concat(','const officialManufacturerBatch820261122='+json.dumps(batch['images'],ensure_ascii=False,indent=2)+';\nconst entries=localEntries.concat(',1)
old='officialManufacturerBatch720261122).map(';assert old in js
js=js.replace(old,'officialManufacturerBatch720261122,officialManufacturerBatch820261122).map(',1)
JS.write_text(js,encoding='utf8')
print('APPLIED',len(batch['images']))
