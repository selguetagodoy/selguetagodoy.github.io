# RINDELAB — Lote incremental Porsche 718 (20/10/2026)

**Base de comparación:** `BASE-MAESTRA-PRECIOS-CON-ORIGEN-20261020.md` (1.485 registros). La familia 718 no aparece en el capítulo Porsche de la base maestra. **Estado:** 5 versiones candidatas nuevas, pendientes de integración técnica y QA. No modificar el contador público antes de integrar.

**Fuente:** [auto.cl — Porsche 718](https://www.auto.cl/nuevos/porsche/718). Los valores se transcriben como precios públicos presentados por la plataforma; pueden diferir de precios de lista del fabricante y no prueban disponibilidad comercial al momento de compra.

| Marca | Modelo | Versión comercial publicada | Tecnología | Precio publicado CLP | Origen | Consulta | Estado |
|---|---|---|---|---:|---|---|---|
| Porsche | 718 | 2.0 G DSG 2P Cayman Turbo | Bencina | $70.236.000 | [auto.cl](https://www.auto.cl/nuevos/porsche/718) | 2026-10-20 | Candidato nuevo |
| Porsche | 718 | 2.0 G DSG 2P Boxster Turbo | Bencina | $73.666.000 | [auto.cl](https://www.auto.cl/nuevos/porsche/718) | 2026-10-20 | Candidato nuevo |
| Porsche | 718 | 4.0 G DSG 2P GTS Cayman | Bencina | $92.533.000 | [auto.cl](https://www.auto.cl/nuevos/porsche/718) | 2026-10-20 | Candidato nuevo |
| Porsche | 718 | 4.0 G DSG 2P GTS Boxster | Bencina | $95.963.000 | [auto.cl](https://www.auto.cl/nuevos/porsche/718) | 2026-10-20 | Candidato nuevo |
| Porsche | 718 | 4.0 G DSG 2P GT 4 RS | Bencina | $162.854.000 | [auto.cl](https://www.auto.cl/nuevos/porsche/718) | 2026-10-20 | Candidato nuevo |

## Control de calidad y publicación

- Cruce previo: la base Porsche contiene 911, Cayenne, Macan, Panamera y Taycan, pero no 718.
- Clave de deduplicación: marca normalizada + modelo normalizado + versión comercial normalizada; no deduplicar solo por modelo.
- No asignar homologación energética ni consumo sin coincidencia con 3CV.
- Antes de migrar confirmar el campo `priceBasis` según el tipo de precio informado por auto.cl.
- Pendiente: convertir estas cinco filas al esquema comercial JSON, ejecutar pruebas y publicar mediante PR independiente.

## Control adicional

Las ocho familias de modelos Deepal, Exeed, Kaiyi, Karry, KYC, Land Rover, SEAT y Smart revisadas ya incluyen versiones individuales en el MD maestro. No volver a importar sus mismas filas desde auto.cl sin efectuar el cruce por versión.
