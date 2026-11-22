#!/usr/bin/env python3
"""RINDELAB: conservative batch search/import of exact vehicle families from Wikimedia Commons.
Requires correct marque/model, photo metadata, reuse license, 2020+ generation where identifiable.
Writes an auditable manifest; no guessed vehicle versions, engines or prices.
"""
import hashlib, json, os, re, time, unicodedata
import urllib.parse as up
import urllib.request as ur
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
DAT=ROOT/'rindelab/data'
JS=ROOT/'rindelab/v2-photos.js'
IMG=ROOT/'rindelab/images/commons'
MAN=DAT/'commons-mass-batch2-20261122.json'
TAG='licensedCommonsMassBatch220261122'
H={'User-Agent':'RINDELAB vehicle image audit/1.2 (https://selguetagodoy.github.io/rindelab/, contact: e.elguetagodoy@gmail.com)',
   'Accept':'application/json,image/jpeg,*/*'}
LIMIT=int(os.environ.get('MAX_COMMONS_SEARCH','254'))
MAX=int(os.environ.get('MAX_COMMONS_IMPORT','105'))
DRY='--dry-run' in os.sys.argv
def text(v):
    return unicodedata.normalize('NFKD',str(v or '')).encode('ascii','ignore').decode().lower()
def toks(v):
    return re.findall(r'[a-z]+[0-9]*[a-z]*|[0-9]+[a-z]*',text(v))
def slug(v):
    return re.sub(r'[^a-z0-9]+','-',text(v)).strip('-')
def fetch(url,cap=2_000_000):
    for i in range(3):
        try:
            req=ur.Request(url,headers=H)
            with ur.urlopen(req,timeout=20) as r:
                if r.status!=200: raise ValueError('HTTP '+str(r.status))
                if int(r.headers.get('Content-Length','0'))>cap: raise ValueError('Oversize image')
                b=r.read(cap+1)
                if len(b)>cap: raise ValueError('Oversize response')
                return b
        except Exception:
            if i==2: raise
            time.sleep(1+i*1.5)
def api(params):
    u='https://commons.wikimedia.org/w/api.php?'+up.urlencode({**params,'format':'json','formatversion':2})
    return json.loads(fetch(u,3_000_000).decode('utf8'))
def plain(html):
    return re.sub(r'\s+',' ',re.sub(r'<[^>]+>',' ',str(html or ''))).strip()
def rights(metadata):
    lic=plain(metadata.get('LicenseShortName',{}).get('value'))
    author=plain(metadata.get('Artist',{}).get('value'))
    url=metadata.get('LicenseUrl',{}).get('value','').replace('http://','https://')
    if not re.fullmatch(r'CC0|CC BY(?:-SA)? [234]\.0(?: [a-z]{2})?',lic,re.I): return None
    if not url.startswith('https://creativecommons.org/') or not author: return None
    return author,lic,url
