#!/usr/bin/env python3
"""RINDELAB curated Commons gap batch 3 (22 Nov 2026): audited filenames and local JPEG derivatives.
No guesses about technical variants. Uses photographer/license returned by Wikimedia Commons API.
"""
import json, pathlib, re, hashlib, requests, html, io, unicodedata, time
from PIL import Image, ImageOps
ROOT=pathlib.Path(__file__).resolve().parents[1]
DATA=ROOT/'rindelab/data'
IMAGES=ROOT/'rindelab/images/commons'
JS=ROOT/'rindelab/v2-photos.js'
CAND=json.loads((DATA/'commons-gap3-candidates-20261122.json').read_text(encoding='utf8'))
UA={'User-Agent':'RindeLabImageAttribution/1.0 (https://selguetagodoy.github.io/rindelab/; photo audit)'}
# Explicitly reviewed via contact sheets: no interiors, wrong bodies, LWB-only or emergency vehicles.
FOCUS=[
 ('bmw-m135i',0,'BMW','M135i',r'\bm135i\b','2024','2027'),
 ('bmw-4-convertible2',0,'BMW','Serie 4 Convertible',r'\bserie[\s-]*4[\s-]+convertible\b','2021','2027'),
 ('bmw-serie4-grancoupe',0,'BMW','Serie 4 Gran Coupé',r'\bserie[\s-]*4[\s-]+gran[\s-]+coup[eé](?=$|[^A-Za-z0-9])','2022','2027'),
 ('bmw-5-g60-2',0,'BMW','Serie 5',r'\bserie[\s-]*5\b','2024','2027'),
 ('mercedes-a-sedan2',0,'Mercedes-Benz','Clase A Sedan',r'\bclase[\s-]+a[\s-]+sedan\b','2023','2027'),
 ('mercedes-c',7,'Mercedes-Benz','Clase C',r'\bclase[\s-]+c(?=$|[^A-Za-z0-9])','2022','2027'),
 ('mercedes-e',4,'Mercedes-Benz','Clase E',r'\bclase[\s-]+e(?=$|[^A-Za-z0-9])','2024','2027'),
 ('mercedes-s',1,'Mercedes-Benz','Clase S',r'\bclase[\s-]+s(?=$|[^A-Za-z0-9])','2021','2027'),
 ('mercedes-v',1,'Mercedes-Benz','Clase V',r'\bclase[\s-]+v(?=$|[^A-Za-z0-9])','2021','2027'),
 ('chevy-traverse',0,'Chevrolet','Traverse',r'\btraverse\b','2024','2027'),
 ('ford-expedition',6,'Ford','Expedition',r'\bexpedition\b','2025','2027'),
 ('ford-transit',3,'Ford','Transit Minibus',r'\btransit[\s-]+minibus\b','2023','2027'),
 ('fiat-ducato',1,'Fiat','Ducato',r'\bducato\b','2023','2027'),
 ('lexus-lx2',0,'Lexus','LX',r'\blx(?=$|[^A-Za-z0-9])','2022','2027'),
 ('toyota-corolla-sedan',7,'Toyota','Corolla Sedán',r'\bcorolla[\s-]+sed[aá]n\b','2020','2026'),
 ('seat-ateca',2,'Seat','Ateca',r'\bateca\b','2020','2027'),
 ('mg-rx5',0,'MG','RX5',r'\brx5\b','2023','2027'),
 ('chevy-sail-sedan',0,'Chevrolet','Sail Sedan',r'\bsail[\s-]+sedan\b','2022','2027'),
 ('vw-saveiro2',1,'Volkswagen','Saveiro CS',r'\bsaveiro[\s-]+cs\b','2023','2027'),
]
def slug(s):
 return re.sub(r'[^a-z0-9]+','-',unicodedata.normalize('NFKD',s).encode('ascii','ignore').decode().lower()).strip('-')
def plain(s):return re.sub(r'\s+',' ',re.sub('<[^>]+>','',html.unescape(s or ''))).strip()
session=requests.Session();session.headers.update(UA);IMAGES.mkdir(exist_ok=True)
manifest={'origin':'Wikimedia Commons search + individual imageinfo license revalidation','searched':len(CAND),'reviewedVisual':True,'missingBefore':185,'photos':[],'rejected':['BMW 8 Series Gran Coupe is not BMW Serie 8 Coupe','Lexus LX interior photo','Mercedes Vito ambulance','Ford Explorer EV for internal combustion Explorer','Toyota Hiace query returned Foton Commuter','Mazda 6 query returned Mazda 2/3','old Suzuki Alto body','LWB BMW/Mercedes for standard Chilean models','Porsche Cayenne ICE imagery for Cayenne EV']}
def getmeta(title):
 r=session.get('https://commons.wikimedia.org/w/api.php',params={'action':'query','prop':'imageinfo','titles':title,'iiprop':'url|extmetadata|size','iiurlwidth':960,'format':'json','formatversion':2},timeout=25)
 r.raise_for_status();return r.json()['query']['pages'][0]['imageinfo'][0]
for key,idx,brand,family,pattern,first,last in FOCUS:
 c=CAND[key]['candidates'][idx]
 if 'error' in c:raise RuntimeError(c['error'])
 meta=getmeta(c['title'])
 x=meta['extmetadata'];license=plain(x.get('LicenseShortName',{}).get('value',''))
 artist=plain(x.get('Artist',{}).get('value',''))
 licenseUrl=x.get('LicenseUrl',{}).get('value','').replace('http://','https://')
 if not re.fullmatch(r'CC0|CC BY(?:-SA)? [234]\.0(?: [a-z]{2})?',license,re.I) or not artist or not licenseUrl.startswith('https://creativecommons.org/'):
  raise ValueError('Rights insufficient for '+c['title']+': '+license)
 photo=session.get(meta.get('thumburl') or meta['url'],timeout=35);photo.raise_for_status()
 im=ImageOps.exif_transpose(Image.open(io.BytesIO(photo.content))).convert('RGB')
 im.thumbnail((960,960))
 f='rindelab-'+slug(brand)+'-'+slug(family)+'-commons-gap3-20261122.jpg'
 destination=IMAGES/f
 im.save(destination,format='JPEG',quality=83,optimize=True,progressive=True)
 b=destination.read_bytes()
 assert len(b)>12000 and len(b)<1_200_000 and b[:2]==b'\xff\xd8'
 result={'brand':brand,'family':family,'pattern':pattern,'from':first,'to':last,'file':c['title'].removeprefix('File:'),'model':brand+' '+family+' (foto referencial de generación)','author':artist,'license':license,'licenseUrl':licenseUrl,'source':c['source'],'localSrc':'./images/commons/'+f,'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
 manifest['photos'].append(result)
 print('OK',brand,family,len(b),license,flush=True)
 (DATA/'commons-gap3-20261122.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
js=JS.read_text(encoding='utf8')
needle='const entries=localEntries.concat('
assert needle in js and 'const licensedCommonsGap320261122' not in js
entries=json.dumps(manifest['photos'],ensure_ascii=False,indent=2)
js=js.replace(needle,'const licensedCommonsGap320261122='+entries+';\n'+needle,1)
old='licensedCommonsMassBatch220261122).map('
assert old in js
js=js.replace(old,'licensedCommonsMassBatch220261122,licensedCommonsGap320261122).map(',1)
JS.write_text(js,encoding='utf8')
print('COMPLETE '+str(len(manifest['photos']))+' photos; published metadata and local files')
