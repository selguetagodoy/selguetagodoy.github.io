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
  "license": "CC BY 4.0",
  "localSrc": "./images/commons/tesla-tesla-model-3-2024-01.jpg",
  "source": "https://commons.wikimedia.org/wiki/File:2024_Tesla_Model_3.jpg",
  "licenseUrl": "https://creativecommons.org/licenses/by/4.0/"
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
  "license": "CC BY-SA 4.0",
  "localSrc": "./images/commons/tesla-tesla-model-y-2024-02.jpg",
  "source": "https://commons.wikimedia.org/wiki/File:2024_Tesla_Model_Y_Long_Range,_rear_right,_07-28-2024.jpg",
  "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/"
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
  "license": "CC0",
  "localSrc": "./images/commons/kia-kia-ev5-2024-03.jpg",
  "source": "https://commons.wikimedia.org/wiki/File:Kia_EV5_002.jpg",
  "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/"
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
  "license": "CC BY-SA 4.0",
  "localSrc": "./images/commons/kia-kia-ev6-2024-04.jpg",
  "source": "https://commons.wikimedia.org/wiki/File:Kia_EV6.jpg",
  "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/"
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
  "license": "CC BY-SA 4.0",
  "localSrc": "./images/commons/kia-kia-ev6-gt-line-restyling-2025-05.jpg",
  "source": "https://commons.wikimedia.org/wiki/File:2025_Kia_EV6_GT-Line_Auto_Zuerich_2024_DSC_6471.jpg",
  "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/"
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
  "license": "CC BY-SA 4.0",
  "localSrc": "./images/commons/kia-kia-ev9-2024-06.jpg",
  "source": "https://commons.wikimedia.org/wiki/File:2024_Kia_EV9_GT-Line_AWD_2.jpg",
  "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/"
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
  "license": "CC0",
  "localSrc": "./images/commons/hyundai-hyundai-ioniq-5-2022-07.jpg",
  "source": "https://commons.wikimedia.org/wiki/File:Hyundai_Ioniq_5.jpg",
  "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/"
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
  "license": "CC BY 4.0",
  "localSrc": "./images/commons/hyundai-hyundai-kona-electric-2024-08.png",
  "source": "https://commons.wikimedia.org/wiki/File:Hyundai_Kona_Electric_20240502_HOF2528-HDR_RAW-Export_cens.png",
  "licenseUrl": "https://creativecommons.org/licenses/by/4.0/"
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
  "license": "CC BY-SA 4.0",
  "localSrc": "./images/commons/mazda-mazda-cx-5-2022-09.jpg",
  "source": "https://commons.wikimedia.org/wiki/File:2022_Mazda_CX-5_2.0_front.jpg",
  "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/"
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
  "license": "CC BY-SA 4.0",
  "localSrc": "./images/commons/mazda-mazda-cx-30-2022-10.jpg",
  "source": "https://commons.wikimedia.org/wiki/File:Mazda_CX-30_2,0_2022.jpg",
  "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/"
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
  "license": "CC BY-SA 4.0",
  "localSrc": "./images/commons/nissan-nissan-leaf-2018-11.jpg",
  "source": "https://commons.wikimedia.org/wiki/File:2018_Nissan_Leaf_Tekna_Front.jpg",
  "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/"
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
  "license": "CC BY-SA 4.0",
  "localSrc": "./images/commons/byd-byd-seal-2024-12.jpg",
  "source": "https://commons.wikimedia.org/wiki/File:BYD_Seal.jpg",
  "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/"
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
  "license": "CC BY-SA 4.0",
  "localSrc": "./images/commons/leapmotor-leapmotor-c10-electrico-2024-13.jpg",
  "source": "https://commons.wikimedia.org/wiki/File:Leapmotor_C10_EV_01_China_2024-03-24.jpg",
  "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/"
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
  "license": "CC BY 3.0",
  "localSrc": "./images/commons/porsche-porsche-taycan-2019-14.jpg",
  "source": "https://commons.wikimedia.org/wiki/File:Porsche_Taycan.jpg",
  "licenseUrl": "https://creativecommons.org/licenses/by/3.0/"
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
  "license": "CC BY-SA 4.0",
  "localSrc": "./images/commons/bmw-bmw-i4-2022-15.jpg",
  "source": "https://commons.wikimedia.org/wiki/File:BMW_i4_IMG_6695.jpg",
  "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/"
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
  "license": "CC BY-SA 4.0",
  "localSrc": "./images/commons/toyota-toyota-hilux-2022-16.jpg",
  "source": "https://commons.wikimedia.org/wiki/File:Toyota_Hilux_4x4_V_Conquest_2022_(1).jpg",
  "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/"
 },
 {
  "brand": "MG",
  "pattern": "\\bMG\\s*4\\b|\\bMG4\\b",
  "tech": "EV",
  "from": "2023",
  "to": "2026",
  "file": "MG4 Electric – f 21042025.jpg",
  "model": "MG4 Electric (2025, primera generación)",
  "author": "© M 93",
  "license": "CC BY-SA 3.0 DE",
  "localSrc": "./images/commons/mg-mg4-electric-2025-primera-generacion-17.jpg",
  "source": "https://commons.wikimedia.org/wiki/File:MG4_Electric_%E2%80%93_f_21042025.jpg",
  "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0/de/"
 },
 {
  "brand": "Great Wall",
  "pattern": "\\bORA[\\s-]*03\\b",
  "tech": "EV",
  "from": "2024",
  "to": "2026",
  "file": "GWM Ora 03 – f 12102025.jpg",
  "model": "GWM ORA 03 (2025)",
  "author": "© M 93",
  "license": "CC BY-SA 3.0 DE",
  "localSrc": "./images/commons/great-wall-gwm-ora-03-2025-18.jpg",
  "source": "https://commons.wikimedia.org/wiki/File:GWM_Ora_03_%E2%80%93_f_12102025.jpg",
  "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0/de/"
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
  "license": "CC BY-SA 4.0",
  "localSrc": "./images/commons/suzuki-suzuki-swift-2024-19.jpg",
  "source": "https://commons.wikimedia.org/wiki/File:2024_Suzuki_Swift.jpg",
  "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/"
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
  "license": "CC BY-SA 4.0",
  "localSrc": "./images/commons/volkswagen-volkswagen-id-4-2021-20.jpg",
  "source": "https://commons.wikimedia.org/wiki/File:Volkswagen_ID.4_IMG_5655.jpg",
  "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/"
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
  "license": "CC BY-SA 4.0",
  "localSrc": "./images/commons/byd-byd-shark-6-dmo-2025-21.jpg",
  "source": "https://commons.wikimedia.org/wiki/File:BYD_Shark_6_DMO_Premium_2025.jpg",
  "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/"
 },
 {
  "brand": "Hyundai",
  "pattern": "\\bTucson\\b",
  "tech": [
   "Bencina",
   "Diésel",
   "HEV",
   "PHEV",
   "MHEV"
  ],
  "from": "2021",
  "to": "2025",
  "file": "2022 Hyundai Tucson Preferred, Front Right, 05-24-2021.jpg",
  "model": "Hyundai Tucson NX4 (2022)",
  "author": "SsmIntrigue",
  "license": "CC BY-SA 4.0",
  "localSrc": "./images/commons/hyundai-hyundai-tucson-nx4-2022-22.jpg",
  "source": "https://commons.wikimedia.org/wiki/File:2022_Hyundai_Tucson_Preferred,_Front_Right,_05-24-2021.jpg",
  "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/"
 },
 {
  "brand": "Kia",
  "pattern": "\\bSonet\\b",
  "tech": [
   "Bencina",
   "Diésel"
  ],
  "from": "2024",
  "to": "2026",
  "file": "Kia Sonet QY FL 1.5 EX Imperial Blue - front.jpg",
  "model": "Kia Sonet facelift QY (2025)",
  "author": "Ethan Llamas",
  "license": "CC BY-SA 4.0",
  "localSrc": "./images/commons/kia-kia-sonet-facelift-qy-2025-23.jpg",
  "source": "https://commons.wikimedia.org/wiki/File:Kia_Sonet_QY_FL_1.5_EX_Imperial_Blue_-_front.jpg",
  "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/"
 },
 {
  "brand": "MG",
  "pattern": "\\bZS\\b",
  "tech": [
   "Bencina",
   "MHEV"
  ],
  "from": "2020",
  "to": "2024",
  "file": "2022 MG ZS Exclusive T-GDi 1.0 Front.jpg",
  "model": "MG ZS primera generación facelift (2022)",
  "author": "Vauxford",
  "license": "CC BY-SA 4.0",
  "localSrc": "./images/commons/mg-mg-zs-primera-generacion-facelift-2022-24.jpg",
  "source": "https://commons.wikimedia.org/wiki/File:2022_MG_ZS_Exclusive_T-GDi_1.0_Front.jpg",
  "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/"
 },
 {
  "brand": "Suzuki",
  "pattern": "\\bFronx\\b",
  "tech": [
   "Bencina",
   "MHEV",
   "HEV"
  ],
  "from": "2023",
  "to": "2026",
  "file": "Suzuki Fronx (front).jpg",
  "model": "Suzuki Fronx (2025)",
  "author": "Jason Lawrence from New York",
  "license": "CC BY 2.0",
  "localSrc": "./images/commons/suzuki-suzuki-fronx-2025-25.jpg",
  "source": "https://commons.wikimedia.org/wiki/File:Suzuki_Fronx_(front).jpg",
  "licenseUrl": "https://creativecommons.org/licenses/by/2.0/"
 },
 {
  "brand": "Toyota",
  "pattern": "\\bRAV[\\s-]*4\\b",
  "tech": [
   "Bencina",
   "HEV"
  ],
  "from": "2019",
  "to": "2025",
  "file": "Toyota RAV4 G (6BA-MXAA54-ANXGB) front.jpg",
  "model": "Toyota RAV4 quinta generación (2019)",
  "author": "Tokumeigakarinoaoshima",
  "license": "CC BY-SA 4.0",
  "localSrc": "./images/commons/toyota-toyota-rav4-quinta-generacion-2019-26.jpg",
  "source": "https://commons.wikimedia.org/wiki/File:Toyota_RAV4_G_(6BA-MXAA54-ANXGB)_front.jpg",
  "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/"
 },
 {
  "brand": "Ford",
  "pattern": "\\bRanger\\b(?!.*\\bRaptor\\b)",
  "tech": [
   "Bencina",
   "Diésel",
   "MHEV",
   "HEV"
  ],
  "from": "2023",
  "to": "2026",
  "file": "2023 Ford Ranger Wildtrak.jpg",
  "model": "Ford Ranger generación P703 (2023)",
  "author": "Calreyn88",
  "license": "CC0",
  "localSrc": "./images/commons/ford-ford-ranger-generacion-p703-2023-27.jpg",
  "source": "https://commons.wikimedia.org/wiki/File:2023_Ford_Ranger_Wildtrak.jpg",
  "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/"
 },
 {
  "brand": "Porsche",
  "pattern": "\\bMacan\\b",
  "tech": [
   "Bencina",
   "Diésel"
  ],
  "from": "2017",
  "to": "2024",
  "file": "Porsche Macan (ABA-J1H1) front.jpg",
  "model": "Porsche Macan de combustión (2022)",
  "author": "Tokumeigakarinoaoshima",
  "license": "CC BY-SA 4.0",
  "localSrc": "./images/commons/porsche-porsche-macan-de-combustion-2022-28.jpg",
  "source": "https://commons.wikimedia.org/wiki/File:Porsche_Macan_(ABA-J1H1)_front.jpg",
  "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/"
 },
 {
  "brand": "Nissan",
  "pattern": "\\bX[\\s-]*TRAIL\\b",
  "tech": [
   "HEV"
  ],
  "from": "2022",
  "to": "2026",
  "file": "Nissan X-TRAIL G e-4ORCE (SNT33) front.jpg",
  "model": "Nissan X-Trail T33 e-Power (2022)",
  "author": "Tokumeigakarinoaoshima",
  "license": "CC BY-SA 4.0",
  "localSrc": "./images/commons/nissan-nissan-x-trail-t33-e-power-2022-29.jpg",
  "source": "https://commons.wikimedia.org/wiki/File:Nissan_X-TRAIL_G_e-4ORCE_(SNT33)_front.jpg",
  "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/"
 },
 {
  "brand": "Mitsubishi",
  "pattern": "\\b(?:L[\\s-]*200|Triton)\\b",
  "tech": [
   "Diésel",
   "Bencina"
  ],
  "from": "2024",
  "to": "2026",
  "file": "Mitsubishi Triton 2.4 GLX 4x2 2024 (1).jpg",
  "model": "Mitsubishi L200 / Triton generación 2024",
  "author": "Ethan Llamas",
  "license": "CC BY-SA 4.0",
  "localSrc": "./images/commons/mitsubishi-mitsubishi-l200-triton-generacion-2024-30.jpg",
  "source": "https://commons.wikimedia.org/wiki/File:Mitsubishi_Triton_2.4_GLX_4x2_2024_(1).jpg",
  "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/"
 },
 {
  "brand": "BMW",
  "pattern": "\\bX1\\b",
  "tech": [
   "Bencina",
   "Diésel",
   "PHEV",
   "EV",
   "MHEV"
  ],
  "from": "2023",
  "to": "2026",
  "file": "2023 BMW X1 U11 front view 01.png",
  "model": "BMW X1 U11 (2023)",
  "author": "AutobildEs",
  "license": "CC BY 3.0",
  "localSrc": "./images/commons/bmw-bmw-x1-u11-2023-31.png",
  "source": "https://commons.wikimedia.org/wiki/File:2023_BMW_X1_U11_front_view_01.png",
  "licenseUrl": "https://creativecommons.org/licenses/by/3.0/"
 },
 {
  "brand": "Kia",
  "pattern": "\\b(?:Morning|Picanto)\\b",
  "tech": [
   "Bencina",
   "MHEV"
  ],
  "from": "2024",
  "to": "2026",
  "file": "2024 Kia Picanto 1.0.jpg",
  "model": "Kia Picanto / Morning (2024)",
  "author": "Rutger van der Maar",
  "license": "CC BY 2.0",
  "localSrc": "./images/commons/kia-kia-picanto-morning-2024-32.jpg",
  "source": "https://commons.wikimedia.org/wiki/File:2024_Kia_Picanto_1.0.jpg",
  "licenseUrl": "https://creativecommons.org/licenses/by/2.0/"
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
const entries=localEntries.concat(licensed.map(p=>({...p,re:new RegExp(p.pattern,'i'),src:p.localSrc||commonsFile(p),source:p.source||commonsSource(p),licenseUrl:licenseUrls[p.license]})));

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