import pathlib,json,re,unicodedata,requests
R=pathlib.Path(__file__).resolve().parents[1];D=R/'rindelab/data';JS=R/'rindelab/v2-photos.js'
c=json.loads((D/'official-photo-shortlist-20261122.json').read_text(encoding='utf8'))['photos']
extended=json.loads((D/'official-extended-candidates-20261122.json').read_text(encoding='utf8'))
# Use clean product render (not the advertisement banner with dated promotion).
for p in c:
 if p['key']=='Landking|LK 1016':
  p['image']=extended[p['key']]['candidates'][18]['url'];p['alt']='LK1016 pickup / fotografía oficial, sin precio'
 if p['key']=='Landking|LK 614':
  p['image']=extended[p['key']]['candidates'][18]['url'];p['alt']='LK614 pickup / fotografía oficial, sin precio'
assert len(c)==21
def rx(family):
 tokens=[x for x in re.split(r'[\s,_-]+',family) if x]
 return r'\b'+r'[\s,_-]+'.join(re.escape(x) for x in tokens)+r'(?=$|[^A-Za-z0-9])'
whitelist={'hino.cl','changan.cl','landking.cl','jmcchile.cl','shineraychile.cl'}
data={'date':'2026-11-22','method':'Enlaces directos a imágenes oficiales, sin copiar ni alojar archivos de terceros','rights':'Derechos reservados por sus titulares. Enlaces externos: revisar condiciones de uso antes de redistribuir o descargar','images':[]}
for item in c:
 assert not item.get('error'),str(item)
 assert item.get('width',0)>=200 and item.get('height',0)>=100,str(item)
 brand,family=item['key'].split('|',1)
 domain=__import__('urllib.parse',fromlist=['urlparse']).urlparse(item['image']).hostname
 assert domain and any(domain==x or domain.endswith('.'+x) for x in whitelist),str(item)
 meta={'brand':brand,'family':family,'pattern':rx(family),'from':'2020','to':'2027',
 'model':brand+' '+family+' (fotografía oficial referencial)',
 'author':brand+' Chile · sitio oficial',
 'license':'Derechos reservados',
 'licenseUrl':item['page'],'source':item['page'],
 'localSrc':item['image'],'imageSource':'fabricante/importador oficial','rightsStatus':'No se verificó una licencia abierta; la imagen se enlaza desde el sitio de origen','size':[item['width'],item['height']]}
 data['images'].append(meta)
p=D/'manufacturer-photo-batch6-20261122.json';p.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
js=JS.read_text(encoding='utf8')
marker='const entries=localEntries.concat('
assert 'const officialManufacturerBatch620261122=' not in js and marker in js
js=js.replace(marker,'const officialManufacturerBatch620261122='+json.dumps(data['images'],ensure_ascii=False,indent=2)+';\n'+marker,1)
old='licensedCommonsGap520261122).map('
assert old in js
js=js.replace(old,'licensedCommonsGap520261122,officialManufacturerBatch620261122).map(',1)
JS.write_text(js,encoding='utf8')
print('INTEGRATED',len(data['images']))
for p in data['images']:print(p['brand']+' '+p['family']+' '+p['localSrc'][:100])