# These models tend to be pictured in Commons and/or can cover multiple Chilean price rows.
FOCUS=[
 'Audi|A5 Sportback','Audi|A5 Coupe','Audi|Q4 Sportback e-tron','Audi|RS5',
 'Baic|BJ30','Baic|BJ60','Baic|EU5','Baic|U5 Plus','Baic|X35','Baic|X55','Baic|X7',
 'BMW|M135i','BMW|M240i','BMW|Serie 4 Convertible','BMW|Serie 4 Gran Coupé','BMW|Serie 8 Coupe',
 'Changan|Alsvin','Changan|CS35 Max','Changan|uni-k','Changan|UNI-T',
 'Chery|Tiggo 7','Chery|Tiggo 8','Chery|TIGGO 9','Chevrolet|Traverse','Chevrolet|Sail Sedan',
 'Chevrolet|Silverado CD','Cupra|Formentor','Cupra|Leon','Cupra|Terramar',
 'Dongfeng|MAGE','Dongfeng|T5 L','DS|4','DS|7','Exeed|LX','Exeed|RX','Exeed|TXL','Exeed|VX',
 'Ferrari|F8','Fiat|600e','Ford|Transit Furgon','Ford|Transit Minibus',
 'Gac|GS4 MAX','Geely|GX3 PRO','Geely|OKAVANGO','Geely|Starray','Honda|Civic',
 'Honda|CR-V','Honda|HR-V','Honda|ZR-V','Hyundai|Tucson','Hyundai|TUCSON NX4 HEV',
 'JAC|JS2','JAC|JS2 Pro','JAC|JS8','Jaecoo|Jaecoo 7','Jaguar|E-Pace','Jaguar|F-Type',
 'Jetour|T2','Jetour|X70 PLUS','Kia|Frontier II','Land Rover|Defender 110','Land Rover|Defender 90',
 'Land Rover|Range Rover','Lexus|LX','Livan|X6PRO','Lynk & Co|06','Maxus|D60',
 'Maxus|D90','Maxus|Deliver 9','Maxus|T60','Mazda|6 Sedan','Mazda|BT-50',
 'Mazda|MX-5','Mercedes-Benz|Clase C','Mercedes-Benz|Clase E','Mercedes-Benz|Clase G',
 'Mercedes-Benz|Clase S','Mercedes-Benz|GLS','Mercedes-Benz|Vito Furgon',
 'MG|5 Sedan','MG|GT','MG|MG3','MG|ONE','MG|ZX','Opel|Combo','Opel|Vivaro',
 'Peugeot|Traveller','RAM|2500 CD','RAM|rampage','Renault|Duster','Renault|Koleos',
 'Renault|Kwid','Renault|Oroch','Seat|Ateca','Skoda|Fabia','Subaru|Evoltis',
 'Suzuki|alto','Toyota|Hiace Cargo','Toyota|Hiace Minibus','Toyota|RAV 4','Toyota|Yaris',
 'Volkswagen|Nivus','Volkswagen|Saveiro CD','Volkswagen|Tiguan','Volvo|Xc40',
 'Audi|E-TRON GT','Avatr|11','BMW|i5','BMW|i7','BMW|iX1','BMW|iX2','BMW|iX3',
 'BYD|Song Pro','Changan|Lumin','Chery|Tiggo 9','Chevrolet|Bolt','Chevrolet|Bolt EUV',
 'Chevrolet|Equinox EV','Deepal|S05','Deepal|S07','DS|3 Crossback E-Tense',
 'Ferrari|296','Ferrari|SF90','Fiat|600e','Gac|AION UT','Geely|EX2','Hyundai|Tucson',
 'Jaecoo|7 SHS','Landking|LK8 EV','Lexus|IS','Lynk & Co|01','Lynk & Co|08',
 'Mercedes-Benz|EQS 450+','MG|MG3','Omoda|E5','Renault|Kwid E -Tech',
 'Smart|#1','Smart|#3','Toyota|Yaris Cross','Volvo|EC40','Volvo|EX40',
 'Great Wall|Haval H6','Great Wall|Haval H7','Great Wall|Haval Jolion',
 'Great Wall|Poer','Great Wall|Tank 300','Great Wall|Tank 500','Great Wall|Wingle 7',
 'Toyota|Land Cruiser Prado','Mazda|CX-3','Mazda|CX-5',
 'Porsche|Cayenne','Porsche|Macan','Porsche|Panamera','Porsche|Taycan',
]
# Exact brand aliases admissible only when manufacturer/model identity is unambiguous.
BRAND_ALIASES={
 'mercedes-benz':['mercedes benz','mercedes'],
 'great wall':['great wall','gwm','haval','tank'],
 'land rover':['land rover','range rover'],
 'mg':['mg','morris garages'],
 'gac':['gac','aion','gac motor'],
 'seat':['seat'],
 'ram':['ram','dodge ram'],
 'bmw':['bmw'],
 'ds':['ds automobiles','ds'],
 'changan':['changan'],
 'avatr':['avatr'],
 'lynk & co':['lynk co','lynk & co','lynk'],
 'kia':['kia'],
 'jaecoo':['jaecoo'],
 'mini':['mini'],
 'vw':['volkswagen'],
 'volkswagen':['volkswagen','vw'],
 'mazda':['mazda'],
 'citroen':['citroen'],
 'peugeot':['peugeot'],
 'skoda':['skoda'],
}
DROP={'new','nuevo','nueva','all','the','pro','plus','hybrid','hibrido','ev','electric','elec','hev','phev','reev','mhev'}
TRIM_FAMILY={
 'serie':'series','clase':'class','sedan':'sedan','furgon':'van',
 'gran':'gran','cabrio':'cabriolet','coup':'coupe'
}
BLOCK={'interior','dashboard','cockpit','engine','motor','steering','wheel','wheels','rear','back','backside','inside','logo','badge',
       'tail','headlight','seat','seats','door','doors','detail','rim','rims','bumper','headlamp','mirror',
       'rally','rally2','race','racing','gt3','gt4','formula','render','illustration','concept','prototype','police','ambulance',
       'garage','collection','modelcar','toy','diecast','hotwheels','wallpaper','drawing','sketch','camouflage','mule','wheelchair',
       'caravan','conversion','artwork','racecar','simulator','cabinet','sticker','keychain','oldtimer',
       'timeline','taxi','carabinieri','semar','protection','nostokana','bra','modelcar','conceptcar'}
