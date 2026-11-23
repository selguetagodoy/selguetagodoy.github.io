import pathlib,requests,io,json,re,concurrent.futures
from PIL import Image,ImageOps,ImageDraw
ROOT=pathlib.Path(__file__).resolve().parents[1];D=ROOT/'rindelab/data'
base=json.loads((D/'official-photo-research-20261122.json').read_text(encoding='utf8'))['pages']
extra=json.loads((D/'official-extended-candidates-20261122.json').read_text(encoding='utf8'))
all=[]
def add(k,u,src,reason,alt=''):
 all.append({'key':k,'page':u,'image':src,'why':reason,'alt':alt})
hino='https://www.hino.cl/vehiculo/xzu-616'
for name,file in [('City 515','city515.png'),('XZU 616','xzu616.png'),('XZU 617 DC','xzu617dc.png'),('XZU 816','xzu816.png'),('XZU 817','xzu817.png'),('XZU 917','xzu917.png')]:
 t=next((x for x in base[hino]['images'] if x['url'].lower().endswith('/'+file)),None)
 if t:add('Hino|'+name,hino,t['url'],'Foto oficial del modelo',t['alt'])
ch='https://www.changan.cl/vehiculo/vehiculos-comerciales/'
for name,alt in [('star-truck-plus-pick-up-cabina-simple','Star Truck Pickup Cabina Simple'),('star-truck-plus-pick-up-cabina-doble','Star Truck Pickup Cabina Doble'),('star-truck-plus-cargo-box','Cargo Box - Blanco')]:
 t=next((x for x in base[ch]['images'] if alt.lower() in x['alt'].lower()),None)
 if t:add('Changan|'+name,ch,t['url'],'Foto fabricante; mismo tipo de carrocería',t['alt'])
for name,suffix in [('LK3','lk3.html'),('LK5','lk5.html')]:
 url=next(k for k in base if k.endswith('/'+suffix))
 cand=[x for x in base[url]['images'] if name.lower()+'-pu-blanco-1200x1200' in x['url'].lower()]
 if not cand:cand=[x for x in base[url]['images'] if name.lower()+'-pu-blanco' in x['url'].lower()]
 if cand:add('Landking|'+name,url,cand[0]['url'],'Modelo oficial Landking',cand[0]['alt'])
for name in ['LK 1016','LK 614']:
 key='Landking|'+name; obj=extra[key]
 for texttoken in ['lk1016','lk614']:
  if texttoken not in name.lower().replace(' ',''):continue
  candidates=[x for x in obj['candidates'] if texttoken in x['url'].lower() and 'logo' not in x['url'].lower()]
  print('CANDIDATES',key,[(c['alt'][:20],c['url'].split('/')[-1][:70])for c in candidates[:12]],flush=True)
  if candidates:
   preferred=next((x for x in candidates if ('1200x1200' in x['url'].lower() or '600x' in x['url'].lower())),candidates[0])
   add(key,obj['page'],preferred['url'],'Modelo oficial Landking',preferred['alt'])
for name in ['All New Vigus Pro','Vigus EV','EV3']:
 key='JMC|'+name;obj=extra[key]
 cand=next((x for x in obj['candidates'] if x['alt']=='og:image'),None)
 if cand:add(key,obj['page'],cand['url'],'Imagen principal oficial',cand['alt'])
for name,tok in [('T32 CD','T32_blanco.png'),('T50 CS','T50_blanco.png'),('T52 CD','T52_blanco.png'),('X30 con A/C','X30_blanco.png'),('T30 CS','T30_blanco.png')]:
 key='Shineray|'+name;obj=extra[key]
 cand=next((x for x in obj['candidates'] if tok.lower() in x['url'].lower()),None)
 if cand:add(key,obj['page'],cand['url'],'Imagen de modelo desde ficha oficial',cand['alt'])
def load(item):
 try:
  r=requests.get(item['image'],headers={'User-Agent':'Mozilla/5.0'},timeout=17,verify=('jmcchile.cl' not in item['image']))
  r.raise_for_status()
  im=ImageOps.exif_transpose(Image.open(io.BytesIO(r.content))).convert('RGB')
  item.update({'status':r.status_code,'width':im.width,'height':im.height,'mime':r.headers.get('Content-Type'),'length':len(r.content)})
  im.thumbnail((380,196))
  return item,im
 except Exception as e:item['error']=str(e);return item,None
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:res=list(pool.map(load,all))
out={'found':len(res),'photos':[v for v,img in res]}
(D/'official-photo-shortlist-20261122.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
for i in range((len(res)+15)//16):
 canvas=Image.new('RGB',(1600,4*250),'white');dr=ImageDraw.Draw(canvas)
 for k,(v,im) in enumerate(res[16*i:16*(i+1)]):
  x=(k%4)*400;y=(k//4)*250
  if im:canvas.paste(im,(x+(400-im.width)//2,y))
  dr.text((x+8,y+199),v['key'][:46],fill='black')
  dr.text((x+8,y+216),str(v.get('width','ERR'))+'x'+str(v.get('height','ERR'))+' '+v.get('why','')[:27],fill='black')
  dr.text((x+8,y+233),v.get('alt','')[:50],fill='black')
 p=D/f'_official_contact_{i+1}.jpg';canvas.save(p,quality=87);print('SHEET',p,flush=True)
print('TOTAL',len(res),'OK',sum('error' not in v for v,img in res),flush=True)
for v,img in res:print(v['key'],v.get('width'),v.get('height'),v.get('error',''),flush=True)
