# RINDELAB — Sexta ampliación documental de vehículos retirados (21/10/2026)

**Resultado:** 12 casos incorporados, para **81 estados editoriales acumulados** (73 modelos o variantes descontinuadas, 8 generaciones anteriores retiradas). El cruce con `vehiculos/data/vehiculos_*.json` entregó **63 fichas 3CV** nuevas asociadas, todas con coincidencia de marca y modelo; los tres códigos con fecha posterior a mayo 2026 quedan excluidos del corte histórico. Ningún precio ni rendimiento fue modificado.

El concepto **descontinuado en Chile** se utiliza como estado editorial de los vehículos 0 km, basándose en cese de producción, retiro de oferta y/o cambio de generación. No implica que dejen de existir unidades usadas o inventario remanente; ni permite inferir retiro comercial automáticamente de la ausencia de precios registrados.

## Matriz de incorporación

| Marca | Modelo | Fichas 3CV | Estado y criterio | Evidencia de cierre y comercialización |
|---|---|---:|---|---|
| Opel | Adam | 1 | Descontinuado | [Fuente de cierre](https://www.media.stellantis.com/es-es/opel/press/opel-lanzara-ocho-modelos-nuevos-o-renovados-hasta-2020); [fuente complementaria](https://noticias.autocosmos.cl/2014/09/27/opel-adam-estreno-oficial-en-chile) |
| Opel | Cascada | 1 | Descontinuado | [Fuente de cierre](https://www.media.stellantis.com/em-en/opel/press/opel-to-launch-eight-all-new-or-refreshed-models-by-2020); [fuente complementaria](https://noticias.autocosmos.cl/2013/07/10/opel-cascada-inicia-pre-venta-en-chile) |
| Opel | Meriva | 3 | Descontinuado | [Fuente de cierre](https://www.media.stellantis.com/es-es/opel/press/la-planta-de-zaragoza-incrementa-un-6-su-produccion-1632576110); [fuente complementaria](https://www.media.stellantis.com/es-es/opel/press/press-kit-familia-x-de-opel-aventurera-versatil-elegante-y-sobre-todo-de-exito) |
| Opel | Insignia | 15 | Descontinuado | [Fuente de cierre](https://www.autoscout24.es/informacion/noticias/fin-de-produccion-del-opel-insignia-en-2022/); [fuente complementaria](https://noticias.autocosmos.cl/2014/09/04/opel-insignia-2015-version-renovada-ya-esta-en-chile) |
| Opel | Antara | 3 | Descontinuado | [Fuente de cierre](https://www.sernac.cl/portal/618/w3-article-4169.html); [fuente complementaria](https://www.opel.cl/tools/brochures-price-lists.html) |
| Opel | Zafira monovolumen anterior | 1 | Generación anterior | [Fuente de cierre](https://www.media.stellantis.com/es-es/opel/press/nuevo-opel-zafira-life-el-modelo-de-referencia-llega-a-su-cuarta-generacion); [fuente complementaria](https://noticias.autocosmos.cl/2019/01/21/la-opel-zafira-2019-es-una-van-hecha-y-derecha) |
| Hyundai | IONIQ original AE | 3 | Descontinuado | [Fuente de cierre](https://www.hyundai.news/eu/articles/press-releases/hyundai-announces-end-of-production-for-first-ioniq-series.html); [fuente complementaria](https://noticias.autocosmos.cl/2017/07/18/test-drive-hyundai-ioniq-ev-2017) |
| Alfa Romeo | MiTo | 6 | Descontinuado | [Fuente de cierre](https://noticias.autocosmos.cl/2022/04/29/alfa-romeo-podria-resucitar-el-mito-en-formato-electrico); [fuente complementaria](https://noticias.autocosmos.cl/2010/5/19/alfa-romeo-mito-ya-esta-en-chile) |
| Dodge | Journey (generación original) | 8 | Generación anterior | [Fuente de cierre](https://noticias.autocosmos.cl/2021/10/04/conoce-a-fondo-la-nueva-generacion-del-dodge-journey); [fuente complementaria](https://noticias.autocosmos.cl/2020/07/06/vuela-alto-dodge-journey-y-grand-caravan-se-despiden-del-mercado) |
| Mercedes-Benz | CLS | 12 | Descontinuado | [Fuente de cierre](https://www.mercedes-benz.co.uk/passengercars/models/discontinued/cls.html) |
| Peugeot | 108 | 4 | Descontinuado | [Fuente de cierre](https://www.media.stellantis.com/it-it/peugeot/press/esce-di-scena-la-peugeot-108-la-piu-piccola-e-personalizzabile-auto-del-leone); [fuente complementaria](https://www.sec.gov/Archives/edgar/data/1605484/000160548423000020/stellantis-20221231.htm) |
| Lexus | GS | 6 | Descontinuado | [Fuente de cierre](https://global.toyota/jp/newsroom/lexus/32231442.html); [fuente complementaria](https://noticias.autocosmos.cl/2016/07/19/el-lexus-gs-2016-llega-a-chile-en-tres-versiones) |

## Advertencias y excepciones específicas

- **IONIQ AE original**: la fábrica Hyundai confirmó su fin mundial en julio de 2022; se conserva la nueva familia IONIQ 5, IONIQ 6 y otras, incluso cuando los nombres se escriban sin espacio (`Ioniq5`). La regla `model-prefix-list` se limita a `IONIQ AE`.
- **Dodge Journey**: únicamente la primera generación documentada por el mercado chileno antes de 2021; se usa `previous-generation-cutoff` hasta `2020-12-31` y se preserva cualquier homologación posterior de generaciones con el mismo nombre.
- **Opel Zafira**: la ficha histórica corresponde al monovolumen antes de la generación Zafira Life, cuya arquitectura y concepto de carrocería cambiaron en 2019. No eliminar futuras fichas Zafira Life.
- **Peugeot 108**: el fabricante comunicó la salida del modelo en 2022; el 208 actual no debe clasificarse como su misma familia técnica.
- **Lexus GS**: la comunicación corporativa japonesa de Toyota/Lexus informa fin de producción en agosto de 2020, aplicable a GS sedán y GS-F registrados en 3CV. No inferir salida de Lexus IS, ES ni LS.
- **Opel Antara**: SERNAC consigna su comercialización real en Chile de noviembre de 2012 a mayo de 2015; el catálogo nuevo actual no lo contiene. No confundir con Chevrolet Captiva ni con Opel Grandland.
- **Opel Insignia**: la confirmación de fin de producción se refiere al año 2022; las fechas de homologación individuales terminan en 2018. Evitar presentarlas como fecha exacta de retirada chilena.
- **Todos los casos**: la fecha `sourceDate` queda `null` si la publicación usada no requiere asignar fecha exacta; no se inventan cifras, emisiones ni homologaciones.

## Control técnico

El directorio y las tarjetas del buscador usan control de versión de caché `20261021-modelos81`. Se actualizaron pruebas E2E sobre presencia de 81 estados, clasificación de 73 descontinuados y 8 generaciones, y salvaguarda de IONIQ 5 frente a IONIQ AE. El triaje masivo toma dinámicamente las clasificaciones existentes, sin dar de baja por simple falta de precio.

**Archivos:** `rindelab/sii/model-lifecycle-2026.json`, `rindelab/descontinuados.html`, `rindelab/v6.js`, `rindelab/tests/e2e.cjs`. Se mantiene la base de **1.504 publicaciones comerciales** y los tres precios Suzuki archivados, sin edición.
