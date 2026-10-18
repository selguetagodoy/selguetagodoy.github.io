# RINDELAB · Con las alzas, cada peso cuenta

**RINDELAB v6** es un buscador independiente de vehículos homologados en Chile, creado por **Sebastián Elgueta Godoy**.

Web pública: https://selguetagodoy.github.io/rindelab/

## Flujo principal

1. Escribir marca o modelo, o seleccionar **Marca → Modelo → Motorización**.
2. Pulsar **Buscar vehículos**. Los resultados no aparecen ni cambian antes del clic.
3. Ordenar la lista por **homologación más reciente**, **menor costo estimado**, **mayor costo estimado** o **marca y modelo**.
4. Elegir **Ver ficha** para revisar los datos 3CV o pulsar **Comparar +** para seleccionar **entre dos y cinco vehículos**. La bandeja conserva modelos al hacer una nueva búsqueda, incluso al usar «Limpiar» (que solo restablece filtros).
5. Desde la bandeja o la ventana de comparación, utilizar **«+ Agregar otro»** para buscar otra marca o modelo. Cada vehículo puede retirarse individualmente con «×», sin vaciar la lista. Con cinco modelos se puede reemplazar uno quitándolo primero.
6. Pulsar **«Comparar N vehículos»** para abrir la tabla lateral. En pantallas estrechas se desplaza horizontalmente con el dedo o las flechas; cuando caben todas las columnas no se muestran controles de desplazamiento.
7. Ampliar los **Filtros técnicos adicionales** cuando se requiera ciclo, fecha o carrocería.
8. Consultar la metodología o editar los precios referenciales en **Metodología y fuentes**.

La interfaz principal no incluye contadores de marcas, rankings de extremos, simuladores híbridos independientes, banners educativos ni comparador vacío. Tiene un único formulario, resultados y comparación opcional.

## Fuente, datos y límites

La base combina **8.053 fichas** del archivo 3CV con corte al **8 de mayo de 2026** y **272 códigos adicionales** identificados en la API oficial de Consumo Vehicular consultada el **18 de octubre de 2026**, para un total de **8.325 códigos únicos**. El manifiesto original de mayo contiene 8.056 registros, de los que la aplicación emplea 8.053 al corte; se conservan sin alteraciones, incluso las diez fichas históricas ausentes de la consulta más reciente. Los 272 registros nuevos preservan sus valores y su ciclo de ensayo oficial. Es un archivo de homologaciones, no una lista de modelos en venta. Los detalles del cruce están documentados en la sección «Quinta capa».

- El orden por costo utiliza supuestos iniciales editables: bencina 93 CLP 1.535/L, diésel CLP 1.503/L y electricidad CLP 340/kWh. No son precios en tiempo real ni especifican el octanaje exigido por el fabricante.
- Combustible: **100 ÷ rendimiento mixto km/L × precio CLP/L**. Eléctrico: **100 ÷ rendimiento km/kWh × tarifa CLP/kWh**, sin pérdidas de carga ni cobros adicionales.
- Los resultados y rankings muestran **NEDC y WLTP en una sola lista** de menor a mayor o mayor a menor costo, con el ciclo visible en cada ficha. Este orden conjunto es **orientativo**, ya que ambos procedimientos de ensayo no son directamente equivalentes. Se puede filtrar por ciclo cuando se requiera una comparación más homogénea.
- Para PHEV/REEV se muestran los rendimientos homologados eléctricos y ponderados; **no se calcula costo energético combinado** a partir de esos valores. No se generan categorías híbridas inferidas.
- La ficha conserva marca y motorización **de origen** separadas de los ajustes interpretativos para navegación.
- Para validación final consultar https://consumovehicular.minenergia.cl/sites/default/files/middleware/RENDIMIENTOOFICIAL08may2026.xlsx

## Auditoría de carrocerías 3CV — rankings

La auditoría de las **8.053 fichas visibles** identificó **18 denominaciones originales de carrocería**. Las agrupaciones previas cubrían todos los registros, pero denominaban «SUV / Station Wagon» a un conjunto que sumaba indiscriminadamente 3.525 Station Wagon y 31 registros «Jeep»/«Tipo Jeep». Esa descripción podía interpretarse erróneamente como un ranking específico de SUV.

Se preserva cada carrocería **tal como está declarada en el 3CV**, sin modificar los JSON ni inventar una segmentación comercial. La ventana de estadísticas utiliza ocho grupos **mutuamente excluyentes**, cuya suma corresponde exactamente al universo visible:

