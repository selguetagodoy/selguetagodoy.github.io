/* Fotos históricas verificadas con créditos Wikimedia Commons.
 * Foto de generación, no identificación exacta de versión tributaria.
 */
(()=>{'use strict';
const clean=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z0-9]+/g,' ').trim();
let loaded=null;
const load=()=>loaded??=fetch('./sii/data/used-historical-photos-20261021.json').then(r=>{if(!r.ok)throw Error('Fotos históricas no disponibles');return r.json()}).then(r=>r.records).catch(()=>[]);
function modelKey(x){return clean(x).replace(/\s*\(.*\)\s*$/,'').trim()}
function lookup(data,brand,model,year,variant=''){
 const group=modelKey(model),ver=clean(variant);
 return data.find(x=>clean(x.brand)===clean(brand)&&clean(x.model)===group&&
 (year?year>=x.from&&year<=x.to:x.allowFamilyUnspecified===true)&&
 (!x.variantMatch||ver.includes(x.variantMatch)))||null;
}
function mount(card,{brand,model,year=null,variant=''}) {
 if(!card)return;
 load().then(data=>{
  if(!card.isConnected)return;
  const p=lookup(data,brand,model,year,variant);
  if(!p)return;
  const fig=document.createElement('figure');fig.className='used-historic-photo';
  const img=document.createElement('img');
  img.src='https://commons.wikimedia.org/wiki/Special:FilePath/'+encodeURIComponent(p.file.replace(/ /g,'_'))+'?width=640';
  img.alt='Fotografía referencial: '+p.caption;
  img.width=360;img.height=210;img.loading='lazy';img.decoding='async';
  img.addEventListener('error',()=>fig.remove(),{once:true});
  const cap=document.createElement('figcaption');cap.textContent=p.caption+' · ';
  const attr=document.createElement('a');attr.href=p.source;attr.textContent='Foto: '+p.author;
  attr.target='_blank';attr.rel='noopener noreferrer';
  const lic=document.createElement('a');lic.href=p.licenseUrl;lic.textContent=p.license;
  lic.target='_blank';lic.rel='noopener noreferrer';
  cap.append(attr,document.createTextNode(' · '),lic);fig.append(img,cap);
  card.prepend(fig);
 });
}
window.RindelabHistoricPhotos=Object.freeze({mount,load,lookup});
})();