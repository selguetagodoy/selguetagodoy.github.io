/* Fotografías referenciales verificadas en Wikimedia Commons. Ninguna acredita una versión comercial exacta. */
(()=>{'use strict';
const localEntries=[
 {brand:'Toyota',re:/\bCorolla\s+Cross\b/i,tech:'HEV',from:'2021',to:'2024',src:'./images/toyota-corolla-cross-hev-2022.jpg',model:'Toyota Corolla Cross 1.8 HEV (2022)',author:'Ethan Llamas',source:'https://commons.wikimedia.org/wiki/File:Toyota_Corolla_Cross_1.8_HEV_2022_(1).jpg',license:'CC BY-SA 4.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/'},
 {brand:'Toyota',re:/\bCorolla\s+Cross\b/i,tech:'Bencina',from:'2021',to:'2023',src:'./images/toyota-corolla-cross-20-2022.jpg',model:'Toyota Corolla Cross 2.0 SEG (2022)',author:'RL GNZLZ',source:'https://commons.wikimedia.org/wiki/File:Toyota_Corolla_Cross_2.0_SEG_2022_(52601788623).jpg',license:'CC BY-SA 2.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/2.0/'},
 {brand:'Leapmotor',re:/\bB10\b/i,tech:'EV',from:'2025',to:'2026',src:'./images/leapmotor-b10-2025.jpg',model:'Leapmotor B10 (2025)',author:'Chanokchon',source:'https://commons.wikimedia.org/wiki/File:2025_Leapmotor_B10_Design.jpg',license:'CC BY-SA 4.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/'},
 {brand:'BYD',re:/\b(?:Dolphin\s+Mini|Seagull)\b/i,tech:'EV',from:'2024',to:'2026',src:'./images/byd-dolphin-mini-2024.jpg',model:'BYD Dolphin Mini / Seagull (2024)',author:'Mateusmatsuda',source:'https://commons.wikimedia.org/wiki/File:BYD_DOLPHIN_MINI_(BRAZIL)_BYD_SEAGULL.jpg',license:'CC BY 4.0',licenseUrl:'https://creativecommons.org/licenses/by/4.0/'}
];
// Lote 2026-10-20. Fotografías de familias (nunca acreditan acabado ni versión comercial exacta).
// Archivo, autor y licencia cotejados con la página de cada archivo de Wikimedia Commons.
// Las imágenes de Commons se sirven vía Special:FilePath con ancho acotado; las cuatro locales se conservan.
const licensed=[
 {
  "brand": "Tesla",
  "pattern": "\\bModel\\s*3\\b",
  "tech": "EV",
  "from": "2024",
  "to": "2026",
  "file": "2024 Tesla Model 3.jpg",
  "model": "Tesla Model 3 (2024)",
  "author": "Lcaa9",
  "license": "CC BY 4.0"
 },
 {
  "brand": "Tesla",
  "pattern": "\\bModel\\s*Y\\b",
  "tech": "EV",
  "from": "2024",
  "to": "2026",
  "file": "2024 Tesla Model Y Long Range, rear right, 07-28-2024.jpg",
  "model": "Tesla Model Y (2024)",
  "author": "Ethan Llamas",
  "license": "CC BY-SA 4.0"
 },
 {
  "brand": "Kia",
  "pattern": "\\bEV5\\b",
  "tech": "EV",
  "from": "2024",
  "to": "2026",
  "file": "Kia EV5 002.jpg",
  "model": "Kia EV5 (2024)",
  "author": "JustAnotherCarDesigner",
  "license": "CC0 1.0"
 },
 {
  "brand": "Kia",
  "pattern": "\\bEV6\\b",
  "tech": "EV",
  "from": "2022",
  "to": "2024",
  "file": "Kia EV6.jpg",
  "model": "Kia EV6 (2024)",
  "author": "Ganesh Mohan T",
  "license": "CC BY-SA 4.0"
 },
 {
  "brand": "Kia",
  "pattern": "\\bEV6\\b",
  "tech": "EV",
  "from": "2025",
  "to": "2026",
  "file": "2025 Kia EV6 GT-Line Auto Zuerich 2024 DSC 6471.jpg",
  "model": "Kia EV6 GT-Line restyling (2025)",
  "author": "Alexander-93",
  "license": "CC BY-SA 4.0"
 },
 {
  "brand": "Kia",
  "pattern": "\\bEV9\\b",
  "tech": "EV",
  "from": "2024",
  "to": "2026",
  "file": "2024 Kia EV9 GT-Line AWD 2.jpg",
  "model": "Kia EV9 (2024)",
  "author": "Calreyn88",
  "license": "CC BY-SA 4.0"
 },
 {
  "brand": "Hyundai",
  "pattern": "\\bIoniq\\s*5\\b",
  "tech": "EV",
  "from": "2022",
  "to": "2026",
  "file": "Hyundai Ioniq 5.jpg",
  "model": "Hyundai Ioniq 5 (2022)",
  "author": "TTTNIS",
  "license": "CC0 1.0"
 },
 {
  "brand": "Hyundai",
  "pattern": "\\bKona\\b",
  "tech": "EV",
  "from": "2023",
  "to": "2026",
  "file": "Hyundai Kona Electric 20240502 HOF2528-HDR RAW-Export cens.png",
  "model": "Hyundai Kona Electric (2024)",
  "author": "PantheraLeo1359531",
  "license": "CC BY 4.0"
 },
 {
  "brand": "Mazda",
  "pattern": "\\bCX[\\s-]*5\\b",
  "tech": [
   "Bencina",
   "Diésel"
  ],
  "from": "2017",
  "to": "2026",
  "file": "2022 Mazda CX-5 2.0 front.jpg",
  "model": "Mazda CX-5 (2022)",
  "author": "ShangTW",
  "license": "CC BY-SA 4.0"
 },
 {
  "brand": "Mazda",
  "pattern": "\\bCX[\\s-]*30\\b",
  "tech": [
   "Bencina",
   "Diésel",
   "MHEV"
  ],
  "from": "2019",
  "to": "2026",
  "file": "Mazda CX-30 2,0 2022.jpg",
  "model": "Mazda CX-30 (2022)",
  "author": "Tronerud",
  "license": "CC BY-SA 4.0"
 },
 {
  "brand": "Nissan",
  "pattern": "\\bLeaf\\b",
  "tech": "EV",
  "from": "2018",
  "to": "2026",
  "file": "2018 Nissan Leaf Tekna Front.jpg",
  "model": "Nissan Leaf (2018)",
  "author": "Vauxford",
  "license": "CC BY-SA 4.0"
 },
 {
  "brand": "BYD",
  "pattern": "\\bSeal\\b",
  "tech": "EV",
  "from": "2023",
  "to": "2026",
  "file": "BYD Seal.jpg",
  "model": "BYD Seal (2024)",
  "author": "Ganesh Mohan T",
  "license": "CC BY-SA 4.0"
 },
 {
  "brand": "Leapmotor",
  "pattern": "\\b(?:LPM\\s*)?C10\\b",
  "tech": [
   "EV",
   "REEV"
  ],
  "from": "2024",
  "to": "2026",
  "file": "Leapmotor C10 EV 01 China 2024-03-24.jpg",
  "model": "Leapmotor C10 eléctrico (2024)",
  "author": "Navigator84",
  "license": "CC BY-SA 4.0"
 },
 {
  "brand": "Porsche",
  "pattern": "\\bTaycan\\b",
  "tech": "EV",
  "from": "2020",
  "to": "2026",
  "file": "Porsche Taycan.jpg",
  "model": "Porsche Taycan (2019)",
  "author": "Ralf Krebs",
  "license": "CC BY 3.0"
 },
 {
  "brand": "BMW",
  "pattern": "\\bi4\\b",
  "tech": "EV",
  "from": "2022",
  "to": "2026",
  "file": "BMW i4 IMG 6695.jpg",
  "model": "BMW i4 (2022)",
  "author": "Alexander Migl",
  "license": "CC BY-SA 4.0"
 },
 {
  "brand": "Toyota",
  "pattern": "\\bHilux\\b",
  "tech": [
   "Diésel",
   "Bencina"
  ],
  "from": "2018",
  "to": "2025",
  "file": "Toyota Hilux 4x4 V Conquest 2022 (1).jpg",
  "model": "Toyota Hilux (2022)",
  "author": "Captainmorlypogi1959",
  "license": "CC BY-SA 4.0"
 },
 {
  "brand": "MG",
  "pattern": "\\bMG\\s*4\\b|\\bMG4\\b",
  "tech": "EV",
  "from": "2023",
  "to": "2026",
  "file": "MG4 Electric – f 21042025.jpg",
  "model": "MG4 Electric (2025, primera generación)",
  "author": "M 93",
  "license": "CC BY-SA 3.0 DE"
 },
 {
  "brand": "Great Wall",
  "pattern": "\\bORA[\\s-]*03\\b",
  "tech": "EV",
  "from": "2024",
  "to": "2026",
  "file": "GWM Ora 03 – f 12102025.jpg",
  "model": "GWM ORA 03 (2025)",
  "author": "M 93",
  "license": "CC BY-SA 3.0 DE"
 },
 {
  "brand": "Suzuki",
  "pattern": "\\bSwift\\b",
  "tech": [
   "Bencina",
   "MHEV",
   "HEV"
  ],
  "from": "2024",
  "to": "2026",
  "file": "2024 Suzuki Swift.jpg",
  "model": "Suzuki Swift (2024)",
  "author": "Calreyn88",
  "license": "CC BY-SA 4.0"
 },
 {
  "brand": "Volkswagen",
  "pattern": "\\bID[\\s.]*4\\b",
  "tech": "EV",
  "from": "2021",
  "to": "2026",
  "file": "Volkswagen ID.4 IMG 5655.jpg",
  "model": "Volkswagen ID.4 (2021)",
  "author": "Alexander Migl",
  "license": "CC BY-SA 4.0"
 },
 {
  "brand": "BYD",
  "pattern": "\\bShark\\b",
  "tech": "PHEV",
  "from": "2025",
  "to": "2026",
  "file": "BYD Shark 6 DMO Premium 2025.jpg",
  "model": "BYD Shark 6 DMO (2025)",
  "author": "Captainmorlypogi1959",
  "license": "CC BY-SA 4.0"
 }
];
const licenseUrls={
 'CC0 1.0':'https://creativecommons.org/publicdomain/zero/1.0/',
 'CC BY 3.0':'https://creativecommons.org/licenses/by/3.0/',
 'CC BY 4.0':'https://creativecommons.org/licenses/by/4.0/',
 'CC BY-SA 4.0':'https://creativecommons.org/licenses/by-sa/4.0/',
 'CC BY-SA 3.0 DE':'https://creativecommons.org/licenses/by-sa/3.0/de/'
};
const commonsFile=p=>'https://commons.wikimedia.org/wiki/Special:FilePath/'+encodeURIComponent(p.file.replace(/ /g,'_'))+'?width=720';
const commonsSource=p=>'https://commons.wikimedia.org/wiki/File:'+encodeURIComponent(p.file.replace(/ /g,'_'));
const entries=localEntries.concat(licensed.map(p=>({...p,re:new RegExp(p.pattern,'i'),src:commonsFile(p),source:commonsSource(p),licenseUrl:licenseUrls[p.license]})));

function find(row,F){
 const brand=String(row[F.BRAND]||''),model=String(row[F.MODEL]||''),tech=String(row[F.TECH]||''),year=String(row[F.DATE]||'').slice(0,4);
 return entries.find(p=>p.brand.toLowerCase()===brand.toLowerCase()&&p.re.test(model)&&(!p.tech||(Array.isArray(p.tech)?p.tech.includes(tech):p.tech===tech))&&year>=p.from&&year<=p.to)||null;
}
function findCommercial(p){
 if(!p||!p.brand||!p.family)return null;
 const y=String(p.modelYear||String(p.checkedAt||'').slice(0,4)||'2026').slice(0,4);
 const row=[p.brand,p.family,p.technology||'',null,null,null,null,null,y+'-01-01'];
 return find(row,{BRAND:0,MODEL:1,TECH:2,DATE:8});
}
function commercialNode(p){
 const photo=findCommercial(p);if(!photo)return null;
 const fig=document.createElement('figure');fig.className='rinde-photo-thumb';
 const img=document.createElement('img');img.src=photo.src;img.alt='Fotografía referencial del modelo '+photo.model+'; no acredita la versión anunciada';img.loading='lazy';img.decoding='async';img.width=176;img.height=100;
 const cap=document.createElement('figcaption');cap.className='rinde-photo-attribution';
 const source=document.createElement('a');source.href=photo.source;source.target='_blank';source.rel='noopener noreferrer';source.textContent='Foto: '+photo.author;
 const license=document.createElement('a');license.href=photo.licenseUrl;license.target='_blank';license.rel='noopener noreferrer';license.textContent=photo.license;
 cap.append(source,document.createTextNode(' · '),license);fig.append(img,cap);return fig;
}
function render(row,F,safe){
 const p=find(row,F);if(!p)return null;
 return '<div class="vehicle-visual vehicle-photo">'+
 '<img src="'+safe(p.src)+'" width="960" height="540" loading="lazy" decoding="async" alt="Fotografía referencial de '+safe(p.model)+'; no acredita la versión homologada">'+
 '<div class="vehicle-photo-credit"><span>Foto del modelo · </span><a href="'+safe(p.source)+'" target="_blank" rel="noopener noreferrer" title="Ver fuente de la fotografía">'+safe(p.author)+'</a><span> · </span><a href="'+safe(p.licenseUrl)+'" target="_blank" rel="noopener noreferrer">'+safe(p.license)+'</a></div></div>';
}
// Error de imagen: no mostrar pictogramas rotos ni asignar otra carrocería por defecto.
document.addEventListener('error',event=>{
 const img=event.target;
 if(!(img instanceof HTMLImageElement))return;
 const container=img.closest('.vehicle-photo,.rinde-photo-thumb');
 if(!container)return;
 img.remove();
 const label=document.createElement('span');label.className='rinde-photo-unavailable';label.textContent='Fotografía no disponible temporalmente';
 container.prepend(label);
},true);
window.RindelabPhotos=Object.freeze({render,find,findCommercial,commercialNode,count:entries.length});
})();