# RINDELAB — Sexto chequeo de 206 precios por conciliar

**Corte: 22 de octubre de 2026.** Se continuó desde 572 homologaciones originales y 366 referencias comerciales de familia, cruzando las 206 restantes con páginas de fabricantes y redes chilenas. **13 fichas** obtuvieron una nueva referencia comercial documentada; 193 permanecen pendientes.

| Estado | Fichas |
|---|---:|
| Referencia de precio encontrada para alguna versión de la familia comercial (NO idéntica por definición a 3CV) | **379** |
| Sin precio de familia conciliado en las fuentes consultadas | 176 |
| Únicamente referencias de precio con vigencia vencida | 14 |
| Únicamente precios de otra motorización | 3 |
| **Pendientes** | **193** |
| **Universo de homologaciones auditado** | **572** |

## Las 13 fichas documentadas

| Marca | Fichas | Fuente y condiciones |
|---|---:|---|
| BAIC | 4 | [U5 Plus MT y CVT, precios de lista](https://www.baic.cl/modelos/u5-plus/); [BJ40 PRO Bencina y Diésel](https://www.baic.cl/legales-modelos/) con antecedentes de septiembre vencidos |
| BMW | 3 | [420i Gran Coupé](https://www.bmw.cl/modelos/4-gran-coupe), [520i Berlina](https://www.bmw.cl/modelos/5) y [750e](https://www.bmw.cl/modelos/7), listas oficiales octubre |
| Mahindra | 3 | [Pik Up cabina simple](https://www.autocosmos.cl/catalogo/vigente/mahindra/pik-up) y [doble cabina](https://www.autocosmos.cl/catalogo/vigente/mahindra/pik-up-cabina-doble), por tracción/transmisión; no se localizó precio homologable de cabina simple 4x4 |
| Jeep | 3 | [Grand Cherokee Altitude, Limited y L Limited](https://www.rosselot.cl/nuevos/jeep/grand-cherokee), listas de septiembre ya vencidas; L Summit no se equipara a L Limited |

## Importes referenciales de versiones comerciales (pesos chilenos)

- **BMW 420i Gran Coupé Dynamic LCI II:** $52.900.000 lista, condiciones de octubre. El código 3CV no informa el mismo acabado.
- **BMW 520i Berlina Heritage:** $68.900.000 lista, distinto de la versión 530e PHEV.
- **BMW 750e Berlina Pure Excellence:** $175.900.000 lista. La ficha 3CV usa «xDrive» mientras la página comercial informa tracción trasera: **conflicto técnico, precio no atribuible**.
- **BAIC U5 PLUS Luxury MT:** $12.990.000; **U5 PLUS Luxury CVT:** $14.990.000. No usar el valor del CVT Honor ($15.690.000) como si fuera Luxury.
- **BAIC BJ40 PRO gasolina:** $38.990.000 y **PRO diésel:** $39.990.000; valores de listas asociadas a promociones que terminaron el 14/09/2026, no precios de oferta actuales.
- **Mahindra Pik Up cabina simple 4x2 Work:** $16.648.100; doble cabina 4x2 Work $16.291.100; doble cabina 4x4 Full $17.838.100. No se copia este último a cabina simple 4x4.
- **Jeep Grand Cherokee Altitude:** $55.990.000; Limited $60.990.000; L Limited $62.990.000. Lista histórica de septiembre, sin imputarla a L Summit.

## Control de datos

Cada incorporación tiene nombre de homologación, fecha, sufijo 3CV, URL de fuente, versión comercial, importe, vigencia y advertencia específica. Los precios son referencias **de mercado**, no un nuevo campo de precio de homologación 3CV.

Documentos auditable:
- `rindelab/data/market-price-sixthpass-20261022.json` — 13 referencias de familia.
- `rindelab/data/market-price-unresolved-after-sixthpass-20261022.json` — 193 fichas pendientes.

**El conteo de pendientes no prueba ausencia de precio o stock en Chile.** Los próximos cruces deben investigar las familias con mayor brecha —Land Rover Defender 130, DFLM T5 EVO, Foton TM7, Kia PV5, Porsche 718, MG IM6, entre otras— y priorizar cotizaciones directas cuando no existan listas públicas por versión.
