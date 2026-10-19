/* Fotografías referenciales verificadas en Wikimedia Commons. Ninguna acredita una versión comercial exacta. */
(()=>{'use strict';
const entries=[
 {brand:'Toyota',re:/\bCorolla\s+Cross\b/i,tech:'HEV',from:'2021',to:'2024',src:'./images/toyota-corolla-cross-hev-2022.jpg',model:'Toyota Corolla Cross 1.8 HEV (2022)',author:'Ethan Llamas',source:'https://commons.wikimedia.org/wiki/File:Toyota_Corolla_Cross_1.8_HEV_2022_(1).jpg',license:'CC BY-SA 4.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/'},
 {brand:'Toyota',re:/\bCorolla\s+Cross\b/i,tech:'Bencina',from:'2021',to:'2023',src:'./images/toyota-corolla-cross-20-2022.jpg',model:'Toyota Corolla Cross 2.0 SEG (2022)',author:'RL GNZLZ',source:'https://commons.wikimedia.org/wiki/File:Toyota_Corolla_Cross_2.0_SEG_2022_(52601788623).jpg',license:'CC BY-SA 2.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/2.0/'},
 {brand:'Leapmotor',re:/\bB10\b/i,tech:'EV',from:'2025',to:'2026',src:'./images/leapmotor-b10-2025.jpg',model:'Leapmotor B10 (2025)',author:'Chanokchon',source:'https://commons.wikimedia.org/wiki/File:2025_Leapmotor_B10_Design.jpg',license:'CC BY-SA 4.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/'},
 {brand:'BYD',re:/\b(?:Dolphin\s+Mini|Seagull)\b/i,tech:'EV',from:'2024',to:'2026',src:'./images/byd-dolphin-mini-2024.jpg',model:'BYD Dolphin Mini / Seagull (2024)',author:'Mateusmatsuda',source:'https://commons.wikimedia.org/wiki/File:BYD_DOLPHIN_MINI_(BRAZIL)_BYD_SEAGULL.jpg',license:'CC BY 4.0',licenseUrl:'https://creativecommons.org/licenses/by/4.0/'}
];
function find(row,F){
 const brand=String(row[F.BRAND]||''),model=String(row[F.MODEL]||''),tech=String(row[F.TECH]||''),year=String(row[F.DATE]||'').slice(0,4);
 return entries.find(p=>p.brand===brand&&p.re.test(model)&&p.tech===tech&&year>=p.from&&year<=p.to)||null;
}
function render(row,F,safe){
 const p=find(row,F);if(!p)return null;
 return '<div class="vehicle-visual vehicle-photo">'+
 '<img src="'+safe(p.src)+'" width="960" height="540" loading="lazy" decoding="async" alt="Fotografía referencial de '+safe(p.model)+'; no acredita la versión homologada">'+
 '<div class="vehicle-photo-credit"><span>Foto del modelo · </span><a href="'+safe(p.source)+'" target="_blank" rel="noopener noreferrer" title="Ver fuente de la fotografía">'+safe(p.author)+'</a><span> · </span><a href="'+safe(p.licenseUrl)+'" target="_blank" rel="noopener noreferrer">'+safe(p.license)+'</a></div></div>';
}
window.RindelabPhotos=Object.freeze({render,find});
})();