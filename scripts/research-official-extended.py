import requests,bs4,urllib.parse,json,pathlib,io,concurrent.futures,re,html,sys,urllib3
from PIL import Image,ImageOps,ImageDraw
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
ROOT=pathlib.Path(__file__).resolve().parents[1];D=ROOT/'rindelab/data'
H={'User-Agent':'Mozilla/5.0 (compatible; RindelabModelImageAudit/1.0)'}
T={
'Landking|LK 1016':'https://www.landking.cl/content/landking/es/home/modelos/camiones/lk-1016.html',
'Landking|LK 614':'https://www.landking.cl/content/landking/es/home/modelos/camiones/lk-614.html',
'JMC|All New Vigus Pro':'https://www.jmcchile.cl/modelos/all-new-vigus-pro/',
'JMC|Vigus EV':'https://www.jmcchile.cl/modelos/vigus-ev/',
'JMC|EV3':'https://www.jmcchile.cl/modelos/ev3/',
'Shineray|T32 CD':'https://www.shineraychile.cl/modelos/vehiculos-comerciales/shineray-t32-con-a-c/general/',
'Shineray|T50 CS':'https://www.shineraychile.cl/modelos/vehiculos-comerciales/shineray-t50-con-a-c/general/',
'Shineray|T52 CD':'https://www.shineraychile.cl/modelos/vehiculos-comerciales/shineray-t52-con-a-c/general/',
'Shineray|X30 con A/C':'https://www.shineraychile.cl/modelos/vehiculos-comerciales/shineray-x30-con-a-c/general/',
'Shineray|T30 CS':'https://www.shineraychile.cl/modelos/vehiculos-comerciales/shineray-t30-con-a-c/general/',
'Fuso|Canter 718':'https://www.fuso.cl/camiones-canter-718',
'Fuso|Canter 918':'https://www.fuso.cl/camiones-canter-918',
}
def parse(k,u):
 try:
  r=requests.get(u,headers=H,timeout=15,verify=('jmcchile.cl' not in u))
  soup=bs4.BeautifulSoup(r.text,'html.parser')
  items=[]
  for z in soup.find_all('meta',property=['og:image','twitter:image']):
   v=z.get('content') or ''
   if v:items.append({'url':urllib.parse.urljoin(r.url,v),'alt':z.get('property','')})
  for z in soup.find_all('img'):
   alt=(z.get('alt') or z.get('title') or '').strip()
   for prop in ('data-src','data-lazy-src','src'):
    v=z.get(prop)or''
    if v and not v.startswith('data:') and not v.lower().endswith('.svg'):items.append({'url':urllib.parse.urljoin(r.url,v),'alt':alt,'tag':prop})
  for x in re.findall(r'(?:https?:)?//[^\s"\']+?\.(?:png|jpg|jpeg|webp)(?:\?[^\s"\']*)?',r.text,re.I):
   if len(x)<300:items.append({'url':x if x.startswith('http')else 'https:'+x,'alt':'inline-url'})
  filt=[];seen=set()
  for item in items:
   if item['url'] in seen:continue
   seen.add(item['url'])
   if not any(x in item['url'].lower() for x in ('.jpg','.jpeg','.png','.webp','/media/','image.')):continue
   filt.append(item)
  return k,{'status':r.status_code,'page':r.url,'title':soup.title.get_text(' ',strip=True)[:80] if soup.title else '', 'candidates':filt[:180]}
 except Exception as ex:return k,{'error':str(ex),'page':u,'candidates':[]}
results={}
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as p:
 for k,v in p.map(lambda t:parse(*t),T.items()):
  results[k]=v;print(k,v.get('status'),len(v['candidates']),v.get('error',''),flush=True)
(D/'official-extended-candidates-20261122.json').write_text(json.dumps(results,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
for k,v in results.items():
 print('TOP',k,' | '.join(x['alt'][:34]+':'+x['url'].split('/')[-1][:65] for x in v['candidates'][:12]),flush=True)
