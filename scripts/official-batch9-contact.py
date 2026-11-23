import pathlib,json,requests,io,concurrent.futures
from PIL import Image,ImageOps,ImageDraw
D=pathlib.Path(__file__).resolve().parents[1]/'rindelab/data';J=json.loads((D/'official-batch9-discovery.json').read_text(encoding='utf8'))
ITEMS=[
 ('Foton|view grand pasajero','Foton|view grand pasajero',26),
 ('JAC|Refine Cargo','JAC|Refine Cargo',16),
 ('Kaiyi|Kye-5','Kaiyi|Kye-5',8),
 ('Kaiyi|Kyx3','Kaiyi|Kyx3',6),
 ('Kaiyi|Kyx3 PRO','Kaiyi|Kyx3 PRO',7),
 ('Kyc|T3 Gran Mamut','Kyc|T3 Gran Mamut',1),
 ('Kyc|T3 Gran Mamut Cargo BOX','Kyc|T3 Gran Mamut',7)
]
def get(x):
 key,orig,idx=x;p=J[orig];v=p['images'][idx]
 try:
  r=requests.get(v['url'],timeout=20,headers={'User-Agent':'Mozilla/5.0'});r.raise_for_status()
  im=ImageOps.exif_transpose(Image.open(io.BytesIO(r.content))).convert('RGB')
  record={'key':key,'page':p['page'],'image':v['url'],'alt':v['alt'],'width':im.width,'height':im.height}
  im.thumbnail((380,205))
  return record,im
 except Exception as e:return {'key':key,'error':str(e)},None
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as ex:rs=list(ex.map(get,ITEMS))
j=[r for r,im in rs];(D/'official-batch9-shortlist.json').write_text(json.dumps(j,ensure_ascii=False,indent=2),encoding='utf8')
can=Image.new('RGB',(1600,2*260),'white');dr=ImageDraw.Draw(can)
for k,(v,im) in enumerate(rs):
 x=k%4*400;y=k//4*260
 if im:can.paste(im,(x+(400-im.width)//2,y+3))
 dr.text((x+4,y+210),v['key'][:46],fill='black')
 dr.text((x+4,y+228),str(v.get('width'))+'x'+str(v.get('height'))+' '+v.get('alt','')[:30],fill='black')
can.save(D/'_official-batch9-contact.jpg',quality=87)
for v,im in rs:print(v['key'],v.get('width'),v.get('height'),v.get('error',''),flush=True)