# Strictly disallow mismatched configurations if the commercial model calls out a distinct body style.
BODY_REQ={
 'sportback':{'sportback'},'coupe':{'coupe','coup'},'cabrio':{'cabriolet','cabrio','convertible'},
 'cabriolet':{'cabriolet','cabrio','convertible'},'convertible':{'convertible','cabriolet'},
 'sedan':{'sedan','saloon'},'hatchback':{'hatchback','hatch'},'minibus':{'minibus','passenger','shuttle'},
 'cargo':{'cargo','van','furgon','panel'},'pickup':{'pickup','pick','truck'},'furgon':{'van','furgon','panel','cargo'}
}
def search_query(g):
    brand=g['brand']; fam=g['family']
    b=brand if brand!='Great Wall' else ('Haval' if re.search('haval',fam,re.I) else 'GWM')
    if brand=='Mercedes-Benz': b='Mercedes'
    if brand=='Gac' and fam.upper().startswith('AION'): b='Aion'
    if fam.startswith('cl-tiggo'): fam=fam[3:]
    return b+' '+fam.replace('_',' ').replace('-',' ')
def exact_exclusion(g,filename):
    """Known model-family confusions rejected after inspecting filename evidence."""
    k=(text(g['brand']),text(g['family']))
    name=text(filename)
    if k in {('bmw','serie m'),('bmw','serie 2'),('foton','ft')}:
        return True
    BAD={
       ('baic','eu5'):['eu5 plus'],
       ('chevrolet','sail sedan'):['sail ii','second generation'],
       ('chevrolet','traverse'):[' - w00'],
       ('ford','transit minibus'):['transit minibus uk','psta'],
       ('mercedes-benz','gls'):['timeline','maybach'],
       ('renault','duster'):['techroad'],
       ('toyota','hiace minibus'):['tunas rent'],
       ('suzuki','alto'):['van vp','ha36v','alto vii'],
       ('hyundai','tucson'):['chinese facelift'],
       ('jac','js8'):['js8 pro'],
       ('jaguar','e-pace'):['2018'],
       ('jaguar','f-type'):['convertible'],
       ('kia','frontier ii'):['2015'],
       ('land rover','range rover'):['velar','evoque','range rover sport'],
       ('lexus','lx'):['lx 570'],
       ('mazda','6 sedan'):['mazda 323'],
       ('mazda','bt-50'):['2008'],
       ('mazda','mx-5'):['bra'],
       ('mercedes-benz','clase c'):['coupe'],
       ('mercedes-benz','clase g'):['semar'],
       ('toyota','yaris'):['carabinieri'],
       ('bmw','i5'):['nostokana'],
       ('bmw','i7'):['protection'],
       ('baic','u5 plus'):['taxi'],
       ('exeed','vx'):['taxi'],
       ('chevrolet','sail sedan'):['sail ii','second generation','third generation'],
       ('ford','transit minibus'):['transit minibus uk','psta','primary school','wetherby'],
       ('ford','expedition'):['bureau of land management','government'],
       ('renault','duster'):['techroad','tandil'],
       ('renault','koleos'):['2019','gt line'],
       ('suzuki','alto'):['van vp','ha36v','alto vii','alto china'],
       ('toyota','yaris'):['carabinieri','xp210','yaris hybrid'],
       ('toyota','yaris sedan'):['2019','2018','2017','old generation'],
       ('toyota','corolla sedan'):['e180'],
       ('bmw','serie 4'):['serie 6','e24','e36','e46'],
       ('bmw','serie 5'):['f10','f11','g30','2011','2012'],
       ('bmw','serie 7'):['e38','e32','e65','f01','g11','g12','phase 1'],
       ('foton','ft'):['tricycle','wuxing'],
       ('honda','pilot'):['second generation','2008','2011','2013'],
       ('mini','cooper'):['j01'],
       ('maserati','ghibli'):['bergrennen','2017'],
       ('nammi','nammi 001'):['nammi 06','nammi 06 001'],
       ('great wall','ora 5'):['funky cat','ora 03'],
       ('renault','boreal'):['clio','gris boreal'],
       ('fiat','ducato'):['esercito','esercito italiano','army','military'],
       ('hyundai','porter'):['cherrypicker','cherry picker'],
       ('iveco','daily furgon'):['all blacks'],
       ('mercedes-benz','vito minibus'):['polizei','police','military']
    }
    return any(v in name for v in BAD.get(k,[]))

