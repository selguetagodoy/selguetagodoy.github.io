/* Identidad compartida para contrastar homologaciones y referencias comerciales.
 * No certifica equivalencia de versiones, años, generaciones ni oferta vigente. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.RindelabIdentity=api;
})(typeof window!=='undefined'?window:null,function(){
 'use strict';
 const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/([a-z])([A-Z])/g,'$1 $2').replace(/[^A-Z0-9]+/g,' ').replace(/\s+/g,' ').trim();
 const brand=s=>{
  const b=norm(s);
  return ({'M BENZ':'MERCEDES BENZ','MERCEDES BENZ':'MERCEDES BENZ','HAVAL':'GREAT WALL','GWM':'GREAT WALL','GAC MOTOR':'GAC','LEAP MOTOR':'LEAPMOTOR','FAW BESTUNE':'FAW'})[b]||b;
 };
 const family=(s,b='')=>{
  let v=norm(s),bn=brand(b);
  if(bn&&v.startsWith(bn+' '))v=v.slice(bn.length+1);
  v=v.replace(/^(THE NEW|ALL NEW|NUEVA|NUEVO|NEW|CL)\s+/,'');
  if(bn==='MAZDA'&&/^CX (3|5|30)$/.test(v))return v;
  if(bn==='MG'&&/^MG (ZS|S5)$/.test(v))return v.slice(3);
  if(bn==='GREAT WALL'&&v.startsWith('HAVAL '))v=v.slice(6);
  // No colapsar subfamilias: Corolla Cross != Corolla; Tiggo 2 Pro != Pro Max.
  return v;
 };
 const key=(b,f)=>brand(b)+'|'+family(f,b);
 const valid=p=>p&&typeof p.source==='string'&&/^https:\/\//.test(p.source)&&p.currency==='CLP'&&p.brand&&p.family&&p.version&&Number.isInteger(p.priceListClp)&&p.priceListClp>0;
 const dateOnly=(value=new Date())=>{
  if(typeof value==='string')return value.slice(0,10);
  return [value.getFullYear(),String(value.getMonth()+1).padStart(2,'0'),String(value.getDate()).padStart(2,'0')].join('-');
 };
 const expired=(p,today=dateOnly())=>Boolean(p?.sourceOfferEnd&&/^\d{4}-\d\d-\d\d$/.test(p.sourceOfferEnd)&&p.sourceOfferEnd<today);
 const active=p=>p?.commercialStatus!=='discontinued-cl';
 const techKnown=p=>String(p?.technology||'').trim();
 const compatible=(row,p)=>!techKnown(p)||techKnown(p)===String(row[2]||'').trim();
 const tier=(row,p)=>techKnown(p)?(compatible(row,p)?'same-tech':'other-tech'):'unspecified-tech';
 function index(list){
  const map=new Map();
  for(const p of list.filter(valid)){
   const k=key(p.brand,p.family);
   if(!map.has(k))map.set(k,[]);
   map.get(k).push(p);
  }
  return map;
 }
 function familyRecords(map,row,familyName){
  return (map.get(key(row[0],familyName))||[]).filter(active);
 }
 function priceReference(map,row,familyName,today=dateOnly()){
  const items=familyRecords(map,row,familyName).filter(p=>compatible(row,p));
  if(!items.length)return null;
  const same=items.filter(p=>tier(row,p)==='same-tech');
  const selection=same.length?same:items;
  // Conservar campañas antiguas para trazabilidad, pero no priorizarlas sobre vigentes.
  const current=selection.filter(p=>!expired(p,today));
  const pool=current.length?current:selection;
  const entry=pool.reduce((a,b)=>a.priceListClp<=b.priceListClp?a:b);
  return {...entry,association:same.length?'same-tech':'unverified-tech',campaignExpired:expired(entry,today)};
 }
 return Object.freeze({norm,brand,family,key,valid,expired,active,compatible,tier,index,familyRecords,priceReference,dateOnly});
});
