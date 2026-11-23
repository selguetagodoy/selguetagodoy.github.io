#!/usr/bin/env python3
"""RINDELAB gap5: image review selection, verified CC licenses, local JPEG and provenance."""
from pathlib import Path
import requests,json,re,unicodedata,html,hashlib,io,time
from PIL import Image,ImageOps
R=Path(__file__).resolve().parents[1];D=R/'rindelab/data';IMG=R/'rindelab/images/commons';JS=R/'rindelab/v2-photos.js'
J=json.loads((D/'commons-gap5-discovery-20261122.json').read_text(encoding='utf8'))['models']
H={'User-Agent':'RindeLabPhotoVerification/2.1 (https://selguetagodoy.github.io/rindelab/)'}
# Curated from 19-image contact audit. Excludes wrong Chery 7 for Tiggo 2/3, generic JCW trim,
# cargo Ford Transit Custom for Transit full-size, and unverified electrifications.
SELECT={
 'Ford|Transit Custom Furgon':1,
 'RAM|1000 Pick UP':0,
 'Mercedes-Benz|Vito Minibus':0,
 'Fuso|Canter 515':2,
 'Kia|Frontier II':0,
 'Soueast|S09':0,
 'Baic|X7':1,
 'JAC|Refine Pasajeros':0,
 'BMW|Serie 2':1,
 'BMW|Serie 4':0,
 'Dongfeng|L7':0,
 'Omoda|C5 SHS-H':0,
 'Soueast|S06':1,
 'Suzuki|alto':1
}
TECH={'Dongfeng|L7':'PHEV','Omoda|C5 SHS-H':'HEV'}
ALIASES={'RAM|1000 Pick UP':'Fiat Toro pickup (same family; not a version guarantee)',
 'Kia|Frontier II':'Kia Bongo K2500 / Frontier II family reference',
 'JAC|Refine Pasajeros':'JAC Refine M4 passenger van family reference',
 'Soueast|S06':'Jetour Dashing / Soueast S06 family reference',
 'Soueast|S09':'Soueast S09 reference'}
def clean(t):return re.sub(r'\s+',' ',re.sub('<[^>]*>','',html.unescape(str(t or '')))).strip()
def slug(t):return re.sub(r'[^a-z0-9]+','-',unicodedata.normalize('NFKD',t).encode('ascii','ignore').decode().lower()).strip('-')
def pat(t):return r'\b'+r'[\s,_-]+'.join(re.escape(part) for part in re.split(r'[\s,_-]+',t))+r'(?=$|[^A-Za-z0-9])'
def meta(title):
 for i in range(3):
  try:
   r=requests.get('https://commons.wikimedia.org/w/api.php',params={'action':'query','prop':'imageinfo','titles':title,'iiprop':'url|extmetadata|size','iiurlwidth':960,'format':'json','formatversion':2},headers=H,timeout=27);r.raise_for_status()
   return r.json()['query']['pages'][0]['imageinfo'][0]
  except Exception:
   if i==2:raise
   time.sleep(i+1)
manifest={'origin':'Wikimedia Commons licensed images (visual and manual curation)','searched':46,'missingBefore':96,'photos':[],
 'exclusions':['Chery Tiggo 7 is not Tiggo 2/3','Ford Transit Custom is not full-size Transit','Mini JCW Trim not proof of JCW EV','Foton electric TruckMate not Foton TM ICE','RAM V700 City Fiat Fiorino attribution pending model validation']}
IMG.mkdir(parents=True,exist_ok=True)
for n,(key,idx) in enumerate(SELECT.items(),1):
 brand,family=key.split('|',1);title=J[key]['titles'][idx]
 m=meta(title);e=m.get('extmetadata',{})
 license=clean(e.get('LicenseShortName',{}).get('value'));author=clean(e.get('Artist',{}).get('value'))
 url=clean(e.get('LicenseUrl',{}).get('value')).replace('http://','https://')
 if not re.fullmatch(r'CC0|CC BY(?:-SA)? [234]\.0(?: [a-z]{2})?',license,re.I) or not author or not url.startswith('https://creativecommons.org/'):
  raise RuntimeError('Rights insufficient '+key+' '+license)
 data=requests.get(m.get('thumburl') or m['url'],headers=H,timeout=35);data.raise_for_status()
 img=ImageOps.exif_transpose(Image.open(io.BytesIO(data.content))).convert('RGB');img.thumbnail((960,960))
 fn=f'rindelab-{slug(brand)}-{slug(family)}-commons-gap5-20261122.jpg';dest=IMG/fn
 img.save(dest,'JPEG',quality=83,optimize=True,progressive=True);b=dest.read_bytes()
 assert b[:2]==bytes([255,216]) and 12000<len(b)<1200000
 row={'brand':brand,'family':family,'pattern':pat(family),'from':'2020','to':'2027',
 'model':ALIASES.get(key,brand+' '+family+' (fotografía referencial de generación)'),
 'author':author,'license':license,'licenseUrl':url,'source':'https://commons.wikimedia.org/wiki/'+title.replace(' ','_'),
 'file':title.removeprefix('File:'),'localSrc':'./images/commons/'+fn,'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
 if key in TECH:row['tech']=TECH[key]
 manifest['photos'].append(row)
 print(n,key,license,len(b),flush=True)
(D/'commons-gap5-20261122.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
js=JS.read_text(encoding='utf8');marker='const entries=localEntries.concat('
assert marker in js and 'const licensedCommonsGap520261122' not in js
js=js.replace(marker,'const licensedCommonsGap520261122='+json.dumps(manifest['photos'],ensure_ascii=False,indent=2)+';\n'+marker,1)
old='licensedCommonsGap420261122).map(';assert old in js
js=js.replace(old,'licensedCommonsGap420261122,licensedCommonsGap520261122).map(',1)
JS.write_text(js,encoding='utf8')
print('IMPORTED',len(manifest['photos']))