| Filtro visible | Carrocerías de origen | Fichas al corte |
|---|---|---:|
| Station Wagon (3CV) | Station Wagon | 3.525 |
| Jeep / Tipo Jeep (3CV) | Jeep, Tipo Jeep | 31 |
| Sedán / limusina | Sedán, Limusina | 1.072 |
| Hatchback | Hatchback | 1.156 |
| Camioneta | Camioneta | 1.056 |
| Coupé / descapotable | Coupé, Cabriolet, Convertible, Descapotable, Roadster | 676 |
| Furgón / van / minivan | Furgón, Van, Minivan, Microvan | 352 |
| Bus / minibús | Bus, Minibus | 185 |
| **Total** | **18 etiquetas originales** | **8.053** |

El grupo «Station Wagon» puede contener vehículos vendidos como SUV, pero **no equivale a un inventario de SUV verificados**. La aplicación explica la limitación al seleccionar esa categoría. Tampoco se presume que «Jeep/Tipo Jeep» agote todos los todoterreno: son dos etiquetas históricas concretas del archivo.

Se detectó un caso a revisar con la fuente: **INEOS Grenadier Pick-Up** figura como «Station Wagon» en la extracción 3CV. Este registro permanece allí hasta contrastar el expediente original y no se reclasifica automáticamente por el nombre del modelo. El filtro técnico de búsqueda conserva las 18 categorías exactas, en vez de reemplazarlas por grupos editoriales.

La regresión automatizada valida las ocho particiones con cobertura completa, cero duplicaciones y cero registros sin categoría, junto con las tablas de rankings y la presentación móvil.

## Auditoría de fichas y comparación de enchufables

Tras habilitar las estadísticas, se corrigió otra incoherencia: los resultados PHEV/REEV ofrecían ordenar por **menor o mayor costo energético** aun cuando ningún registro del filtro tenía un costo combinado calculable. Estas opciones se deshabilitan cuando todos los resultados carecen de costo estimable y se muestra una explicación visible; siguen funcionando para los filtros con costos calculables.

En la lista y las fichas se diferencian explícitamente el **rendimiento eléctrico informado (km/kWh)** y el **rendimiento ponderado informado (km/L)**. La matriz comparativa de hasta cinco vehículos incluye filas específicas para ambas medidas cuando al menos uno es PHEV o REEV, dejando «No aplica» cuando la motorización no corresponde. No se interpreta el campo eléctrico de la fuente como «ponderado km/kWh», ni se presenta el rendimiento ponderado de combustible como consumo con batería descargada.

## Ajuste PHEV y REEV — estadísticas con datos homologados

El registro base 3CV al corte visible incluye **232 fichas PHEV** y **8 REEV**, todas con el campo eléctrico (km/kWh) y el ponderado (km/L) informado. Esas fichas **no deben desaparecer** del apartado de estadísticas porque no se calcule un costo de energía combinado.

Al seleccionar **PHEV** o **REEV**, la medida se ajusta explícitamente a «Rendimiento eléctrico informado (km/kWh)». El usuario puede seleccionar alternativamente «Rendimiento ponderado informado (km/L)» y ordenar ascendente/descendente, filtrando por ciclo y carrocería. El top 10 muestra el número real de fichas elegibles; REEV muestra ocho cuando no hay otros filtros. Cada vehículo se vincula a su ficha 3CV. NEDC y WLTP se identifican individualmente y no se equiparan sus resultados.

**Se mantiene deshabilitado el ranking de costo combinado para PHEV y REEV**, porque los datos ponderados no bastan para asignar un costo energético de 100 km sin supuestos adicionales sobre electricidad, combustible y perfil de uso. Tampoco se convierten km/kWh en km/L.

**Se retira «Híbrido por verificar» del selector público.** La categoría era una inferencia de la web basada en palabras como Hybrid, y no una clasificación registrada como tal por el 3CV. No se modificarán las tecnologías declaradas en el archivo original ni se reclasificarán automáticamente. Si el nombre comercial sugiere híbrido pero el registro declara Bencina, la ficha deja constancia de la diferencia sin asignar MHEV/HEV.

## Renovación visual y ventana de estadísticas (v7)

La portada incorpora la ilustración original de vehículos y cordillera (`hero-rindelab.svg`), un tratamiento visual más trabajado y un acceso a **Ver rankings y estadísticas**. Se conserva **una sola búsqueda** y la lista de resultados aparece únicamente al pulsar «Buscar». Las fichas de resultados tienen una jerarquía visual más clara, sin añadir cifras no respaldadas.

