# RindeLab: fotografías abiertas con trazabilidad

## Propósito y cautela

Obtiene candidatos fotográficos de registros sin imagen con entradas CSV/JSON, sin modificar el catálogo público. La salida es un **manifiesto para revisión**; la correspondencia por nombre comercial o año no acredita automáticamente generación ni carrocería.

Fuentes permitidas: **Wikimedia Commons** como fuente principal y **Openverse** exclusivamente como respaldo. La opción **--wikidata** consulta Wikidata (búsqueda de elementos + SPARQL P18), pero **siempre** obtiene la licencia del archivo desde Wikimedia Commons. Los metadatos CC0 de Wikidata no licencian sus fotos. Los portales de prensa, Internet Archive, NetCarShow, Caricos, UltimateSpecs, WheelsAge y los datasets académicos sirven como **referencias externas**, nunca como descargas automáticas autorizadas.

Licencias permitidas: CC0, PDM, CC BY 2.0/3.0/4.0 y CC BY-SA 2.0/3.0/4.0. La variable ALLOW_NC = False bloquea atribuciones no comerciales; se excluyen licencias ND. Autor y licencia provienen de la ficha de origen. El acceso gratuito a una foto no equivale a autorización de republicación.

## Instalar

Windows:

    py -m pip install -r scripts/rindelab-open-photos-requirements.txt

Linux/macOS:

    python3 -m pip install -r scripts/rindelab-open-photos-requirements.txt

## Entrada

CSV o JSON con campos marca, modelo, anio, carroceria y foto_actual. También se aceptan equivalentes brand/model/year/body/photo; foto_actual ausente se considera vacía. Se incluyen únicamente los registros sin fotografía. Se descartan los registros sin marca, modelo o año.

Antes de consultar las APIs, se agrupa por marca|modelo_base|anio; dos carrocerías incompatibles agrupadas en una clave permanecen sin fotografía hasta revisión humana.

## Prueba piloto de los primeros 20 registros sin imagen

    py scripts/rindelab-open-photos.py --input catalogo_vehiculos.csv --limit 20 --wikidata --sleep 1 --checkpoint-every 25 --output-dir rindelab/data/fotos-piloto

Para continuar la ejecución:

    py scripts/rindelab-open-photos.py --input catalogo_vehiculos.csv --wikidata --sleep 1 --checkpoint-every 25 --output-dir rindelab/data/fotos-piloto --resume

Si se modifica el archivo de entrada, comprobar que el manifiesto de reanudación corresponda al mismo dataset y ventana de ejecución.

## Archivos

1. catalogo_fotos_abiertas.json: diccionario indexado por clave normalizada, con query_used, match_level, image_url, thumb_url, source, source_page_url, author, license, license_url y retrieved_at.
2. auditoria_extraccion.csv: grupos únicos por marca, encontrados en Commons, encontrados en Openverse, sin resultado y candidatos descartados por licencia.
3. .rindelab_photo_checkpoint.json: estado técnico para reanudar contadores de rechazos de licencia.

Las respuestas HTTP 429 y errores transitorios reintentan con espera exponencial. Hay un intervalo configurable entre todas las solicitudes y guardado atómico del manifiesto cada 25 grupos.

## Interpretación

- exact_year: año coincidente en el título de la imagen; NO implica certificación de generación, pues puede describir la fecha de captura.
- model_family: coincidencia de nombre familiar con evidencia insuficiente del año específico.
- unmatched: imagen null, sin sustituirla por una foto de otro modelo.
- Fichas con sedán y hatchback mezclados por la misma llave no reciben fotos automáticamente.

**No publicar automáticamente** los candidatos. Comprobar visualmente la generación, carrocería, mercado, año y atribución, y conservar fuente y licencia en el frontend.

Pruebas locales sin llamadas a APIs:

    py scripts/tests/test_rindelab_open_photos.py -v

## Datos reales incluidos en el repositorio

La instantánea rindelab/data/3cv-fichas-sin-foto-20261123.csv contiene 5192 versiones históricas 3CV que estaban sin imagen tras el segundo lote de fotografías del 23 de noviembre de 2026. No contiene identificadores 3CV que no estuvieran disponibles en el inventario original.

Ejecución sobre las primeras 20 versiones de esa instantánea:

    py scripts/rindelab-open-photos.py --input rindelab/data/3cv-fichas-sin-foto-20261123.csv --limit 20 --wikidata --output-dir rindelab/data/fotos-piloto

El directorio scripts/examples/fotos-piloto-20261123 contiene un piloto distinto, seleccionado de 20 fichas reales de varias marcas, con su manifiesto y auditoría; no implica fotografías publicadas automáticamente.

## Segundo lote histórico 23/11/2026

La biblioteca incorpora 16 nuevos archivos de Wikimedia Commons (CC BY, CC BY-SA o CC0); sus reglas conservadoras cubren 176 fichas históricas adicionales. Total actualizado: 3.202 fichas con foto de 8.394 y 5.192 pendientes. Cada archivo conserva autor, página original y licencia en el manifiesto rindelab/data/historical-photo-import-batch2-20261123.json. Las coincidencias de carrocería y generación se verifican en pruebas automatizadas.

## Tercer lote Commons — 23/11/2026

Se verificaron licencias y atribuciones de 53 fuentes; 52 imágenes exteriores superaron revisión visual y una fue descartada. Las 52 fotos permiten asociar 337 fichas adicionales mediante reglas estrictas por generación y carrocería, manteniendo la biblioteca comercial y el histórico 3CV separados. Archivo: rindelab/data/historical-photo-import-batch3-20261123.json.

## Cuarto lote Commons — 23/11/2026

18 nuevas fotos con licencia y control visual, 146 fichas adicionales: 3.348 con foto, 5.046 pendientes. Ver rindelab/data/historical-photo-import-batch4-20261123.json.

## Quinto lote Commons — 23/11/2026

38 fotos con licencia y revisión visual, 159 asociaciones adicionales; 3.507 con foto, 4.887 pendientes. Ver rindelab/data/historical-photo-import-batch5-20261123.json.

## Sexto lote Commons — 23/11/2026

Barrido de 120 grupos; 103 con candidatos no certificados, 794 fichas potenciales. 25 fotos aprobadas de 34 descargadas y 89 asociaciones nuevas; 3.596 con foto, 4.798 pendientes. Ver rindelab/data/fotos-rapidas/barrido120/candidatos.json y rindelab/data/historical-photo-import-batch6-20261123.json.

## Septimo lote Commons

300 grupos nuevos, 256 con candidatos, 60 fotos aprobadas y 177 fichas adicionales. Quedan 4621 pendientes. Ver rindelab/data/fotos-rapidas/barrido300/candidatos.json.
