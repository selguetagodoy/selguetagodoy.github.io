import json,requests,pathlib,urllib.parse,re,html,concurrent.futures
from PIL import Image,ImageOps
from io import BytesIO
root=pathlib.Path(__file__).resolve().parents[1]
photos=root/'rindelab/images/commons'
photos.mkdir(parents=True,exist_ok=True)
entries=[
 ('x25','BAiC X25 1.5 Elite 2017 (37281523940).jpg'),
 ('x35old','BAiC X35 1.5 Elite 2018 (39210121115).jpg'),
 ('x55old','2016 BAIC Senova X55, front 8.4.18.jpg'),
 ('upsedan','BAiC UP 1.5 Fashion Sedan 2015 (16426715011).jpg'),
 ('uphatch','BAiC Up 1.3 Comfortable 2015 (16131775161).jpg'),
 ('d20sedan','2016 BAIC Senova D20 sedan, front 8.3.18.jpg'),
 ('d20hatch','2014 Beijing Auto E-150 (Senova D20) hatchback, front 8.9.18.jpg'),
 ('plus','BAiC Plus 1.3 Cargo 2016 (23947890375).jpg'),
 ('bj40plus','2018 BAIC (Beijing) BJ40 Plus, front 8.11.18.jpg'),
 ('bj40pro','Beijing BJ40 II 001.jpg'),
 ('zoom','BAiC B40 2014 (16384788726).jpg'),
 ('x65','Senova X65 China 2015-04-13.jpg'),
 ('advance','Senova D60 IMG001.jpg'),
 ('x55plus','BAiC X55 Plus 1.5T Luxury 2024 (53362133147).jpg'),
 ('bj30hev','2025 BAIC BJ30e 1.5 Hybrid.jpg')
]
H={'User-Agent':'Rindelab-3CV-photo-audit/1.1 (photo attribution and CC compliance)'}
A='https://commons.wikimedia.org/w/api.php'
def do(t):
 key,title=t
 rec={'key':key,'file':title}
 existing=photos/('rindelab-baic-historical-'+key+'-20261123.jpg')
 if existing.exists():
  old=root/'rindelab/data/baic-photo-sources-20261123.json'
  if old.exists():
   matches=[v for v in json.loads(old.read_text(encoding='utf8')) if v['key']==key and v.get('license')]
   if matches:return matches[0]
  return {'key':key,'file':title,'error':'Existing image has no licence manifest'}
 try:
  r=requests.get(A,params={'action':'query','format':'json','prop':'imageinfo','iiprop':'url|extmetadata','iiurlwidth':'880','titles':'File:'+title},headers=H,timeout=22)
  r.raise_for_status()
  page=next(iter(r.json()['query']['pages'].values()))
  if 'missing' in page or 'imageinfo' not in page:return {**rec,'error':'file missing'}
  i=page['imageinfo'][0];meta=i.get('extmetadata',{})
  clean=lambda v:re.sub(r'<[^>]*>','',html.unescape(str(v)))
  rec.update({'source':i.get('descriptionurl'),'thumb':i.get('thumburl'), 'author':clean(meta.get('Artist',{}).get('value','Wikimedia Commons contributor')), 'license':meta.get('LicenseShortName',{}).get('value'), 'licenseUrl':meta.get('LicenseUrl',{}).get('value'),'metaTitle':page['title']})
  allowed=('CC0','CC BY','Public domain')
  if not rec['license'] or not rec['license'].startswith(allowed):rec['error']='unverified licence';return rec
  x=requests.get(i.get('thumburl') or i.get('url'),headers=H,timeout=25);x.raise_for_status()
  im=ImageOps.exif_transpose(Image.open(BytesIO(x.content))).convert('RGB')
  if im.width<450 or im.height<250:rec['error']='small image';return rec
  out=photos/('rindelab-baic-historical-'+key+'-20261123.jpg');im.save(out,quality=85,optimize=True)
  rec.update({'localSrc':'./images/commons/'+out.name,'size':[im.width,im.height],'bytes':out.stat().st_size,'status':x.status_code})
 except Exception as e:rec['error']=str(e)
 return rec
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:rows=list(pool.map(do,entries))
out=root/'rindelab/data/baic-photo-sources-20261123.json'
out.write_text(json.dumps(rows,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
for x in rows:print(x['key'],'OK' if 'localSrc' in x else 'FAILED',x.get('license'),x.get('author','')[:65],x.get('size'),x.get('error','')[:100],flush=True)
print('IMAGES',sum('localSrc' in x for x in rows),'FROM',len(rows))
