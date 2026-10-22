# RINDELAB — Cobertura de precios comerciales de autos usados

**Corte: 21 de octubre de 2026.** Datos de precios de publicación de terceros, no transacciones cerradas ni tasaciones fiscales.

| Indicador | Resultado |
|---|---:|
| Registros comerciales de origen | 299 |
| Registros habilitados para consulta | 296 |
| Registros retenidos por anomalía documental | 3 |
| Combinaciones únicas de modelo y año habilitadas | 293 |
| Familias con al menos una referencia comercial | 92 |
| Marcas incluidas | 28 |
| Rangos Autofact habilitados (sin mediana ni muestra acreditada) | 276 |
| Medianas AutoExplora con p10–p90 y muestra acreditada | 20 |
| Retiros documentados de familias, generaciones o variantes | 90 |
| Familias completamente retiradas | 65 |
| Familias completamente retiradas con referencia para algún año | 53 |
| Familias completamente retiradas sin referencia inequívoca | 12 |

## Familias retiradas sin valor comercial comprobado

Estas familias tienen documentación de salida de la oferta chilena de autos nuevos, pero no un precio de mercado que pueda vincularse de forma inequívoca. La ausencia de datos no equivale a valor cero.

| Marca | Familia del expediente | Antecedente del retiro |
|---|---|---|
| Toyota | Prius C | [Fuente](https://noticias.autocosmos.cl/2025/09/03/toyota-presento-en-japon-su-actualizado-prius-c) |
| Kia | Rio | [Fuente](https://noticias.autocosmos.cl/2023/12/17/kia-finaliza-la-produccion-del-rio-en-mexico-y-comienza-la-era-k3) |
| Lexus | RC | [Fuente](https://noticias.autocosmos.cl/2026/01/02/los-modelos-que-nos-dijeron-adios-en-2025) |
| Mini | Clubman | [Fuente](https://noticias.autocosmos.cl/2023/03/23/el-mini-clubman-se-despide-con-una-edicion-especial) |
| Mitsubishi | i-MiEV | [Fuente](https://noticias.autocosmos.cl/2019/06/29/dongfeng-s50-ev-2019-es-el-electrico-de-mayor-autonomia-en-chile) |
| Mini | Paceman | [Fuente](https://noticias.autocosmos.cl/2017/05/11/mini-countryman-2017-ahora-mucho-mas-suv) |
| Mercedes-Benz | CLS | [Fuente](https://www.mercedes-benz.co.uk/passengercars/models/discontinued/cls.html) |
| Lexus | GS | [Fuente](https://global.toyota/jp/newsroom/lexus/32231442.html) |
| Fiat | Bravo (2007-2016) | [Fuente](https://www.autotrader.co.za/car-research/fiat/bravo/619) |
| Hyundai | Equus (VI) | [Fuente](https://www.hyundai.com/worldwide/en/footer/corporate/vehicle-history/1990/centennial) |
| Renault | Zoe (original) | [Fuente](https://www.autocar.co.uk/car-news/new-cars/renault-zoe-taken-sale-uk-after-11-years) |
| Mitsubishi | Lancer (sedán original) | [Fuente](https://www.mitsubishicars.com/lancer-history) |

## Metodología y trazabilidad

- El lote más reciente incorpora **29 rangos de Autofact** no presentes en el conjunto de 270 registros, sin suprimir las referencias previas. Manifiesto en `rindelab/sii/data/used-supplement-29-20261021.json`.
- **Autofact:** mínimo y máximo aproximados; no se atribuye una mediana ni un tamaño de muestra inexistentes.
- **AutoExplora:** mediana, rango p10–p90 y tamaño de muestra cuando dispone de al menos cinco avisos.
- Las referencias no se extrapolan entre años, acabados, generaciones, trenes motrices o regiones.
- Los tres valores retenidos para revisión (Audi R8 2016, BMW i8 2016 y Suzuki Kizashi 2015) siguen fuera de las búsquedas y comparaciones comerciales.
- El valor fiscal y el permiso de circulación dependen del registro SII 2026 elegido por el usuario, nunca del precio de mercado usado.
- Se corrigió la dirección canónica de Hyundai Veloster 2015 después de comprobar los mismos importes en el destino original y el corregido.