def family_matches(g,filename,desc):
    brand=g['brand']; name=g['family']; f=toks(filename); t=toks(filename+' '+desc)
    fset=set(f); tset=set(t)
    aliases=BRAND_ALIASES.get(text(brand),[text(brand)])
    if not any(set(toks(a)).issubset(fset) for a in aliases): return False,-1,'wrong brand'
    mt=toks(name)
    base=[z for z in mt if z not in DROP and (len(z)>1 or z.isdigit())]
    if not base: return False,-1,'no discriminating model tokens'
    # No model may match solely from a description: require model/series in the filename.
    # Support model numbers written as Tiggo7 / Tiggo 7 and RAV4 / RAV 4.
    merged=''.join(f)
    for m in base:
        if m in ('gran','all'): continue
        if m not in fset and not any(m in x and (x.startswith(m) or (m.isdigit() and x.endswith(m))) for x in f):
            return False,-1,'model token missing: '+m

    # Specific body styles need a title indication. Avoid cargo being mapped to passenger version.
    qualifiers=[x for x in mt if x in BODY_REQ]
    if 'pick' in mt and 'up' in mt: qualifiers.append('pickup')
    for q in qualifiers:
        if not (BODY_REQ[q] & fset): return False,-1,'required body missing: '+q
    if any(b in fset for b in BLOCK): return False,-1,'interior/race/other blacklist'
    if any(b in tset for b in ('scale','diecast','modelcar','racing','interior','toy','taxi','police')): return False,-1,'image description excluded'
    if exact_exclusion(g,filename): return False,-1,'incorrect generation/body/trim'
    if (g['technology'] in ('HEV','PHEV','MHEV','REEV')) and 'hybrid' in fset and g['technology']=='PHEV' and 'phev' not in fset and 'plugin' not in fset:
        return False,-1,'unverified plug-in body'
    # Year in filename: must be modern; publication date is insufficient. Exclude known 1990/2000.
    years=[int(y) for y in re.findall(r'\b(19[0-9]{2}|20[0-2][0-9])\b',filename)]
    if any(y<=2018 for y in years): return False,-1,'pre-2019 generation'
    if re.search(r'\b(?:all new|nuevo|new)\b',text(name)) and years and max(years)<2023: return False,-1,'older generation of new model'
    # Title must carry model, photo source and permissible rights - metadata verified separately.
    score=40+min(15,2*len(base))+min(8,max(years or [2022])-2019)
    if 'front' in fset: score+=7
    if 'chile' in tset: score+=5
    if any(a in fset for a in ('2024','2025','2026')): score+=4
    if len(base)>=2: score+=4
    # open vs closed distinctions e.g EV, Hybrid named commercial family should appear explicitly where given.
    if 'phev' in mt and 'phev' not in fset and 'plug' not in fset: return False,-1,'PHEV not verified by photo'
    if 'hev' in mt and 'hybrid' not in fset and 'hev' not in fset: return False,-1,'HEV not verified by photo'
    return True,score,'verified-title-match'
