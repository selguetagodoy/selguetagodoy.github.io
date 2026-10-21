#!/usr/bin/env python3
"""Snapshot editorial de modelos publicados como 0 km por concesionarios chilenos.
No convierte precios bonificados en precios de lista, no infiere energía ni stock.
Dependencies: python -m pip install requests beautifulsoup4
"""
import json, re, sys, time, datetime
from pathlib import Path
from urllib.parse import urlparse
import requests
from bs4 import BeautifulSoup

ROOT=Path(__file__).resolve().parent.parent
DATE=datetime.date.today().isoformat() if any(a.startswith('--output=') for a in sys.argv) else '2026-10-21'
sess=requests.Session()
sess.headers.update({'User-Agent':'RINDELAB/1.0 (+catalog quality audit; public source)', 'Accept-Language':'es-CL,es;q=0.9'})
result=[]
errors=[]

def fetch(url):
    response=sess.get(url,timeout=25)
    response.raise_for_status()
    return BeautifulSoup(response.text,'html.parser')
def pesos(s):
    m=re.search(r'\$\s*([\d.]{6,})',s or '')
    return int(m.group(1).replace('.','')) if m else None
def clean(s):
    return re.sub(r'\s+',' ',str(s or '')).strip()
def norm(s):
    import unicodedata
    s=unicodedata.normalize('NFD',str(s))
    return re.sub(r'[^a-z0-9]','', ''.join(x for x in s if not unicodedata.combining(x)).lower())
def row(brand,family,source,network,technology=None,listPriceClp=None,taxIncluded=None):
    if not (brand and family and source.startswith('https://')):
        return
    if not source.startswith(('https://www.pompeyo.cl/producto/','https://www.salazarisrael.cl/marcas/')):
        return
    result.append({'brand':clean(brand),'family':clean(family),'source':source,'retailer':network,'observedAt':DATE,'listing':'new','technology':technology,'listPriceClp':listPriceClp,'taxIncluded':taxIncluded})

# Pompeyo: stock publicado en la categoría nuevos, etiqueta de precio de lista exacta por familia.
base='https://www.pompeyo.cl/categoria-producto/autos/nuevos/'
for page in range(1,7):
    url=base if page==1 else base+'page/'+str(page)+'/'
    try:s=fetch(url)
    except Exception as e:errors.append(f'Pompeyo page {page}: {e}');continue
    cards=s.select('li.pnc-card, .pnc-card')
    seen=set()
    for p in cards:
        brand=p.select_one('.pnc-card__brand')
        title=p.select_one('h3.pnc-card__title')
        link=p.select_one('a[href*="/producto/"]')
        if not brand or not title or not link:continue
        src=link.get('href','').split('?')[0].split('#')[0]
        if src in seen:continue
        seen.add(src)
        label=clean(p.select_one('.pnc-card__energy').get_text(' ',strip=True) if p.select_one('.pnc-card__energy') else '')
        # «Híbrido» a secas NO acredita HEV frente a PHEV/REEV.
        tech={'electrico':'EV','microhibrido':'MHEV','hibrido enchufable':'PHEV','diesel':'Diésel','bencina':'Bencina'}
        # Do not classify ambiguous labels.
        inferred=next((v for k,v in tech.items() if norm(label)==norm(k)),None)
        if norm(label)==norm('hibrido enchufable'):inferred='PHEV'
        priceLabel=p.select_one('.pnc-card__list-price')
        raw=clean(priceLabel.get_text(' ',strip=True)) if priceLabel else ''
        price=pesos(raw) if re.search(r'precio\s+lista',raw,re.I) else None
        tax=False if '+ IVA' in raw.upper() else True if price else None
        row(brand.get_text(' ',strip=True),title.get_text(' ',strip=True),src,'Pompeyo Carrasco',inferred,price,tax)
    print('Pompeyo page',page,'cards',len(seen))

# Salazar Israel: publica página separada de 0 km con JSON-LD ItemList y URL por modelo.
# Valores "Desde" contienen bonos; no se trasladan a una cifra comercial no promocional.
base='https://www.salazarisrael.cl/vehiculos/nuevo'
for page in range(1,18):
    url=base if page==1 else base+'?page='+str(page)
    try:s=fetch(url)
    except Exception as e:errors.append(f'Salazar page {page}: {e}');continue
    if not any(sc.get_text() for sc in s.find_all('script',type='application/ld+json')):
        try:time.sleep(0.5);s=fetch(url)
        except Exception as e:errors.append(f'Salazar page {page} retry: {e}');continue
    found=0
    for sc in s.find_all('script',type='application/ld+json'):
        try:data=json.loads(sc.string or sc.get_text())
        except (ValueError,TypeError):continue
        if data.get('@type')!='ItemList':continue
        for rec in data.get('itemListElement',[]):
            src=rec.get('url') or ''
            match=re.search(r'/marcas/([^/]+)/nuevo/',src)
            if not match:continue
            brand=match.group(1).replace('-',' ').strip()
            name=clean(rec.get('name',''))
            family=re.sub('^'+re.escape(brand)+r'\s+','',name,flags=re.I).strip() or name
            row(brand,family,src,'Salazar Israel')
            found+=1
    if not found:
        for attempt in range(2):
            time.sleep(0.7)
            try:retry=fetch(url)
            except Exception as e:errors.append(f'Salazar {page} retry {attempt}: {e}');continue
            for sc in retry.find_all('script',type='application/ld+json'):
                try:data=json.loads(sc.string or sc.get_text())
                except (ValueError,TypeError):continue
                if data.get('@type')!='ItemList':continue
                for rec in data.get('itemListElement',[]):
                    src=rec.get('url') or ''
                    match=re.search(r'/marcas/([^/]+)/nuevo/',src)
                    if not match:continue
                    brand=match.group(1).replace('-',' ').strip()
                    name=clean(rec.get('name',''))
                    family=re.sub('^'+re.escape(brand)+r'\s+','',name,flags=re.I).strip() or name
                    row(brand,family,src,'Salazar Israel')
                    found+=1
            if found:break
        if not found:errors.append(f'Salazar {page}: no JSON-LD items after retries')
    print('Salazar page',page,'models',found)

# Deduplicate same listing URL; preserve source distinct across retailers.
byURL={}
for p in result:
    byURL[p['source']]=p
out=sorted(byURL.values(),key=lambda p:(p['brand'].casefold(),p['family'].casefold(),p['retailer']))
audit={'schemaVersion':1,'observedAt':DATE,'sources':['https://www.pompeyo.cl/categoria-producto/autos/nuevos/','https://www.salazarisrael.cl/vehiculos/nuevo'],'records':out,'errors':errors}
dest=Path(next((a.split('=',1)[1] for a in sys.argv if a.startswith('--output=')),str(ROOT/'rindelab'/'data'/'dealer-new-models-20261021.json')))
if len(out)<180 or errors:
    raise SystemExit(f'INCOMPLETE: {len(out)} records errors: {errors!r} — refusing partial overwrite')
dest.write_text(json.dumps(audit,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
counts={s:sum(x['retailer']==s for x in out) for s in {x['retailer'] for x in out}}
print('SNAPSHOT WRITTEN',len(out),'records by retailer',counts,'list prices',sum(p['listPriceClp'] is not None for p in out))
