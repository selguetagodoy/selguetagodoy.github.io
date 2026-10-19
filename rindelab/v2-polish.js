/* RINDELAB: evita la duplicación visual entre la barra de ajustes y el panel, sin perder acceso con JS desactivado. */
(()=>{'use strict';document.addEventListener('DOMContentLoaded',()=>{
 const drawer=document.getElementById('supuestos');
 const link=document.getElementById('scenarioAdjust');
 if(!drawer||!link)return;
 document.documentElement.classList.add('js-polished');
 const show=()=>{drawer.open=true;requestAnimationFrame(()=>drawer.scrollIntoView({block:'start',behavior:'instant'}))};
 link.addEventListener('click',show);
 // V2-claridad.js abre los enlaces directos y conserva el botón del escenario.
 if(location.hash==='#supuestos')drawer.open=true;
});})();