# RINDELAB — Tercera ampliación fotográfica (22-10-2026)

## Cambio reproducible

| Indicador | Antes de esta ampliación | Después |
|---|---:|---:|
| Familias por tecnología en catálogo | 696 | 696 |
| Con fotografía asociada | 255 | **264** |
| Sin fotografía asociada | 441 | **432** |
| Fotos comerciales en biblioteca | 238 | **245** |
| Fotografías históricas alojadas localmente | 8 | 8 |
| Cobertura por grupo | 36,6 % | **37,9 %** |

Esta ampliación incorpora 7 fotografías comerciales nuevas con 9 asociaciones de grupos (las fotos pueden cubrir más de una familia/tecnología compatible). El avance acumulado desde la auditoría inicial es de 223 a 264 grupos con imagen, es decir, **41 asociaciones recuperadas o añadidas**.

### Archivos y atribución

Las siete fotografías seleccionadas corresponden a:

1. Toyota Hilux de octava generación, fotografía 2024 de exterior (referencia para versiones diésel 2026; no para BEV).
2. Dongfeng / Forthing T5 EVO, fotografía exterior de la carrocería comercial.
3. GAC Emkoo 1.5T, fotografía de la versión gasolina, excluyendo el HEV.
4. Jetour Dashing, fotografía exterior 2025, referencial de carrocería; los ajustes de equipamiento del MY2026 chileno no implican cambio de generación confirmado.
5. Volvo EX30 eléctrico, fotografía exterior frontal de 2024.
6. Maserati Grecale GT, fotografía exterior referencial, sin atribuir variante exacta.
7. Peugeot Boxer 2024, fotografía referencial de furgón.

Fuente de licencia y archivo original de cada uno: `rindelab/images/commons/manifest-reviewed-20261022.json`. Para cada archivo se conservan el autor, licencia Creative Commons, URL de Commons, tamaño, SHA-256 y ruta local. Las fotografías son referenciales de modelo o familia; no deben confundirse con evidencia del código homologado 3CV ni de la versión tributaria SII.

### Criterios de exclusión aplicados

- Rechazamos una foto de Toyota Hilux 2024 transformada en ambulancia; seleccionamos un ejemplar convencional y lo limitamos a 2026, sin extenderlo a 2027.
- Rechazamos una foto del Volvo EX30 tomada desde tanta distancia que reducía la identificación visual; la sustituimos por una vista frontal próxima con CC BY-SA 4.0.
- JAC X200 queda sin foto comercial: la única candidata verificada tenía identificación de 2018 y no acredita continuidad de carrocería con 2026.
- La fotografía del GAC Emkoo a gasolina **no se muestra para HEV**, y la Hilux diésel no se muestra para EV, REEV, PHEV ni HEV.
- No se asigna una fotografía a una versión solo porque el nombre del archivo se parezca; se comprueban autoría, licencia, modelo, generación y límites de año.

### Pruebas y pendientes

`rindelab/tests/photo-integrity.cjs` verifica licencias, checksums y que los siete archivos locales existen y corresponden al motor de asociación fotográfica, además de las 22 imágenes de la ampliación anterior. Los tests de búsqueda, catálogo comercial y fotos de usados siguen integrados en `RINDELAB UI V2 QA`.

Se mantienen intactos el motor de tasación SII directa, permiso de circulación, 299 referencias de usados y 12 brechas de familias descontinuadas sin cotización comercial confirmada.

**Siguiente objetivo de 60 % de cobertura:** se requieren 418 grupos asociados, faltan **154 asociaciones** verificadas desde el corte de 264. Permanecen **432 grupos sin foto**. Priorizar actores con fichas nominales inequívocas y estandarizar las denominaciones técnicas faltantes sin inferir tecnologías ni generaciones.
