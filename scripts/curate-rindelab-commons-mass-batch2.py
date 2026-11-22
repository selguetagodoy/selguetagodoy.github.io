#!/usr/bin/env python3
"""Curate Commons second-pass vehicle photographs after human-readable title audit.
Remove visually misleading generation/body examples before merging.
"""
from pathlib import Path
import json

root=Path(__file__).resolve().parents[1]
manifest_path=root/'rindelab/data/commons-mass-batch2-20261122.json'
photos_js=root/'rindelab/v2-photos.js'
manifest=json.loads(manifest_path.read_text(encoding='utf-8'))

EXCLUDE={
 ('Chevrolet','Traverse'):'C1XX earlier generation, not verified for current Chilean offer',
 ('Renault','Koleos'):'First generation / Renault Samsung QM5, not current-generation Koleos',
 ('Suzuki','alto'):'Maruti Alto version not verified against Chile commercial body',
 ('Toyota','Yaris'):'GR Yaris rally-derived hatch is not the standard Yaris commercial family',
 ('Ferrari','SF90'):'SF90 Spider open-top body not necessarily representative of GTB',
 ('Fiat','Ducato'):'Corrections/prison police vehicle; not representative of generic passenger/commercial stock photo',
 ('Ford','Expedition'):'Funeral hearse conversion, not normal Expedition body',
 ('Hyundai','Grand i10 Hatchback'):'Image shows two different vehicles including a VinFast',
 ('Mercedes-Benz','Vito Minibus'):'Netherlands police minibus, not representative commercial vehicle',
 ('BMW','Serie 5'):'5 Series GT is a different body style/older generation',
 ('Honda','Pilot'):'Third-generation Pilot, current Chile offering may be newer',
 ('Mini','COOPER'):'First-generation Cooper photo does not represent modern F66 generation',
 ('BMW','Serie 7'):'BMW 3 Series Cabriolet misidentified as BMW Serie 7',
 ('Toyota','Corolla Sedán'):'Rear view with incomplete visual identification of model body',
 ('Dongfeng','t5'):'T5 Evo is a different Forthing variant from T5 commercial family',
 ('Gac','Emkoo'):'Gasoline version is not validated as hybrid HEV record',
 ('Opel','new crossland'):'Photographed Crossland trim not verified as advertised EV model',
 ('Porsche','Macan'):'2022 combustion Porsche Macan must not replace the separate verified 2026 Macan EV photograph',
 ('Ferrari','812'):'Variant or adapted 812 media not enough to verify same 2026 Chile variant',
}
old=manifest.get('photos',[])
excluded=[p for p in old if (p['brand'],p['family']) in EXCLUDE]
found={(p['brand'],p['family']) for p in excluded}
assert found==set(EXCLUDE),f'Exclusions changed: missing={set(EXCLUDE)-found}; unexpected={found-set(EXCLUDE)}'
remaining=[p for p in old if (p['brand'],p['family']) not in EXCLUDE]
s=photos_js.read_text(encoding='utf-8')
tag='const licensedCommonsMassBatch220261122='
a=s.index(tag)
b=s.index(';\nconst entries=',a)
entries=json.loads(s[a+len(tag):b])
assert len(entries)==len(old),(len(entries),len(old))
new=[p for p in entries if (p['brand'],p['family']) not in EXCLUDE]
assert len(new)==len(remaining)
s=s[:a]+tag+json.dumps(new,ensure_ascii=False,indent=2)+s[b:]
for p in excluded:
    line='  '+json.dumps(p['localSrc'],ensure_ascii=False)+',\n'
    assert line in s,p['localSrc']+' not referenced by neutral family photo set'
    s=s.replace(line,'')
    local=root/'rindelab'/p['localSrc']
    assert local.is_file(),str(local)
    local.unlink()
photos_js.write_text(s,encoding='utf-8')
manifest['photos']=remaining
manifest['editorialExclusions']=[{'brand':p['brand'],'family':p['family'],'file':p['file'],'reason':EXCLUDE[(p['brand'],p['family'])]} for p in excluded]
manifest_path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('CURATED',json.dumps({'initial':len(old),'excluded':len(excluded),'accepted':len(remaining)},ensure_ascii=False),flush=True)
