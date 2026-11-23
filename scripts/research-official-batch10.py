import requests,bs4,re,urllib.parse,json,pathlib,concurrent.futures
D=pathlib.Path(__file__).resolve().parents[1]/'rindelab/data'
URLs={
'JAC|Ignite30X':'https://www.jacautoschile.cl/modelos/electricos/jac-ignite-30x/',
'DFSK|Cargo Van EC35':'https://callegari.cl/nuevos/cargo-van/',
'Gac|Emkoo':'https://www.gacautos.cl/modelos/suv/gac-emkoo/',
'Chery|Tiggo 2 Pro Max':'https://chery.cl/tiggo-2-pro-max/',
'Foton|FT Crew':'https://cidef.cl/marca/foton/',
'Changan|Serie M Cargo BOX':'https://www.auto.cl/nuevos/changan/serie-m-cargo-box',
'Changan|Serie M':'https://www.auto.cl/nuevos/changan/serie-m',
'Changan|Serie M Furgon':'https://www.auto.cl/nuevos/changan/serie-m-furgon',
'Toyota|Hiace Minibus':'https://www.auto.cl/nuevos/toyota/hiace',
}
H={'User-Agent':'Mozilla/5.0'}
def extract(k,u):
 try:
  r=requests.get(u,headers=H,timeout=17)
  soup=bs4.BeautifulSoup(r.text,'html.parser')
  imgs=[]
  for z in soup.find_all('meta',property=['og:image','twitter:image']):
   if z.get('content'):imgs.append({'url':urllib.parse.urljoin(r.url,z.get('content')),'alt':'og:image'})
  for z in soup.find_all('img'):
   for att in ('src','data-src','data-lazy-src'):
    v=z.get(att,'')
    if v and not v.startswith('data:') and not v.endswith('.svg'):
     absolute=urllib.parse.urljoin(r.url,v)
     if not any(p['url']==absolute for p in imgs):imgs.append({'url':absolute,'alt':(z.get('alt') or z.get('title')or'')[:100]})
  for v in re.findall(r'(?:https?:)?//[^\s\"\']+?\.(?:jpg|jpeg|webp|png)(?:\?[^\s\"\']*)?',r.text,re.I):
   if len(v)>300:continue
   v=v if v.startswith('http') else 'https:'+v
   if not any(p['url']==v for p in imgs):imgs.append({'url':v,'alt':'inline-url'})
  links=[{'url':urllib.parse.urljoin(r.url,a.get('href','')),'text':a.get_text(' ',strip=True)[:100]}
   for a in soup.find_all('a',href=True) if any(z in a.get_text(' ',strip=True).lower() for z in ['ft crew','ft diesel','serie m','hiace','cargo van','ignite30','emkoo'])]
  return k,{'status':r.status_code,'url':r.url,'images':imgs[:230],'links':links[:30],'title':soup.title.get_text(' ',strip=True) if soup.title else ''}
 except Exception as e:return k,{'error':str(e),'url':u,'images':[]}
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
 res=dict(pool.map(lambda x:extract(*x),URLs.items()))
for k,x in res.items():
 print('PAGE',k,x.get('status','ERR'),len(x['images']),x.get('error',''),flush=True)
 print('TOP',' | '.join(y['alt'][:26]+':'+y['url'].split('/')[-1][:55] for y in x['images'][:14]),flush=True)
 print('LINKS',' | '.join(z['text'][:25]+':'+z['url'][:60]for z in x.get('links',[])[:8]),flush=True)
(D/'official-batch10-discovery.json').write_text(json.dumps(res,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
