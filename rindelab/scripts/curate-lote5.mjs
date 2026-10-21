/* Curate source titles and generation. 50 accepted verified photos, keep reserve candidates. */
import fs from 'node:fs';
const file='rindelab/v2-photos.js',s=fs.readFileSync(file,'utf8'),m=s.match(/const licensed=(\[[\s\S]*?\]);\r?\nconst licenseUrls=/);
if(!m)throw Error('cannot find licensed entries');
const entries=JSON.parse(m[1]),past=entries.filter(x=>x.localSrc),candidate=entries.filter(x=>!x.localSrc);
if(past.length!==146)throw Error('expected 146 verified local Commons entries');
const drop=new Set([
'Volkswagen Nivus', // image contains Taos
'Volkswagen Tiguan', // Chinese L Pro, non-matching Chile design
'Volvo XC60', // 2009, not modern
'Land Rover Range Rover Evoque', // 2017, wrong generation
'KGM Actyon', // already archived
'Ford Explorer', // image is electric crossover unlike Chile ICE offering
'Ford Transit', // Transit Courier != Transit van
'Mazda Mazda2', // 2009 wrong generation
'Honda HR-V', // 2019, wrong generation
'Honda CR-V', // 2017, wrong generation
'Honda Civic', // Type R variant would be misrepresented as standard Civic
'Honda Pilot', // 2015, wrong generation
'Nissan Juke', // 2019 first gen
'Mitsubishi Outlander Sport', // 2013 first gen
'Mitsubishi Lancer', // no longer new vehicle
'JMC Grand Avenue', // existing family already archived
'Gac Aion V', // already archived
'Gac Aion Y', // already archived
'Great Wall Poer', // already represented by Poer Plus
'Great Wall Wingle 7', // already archived
'Lexus RX', // RX270 is older generation
'Lexus LX', // LX470 is older generation
'Mercedes-Benz Clase E', // Chinese long-wheelbase variant
]);
const extra = candidate.filter(x=>!drop.has(x.model));
for(const p of extra){
 if(p.model==='BYD Song Plus')p.tech='PHEV'; // DM-i photo
 if(p.model==='BYD Han')p.tech='EV';
 if(p.model==='BYD Tang')p.tech='EV';
 if(p.model==='BYD Sealion 6')p.tech='PHEV';
 if(p.model==='BYD Seagull')p.tech='EV';
 if(p.model==='KGM Torres')p.tech=['Bencina','HEV','MHEV'];
 if(p.model==='Ford Ranger Raptor')p.pattern='\\bRanger[\\s.-]*Raptor\\b';
 if(p.model==='Subaru Forester'){p.tech=['Bencina','MHEV'];p.to='2024';} // older SK generation vs new HEV
 if(p.model==='Land Rover Defender')p.tech=['Bencina','Diésel','MHEV','PHEV']; // trim referential
 if(p.model==='Volvo XC40')p.tech=['Bencina','MHEV','HEV','PHEV'];
 if(p.model==='Volvo XC90')p.tech=['Bencina','MHEV','PHEV'];
 if(p.model==='Geely EX5')p.tech='EV';
 if(p.model==='Audi Q4 e-tron')p.tech='EV';
 if(p.model==='Audi e-tron GT')p.tech='EV';
 if(p.model==='Mercedes-Benz EQB'||p.model==='Mercedes-Benz EQA'||p.model==='Mercedes-Benz EQE')p.tech='EV';
 if(p.model==='BMW iX1'||p.model==='BMW iX2'||p.model==='BMW iX'||p.model==='BMW i5'||p.model==='BMW i7')p.tech='EV';
}
fs.writeFileSync(file,s.replace(m[0],'const licensed='+JSON.stringify(past.concat(extra),null,1)+';\nconst licenseUrls='));
console.log('CURATION '+JSON.stringify({past:past.length,discovered:candidate.length,dropped:drop.size,reserves:extra.length,models:extra.map(x=>x.model)}));
