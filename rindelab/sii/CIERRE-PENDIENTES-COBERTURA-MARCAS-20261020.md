# RINDELAB — Cierre documental de brechas por marca y nuevos precios

**Corte de trabajo:** 20 de octubre de 2026. **Formato:** Markdown previo a migración; no cambia el JSON comercial ni las homologaciones 3CV. **Fuentes:** inventario aportado por el usuario, base maestra 1.485 (`rindelab/sii/BASE-MAESTRA-PRECIOS-CON-ORIGEN-20261020.md`), consulta de catálogos de fabricantes y marketplaces. Los importes de terceros son publicaciones, no cotizaciones vinculantes. No se afirma comprobación de stock.

## 1. Resultado cuantitativo y diagnóstico

- **124 denominaciones de marca** en el insumo 3CV, con **8.053 registros históricos**; **1.485 referencias comerciales** distribuidas en **74 marcas**. Las cantidades comerciales coinciden con la base maestra del repositorio.
- **50 denominaciones con cero referencias comerciales bajo el mismo nombre.** Varias son alias, submarcas o marcas de comercialización histórica: no deben considerarse automáticamente 50 marcas activas sin oferta ni 8.053 precios faltantes.
- **Nuevos hallazgos:** 26 publicaciones modelo/precio registradas abajo, de las que **18 son candidatas no identificadas en la base actual**, **otros 3 Nammi requieren cruce de versión**, y **5 DFM corresponden a modelos ya cubiertos como Dongfeng**. *Las cifras de candidatos son un instrumento de revisión, no un incremento ya aplicado al catálogo.*
- La marca **M. Benz** agrupa 565 fichas del 3CV, mientras **Mercedes-Benz** ya tiene 26 precios; **Haval** ya figura como familia de modelos dentro de **Great Wall**; **Ssangyong** ya tiene referencias bajo **KGM**. También hay equivalencias de grafía Lynk Co/Lynk & Co y ZX Auto/Zxauto.

## 2. Hallazgos directos para incorporar o conciliar

