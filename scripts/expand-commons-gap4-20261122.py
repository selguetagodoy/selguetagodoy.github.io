import requests, json, pathlib, concurrent.futures, time, threading
ROOT=pathlib.Path(__file__).resolve().parents[1]
p=ROOT/'rindelab/data/commons-gap4-discovery-20261122.json'
j=json.loads(p.read_text(encoding='utf8'));gs=j['groups']
QUERIES={
'Baic|X7':['BAIC Beijing X7 SUV','Beijing X7 car 2024','BAIC X7 SUV'],
'BMW|Serie 8 Coupe':['BMW 840i Coupe G15','BMW 8 Series G15 coupe'],
'Changan|CS35 Max':['Changan CS35 Max','Changan CS35 Plus 2025'],
'Chevrolet|Silverado CD':['Chevrolet Silverado 1500 2024 Crew Cab','2024 Chevrolet Silverado Z71'],
'Ford|Explorer 26 MY':['Ford Explorer U625 2025','2025 Ford Explorer ST U625'],
'Ford|Transit Furgon':['2024 Ford Transit panel van','2025 Ford Transit cargo van'],
'Ford|Transit Custom Furgon':['Ford Transit Custom 2024 panel van','Ford Transit Custom II 2024'],
'Foton|WONDER':['Foton Wonder Pickup','Foton Wonder 2024'],
'Hyundai|GRAND I,10 AI3 HB':['Hyundai AI3 Grand i10','2024 Hyundai Grand i10 Nios'],
'Mercedes-Benz|Clase G':['2024 Mercedes G 500 W463A','2024 Mercedes AMG G63 W463'],
'Mercedes-Benz|Vito Minibus':['Mercedes Vito Tourer W447','Mercedes Vito Tourer 2024'],
'MG|ZX':['MG ZX Chile SUV','MG ZS facelift 2024'],
'Renault|Duster':['2025 Renault Duster III','Renault Duster 2025 SUV'],
'Renault|Koleos':['Renault Koleos 2024 facelift'],
'RAM|V1000':['Ram V1000 furgon','Ram ProMaster Rapid cargo van'],
'Suzuki|alto':['Suzuki Alto K10 2024','Suzuki Alto HA37 2022'],
'Toyota|Hiace Minibus':['2024 Toyota Hiace Commuter H300','Toyota Hiace H300 bus'],
'Gac|Emkoo':['2025 GAC Emkoo Hybrid HEV','GAC Emkoo hybrid'],
'BMW|Serie 7':['BMW 7-Series G70 750e','BMW 750e G70'],
'Ferrari|SF90':['Ferrari SF90 Stradale','Ferrari SF90 Spider'],
'Mini|JCW Eléctrico':['2025 Mini John Cooper Works Electric','Mini Cooper JCW Electric J01'],
'BYD|Atto 8 DM-i':['BYD Tang L DM-i','BYD Tang L hybrid'],
'BYD|Atto 8 DM-p':['BYD Tang L DM-p','BYD Tang L hybrid'],
'BYD|Yuan Pro DM-i':['BYD Yuan Pro DM-i','BYD Yuan Up DM-i'],
'Changan|Avatr 07':['Avatr 07 2025','Avatr 07 EREV'],
'Dongfeng|L7':['Aeolus L7 PHEV','Dongfeng Aeolus L7'],
'Landking|LK8 EV':['Landking LK8 EV truck'],
'Ford|E-Transit Chasis':['Ford E Transit chassis cab electric'],
'Omoda|C5 SHS-H':['Omoda C5 SHS-H hybrid','Omoda 5 SHS H'],
'Soueast|S08 PHEV':['Soueast S08 PHEV SUV'],
'Great Wall|Poer P500':['GWM Poer Sahar PHEV','GWM Poer P500 hybrid'],
'Mazda|All New CX-5':['2026 Mazda CX-5 new generation','2026 Mazda CX-5'],
'Porsche|Cayenne':['Porsche Cayenne Electric 2026','Porsche Cayenne EV 2026'],
'Renault|Boreal':['Renault Boreal 2026 SUV','Renault Boreal 2025'],
'Volvo|EX40':['Volvo EX40 2025 SUV','Volvo XC40 Recharge facelift 2024'],
'Jetour|T1 PHEV':['Jetour T1 i-DM','Jetour T1 PHEV'],
'Suzuki|Across Hybrid':['Suzuki Across Hybrid 2025']
}
UA={'User-Agent':'RindeLabCatalogAttribution/2.1 (https://selguetagodoy.github.io/rindelab/)'}
def get(q):
 for i in range(3):
  try:
   r=requests.get('https://commons.wikimedia.org/w/api.php',params={'action':'query','list':'search','srsearch':q,'srnamespace':6,'srlimit':15,'format':'json','formatversion':2},headers=UA,timeout=25)
   if r.status_code in (429,503):time.sleep((i+1)*3);continue
   r.raise_for_status();return [x['title'] for x in r.json().get('query',{}).get('search',[]) if x['title'].lower().endswith(('.jpg','.png','.jpeg','.webp'))]
  except Exception as e:time.sleep((i+1)*2)
 return []
def run(t):
 brand,family=t
 gg=next((x for x in gs if x['brand']==brand and x['family']==family),None)
 if gg is None:return (brand,family,0,'NOT FOUND')
 old=set(gg['candidateTitles'])
 for q in QUERIES[brand+'|'+family]:
  titles=get(q)
  for title in titles:
   if title not in old:gg['candidateTitles'].append(title);old.add(title)
  time.sleep(.4)
 return (brand,family,len(gg['candidateTitles']),'')
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
 for i,out in enumerate(pool.map(run,[tuple(k.split('|',1)) for k in QUERIES]),1):
  print(i,'/',len(QUERIES),*out,flush=True)
p.write_text(json.dumps(j,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print('EXPANDED GROUPS',sum(bool(x['candidateTitles']) for x in gs),flush=True)
