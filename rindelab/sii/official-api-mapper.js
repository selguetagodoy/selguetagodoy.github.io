/* RINDELAB · Códigos adicionales de la API oficial Consumo Vehicular.
 * La fuente cruda se conserva en cuatro archivos y se transforma sin imputaciones. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.RindelabOfficialAPI=api;
})(typeof globalThis!=='undefined'?globalThis:null,function(){
 'use strict';
 const FIELDS=26;
 const N=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
 function num(value){
  if(value===null||value===undefined||value==='')return null;
  const n=Number(String(value).replace(',','.'));
  return Number.isFinite(n)&&n>0?n:null;
 }
 function tech(r){
  const p=N(r.propulsion),model=N(r.nombreModelo),fuel=N(r.combustible);
  if(p==='electrico puro')return 'EV';
  if(p==='hibrido sin recarga exterior')return 'HEV';
  if(p==='hibrido con recarga exterior')return /\breev\b/.test(model)?'REEV':'PHEV';
  if(p==='combustion'&&fuel==='diesel')return 'Diésel';
  if(p==='combustion'&&fuel==='gasolina')return 'Bencina';
  throw Error('Propulsión oficial no clasificada: '+r.propulsion);
 }
 function convert(r){
  if(!r||!r.codigoInformeTecnico||!r.nombreMarca||!r.nombreModelo||!r.fechaHomologacion||
    !['WLTP','NEDC'].includes(r.sourceCycle))throw Error('Registro API oficial incompleto');
  const t=tech(r),wl=r.sourceCycle==='WLTP',plug=t==='PHEV'||t==='REEV',electric=t==='EV';
  const fuelKm=wl?num(r.combinado):num(r.rendimientoMixto);
  const weighted=plug?(wl?num(r.rendimientoCombinadoCombustible):num(r.rendimientoPonderadoCombustible)):null;
  const electricKm=electric?
   (wl?num(r.wltpRendimientoElectricoPuro):num(r.rendimientoElectrico)):
   plug?(wl?num(r.rendimientoCombinadoElectrico):num(r.rendimientoPonderadoElectrico)):null;
  const row=[
   r.nombreMarca,r.nombreModelo,t,r.combustible||(electric?'Electricidad':''),
   r.tipoVehiculo||'',r.traccion||'',r.transmision||'',
   r.cilindrada!==null&&r.cilindrada!==undefined?String(r.cilindrada):'',
   r.fechaHomologacion.slice(0,10),r.codigoInformeTecnico,r.categoria||'',r.sourceCycle,
   electric?null:fuelKm,electricKm,weighted,num(r.capacidadAcumulacionEnergia),
   r.tipoConectorAc||'',r.tipoConectorDc||'',
   wl?num(r.co2Combinado):num(r.co2),
   r.norma||'',wl?null:num(r.rendimientoUrbano),wl?null:num(r.rendimientoCarretera),
   wl?num(r.rendimientoUrbanoSinAutoPista):null,
   wl?num(r.rendimientoUrbanoConAutoPistaUrbana):null,
   wl?num(r.rendimientoRuralConAutopista):null,
   wl?num(r.rendimientoAutopistaInterUrbana):null
  ];
  if(row.length!==FIELDS)throw Error('Campos oficiales incompletos: '+r.codigoInformeTecnico);
  return row;
 }
 function load(parts,legacy,meta){
  if(!Array.isArray(parts)||parts.length!==4||!Array.isArray(legacy))throw Error('Snapshot incompleto');
  const codes=new Set(legacy.map(r=>r[9]));
  const seen=new Set(),rows=[];
  let wl=0;
  for(let k=0;k<4;k++){
   const p=parts[k];
   if(p.schemaVersion!==1||p.pageStart!==k*68||p.sourceTotalCount!==8315||
    p.sourceWltcCount!==860||p.retrieved!=='2026-10-18'||
    p.source!=='https://api-consumovehicular.minenergia.cl/vehiculos/listar'||
    !Array.isArray(p.items)||p.items.length!==68)throw Error('Bloque oficial mal formado: '+(k+1));
   for(const r of p.items){
    const row=convert(r),code=row[9];
    if(seen.has(code)||codes.has(code)||row[8]>'2026-10-18')throw Error('Código duplicado, anterior o futuro: '+code);
    if(r.sourceCycle==='WLTP')wl++;
    seen.add(code);rows.push(row);
   }
  }
  if(rows.length!==272||seen.size!==272||wl!==254)throw Error('Totales API oficial inconsistentes');
  return rows;
 }
 return {convert,load,tech,num};
});