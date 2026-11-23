import requests,bs4,re,json,urllib.parse,pathlib,concurrent.futures
R=pathlib.Path(__file__).resolve().parents[1];D=R/'rindelab/data'
P={
'Karry|Q22 Cabina Simple':[
 'https://www.autocosmos.cl/catalogo/2025/karry/q22/13l/179319',
 'https://karry.danielachondo.cl/karry-q22-cabina-simple/',
 'https://salfasur.cl/karry/modelo/q22-cabina-simple'],
'Karry|Q51 Cabina Simple':[
 'https://www.autocosmos.cl/catalogo/2025/karry/q51/16l/179325',
 'https://www.autocosmos.cl/catalogo/vigente/karry/q51',
 'https://autosummit.cl/karry'],
'Fuso|Canter 718':[
 'https://www.fuso.com.au/range/canter/718/wide-cab/',
 'https://www.fuso.com.au/range/canter/715/standard-cab/',
 'https://www.fuso.com.au/range/canter/',
 'https://www.fuso.cl/camiones-canter-718'],
'BYD|Yuan Pro DM-i':[
 'https://prod.byd.com/cl/yuan-pro-dmi',
 'https://www.byd.com/cl/yuan-pro-dmi',
 'https://cualautocompro.cl/byd/yuan-pro-dmi/',
 'https://galerias.autocosmos.cl/2026/06/23/byd-yuan-pro-dm-i---lanzamiento-en-chile']
}
H={'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/127.0 Safari/537.36'}
def read(inp):
 k,u=inp
 try:
  r=requests.get(u,headers=H,timeout=20)
  so=bs4.BeautifulSoup(r.text,'html.parser');imgs=[];seen=set()
  for z in so.find_all('meta'):
   if z.get('property') in ('og:image','twitter:image') or z.get('name') in ('twitter:image',):
    url=z.get('content','')
    if url and url not in seen:seen.add(url);imgs.append({'url':urllib.parse.urljoin(r.url,url),'alt':'meta'})
  for x in so.find_all('img'):
   alt=(x.get('alt') or x.get('title') or '')[:130]
   for att in ('data-src','data-lazy-src','src','data-original','srcset'):
    v=x.get(att,'')
    if not v or v.startswith('data:'):continue
    if att=='srcset':v=v.split(',')[0].split(' ')[0]
    url=urllib.parse.urljoin(r.url,v)
    if url not in seen and not url.lower().endswith(('.svg','.gif')):
     seen.add(url);imgs.append({'url':url,'alt':alt})
  for url in re.findall(r'https?://[^\s\"\'<>\\]+?\.(?:webp|png|jpg|jpeg)(?:\?[^\s\"\'<>\\]*)?',r.text,re.I):
   url=bs4.BeautifulSoup(url,'html.parser').get_text()
   if len(url)<400 and url not in seen:seen.add(url);imgs.append({'url':url,'alt':'inline-url'})
  return k,u,{'status':r.status_code,'finalUrl':r.url,'title':so.title.get_text(' ',strip=True) if so.title else '', 'images':imgs[:175]}
 except Exception as ex:return k,u,{'error':str(ex),'images':[]}
items=[(k,u) for k,L in P.items() for u in L]
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:results=list(pool.map(read,items))
rows={k:[] for k in P}
for k,u,x in results:
 rows[k].append({'page':u,**x})
 print('PAGE',k,x.get('status'),len(x['images']),x.get('error','')[:75])
 for i,y in enumerate(x['images'][:35]):
  if i<12 or any(v in (y['url']+' '+y['alt']).lower() for v in ('yuan','q51','q22','718','canter','dm-i','dmi','karry')):
   print('   ',i,y['alt'][:35],y['url'][:155])
(D/'photo27-gapsearch-20261122.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
