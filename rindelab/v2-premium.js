/* RINDELAB V2 — interacción de presentación independiente de la lógica de datos. */
(()=>{'use strict';
document.addEventListener('DOMContentLoaded',()=>{
 const tech=document.getElementById('tech');
 const form=document.getElementById('vehicleForm');
 const chips=[...document.querySelectorAll('[data-quick-tech]')];
 const update=()=>chips.forEach(button=>{
  const active=button.dataset.quickTech===tech.value;
  button.setAttribute('aria-pressed',String(active));
 });
 chips.forEach(button=>button.addEventListener('click',()=>{
  tech.value=button.dataset.quickTech;
  tech.dispatchEvent(new Event('change',{bubbles:true}));
  update();
  // Ejecuta una búsqueda real con los filtros y el catálogo existentes.
  form.requestSubmit();
 }));
 tech.addEventListener('change',update);
 document.getElementById('resetButton')?.addEventListener('click',update);
 const chargeScenario=document.getElementById('chargeScenario');
 const shortcuts=[...document.querySelectorAll('[data-scenario-mode]')];
 const syncShortcuts=()=>shortcuts.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.scenarioMode===chargeScenario?.value)));
 shortcuts.forEach(b=>b.addEventListener('click',()=>{
  chargeScenario.value=b.dataset.scenarioMode;
  chargeScenario.dispatchEvent(new Event('change',{bubbles:true}));
  syncShortcuts();
 }));
 chargeScenario?.addEventListener('change',syncShortcuts);
 syncShortcuts();
 document.querySelectorAll('[data-open-rankings]').forEach(link=>link.addEventListener('click',event=>{
  event.preventDefault();
  document.getElementById('mobileNav')?.removeAttribute('open');
  document.getElementById('statsOpen')?.click();
 }));
 update();
});
})();