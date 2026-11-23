import requests,bs4,re,urllib.parse,concurrent.futures,json,pathlib
D=pathlib.Path(__file__).resolve().parents[1]/'rindelab/data'
sites={
'Foton|view grand pasajero':'https://cidef.cl/modelo/view-grand-pasajeros/',
'JAC|Refine Cargo':'https://www.jacautoschile.cl/modelos/comerciales/refine-cargo/',
'JAC|Refine Cargo EV':'https://www.jacautoschile.cl/modelos/comerciales/refine-cargo-ev/',
'RAM|V700 City':'https://www.ram.com/sub-region/es/ram-v700-city.html',
'Kaiyi|Kye-5':'https://kaiyi.danielachondo.cl/',
'Kaiyi|Kyx3':'https://kaiyi.danielachondo.cl/',
'Kaiyi|Kyx3 PRO':'https://kaiyi.danielachondo.cl/',
'Kyc|T3 Gran Mamut':'https://kycmotors.cl/',
'Renault|Duster':'https://www.renault.cl/vehiculos/duster/',
'Gac|Emkoo':'https://store.gacmotor.cl/category/EMKOO',
}
h={'User-Agent':'Mozilla/5.0'}
def parse(k,u):
 try:
  r=requests.get(u,headers=h,timeout=17)
  s=bs4.BeautifulSoup(r.text,'html.parser')
  imgs=[]
  for meta in s.find_all('meta',property='og:image'):
   if meta.get('content'):imgs.append({'url':urllib.parse.urljoin(r.url,meta.get('content')),'alt':'og'})
  for tag in s.find_all('img'):
   for field in ('data-src','data-lazy-src','src'):
    v=tag.get(field,'')
    if not v or v.startswith('data:') or v.lower().endswith('.svg'):continue
    url=urllib.parse.urljoin(r.url,v)
    if url not in [x['url'] for x in imgs]:imgs.append({'url':url,'alt':(tag.get('alt') or tag.get('title') or '')[:90]})
  return k,{'page':r.url,'status':r.status_code,'images':imgs[:180],'links':[{'text':x.get_text(' ',strip=True)[:60],'url':urllib.parse.urljoin(r.url,x.get('href',''))}for x in s.find_all('a',href=True) if any(z in x.get_text(' ',strip=True).lower() for z in ('kyx3','kye','refine','duster','mamut','t3','emkoo','v700'))][:40]}
 except Exception as ex:return k,{'error':str(ex),'images':[]}
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
 results=dict(pool.map(lambda x:parse(*x),sites.items()))
for k,v in results.items():
 print('PAGE',k,v.get('status'),len(v['images']),v.get('error',''),flush=True)
 print('TOP',' | '.join(x['alt'][:27]+' '+x['url'].split('/')[-1][:55]for x in v['images'][:10]),flush=True)
D.joinpath('official-batch9-discovery.json').write_text(json.dumps(results,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
