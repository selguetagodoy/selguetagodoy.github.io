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

La base emplea el registro oficial 3CV publicado por el Ministerio de Energía con corte declarado **8 de mayo de 2026**. El manifiesto contiene **8.056 registros** y la aplicación utiliza **8.053** con fecha igual o anterior al corte. No se modifica el archivo de origen. Es una base de homologaciones históricas, no de vehículos disponibles actualmente para venta.

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

- **Denominador comercial:** 122 precios de lista asociados a 39 familias, correspondientes únicamente a las 10 marcas cargadas. No es una encuesta exhaustiva del mercado chileno.
- **Resultado de cobertura nominal:** cada familia comercial registra la cantidad de fichas 3CV cuyo nombre y marca pueden corresponderle, bajo reglas explícitas y comprobables. Los filtros permiten revisar casos con y sin coincidencia y descargar la tabla filtrada como CSV.
- **No hay emparejamiento automático de versiones.** Una coincidencia de familia puede mezclar generaciones, tracción, combustible, baterías, tecnología o transmisiones diferentes; en esta fase no se certifica ninguna equivalencia técnica entre versiones ni su disponibilidad comercial.
- **Reglas de exclusión documentadas:** Mazda CX-3 no confunde CX-30; Creta no absorbe Creta Grand; Hunter diésel excluye Hunter E/EREV; Yaris no absorbe Yaris Cross; Corolla Sedán no absorbe Corolla Cross; CS55 Plus no se equipara a CS55 de otra generación.
- **Reproducibilidad:** `node scripts/audit-commercial-3cv-coverage.cjs --json=coverage-audit.json` produce un informe estructurado y ejecuta aserciones sobre familias que no deben confundirse. La CI lo revisa antes de Playwright, que comprueba filtros, descarga CSV y tamaños de escritorio/móvil.

El 3CV registra homologaciones **históricas**, no una nómina de automóviles nuevos disponibles hoy. La fecha de una homologación no equivale al año comercial de una versión. La tasación SII y el permiso de circulación se mantienen separados.

## Segunda capa: cotejo exploratorio por versión comercial (octubre de 2026)

La página [Revisión por versión](./versiones.html) examina las 122 fichas comerciales frente a homologaciones 3CV. Es una **auditoría preliminar**, no una base de equivalencias homologadas.

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

**Separación metodológica:** la base de rendimientos (08/05/2026) se mantiene como fuente principal del buscador; la nómina MTT (28/09/2026) se emplea como evidencia registral adicional. No se han incorporado sus rendimientos como reemplazo ni se ha declarado que refleje stock disponible.

## Portada fotográfica (octubre de 2026)

La portada utiliza la imagen proporcionada para RINDELAB, con cuatro vehículos en una composición azul nocturna, en lugar de la ilustración inicial. Se entrega como archivo binario `hero-foto-rindelab.webp` (450 × 253 píxeles, ~6,8 KB), optimizado para el espacio de cabecera, con texto alternativo descriptivo, carga prioritaria y pruebas en Chromium en escritorio, tablet y móvil. La versión PNG original suministrada no se modifica. La imagen es ilustrativa, no una certificación de modelo ni una relación comercial con los fabricantes mostrados.
