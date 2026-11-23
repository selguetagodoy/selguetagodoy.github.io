import requests,bs4,re,urllib.parse,concurrent.futures,json,pathlib
R=pathlib.Path(__file__).resolve().parents[1];D=R/'rindelab/data'
urls={
'RAM|ram2500':'https://www.ram.com/cl/ram-2500.html',
'RAM|2500 CD':'https://www.ram.com/cl/ram-2500.html',
'Landking|LK8 EV':'https://www.landking.cl/content/landking/es/home/modelos/camiones-electricos/lk8-ev.html',
'Gac|Emkoo':'https://gacmotor.cl/modelos/emkoo-hibrido/',
'Chery|Tiggo 2 Pro Max':'https://chery.cl/tiggo-2-pro-max/',
'Karry|Q22 Cabina Simple':'https://karrychile.cl/',
'Karry|Q22 Cargo BOX':'https://karrychile.cl/',
'Karry|Q51 Cabina Simple':'https://karrychile.cl/',
'Karry|Q52 Cabina Doble':'https://karrychile.cl/',
'Kyc|T3 Gran Mamut':'https://www.autotattersall.cl/kyc/gran%20mamut/1287157',
'Mini|JCW Eléctrico':'https://www.mini.cl/electric/descubre-los-modelos',
'Fuso|Canter 718':'https://www.kaufmann.cl/camiones/modelos',
'Fuso|Canter 918':'https://www.kaufmann.cl/camiones/modelos',
}
h={'User-Agent':'Mozilla/5.0'}
def job(k,u):
 try:
  r=requests.get(u,timeout=15,headers=h)
  s=bs4.BeautifulSoup(r.text,'html.parser')
  out=[]
  for m in s.find_all('meta',property='og:image'):
   if m.get('content'):out.append({'url':urllib.parse.urljoin(r.url,m.get('content')),'alt':'og'})
  for img in s.find_all('img'):
   for att in ('data-src','data-lazy-src','src'):
    v=img.get(att,'')
    if v and not v.startswith('data:') and not v.lower().endswith('.svg'):
     u1=urllib.parse.urljoin(r.url,v)
     if not any(x['url']==u1 for x in out):out.append({'url':u1,'alt':(img.get('alt') or img.get('title') or '')[:100]})
  out=out[:130]
  return k,{'status':r.status_code,'url':r.url,'images':out,'title':s.title.get_text(' ',strip=True) if s.title else '', 'links':[
    {'text':a.get_text(' ',strip=True)[:70],'url':urllib.parse.urljoin(r.url,a.get('href',''))}
    for a in s.select('a[href]') if any(q in a.get_text(' ',strip=True).lower() for q in ['q22','q51','q52','2500','emkoo','chery','canter','t3','gran mamut'])][:40]}
 except Exception as e:return k,{'error':str(e),'images':[]}
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as p:
 res=dict(p.map(lambda x:job(*x),urls.items()))
for k,x in res.items():
 print('SITE',k,x.get('status'),len(x['images']),x.get('error',''),flush=True)
 print('TOP',' | '.join(str(a['alt'])[:30]+' '+a['url'].split('/')[-1][:65] for a in x['images'][:10]),flush=True)
D.joinpath('official-batch8-discovery.json').write_text(json.dumps(res,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
