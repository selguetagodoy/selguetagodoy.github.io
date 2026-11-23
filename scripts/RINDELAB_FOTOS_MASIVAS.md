# RindeLab: extracción masiva de fotografías con revisión legal y visual

**Objetivo**: acelerar la búsqueda de material verificable para el historial 3CV sin asignar fotos incorrectas ni inventar derechos. El código automatiza **la búsqueda y validación inicial**, no la publicación de candidatos.

## Diagnóstico reproducible (23/11/2026)

- Fichas históricas: **8.394**
- Fichas con foto: **3.202**
- Fichas sin foto: **5.192**
- Grupos de búsqueda resultantes: **2.091** con un agrupador aproximado (marca, familia comercial, cohorte de años, carrocería).
- Primeros 25 grupos: **357** fichas potencialmente relacionadas.
- Primeros 100 grupos: **952** fichas potencialmente relacionadas.
- Primeros 300 grupos: **1.985** fichas potencialmente relacionadas.

**Advertencia**: un grupo agrupa búsquedas similares, no certifica que todas sus fichas compartan fotografía. Un mismo nombre comercial puede tener dos generaciones o dos carrocerías dentro de la cohorte. Estos son conteos de **potencial de trabajo**, no fotografías encontradas o publicadas.

## Ejecución local (PowerShell)

Instalar dependencias una sola vez desde la raíz:

```powershell
py -m pip install -r scripts/rindelab-open-photos-requirements.txt
```

Crear la cola ordenada por número de fichas:

```powershell
py scripts/rindelab-photo-fast-queue.py --input rindelab/data/3cv-fichas-sin-foto-20261123.csv --output-dir rindelab/data/fotos-rapidas --top 50
```

Consultar los primeros 100 grupos, hasta cuatro consultas concurrentes, con tasa global prudente y checkpoints:

```powershell
py scripts/rindelab-photo-fast-fetch.py --queue rindelab/data/fotos-rapidas/cola_fotografica_priorizada.csv --output-dir rindelab/data/fotos-rapidas/ejecucion --limit 100 --workers 4 --sleep 0.9 --checkpoint-every 10 --verbose
```

Continuar al grupo 250 sin repetir lo ya consultado:

```powershell
py scripts/rindelab-photo-fast-fetch.py --queue rindelab/data/fotos-rapidas/cola_fotografica_priorizada.csv --output-dir rindelab/data/fotos-rapidas/ejecucion --limit 250 --workers 4 --sleep 0.9 --checkpoint-every 10 --resume
```

Para procesar toda la cola, usar `--limit 0`, respetando los límites de las fuentes.

## Ejecución desde GitHub

Repositorio → **Actions** → **RINDELAB - Exploracion masiva de fotos libres** → **Run workflow**; elegir 100, 250 o más grupos. La acción entrega un artefacto descargable con la cola, un JSON de candidatos y la auditoría. No altera las fotografías públicas de RindeLab.

## Seguridad editorial

- **Wikimedia Commons** como fuente principal; **Openverse** si Commons no encuentra candidato.
- **Wikidata P18** opcional mediante `--wikidata`; debe validarse la licencia del archivo, nunca heredar la licencia CC0 de los datos de Wikidata.
- Licencias autorizadas: CC0, dominio público comprobado, CC BY 2.0–4.0 y CC BY-SA 2.0–4.0. Rechazo de NC/ND, imágenes sin autor exigible, formatos no compatibles y miniaturas pequeñas.
- Filtros conservadores por denominación comercial, año y tipo de carrocería; búsquedas en paralelo con límite GLOBAL de frecuencia, reintentos 429 con espera acotada, manejo de HTTP 5xx y resultados parciales persistidos.
- Campos `requires_visual_review=true` y `requires_generation_review=true` para **todos** los candidatos. La fecha de foto puede diferir del año de fabricación. Verificar visualmente frente/lateral, generación, configuración de cabina, mercado y nombre del archivo antes de incorporar al sitio.
- Fotos de prensa, portales de terceros y catálogos comerciales **solo se integran con autorización documental expresa**.
- Los resultados `unmatched` conservan URL nula. El total de **5.192 pendientes permanece inalterado** hasta publicar material visualmente validado.

## Archivos generados

- `cola_fotografica_priorizada.csv`: grupos, variantes, años, ejemplos y estado.
- `resumen_cola.json`: conteos auditables por grupo y marca.
- `candidatos_masivos.json`: origen, URL, autor, licencia y revisión requerida.
- `auditoria_masiva.csv`: resultado por grupo, número de fichas relacionadas y rechazos.
- Piloto del 23/11/2026 en `rindelab/data/fotos-rapidas/piloto30/` (resultados de búsqueda, **no aprobaciones visuales**).

Para verificar el sistema sin llamadas de red:

```powershell
py scripts/tests/test_rindelab_fast_photos.py -v
```
