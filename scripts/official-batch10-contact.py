import json,pathlib,requests,io,concurrent.futures
from PIL import Image,ImageOps,ImageDraw
D=pathlib.Path(__file__).resolve().parents[1]/'rindelab/data'
J=json.loads((D/'official-batch10-discovery.json').read_text(encoding='utf8'))
targets=[('JAC|Ignite30X',16),('JAC|Ignite30X',23),('Foton|FT Crew',28),('Chery|Tiggo 2 Pro Max',37),('Chery|Tiggo 2 Pro Max',38),('Chery|Tiggo 2 Pro Max',50)]
def fetch(t):
 k,n=t;obj=J[k];v=obj['images'][n]
 try:
  r=requests.get(v['url'],headers={'User-Agent':'Mozilla/5.0'},timeout=20);r.raise_for_status()
  im=ImageOps.exif_transpose(Image.open(io.BytesIO(r.content))).convert('RGB')
  meta={'key':k,'idx':n,'image':v['url'],'page':obj['url'],'alt':v['alt'],'width':im.width,'height':im.height}
  im.thumbnail((385,205))
  return meta,im
 except Exception as e:return {'key':k,'idx':n,'error':str(e)},None
with concurrent.futures.ThreadPoolExecutor(max_workers=4)as pool:r=list(pool.map(fetch,targets))
(D/'official-batch10-shortlist.json').write_text(json.dumps([x for x,i in r],ensure_ascii=False,indent=2)+'\n',encoding='utf8')
c=Image.new('RGB',(1200,520),'white');d=ImageDraw.Draw(c)
for i,(x,im) in enumerate(r):
 X=i%3*400;Y=i//3*260
 if im:c.paste(im,(X+(400-im.width)//2,Y+5))
 d.text((X+8,Y+213),x['key'][:40]+' ('+str(x['idx'])+')',fill='black')
 d.text((X+8,Y+232),str(x.get('width'))+'x'+str(x.get('height'))+' '+x.get('alt','')[:25],fill='black')
c.save(D/'_official_batch10_contact.jpg',quality=86)
for x,i in r:print(x['key'],x['idx'],x.get('width'),x.get('height'),x.get('error',''))