| Marca publicada | Modelo | Versión / referencia | Precio publicado | Tratamiento | Resultado del cruce | URL específica |
|---|---|---|---:|---|---|---|
| Nammi | 001 | SR | $14.990.000 | Oferta publicada | CRUZAR (puede solaparse con Dongfeng/Nammi) | [Fuente](https://www.auto.cl/nuevos/nammi/001) |
| Nammi | 001 | LR Full | $21.490.000 | Oferta publicada | DUPLICADO PROBABLE: Dongfeng ya tiene LR FULL | [Fuente](https://www.auto.cl/nuevos/nammi/001) |
| Nammi | 001 | LR 6AB Elite | $24.990.000 | Precio publicado | ALTA CANDIDATA previa comparación de llave exacta | [Fuente](https://www.auto.cl/nuevos/nammi/001) |
| Nammi | 001 | 94 HP | $22.990.000 | Precio de lista Autocosmos | CRUZAR: no identificar automáticamente con SR/LR | [Fuente](https://www.autocosmos.cl/catalogo/vigente/nammi/001) |
| Uaz | Hunter | 2.7L Sport | $16.990.000 | Precio de lista referencial | ALTA CANDIDATA, stock no corroborado | [Fuente](https://www.autocosmos.cl/catalogo/vigente/uaz/hunter) |
| Uaz | Hunter | 2.7L Sport Ac | $18.490.000 | Precio de lista referencial | ALTA CANDIDATA, stock no corroborado | [Fuente](https://www.autocosmos.cl/catalogo/vigente/uaz/hunter) |
| ZNA | DF6 | 2.5L 4x2 | $17.838.100 | Precio de lista referencial | ALTA CANDIDATA, validar marca comercial vigente | [Fuente](https://www.autocosmos.cl/catalogo/segmentos/zna) |
| ZNA | DF6 | 2.5L 4x4 | $19.623.100 | Precio de lista referencial | ALTA CANDIDATA, validar marca comercial vigente | [Fuente](https://www.autocosmos.cl/catalogo/segmentos/zna) |
| Iveco | Daily Chasis Cabina | 35-150 | $29.143.100 | Precio de lista referencial | ALTA CANDIDATA, línea comercial | [Fuente](https://www.autocosmos.cl/catalogo/vigente/iveco/daily-chasis-cabina) |
| Iveco | Daily Furgón | 30-130 | $30.928.100 | Precio de lista referencial | ALTA CANDIDATA, línea comercial | [Fuente](https://www.autocosmos.cl/catalogo/vigente/iveco/daily-furgon) |
| Hino | City 515 | MT/AT (precio mínimo de familia) | $27.290.000 + IVA | Precio desde fabricante | ALTA CANDIDATA: precio familiar, no separar MT/AT | [Fuente](https://www.hino.cl/300) |
| Hino | XZU 616 | MT/AT (precio mínimo de familia) | $28.690.000 + IVA | Precio desde fabricante | ALTA CANDIDATA: precio familiar, no separar MT/AT | [Fuente](https://www.hino.cl/300) |
| Hino | XZU 617 DC | MT | $34.490.000 + IVA | Precio desde fabricante | ALTA CANDIDATA, comercial | [Fuente](https://www.hino.cl/300) |
| Hino | XZU 817 | MT | $34.290.000 + IVA | Precio desde fabricante | ALTA CANDIDATA, comercial | [Fuente](https://www.hino.cl/300) |
| Hino | XZU 917 | MT | $36.390.000 + IVA | Precio desde fabricante | ALTA CANDIDATA, comercial | [Fuente](https://www.hino.cl/300) |
| Hino | XZU 816 | AT | $40.990.000 + IVA | Precio desde fabricante | ALTA CANDIDATA, comercial | [Fuente](https://www.hino.cl/300) |
| Fuso | Canter 515 | Full manual | $25.490.000 + IVA | Precio actual anunciado, puede incluir rebaja | ALTA CANDIDATA, no catalogar como precio de lista | [Fuente](https://www.fuso.cl/camiones-canter-515) |
| Fuso | Canter 515 | Full automatizada | $27.990.000 + IVA | Precio actual anunciado, puede incluir rebaja | ALTA CANDIDATA, no catalogar como precio de lista | [Fuente](https://www.fuso.cl/camiones-canter-515) |
| Fuso | Canter 718 | Manual | $30.990.000 + IVA | Precio actual anunciado, puede incluir rebaja | ALTA CANDIDATA, no catalogar como precio de lista | [Fuente](https://www.fuso.cl/camiones-canter-718) |
| Fuso | Canter 718 | Automatizada | $32.490.000 + IVA | Precio actual anunciado, puede incluir rebaja | ALTA CANDIDATA, no catalogar como precio de lista | [Fuente](https://www.fuso.cl/camiones-canter-718) |
| Fuso | Canter 918 | Full (manual) | $34.490.000 + IVA | Precio actual anunciado, puede incluir rebaja | ALTA CANDIDATA, no catalogar como precio de lista | [Fuente](https://www.fuso.cl/camiones-canter-918) |
| DFM | Aeolus GS Cross | Precio desde (versión no identificada) | $13.890.000 | Precio desde auto.cl | NO ALTA: ya figura en Dongfeng como AEOLUS GS | [Fuente](https://www.auto.cl/nuevos/dongfeng) |
| DFM | Aeolus Y3 | Precio desde (versión no identificada) | $11.490.000 | Precio desde auto.cl | NO ALTA: 3 versiones ya en Dongfeng | [Fuente](https://www.auto.cl/nuevos/dongfeng) |
| DFM | S50 EV | Precio desde (versión no identificada) | $26.990.000 | Precio desde auto.cl | NO ALTA: ya figura en Dongfeng como S50 EVE | [Fuente](https://www.auto.cl/nuevos/dongfeng) |
| DFM | T5 EVO | Precio desde (versión no identificada) | $19.990.000 | Precio desde auto.cl | NO ALTA: ya figura en Dongfeng | [Fuente](https://www.auto.cl/nuevos/dongfeng) |
| DFM | T5L | Precio desde (versión no identificada) | $15.690.000 | Precio desde auto.cl | NO ALTA: ya figura en Dongfeng | [Fuente](https://www.auto.cl/nuevos/dongfeng) |

**Sobre el impuesto:** los valores Hino y Fuso se mantienen tal cual los publica el fabricante, **+ IVA**, sin convertirlos artificialmente a importes con IVA. Los precios Fuso son valores “AHORA”, posiblemente promocionales: no se reclasifican como precios de lista. Los “desde” no representan un acabado comercial individual.

**Observación Nammi:** RINDELAB ya registra Nammi 001 LR y LR Full en la marca comercial **Dongfeng** (fuente Callegari) y E70 bajo Dongfeng; por tanto, no repetirlos automáticamente. La versión 001 LR 6AB Elite puede ser un alta nueva después de verificar el identificador y no sustituye a la ficha de 94 HP sin equivalencia técnica. Precios distintos en distintas fuentes se conservan con procedencia y condición comercial.

**Observación DFM:** los cinco modelos ofertados por auto.cl (GS Cross, Y3, S50 EV, T5 EVO, T5L) ya tienen filas equivalentes en los 27 registros comerciales de Dongfeng. Es una brecha de correspondencia **marca homologada versus etiqueta de venta**, no cinco modelos comerciales necesariamente faltantes.

## 3. Matriz completa de 124 marcas y acción documental

Se reproduce el inventario sin modificar sus cifras. La columna de tratamiento es editorial; **no** significa que la normalización ya esté desplegada en el sitio.

| Marca en listado | Fichas 3CV | Precios en maestro | Diagnóstico | Trabajo que corresponde |
|---|---:|---:|---|---|
| Alfa Romeo | 21 | 2 | Precio documentado | Revisar modelos y versiones a la venta que no estén ya en el maestro; no usar total histórico 3CV como objetivo. |
| Aston Martin | 24 | 12 | Precio documentado | Revisar modelos y versiones a la venta que no estén ya en el maestro; no usar total histórico 3CV como objetivo. |
| Audi | 287 | 22 | Precio documentado | Revisar modelos y versiones a la venta que no estén ya en el maestro; no usar total histórico 3CV como objetivo. |
| Avatr | 0 | 1 | Precio documentado | Revisar modelos y versiones a la venta que no estén ya en el maestro; no usar total histórico 3CV como objetivo. |
| Baic | 39 | 14 | Precio documentado | Revisar modelos y versiones a la venta que no estén ya en el maestro; no usar total histórico 3CV como objetivo. |
| Bentley | 19 | 0 | Sin precio en maestro | No inventar precio: buscar catálogo de nuevos con importe visible; si solo hay usados/legado, clasificar como histórico. |
| BMW | 458 | 67 | Precio documentado | Revisar modelos y versiones a la venta que no estén ya en el maestro; no usar total histórico 3CV como objetivo. |
| Borgward | 6 | 0 | Sin precio en maestro | No inventar precio: buscar catálogo de nuevos con importe visible; si solo hay usados/legado, clasificar como histórico. |
| Brilliance | 27 | 0 | Sin precio en maestro | No inventar precio: buscar catálogo de nuevos con importe visible; si solo hay usados/legado, clasificar como histórico. |
| BYD | 43 | 16 | Precio documentado | Revisar modelos y versiones a la venta que no estén ya en el maestro; no usar total histórico 3CV como objetivo. |
| Changan | 97 | 37 | Precio documentado | Revisar modelos y versiones a la venta que no estén ya en el maestro; no usar total histórico 3CV como objetivo. |
| Chery | 124 | 58 | Precio documentado | Revisar modelos y versiones a la venta que no estén ya en el maestro; no usar total histórico 3CV como objetivo. |
| Chevrolet | 219 | 27 | Precio documentado | Revisar modelos y versiones a la venta que no estén ya en el maestro; no usar total histórico 3CV como objetivo. |
| Chrysler | 5 | 0 | Sin precio en maestro | No inventar precio: buscar catálogo de nuevos con importe visible; si solo hay usados/legado, clasificar como histórico. |
| Citroen | 172 | 24 | Precio documentado | Revisar modelos y versiones a la venta que no estén ya en el maestro; no usar total histórico 3CV como objetivo. |
| Cupra | 18 | 7 | Precio documentado | Revisar modelos y versiones a la venta que no estén ya en el maestro; no usar total histórico 3CV como objetivo. |
| Daihatsu | 4 | 0 | Sin precio en maestro | No inventar precio: buscar catálogo de nuevos con importe visible; si solo hay usados/legado, clasificar como histórico. |
| Deepal | 0 | 3 | Precio documentado | Revisar modelos y versiones a la venta que no estén ya en el maestro; no usar total histórico 3CV como objetivo. |
| DFLM | 29 | 0 | Cruce de identidad | Vincular a **Dongfeng (por validar)**: Necesita tabla código/familia; no asignar automáticamente. |
| DFLZ | 2 | 0 | Cruce de identidad | Vincular a **Dongfeng (por validar)**: Necesita tabla código/familia; no asignar automáticamente. |
| DFM | 45 | 0 | Cruce Dongfeng ya existente | Confirmar modelo/versión y condición del precio antes de añadir o reasignar. |
| DFSK | 65 | 4 | Precio documentado | Revisar modelos y versiones a la venta que no estén ya en el maestro; no usar total histórico 3CV como objetivo. |
| Dodge | 22 | 0 | Sin precio en maestro | No inventar precio: buscar catálogo de nuevos con importe visible; si solo hay usados/legado, clasificar como histórico. |
| Dongfeng | 20 | 27 | Precio documentado | Revisar modelos y versiones a la venta que no estén ya en el maestro; no usar total histórico 3CV como objetivo. |
| DS | 28 | 8 | Precio documentado | Revisar modelos y versiones a la venta que no estén ya en el maestro; no usar total histórico 3CV como objetivo. |
| Eveasy | 3 | 0 | Sin precio en maestro | No inventar precio: buscar catálogo de nuevos con importe visible; si solo hay usados/legado, clasificar como histórico. |
| Exeed | 4 | 10 | Precio documentado | Revisar modelos y versiones a la venta que no estén ya en el maestro; no usar total histórico 3CV como objetivo. |
| Exeed Born For More | 14 | 0 | Cruce de identidad | Vincular a **Exeed**: Es un nombre comercial/leyenda: comprobar familia antes de asignar. |
| Farizon | 14 | 0 | Sin precio en maestro | No inventar precio: buscar catálogo de nuevos con importe visible; si solo hay usados/legado, clasificar como histórico. |
| Faw | 19 | 0 | Sin precio en maestro | No inventar precio: buscar catálogo de nuevos con importe visible; si solo hay usados/legado, clasificar como histórico. |
| Ferrari | 32 | 7 | Precio documentado | Revisar modelos y versiones a la venta que no estén ya en el maestro; no usar total histórico 3CV como objetivo. |
| Fest | 1 | 0 | Sin precio en maestro | No inventar precio: buscar catálogo de nuevos con importe visible; si solo hay usados/legado, clasificar como histórico. |
| Fiat | 125 | 9 | Precio documentado | Revisar modelos y versiones a la venta que no estén ya en el maestro; no usar total histórico 3CV como objetivo. |
| Ford | 249 | 58 | Precio documentado | Revisar modelos y versiones a la venta que no estén ya en el maestro; no usar total histórico 3CV como objetivo. |
| Foton | 143 | 44 | Precio documentado | Revisar modelos y versiones a la venta que no estén ya en el maestro; no usar total histórico 3CV como objetivo. |
| Fuso | 1 | 0 | Candidatos precio + IVA | Confirmar modelo/versión y condición del precio antes de añadir o reasignar. |
| Gac | 54 | 26 | Precio documentado | Revisar modelos y versiones a la venta que no estén ya en el maestro; no usar total histórico 3CV como objetivo. |
| Gac Gonow | 8 | 0 | Cruce de identidad | Vincular a **Gac**: Posible marca histórica, no unir automáticamente modelos. |
| Gecko | 1 | 0 | Sin precio en maestro | No inventar precio: buscar catálogo de nuevos con importe visible; si solo hay usados/legado, clasificar como histórico. |
| Geely | 43 | 13 | Precio documentado | Revisar modelos y versiones a la venta que no estén ya en el maestro; no usar total histórico 3CV como objetivo. |
| Genesis | 1 | 0 | Sin precio en maestro | No inventar precio: buscar catálogo de nuevos con importe visible; si solo hay usados/legado, clasificar como histórico. |
| Great Wall | 89 | 40 | Precio documentado | Revisar modelos y versiones a la venta que no estén ya en el maestro; no usar total histórico 3CV como objetivo. |
| Haval | 33 | 0 | Cruce de identidad | Vincular a **Great Wall**: Los precios de Haval H6/H7/Jolion están en Great Wall; conservar Haval como submarca. |
| Hino | 2 | 0 | Candidatos precio + IVA | Confirmar modelo/versión y condición del precio antes de añadir o reasignar. |
| Honda | 118 | 9 | Precio documentado | Revisar modelos y versiones a la venta que no estén ya en el maestro; no usar total histórico 3CV como objetivo. |
| Hyundai | 300 | 66 | Precio documentado | Revisar modelos y versiones a la venta que no estén ya en el maestro; no usar total histórico 3CV como objetivo. |
| INEOS | 2 | 0 | Sin precio en maestro | No inventar precio: buscar catálogo de nuevos con importe visible; si solo hay usados/legado, clasificar como histórico. |
| Infiniti | 36 | 0 | Sin precio en maestro | No inventar precio: buscar catálogo de nuevos con importe visible; si solo hay usados/legado, clasificar como histórico. |
| Isuzu | 1 | 0 | Sin precio en maestro | No inventar precio: buscar catálogo de nuevos con importe visible; si solo hay usados/legado, clasificar como histórico. |
| Iveco | 8 | 0 | Candidatos precio CLP | Confirmar modelo/versión y condición del precio antes de añadir o reasignar. |
| Jac | 117 | 53 | Precio documentado | Revisar modelos y versiones a la venta que no estén ya en el maestro; no usar total histórico 3CV como objetivo. |
| Jaecoo | 13 | 4 | Precio documentado | Revisar modelos y versiones a la venta que no estén ya en el maestro; no usar total histórico 3CV como objetivo. |
| Jaguar | 128 | 2 | Precio documentado | Revisar modelos y versiones a la venta que no estén ya en el maestro; no usar total histórico 3CV como objetivo. |
| Jeep | 138 | 37 | Precio documentado | Revisar modelos y versiones a la venta que no estén ya en el maestro; no usar total histórico 3CV como objetivo. |
| Jetour | 31 | 12 | Precio documentado | Revisar modelos y versiones a la venta que no estén ya en el maestro; no usar total histórico 3CV como objetivo. |
| JIM | 4 | 4 | Precio documentado | Revisar modelos y versiones a la venta que no estén ya en el maestro; no usar total histórico 3CV como objetivo. |
| JMC | 40 | 23 | Precio documentado | Revisar modelos y versiones a la venta que no estén ya en el maestro; no usar total histórico 3CV como objetivo. |
| Kaiyi | 14 | 6 | Precio documentado | Revisar modelos y versiones a la venta que no estén ya en el maestro; no usar total histórico 3CV como objetivo. |
| Karry | 20 | 8 | Precio documentado | Revisar modelos y versiones a la venta que no estén ya en el maestro; no usar total histórico 3CV como objetivo. |
| Kenbo | 8 | 0 | Sin precio en maestro | No inventar precio: buscar catálogo de nuevos con importe visible; si solo hay usados/legado, clasificar como histórico. |
| KGM | 49 | 65 | Precio documentado | Revisar modelos y versiones a la venta que no estén ya en el maestro; no usar total histórico 3CV como objetivo. |
| Kia | 283 | 53 | Precio documentado | Revisar modelos y versiones a la venta que no estén ya en el maestro; no usar total histórico 3CV como objetivo. |
| KYC | 38 | 8 | Precio documentado | Revisar modelos y versiones a la venta que no estén ya en el maestro; no usar total histórico 3CV como objetivo. |
| Lada | 6 | 0 | Sin precio en maestro | No inventar precio: buscar catálogo de nuevos con importe visible; si solo hay usados/legado, clasificar como histórico. |
| Lamborghini | 6 | 0 | Sin precio en maestro | No inventar precio: buscar catálogo de nuevos con importe visible; si solo hay usados/legado, clasificar como histórico. |
| Land Rover | 511 | 17 | Precio documentado | Revisar modelos y versiones a la venta que no estén ya en el maestro; no usar total histórico 3CV como objetivo. |
| Landking | 9 | 16 | Precio documentado | Revisar modelos y versiones a la venta que no estén ya en el maestro; no usar total histórico 3CV como objetivo. |
| Landwind | 1 | 0 | Sin precio en maestro | No inventar precio: buscar catálogo de nuevos con importe visible; si solo hay usados/legado, clasificar como histórico. |
| Leapmotor | 7 | 4 | Precio documentado | Revisar modelos y versiones a la venta que no estén ya en el maestro; no usar total histórico 3CV como objetivo. |
| Lexus | 70 | 11 | Precio documentado | Revisar modelos y versiones a la venta que no estén ya en el maestro; no usar total histórico 3CV como objetivo. |
| Lifan | 16 | 0 | Sin precio en maestro | No inventar precio: buscar catálogo de nuevos con importe visible; si solo hay usados/legado, clasificar como histórico. |
| Livan | 7 | 2 | Precio documentado | Revisar modelos y versiones a la venta que no estén ya en el maestro; no usar total histórico 3CV como objetivo. |
| Lotus | 2 | 0 | Sin precio en maestro | No inventar precio: buscar catálogo de nuevos con importe visible; si solo hay usados/legado, clasificar como histórico. |
| Lynk & Co | 0 | 8 | Cruce de identidad | Vincular a **Lynk & Co**: Ocho precios comerciales; seis registros 3CV bajo Lynk Co. |
| Lynk Co | 6 | 0 | Cruce de identidad | Vincular a **Lynk & Co**: Ocho precios comerciales bajo grafía Lynk & Co. |
| M. Benz | 565 | 0 | Cruce de identidad | Vincular a **Mercedes-Benz**: 565 homologaciones 3CV históricas: 26 precios comerciales ya en Mercedes-Benz. |
| Mahindra | 30 | 4 | Precio documentado | Revisar modelos y versiones a la venta que no estén ya en el maestro; no usar total histórico 3CV como objetivo. |
| MAN | 1 | 0 | Sin precio en maestro | No inventar precio: buscar catálogo de nuevos con importe visible; si solo hay usados/legado, clasificar como histórico. |
| Maple | 2 | 0 | Sin precio en maestro | No inventar precio: buscar catálogo de nuevos con importe visible; si solo hay usados/legado, clasificar como histórico. |
| Maserati | 30 | 9 | Precio documentado | Revisar modelos y versiones a la venta que no estén ya en el maestro; no usar total histórico 3CV como objetivo. |
| Maxus | 111 | 15 | Precio documentado | Revisar modelos y versiones a la venta que no estén ya en el maestro; no usar total histórico 3CV como objetivo. |
| Mazda | 138 | 19 | Precio documentado | Revisar modelos y versiones a la venta que no estén ya en el maestro; no usar total histórico 3CV como objetivo. |
| McLaren | 16 | 0 | Sin precio en maestro | No inventar precio: buscar catálogo de nuevos con importe visible; si solo hay usados/legado, clasificar como histórico. |
| Mercedes-Benz | 0 | 26 | Cruce de identidad | Vincular a **Mercedes-Benz**: Sin códigos 3CV con este rótulo, pero con 26 precios publicados. |
| MG | 91 | 35 | Precio documentado | Revisar modelos y versiones a la venta que no estén ya en el maestro; no usar total histórico 3CV como objetivo. |
| Mini | 146 | 30 | Precio documentado | Revisar modelos y versiones a la venta que no estén ya en el maestro; no usar total histórico 3CV como objetivo. |
| Mitsubishi | 109 | 62 | Precio documentado | Revisar modelos y versiones a la venta que no estén ya en el maestro; no usar total histórico 3CV como objetivo. |
| Mitsubishi Fuso | 2 | 0 | Cruce de identidad | Vincular a **Fuso**: No confundir camiones Fuso con pasajeros Mitsubishi. |
| Nammi | 2 | 0 | Candidatos precio / cruce | Confirmar modelo/versión y condición del precio antes de añadir o reasignar. |
| Neta | 4 | 0 | Sin precio en maestro | No inventar precio: buscar catálogo de nuevos con importe visible; si solo hay usados/legado, clasificar como histórico. |
| Nissan | 164 | 21 | Precio documentado | Revisar modelos y versiones a la venta que no estén ya en el maestro; no usar total histórico 3CV como objetivo. |
| Omoda | 13 | 3 | Precio documentado | Revisar modelos y versiones a la venta que no estén ya en el maestro; no usar total histórico 3CV como objetivo. |
| Opel | 124 | 18 | Precio documentado | Revisar modelos y versiones a la venta que no estén ya en el maestro; no usar total histórico 3CV como objetivo. |
| Peugeot | 243 | 37 | Precio documentado | Revisar modelos y versiones a la venta que no estén ya en el maestro; no usar total histórico 3CV como objetivo. |
| Piaggio | 1 | 0 | Sin precio en maestro | No inventar precio: buscar catálogo de nuevos con importe visible; si solo hay usados/legado, clasificar como histórico. |
| Porsche | 299 | 67 | Precio documentado | Revisar modelos y versiones a la venta que no estén ya en el maestro; no usar total histórico 3CV como objetivo. |
| Proton | 4 | 0 | Sin precio en maestro | No inventar precio: buscar catálogo de nuevos con importe visible; si solo hay usados/legado, clasificar como histórico. |
| Ram | 117 | 22 | Precio documentado | Revisar modelos y versiones a la venta que no estén ya en el maestro; no usar total histórico 3CV como objetivo. |
| Renault | 92 | 6 | Precio documentado | Revisar modelos y versiones a la venta que no estén ya en el maestro; no usar total histórico 3CV como objetivo. |
| Riddara | 6 | 2 | Precio documentado | Revisar modelos y versiones a la venta que no estén ya en el maestro; no usar total histórico 3CV como objetivo. |
| Rolls-Royce | 2 | 0 | Sin precio en maestro | No inventar precio: buscar catálogo de nuevos con importe visible; si solo hay usados/legado, clasificar como histórico. |
| Seat | 24 | 11 | Precio documentado | Revisar modelos y versiones a la venta que no estén ya en el maestro; no usar total histórico 3CV como objetivo. |
| Seres | 1 | 1 | Precio documentado | Revisar modelos y versiones a la venta que no estén ya en el maestro; no usar total histórico 3CV como objetivo. |
| Shineray | 15 | 5 | Precio documentado | Revisar modelos y versiones a la venta que no estén ya en el maestro; no usar total histórico 3CV como objetivo. |
| Sinotruk | 10 | 0 | Sin precio en maestro | No inventar precio: buscar catálogo de nuevos con importe visible; si solo hay usados/legado, clasificar como histórico. |
| Skoda | 108 | 8 | Precio documentado | Revisar modelos y versiones a la venta que no estén ya en el maestro; no usar total histórico 3CV como objetivo. |
| Skywell | 1 | 0 | Sin precio en maestro | No inventar precio: buscar catálogo de nuevos con importe visible; si solo hay usados/legado, clasificar como histórico. |
| Smart | 11 | 2 | Precio documentado | Revisar modelos y versiones a la venta que no estén ya en el maestro; no usar total histórico 3CV como objetivo. |
| Soueast | 7 | 6 | Precio documentado | Revisar modelos y versiones a la venta que no estén ya en el maestro; no usar total histórico 3CV como objetivo. |
| Ssangyong | 102 | 0 | Cruce de identidad | Vincular a **KGM**: KGM concentra 65 registros comerciales; marcar equivalencia SsangYong/KGM por modelo. |
| Subaru | 103 | 24 | Precio documentado | Revisar modelos y versiones a la venta que no estén ya en el maestro; no usar total histórico 3CV como objetivo. |
| Suzuki | 161 | 21 | Precio documentado | Revisar modelos y versiones a la venta que no estén ya en el maestro; no usar total histórico 3CV como objetivo. |
| SWM | 9 | 2 | Precio documentado | Revisar modelos y versiones a la venta que no estén ya en el maestro; no usar total histórico 3CV como objetivo. |
| Tesla | 12 | 5 | Precio documentado | Revisar modelos y versiones a la venta que no estén ya en el maestro; no usar total histórico 3CV como objetivo. |
| Toyota | 185 | 46 | Precio documentado | Revisar modelos y versiones a la venta que no estén ya en el maestro; no usar total histórico 3CV como objetivo. |
| Uaz | 14 | 0 | Candidatos precio CLP | Confirmar modelo/versión y condición del precio antes de añadir o reasignar. |
| Volkswagen | 163 | 16 | Precio documentado | Revisar modelos y versiones a la venta que no estén ya en el maestro; no usar total histórico 3CV como objetivo. |
| Volvo | 163 | 16 | Precio documentado | Revisar modelos y versiones a la venta que no estén ya en el maestro; no usar total histórico 3CV como objetivo. |
| Weltmeister | 2 | 0 | Sin precio en maestro | No inventar precio: buscar catálogo de nuevos con importe visible; si solo hay usados/legado, clasificar como histórico. |
| ZNA | 10 | 0 | Candidatos precio CLP | Confirmar modelo/versión y condición del precio antes de añadir o reasignar. |
| ZNA Dongfeng | 21 | 0 | Cruce de identidad | Vincular a **ZNA / Dongfeng**: Marcas históricas superpuestas; revisar modelo exacto. |
| Zotye | 1 | 0 | Sin precio en maestro | No inventar precio: buscar catálogo de nuevos con importe visible; si solo hay usados/legado, clasificar como histórico. |
| ZX Auto | 19 | 0 | Cruce de identidad | Vincular a **Zxauto**: Dos precios comerciales en grafía Zxauto. |
| Zxauto | 0 | 2 | Cruce de identidad | Vincular a **Zxauto**: Dos precios comerciales; 19 3CV bajo ZX Auto. |

## 4. Priorización práctica, no por diferencia bruta

**Grupo A — ejecutar ahora desde fuentes localizadas.** Añadir al MD de precios candidatos verificables sin repetidos: Hino (seis referencias “desde” + IVA), Fuso (cinco referencias actuales + IVA), Iveco (dos versiones CLP), UAZ Hunter (dos versiones CLP), ZNA DF6 (dos versiones CLP). Nammi requiere cruce de cuatro publicaciones con Dongfeng, especialmente el acabado 6AB Elite. **No se modificó el JSON.**

**Grupo B — regularizar alias de búsqueda y cobertura.** M. Benz→Mercedes-Benz, Lynk Co→Lynk & Co, ZX Auto→Zxauto, SsangYong→KGM cuando corresponde al mismo modelo/generación, Haval→submarca de Great Wall, Mitsubishi Fuso→Fuso, DFM→Dongfeng por familia. Conservar literalmente el identificador y marca 3CV en cada ficha; usar nombre normalizado únicamente en una capa de cruce/búsqueda, nunca sobreescribir fuente original.

**Grupo C — cero comercial y evidencia aún incompleta.** Bentley, Borgward, Brilliance, Chrysler, Daihatsu, DFLM, DFLZ, Dodge, Eveasy, Farizon, Faw, Fest, Gac Gonow, Gecko, Genesis, INEOS, Infiniti, Isuzu, Kenbo, Lada, Lamborghini, Landwind, Lifan, Lotus, MAN, Maple, McLaren, Neta, Piaggio, Proton, Rolls-Royce, Sinotruk, Skywell, Weltmeister, Zotye y otras filas con cero. El hecho de que hayan sido homologados no comprueba que exista oferta chilena 0 km en octubre de 2026. No atribuir “descontinuada” sin verificar por marca.

**Grupo D — marcas ya presentes.** Priorizar brechas de *familias ofertadas* contra el catálogo 0 km del mercado, no una supuesta diferencia entre 3CV y precios. Marcas con muchas homologaciones (Land Rover, BMW, Audi, Mercedes-Benz, Porsche, Kia, Hyundai, Chevrolet, Toyota, etc.) ya tienen referencias; toca resolver versiones efectivamente en venta que aún no están en la base por cruce exacto de modelo/versión/año.

## 5. Regla de integración MD → JSON y cierre de control

1. Conciliar `marca_normalizada + modelo_normalizado + versión_publicada + moneda + condición_IVA` contra la **base maestra actual**, y comprobar similitudes de alias (p. ej. `AEOLUS GS`/`GS CROSS`, `NAMMI EV LR FULL`/`001 LR Full`). Escribir resultado en MD: `ALTA`, `DUPLICADO`, `ALIAS`, `CONFLICTO` o `SIN PRECIO`.
2. Guardar URL directa, fecha de consulta, tipo (`lista`, `desde`, `oferta`, `actual`), moneda y tratamiento del IVA. No reinterpretar descuentos o convertir monedas sin fuente; si existe más de un precio publicado, conservar su **fuente** y su **tipo** en vez de sustituir arbitrariamente.
3. Usar el modelo/versión escrito por la fuente. Para importes de familia “desde”, guardar `Precio desde (versión no especificada)` y evitar inferir un acabado. Si el valor es `+ IVA`, guardar `tax_included=false` y mostrarlo en interfaz.
4. **No enlazar automáticamente 3CV** a una versión nueva por parecido del nombre; el rendimiento se asocia solo si el código homologado está verificado. La marca en 3CV es inmutable. No meter vehículos pesados en rankings de costo km para turismos sin rendimiento comparable.
5. Regenerar `commercial-2026.json`, el MD maestro, los sellos de caché y las pruebas de búsqueda/comparador/cotizador; solo declarar aumento de conteos después de la ejecución de QA y publicación en GitHub Pages.

## 6. Fuentes consultadas y contexto de cruce

- [Maestro documental RINDELAB 20/10/2026](https://github.com/selguetagodoy/selguetagodoy.github.io/blob/main/rindelab/sii/BASE-MAESTRA-PRECIOS-CON-ORIGEN-20261020.md).
- [Catálogo autos nuevos auto.cl](https://www.auto.cl/nuevos/), [DFM publicado como Dongfeng](https://www.auto.cl/nuevos/dongfeng), [Nammi 001](https://www.auto.cl/nuevos/nammi/001).
- [Autocosmos — ZNA](https://www.autocosmos.cl/catalogo/segmentos/zna), [UAZ Hunter](https://www.autocosmos.cl/catalogo/vigente/uaz/hunter), [Iveco](https://www.autocosmos.cl/catalogo/vigente/iveco), [Nammi 001](https://www.autocosmos.cl/catalogo/vigente/nammi/001).
- [Hino Serie 300](https://www.hino.cl/300), [Fuso Canter 515](https://www.fuso.cl/camiones-canter-515), [718](https://www.fuso.cl/camiones-canter-718), [918](https://www.fuso.cl/camiones-canter-918).
- [GWM / Haval](https://www.gwm.cl/electricos/) y [KGM / Ssangyong](https://www.ssangyong.cl/modelos/torres/) para equivalencias comerciales (no equivalencia automática de código 3CV).

**Estado real de esta entrega:** expediente Markdown, matriz total y nuevos precios fuente-a-fuente preparados; **no se ha modificado el catálogo público**, ni se promete cobertura completa de la oferta chilena. Los registros de cero sin fuente nueva permanecen explícitamente pendientes y no se rellenan artificialmente.