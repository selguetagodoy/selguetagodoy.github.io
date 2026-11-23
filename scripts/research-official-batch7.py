import requests,bs4,urllib.parse,re,html,json,pathlib,concurrent.futures
D=pathlib.Path(__file__).resolve().parents[1]/'rindelab/data'
PAGES={
'Foton|tm3 refrigerado':'https://cidef.cl/modelo/tm3-refrigerado/',
'Foton|TM3':'https://cidef.cl/modelo/tm3-1-6-cabina-simple/',
'Foton|tm5 cabina simple':'https://cidef.cl/modelo/tm5-mas-cabinasimple/',
'Foton|TM5':'https://cidef.cl/modelo/tm5-mas-cabinasimple/',
'Foton|tm5 cargo box':'https://cidef.cl/modelo/tm5-cargo-box/',
'Foton|WONDER':'https://cidef.cl/modelo/wonder-camion-mini-truck/',
'Foton|tm cabina doble':'https://cidef.cl/modelo/tm3-1-6-doble-cabina/',
'Foton|tm cabina simple':'https://cidef.cl/modelo/tm3-1-6-cabina-simple/',
'Foton|tm cargo box':'https://cidef.cl/modelo/tm3-mas-cargo-box/',
'DFSK|E5 Plus':'https://www.dfsk.cl/vehiculos/dfsk/e5-plus/',
'DFSK|SUV600 PHEV':'https://www.dfsk.cl/pasajeros/vehiculo/600-phev/',
'DFSK|Cargo Van EC35':'https://www.dfsk.cl/electromovilidad/',
'Chevrolet|N400 Cargo':'https://www.chevrolet.cl/vans/n400-van',
'Ford|Transit Furgon':'https://www.ford.cl/comerciales/transit/',
'Toyota|Hiace Minibus':'https://toyota.cl/modelos/hiace/',
'Foton|FT Crew':'https://cidef.cl/marca/foton/',
}
H={'User-Agent':'Mozilla/5.0 (compatible; RindeLabModelIndexer/1.0)'}
def search(t):
 k,u=t
 try:
  r=requests.get(u,headers=H,timeout=18)
  soup=bs4.BeautifulSoup(r.text,'html.parser')
  img=[]
  for z in soup.find_all('meta',property='og:image'):
   c=z.get('content') or ''
   if c:img.append({'alt':'og:image','url':urllib.parse.urljoin(r.url,c)})
  for tag in soup.find_all('img'):
   al=(tag.get('alt') or tag.get('title') or '')[:180]
   for p in ('data-src','data-lazy-src','src'):
    v=tag.get(p,'')
    if not v or v.startswith('data:'):continue
    url=urllib.parse.urljoin(r.url,v)
    if url.lower().endswith(('.svg','.gif')):continue
    if not any(a['url']==url for a in img):img.append({'alt':al,'url':url})
  for m in re.findall(r'(?:https?:)?//[^\s\"\']+?\.(?:png|jpg|jpeg|webp)(?:\?[^\s\"\']*)?',r.text,re.I):
   if len(m)>350:continue
   u1=m if m.startswith('http')else 'https:'+m
   if not any(a['url']==u1 for a in img):img.append({'alt':'inline','url':u1})
  return k,{'page':r.url,'status':r.status_code,'images':img[:250],'title':soup.title.get_text(' ',strip=True) if soup.title else ''}
 except Exception as e:return k,{'page':u,'error':str(e),'images':[]}
res={}
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as ex:
 for k,x in ex.map(search,PAGES.items()):
  res[k]=x;print(k,x.get('status','ERR'),len(x['images']),x.get('error',''),flush=True)
p=D/'official-category-batch7-discovery.json';p.write_text(json.dumps(res,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
for k,v in res.items():
 print('ASSETS',k,' | '.join(x['alt'][:28]+':'+x['url'].split('/')[-1][:45] for x in v['images'][:12]),flush=True)
