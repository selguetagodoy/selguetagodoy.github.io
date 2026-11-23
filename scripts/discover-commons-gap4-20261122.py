#!/usr/bin/env python3
"""Discover candidate photos for ALL outstanding commercial model groups, Commons only."""
import json, re, pathlib, html, unicodedata, concurrent.futures, time, random, threading, requests
ROOT=pathlib.Path(__file__).resolve().parents[1]
DATA=ROOT/'rindelab/data'
gaps=[x for x in json.loads((DATA/'catalog-coverage-20261122.json').read_text(encoding='utf8'))['allGroups'] if not x['photo']]
HEAD={'User-Agent':'RINDELABChileImageResearch/2.0 (https://selguetagodoy.github.io/rindelab/; image catalog verification)'}
ALIASES={
'Dongfeng|aeolus y3':['Dongfeng Aeolus Y3 car','Dongfeng Fengshen Y3'],
'Dongfeng|s50 eve':['Dongfeng S50 EV','Dongfeng Fengxing S50 EV'],
'Dongfeng|t5':['Dongfeng Fengxing T5'],
'Dongfeng|T5 L':['Dongfeng Fengxing T5L'],
'Dongfeng|Huge':['Dongfeng Aeolus Huge'],
'Dongfeng|L7':['Dongfeng Aeolus L7'],
'Foton|tm cabina doble':['Foton TM3','Foton Truck Mate double cab'],
'Foton|tm cabina simple':['Foton Truck Mate','Foton TM3 truck'],
'Foton|tm cargo box':['Foton TM3 box truck'],
'Foton|tm3 refrigerado':['Foton TM3 refrigerator'],
'Foton|tm5 cabina simple':['Foton TM5'],
'Foton|tm5 cargo box':['Foton TM5 truck'],
'Foton|view grand pasajero':['Foton View Grand'],
'Foton|FT Crew':['Foton Tunland FT'],
'Foton|FT':['Foton Tunland'],
'Foton|TM3':['Foton TM3'],
'Foton|TM5':['Foton TM5'],
'Foton|WONDER':['Foton Wonder pickup'],
'Changan|Serie M':['Changan M201 van','Changan Star truck M201'],
'Changan|Serie M Cargo BOX':['Changan M201 box truck'],
'Changan|Serie M Furgon':['Changan M201 van'],
'Changan|CS35 Max':['Changan CS35 Plus','Changan CS35 Max'],
'Changan|star-truck-plus-cargo-box':['Changan Star Truck Plus cargo box'],
'Changan|star-truck-plus-pick-up-cabina-doble':['Changan Star Truck Plus pickup double cab','Changan MD301 Plus'],
'Changan|star-truck-plus-pick-up-cabina-simple':['Changan MD301 single cab'],
'BMW|Serie 8 Coupe':['BMW 840i Coupe G15','BMW 8 series Coupe G15'],
'BMW|Serie 2':['BMW 2 Series Gran Coupe F44','BMW 2 series coupe G42'],
'BMW|Serie 4':['BMW 4 Series coupe G22'],
'BMW|Serie M':['BMW M3 G80','BMW M4 G82'],
'BMW|Serie 7':['BMW 750e G70','BMW G70 7 Series PHEV'],
'Mercedes-Benz|Clase A Hatchback':['Mercedes A200 W177 hatchback'],
'Mercedes-Benz|Clase G':['Mercedes G500 W463A','Mercedes G class 2023'],
'Mercedes-Benz|Vito Furgon':['Mercedes Vito W447 van','Mercedes Vito panel van'],
'Mercedes-Benz|Vito Minibus':['Mercedes Vito Tourer','Mercedes Vito W447 passenger'],
'Chevrolet|Silverado CD':['2024 Chevrolet Silverado 1500 crew cab','Chevrolet Silverado 2024'],
'Chevrolet|N400 Cargo':['Chevrolet N400 cargo van','Wuling Hongguang V'],
'Chevrolet|sail-hatchback':['Chevrolet Sail hatchback 2023'],
'Ford|Explorer 26 MY':['2025 Ford Explorer SUV U625'],
'Ford|Transit Chasis':['Ford Transit cab chassis'],
'Ford|Transit Furgon':['Ford Transit panel van 2024'],
'Ford|Transit Custom Furgon':['Ford Transit Custom 2024 van'],
'Ford|transit-custom-minibus':['Ford Tourneo Custom 2024'],
'Ford|E-Transit Chasis':['Ford E-Transit chassis electric'],
'RAM|ram2500':['2024 RAM 2500 crew cab'],
'RAM|2500 CD':['2024 RAM 2500 heavy duty'],
'RAM|1000 Pick UP':['Ram 1000 pickup Fiat Toro'],
'RAM|V1000':['Ram ProMaster Rapid','Ram V1000'],
'RAM|V700 City':['RAM V700 City van'],
'Renault|Duster':['Renault Duster 2024'],
'Renault|Koleos':['Renault Koleos 2023 SUV'],
'Renault|Boreal':['2026 Renault Boreal'],
'Volkswagen|Saveiro CD':['Volkswagen Saveiro Double cab 2024','2024 Volkswagen Saveiro pickup'],
'Suzuki|alto':['2022 Suzuki Alto HA37','2023 Maruti Alto K10'],
'Suzuki|Across Hybrid':['Suzuki Across SUV plug in hybrid'],
'Toyota|Hiace Minibus':['Toyota Hiace H300 minibus','Toyota Hiace passenger 2024'],
'Toyota|Yaris':['Toyota Yaris 2024 hatchback','Toyota Yaris sedan 2024'],
'Porsche|Macan':['2025 Porsche Macan Electric'],
'Porsche|Cayenne':['2026 Porsche Cayenne Electric'],
'Geely|EX5-EMi':['Geely Starray EM-i PHEV','Geely Galaxy Starship 7'],
'BYD|Atto 8 DM-i':['BYD Tang L DM-i','BYD Atto 8'],
'BYD|Atto 8 DM-p':['BYD Tang L DM-p','BYD Atto 8'],
'BYD|Yuan Pro DM-i':['BYD Yuan Pro DM-i'],
'JMC|EV3':['JMC EV3 car'],
'JMC|Vigus EV':['JMC Vigus electric pickup'],
'JMC|All New Vigus Pro':['JMC Vigus Pro pickup'],
'JMC|All New Vigus Work':['JMC Vigus Work pickup'],
'Fuso|Canter 515':['Mitsubishi Fuso Canter 515'],
'Fuso|Canter 718':['Mitsubishi Fuso Canter 718'],
'Fuso|Canter 918':['Mitsubishi Fuso Canter 918'],
'Hyundai|GRAND I-10 AI3 SEDAN':['Hyundai Grand i10 Sedan AI3','Hyundai Aura sedan'],
'Hyundai|GRAND I,10 AI3 HB':['Hyundai Grand i10 AI3 hatchback'],
'Hyundai|Grand i10 Hatchback':['Hyundai Grand i10 2024 hatchback'],
'Opel|new crossland':['2025 Opel Crossland EV'],
'Opel|New Crossland':['2025 Opel Frontera SUV','Opel Crossland 2024'],
'JAC|X200':['JAC X200 truck'],
'JAC|Refine Cargo':['JAC Refine van'],
'JAC|Refine Pasajeros':['JAC Refine passenger'],
'JAC|Refine Cargo EV':['JAC Refine M4 electric van'],
'JAC|Ignite30X':['JAC Ignite30X electric'],
'Mini|JCW Eléctrico':['Mini John Cooper Works Electric 2025'],
'MG|5 Sedan':['MG 5 sedan 2024'],
'MG|ZX':['MG ZX SUV','MG ZS'],
'Mazda|6 Sedan':['Mazda 6 GJ sedan'],
'Mazda|CX-5':['Mazda CX-5 2024'],
'Mazda|All New CX-5':['Mazda CX-5 2026 new generation'],
'Gac|Emkoo':['GAC Emkoo hybrid 2024'],
'Volvo|EX40':['Volvo EX40 2025 electric SUV'],
'Hino|City 515':['Hino 300 Series 515'],
'Hino|XZU 616':['Hino XZU616 300 series'],
'Hino|XZU 617 DC':['Hino XZU617 double cab'],
'Hino|XZU 816':['Hino 300 XZU816'],
'Hino|XZU 817':['Hino 300 XZU817'],
'Hino|XZU 917':['Hino 300 XZU917'],
'Shineray|T32 CD':['Shineray T32 pickup'],
'Shineray|T50 CS':['Shineray T50'],
'Shineray|T52 CD':['Shineray T52 pickup'],
'Shineray|T30 CS':['Shineray T30 mini truck'],
'Shineray|X30 con A/C':['Shineray X30 van'],
'Karry|Q22 Cabina Doble':['Karry Q22 double cab'],
'Karry|Q22 Cabina Simple':['Karry Q22 pickup'],
'Karry|Q22 Cargo BOX':['Karry Q22 box truck'],
'Karry|Q51 Cabina Simple':['Karry Q51 truck'],
'Karry|Q52 Cabina Doble':['Karry Q52 truck'],
'Kyc|T3 Gran Mamut':['KYC T3 truck'],
'Kyc|T3 Gran Mamut Cargo BOX':['KYC T3 box truck'],
'Kyc|X5 Cargo BOX':['KYC X5 truck'],
'Kyc|X5 Pick UP':['KYC X5 pickup'],
'Kyc|X5 Pick UP Doble Cabina':['KYC X5 double cab'],
'Landking|LK 1016':['Landking LK1016 truck'],
'Landking|LK 614':['Landking LK614 truck'],
'Landking|LK3':['Landking LK3 pickup'],
'Landking|LK5':['Landking LK5 truck'],
'Landking|LK8 EV':['Landking LK8 electric'],
}
def plain(s):return re.sub(r'\s+',' ',re.sub(r'<[^>]*>','',html.unescape(str(s or '')))).strip()
def makequeries(g):
 brand=g['brand'];f=g['family'];key=brand+'|'+f
 default=(brand+' '+re.sub(r'[-_]',' ',f).replace('cl tiggo','Tiggo')).strip()
 choices=[default]+ALIASES.get(key,[])
 if brand=='Great Wall':
  choices=[f, 'GWM '+f]+choices
 if brand=='Mercedes-Benz':choices.append('Mercedes '+f)
 if brand=='MG':choices.append('MG Motor '+f)
 if brand=='Fuso':choices.append('Fuso '+f)
 return list(dict.fromkeys(choices))[:3]
