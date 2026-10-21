import fs from 'node:fs';
const file='rindelab/v2-photos.js',text=fs.readFileSync(file,'utf8'),match=text.match(/const licensed=(\[[\s\S]*?\]);\r?\nconst licenseUrls=/);if(!match)throw Error('no block');
const all=JSON.parse(match[1]),existing=all.filter(p=>p.localSrc),candidates=all.filter(p=>!p.localSrc);
const drop=new Set(['MG HS PHEV','Chery Tiggo 2 Pro','Mitsubishi Outlander Sport','Ford Transit','Suzuki Baleno','Volkswagen Jetta','Volvo S60','Mercedes-Benz Clase A','Audi Q8','Kia K4']);
const accepted=candidates.filter(p=>!drop.has(p.model)).map(p=>{
 if(p.model==='MG ZS Hybrid')p.tech='HEV';
 if(p.model==='Chery Tiggo 7')p.tech='PHEV';
 if(p.model==='KGM Korando')p.tech='EV';
 if(p.model==='Hyundai Kona Hybrid')p.tech='HEV';
 if(p.model==='Citroen Berlingo')p.tech='EV';
 if(p.model==='Porsche Macan EV')p.tech='EV';
 if(p.model==='Peugeot 3008')p.tech='EV';
 if(p.model==='Mercedes-Benz EQE'||p.model==='Mercedes-Benz EQA')p.tech='EV';
 if(p.model==='Nissan Qashqai')p.from='2019'; // La fotografía corresponde a J11 2019, no nueva J12; limitar su vigencia.
 if(p.model==='Nissan Qashqai')p.to='2021';
 return p;
});
fs.writeFileSync(file,text.replace(match[0],'const licensed='+JSON.stringify(existing.concat(accepted),null,1)+';\nconst licenseUrls='));
console.log('CURATED '+JSON.stringify({old:existing.length,found:candidates.length,dropped:drop.size,candidates:accepted.length}));
