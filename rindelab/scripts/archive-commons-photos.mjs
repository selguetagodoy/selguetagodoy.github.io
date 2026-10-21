/* RINDELAB: sincronización reproducible y auditada de fotografías Commons. Node.js >=20. */
import fs from 'node:fs/promises';import path from 'node:path';import crypto from 'node:crypto';
const root=process.cwd(),file=path.join(root,'rindelab','v2-photos.js'),text=await fs.readFile(file,'utf8');
const reg=/const licensed=(\[[\s\S]*?\]);\r?\nconst licenseUrls=/,match=text.match(reg);
if(!match)throw Error('Bloque licensed no encontrado');
const images=JSON.parse(match[1]),dir=path.join(root,'rindelab','images','commons');await fs.mkdir(dir,{recursive:true});
const links={'CC0':'https://creativecommons.org/publicdomain/zero/1.0/','CC0 1.0':'https://creativecommons.org/publicdomain/zero/1.0/','CC BY 4.0':'https://creativecommons.org/licenses/by/4.0/','CC BY 3.0':'https://creativecommons.org/licenses/by/3.0/','CC BY 2.0':'https://creativecommons.org/licenses/by/2.0/','CC BY-SA 4.0':'https://creativecommons.org/licenses/by-sa/4.0/','CC BY-SA 3.0':'https://creativecommons.org/licenses/by-sa/3.0/','CC BY-SA 3.0 DE':'https://creativecommons.org/licenses/by-sa/3.0/de/','CC BY-SA 2.0':'https://creativecommons.org/licenses/by-sa/2.0/'};
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const norm=s=>String(s).replace(/_/g,' ').toLowerCase().replace(/\s+/g,' ').trim();
const plain=s=>String(s||'').replace(/<[^>]+>/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim().slice(0,130);
const slug=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,74);
async function request(u,binary=false){let error;for(let n=0;n<3;n++){try{let r=await fetch(u,{headers:{'User-Agent':'RINDELAB/1.0 (image attribution archive, github.com/selguetagodoy)','Accept':'*/*'},signal:AbortSignal.timeout(25000)});if(!r.ok)throw Error('HTTP '+r.status);return binary?Buffer.from(await r.arrayBuffer()):await r.json();}catch(e){error=e;await pause(1000*(n+1));}}throw error;}
const meta=new Map();
for(let i=0;i<images.length;i+=8){const t=images.slice(i,i+8).map(x=>'File:'+x.file).join('|'),q=new URLSearchParams({action:'query',titles:t,prop:'imageinfo',iiprop:'url|extmetadata',format:'json',formatversion:'2'});try{const a=await request('https://commons.wikimedia.org/w/api.php?'+q);for(const p of a.query?.pages||[])if(p.imageinfo?.[0])meta.set(norm(p.title.replace(/^File:/,'')),p.imageinfo[0]);}catch(e){console.log('METADATA_ERROR',i,e.message);}await pause(350);}
const results=[];let downloaded=0,totalBytes=0;
for(let i=0;i<images.length;i++){
 const p=images[i],info=meta.get(norm(p.file)),lic=info?.extmetadata?.LicenseShortName?.value?.trim().replace(/ 3\.0 de$/i,' 3.0 DE'),ext=(p.file.match(/\.(jpe?g|png|webp)$/i)||[])[1]?.toLowerCase();
 if(!info||!links[lic]||!ext){results.push({model:p.model,file:p.file,status:'skip',reason:'licencia o archivo no validado ('+(lic||'?')+')'});continue;}
 const name=slug(p.brand+' '+p.model)+'-'+String(i+1).padStart(2,'0')+'.'+(ext==='jpeg'?'jpg':ext);
 const url='https://commons.wikimedia.org/wiki/Special:FilePath/'+encodeURIComponent(p.file.replace(/ /g,'_'))+'?width=720';
 try{
 const data=await request(url,true),jpeg=data[0]===255&&data[1]===216&&data[2]===255,png=data.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),webp=data.subarray(0,4).toString()==='RIFF'&&data.subarray(8,12).toString()==='WEBP';
 if(!((ext==='jpg'||ext==='jpeg')&&jpeg||ext==='png'&&png||ext==='webp'&&webp)||data.length<1500||data.length>5e6)throw Error('archivo no válido/tamaño fuera de rango');
 await fs.writeFile(path.join(dir,name),data);
 p.localSrc='./images/commons/'+name;p.source=info.descriptionurl||'https://commons.wikimedia.org/wiki/File:'+encodeURIComponent(p.file.replace(/ /g,'_'));p.license=lic;p.licenseUrl=links[lic];
 const artist=plain(info.extmetadata?.Artist?.value);if(artist)p.author=artist;
 results.push({model:p.model,file:p.file,path:p.localSrc,status:'local',bytes:data.length,sha256:crypto.createHash('sha256').update(data).digest('hex'),license:lic,author:p.author,source:p.source});downloaded++;totalBytes+=data.length;
 console.log('OK '+String(i+1).padStart(2,'0')+' '+name+' '+data.length+' '+lic);
 }catch(e){results.push({model:p.model,file:p.file,status:'skip',reason:e.message});console.log('SKIP '+p.file+' '+e.message);}
 await pause(260);
}
let updated=text.replace(reg,'const licensed='+JSON.stringify(images,null,1)+';\nconst licenseUrls=').replace('src:commonsFile(p),source:commonsSource(p)','src:p.localSrc||commonsFile(p),source:p.source||commonsSource(p)');
if(!updated.includes('src:p.localSrc||commonsFile(p)'))throw Error('No se logró enlazar imágenes locales');
await fs.writeFile(file,updated,'utf8');
let manifest={schemaVersion:1,checkedAt:new Date().toISOString(),policy:'Imagen referencial del modelo, no versión exacta',source:'Wikimedia Commons',downloaded,skipped:images.length-downloaded,total:images.length,totalBytes,results};
await fs.writeFile(path.join(dir,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
await fs.writeFile(path.join(dir,'README.md'),['# RINDELAB · Archivo de fotografías de Wikimedia Commons','','Fotos almacenadas: '+downloaded+' de '+images.length,'. Atribución, licencias y suma SHA-256 constan en manifest.json.','',...results.filter(x=>x.status==='skip').map(x=>'- Pendiente: '+x.model+' — '+x.reason),''].join('\n'));
console.log('ARCHIVE_SUMMARY '+JSON.stringify({downloaded,skipped:images.length-downloaded,totalBytes,metadataCount:meta.size,failures:results.filter(x=>x.status==='skip').map(x=>x.file)}));
