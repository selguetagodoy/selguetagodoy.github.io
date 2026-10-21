/* RINDELAB 100 fotos: archiva 64 del lote III con licencias verificadas. */
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
const file='rindelab/v2-photos.js',source=await fs.readFile(file,'utf8'),block=source.match(/const licensed=(\[[\s\S]*?\]);\r?\nconst licenseUrls=/);
if(!block)throw Error('No se encuentra licensed');
const all=JSON.parse(block[1]),saved=all.filter(x=>x.localSrc),incoming=all.filter(x=>!x.localSrc);
if(saved.length!==32)throw Error('Se esperaban 32 imágenes locales Commons previas, hay '+saved.length);
const dir='rindelab/images/commons',manifestOld=JSON.parse(await fs.readFile(path.join(dir,'manifest.json'),'utf8'));
const licenses={
 'CC0':'https://creativecommons.org/publicdomain/zero/1.0/',
 'CC0 1.0':'https://creativecommons.org/publicdomain/zero/1.0/',
 'CC BY 4.0':'https://creativecommons.org/licenses/by/4.0/',
 'CC BY 3.0':'https://creativecommons.org/licenses/by/3.0/',
 'CC BY 2.0':'https://creativecommons.org/licenses/by/2.0/',
 'CC BY-SA 4.0':'https://creativecommons.org/licenses/by-sa/4.0/',
 'CC BY-SA 3.0':'https://creativecommons.org/licenses/by-sa/3.0/',
 'CC BY-SA 3.0 DE':'https://creativecommons.org/licenses/by-sa/3.0/de/',
 'CC BY-SA 2.0':'https://creativecommons.org/licenses/by-sa/2.0/'
};
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const plain=s=>String(s||'').replace(/<[^>]*>/g,' ').replace(/&amp;/g,'&').replace(/&nbsp;/g,' ').replace(/&quot;/g,'"').replace(/&#39;|&#x27;/g,"'").replace(/\s+/g,' ').trim().slice(0,150);
const slug=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,74);
async function fetchData(url,binary=false){
 for(let j=0;j<4;j++){
  try{const r=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0 (compatible; RINDELAB local image attribution archive)'},signal:AbortSignal.timeout(27000)});
   if(!r.ok)throw Error('HTTP '+r.status);
   return binary?Buffer.from(await r.arrayBuffer()):await r.text();
  }catch(e){if(j===3)throw e;await pause(1300*(j+1));}
 }
}
function info(html){
 let license=plain(html.match(/licensetpl(?:&#95;|_)short"[^>]*>([^<]+)<\/span>/i)?.[1]||'').replace(/\s+/g,' ').trim();
 if(/^CC0/i.test(license))license='CC0';
 if(/^CC BY-SA 3\.0 de$/i.test(license))license='CC BY-SA 3.0 DE';
 const td=html.match(/id="fileinfotpl(?:&#95;|_)aut"[\s\S]{0,300}?<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>/i)?.[1]||'';
 let author=plain(td);
 if(!author)author=plain(html.match(/<meta[^>]+name="citation_author"[^>]+content="([^"]+)"/i)?.[1]||'');
 return {license,author};
}
const newFiles=[],newPhotos=[],failures=[];
for(const x of incoming){
 if(newPhotos.length>=64)break;
 const url='https://commons.wikimedia.org/wiki/File:'+encodeURIComponent(x.file.replace(/ /g,'_'));
 try{
  const html=await fetchData(url),m=info(html);
  if(!m.license||!licenses[m.license]||!m.author)throw Error('Sin licencia y autor verificables: '+m.license+' / '+m.author);
  const ext=(x.file.match(/\.(jpe?g|png|webp)$/i)||[])[1]?.toLowerCase();
  if(!ext)throw Error('Formato no permitido');
  const photoUrl='https://commons.wikimedia.org/wiki/Special:FilePath/'+encodeURIComponent(x.file.replace(/ /g,'_'))+'?width=720';
  const bytes=await fetchData(photoUrl,true);
  const jpeg=bytes[0]===255&&bytes[1]===216&&bytes[2]===255;
  const png=bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
  const webp=bytes.subarray(0,4).toString()==='RIFF'&&bytes.subarray(8,12).toString()==='WEBP';
  if(!((ext==='jpg'||ext==='jpeg')&&jpeg||ext==='png'&&png||ext==='webp'&&webp)||bytes.length<1500||bytes.length>6000000)throw Error('Datos inválidos o demasiado grandes: '+bytes.length);
  const number=33+newPhotos.length,filename=slug(x.brand+' '+x.model)+'-'+String(number).padStart(3,'0')+'.'+(ext==='jpeg'?'jpg':ext);
  await fs.writeFile(path.join(dir,filename),bytes);
  x.localSrc='./images/commons/'+filename;
  x.source=url;x.author=m.author;x.license=m.license;x.licenseUrl=licenses[m.license];
  newPhotos.push(x);
  newFiles.push({model:x.model,file:x.file,path:x.localSrc,status:'local',bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),license:x.license,author:x.author,source:x.source});
  console.log('SAVED '+String(newPhotos.length).padStart(2,'0')+'/64 '+x.model+' '+m.license+' '+bytes.length+' bytes');
 }catch(e){failures.push({model:x.model,file:x.file,reason:e.message});console.log('REJECT '+x.model+': '+e.message);}
 await pause(130);
}
await fs.writeFile('rindelab/scripts/archive-lote3-failures.json',JSON.stringify({saved:newPhotos.length,failures},null,2)+'\n');
if(newPhotos.length!==64)throw Error('Se guardaron solo '+newPhotos.length+' de 64 requeridas, de '+incoming.length+' candidatos');
const updated=source.replace(block[0],'const licensed='+JSON.stringify(saved.concat(newPhotos),null,1)+';\nconst licenseUrls=');
await fs.writeFile(file,updated,'utf8');
const allResults=manifestOld.results.filter(r=>r.status==='local').concat(newFiles);
const manifest={schemaVersion:2,checkedAt:new Date().toISOString(),source:'Wikimedia Commons',policy:'Imágenes de modelo, no equivalentes a versiones comerciales u homologaciones exactas',downloaded:allResults.length,skipped:0,total:allResults.length,totalBytes:allResults.reduce((n,a)=>n+a.bytes,0),results:allResults};
await fs.writeFile(path.join(dir,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
await fs.writeFile(path.join(dir,'README.md'),['# RINDELAB — archivos fotográficos con atribución','','Fotos locales Commons: '+allResults.length+' + 4 anteriores = '+(allResults.length+4)+' referencias.', 'Licencia, autor, fuente, archivo y SHA-256 disponible en manifest.json.','Imágenes referenciales del modelo; no certifican la versión exacta.','', 'Candidatos descartados: '+failures.length,'',...failures.map(x=>'- '+x.model+': '+x.reason),''].join('\n'));
console.log('FINAL_SUMMARY '+JSON.stringify({localCommons:allResults.length,initialLocal:4,totalReferences:allResults.length+4,added:newPhotos.length,failures:failures.length,totalBytes:manifest.totalBytes}));
