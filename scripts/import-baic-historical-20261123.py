from pathlib import Path
import json,hashlib,re
ROOT=Path(__file__).resolve().parents[1]/'rindelab'
J=ROOT/'v2-photos.js'
base=J.read_text(encoding='utf8')
assert 'const baicHistorical20261123=' not in base
sources={x['key']:x for x in json.loads((ROOT/'data/baic-photo-sources-20261123.json').read_text(encoding='utf8'))}
def licensed(key,pattern,yearstart,yearend,model,extra=None):
 r=sources[key]
 assert r.get('localSrc') and r.get('license') and r.get('source') and r.get('author')
 out={'brand':'Baic','family':model,'pattern':pattern,'from':str(yearstart),'to':str(yearend),'model':model+' (foto referencial de familia/generación)',
      'author':r['author'],'license':r['license'],'licenseUrl':r['licenseUrl'],'source':r['source'],'localSrc':r['localSrc'],
      'originNote':'Licencia de Wikimedia Commons verificada, edición a miniatura con atribución'}
 if extra:out.update(extra)
 return out
B=[]
B.append(licensed('upsedan',r'\bUP\b.*(?:Sed[aá]n|Sedan)',2014,2017,'BAIC UP sedán'))
B.append(licensed('uphatch',r'\bUP\b.*Hatchback',2014,2017,'BAIC UP hatchback'))
B.append(licensed('x25',r'\bX25\b',2016,2021,'BAIC X25 primera generación'))
B.append(licensed('x35old',r'\bX35\b',2016,2022,'BAIC X35 primera generación'))
B.append(licensed('x55old',r'\bX55\b(?!\s*Plus)',2016,2022,'BAIC X55 primera generación'))
B.append(licensed('bj40plus',r'\bBJ40P\b',2020,2024,'BAIC BJ40 Plus primera generación'))
B.append(licensed('bj40pro',r'\bBJ40\s*Pro\b',2024,2027,'BAIC BJ40 II / Pro segunda generación'))
B.append(licensed('zoom',r'\bZoom\b',2014,2018,'BAIC B40/Zoom tres puertas',{'originNote':'BAIC Zoom en Chile es BJ40/B40 de tres puertas, según test drive de Autocosmos (2023).'}))
B.append(licensed('x65',r'\bX65\b',2014,2020,'BAIC Senova X65 primera generación'))
B.append(licensed('x55plus',r'\bX55\s*Plus\b',2022,2026,'BAIC X55 Plus 2024'))
B.append(licensed('bj30hev',r'\bBJ30\b.*\bHEV\b',2025,2027,'BAIC BJ30 HEV 2025'))
# Para familias 2025 presentes en el inventario ya hay imágenes Commons con licencia
# verificada; se reutilizan sus archivos locales y fuente, sin relajar el patrón del año.
reuse=[
 (r'\bBJ30\b',2025,2026,'BAIC BJ30, vista exterior de versión HEV','./images/commons/rindelab-baic-bj30-commonsmass-20261122.jpg','M Raisfath','CC BY 4.0','https://creativecommons.org/licenses/by/4.0','https://commons.wikimedia.org/wiki/File:Front_look_of_BAIC_BJ30_HEV_during_GIIAS_2026_in_Bandung_20260913_175026.jpg'),
 (r'\bBJ60\b',2025,2026,'BAIC BJ60 2023','./images/commons/rindelab-baic-bj60-commonsmass-20261122.jpg','Kevauto','CC BY-SA 4.0','https://creativecommons.org/licenses/by-sa/4.0','https://commons.wikimedia.org/wiki/File:2023_BAIC_(Beijing)_BJ60,_front_8.17.23.jpg'),
 (r'\bEU5\b',2023,2026,'BAIC EU5','./images/commons/rindelab-baic-eu5-commonsmass-20261122.jpg','최병찬루카스','CC BY-SA 3.0','https://creativecommons.org/licenses/by-sa/3.0','https://commons.wikimedia.org/wiki/File:BAIC_EU5.jpg'),
 (r'\bU5\s*Plus\b',2025,2026,'BAIC U5 Plus 2025','./images/commons/rindelab-baic-u5-plus-commonsmass-20261122.jpg','Retired electrician','CC0','https://creativecommons.org/publicdomain/zero/1.0/deed.en','https://commons.wikimedia.org/wiki/File:Moscow,_rental_white_BAIC_U5_PLUS_April_2025_01.jpg'),
 (r'\bX35\b',2023,2026,'BAIC X35 2023','./images/commons/rindelab-baic-x35-commonsmass-20261122.jpg','Alexander-93','CC BY-SA 4.0','https://creativecommons.org/licenses/by-sa/4.0','https://commons.wikimedia.org/wiki/File:Baic_X35_Automesse_Ludwigsburg_2023_1X7A0072.jpg'),
 (r'\bX55\b(?!\s*Plus)',2023,2026,'BAIC X55 2023','./images/commons/rindelab-baic-x55-commonsmass-20261122.jpg','Alexander-93','CC BY-SA 4.0','https://creativecommons.org/licenses/by-sa/4.0','https://commons.wikimedia.org/wiki/File:Baic_X55_Automesse_Ludwigsburg_2023_1X7A0062.jpg'),
]
for pattern,start,end,model,local,author,lic,licurl,source in reuse:
 assert (ROOT/local.replace('./','')).exists(),local
 B.append({'brand':'Baic','family':model,'pattern':pattern,'from':str(start),'to':str(end),'model':model+' (foto referencial de familia/generación)',
           'author':author,'license':lic,'licenseUrl':licurl,'source':source,'localSrc':local})
# Grand Plus no debe confundirse con el furgón Plus 1.3 de distinta plataforma.
# Se enlaza una foto específica del modelo, NO se descarga con derechos reservados.
B.append({'brand':'Baic','family':'Grand Plus','pattern':r'\bGrand\s*Plus\b','from':'2017','to':'2020',
'model':'BAIC Grand Plus furgón (imagen comercial referencial)','author':'SafeLemon','license':'Derechos reservados',
'licenseUrl':'https://www.safelemon.com/seguro-auto/baic-grand-plus',
'source':'https://www.safelemon.com/seguro-auto/baic-grand-plus',
'localSrc':'https://res.cloudinary.com/safelemon/image/upload/w_1440/blog/r2ajcezxk3kmzv5rbsnz',
'originNote':'Imagen comercial enlazada al dominio de origen; no alojada en RindeLab ni atribuida licencia abierta.'})
assert len(B)==18,len(B)
insert='const baicHistorical20261123='+json.dumps(B,ensure_ascii=False,indent=2)+';\n'
key='const entries=localEntries.concat('
assert base.count(key)==1
base=base.replace(key,insert+key,1)
needle='officialManufacturerBatch1220261122).map('
assert base.count(needle)==1
base=base.replace(needle,'officialManufacturerBatch1220261122,baicHistorical20261123).map(',1)
alias="const photoBrandKey=x=>String(x||'').normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').toLowerCase();"
assert base.count(alias)==1
base=base.replace(alias,"const photoBrandKey=x=>{const name=String(x||'').normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').toLowerCase().trim();return name==='beijing'?'baic':name;};")
J.write_text(base,encoding='utf8')
(ROOT/'data/baic-historical-mappings-20261123.json').write_text(json.dumps({'count':len(B),'images':B,'unresolved':['BAIC Advance 1.5 Sedán: fotografía específica sin verificar, se mantiene marcador de no disponible']},ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print('REGISTERED',len(B),'BAIC photo-year-generation entries')
