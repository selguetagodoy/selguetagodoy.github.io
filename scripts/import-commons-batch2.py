#!/usr/bin/env python3
"""Photographs batch, explicitly selected Commons titles, metadata, SHA256 and license audit."""
import requests,json,re,html,hashlib,time,concurrent.futures
from pathlib import Path
from urllib.parse import quote
from bs4 import BeautifulSoup
root=Path(__file__).resolve().parent.parent
dir=root/'rindelab/images/commons'
targets=[
 {'brand':'Citroën','family':'Berlingo','pattern':r'\bBERLINGO\b','file':'2024 Citroën Berlingo III DSC 7212.jpg','from':'2020','to':'2027'},
 {'brand':'Citroën','family':'C3 Aircross','pattern':r'\bC3\s+AIRCROSS\b','file':'Citroën C3 Aircross (2024) DSC 9300.jpg','from':'2024','to':'2027'},
 {'brand':'Citroën','family':'C5 Aircross','pattern':r'\bC5\s+AIRCROSS\b','file':'2024 Citroen C5 Aircross E-Series PureTech - 1199cc 1.2 (136PS) Petrol - Platinum Grey - 02-2025, Front.jpg','from':'2022','to':'2026'},
 {'brand':'Fiat','family':'Fastback','pattern':r'\bFASTBACK\b','file':'2023 Fiat Fastback (Colombia) front view.png','from':'2022','to':'2027'},
 {'brand':'Fiat','family':'Pulse','pattern':r'\bPULSE\b','file':'2024 Fiat Pulse 1.0 Turbo 200 Audace (front).jpg','from':'2022','to':'2027'},
 {'brand':'Hyundai','family':'Staria','pattern':r'\bSTARIA\b','file':'Hyundai Staria Leonberg 2022 1X7A0432.jpg','from':'2021','to':'2027'},
 {'brand':'Jeep','family':'Gladiator','pattern':r'\bGLADIATOR\b','file':'Jeep Gladiator (JT) 1X7A0017.jpg','from':'2020','to':'2027'},
 {'brand':'Lexus','family':'LBX','pattern':r'\bLBX\b','file':'Lexus LBX Auto Zuerich 2023 1X7A1223.jpg','from':'2023','to':'2027'},
 {'brand':'Lexus','family':'NX','pattern':r'\bNX\b','file':'Lexus NX (AZ20) Overtrail Auto Zuerich 2024 DSC 6482.jpg','from':'2022','to':'2027'},
 {'brand':'Lexus','family':'RX','pattern':r'\bRX\b','file':'Lexus RX 350h (AALH10-AALH15) IMG 8880.jpg','from':'2023','to':'2027'},
 {'brand':'Lexus','family':'RZ','pattern':r'\bRZ\b','tech':'EV','file':'Lexus RZ 450e (XEBM15) IMG 0680.jpg','from':'2023','to':'2027'},
 {'brand':'MG','family':'Cyberster','pattern':r'\bCYBERSTER\b','tech':'EV','file':'MG Cyberster Auto Zuerich 2024 DSC 6356.jpg','from':'2024','to':'2027'},
 {'brand':'Nissan','family':'Qashqai','pattern':r'\bQASHQAI\b','file':'2025 Nissan Qashqai Ti-L facelift front.jpg','from':'2025','to':'2027'},
 {'brand':'Opel','family':'Mokka','pattern':r'\bMOKKA\b','file':'2025 Opel Mokka-e Auto Zuerich 2024 DSC 6710.jpg','from':'2025','to':'2027'},
 {'brand':'Peugeot','family':'Expert','pattern':r'\bEXPERT\b','file':'2024 Peugeot Expert III IMG 2660.jpg','from':'2020','to':'2027'},
 {'brand':'Volkswagen','family':'Amarok','pattern':r'\bAMAROK\b','file':'Volkswagen Amarok Mk2 IMG 1848.jpg','from':'2023','to':'2027'},
 {'brand':'Toyota','family':'Fortuner','pattern':r'\bFORTUNER\b','file':'Toyota Fortuner 4x2 V 2024.jpg','from':'2020','to':'2027'},
 {'brand':'Hyundai','family':'Inster','pattern':r'\bINSTER\b','tech':'EV','file':'Hyundai Inster IMG 5249.jpg','from':'2025','to':'2027'},
 {'brand':'MG','family':'ZS new generation','pattern':r'\b(?:ALL\s+NEW\s+)?(?:MG\s+)?ZS\b','file':'MG ZS (crossover, second generation) Automesse Ludwigsburg 2025 DSC 2618.jpg','from':'2025','to':'2027'}
]
heads={'User-Agent':'RINDELAB/1.0 licensed image documentation, CC attribution'}
namekeys=['File:'+t['file'] for t in targets]
params={'action':'query','titles':'|'.join(namekeys),'prop':'imageinfo','iiprop':'url|extmetadata','iiurlwidth':720,'format':'json'}
for attempt in range(4):
 try:
  r=requests.get('https://commons.wikimedia.org/w/api.php',params=params,headers=heads,timeout=35);r.raise_for_status();data=r.json();break
 except Exception as err:
  if attempt==3:raise
  time.sleep(3*(attempt+1))
