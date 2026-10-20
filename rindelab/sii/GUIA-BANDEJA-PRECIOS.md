# RINDELAB — Procedimiento de precios de electromovilidad

## Nuevo flujo: inventariar → buscar → completar → validar → importar

**Archivo maestro editable:** rindelab/sii/bandeja-precios-electromovilidad.csv
**Resumen por marca:** rindelab/sii/avance-marcas-electromovilidad.csv
**Tablero consultable:** rindelab/pendientes-electromovilidad.html
**Importador:** scripts/rindelab-price-queue.cjs
**Catálogo publicado:** rindelab/sii/commercial-2026.json

La bandeja se generó desde 1.108 fichas electrificadas del registro histórico 3CV de 08/05/2026, que produjeron 988 combinaciones distintas marca–denominación técnica–tecnología en 79 agrupaciones de marca. Es un inventario de **revisión editorial**, NO de 988 vehículos comercializados ni 988 precios faltantes confirmados. Incluye modelos históricos y anomalías de fecha; no atribuir venta vigente por su sola presencia en 3CV. Se conserva el nombre original del 3CV, código de referencia y última fecha.

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

La opción --report genera/actualiza resumen de marcas y estadísticas. La opción --apply actualiza ambos archivos después de importar.

El importador valida dominios contra la lista oficial del auditor, importes literales, fecha y tipo de precio; no pisa registros con cifras discrepantes. Al migrar marca las filas como ya_importado. No ejecutar --apply para filas simplemente investigadas.

El objetivo es reproducir información oficial y reducir tiempo de investigación, no certificar stock, campañas vigentes o una cobertura porcentual artificial del mercado.

## Lote adicional: 200 candidatos investigables (19/10/2026)

- [Inventario Markdown de 200 modelos 3CV y resultado del cruce](./LOTE-200-FALTANTES-CRUCE-20261019.md).
- [CSV de trabajo editable por marca, versión, fuentes y precio](./lote-200-cruce-precios-20261019.csv).

Este lote amplía las 66 prioridades anteriores. El cruce se hizo contra 359 precios de una rama todavía pendiente de integrar (PR #85); el catálogo publicado en `main` contiene 347. No equivale a 200 precios faltantes verificados en el mercado: son 200 denominaciones técnicas adicionales candidatas a investigación. Solo migrar al catálogo comercial valores literales respaldados y versiones comprobadas, sin inferir relaciones 3CV ni reusar precios por similitud de nombre.


## Cierre de universo B/C y lote documental de 11 precios (19/10/2026)

- [Lote 104 restante, Markdown](./LOTE-104-RESTANTES-CRUCE-20261019.md) y [CSV editable](./lote-104-cruce-precios-20261019.csv): junto con el primer lote de 200 cubren las 304 denominaciones recientes sin coincidencia literal de versión y tecnología. No son 304 precios faltantes certificados.
- [11 versiones Audi/CUPRA con precios de lista oficiales y fecha de campaña](./LOTE-FUENTES-OFICIALES-20261019.md) y [CSV de incorporación documental](./lote-11-precios-verificados-20261019.csv).

El CSV de 11 conserva `modelo_fuente_3cv`, `codigo_3cv_referencia` y otros campos técnicos vacíos para evitar asignaciones no acreditadas. La actualización documental original no insertó valores. El PR #85 ya incorporó 12 precios (359 en main) y el PR #88 incorpora las 11 versiones oficiales de Audi/CUPRA (370 al fusionarse), manteniendo códigos 3CV vacíos. Las versiones siguen requiriendo QA de fuentes y navegador.

## Lote adicional de 36 precios comerciales (19/10/2026)

- [Informe Markdown de JAC, Dongfeng y MINI](./LOTE-36-PRECIOS-20261019.md).
- Se incorpora al JSON comercial un único lote documentado, con 28 versiones JAC convencionales, 1 Dongfeng EV y 7 eléctricos MINI. Los precios están separados de los bonos y no suponen equivalencia 3CV.

## Lote con 1.028 registros comerciales (19/10/2026)

El listado de **622 precios adicionales** con fuentes y el cruce documental está en [LOTE-META-1000-20261019.md](./LOTE-META-1000-20261019.md). La base pública solo se actualizará al aprobar GitHub Actions. Las 304 denominaciones de 3CV estudiadas antes siguen siendo un inventario técnico sin relación automática con las versiones de venta.

## Pompeyo Carrasco: modelos nuevos y Lynk & Co (19/10/2026)

- [107 fichas accesibles de las seis páginas del catálogo Pompeyo de 111 modelos anunciados](./POMPEYO-111-MODELOS-PENDIENTES-20261019.csv), con estado de cotejo por modelo y 2 Leapmotor ya cargados.
- [Ocho precios de lista nuevos Lynk & Co por acabado, cotejados individualmente con Cartoni](./LOTE-POMPEYO-LYNKCO-20261019.md).
- El PR dependiente eleva la base de 1.028 a **1.036 precios**, 48 marcas y 230 electrificados; ni B10 ni C10 se duplicaron, y T03 permanece pendiente de precio comercial chileno.
- No trasladar importes `+IVA` de vehículos comerciales ni precios `Desde` al catálogo de valores con IVA.

## Precios verificados en Astara Retail y Gildemeister Retail (19/10/2026)

[Expediente de nueve nuevas versiones con precio de lista explícito](./LOTE-ASTARA-GILDEMEISTER-20261019.md). Tres GAC AION EV, GS4 MAX y dos Mahindra XUV 3XO; el cotejo evita duplicar Hyundai Inster, Palisade y JMC EV3. Nuevo total provisional: **1.045** registros en rama dependiente, sujeto a QA de PR #90, PR #91 y este lote.

También se añadieron Nissan Kait Exclusive y X-Trail e-POWER (Astara Retail), más Shineray X30 con A/C (Gildemeister). Ver [expediente actualizado](./LOTE-ASTARA-GILDEMEISTER-20261019.md).

### Extensión Gildemeister 4 versiones (19/10/2026)

GAC GS4 híbrido HEV, Shineray T50 y dos acabados SWM G05, con fuente de lista IVA incluido, documentadas en [LOTE-ASTARA-GILDEMEISTER-20261019.md](./LOTE-ASTARA-GILDEMEISTER-20261019.md). Cuatro registros adicionales elevan la rama dependiente PR #92 a **1.049 precios y 49 marcas**, pero no equivalen a modelos homologados 3CV ni precios publicados hasta fusionar PR #90/91/92.
