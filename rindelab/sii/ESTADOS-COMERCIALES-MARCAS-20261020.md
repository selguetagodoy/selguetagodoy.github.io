# RINDELAB — Estados comerciales de marcas (Chile)

**Corte:** 20 de octubre de 2026. **Universo:** 8.053 fichas históricas, 122 etiquetas originales 3CV normalizadas a 114 marcas, más Deepal y Avatr que solo aparecen en el catálogo comercial; 116 nombres en la vista de marcas.

## Criterio y resultados

| Categoría visible | Marcas | Qué acredita | Qué NO acredita |
|---|---:|---|---|
| Con precio | **80** | Al menos un precio público incluido en `commercial-2026.json` | Disponibilidad actual o existencia de stock |
| Sin precio | **35** | Homologaciones 3CV mayo de 2026 sin precio comercial en RINDELAB | Que una marca haya abandonado Chile o un modelo esté descontinuado |
| Descontinuada | **1** | Cese de **venta nueva en Chile**, declarado por una fuente comprobable | Cese de fabricación global o desaparición de servicios de posventa |

**TOTAL: 116 marcas canónicas**. La última categoría es verificable mediante `rindelab/sii/brand-commercial-status-2026.json` y sus URLs. De las 36 marcas que inicialmente no tenían precio, solo una cuenta por ahora con evidencia específica de descontinuación de ventas; las otras 35 quedan deliberadamente por confirmar.

### Caso acreditado

- **Infiniti:** el fabricante indica textualmente que ha cesado la venta de vehículos nuevos en Chile, conservando asistencia y mantenimiento. [INFINITI Chile, fuente oficial](https://www.infiniti.com/regions/es-cl.html). *Estado de marca en el mercado chileno; no significa que la marca haya cerrado a nivel global.*

### Histórico con vigencia comercial aún no acreditada

Bentley, Borgward, Brilliance, Chrysler, Daihatsu, DFLM, DFLZ, Dodge, Eveasy, Farizon, FAW, Fest, Gac Gonow, Gecko, Genesis, INEOS, Isuzu, Kenbo, Lada, Lamborghini, Landwind, Lifan, Lotus, MAN, Maple, McLaren, Neta, Piaggio, Proton, Rolls-Royce, Sinotruk, Skywell, Weltmeister, ZNA Dongfeng y Zotye.

**Importante:** DFLM, DFLZ y ZNA Dongfeng podrían requerir reconciliación de alias con denominaciones actuales. No inferir discontinuación por ausencia de precio. El caso de Borgward (marca que homologó vehículos pero cuyo lanzamiento en Chile no prosperó, según prensa sectorial) se deja histórico y no como «venta discontinuada»: son hechos diferentes.

### Implementación técnica

- Filtro visible simplificado: **Todas**, **Con precio**, **Sin precio** y **Descontinuadas**. La nota metodológica mantiene los matices regulatorios y de vigencia comercial.
- Una fuente de estado solo se muestra cuando está documentada, junto con el link verificable y exportable por CSV.
- Esta categoría no modifica registros oficiales 3CV ni inventa fechas de término; solo afecta la tabla de consulta.
- Nuevos casos pasan a «Descontinuado en Chile» **solo** tras verificar el cese de venta nueva para el mercado chileno y registrar el origen en JSON.

**Trabajo restante:** revisar una a una las 35 marcas históricas, resolver alias y ampliar modelos específicos de catálogo. Se mantienen los 10 casos de familias/versiones incompletas y las 161 referencias comerciales publicadas solo como «desde», sin confundirlas con vehículos descontinuados.

**Nota de interfaz:** «Sin precio» no es sinónimo de «descontinuada». La etiqueta explica la disponibilidad de datos en RINDELAB, mientras que «Descontinuada» exige una fuente que confirme el cese de ventas de vehículos nuevos en Chile.
