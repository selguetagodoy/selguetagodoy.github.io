#!/usr/bin/env python3
"""RINDELAB fourth licensed Commons batch. Manual visual/model/brand curation only."""
import json,pathlib,requests,hashlib,re,unicodedata,html,io,time
from PIL import Image,ImageOps
ROOT=pathlib.Path(__file__).resolve().parents[1]
DATA=ROOT/'rindelab/data'; IMG=ROOT/'rindelab/images/commons'; JS=ROOT/'rindelab/v2-photos.js'
groups=json.loads((DATA/'commons-gap4-discovery-20261122.json').read_text(encoding='utf8'))['groups']
H={'User-Agent':'RINDELAB photo rights audit/2.0 (https://selguetagodoy.github.io/rindelab/)'}
# gid is the 1-based row in 143 remaining groups BEFORE this import.
# source_gid permits photo from search for sibling family, but curated body type must match target group.
# tech is enforced ONLY where the row explicitly specifies technology; null means family reference.
SELECTION=[
 (2,0,None,None,None), (3,0,None,r'^\s*t5\s*$',None), (12,1,None,None,None),
 (15,18,None,None,None),(16,7,None,None,None),(27,10,None,None,None),
 (31,0,None,None,None),(32,1,None,None,None),(33,0,None,None,None),
 (34,9,None,None,None),(35,2,None,None,None),(38,3,None,None,None),
 (46,0,None,None,None),(53,1,None,None,None),
 (54,1,None,r'\bgrand[\s-]*i[\s,.-]*10(?:[\s-]*ai3[\s-]*hb|[\s-]*hatchback)(?=$|[^A-Za-z0-9])',None),
 (56,0,None,None,None),(57,7,None,None,None),(59,0,None,None,None),
 (60,0,'PHEV',None,None),
 (67,0,None,None,68),
 (76,0,None,r'\bx5[\s-]+pick[\s-]*up(?:[\s-]+doble[\s-]+cabina)?(?=$|[^A-Za-z0-9])',None),
 (83,9,None,None,None),(85,9,None,None,None),(86,11,None,None,None),
 (88,0,None,None,None),(89,9,None,None,None),(92,8,None,None,None),
 (98,0,None,None,None),(108,0,None,None,None),
 (123,0,'PHEV',None,None),
 (124,0,'PHEV',r'\batto[\s-]*8[\s-]*dm[\s-]*[ip](?=$|[^A-Za-z0-9])',None),
 (127,0,'REEV',None,None),
 (129,3,'PHEV',None,None),
 (139,0,'PHEV',None,None),
 (140,0,'Bencina',None,None),
 (141,0,'EV',None,None),
 (142,1,'Bencina',None,None),
 (143,0,'EV',None,None),
 (91,9,'EV',None,92)
]
def norm(s):return unicodedata.normalize('NFKD',s).encode('ascii','ignore').decode('ascii').lower()
def slug(s):return re.sub(r'[^a-z0-9]+','-',norm(s)).strip('-')
def pattern(s):
 tok=re.split(r'[\s,_-]+',s)
 return r'\b'+r'[\s,_-]+'.join(re.escape(t) for t in tok)+r'(?=$|[^A-Za-z0-9])'
def plain(s):return re.sub(r'\s+',' ',re.sub('<[^>]*>','',html.unescape(str(s or '')))).strip()
def fetchinfo(title):
 for attempt in range(3):
  try:
   r=requests.get('https://commons.wikimedia.org/w/api.php',params={'action':'query','prop':'imageinfo','titles':title,'iiprop':'url|extmetadata|size','iiurlwidth':960,'format':'json','formatversion':2},headers=H,timeout=28)
   if r.status_code in (429,503):time.sleep((attempt+1)*2);continue
   r.raise_for_status()
   return r.json()['query']['pages'][0]['imageinfo'][0]
  except Exception:
   if attempt==2:raise
   time.sleep(attempt+1)
