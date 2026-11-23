import json,pathlib,re,urllib.parse
R=pathlib.Path(__file__).resolve().parents[1];D=R/'rindelab/data';JS=R/'rindelab/v2-photos.js'
review=json.loads((D/'official-batch10-shortlist.json').read_text(encoding='utf8'))
by={(x['key'],x['idx']):x for x in review if not x.get('error')}
selection=[
 ('JAC','Ignite30X','JAC|Ignite30X',23,'EV'),
 ('Chery','Tiggo 2 Pro Max','Chery|Tiggo 2 Pro Max',38,None),
 ('Foton','FT Crew','Foton|FT Crew',28,None),
 ('Foton','FT','Foton|FT Crew',28,None)
]
def pat(s):return r'\b'+r'[\s,_-]+'.join(re.escape(x) for x in re.split(r'[\s,_-]+',s))+r'(?=$|[^A-Za-z0-9])'
rows=[]
for brand,family,source,idx,tech in selection:
 x=by[(source,idx)]
 assert x['width']>=300 and x['height']>=200
 host=urllib.parse.urlparse(x['image']).hostname
 assert host and any(host.endswith(x) for x in ['cidef.cl','jacautoschile.cl','chery.cl'])
 p={'brand':brand,'family':family,'pattern':pat(family),'from':'2020','to':'2027',
 'model':brand+' '+family+' (fotografía oficial referencial)','author':brand+' Chile · sitio oficial',
 'license':'Derechos reservados','licenseUrl':x['page'],'source':x['page'],
 'localSrc':x['image'],'imageSource':'fabricante/importador oficial',
 'rightsStatus':'Sin licencia abierta; se enlaza la imagen desde el sitio original','size':[x['width'],x['height']]}
 if tech:p['tech']=tech
 rows.append(p)
data={'date':'2026-11-22','method':'Fotos externas revisadas visualmente y enlazadas, no alojadas en GitHub','images':rows}
(D/'manufacturer-photo-batch10-20261122.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
js=JS.read_text(encoding='utf8')
assert 'officialManufacturerBatch1020261122' not in js
js=js.replace('const entries=localEntries.concat(','const officialManufacturerBatch1020261122='+json.dumps(rows,ensure_ascii=False,indent=2)+';\nconst entries=localEntries.concat(',1)
old='officialManufacturerBatch920261122).map(';assert old in js
js=js.replace(old,'officialManufacturerBatch920261122,officialManufacturerBatch1020261122).map(',1)
JS.write_text(js,encoding='utf8')
print('IMPORTED',len(rows))
