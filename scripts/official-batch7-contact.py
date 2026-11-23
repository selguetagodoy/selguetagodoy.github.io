import pathlib,json,requests,io,concurrent.futures
from PIL import Image,ImageOps,ImageDraw
R=pathlib.Path(__file__).resolve().parents[1];D=R/'rindelab/data'
J=json.loads((D/'official-category-batch7-discovery.json').read_text(encoding='utf8'))
CHOICES=[
 ('Foton|tm cabina simple','Foton|tm cabina simple',26),
 ('Foton|tm cabina doble','Foton|tm cabina doble',26),
 ('Foton|tm cargo box','Foton|tm cargo box',26),
 ('Foton|tm3 refrigerado','Foton|tm3 refrigerado',26),
 ('Foton|TM3','Foton|TM3',26),
 ('Foton|tm5 cabina simple','Foton|tm5 cabina simple',26),
 ('Foton|tm5 cargo box','Foton|tm5 cargo box',26),
 ('Foton|TM5','Foton|TM5',26),
 ('Foton|WONDER','Foton|WONDER',26),
 ('Foton|FT Crew','Foton|FT Crew',24),
 ('DFSK|E5 Plus','DFSK|E5 Plus',6),
 ('DFSK|SUV600 PHEV','DFSK|SUV600 PHEV',16),
 ('Chevrolet|N400 Cargo','Chevrolet|N400 Cargo',59),
 ('Chevrolet|sail-hatchback','Chevrolet|N400 Cargo',9),
]
def load(t):
 target,source,idx=t
 try:
  p=J[source]
  q=p['images'][idx]
  url=q['url']
  r=requests.get(url,headers={'User-Agent':'Mozilla/5.0'},timeout=20)
  r.raise_for_status()
  im=ImageOps.exif_transpose(Image.open(io.BytesIO(r.content))).convert('RGB')
  entry={'target':target,'originKey':source,'page':p['page'],'url':url,'alt':q['alt'],'width':im.width,'height':im.height,'bytes':len(r.content),'http':r.status_code,'mime':r.headers.get('Content-Type')}
  im.thumbnail((375,193))
  return entry,im
 except Exception as e:return {'target':target,'error':str(e)},None
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as ex:all=list(ex.map(load,CHOICES))
(D/'official-batch7-shortlist.json').write_text(json.dumps([x for x,_ in all],ensure_ascii=False,indent=2)+'\n',encoding='utf8')
canvas=Image.new('RGB',(1600,4*245),'white');d=ImageDraw.Draw(canvas)
for i,(x,im) in enumerate(all):
 X=(i%4)*400;Y=(i//4)*245
 if im:canvas.paste(im,(X+(400-im.width)//2,Y+3))
 d.text((X+9,Y+198),x['target'][:44],fill='black')
 d.text((X+9,Y+214),str(x.get('width',''))+'x'+str(x.get('height',''))+' / '+x.get('alt','')[:35],fill='black')
 d.text((X+9,Y+230),x.get('url','').split('/')[-1][:50],fill='black')
p=D/'_official_batch7_contact.jpg';canvas.save(p,quality=88)
print('SHEET',p)
for x,img in all:print(x['target'],x.get('width'),x.get('height'),x.get('error',''),flush=True)