Las estadísticas se muestran en un **diálogo independiente y accesible**, no en el flujo principal. Permiten consultar **top 10** con controles dinámicos de:
- Métrica: costo energético estimado en CLP/100 km o rendimiento homologado.
- Orden: menor a mayor y mayor a menor.
- Motorización: bencina, diésel, MHEV, HEV, PHEV, REEV, EV u otras categorías según fuente.
- Carrocería: SUV/Station Wagon, sedán, hatchback, camioneta, coupé, furgón o bus.
- Ciclo: **Todos (WLTP + NEDC) por defecto**, o bien solo WLTP o solo NEDC. Cada posición del top 10 señala su ciclo mediante una etiqueta visible.

Los rankings están calculados a partir de las fichas reales que cumplen los filtros; cada fila permite abrir la ficha técnica. Los costos de PHEV y REEV sin valores comparables no se modelan ni sustituyen con proxies. Para rendimiento es necesario seleccionar una motorización con unidades homogéneas (km/L o km/kWh). Sin filas elegibles, el panel informa la limitación en vez de inventar valores. Las tarifas son las mismas que utiliza el buscador y pueden editarse en «Metodología y fuentes».

## Estructura

- `rindelab/index.html`: buscador, resultados, diálogos y metodología.
- `rindelab/v6.js`: carga oficial, búsqueda explícita, filtros dependientes, costo, ordenamiento y comparación.
- `rindelab/v6.css`: sistema visual responsive.
- `rindelab/tests/e2e.cjs`: pruebas E2E con Playwright Chromium; incluye 320, 390, 768 y 1.440 px.
- `.github/workflows/rindelab-ui-e2e.yml`: CI de Playwright en pull requests y main.

Para pruebas locales servir la raíz del repositorio en puerto 8765, instalar Playwright y ejecutar `node rindelab/tests/e2e.cjs`. La verificación de datos y tarifas no sustituye la documentación 3CV.


## Auditoría de cobertura de precios frente al 3CV (octubre de 2026)

La página separada [Cobertura comercial y 3CV](./cobertura.html) permite examinar el grado de **coincidencia nominal por marca y familia** entre el catálogo documental de precios de lista y las fichas de homologación disponibles en el corte oficial 3CV del 08/05/2026. No altera el buscador principal ni las bases oficiales.

- **Denominador comercial:** 127 precios de lista asociados a 40 familias, correspondientes únicamente a las 10 marcas cargadas. No es una encuesta exhaustiva del mercado chileno.
- **Resultado de cobertura nominal:** cada familia comercial registra la cantidad de fichas 3CV cuyo nombre y marca pueden corresponderle, bajo reglas explícitas y comprobables. Los filtros permiten revisar casos con y sin coincidencia y descargar la tabla filtrada como CSV.
- **No hay emparejamiento automático de versiones.** Una coincidencia de familia puede mezclar generaciones, tracción, combustible, baterías, tecnología o transmisiones diferentes; en esta fase no se certifica ninguna equivalencia técnica entre versiones ni su disponibilidad comercial.
- **Reglas de exclusión documentadas:** Mazda CX-3 no confunde CX-30; Creta no absorbe Creta Grand; Hunter diésel excluye Hunter E/EREV; Yaris no absorbe Yaris Cross; Corolla Sedán no absorbe Corolla Cross; CS55 Plus no se equipara a CS55 de otra generación.
- **Reproducibilidad:** `node scripts/audit-commercial-3cv-coverage.cjs --json=coverage-audit.json` produce un informe estructurado y ejecuta aserciones sobre familias que no deben confundirse. La CI lo revisa antes de Playwright, que comprueba filtros, descarga CSV y tamaños de escritorio/móvil.

El 3CV registra homologaciones **históricas**, no una nómina de automóviles nuevos disponibles hoy. La fecha de una homologación no equivale al año comercial de una versión. La tasación SII y el permiso de circulación se mantienen separados.

El 18/10/2026 se incorporaron otras cinco versiones Subaru con precio de lista oficial: tres Impreza, un Crosstrek híbrido y un Forester Strong Hybrid Sport. Se excluyó la versión Forester Strong Hybrid Touring porque la propia ficha comercial muestra un precio de campaña igual al precio de lista pese a consignar bonos; no se deduce un importe alternativo. Los precios incorporados son referencias comerciales por versión y se seleccionan manualmente.

