import json,re,requests,sys,datetime
from pathlib import Path
from bs4 import BeautifulSoup
from urllib.parse import urlparse
from concurrent.futures import ThreadPoolExecutor
root=Path(__file__).resolve().parent.parent
date=datetime.date.today().isoformat() if any(a.startswith('--output=') for a in sys.argv) else '2026-10-21'
session=requests.Session();session.headers['User-Agent']='RINDELAB catalog auditing/1.0'
def worker(page):
 url='https://www.portillo.cl/vehiculos/nuevo'+('' if page==1 else f'?page={page}')
 try:
  r=session.get(url,timeout=24);r.raise_for_status()
  s=BeautifulSoup(r.text,'html.parser')
  items=[]
  for script in s.find_all('script',type='application/ld+json'):
   try:data=json.loads(script.string or script.get_text())
   except (TypeError,ValueError):continue
   if data.get('@type')!='ItemList':continue
   for el in data.get('itemListElement',[]):
    link=el.get('url','')
    m=re.search(r'/marcas/([^/]+)/nuevo/',link)
    if not m:continue
    brand=m.group(1).replace('-',' ').strip()
    name=' '.join(el.get('name','').split())
    family=re.sub(r'^'+re.escape(brand)+r'\s+','',name,flags=re.I).strip() or name
    if not (brand and family and link.startswith('https://www.portillo.cl/marcas/')):continue
    items.append({'brand':brand,'family':family,'source':link,'retailer':'Portillo','observedAt':date,'listing':'new','technology':None,'listPriceClp':None,'taxIncluded':None})
  return page,items,None
 except Exception as err:return page,[],str(err)
rows=[];errors=[]
with ThreadPoolExecutor(max_workers=3) as ex:
 for page,items,err in sorted(ex.map(worker,range(1,11))):
  print('Portillo',page,len(items),'ERROR' if err else 'OK',err or '')
  if (page<10 and len(items)!=12) or (page==10 and not 1<=len(items)<=12):errors.append(f'page {page} {len(items)} links')
  if err:errors.append(err)
  rows.extend(items)
byurl={p['source']:p for p in rows}
out={'schemaVersion':1,'observedAt':date,'sources':['https://www.portillo.cl/vehiculos/nuevo'],'records':sorted(byurl.values(),key=lambda x:(x['brand'],x['family'])),'errors':errors}
if errors or len(byurl)<110:raise SystemExit('INCOMPLETE PORTILLO '+str(errors))
dest=Path(next((a.split('=',1)[1] for a in sys.argv if a.startswith('--output=')),str(root/'rindelab/data/dealer-portillo-20261021.json')))
dest.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print('PORTILLO RECORDS',len(byurl))