manifest={'origin':'Wikimedia Commons photo audit (file-specific author and CC license validated)','missingBefore':143,'searched':143,'candidatesEvaluated':len(SELECTION),'photos':[],'excluded':[
 'New Foton eTruckMate does not match TM combustion cab',
 'Foton View Grand cargo panel is not the passenger variant',
 'JMC Vigus older generation, unverified 2026 commercial counterpart',
 'Dacia Duster III differs in badging from current Renault Duster in Chile',
 'Suzuki Alto HA36V van is not Chilean Alto passenger',
 'Ford Explorer EV is not Explorer 26 MY ICE',
 'New Opel Crossland 2026 uses Opel Frontera C shape, not old Crossland X',
 'RAM V1000 is Fiat Doblo, not Ram ProMaster Rapid/Fiat Fiorino',
 'Porsche Cayenne EV not represented with combustion Cayenne photo',
 '2025 Mini Hatch J01 JCW Trim is not verified JCW Electric performance model'
]}
IMG.mkdir(parents=True,exist_ok=True)
for n,(gid,idx,tech,override,source_gid) in enumerate(SELECTION,1):
 target=groups[gid-1]
 src=groups[(source_gid or gid)-1]
 if len(src['candidateTitles'])<=idx:raise ValueError('Candidate absent '+str((gid,idx,source_gid)))
 title=src['candidateTitles'][idx]
 info=fetchinfo(title)
 e=info.get('extmetadata',{})
 license=plain(e.get('LicenseShortName',{}).get('value',''))
 author=plain(e.get('Artist',{}).get('value',''))
 licenseurl=plain(e.get('LicenseUrl',{}).get('value','')).replace('http://','https://')
 if not re.fullmatch(r'CC0|CC BY(?:-SA)? [234]\.0(?: [a-z]{2})?',license,re.I):
  raise ValueError('UNLICENSED '+str(gid)+' '+title+' '+license)
 if not author or not licenseurl.startswith('https://creativecommons.org/'):raise ValueError('Missing rights '+str(gid)+' '+title+' '+str((author,licenseurl)))
 rr=requests.get(info.get('thumburl') or info['url'],headers=H,timeout=30)
 rr.raise_for_status()
 im=ImageOps.exif_transpose(Image.open(io.BytesIO(rr.content))).convert('RGB')
 im.thumbnail((960,960))
 name=f'rindelab-{slug(target["brand"])}-{slug(target["family"])}-g{gid}-commons-gap4-20261122.jpg'
 dest=IMG/name;im.save(dest,'JPEG',quality=83,optimize=True,progressive=True)
 raw=dest.read_bytes()
 assert raw[:2]==bytes([255,216]) and 12000<len(raw)<1200000
 photo={'brand':target['brand'],'family':target['family'],'pattern':(override or pattern(target['family'])),
 'from':'2020','to':'2027','model':target['brand']+' '+target['family']+' (imagen referencial de familia/generación)',
 'author':author,'license':license,'licenseUrl':licenseurl,'source':'https://commons.wikimedia.org/wiki/'+title.replace(' ','_'),
 'file':title.removeprefix('File:'),'localSrc':'./images/commons/'+name,'sha256':hashlib.sha256(raw).hexdigest(),'bytes':len(raw),
 'groupKey':target['key'],'candidateNumber':idx,'groupNumber':gid}
 if tech:photo['tech']=tech
 manifest['photos'].append(photo)
 print(n,len(SELECTION),gid,target['brand'],target['family'],license,len(raw),flush=True)
(DATA/'commons-gap4-20261122.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
js=JS.read_text(encoding='utf8')
marker='const entries=localEntries.concat('
assert marker in js and 'const licensedCommonsGap420261122' not in js
js=js.replace(marker,'const licensedCommonsGap420261122='+json.dumps(manifest['photos'],ensure_ascii=False,indent=2)+';\n'+marker,1)
old='licensedCommonsGap320261122).map('
assert old in js
js=js.replace(old,'licensedCommonsGap320261122,licensedCommonsGap420261122).map(',1)
JS.write_text(js,encoding='utf8')
print('IMPORTED',len(manifest['photos']))