## Segunda capa: cotejo exploratorio por versión comercial (octubre de 2026)

La página [Revisión por versión](./versiones.html) examina las 127 fichas comerciales frente a homologaciones 3CV. Es una **auditoría preliminar**, no una base de equivalencias homologadas.

Se extraen únicamente rasgos **expresos** del nombre comercial: tecnología cuando se declara, cilindrada decimal, transmisión manual o categoría amplia automática, tracción y algunos códigos de generación. Se contrastan con tecnología, cilindrada, transmisión, tracción, combustible y modelo originales del 3CV.

Cada versión puede tener **un candidato preliminar**, **varios candidatos preliminares**, **información insuficiente**, **solo contradicciones** o **sin familia nominal**. Un candidato preliminar exige al menos dos atributos comerciales coincidentes y ninguna contradicción en esos rasgos; esto NO certifica identidad técnica, generación ni venta vigente.

Ejemplo real de discrepancia: Volkswagen Tera 1.6 MT presenta una ficha 3CV con modelo Tera 1.6 MT y transmisión A; el cotejo conserva el conflicto documental en vez de asociar el código automáticamente.

La tabla ofrece filtros, enlace directo a la fuente comercial, ejemplos 3CV con su código y fecha, y exportación CSV. Los conteos incluyen todas las fichas pero las muestras visuales pueden estar truncadas.

Para reproducir el análisis ejecutar: `node scripts/audit-commercial-versions.cjs --json=versions-audit.json`. GitHub Actions ejecuta esta auditoría y sus casos de regresión antes de Playwright.

**Límites:** no se certifica ninguna homologación individual. No se inventan años comerciales, generación, batería, equipamiento, stock ni identidad entre códigos. NEDC/WLTP, tasación fiscal SII, permiso de circulación y precio comercial siguen como conceptos independientes.

## Expediente prioritario de revisión 3CV

Desde la página [Revisión por versión](./versiones.html) se puede activar «Solo revisión prioritaria» para ver las dos versiones Volkswagen Tera 1.6 MSI MT con discrepancia entre fabricante y 3CV, junto con las 22 versiones que tienen un solo candidato preliminar. Esto no implica que existan 24 homologaciones verificadas.

Los 22 candidatos únicos **no representan necesariamente 22 códigos 3CV exclusivos**: algunas terminaciones comerciales (equipamiento) comparten el mismo código técnico candidato. La aplicación muestra el código, si se reutiliza entre versiones comerciales, y mantiene la advertencia sobre falta de equivalencia certificada.

La discrepancia Tera se documenta en [review-notes-2026.json](./sii/review-notes-2026.json), con fuente oficial Volkswagen, código 3CV y diferencia de transmisión. Según el fabricante, Tera Trend MT y Comfort MT llevan caja manual de cinco velocidades, mientras la ficha 3CV «TERA 1.6 MT» código VW9988E60525S00-6 indica «A» en la columna de transmisión. No se modifica ningún registro de la fuente 3CV. El expediente sigue abierto para contrastar con la autoridad correspondiente.

En cada ejecución de GitHub Actions, la etapa auditora genera `versions-audit.json`, `priority-review.json` y `priority-review.md`, y los publica como artefacto `rindelab-qa-3cv-prioridades` por 90 días, con las 24 prioridades y las evidencias para revisión. También se pueden generar localmente con `node scripts/audit-commercial-versions.cjs --json=versions-audit.json --priority-json=priority-review.json --priority-md=priority-review.md`.

## Tercera capa: fichas técnicas oficiales de fabricantes

El archivo [manufacturer-evidence-2026.json](./sii/manufacturer-evidence-2026.json) recoge comprobaciones sobre **22 versiones comerciales específicas** cuyos nombres ya tenían un candidato 3CV preliminar único. Cada registro identifica marca, familia, versión exacta, URL oficial, fecha de revisión, atributos expresos del fabricante y observación.

El cotejo ahora añade especificaciones **solo cuando el fabricante las documenta** y no contradicen los atributos deducibles del nombre comercial. Una contradicción produce fallo en auditoría; no se resuelve atribuyendo una versión por similitud.

