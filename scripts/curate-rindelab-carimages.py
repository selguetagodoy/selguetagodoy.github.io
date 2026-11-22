#!/usr/bin/env python3
"""Second-pass editorial exclusions after verifying actual vehicle identity and body.
Conservative: no interiors, misleading generation, or alternate body style.
"""
from pathlib import Path
import json
root=Path(__file__).resolve().parents[1]
data=root/'rindelab/data/carimages-rights-import-20261122.json'
photo_js=root/'rindelab/v2-photos.js'
manifest=json.loads(data.read_text('utf-8'))
excluded={
 ('Citroen','C3'): '2021 generation not the new Chile CC21 body',
 ('Ferrari','812'): '812 GTS open-top, not generic 812 coupe',
 ('Ford','Expedition'): '2019 generation, outdated for current 2026 family',
 ('Peugeot','Traveller'): 'AC ventilation interior, not an exterior vehicle photo',
 ('Skoda','Fabia'): '2019 previous generation, not current Fabia IV',
 ('Suzuki','alto'): 'Japan-market Alto L, not verified Chilean Alto body',
 ('Toyota','All New Rav4'): '2020 RAV4 is previous generation, despite 2024 photo date',
 ('Audi','RS5'): 'coupe body not verified against current RS5 commercial family',
}
photos=manifest['photos']
remove=[p for p in photos if (p['brand'],p['family']) in excluded]
assert len(remove)==len(excluded), 'Editorial exclusion keys drifted: '+str({(p['brand'],p['family']) for p in remove})
keep=[p for p in photos if (p['brand'],p['family']) not in excluded]
s=photo_js.read_text('utf-8')
tag='const licensedCarImagesRights20261122='
a=s.index(tag)
b=s.index(';\nconst entries=',a)
old=json.loads(s[a+len(tag):b])
assert len(old)==len(photos)
new=[p for p in old if (p['brand'],p['family']) not in excluded]
assert len(new)==len(keep)
s=s[:a]+tag+json.dumps(new,ensure_ascii=False,indent=2)+s[b:]
for p in remove:
    src=p['localSrc']
    needle='  '+json.dumps(src,ensure_ascii=False)+',\n'
    assert needle in s, 'Photo source not referenced in neutral family sources: '+src
    s=s.replace(needle,'')
    target=root/'rindelab'/src
    assert target.is_file(),'Photo is missing: '+str(target)
    target.unlink()
photo_js.write_text(s,encoding='utf-8')
manifest['photos']=keep
manifest['editorialExclusions']=[{'brand':p['brand'],'family':p['family'],'file':p['file'],'reason':excluded[(p['brand'],p['family'])]} for p in remove]
manifest['stats']['downloaded']=len(keep)
manifest['stats']['selectedFromRights']=sum(p['origin']=='carimages-rights' for p in keep)
manifest['stats']['selectedFromWikidata']=sum(p['origin']=='wikidata-p18' for p in keep)
data.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('CURATED',json.dumps({'accepted':len(keep),'excluded':len(remove),'remaining':manifest['stats']['missingBefore']},ensure_ascii=False))
