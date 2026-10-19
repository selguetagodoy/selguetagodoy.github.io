/* RINDELAB V2.3 — Mostrar la complejidad solo cuando la persona la necesita. */
(()=>{'use strict';
document.addEventListener('DOMContentLoaded',()=>{
 const drawer=document.getElementById('supuestos');
 const advanced=document.getElementById('scenarioAdvanced');
 const charge=document.getElementById('chargeScenario');
 if(!drawer||!advanced||!charge)return;
 // Accesos directos históricos y enlaces de la navegación.
 const revealFromHash=()=>{
  const target=decodeURIComponent(location.hash.slice(1));
  if(!target)return;
  if(target==='supuestos'||target==='scenarioAdvanced'||drawer.contains(document.getElementById(target))){
   drawer.open=true;
   if(target==='scenarioAdvanced'||(target!=='supuestos'&&advanced.contains(document.getElementById(target))))advanced.open=true;
  }
 };
 document.querySelectorAll('a[href="#supuestos"],a[href="./index.html#supuestos"]').forEach(a=>{
  a.addEventListener('click',()=>{drawer.open=true});
 });
 const sync=()=>{
  const mode=charge.value;
  if((mode==='home'||mode==='mixed'||mode==='manual')&&drawer.open)advanced.open=true;
 };
 charge.addEventListener('change',sync);
 window.addEventListener('hashchange',revealFromHash);
 revealFromHash();
});
})();