**Suzuki Fronx:** el fabricante documenta tecnología Mild Hybrid para GL y GLX AT, contrastada con MHEV de la base 3CV. **Changan Hunter:** las variantes 2.0T MT corresponden a motor diésel, por lo que se cotejan además tipo de combustible y tecnología Diésel, separando las REEV. **Hyundai Venue:** las versiones MT y AT corresponden, respectivamente, a caja manual de seis velocidades y DCT de siete; el dato 3CV solo identifica categoría general M/A.

Se incluyen también las fichas oficiales de Hyundai Kona, Tucson; Changan Avatr 07; MG3 híbrido; Ford Territory híbrida y Maverick FHEV; Volkswagen Tera automático y Taos Comfortline. En Avatr E-CVT y otras automáticas, el cotejo con 3CV usa la categoría amplia A y nunca presupone equivalencia detallada de transmisión.

El indicador `sourceReviewedVersions` refleja fichas comerciales con alguna especificación contrastada, **no vehículos con código 3CV certificado**. Las dos discrepancias Volkswagen Tera manual siguen abiertas. No se cambian precios, fechas de homologación, emisiones ni rendimientos oficiales.

Ejecutar: `node scripts/audit-commercial-versions.cjs --json=versions-audit.json --priority-json=priority-review.json --priority-md=priority-review.md`. El expediente sigue disponible como artefacto descargable desde GitHub Actions.

## Cuarta capa: cotejo sobre nómina MTT del 28 de septiembre de 2026

Se leyó directamente el archivo XLS de la nómina MTT con corte al **28/09/2026**, aportado para este proyecto, y se extrajeron exclusivamente las 15 filas pertinentes: 14 códigos candidatos presentes y la ficha Volkswagen Tera 1.6 MT con conflicto. El original se conserva sin modificaciones. El extracto [mtt-nomina-20260928-extract.json](./sii/mtt-nomina-20260928-extract.json) contiene código, modelo, marca, transmisión, tecnología, combustible, cilindrada, certificado, fecha y número de fila del XLS. La procedencia se fija mediante el SHA256 `6b013ee19be8e78757efa171a262badf793d0148aa35ca2154224858caaa5afa`.

**Resultado:** los 14 de 14 códigos técnicos candidatos aparecen una vez cada uno en la nómina de septiembre. Los 22 precios comerciales siguen asociados solo como candidatos; ninguna correspondencia de SKU, equipamiento o generación individual está certificada por esta comprobación. La presencia del código y un número C.H. es evidencia registral, no prueba de la identidad comercial exacta.

**Tera:** la ficha VW9988E60525S00-6, modelo 'TERA 1.6 MT', certificado C.H. 7304, homologación 2025-07-10, fila 7162 de Excel, vuelve a indicar transmisión A, pese a que la versión comercial del fabricante se denomina MT. La contradicción persiste entre la evidencia del fabricante, el registro de rendimiento de mayo y la nómina MTT de septiembre. No se sobrescribe la fuente ni se usa para atribuir rendimiento a Tera MT.

**Fronx:** la nómina de septiembre describe SZ9173E60623S00-4 como 'Combustión Interna', mientras la base de rendimiento de mayo lo clasifica como MHEV y el fabricante señala Mild Hybrid. Se preservan y explican ambos criterios de clasificación sin equipararlos ni concluir que la diferencia sea un error.

La página [Control documental de homologaciones](./homologaciones.html) muestra los 14 códigos con número de certificado y fila exacta, fuentes de fabricante, códigos compartidos y los dos registros comerciales con contradicción. El CSV añade el certificado y los campos de septiembre sin mezclar ambas fuentes.

La CI ejecuta `node scripts/audit-homologation-register.cjs --json=homologation-ledger-audit.json`, verifica datos y hash, 14/14 códigos, certificado C.H. 7304, diferencias de transmisión y prohibición de certificar versiones por inferencia. Incluye pruebas negativas que deben fallar ante cambios artificiales de fila, transmisión, cilindrada, hash o confirmaciones manuales sin sustento.

**Separación metodológica:** la base de mayo (08/05/2026) permanece intacta y se complementa con fichas oficiales de la API consultada el 18/10/2026. La nómina MTT (28/09/2026) se emplea como evidencia registral adicional y **no** como fuente sustitutiva de rendimientos. En ningún caso se afirma que estos registros representen stock disponible.

## Portada fotográfica (octubre de 2026)

