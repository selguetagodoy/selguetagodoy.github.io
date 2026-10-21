import fs from 'node:fs';
const old='rindelab/scripts/archive-lote3-html.mjs',path='rindelab/scripts/archive-lote4-html.mjs';
let s=fs.readFileSync(old,'utf8');
const pairs=[
 ['saved.length!==32','saved.length!==96'],
 ["esperaban 32 imágenes locales","esperaban 96 imágenes locales"],
 ["newPhotos.length>=64","newPhotos.length>=50"],
 ["number=33+newPhotos.length","number=97+newPhotos.length"],
 ["newPhotos.length!==64","newPhotos.length!==50"],
 [" de 64 requeridas"," de 50 requeridas"],
 ["'/64 '","'/50 '"],
 ["archive-lote3-failures.json","archive-lote4-failures.json"]
];for(const [a,b] of pairs){if(!s.includes(a))console.log('WARN no',a);s=s.replaceAll(a,b);}
fs.writeFileSync(path,s);console.log('prepared',path);
