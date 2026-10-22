# RINDELAB — Cobertura comercial del mercado de autos usados

**Corte de referencias: 21 de octubre de 2026.** Valores expresados en pesos chilenos.

| Indicador | Cantidad |
|---|---:|
| Observaciones publicadas por modelo, año y proveedor | 224 |
| Combinaciones únicas de modelo y año | 221 |
| Marcas con valores documentados | 28 |
| Familias con valores documentados | 79 |
| Rangos aproximados publicados por Autofact | 204 |
| Medianas de avisos de AutoExplora, con p10–p90 y muestra | 20 |
| Estados documentados de salida de oferta (incluye generaciones) | 90 |
| Retiros de familia completa | 65 |
| Familias enteras retiradas con valor de algún año | 48 |
| Familias enteras retiradas sin referencia inequívoca | 17 |

**La cifra de 224 no corresponde a 224 modelos distintos ni a 224 tasaciones individuales.** Son observaciones de fuentes externas por modelo y año. Un rango no representa necesariamente una venta efectuada. Los 25 retiros por generación, carrocería o versión específica se mantienen separados: no se transfieren valores del nombre familiar a la variante descontinuada sin coincidencia técnica.

## Familias completamente retiradas sin una referencia comercial inequívoca

| Marca | Familia en expediente de retiro | Evidencia del estado |
|---|---|---|
| Toyota | Prius C | [Antecedente de retiro](https://noticias.autocosmos.cl/2025/09/03/toyota-presento-en-japon-su-actualizado-prius-c) |
| Kia | Rio | [Antecedente de retiro](https://noticias.autocosmos.cl/2023/12/17/kia-finaliza-la-produccion-del-rio-en-mexico-y-comienza-la-era-k3) |
| Lexus | RC | [Antecedente de retiro](https://noticias.autocosmos.cl/2026/01/02/los-modelos-que-nos-dijeron-adios-en-2025) |
| Mini | Clubman | [Antecedente de retiro](https://noticias.autocosmos.cl/2023/03/23/el-mini-clubman-se-despide-con-una-edicion-especial) |
| Mitsubishi | i-MiEV | [Antecedente de retiro](https://noticias.autocosmos.cl/2019/06/29/dongfeng-s50-ev-2019-es-el-electrico-de-mayor-autonomia-en-chile) |
| Infiniti | G37 | [Antecedente de retiro](https://www.infiniti.com/regions/es-cl.html) |
| Mini | Paceman | [Antecedente de retiro](https://noticias.autocosmos.cl/2017/05/11/mini-countryman-2017-ahora-mucho-mas-suv) |
| Opel | Adam | [Antecedente de retiro](https://www.media.stellantis.com/es-es/opel/press/opel-lanzara-ocho-modelos-nuevos-o-renovados-hasta-2020) |
| Opel | Cascada | [Antecedente de retiro](https://www.media.stellantis.com/em-en/opel/press/opel-to-launch-eight-all-new-or-refreshed-models-by-2020) |
| Opel | Antara | [Antecedente de retiro](https://www.sernac.cl/portal/618/w3-article-4169.html) |
| Mercedes-Benz | CLS | [Antecedente de retiro](https://www.mercedes-benz.co.uk/passengercars/models/discontinued/cls.html) |
| Peugeot | 108 | [Antecedente de retiro](https://www.media.stellantis.com/it-it/peugeot/press/esce-di-scena-la-peugeot-108-la-piu-piccola-e-personalizzabile-auto-del-leone) |
| Lexus | GS | [Antecedente de retiro](https://global.toyota/jp/newsroom/lexus/32231442.html) |
| Fiat | Bravo (2007-2016) | [Antecedente de retiro](https://www.autotrader.co.za/car-research/fiat/bravo/619) |
| Hyundai | Equus (VI) | [Antecedente de retiro](https://www.hyundai.com/worldwide/en/footer/corporate/vehicle-history/1990/centennial) |
| Renault | Zoe (original) | [Antecedente de retiro](https://www.autocar.co.uk/car-news/new-cars/renault-zoe-taken-sale-uk-after-11-years) |
| Mitsubishi | Lancer (sedán original) | [Antecedente de retiro](https://www.mitsubishicars.com/lancer-history) |

## Reglas de integridad

- **Tasación fiscal SII 2026 y permiso de circulación:** distintos del precio comercial usado. El usuario selecciona manualmente el año de fabricación, la versión y el código tributario.
- **Autofact:** ofrece un rango mínimo–máximo aproximado; no se considera mediana ni se atribuye una muestra inexistente.
- **AutoExplora:** publica medianas de precios solicitados con bandas p10–p90 cuando dispone de al menos cinco anuncios.
- No se interpolan precios entre años, generaciones, versiones o tecnologías; no se generan proyecciones de depreciación.
- Una familia con valor para 2017 puede no tener ningún valor verificable para 2019.
- Se corrigió la URL de Hyundai Veloster 2015 al enlace canónico tras verificar que informa los mismos valores.
- Las cifras son del corte documental señalado y pueden cambiar; se recomienda consultar la fuente original.

## Expansión auditable

El lote final integra **178 observaciones que ya estaban publicadas** y **46 nuevas entradas respaldadas por enlaces individuales** que no figuraban en esa base. El manifiesto de esas 46 fuentes se conserva en `rindelab/sii/data/used-market-merge-46-20261021.json`. La integración evita duplicados de proveedor/marca/modelo/año y preserva intacta la base tributaria SII.