La portada utiliza la imagen proporcionada para RINDELAB, con cuatro vehículos en una composición azul nocturna, en lugar de la ilustración inicial. Se entrega como archivo binario `hero-foto-rindelab.webp` (450 × 253 píxeles, ~6,8 KB), optimizado para el espacio de cabecera, con texto alternativo descriptivo, carga prioritaria y pruebas en Chromium en escritorio, tablet y móvil. La versión PNG original suministrada no se modifica. La imagen es ilustrativa, no una certificación de modelo ni una relación comercial con los fabricantes mostrados.

## Cruce completo de nómina MTT septiembre de 2026 contra rendimientos 3CV mayo

**Fuentes y corte.** Se comparó por coincidencia **exacta del código de informe técnico**, sin interpolación ni equiparación nominal, la hoja «Livianos & Medianos 2013 - 2026» del XLS MTT al 28/09/2026 con las 8.053 fichas de rendimiento vigentes al 08/05/2026 en RINDELAB. Las hojas históricas MTT anteriores a 2013 no se suman a este universo comparativo.

La nómina MTT contiene **8.093 registros con código**, **8.045 códigos distintos** y 39 códigos repetidos en más de una fila (48 apariciones adicionales). Los registros 3CV de mayo aportan **8.053 códigos distintos**. Hay **7.491 códigos comunes**, **554 que aparecen solo en la nómina de septiembre** y **562 que aparecen solo en la base de mayo**. Los códigos exclusivos no son automáticamente altas, bajas ni revocaciones, porque ambas bases tienen alcances distintos.

De las homologaciones con fecha posterior al 8/05/2026, **230 registros** pertenecen al intervalo hasta el 28/09/2026. **229 códigos no están presentes en la base de mayo** y **uno sí**: Subaru XV diésel `SB6195E60815S00-0`, por lo que la fecha reciente no prueba que sea un código nuevo. De los otros 325 códigos exclusivos de MTT, **324 tienen fecha hasta el 8/05/2026** (372 filas) y **uno no consigna fecha** en el archivo: `EX10292E60925S00-K`, Exeed RX 1.5T PHEV DHT Unlimited (C.H. 7785). Este último constituye una tercera categoría y no puede clasificarse cronológicamente. Ninguno se presenta como incorporación nueva.

Se identifican **12 discrepancias de transmisión/cilindrada por código común**, sin presumir cuál archivo contiene el atributo correcto. Incluyen las versiones JMC All New Vigus Plus/Work 4x2–4x4 y Kia Sportage 2.0 6MT. La contradicción Volkswagen Tera 1.6 MT entre denominación comercial y la transmisión A de los dos archivos 3CV sigue registrada por separado en el control de homologaciones.

**Trazabilidad y límites.** Los dos binarios XLS del usuario y del enlace MTT tenían huellas SHA256 distintas: respectivamente `6b013ee19be8e78757efa171a262badf793d0148aa35ca2154224858caaa5afa` y `6f38a6c7c064c499b210634ffe694b6ce472819ecfcc34e7a8f3ade3ce5064aa`. No se presupuso que fueran idénticos. Se verificó, en cambio, que los 8.093 registros dan el mismo SHA256 **de contenido ordenado por código, marca, modelo, transmisión y fecha**: `b80940fb9fb6d6e4908280bb258cf5f1598468f440245f6d93e1a200fc3e2978`, y que coinciden los conjuntos completos de códigos y los 230 posteriores a mayo. Esas comprobaciones permiten reproducir el análisis de códigos, no sustituir los originales ni equiparar otros atributos no cotejados byte por byte.

Los extractos congelados se encuentran en [mtt-sept-2026-code-index.json](./sii/mtt-sept-2026-code-index.json), con los 8.045 códigos, y [mtt-sept-2026-may-2026-cross.json](./sii/mtt-sept-2026-may-2026-cross.json), con 230 homologaciones recientes, 372 filas fechadas hasta mayo y una fila sin fecha, todas ausentes de mayo, los 562 códigos exclusivos de mayo y las 12 discrepancias documentales. La [nueva vista](./novedades-3cv.html) permite consultar y exportar por separado las 230 homologaciones fechadas después del corte, los 324 códigos anteriores (372 filas) y el registro sin fecha, preservando las variantes documentales agrupadas bajo un mismo código.

**Regla crítica:** la nómina de septiembre **no** reemplaza la base de rendimientos de mayo; no proporciona por sí misma métricas comparables bajo los ciclos NEDC/WLTP de RINDELAB. Las homologaciones recientes se muestran con código, certificado, fecha y tecnología, **sin inventar rendimiento, consumo, autonomía, costo por kilómetro, precio o disponibilidad comercial**. Los 8.053 registros del buscador permanecen intactos.