def candidates(g):
    q=search_query(g)
    j=api({'action':'query','generator':'search','gsrsearch':q,'gsrnamespace':'6','gsrlimit':'16',
           'prop':'imageinfo','iiprop':'url|extmetadata|mime','iiurlwidth':'720'})
    pages=j.get('query',{}).get('pages',[])
    accepted=[]
    for p in pages:
        i=(p.get('imageinfo') or [None])[0]
        if not i or i.get('mime')!='image/jpeg' or not i.get('thumburl'): continue
        file=p.get('title','')[5:]
        desc=plain(i.get('extmetadata',{}).get('ImageDescription',{}).get('value',''))
        ok,score,reason=family_matches(g,file,desc)
        if not ok: continue
        lic=rights(i.get('extmetadata',{}))
        if not lic: continue
        if not i.get('descriptionurl','').startswith('https://commons.wikimedia.org/wiki/File:'): continue
        url=i['thumburl']
        if not url.startswith(('https://thumb.wikimedia.org/','https://upload.wikimedia.org/')):continue
        accepted.append({'file':file,'source':i['descriptionurl'],'thumb':url,'score':score,
                         'author':lic[0],'license':lic[1],'licenseUrl':lic[2],'description':desc[:200]})
    return sorted(accepted,key=lambda x:-x['score'])[:4]

