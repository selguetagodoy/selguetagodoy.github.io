# RINDELAB | Quinta revisión de 227 homologaciones sin precio de versión

**Corte: 22 de octubre de 2026.** Esta investigación parte del cierre anterior de 572 fichas 3CV y 227 pendientes, con prioridad en nuevas fuentes comerciales chilenas. Se auditan **fichas 3CV individuales**, no vehículos distintos ni inventarios de concesionaria.

## Balance de las cinco pasadas

| Estado de referencia | Fichas |
|---|---:|
| Familia con una referencia de precio publicada, versión/código 3CV no conciliados | **366** |
| Sin fuente comercial de precio documentada en los cruces | 189 |
| Solo referencias comerciales vencidas | 14 |
| Solo precios de otra motorización | 3 |
| **Total revisado** | **572** |
| **Pendientes de ampliar fuentes o conciliar versiones** | **206** |

## Quinta pasada: 21 hallazgos por marca

| Marca | Fichas referenciadas | Evidencia y principales límites |
|---|---:|---|
| GAC | 5 | [Lista GS4 MAX GL gasolina y Aion UT Basic 44 kWh](https://www.gacautos.cl/terminos-y-condiciones/); 2 fichas GS4 MAX GB solo tienen precio del acabado GL, no de GB; Aion UT 60 kWh permanece abierto |
| Maxus | 4 | [Lista oficial T70](https://maxus.cl/w/t70) por 4x2/4x4 y 6MT/8AT; importes **+ IVA**, el acabado «MAX» no equivale automáticamente a GL |
| KYC | 6 | [Catálogo nacional X5/X5 Plus](https://www.autocosmos.cl/catalogo/segmentos/kyc?o=8019) con precios diferenciados por carrocería; correspondencia X5 frente a «Gran Mamut X5» y motor/año pendientes |
| Audi | 3 | [Listas New A5 y S5](https://www.audi.cl/asesoramiento-y-compra/bases-promocionales); campañas **vencidas el 30 de septiembre de 2026**, no son precios promocionales actuales; Audi Avant permanece pendiente |
| Citroën | 2 | [Configurador oficial Aircross](https://www.citroen.cl/modelos/pasajeros/c3-aircross/configura.html) y [concesionario Gaut](https://gaut.cl/marcas/citroen/c3aircross); versiones gasolina 1.3 manual, pero denominación de homologación por cotejar |
| Foton | 1 | [Publicación oficial Miler cabina simple](https://foton.cl/w/foton-miler-nuevo-camion-clase-b-que-eleva-el-estandar-del-segmento); valor de lanzamiento con bonos, **no precio actual garantizado** |

## Ejemplos de referencias comerciales de familia

- **Maxus T70:** 4x2 6MT $19.990.000, 4x2 8AT $20.990.000, 4x4 6MT $21.490.000 y 4x4 8AT $24.990.000, todas listas **sin IVA**; los valores con bonos son inferiores. [Maxus Chile](https://maxus.cl/w/t70).
- **GAC GS4 MAX GL 1.5 AT:** **$17.990.000 lista IVA incluido**; precio promocional $15.490.000 depende de financiamiento, promoción hasta el 31 de octubre de 2026. El valor **NO se asigna a GB**. [Términos GAC](https://www.gacautos.cl/terminos-y-condiciones/).
- **GAC Aion UT Basic 44,12 kWh:** **$20.990.000 lista IVA incluido**; no equivale a la versión homologada de 60 kWh. [GAC Chile](https://www.gacautos.cl/modelos/electricos/gac-aion-ut/).
- **Audi New A5 TFSI:** $55.400.000 lista, **A5 quattro S line $61.400.000** y **S5 quattro $80.400.000**; documentación comercial de septiembre, no campaña vigente. [Audi](https://www.audi.cl/asesoramiento-y-compra/bases-promocionales/).
- **Citroën C3 Aircross 1.3 MT:** lista de referencia Feel Pack $16.190.000 y Shine $16.790.000. Diferencia entre denominaciones de homologación y catálogo pendiente. [Marca](https://www.citroen.cl/modelos/pasajeros/c3-aircross/configura.html), [Gaut](https://gaut.cl/marcas/citroen/c3aircross).
- **KYC X5 y X5 Plus:** diversas listas por carrocería de directorio nacional, con precios cuya vigencia no está acreditada. No usar para certificar versión específica sin revisar con Tattersall. [Autocosmos Chile](https://www.autocosmos.cl/catalogo/segmentos/kyc?o=8019).

## Qué se incorporó

El archivo `rindelab/data/market-price-fifthpass-20261022.json` contiene las 21 homologaciones con nombre, fecha, sufijo de código, versión comercial de referencia, monto, fuente, IVA, vigencia y advertencia de conciliación. El nuevo expediente `rindelab/data/market-price-unresolved-after-fifthpass-20261022.json` registra **206 fichas pendientes**, sin eliminar su historial ni atribuirles valores ficticios.

De las 206 abiertas, **189** siguen sin precio de familia encontrado en las fuentes examinadas, **14** solo tienen referencias anteriores vencidas y **3** solo referencias de otra tecnología. Se debe continuar el rastreo en importadores, redes comerciales y portales de versiones, pero **ninguno de estos registros demuestra que el automóvil no tenga precio en Chile o esté descontinuado**.

## Política de identificación

**Precio de una versión comercial ≠ precio de una homologación 3CV.** Mantener separados acabado, motor, tecnología (EV, PHEV, REEV, HEV, térmico), caja, carrocería, tracción, fecha, condición de IVA, bonos, ofertas antiguas y disponibilidad; no extrapolar precios por apellido comercial.