def api(q):
 try:
  rr=requests.get('https://commons.wikimedia.org/w/api.php',headers=HEAD,params={'action':'query','list':'search','srsearch':q,'srnamespace':6,'srlimit':18,'format':'json','formatversion':'2'},timeout=24)
  rr.raise_for_status();return rr.json().get('query',{}).get('search',[])
 except Exception as ex:return []
def get(g):
 out={**g,'queries':[],'candidateTitles':[]}
 for q in makequeries(g):
  ans=api(q)
  out['queries'].append({'q':q,'n':len(ans)})
  for x in ans:
   title=x['title']
   if title.lower().endswith(('.jpg','.jpeg','.png','.webp')) and title not in out['candidateTitles']:
    out['candidateTitles'].append(title)
  if len(out['candidateTitles'])>=15:break
 return out
results=[]
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
 for i,out in enumerate(pool.map(get,gaps),1):
  results.append(out)
  print(f'{i}/{len(gaps)} {out["brand"]} {out["family"]}: {len(out["candidateTitles"])} titles',flush=True)
f=DATA/'commons-gap4-discovery-20261122.json'
f.write_text(json.dumps({'source':'Wikimedia Commons API namespace 6 search','searched':len(gaps),'groups':results},ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print('CANDIDATES',sum(bool(x['candidateTitles']) for x in results),'OUTFILE',f,flush=True)
