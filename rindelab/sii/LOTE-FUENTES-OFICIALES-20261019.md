# RINDELAB — 11 precios de lista verificados en fuentes oficiales

**Corte de consulta:** 19/10/2026. **Campaña documentada:** septiembre de 2026 (finalizada 30/09/2026). **Estado:** comprobado documentalmente, todavía NO incorporado a `commercial-2026.json`. No atribuir vigencia comercial hoy.

Estos importes proceden de los campos **Precio Lista** / **Precio Lista Sugerido** de las páginas oficiales de Audi Chile y CUPRA Chile, separados de los descuentos, bonos financieros y mensualidades. CUPRA explicita IVA incluido. Audi señala que no incluye impuesto verde ni patente. Las denominaciones reproducen versiones comerciales y **no** constituyen equivalencia automática con registros 3CV.

| Marca | Familia | Versión comercial | Motor | Precio de lista (CLP) | Fuente |
|---|---|---|---|---:|---|
| Audi | Q4 Sportback e-tron | Q4 Sportback e-tron S line | EV | $70.990.000 | [Oficial](https://www.audi.cl/q4/q4-sportback-e-tron/Lista-de-precios) |
| Audi | Q6 e-tron | Q6 e-tron 50 S line | EV | $87.990.000 | [Oficial](https://www.audi.cl/q6-e-tron/q6-e-tron/lista-de-precios) |
| Audi | Q6 Sportback e-tron | Q6 Sportback e-tron 50 S line | EV | $90.490.000 | [Oficial](https://www.audi.cl/q6-e-tron/q6-sportback-e-tron/Lista-de-precios) |
| Audi | A6 Sportback e-tron | A6 Sportback e-tron S line | EV | $90.900.000 | [Oficial](https://www.audi.cl/a6-e-tron/a6-sportback-e-tron/Lista-de-precios) |
| Audi | A6 Sportback e-tron | A6 Sportback e-tron performance S line | EV | $105.900.000 | [Oficial](https://www.audi.cl/a6-e-tron/a6-sportback-e-tron/Lista-de-precios) |
| Cupra | Formentor | 1.5 TSI e-Hybrid | PHEV | $40.990.000 | [Oficial](https://www.cupraofficial.cl/quiero-un-cupra/lista-de-precios-1) |
| Cupra | Tavascan | Adrenaline 82 kWh 286hp | EV | $50.990.000 | [Oficial](https://www.cupraofficial.cl/quiero-un-cupra/lista-de-precios-1) |
| Cupra | Tavascan | Extreme 82 kWh 286hp | EV | $53.990.000 | [Oficial](https://www.cupraofficial.cl/quiero-un-cupra/lista-de-precios-1) |
| Cupra | Terramar | 1.5 TSI mHEV AT 150hp | MHEV | $39.990.000 | [Oficial](https://www.cupraofficial.cl/quiero-un-cupra/lista-de-precios-1) |
| Cupra | Terramar | High 1.5 TSI mHEV AT 150hp | MHEV | $43.990.000 | [Oficial](https://www.cupraofficial.cl/quiero-un-cupra/lista-de-precios-1) |
| Cupra | Leon | Cupra Leon 1.5 TSI mHEV AT | MHEV | $29.990.000 | [Oficial](https://www.cupraofficial.cl/quiero-un-cupra/lista-de-precios-1) |

## Condiciones de incorporación

- Son **11 nuevas versiones comerciales documentadas** con año comercial `null` porque la publicación no acredita explícitamente año de modelo para todas.
- Mantener `sourceOfferEnd=2026-09-30`, `checkedAt=2026-10-19`, `currency=CLP` y tecnología según la versión.
- La página Audi conserva un documento de septiembre; la diferencia frente a precios de julio/agosto no debe tratarse como error de extracción.
- La tabla CUPRA agrupa Formentor PHEV, Tavascan EV, Terramar MHEV y León MHEV. Se excluyen versiones térmicas, diferencias de pintura y precios con bono.
- No se integraron directamente porque el PR #85 contiene una migración paralela de 12 precios con pruebas E2E fallidas; hay que resolver/regresar ese conflicto antes de fusionar dos cambios concurrentes del JSON público.

## Siguiente operación de migración

Integrar las filas del CSV comercial siguiente a la bandeja maestra, conservando los campos 3CV vacíos hasta cotejo expreso. Luego `node scripts/rindelab-price-queue.cjs --check`, `--dry-run` y `--apply` con auditoría de precios, validación de duplicados y E2E. Precios históricos no se presentan como cotización del 19/10.