pages={v['title']:v for v in data.get('query',{}).get('pages',{}).values()}
def obtain(t):
 p=pages.get('File:'+t['file'])
 if not p or 'imageinfo' not in p:raise ValueError('Missing Commons file: '+t['file'])
 info=p['imageinfo'][0];meta=info.get('extmetadata',{})
 license=meta.get('LicenseShortName',{}).get('value','')
 if not license.startswith(('CC BY','CC0')):raise ValueError('Unapproved license '+t['file']+' '+license)
 author=BeautifulSoup(html.unescape(meta.get('Artist',{}).get('value','')),'html.parser').get_text(' ',strip=True)
 lic=meta.get('LicenseUrl',{}).get('value','').replace('http://creativecommons.org/','https://creativecommons.org/')
 if not author or not lic.startswith('https://creativecommons.org/'):raise ValueError('Missing attribution '+t['file'])
 link=info.get('thumburl','')
 if not link.startswith('https://'):raise ValueError('Missing secure thumbnail')
 return t,info,license,author,lic,link
metadata=[obtain(t) for t in targets]
def download(row):
 t,info,license,author,lic,url=row
 name='rindelab-'+re.sub(r'[^a-z0-9]+','-',(t['brand']+'-'+t['family']).lower()).strip('-')+'-commons-20261021.'
 ext='png' if t['file'].lower().endswith('.png') else 'jpg'
 local=name+ext
 out=dir/local
 for attempt in range(4):
  try:
   r=requests.get(url,headers=heads,timeout=35)
   r.raise_for_status();raw=r.content
   if len(raw)<18000 or (not raw.startswith(b'\xff\xd8') and not raw.startswith(b'\x89PNG\r\n\x1a\n')):raise ValueError('Invalid image data')
   out.write_bytes(raw)
   entry={k:v for k,v in t.items() if k!='family'}
   entry.update({'model':t['brand']+' '+t['family']+' (referencia, no versión comercial)','author':author,'license':license,
    'localSrc':'./images/commons/'+local,'source':info['descriptionurl'],'licenseUrl':lic,
    'sha256':hashlib.sha256(raw).hexdigest(),'bytes':len(raw)})
   return entry
  except Exception:
   if attempt==3:raise
   time.sleep((attempt+1)*1.5)
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
 entries=list(pool.map(download,metadata))
assert len(entries)==len(targets)
js=root/'rindelab/v2-photos.js'
source=js.read_text(encoding='utf8')
tag='const licenseUrls={'
if 'additionalLicensed20261021B' not in source:
    assert source.count(tag)==1
    prefix='// Segundo lote de fotos verificadas Commons: modelo referencial, no acabado homologado.'
    source=source.replace(tag,prefix+chr(10)+'const additionalLicensed20261021B='+json.dumps(entries,ensure_ascii=False,indent=2)+';'+chr(10)+tag)
    old='licensed.concat(additionalLicensed20261021).map('
    assert source.count(old)==1
    source=source.replace(old,'licensed.concat(additionalLicensed20261021,additionalLicensed20261021B).map(')
    js.write_text(source,encoding='utf8')
manifest=root/'rindelab/data/photo-batch2-20261021.json'
manifest.write_text(json.dumps({'schemaVersion':1,'photos':entries},ensure_ascii=False,indent=2)+chr(10),encoding='utf8')
print('IMAGES VERIFIED AND SAVED',len(entries),'TOTAL LIBRARY',205+len(entries),'BYTES',sum(x['bytes'] for x in entries))
