#!/usr/bin/env python3
"""Final editorial review of the Commons batch; remove questionable Chile-facing associations."""
from pathlib import Path
import json
root=Path(__file__).resolve().parents[1]
manifest_file=root/'rindelab/data/commons-mass-20261122.json'
photos_file=root/'rindelab/v2-photos.js'
manifest=json.loads(manifest_file.read_text(encoding='utf-8'))
original=manifest['photos']
# Strict policy: correct commercial body/generation, rather than generic family lookalikes.
EXCLUDE={
 ('Chevrolet','Traverse'):'Photographed C1XX generation; current Chilean offer may be a newer generation',
 ('Chevrolet','Sail Sedan'):'China-market third-generation Sail not independently verified against Chilean version',
 ('Ford','Transit Minibus'):'Photographed school minibus has unknown body and model year',
 ('Renault','Duster'):'Unspecified Duster generation; Chilean 2026 generation is not established',
 ('Renault','Koleos'):'2019-model image may not correspond to the current commercial family',
 ('Suzuki','alto'):'China-market/Japan model not verified as the Chilean Suzuki Alto body',
 ('Toyota','Yaris'):'European XP210 hatchback does not establish the Chilean Yaris body',
}
bad=[p for p in original if (p['brand'],p['family']) in EXCLUDE]
assert len(bad)==len(EXCLUDE),f'Exclusion drift: {[(p["brand"],p["family"]) for p in bad]}'
remaining=[p for p in original if (p['brand'],p['family']) not in EXCLUDE]
source=photos_file.read_text(encoding='utf-8')
tag='const licensedCommonsMass20261122='
start=source.index(tag)
end=source.index(';\nconst entries=',start)
body=json.loads(source[start+len(tag):end])
assert len(body)==len(original)
updated=[p for p in body if (p['brand'],p['family']) not in EXCLUDE]
assert len(updated)==len(remaining)
source=source[:start]+tag+json.dumps(updated,ensure_ascii=False,indent=2)+source[end:]
for item in bad:
    literal='  '+json.dumps(item['localSrc'])+',\n'
    assert literal in source,'source not found for '+item['localSrc']
    source=source.replace(literal,'')
    path=root/'rindelab'/item['localSrc']
    assert path.is_file(),'image missing '+str(path)
    path.unlink()
photos_file.write_text(source,encoding='utf-8')
manifest['photos']=remaining
manifest['editorialExclusions']=[{'brand':p['brand'],'family':p['family'],'file':p['file'],
                                   'source':p['source'],'reason':EXCLUDE[(p['brand'],p['family'])]} for p in bad]
manifest_file.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('CURATED',json.dumps({'original':len(original),'excluded':len(bad),'accepted':len(remaining)},ensure_ascii=False),flush=True)
