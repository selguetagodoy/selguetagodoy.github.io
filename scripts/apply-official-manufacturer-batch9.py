import json,pathlib,re,urllib.parse
R=pathlib.Path(__file__).resolve().parents[1];D=R/'rindelab/data';JS=R/'rindelab/v2-photos.js'
items=json.loads((D/'official-batch9-shortlist.json').read_text(encoding='utf8'))
assert len(items)==7
def pattern(s):return r'\b'+r'[\s,_-]+'.join(re.escape(x) for x in re.split(r'[\s,_-]+',s))+r'(?=$|[^A-Za-z0-9])'
b={'date':'2026-11-22','method':'Enlaces externos a fotos oficiales del modelo con revisión visual y sin rehosting','rights':'Derechos reservados; uso conforme a condiciones del fabricante/importador','images':[]}
for x in items:
 assert not x.get('error') and x['width']>=300 and x['height']>=140
 brand,family=x['key'].split('|',1)
 host=urllib.parse.urlparse(x['image']).hostname or ''
 assert any(host.endswith(z) for z in ['cidef.cl','jacautoschile.cl','kaiyi.danielachondo.cl','kycmotors.cl']),host
 b['images'].append({'brand':brand,'family':family,'pattern':pattern(family),'from':'2020','to':'2027',
 'model':brand+' '+family+' (foto referencial oficial)','author':brand+' · fabricante/concesionario oficial',
 'source':x['page'],'license':'Derechos reservados','licenseUrl':x['page'],
 'localSrc':x['image'],'imageSource':'sitio oficial de marca o distribuidor',
 'rightsStatus':'Sin licencia abierta; foto enlazada al servidor oficial','size':[x['width'],x['height']]})
(D/'manufacturer-photo-batch9-20261122.json').write_text(json.dumps(b,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
s=JS.read_text(encoding='utf8');assert 'officialManufacturerBatch920261122' not in s
s=s.replace('const entries=localEntries.concat(','const officialManufacturerBatch920261122='+json.dumps(b['images'],ensure_ascii=False,indent=2)+';\nconst entries=localEntries.concat(',1)
old='officialManufacturerBatch820261122).map(';assert old in s
s=s.replace(old,'officialManufacturerBatch820261122,officialManufacturerBatch920261122).map(',1)
JS.write_text(s,encoding='utf8')
print('IMPORTED',len(b['images']))
