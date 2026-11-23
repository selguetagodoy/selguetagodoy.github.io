import requests,bs4,urllib.parse,re,json,pathlib
D=pathlib.Path(__file__).resolve().parents[1]/'rindelab/data'
PAGES={
'Hino|City 515':'https://www.hino.cl/vehiculo/xzu-616',
'Hino|XZU 616':'https://www.hino.cl/vehiculo/xzu-616',
'Hino|XZU 617 DC':'https://www.hino.cl/vehiculo/xzu-616',
'Hino|XZU 816':'https://www.hino.cl/vehiculo/xzu-616',
'Hino|XZU 817':'https://www.hino.cl/vehiculo/xzu-616',
'Hino|XZU 917':'https://www.hino.cl/vehiculo/xzu-616',
'Changan|star-truck-plus-pick-up-cabina-simple':'https://www.changan.cl/vehiculo/vehiculos-comerciales/',
'Changan|star-truck-plus-pick-up-cabina-doble':'https://www.changan.cl/vehiculo/vehiculos-comerciales/',
'Changan|star-truck-plus-cargo-box':'https://www.changan.cl/vehiculo/vehiculos-comerciales/',
'Landking|LK3':'https://www.landking.cl/content/landking/es/home/modelos/minitrucks-clase-b/lk3.html',
'Landking|LK5':'https://www.landking.cl/content/landking/es/home/modelos/minitrucks-clase-b/lk5.html',
'Landking|LK 614':'https://www.landking.cl/content/landking/es/home/modelos.html',
'Landking|LK 1016':'https://www.landking.cl/content/landking/es/home/modelos.html',
'Shineray|T32 CD':'https://www.shineraychile.cl/modelos/vehiculos-comerciales/',
'Shineray|T50 CS':'https://www.shineraychile.cl/modelos/vehiculos-comerciales/',
'Shineray|T52 CD':'https://www.shineraychile.cl/modelos/vehiculos-comerciales/',
'Shineray|X30 con A/C':'https://www.shineraychile.cl/modelos/vehiculos-comerciales/',
'Shineray|T30 CS':'https://www.shineraychile.cl/modelos/vehiculos-comerciales/',
'JMC|All New Vigus Pro':'https://jmcchile.cl/',
'JMC|Vigus EV':'https://jmcchile.cl/modelos/vigus-ev/',
'JMC|EV3':'https://jmcchile.cl/',
'Fuso|Canter 718':'https://www.fuso.cl/camiones-canter-718',
'Fuso|Canter 918':'https://www.fuso.cl/camiones-canter-918',
'Kyc|T3 Gran Mamut':'https://www.anac.cl/autos-kyc/',
'Kyc|X5 Cargo BOX':'https://www.anac.cl/autos-kyc/',
}
H={'User-Agent':'Mozilla/5.0 (compatible; RindeLabReferenceAudit/1.0)'}
pages={}
for url in dict.fromkeys(PAGES.values()):
 try:
  r=requests.get(url,headers=H,timeout=18)
  s=bs4.BeautifulSoup(r.text,'html.parser')
  imgs=[]
  for img in s.find_all('img'):
   al=img.get('alt') or img.get('title') or ''
   for att in ('src','data-src','data-lazy-src'):
    v=img.get(att,'')
    if not v or v.startswith('data:'):continue
    if v.lower().endswith(('.svg','.gif')):continue
    u=urllib.parse.urljoin(r.url,v)
    if any(x['url']==u for x in imgs):continue
    imgs.append({'url':u,'alt':al[:140],'attribute':att})
  for meta in s.find_all('meta',property='og:image'):
   v=meta.get('content','')
   if v and v.startswith('http') and not any(x['url']==v for x in imgs):imgs.insert(0,{'url':v,'alt':'og:image'})
  pages[url]={'status':r.status_code,'title':s.title.text.strip() if s.title else '', 'images':imgs,'links':[
   {'text':a.get_text(' ',strip=True)[:70],'href':urllib.parse.urljoin(r.url,a.get('href',''))}
   for a in s.find_all('a',href=True) if any(k in a.get_text(' ',strip=True).lower() for k in ('canter','vigus','ev3','t32','t50','t52','x30','modelo','lk3','lk5','star truck','serie m'))
  ][:40]}
  print('PAGE',r.status_code,len(imgs),url,flush=True)
 except Exception as e:pages[url]={'error':str(e)};print('FAIL',url,str(e),flush=True)
out={'pages':pages,'targets':PAGES}
p=D/'official-photo-research-20261122.json';p.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
for k,v in PAGES.items():
 obj=pages.get(v,{})
 photos=obj.get('images',[]);tokens=re.findall(r'[a-z0-9]+',k.lower())
 keys=[t for t in tokens if len(t)>2 and t not in ('changan','landking','hino','shineray','fuso','jmc')]
 scored=sorted(photos,key=lambda x:sum(6 if q in x['alt'].lower() else 1 if q in x['url'].lower() else 0 for q in keys),reverse=True)
 print('MATCH',k,'=>',len(scored),' | '.join(x['alt'][:35]+' '+x['url'].split('/')[-1][:35] for x in scored[:5]),flush=True)
