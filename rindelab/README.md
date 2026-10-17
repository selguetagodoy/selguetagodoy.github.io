# RINDELAB · Con las alzas, cada peso cuenta

Herramienta independiente de consulta y comparación de homologaciones vehiculares chilenas. Creada por **Sebastián Elgueta Godoy**.

Sitio: https://selguetagodoy.github.io/rindelab/

## Versión 5 — navegación centrada en búsqueda

- **Búsqueda libre por marca, modelo, versión y código** con coincidencias normalizadas; admite separadores alternativos y variantes de escritura conocidas.
- **Búsqueda como primer control del catálogo**, sin obligar a escoger una categoría.
- **Filtros dependientes**: categoría → marcas compatibles → familias de modelos disponibles; motorización, ciclo, fecha y carrocería refinan los listados.
- Ante **filtros incompatibles**, se indica cuántas coincidencias existen en el catálogo completo y se permite eliminar filtros con una acción.
- **Correcciones sugeridas** ante errores de escritura, sin inventar vehículos.
- Orden explícito por **más relevantes**, **homologaciones más recientes**, marca/modelo y costo condicionado a tecnología/ciclo homogéneos.
- **10 resultados iniciales** y botón para mostrar otros diez, en lugar de desplegar 25 fichas largas.
- Comparador de **2 a 4 vehículos**, con bandeja de selección persistente, navegación horizontal accesible y advertencia al mezclar ciclos NEDC y WLTP. No desplaza automáticamente la pantalla al elegir el segundo vehículo.
- Interfaz móvil simplificada: menú compacto, portada reducida, controles táctiles de al menos 44 píxeles en acciones principales, filtros verticales y comparador desplazable con botones.
- Los análisis detallados, las tecnologías y la metodología quedan en paneles desplegables; el CSV está en **Más herramientas**.
- Hoja de estilos activa única `ux-v5.css`; módulos activos `app-v5.js` y `ui-v5.js`.

## Base y límites metodológicos

La fuente es el registro público 3CV del Ministerio de Energía, con corte declarado **8 de mayo de 2026**. El manifiesto conserva **8.056 registros**, mientras la vista muestra **8.053**: tres fichas poseen fechas posteriores al corte y se excluyen deliberadamente de la consulta. Esta diferencia no constituye por sí misma un error de transcripción; las fechas deben verificarse en la planilla fuente antes de corregirlas.

- La categoría navegable se construye a partir de la **carrocería 3CV**. «Station Wagon» no es una certificación de segmento SUV.
- Cada fila conserva ciclo de homologación, fecha, código 3CV, carrocería y otros campos del registro.
- La **motorización declarada en 3CV** se conserva y presenta separadamente de la **clasificación interpretativa** utilizada para orientar los filtros. La marca original también queda distinguida en la ficha y el CSV.
- Fórmulas de escenarios: combustibles `100 / km_por_litro × CLP_por_litro`; EV `100 / km_por_kWh × CLP_por_kWh × (1 + pérdidas_asumidas)`.
- Los indicadores ponderados de **PHEV y REEV** no se equiparan a consumos por modo con batería descargada. El simulador manual utiliza exclusivamente valores introducidos por el usuario.
- No mezclar directamente rendimientos **NEDC y WLTP**. Ninguna homologación acredita disponibilidad comercial actual, precio de compra ni consumo real en ruta.
- Las tarifas iniciales son supuestos editables, **no cotizaciones en tiempo real**.

Planilla fuente: https://consumovehicular.minenergia.cl/sites/default/files/middleware/RENDIMIENTOOFICIAL08may2026.xlsx

## Pruebas

Suite reproducible `rindelab/tests/e2e.cjs` con Playwright Chromium, que verifica carga y recuentos, búsqueda de Corolla Cross, dependencias categoría/marca/modelo, conflictos de filtros, errores tipográficos, tarifas, ordenamiento, comparador, móvil y ausencia de desbordamiento horizontal.

Local:
1. Servir la raíz del repositorio: `python3 -m http.server 8765`.
2. Instalar `playwright` y navegador Chromium: `npm install --no-save playwright && npx playwright install chromium`.
3. Ejecutar `node rindelab/tests/e2e.cjs`.

CI: `.github/workflows/rindelab-ui-e2e.yml`, activo para pull requests y cambios a `main`.

## Autoría y contacto

**Sebastián Elgueta Godoy** · e.elguetagodoy@gmail.com. «Chequea la información en los sitios oficiales». Proyecto independiente sin afiliación ni patrocinio de fabricantes.
