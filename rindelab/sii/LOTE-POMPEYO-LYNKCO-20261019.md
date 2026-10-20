# RINDELAB — Cruce Pompeyo Carrasco y Lynk & Co (19/10/2026)

**Fuente primaria de descubrimiento:** [Pompeyo Carrasco — catálogo de nuevos](https://www.pompeyo.cl/categoria-producto/autos/nuevos/). El sitio anuncia 111 modelos nuevos; se inventariaron **107 fichas accesibles** de las seis páginas de resultados mediante enlaces a `/producto/`. No se afirma que cada modelo corresponda a un precio nuevo ni que todas sus versiones estén identificadas.

## Leapmotor: no duplicar

Pompeyo presenta los modelos [B10](https://www.pompeyo.cl/producto/b10/) y [C10](https://www.pompeyo.cl/producto/c10/). Sus precios de lista visibles son $24.990.000 y $29.490.000, respectivamente, coincidentes con las versiones B10 BEV LIFE y C10 BEV Design **ya documentadas en RINDELAB**. En la sección de nuevos de Pompeyo no aparece T03. La información de un modelo multiversión no permite asignar un precio de lista a otro acabado ni confundir BEV con REEV.

## Ocho versiones Lynk & Co verificadas, una marca comercial adicional

La ficha de Pompeyo identifica cuatro familias de Lynk & Co: 06, 01, 08 y 09. La publicación de [Cartoni Automotora](https://www.cartoni.cl/nuevos/lynk-co) discrimina **Precio de lista** por acabado individual, sin confundirse con «Ahora», bono del mes o bono de crédito. Se cotejaron los mismos modelos y versiones en ambas redes. El 09 es microhíbrido MHEV de 48 V; 01 y 08 son PHEV; 06 es de combustión convencional.

| Familia | Versión exacta | Tecnología | Precio de lista CLP | Fuente de versión |
|---|---|---|---:|---|
| 06 | PLUS | Combustión | $20.990.000 | [Cartoni](https://www.cartoni.cl/nuevo/lynk-co/06) |
| 06 | PRO | Combustión | $22.990.000 | [Cartoni](https://www.cartoni.cl/nuevo/lynk-co/06) |
| 06 | HALO | Combustión | $25.490.000 | [Cartoni](https://www.cartoni.cl/nuevo/lynk-co/06) |
| 01 | PRO | PHEV | $29.490.000 | [Cartoni](https://www.cartoni.cl/nuevo/lynk-co/CO01) |
| 01 | HALO | PHEV | $32.990.000 | [Cartoni](https://www.cartoni.cl/nuevo/lynk-co/CO01) |
| 08 | PRO | PHEV | $40.990.000 | [Cartoni](https://www.cartoni.cl/nuevo/lynk-co/08) |
| 08 | HALO | PHEV | $43.990.000 | [Cartoni](https://www.cartoni.cl/nuevo/lynk-co/08) |
| 09 | HALO | MHEV | $45.990.000 | [Cartoni](https://www.cartoni.cl/nuevo/lynk-co/09) |

**No extrapolar:** las familias Lynk & Co 01, 06 y 08 contienen dos o tres acabados y el precio mínimo mostrado en Pompeyo no acredita todos sus valores. Esos importes se obtuvieron expresamente por acabado en Cartoni.

## Casos con precio insuficiente, diferente base tributaria o duplicados

- **Landking y Sinotruk:** varias fichas publican `Precio lista + IVA`. Conservarlas en la cola de fuentes, sin agregar importes netos al campo `priceListClp` cuando el catálogo compara montos de pasajeros con IVA.
- **DFSK E5 Plus, SUV600 PHEV, MG HS Hybrid+, Geely EX2/EX5, Kia EV5/EV6, Subaru Forester y Leapmotor B10/C10:** modelos ya presentes en el catálogo o con múltiples acabados. No crear duplicados por formato de denominación.
- **Geely y Lynk & Co multiversión:** la cifra de portada es el piso de la familia. Cuando no se publica la pareja precio-versión exacta, conservar el candidato en el CSV pendiente.
- **Leapmotor T03:** pendiente de fuente comercial chilena con precio lista por versión; no inventar precio ni afirmar que Pompeyo comercializa ese modelo.

## Resultado y siguiente filtro

El lote aumenta el catálogo **de 1.028 a 1.036 precios comerciales**, las marcas **de 47 a 48** y los electrificados identificados **de 225 a 230**, sujeto a QA del PR dependiente. El inventario de 107 enlaces accesibles se conserva en [POMPEYO-111-MODELOS-PENDIENTES-20261019.csv](./POMPEYO-111-MODELOS-PENDIENTES-20261019.csv) para investigación sistemática y cotejo de fichas de venta. No se altera homologación 3CV, rendimiento, autonomía calculada, tasación fiscal o permiso de circulación.
