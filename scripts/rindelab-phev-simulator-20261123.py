from pathlib import Path
R=Path(__file__).resolve().parents[1]/'rindelab'
p=R/'v6.js'
s=p.read_text(encoding='utf8')
def patch(old,new,count=1):
 global s
 assert s.count(old)==count,(old[:130],s.count(old))
 s=s.replace(old,new)
plugIn= r"""
// Simulación explícita, NO homologación combinada: el rendimiento a combustión
// se ingresa manualmente y no se infiere del valor ponderado PHEV del 3CV.
function plugInCostPer100(sharePercent,electricKmPerKwh,combustionKmPerL,electricClpPerKwh,fuelClpPerL){
 const pct=Number(sharePercent);
 if(!Number.isFinite(pct)||pct<0||pct>100)return null;
 const share=pct/100;
 if(share>0&&(!Number.isFinite(electricKmPerKwh)||electricKmPerKwh<=0||
                !Number.isFinite(electricClpPerKwh)||electricClpPerKwh<=0))return null;
 if(share<1&&(!Number.isFinite(combustionKmPerL)||combustionKmPerL<=0||
                !Number.isFinite(fuelClpPerL)||fuelClpPerL<=0))return null;
 const electric=share?100*share/electricKmPerKwh*electricClpPerKwh:0;
 const combustion=share<1?100*(1-share)/combustionKmPerL*fuelClpPerL:0;
 return {total:electric+combustion,electric,combustion};
}
function plugInProfile(row){
 if(!isPlugInTechnology(row[F.TECH]))return;
 const section=document.createElement('section');
 section.className='rinde-profile rinde-plug-in-profile';
 const isDiesel=row[F.FUEL]==='Diésel';
 const fuelLabel=isDiesel?'diésel':'bencina';
 section.innerHTML='<h3>Simular tu uso eléctrico y a combustión</h3>'+
 '<p class="note">Ejercicio opcional para híbridos enchufables y vehículos de rango extendido. Usa los km/kWh informados por 3CV para el tramo eléctrico, pero <strong>el rendimiento exclusivo a combustión lo ingresas tú</strong>. El rendimiento ponderado oficial no es equivalente al rendimiento solo a combustión. Esta estimación no modifica la ficha 3CV.</p>'+
 '<div class="rinde-profile-fields">'+
 '<label>Porcentaje de kilómetros recorridos en modo eléctrico: <output id="rindePlugInShareLabel" for="rindePlugInShare">70 %</output><input type="range" id="rindePlugInShare" min="0" max="100" step="5" value="70"></label>'+
 '<label>Rendimiento exclusivamente con '+fuelLabel+' (km/L), supuesto del usuario <input type="number" id="rindePlugInFuel" min="0.1" max="100" step="0.1" inputmode="decimal" placeholder="Ej.: 12, dato ingresado por ti"></label>'+
 '</div><p id="rindePlugInResult" role="status" aria-live="polite">Ingresa un rendimiento a combustión para estimar un perfil mixto.</p>';
 $('detailContent').append(section);
 const update=()=>{
  const share=Number($('rindePlugInShare').value);
  $('rindePlugInShareLabel').textContent=share+' %';
  const raw=$('rindePlugInFuel').value;
  const fuelEfficiency=raw===''?null:Number(raw);
  const electricalEfficiency=number(row[F.EL]);
  const electricityPrice=number($('electricPrice').value);
  const fuelPrice=number($(isDiesel?'dieselPrice':'gasPrice').value);
  const annualKm=number($('annualKm').value);
  if((share<100&&(!Number.isFinite(fuelEfficiency)||fuelEfficiency<=0||fuelEfficiency>100))||
     (share>0&&!electricalEfficiency)||!annualKm){
   $('rindePlugInResult').textContent='Para estimar, ingresa el rendimiento real o supuesto exclusivamente a combustión (0,1–100 km/L) y verifica que la ficha tenga km/kWh eléctrico informado. No uses aquí el valor ponderado 3CV.';
   return;
  }
  const outcome=plugInCostPer100(share,electricalEfficiency,fuelEfficiency,electricityPrice,fuelPrice);
  if(!outcome){
   $('rindePlugInResult').textContent='Falta una tarifa de combustible o electricidad válida para el reparto elegido.';
   return;
  }
  const yearly=outcome.total*annualKm/100;
  $('rindePlugInResult').textContent='Costo supuesto por 100 km: '+money(outcome.total)+
   ' (electricidad '+money(outcome.electric)+' + '+fuelLabel+' '+money(outcome.combustion)+
   '). A '+fmt(annualKm)+' km/año: '+money(yearly)+' anual y '+money(yearly*5)+' en 5 años, tarifas constantes. El reparto es de kilómetros, no de energía; no incluye pérdidas de carga ni otros gastos. No es rendimiento homologado.';
 };
 section.addEventListener('input',update);
 section.addEventListener('change',update);
 update();
}
"""
patch("function showDetail(i){",plugIn+"\nfunction showDetail(i){")
patch("  ['Ciclo de homologación',r[F.CYCLE]],['Fecha de homologación',r[F.DATE]],",
"""  ['Ciclo de homologación',r[F.CYCLE]],['Fecha de homologación',r[F.DATE]],
  ['Año de modelo/fabricación acreditado en esta ficha 3CV','No informado; no inferirlo de la fecha de homologación ni de la fotografía'],""")
patch(" drivingProfile(r);\n if(reviewedEnergyCodes.has(r[F.CODE]))", """ drivingProfile(r);
 plugInProfile(r);
 if(reviewedEnergyCodes.has(r[F.CODE]))""")
patch(" $('scenarioSummaryText').textContent='Calculado para '+fmt(km)+' km al año · '+place+' · precios editables';",
""" $('scenarioSummaryText').textContent='Calculado para '+fmt(km)+' km al año · '+place+' · tarifas editables, no en tiempo real'+
  ((mode==='public'||mode==='mixed')?' · carga pública consultada 18/10/2026':'');""")
p.write_text(s,encoding='utf8')
# Estilo utilizable en ficha con rango e inputs amplios.
css=R/'v6.css'
with css.open('a',encoding='utf8') as f:
 f.write("""

/* Perfil PHEV/REEV opcional. Escenarios manuales, no mediciones oficiales. */
.rinde-plug-in-profile{margin-top:18px}
.rinde-plug-in-profile .rinde-profile-fields{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px}
.rinde-plug-in-profile label{display:grid;gap:8px;font-weight:650;font-size:13px;line-height:1.5}
.rinde-plug-in-profile input[type="range"]{width:100%;min-height:44px;accent-color:#116781}
.rinde-plug-in-profile input[type="number"]{width:100%;min-height:44px;padding:9px 11px;border:1px solid #9bafbd;border-radius:8px}
.rinde-plug-in-profile [role="status"]{padding:11px 13px;background:#eef7f8;border-radius:8px;color:#16445a;line-height:1.55;font-size:13px}
""")
for file,old,new in [
('index.html','./v6.js?v=20261123-search-reset','./v6.js?v=20261123-phev-scenario'),
('index.html','./v6.css?v=20261123-touch-search','./v6.css?v=20261123-phev-scenario')]:
 p=R/file;s=p.read_text(encoding='utf8');assert s.count(old)==1;s=s.replace(old,new);p.write_text(s,encoding='utf8')
print('PASS profile PHEV and date labeling')
