import requests,json,pathlib,concurrent.futures,time
R=pathlib.Path(__file__).resolve().parents[1];D=R/'rindelab/data'
Q={
'Ford|Transit Custom Furgon':['Ford Transit Custom panel van 2024','2024 Ford Transit Custom'],
'Ford|Transit Furgon':['Ford Transit Mk8 panel van 2024','2023 Ford Transit van'],
'Chevrolet|N400 Cargo':['Wuling Hongguang V 2022 panel van'],
'RAM|1000 Pick UP':['2024 Fiat Toro pickup','2023 Ram 1000'],
'RAM|V1000':['Fiat Doblo 2023 panel van','2024 Fiat Doblo III'],
'RAM|V700 City':['Fiat Fiorino cargo van 2022','2024 Fiat Fiorino'],
'Mercedes-Benz|Clase A Hatchback':['2024 Mercedes-Benz A-Class W177 facelift front','Mercedes A200 W177 hatchback'],
'Mercedes-Benz|Vito Minibus':['2024 Mercedes-Benz Vito Tourer 2024','Mercedes Vito Tourer W447 front'],
'Mini|JCW Eléctrico':['2025 Mini John Cooper Works Electric J01','Mini Cooper JCW electric hatch'],
'Fuso|Canter 515':['2024 Mitsubishi Fuso Canter truck'],
'Hino|XZU 616':['Hino 300 Series truck 2024'],
'Kia|Frontier II':['Kia Bongo III truck 2024','2023 Kia Bongo K2500'],
'Toyota|Hiace Minibus':['2024 Toyota Hiace H300 Commuter bus','Toyota Hiace H300 minibus 2025'],
'Suzuki|alto':['2022 Maruti Suzuki Alto K10 India','Suzuki Alto K10 2023'],
'DFSK|E5 Plus':['Fengon E5 2024 SUV','Dongfeng Fengon E5 PHEV'],
'DFSK|SUV600 PHEV':['Dongfeng Fengon 600 PHEV','DFSK SUV600'],
'DFSK|Cargo Van EC35':['DFSK EC35 electric van','Dongfeng Sokon EC35 electric'],
'Soueast|S06':['Soueast S06 2025','Jetour Dashing 2024 SUV'],
'Soueast|S09':['Soueast S09 2025','Jetour X90 Plus 2025'],
'Chery|cl-tiggo-2-pro':['2024 Chery Tiggo 2 Pro','Chery Tiggo 3x Plus'],
'Chery|cl-tiggo-3-pro':['Chery Tiggo 3 Pro 2024','Chery Tiggo 3x Pro'],
'Chery|Tiggo 2 Pro Max':['Chery Tiggo 2 Pro Max','Chery Tiggo 3x Plus'],
'JMC|All New Vigus Pro':['2025 JMC Vigus Pro pickup'],
'JMC|Vigus EV':['JMC Vigus electric pickup'],
'JMC|EV3':['JMC Yizhi EV3 electric','JMC EV3 China'],
'Kaiyi|Kye-5':['Kaiyi E5 sedan 2024','2024 Kaiyi E5'],
'Kaiyi|Kyx3':['Kaiyi X3 SUV 2024'],
'Kaiyi|Kyx3 PRO':['Kaiyi X3 Pro SUV 2024'],
'Foton|FT':['Foton Tunland 2024 pickup'],
'Baic|X7':['Beijing X7 SUV China','Beijing X7 2023'],
'ZNA|DF6':['Zhengzhou Nissan DF6 pickup','Dongfeng Rich6 pickup'],
'Zxauto|Grand Lion':['ZXAUTO Grand Lion pickup'],
'Foton|TM3':['Foton Truck Mate TM3 truck'],
'Shineray|T50 CS':['Jinbei T50 2024 truck'],
'JAC|Refine Cargo':['JAC Refine M4 van 2024'],
'JAC|Refine Pasajeros':['JAC Refine M4 passenger'],
'BMW|Serie 2':['BMW 2 Series G42 Coupe 2024'],
'BMW|Serie 4':['BMW 4 Series G22 2024 Coupe'],
'Gac|Emkoo':['GAC Emkoo HEV 2024','GAC Emkoo SUV 2024'],
'BYD|Yuan Pro DM-i':['BYD Yuan Pro DM-i 2026','BYD Yuan Up DM-i 2026'],
'Dongfeng|L7':['Dongfeng Aeolus L7 PHEV','2024 Aeolus L7'],
'Omoda|C5 SHS-H':['Omoda 5 SHS Hybrid 2025'],
'Karry|Q22 Cabina Simple':['Karry Q22 single cab truck'],
'Foton|WONDER':['Foton Wonder pickup 2024'],
'Maxus|C35':['Maxus C35 minivan'],
'JIM|RE-MAX':['JIM Re Max pickup'],
}
H={'User-Agent':'RindeLabCommonsGap5Audit/1.0 (https://selguetagodoy.github.io/rindelab/)'}
def search(q):
 for i in range(3):
  try:
   r=requests.get('https://commons.wikimedia.org/w/api.php',headers=H,params={'action':'query','list':'search','srsearch':q,'srnamespace':6,'srlimit':15,'format':'json','formatversion':2},timeout=25)
   if r.status_code in (429,503):time.sleep((i+1)*2);continue
   r.raise_for_status();return [x['title'] for x in r.json().get('query',{}).get('search',[]) if x['title'].lower().endswith(('.jpg','.jpeg','.png','.webp'))]
  except Exception as e:time.sleep(i+1)
 return []
def one(k):
 titles=[]
 for q in Q[k]:
  for t in search(q):
   if t not in titles:titles.append(t)
  if len(titles)>=18:break
  time.sleep(.3)
 return k,{'queries':Q[k],'titles':titles}
results={}
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
 for i,(k,v) in enumerate(pool.map(one,Q),1):
  results[k]=v
  print(i,len(Q),k,len(v['titles']),' '.join(t[:55] for t in v['titles'][:3]),flush=True)
(D/'commons-gap5-discovery-20261122.json').write_text(json.dumps({'source':'Wikimedia Commons search','models':results},ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print('TARGETS WITH CANDIDATES',sum(bool(v['titles']) for v in results.values()),flush=True)
