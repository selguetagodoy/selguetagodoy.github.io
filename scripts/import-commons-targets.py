#!/usr/bin/env python3
"""Incorpora fotografías Commons expresamente seleccionadas y con atribución verificada."""
import requests,json,re,html,unicodedata
from bs4 import BeautifulSoup
from pathlib import Path
root=Path(__file__).resolve().parent.parent
dest=root/'rindelab'/'images'/'commons'
index=root/'rindelab'/'v2-photos.js'
ua={'User-Agent':'RINDELAB licensed imagery audit (+ nonprofit source attribution)'}
entries=[
 {'brand':'Subaru','family':'Trailseeker','pattern':r'\b(?:ALL\s+NEW\s+)?TRAILSEEKER\b','tech':'EV','from':'2026','to':'2027','file':'Subaru Trailseeker Limited AWD (2026) (55213484063).jpg'},
 {'brand':'BYD','family':'Sealion 7','pattern':r'\bSEALION[\s-]*7\b','tech':'EV','from':'2025','to':'2027','file':'BYD Sealion 7 Performance AWD Shark Grey.jpg'},
 {'brand':'Honda','family':'ZR-V','pattern':r'\bZR[\s-]*V\b','tech':'HEV','from':'2023','to':'2027','file':'Honda ZR-V e-HEV IAA 2023 1X7A0542.jpg'},
 {'brand':'Audi','family':'Q5 Sportback','pattern':r'\bQ5\s+SPORTBACK\b','from':'2025','to':'2027','file':'Audi Q5 Sportback GU DSC 9268.jpg'},
 {'brand':'MG','family':'S5 EV','pattern':r'\b(?:MG\s*)?S5\b','tech':'EV','from':'2025','to':'2027','file':'MGS5 EV DSC 2703.jpg'}
]
def api_photo(name):
 u='https://commons.wikimedia.org/w/api.php'
 params={'action':'query','titles':'File:'+name,'prop':'imageinfo','iiprop':'url|extmetadata','iiurlwidth':720,'format':'json'}
 response=requests.get(u,params=params,headers=ua,timeout=24)
 response.raise_for_status()
 data=response.json()
 page=next(iter(data['query']['pages'].values()))
 if 'missing' in page or not page.get('imageinfo'):raise ValueError('Commons photo missing: '+name)
 info=page['imageinfo'][0];meta=info['extmetadata']
 license_name=meta.get('LicenseShortName',{}).get('value','')
 if not (license_name.startswith(('CC BY','CC0')) or license_name in ('Public domain','PD')):raise ValueError('License not eligible: '+license_name)
 if not info.get('thumburl','').startswith('https://'):raise ValueError('No https thumb')
 artist=BeautifulSoup(html.unescape(meta.get('Artist',{}).get('value','')),'html.parser').get_text(' ',strip=True)[:180]
 if not artist:raise ValueError('No attributable author')
 licurl=meta.get('LicenseUrl',{}).get('value','').replace('http://creativecommons.org/','https://creativecommons.org/')
 if not licurl.startswith('https://creativecommons.org/') and license_name!='Public domain':raise ValueError('No license URL '+licurl)
 return info,license_name,artist,licurl
photos=[]
for d in entries:
 name=d['file'];info,license_name,artist,license_url=api_photo(name)
 local='rindelab-'+re.sub(r'[^a-z0-9]+','-',(d['brand']+'-'+d['family']).lower()).strip('-')+'-licensed-20261021.jpg'
 data=requests.get(info['thumburl'],headers=ua,timeout=28)
 data.raise_for_status()
 if not data.content.startswith(b'\xff\xd8') or len(data.content)<20000:raise ValueError('not a valid JPEG thumbnail '+name)
 (dest/local).write_bytes(data.content)
 meta={k:v for k,v in d.items() if k not in ('family','file')}
 meta.update({'file':name,'model':d['brand']+' '+d['family']+' (fotografía referencial)','author':artist,'license':license_name,
  'localSrc':'./images/commons/'+local,
  'source':info.get('descriptionurl','https://commons.wikimedia.org/wiki/File:'+name.replace(' ','_')),
  'licenseUrl':license_url or 'https://creativecommons.org/publicdomain/zero/1.0/'})
 photos.append(meta)
 print('PHOTO',name,license_name,artist[:75],len(data.content))
source=index.read_text(encoding='utf-8')
marker='const licenseUrls={'
assert source.count(marker)==1
assert 'const additionalLicensed20261021=' not in source
text='// Lote de fotografías Commons de modelos nuevos; imágenes referenciales, no versiones exactas.\nconst additionalLicensed20261021='+json.dumps(photos,ensure_ascii=False,indent=2)+';\n'
source=source.replace(marker,text+marker).replace('const entries=localEntries.concat(licensed.map(','const entries=localEntries.concat(licensed.concat(additionalLicensed20261021).map(')
index.write_text(source,encoding='utf-8')
print('IMPORTED',len(photos),'NEW LIBRARY COUNT',200+len(photos))