**Control automático:** `node scripts/audit-mtt-september-coverage.cjs --json=mtt-september-cross-audit.json` recalcula los totales y la presencia de códigos contra las 9 partes de la base energética original, valida el SHA256 del universo de códigos MTT, los 230 registros posteriores a mayo, 229 ausentes, 1 ya presente, 324 códigos anteriores y 1 sin fecha y las 12 diferencias técnicas. GitHub Actions ejecuta también pruebas de navegador de filtros, CSV y móvil.


## Homologaciones MTT visibles desde el buscador principal

En una primera etapa, el cotejo MTT al 28/09/2026 incorporó a la portada la búsqueda de **229 códigos posteriores al corte de mayo** que no estaban en esa planilla energética histórica. Desde la integración de la API oficial de octubre, **228 de esos códigos cuentan con fichas energéticas y se buscan en el catálogo principal**; uno sigue visible solo como homologación MTT. La página independiente preserva el cruce histórico completo.

El buscador carga **8.325 fichas energéticas** (8.053 de mayo más 272 incorporadas desde la consulta oficial de octubre) y consulta separadamente el conjunto MTT de 230 registros posteriores al corte histórico. Excluye el código que ya estaba en mayo y los **228 incorporados desde la API**, por lo que actualmente la sección «solo MTT» presenta **un único código sin ficha energética**. Se filtra por texto, marca, familia, tecnología y fecha; los códigos MTT conservan el enlace al registro de novedades `?codigo=<código>`.

El registro MTT pendiente muestra modelo, código, certificado, fecha y tecnología de origen; no ofrece «Comparar» ni costo inventado. **Los registros sin rendimiento no entran en las fichas comparables ni en estadísticas o rankings energéticos.** Los filtros de carrocería y ciclo WLTP/NEDC solo operan sobre las fichas energéticas con dichos atributos, sean de mayo u octubre. La clasificación de motorización MTT procede de los campos explícitos de su nómina, no de nombres comerciales.

Un fallo transitorio al descargar el cruce MTT no bloquea el buscador de rendimientos: informa la incidencia por separado. Las regresiones Chromium comprueban que Deepal S05 REEV, Leapmotor B03X, JIM RE-MAX y Kia Sportage HEV ahora aparecen como **fichas energéticas oficiales** cuando el dato está publicado; el Porsche Cayenne pendiente permanece como registro MTT sin rendimiento ni botón de comparación. También se prueban enlaces directos, paginación y móvil de 320 px.

## Estado de fuentes visible en los resultados

La búsqueda principal distingue **fichas energéticas históricas de mayo, fichas incorporadas desde la API oficial de octubre y registros MTT que aún carecen de ficha energética**. Cada tarjeta energética declara su procedencia y ciclo; el único registro MTT pendiente conserva código, C.H., fecha y enlace documental sin comparador energético. Algunas fichas PHEV/REEV carecen de un costo energético combinado calculable: la procedencia **no** implica que todos los campos estén disponibles.

## Expediente de 12 diferencias de transmisión o cilindrada

El cruce MTT al 28/09/2026 vs rendimientos del 08/05/2026 detectó 12 códigos presentes en ambos con **11 diferencias de transmisión y una de cilindrada**. Se documentaron individualmente en [mtt-discrepancy-review-2026.json](./sii/mtt-discrepancy-review-2026.json), enlazando una fuente primaria de fabricante o importador para cada familia y conservando ambos valores sin editarlos.

Las familias son JMC Vigus (4), Kia Sportage (2), Karry Q22 (3), MAN TGE (1), Mercedes-Benz GLE (1) y Nissan Kait (1). Fuentes JMC, Kia y Nissan respaldan características de versiones comerciales, pero no rectifican automáticamente la transmisión publicada en el archivo oficial de mayo. En el caso Sportage `KI9911E60325S00-5`, existe una etiqueta energética oficial reproducida por Kia que identifica el **código exacto** y la denominación 6MT 2WD. La evidencia comercial y el documento de homologación deben distinguirse, incluso allí.

Mercedes-Benz indica 2.996 cm³ para GLE 500 e 4MATIC, mientras el registro 3CV de mayo muestra 2.0 L y la nómina MTT 3.0 L. Karry Q22 se comercializa con transmisión manual de cinco velocidades en diversas configuraciones, pero ese dato por sí solo no acredita qué certificado corresponde a cada terminación. MAN TGE dispone de alternativas manuales y automáticas; su familia comercial, por sí sola, no resuelve la discrepancia de un código particular.

