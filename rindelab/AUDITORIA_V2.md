# RINDELAB v2 — registro de correcciones

Fecha de revisión: **16 de octubre de 2026**.

## Fuente y alcance

Base utilizada: [3CV, rendimientos oficiales publicados el 8 de mayo de 2026](https://consumovehicular.minenergia.cl/sites/default/files/middleware/RENDIMIENTOOFICIAL08may2026.xlsx).

Contiene **8.056** registros extraídos y **8.053** con fecha de homologación igual o anterior a la fecha de publicación de la planilla. Se excluyen tres filas con fechas futuras para el corte declarado. Son homologaciones históricas; no se comprobó la oferta comercial vigente de los modelos incluidos.

## Correcciones implementadas

1. **PHEV y REEV**: los rendimientos oficiales ponderados **no se presentan como consumo con batería descargada**. Se muestra el indicador oficial y una advertencia en la ficha; se omite el costo por modo como dato comparable automático. La conversión monetaria de los indicadores ponderados, cuando se explicita, se etiqueta como *referencia matemática no equiparable a costo real*. Fuente: [FAQs 3CV](https://consumovehicular.minenergia.cl/faq-page).
2. **Simulador mixto**: permite ingresar consumos independientes de electricidad (kWh/100 km) y combustible (L/100 km) y el porcentaje de kilómetros en cada modo. No se autocompletan consumos no verificados ni se presenta como homologación. Para una distancia de 100 km: `costo = (participación eléctrica × kWh/100 × $/kWh ajustado) + (participación térmica × L/100 × $/L)`.
3. **Tarifas de carga pública**: se desglosan tres potencias de Copec Voltex (AC ≤22 kW, DC 50 kW, DC ≥120 kW) y ubicación/horario. Importes oficiales de referencia:

| Tipo | Ciudad valle | Ciudad punta | Carretera |
|---|---:|---:|---:|
| AC ≤22 kW | $340/kWh | $395/kWh | $395/kWh |
| DC 50 kW | $395/kWh | $450/kWh | $450/kWh |
| DC ≥120 kW | $440/kWh | $495/kWh | $495/kWh |

Fuente: https://copecvoltex.cl/pages/red-de-carga-publica (consultado el 16/10/2026). Los posibles cargos por uso del cargador basados en tiempo o permanencia no están modelados. Se puede ingresar una tarifa manual. La compatibilidad DC se comprueba **solo** cuando la ficha extraída declara un conector reconocido; un campo vacío no demuestra que el vehículo no pueda recibir corriente continua.
4. **Precios de combustibles**: valores iniciales editables de $1.535 (93), $1.572 (95), $1.613 (97) y $1.503 (diésel) por litro, procedentes de [Bencina.cl](https://bencina.cl/) y declaraciones a la CNE con corte 16/10/2026. **Son referencias, no valores en vivo.** No hay identificación automática del octanaje exigido por cada versión.
5. **Clasificación**: normalización de marcas RAM, Leapmotor, FAW; versiones con «Hybrid» registradas solo como «Bencina» y sin certeza de tipo quedan bajo **Híbrido por verificar**, sin cálculo monetario comparable automático. Fiat 600 Hybrid y Jeep Avenger e-Hybrid se reclasifican MHEV a partir de documentos del fabricante: [Fiat](https://www.media.stellantis.com/es-es/fiat/press/fiat-presenta-el-nuevo-fiat-600-hybrid-el-upgrade-electrificado), [Jeep Chile](https://www.jeep.com/cl/avenger/e-hybrid.html) y [ficha Jeep](https://www.jeep.com/content/dam/cross-regional/stellantis/jeep/latam-rol/chile/fichas-tecnicas/2026/Ficha-tecnica-AVENGER.pdf).
6. **Extremos**: ya no se forma un ranking de costos global con varias tecnologías o ciclos a la vez. El usuario debe elegir una tecnología y ciclo; la herramienta muestra los 5 extremos de menor y mayor costo dentro del filtro. Se recomienda filtrar carrocería. En PHEV/REEV se omite el ranking de costos por falta de dato de modo.
7. **Interfaz**: los resultados en pantallas angostas se presentan como tarjetas legibles. Se agregó reinicio independiente de precios y escenarios, estimación anual y CSV filtrado con advertencia metodológica.
8. **SEO**: etiqueta canónica, metadatos del sitio y marcado JSON-LD para la aplicación/dataset. Enlace al visualizador desde la sección de investigación destacada en la página principal.

## Pendientes importantes

- No se ha realizado el cruce completo 3CV ↔ catálogos comerciales para declarar oferta vigente a octubre de 2026.
- No existen consumos de combustible con batería descargada uniformemente verificados para todos los PHEV/REEV.
- Faltan datos oficiales de octanaje por versión y compatibilidad de carga DC para diversas versiones.
- No se han incorporado imágenes individuales de todos los modelos; hacerlo exige gestionar fuentes y permisos de uso.
- Se mantienen otras clasificaciones de híbridos en revisión hasta contrastarlas con documentación primaria.
- No hay páginas estáticas individuales indexables para cada homologación; el identificador `?codigo=` permite abrir ficha desde un enlace directo en la aplicación, pero depende de JavaScript.
- La representación de «SUV» y «camioneta» en etiquetas de carrocería 3CV no equivale a una segmentación de mercado completa.

## Reglas de uso

No atribuir al fabricante un consumo «con batería descargada» si la fuente no lo declara. No confundir NEDC con WLTP. No presentar los precios configurados como actuales sin comprobarlos. No presentar un escenario hipotético como observación medida.
