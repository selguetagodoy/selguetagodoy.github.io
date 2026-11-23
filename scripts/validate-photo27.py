import requests,io,concurrent.futures,pathlib,json
from PIL import Image,ImageOps,ImageDraw
ROOT=pathlib.Path(__file__).resolve().parents[1];OUT=ROOT/'rindelab/data'
CA=[
 ('Dongfeng','aeolus y3','https://acnews.blob.core.windows.net/imgnews/large/NAZ_ea0c2d8a2eaa4aa6acc36a224b848f0a.webp','https://noticias.autocosmos.cl/2023/09/11/dongfeng-estrena-silenciosamente-al-nuevo-aeolus-y3-en-chile'),
 ('Chery','cl-tiggo-2-pro','https://d21su7g2oc495k.cloudfront.net/images/vehiculos_sinmarca/z7hHPyAszAt16-DIlPqmneXJoFKj3q_foto_.jpg','https://www.rosselotusados.cl/web/vehiculos/view?id=448373'),
 ('Chery','cl-tiggo-3-pro','https://images.prd.kavak.io/images/378842/EXTERIOR-frontSidePilotDistance-1738262203398.jpeg','https://www.kavak.com/cl/venta/chery-tiggo_3_pro-15t_glx_cvt-suv-2024'),
 ('DFSK','Cargo Van EC35','https://latam-editorial.pxcrush.net/chileautos/general/editorial/ec35-4.jpeg?height=682&width=1024','https://www.chileautos.cl/noticias/detalle/dfsk-ec35-un-experto-en-carga-que-se-recarga--29325/'),
 ('Ford','Transit Furgon','https://acnews.blob.core.windows.net/imgnews/paragraph/NPAZ_1b9f6f3a7f0841ac80d539b280f4b774.webp','https://noticias.autocosmos.cl/2024/10/03/ford-actualiza-su-linea-de-furgones-transit-en-chile-para-2025'),
 ('Foton','K1 Cargo','https://acroadtrip.blob.core.windows.net/catalogo-imagenes/l/RT_V_90e3378344c741cdaf20196de0b237d4.webp','https://www.autocosmos.cl/auto/nuevo/foton/k1/28l-cargo-diesel/fcc948c425804c1e9ad90e1f5262e6d8'),
 ('Fuso','Canter 918','https://www.fuso.com.au/contentassets/4fe8b4ccb6ce40e78dc287df5ff1bc38/356631a1-euro-6-canter-918-wide-cab-front34lhs-rgb-fa-1.png?compand=true&rsampler=bicubic&width=2000','https://www.fuso.com.au/range/canter/918/wide-cab/'),
 ('JIM','RE-MAX','https://assets.auto.cl/nvi/jim-re-max-25t-d-mt-4x2-cd-dlx-diesel-manual-4x2-pick-up-cZHrmwzffA8wfDdRqrEe7j.png','https://www.auto.cl/nuevos/marcas/jim'),
 ('Karry','Q22 Cargo BOX','https://acroadtrip.blob.core.windows.net/catalogo-imagenes/xl/RT_V_3762fc19005a4d66af3d1e2d46acd64a.webp','https://www.autocosmos.cl/catalogo/vigente/karry/q22-cargo-box'),
 ('Karry','Q52 Cabina Doble','https://autosummit.cl/storage/cardealer/img/models/366/Q52%20cabina%20doble.jpg','https://autosummit.cl/karry'),
 ('Kyc','X5 Cargo BOX','https://assets.auto.cl/legacy/img/picture_cars/86526-KYC_X5_CARGO_BOX_1.jpg','https://www.auto.cl/nuevos/marcas/kyc/x5-cargo-box/15-g-mt-2p-ch-cs-cargo-box-aa'),
 ('Maxus','C35','https://d21su7g2oc495k.cloudfront.net/images/vehiculos_sinmarca/ZSqZsSJQCLWkltYWg44If9zldTIsVP_foto_.jpeg','https://www.rosselotusados.cl/web/vehiculos/view?id=4632707'),
 ('Mercedes-Benz','Clase A Hatchback','https://assets.auto.cl/nvi/mercedes-benz-clase-a-hatchback-a200-amg-bencina-automatico-4x2-hatchback-3z5ckhD63H4f42aoWB4TZL.png','https://www.auto.cl/nuevos/marcas/mercedes-benz/clase-a-hatchback/a200-amg-bencina-automatico-4x2-hatchback'),
 ('RAM','V1000','https://storage.googleapis.com/fotosautos/automotora/Salfa/1237/1227603/RAM-V1000-lsecpv.webp','https://autosusados.cl/furgones/ram/v1000/1/1227603'),
 ('RAM','V700 City','https://assets.auto.cl/nvi/ram-v700-city-13-d-mt-5p-city-1pl-bgLwXKBbCub48W7t3fnRmp.png','https://www.auto.cl/nuevos/marcas/ram/v700-city/13-d-mt-5p-city-1pl'),
 ('Renault','Duster','https://storage.googleapis.com/fotosautos/automotora/Automotora/172/1235529/RENAULT-DUSTER-azonhb.webp','https://autosusados.cl/vehiculos/renault/duster/1/1235529'),
 ('Toyota','Hiace Minibus','https://res.cloudinary.com/wpchile/image/upload/w_auto%2Cf_auto%2Cq_auto%3Agood/kovacsecrm/cms_contenido/337/TOYOTA_HIACE-TURISMO.png','https://kovacstoyota.cl/campana/cotizador/'),
 ('ZNA','DF6','https://acroadtrip.blob.core.windows.net/catalogo-imagenes/m/RT_V_e8c8dd3dad7041e2b7854e0ee29e035e.jpg','https://www.autocosmos.cl/catalogo/segmentos/zna'),
 ('Zxauto','Grand Lion','https://storage.googleapis.com/fotosautos/automotora/Autotattersall/567/1248050/ZXAUTO-GRANDLION-pnfnol.webp','https://autosusados.cl/camionetas/ZX%20AUTO/GRAND%20LION/1/1248050'),
 ('BMW','Serie M','https://www.rtautomotriz.com/images/JMDAUTOS/Ext246370-1.jpg','https://www.jmdautos.cl/ficha/246370/bmw-m3-2025'),
 ('Gac','Emkoo','https://www.publimetro.cl/resizer/v2/NJRI75QE4ZA33NQUJSJYKIUFVA.jpeg?auth=2437b5138dbe91247b63da4f334be8f3ffe457a33e5045919f0a5db1e46a41aa&height=630&smart=true&width=1200','https://www.publimetro.cl/tacometro/2025/02/26/gac-emkoo-hev-nuevo-suv-hibrido-con-autonomia-de-hasta-385-kml/'),
 ('Soueast','S08 PHEV','https://soueastchile.cl/documents/d/soueast/s08phev-blancobruma-externo-lateral-1','https://soueastchile.cl/w/noticia-lanzamiento-s08-phev'),
 ('Suzuki','Across Hybrid','https://www.suzuki.cl/media/zzkdey2h/generic_suzuki_suzuki-across-hybrid-2026.webp','https://suzuki.cl/blog/nuevo-suv-suzuki/'),
]
def get(t):
 b,f,url,page=t;row={'brand':b,'family':f,'url':url,'source':page}
 try:
  r=requests.get(url,timeout=22,headers={'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'},allow_redirects=True)
  r.raise_for_status();im=ImageOps.exif_transpose(Image.open(io.BytesIO(r.content))).convert('RGB')
  row.update({'http':r.status_code,'w':im.width,'h':im.height,'bytes':len(r.content),'contentType':r.headers.get('Content-Type')})
  im.thumbnail((370,195))
  return row,im
 except Exception as ex:row['error']=str(ex);return row,None
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:rr=list(pool.map(get,CA))
(OUT/'photo27-initial-validation-20261122.json').write_text(json.dumps([p for p,_ in rr],ensure_ascii=False,indent=2)+'\n',encoding='utf8')
for j in range((len(rr)+15)//16):
 im=Image.new('RGB',(1600,4*260),'white');d=ImageDraw.Draw(im)
 for i,(x,photo) in enumerate(rr[j*16:(j+1)*16]):
  px=i%4*400;py=i//4*260
  if photo:im.paste(photo,(px+(400-photo.width)//2,py+4))
  d.text((px+6,py+207),x['brand']+' | '+x['family'][:28],fill='black')
  d.text((px+6,py+227),str(x.get('w','ERR'))+'x'+str(x.get('h','ERR'))+' '+x['url'].split('/')[-1][:44],fill='black')
  if 'error' in x:d.text((px+6,py+246),x['error'][:57],fill='black')
 p=OUT/f'_photo27_initial_sheet_{j+1}.jpg';im.save(p,quality=88)
 print('SHEET',p)
for x,_ in rr:print(x['brand'],x['family'],'HTTP',x.get('http'),'size',x.get('w'),x.get('h'),'ERR',x.get('error','')[:100],flush=True)