La página [Homologaciones recientes](./novedades-3cv.html) conserva los 12 registros con filtro por marca/familia, el dato exacto de ambas fuentes, un desplegable con observación y enlace primario, y exportación CSV del expediente completo o filtrado. Se mantiene el Issue #53 abierto porque no se ha obtenido una **rectificación oficial del 3CV** para ninguno de los 12 registros. El problema Volkswagen Tera 1.6 MT es distinto: discrepancia fabricante contra ambas bases; se mantiene en Issue #47.

La CI ejecuta `node scripts/audit-mtt-discrepancy-review.cjs --json=mtt-discrepancies-audit.json` para validar correspondencia 1:1 con el cruce, códigos, campos, URL HTTPS, alcance de evidencia y cero rectificaciones inventadas. Las pruebas Playwright comprueban las diferencias, los filtros, el desplegable, el CSV y la presentación móvil.

## Quinta capa: sincronización del buscador con API oficial Consumo Vehicular (18/10/2026)

Se comprobó directamente la API pública `https://api-consumovehicular.minenergia.cl/vehiculos/listar`, utilizada por [consumovehicular.cl](https://www.consumovehicular.cl/). Al 18/10/2026 entrega **8.315 registros**, de los cuales **860** aparecen en la consulta con `SoloCicloWltc=true`. El último registro por fecha de homologación consultado es del **13/10/2026**. No se declara que este snapshot esté actualizado después de la fecha de captura.

El cotejo **exacto por código CIT** contra las 8.053 fichas válidas de la planilla de mayo identificó **272 códigos adicionales**, de los cuales **254 están en la lista WLTC y 18 fuera de ella** (se preserva la clasificación NEDC, aunque un registro tenga fecha reciente). Las otras **8.043 fichas tienen código ya presente**; diez fichas históricas de mayo no aparecen en la API consultada. Por ello el buscador conserva las 8.053 fichas originales e incorpora solo los 272 registros adicionales, total **8.325 códigos únicos sin interpolación**. Se mantiene intacto el contenido de las planillas originales y no se afirma que esas diez fichas hayan perdido homologación.

De los 229 códigos posteriores al 8 de mayo de la nómina MTT que no tenían ficha en nuestra planilla energética anterior, **228 sí figuran en la API oficial**. Al integrar la API, se retiran del bloque «solo homologación MTT» y aparecen con los datos energéticos informados por la autoridad. **Únicamente `PO10585EL0726M01-9`, Porsche Cayenne Turbo Coupé Electric, sigue en dicho bloque** al corte de la consulta de octubre.

Los [cuatro archivos de captura API](./data/) contienen los 272 registros originales completos, incluidos los campos sin valor (`null`), junto a la indicación de ciclo determinada por el filtro oficial `SoloCicloWltc`. El módulo [official-api-mapper.js](./sii/official-api-mapper.js) reproduce la tabla de 26 atributos de RINDELAB conservando: rendimiento NEDC mixto; WLTP combinado; rendimiento eléctrico WLTP de EV; rendimientos eléctricos y de combustible por separado de PHEV/REEV; CO₂ y tramos de ensayo, cuando constan. No convierte medidas de un ciclo a otro ni calcula el componente ausente. El nombre REEV sólo se utiliza cuando forma parte expresa del modelo homologado.

Ejemplos comprobados: **Changan Deepal S05 REEV** (`CN10637E60826S00-7`) ofrece 21,3 km/L y 6,0 km/kWh; Mazda CX-5 2.5 AWD (`MZ10672T3C0926S00-9`) tiene 12,3 km/L bajo WLTP y homologación del 13/10; Chery Tiggo 7 CSH (`CY10666E60926S00-9`) tiene 17,5 km/L al mismo corte. Los cálculos de PHEV/REEV no producen costo energético combinado, puesto que requieren proporción verificable de uso de combustible y electricidad.

El control `node scripts/audit-official-api-october-2026.cjs --json=official-api-october-audit.json` valida integración íntegra, 254 + 18 ciclos, códigos únicos, antigüedad, dimensiones, métricas oficiales, correspondencia de 228 casos MTT, la excepción pendiente y ninguna modificación de las fichas de mayo. La interfaz continúa mostrando las fuentes de ambas épocas y el ciclo por vehículo para evitar comparaciones erróneas.
