import fs from 'node:fs/promises';
const file='rindelab/v2-photos.js',s=await fs.readFile(file,'utf8'),m=s.match(/const licensed=(\[[\s\S]*?\]);\r?\nconst licenseUrls=/);
if(!m)throw Error('missing entries');
const a=JSON.parse(m[1]),replace={
 'Porsche Cayenne':'2023 Porsche Cayenne S IMG 0521.jpg',
 'Porsche 911':'2025 Porsche 992 Carrera convertible Auto Zuerich 2024 DSC 6527.jpg',
 'Mini Cooper':'Mini Hatch (F66) IMG 8765.jpg',
 'BMW X5':'2024 BMW X5 (G05 LCI).jpg',
 'Mercedes-Benz GLA':'2024 Mercedes-Benz GLA 200 front.jpg',
 'Mercedes-Benz GLC':'MERCEDES-BENZ GLC (X254) China.jpg',
 'Nissan Sentra':'2024 Nissan Sentra (B18) IMG 4029.jpg',
 'Peugeot 208':'Peugeot 208 B facelift DSC 7227.jpg',
 'Citroen C3':'Citroen C3 (2020 - 2023) F-20240807.jpg',
 'Hyundai Creta':'Hyundai Creta 1.5 GLS 2024 (1).jpg',
 'Renault Duster':'2024 Renault Duster 1.3 TCe Turbo Iconic.jpg',
 'Nissan Kicks':'2026 Nissan Kicks - 01.jpg',
 'Subaru Impreza':'Subaru Impreza (GU) Automesse Ludwigsburg 2024 IMG 1597.jpg'
};
const drop=new Set(['Chery Tiggo 2 Pro','Suzuki Vitara']);
const fresh=a.filter(p=>!p.localSrc&&!drop.has(p.model)).map(p=>{if(replace[p.model])p.file=replace[p.model];if(p.model==='Peugeot 3008')p.tech='EV';if(p.model==='Nissan Kicks')p.from='2025';if(p.model==='Citroen C3')p.to='2024';return p;});
const kept=a.filter(p=>p.localSrc);
await fs.writeFile(file,s.replace(m[0],'const licensed='+JSON.stringify(kept.concat(fresh),null,1)+';\nconst licenseUrls='));
console.log('CURATED '+JSON.stringify({existing:kept.length,candidates:fresh.length,dropped:[...drop],changed:Object.keys(replace)}));
