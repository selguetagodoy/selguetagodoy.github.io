# RINDELAB — Procedimiento de precios de electromovilidad

## Nuevo flujo: inventariar → buscar → completar → validar → importar

**Archivo maestro editable:** rindelab/sii/bandeja-precios-electromovilidad.csv
**Tablero consultable:** rindelab/pendientes-electromovilidad.html
**Importador:** scripts/rindelab-price-queue.cjs
**Catálogo publicado:** rindelab/sii/commercial-2026.json

La bandeja se generó desde 1.108 fichas electrificadas del registro histórico 3CV de 08/05/2026, que produjeron 988 combinaciones distintas marca–denominación técnica–tecnología en 80 agrupaciones de marca. Es un inventario de **revisión editorial**, NO de 988 vehículos comercializados ni 988 precios faltantes confirmados. Incluye modelos históricos y anomalías de fecha; no atribuir venta vigente por su sola presencia en 3CV. Se conserva el nombre original del 3CV, código de referencia y última fecha.

## Orden de revisión
A_marcas_prioritarias: 66 denominaciones de GWM (Great Wall y Haval; incluye ORA), Leapmotor, JMC, JAC, BAIC, Dongfeng/DFM/Nammi y MG.
B_electrificados_recientes: EV/REEV/PHEV con fecha 2025+ de otros grupos.
C_hibridos_recientes: HEV/MHEV recientes de otros grupos.
D_electricos_historicos / E_hibridos_historicos: homologaciones anteriores a 2025; investigar sin asumir oferta comercial.
F_fecha_futura: ficha posterior al corte 19/10/2026; requiere comprobar la fecha.

## Estados editoriales
pendiente_revision: pendiente cotejo de versión comercial.
en_busqueda: búsqueda de fuente original en proceso.
fuente_encontrada: fuente candidata localizada, importe o correspondencia aún no validado.
sin_precio_publicado: la fuente no ofrece valor de lista inequívoco; documentar URL y observación.
listo_para_importar: ficha con versión, precio de lista, fuente y evidencia ya comprobados, habilitada para migración.
ya_importado: versión comercial incorporada al catálogo; no repetir.
fuera_de_alcance: fila técnica no procede para el lote.

**Una fila 3CV no es una versión de venta.** No se marca automáticamente ya_importado por compartir modelo. Si existen varias versiones comerciales para el mismo modelo, duplicar la fila técnica con un ID nuevo para cada versión, sin alterar el dato oficial de homologación. También se admiten filas comerciales sin ficha 3CV: los campos 3CV pueden quedar vacíos.

## Completar un precio
Registrar marca_comercial, familia_comercial, version_comercial, anio_modelo (vacío si no consta), tecnologia_comercial, precio_lista_clp, moneda=CLP, tipo_precio=lista_sin_bonos, fuente_precio_url HTTPS, fecha_consulta ISO, fin_campana (cuando corresponda), evidencia_documental y observaciones. La evidencia debe citar dónde figura exactamente la columna o campo precio lista. Si solo hay precio con bono, precio desde o un valor +IVA sin precio lista con IVA explícito, no estimar; dejar pendiente.

## Validación por lote
1. Completar filas en la tabla sin modificar el catálogo público.
2. Ejecutar: node scripts/rindelab-price-queue.cjs --check
3. Simular: node scripts/rindelab-price-queue.cjs --dry-run
4. Solo al cerrar el lote documental, migrar: node scripts/rindelab-price-queue.cjs --apply
5. Ejecutar: node scripts/audit-price-sources.cjs
6. Ejecutar: node scripts/audit-commercial-versions.cjs
7. Publicar CSV y catálogo JSON juntos en un único PR, tras pasar QA GitHub Actions (E2E, visual, móvil).

El importador valida dominios contra la lista oficial del auditor, importes literales, fecha y tipo de precio; no pisa registros con cifras discrepantes. Al migrar marca las filas como ya_importado. No ejecutar --apply para filas simplemente investigadas.

El objetivo es reproducir información oficial y reducir tiempo de investigación, no certificar stock, campañas vigentes o una cobertura porcentual artificial del mercado.
