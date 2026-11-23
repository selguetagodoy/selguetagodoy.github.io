import pathlib,json,requests,io,concurrent.futures
from PIL import Image,ImageOps,ImageDraw
R=pathlib.Path(__file__).resolve().parents[1];D=R/'rindelab/data'
candidates=[
 ('Karry','Q22 Cabina Simple','https://acroadtrip.blob.core.windows.net/catalogo-imagenes/xl/RT_V_9fffe25f246f466386b49436156cb2f5.jpg','https://www.autocosmos.cl/catalogo/2025/karry/q22/13l/179319'),
 ('Karry','Q51 Cabina Simple','https://acroadtrip.blob.core.windows.net/catalogo-imagenes/xl/RT_V_de0622d86f6e468592ddc53df4ee7c11.webp','https://www.autocosmos.cl/catalogo/2025/karry/q51/16l/179325'),
 ('BYD','Yuan Pro DM-i','https://www.byd.com/material/byd-site/cl/yuan-pro-dmi/productdetal/banner1-pc.jpg','https://www.byd.com/cl/yuan-pro-dmi'),
 ('BYD','Yuan Pro DM-i','https://cualautocompro.cl/_astro/byd-yuan-pro-dmi.CDi38F4c_1NmQND.jpg','https://cualautocompro.cl/byd/yuan-pro-dmi/'),
 ('Fuso','Canter 718','https://images.squarespace-cdn.com/content/v1/5f886b8b92e5ff15710df969/c0b90059-9200-493d-b2ae-967da8936c5c/fuso-canter-7c18.jpg','https://www.garcarek.pl/fuso'),
 ('Fuso','Canter 718','https://8f89f94eb0.clvaw-cdnwnd.com/703575c894aa945adb0dd75111ade891/200000786-b0179b017b/Fuso-Canter_2022-6.jpg?ph=8f89f94eb0','https://www.rolcar.pt/canter-7500-kgs/')
]
def get(a):
 brand,fam,url,page=a;row={'brand':brand,'family':fam,'url':url,'source':page}
 try:
  r=requests.get(url,headers={'User-Agent':'Mozilla/5.0'},timeout=22);r.raise_for_status()
  im=ImageOps.exif_transpose(Image.open(io.BytesIO(r.content))).convert('RGB');row.update({'http':r.status_code,'w':im.width,'h':im.height,'bytes':len(r.content)})
  im.thumbnail((380,210));return row,im
 except Exception as e:row['error']=str(e);return row,None
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as p:res=list(p.map(get,candidates))
(D/'photo27-final-four-candidates.json').write_text(json.dumps([x for x,im in res],ensure_ascii=False,indent=2)+'\n',encoding='utf8')
canvas=Image.new('RGB',(1200,2*265),'white');draw=ImageDraw.Draw(canvas)
for i,(r,im) in enumerate(res):
 x=i%3*400;y=i//3*265
 if im:canvas.paste(im,(x+(400-im.width)//2,y+5))
 draw.text((x+5,y+220),r['brand']+' '+r['family'],fill='black')
 draw.text((x+5,y+240),str(r.get('w','ERR'))+'x'+str(r.get('h','ERR'))+' '+r['url'].split('/')[-1][:35],fill='black')
canvas.save(D/'_photo27_final_four.jpg',quality=86)
for r,im in res:print(r['brand'],r['family'],r.get('http'),r.get('w'),r.get('h'),r.get('error','')[:100],flush=True)
