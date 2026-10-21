/* Descubre modelos en bÃºsqueda pÃºblica Commons, sin depender del API limitado. */
import fs from 'node:fs/promises';
const rows=(await fs.readFile('rindelab/scripts/lote5-candidates.tsv','utf8')).trim().split(/\r?\n/).map(x=>{const [brand,model,query,from,to,alias]=x.split('|');return {brand,model,query,from,to,alias:alias||model};});
const current=await fs.readFile('rindelab/v2-photos.js','utf8'),block=current.match(/const licensed=(\[[\s\S]*?\]);\r?\nconst licenseUrls=/);
if(!block)throw Error('CatÃ¡logo no encontrado');
const existing=JSON.parse(block[1]),used=new Set(existing.map(p=>p.file));
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const aliases={'KGM':['kgm','ssangyong'],'Gac':['gac','trumpchi'],'Great Wall':['great wall','gwm','haval','tank'],'RAM':['ram','dodge'],'Mercedes-Benz':['mercedes benz','mercedes'],'Mini':['mini'],'Land Rover':['land rover','range rover']};
const invalid=/interior|dashboard|cabina|cockpit|engine|inside|logo|badge|wheel|tyre|tire|instrument|brochure|manual|schematic|ambulance|police|toy|diecast|model car|scale model|lego|military|machine gun|rifle|sign.and.letters|emblem|rover mini|cutaway|prototype|rendering|illustration|print advert|car showroom interior|fuel pump|sunroof|back seat/i;
async function get(url){for(let i=0;i<4;i++){try{const r=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0 (compatible; RINDELAB visual reference archive)'},signal:AbortSignal.timeout(24000)});if(!r.ok)throw Error('HTTP '+r.status);return await r.text();}catch(e){if(i===3)throw e;await pause(2000*(i+1));}}}
function candidates(html){
 const arr=[...html.matchAll(/\/wiki\/File:([^"#&<]+)/g)].map(m=>m[1]);
 const seen=new Set(),out=[];
 for(const a of arr){let s;try{s=decodeURIComponent(a.replace(/&amp;/g,'&')).replace(/_/g,' ');}catch{continue;}if(seen.has(s))continue;seen.add(s);out.push(s);}
 return out;
}
function score(file,target){
 if(used.has(file)||!/\.(jpe?g|png|webp)$/i.test(file)||invalid.test(file))return -1;
 const words=norm(file),brandNames=aliases[target.brand]||[norm(target.brand)];
 if(!brandNames.some(n=>words.includes(n)))return -1;
 const modelWords=norm(target.alias).split(' ').filter(Boolean);
 if(!modelWords.every(token=>words.split(' ').includes(token)))return -1;
 const years=[...file.matchAll(/(?:19|20)\d{2}/g)].map(v=>Number(v[0]));
 if(years.length&&(Math.max(...years)<Number(target.from)-1||Math.min(...years)>Number(target.to)+1))return -1;
 let score=20;
 if(years.length)score+=14+Math.min(10,Math.max(0,Math.max(...years)-Number(target.from)));
 if(/front|frontal|three quarter|front left|front right|side|exterior/i.test(file))score+=7;
 if(/rear|back view/i.test(file))score-=7;
 if(/202[4-6]/.test(file))score+=4;
 if(/001\.| 1\.|front\.jpg/i.test(file))score+=2;
 return score;
}
const matches=[],misses=[];
for(const [i,t] of rows.entries()){
 if(matches.length>=95)break;
 try{
  const url='https://commons.wikimedia.org/w/index.php?title=Special:MediaSearch&type=image&search='+encodeURIComponent(t.query);
  const html=await get(url),files=candidates(html);
  const ranked=files.map(file=>({file,score:score(file,t)})).filter(x=>x.score>=20).sort((a,b)=>b.score-a.score);
  if(!ranked.length){misses.push({brand:t.brand,model:t.model,reason:'no credible title'});console.log('MISS '+t.brand+' '+t.model);continue;}
  const file=ranked[0].file,pattern='\\b'+t.alias.replace(/[^a-zA-Z0-9]+/g,'[\\s.-]*')+'\\b';
  matches.push({brand:t.brand,pattern,from:t.from,to:t.to,file,model:t.brand+' '+t.model,author:'',license:'',discovery:'Commons HTML search '+t.query});
  used.add(file);
  console.log('MATCH '+String(matches.length).padStart(2,'0')+' '+t.brand+' '+t.model+' | '+file);
 }catch(e){misses.push({brand:t.brand,model:t.model,reason:e.message});console.log('ERROR '+t.brand+' '+t.model+' '+e.message);}
 await pause(140);
}
await fs.writeFile('rindelab/scripts/discovered-lote5.json',JSON.stringify({matches,misses,attempted:matches.length+misses.length,totalTargets:rows.length},null,2)+'\n');
await fs.writeFile('rindelab/v2-photos.js',current.replace(block[0],'const licensed='+JSON.stringify(existing.concat(matches),null,1)+';\nconst licenseUrls='));
console.log('DISCOVERY_SUMMARY '+JSON.stringify({newCandidates:matches.length,failures:misses.length,target:64,oldPhotos:36}));