def main():
    source=JS.read_text('utf-8')
    if TAG in source: raise RuntimeError('import already performed')
    coverage=json.loads((DAT/'catalog-coverage-20261122.json').read_text('utf-8'))
    missing=[x for x in coverage['allGroups'] if not x['photo']]
    assert len(missing)>=100
    bykey={(text(x['brand']),text(x['family'])):x for x in missing}
    selected=[];used=set()
    for item in FOCUS:
        brand,family=item.split('|',1)
        key=(text(brand),text(family))
        if key in bykey and key not in used:
            selected.append(bykey[key]); used.add(key)
    # Then search additional straightforward names; avoid non-distinct generic family names.
    for x in missing:
        key=(text(x['brand']),text(x['family']))
        if key not in used and len(toks(x['family']))<=3:
            selected.append(x);used.add(key)
    selected=selected[:LIMIT]
    print(json.dumps({'missing':len(missing),'searchQueue':len(selected)},ensure_ascii=False),flush=True)
    results=[];downloaded=[];unique=set();failures=[]
    IMG.mkdir(parents=True,exist_ok=True)
    for idx,g in enumerate(selected):
        try:
            photos=candidates(g)
            results.append({'brand':g['brand'],'family':g['family'],'technology':g['technology'],
                            'candidates':[{k:v for k,v in c.items() if k!='thumb'} for c in photos]})
            if not photos: continue
            if len(downloaded)>=MAX: continue
            for c in photos:
                if c['source'] in unique: continue
                try:
                    blob=fetch(c['thumb'],1_200_000)
                    if len(blob)<12000 or not(blob.startswith(b'\xff\xd8') and blob.endswith(b'\xff\xd9')):
                        continue
                    dest='rindelab-'+slug(g['brand']+' '+g['family'])[:74]+'-commonsmass-batch2-20261122.jpg'
                    if (IMG/dest).exists():continue
                    (IMG/dest).write_bytes(blob)
                    pattern=r'\b'+r'[\s-]+'.join(re.escape(z) for z in toks(g['family']))+r'(?=$|[^A-Za-z0-9])'
                    # Chile catalog can retain Spanish accents in family names.
                    pattern=pattern.replace('sedan','sed[aá]n').replace('furgon','furg[oó]n').replace('coupe','coup[eé]').replace('hibrido','h[ií]brido')
                    # Model aliases for automotive families with structural variants are not inferred.
                    entry={'brand':g['brand'],'family':g['family'],'pattern':pattern,'from':'2026','to':'2026',
                           'file':c['file'],'model':g['brand']+' '+g['family']+' (fotografía referencial de familia)',
                           'author':c['author'],'license':c['license'],'licenseUrl':c['licenseUrl'],
                           'source':c['source'],'localSrc':'./images/commons/'+dest}
                    downloaded.append({**entry,'score':c['score'],'sha256':hashlib.sha256(blob).hexdigest(),'bytes':len(blob)})
                    unique.add(c['source'])
                    print('PHOTO',len(downloaded),g['brand'],g['family'],'::',c['file'],flush=True)
                    break
                except Exception as e:
                    print('SKIP DOWNLOAD',g['brand'],g['family'],str(e)[:100],flush=True)
        except Exception as e:
            failures.append({'brand':g['brand'],'family':g['family'],'error':str(e)[:200]})
        if (idx+1)%30==0:
            print('PROGRESS',idx+1,'/',len(selected),'photos',len(downloaded),'errors',len(failures),flush=True)
        time.sleep(0.12)
    manifest={'origin':'Wikimedia Commons API fulltext search (author/license verified)',
              'audited':True,'searched':len(selected),'missingBefore':len(missing),
              'photos':downloaded,'candidateSummary':results,'failures':failures}
    MAN.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
    print('RESULT',json.dumps({'searched':len(selected),'photos':len(downloaded),'errors':len(failures)},ensure_ascii=False),flush=True)
    if DRY or not downloaded:return
    anchor='const entries=localEntries.concat('
    assert anchor in source
    source=source.replace(anchor,'const '+TAG+'='+json.dumps([{k:v for k,v in p.items() if k not in ('score','bytes','sha256')} for p in downloaded],ensure_ascii=False,indent=2)+';\n'+anchor)
    before='licensedNovember2026B,licensedCarImagesRights20261122,licensedCommonsMass20261122).map('
    assert before in source, 'Other photo batches changed'
    source=source.replace(before,'licensedNovember2026B,licensedCarImagesRights20261122,licensedCommonsMass20261122,'+TAG+').map(')
    neutral='const neutralFamilyPhotoSources=new Set(['
    assert neutral in source
    source=source.replace(neutral,neutral+'\n'+''.join('  '+json.dumps(p['localSrc'])+',\n' for p in downloaded))
    JS.write_text(source,encoding='utf8')
    for p in ('index.html','cotizador.html','electromovilidad.html'):
        fn=ROOT/'rindelab'/p
        old='v2-photos.js?v=20261122-commonsmass'
        data=fn.read_text(encoding='utf8')
        assert old in data
        fn.write_text(data.replace(old,'v2-photos.js?v=20261122-commonsmass2'),encoding='utf8')

if __name__=='__main__':
    main()
