import pathlib,json,requests,io
from PIL import Image,ImageOps,ImageDraw
R=pathlib.Path(__file__).resolve().parents[1];D=R/'rindelab/data';J=json.loads((D/'official-batch8-discovery.json').read_text(encoding='utf8'))
P=[('RAM|ram2500',5),('RAM|2500 CD',5),('Landking|LK8 EV',20),('Mini|JCW Eléctrico',16)]
rlist=[];sheet=Image.new('RGB',(800,550),'white');dr=ImageDraw.Draw(sheet)
for i,(k,n) in enumerate(P):
 x=J[k];v=x['images'][n];r=requests.get(v['url'],timeout=20,headers={'User-Agent':'Mozilla/5.0'});r.raise_for_status()
 im=ImageOps.exif_transpose(Image.open(io.BytesIO(r.content))).convert('RGB');info={'key':k,'image':v['url'],'page':x['url'],'width':im.width,'height':im.height,'status':r.status_code}
 rlist.append(info);im.thumbnail((395,210));xx=i%2*400;yy=i//2*275;sheet.paste(im,(xx+(400-im.width)//2,yy+3));dr.text((xx+8,yy+215),k,fill='black')
(D/'official-batch8-shortlist.json').write_text(json.dumps(rlist,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
sheet.save(D/'_official-batch8-clean.jpg',quality=85)
print('CLEAN',len(rlist));[print(i['key'],i['width'],i['height']) for i in rlist]
