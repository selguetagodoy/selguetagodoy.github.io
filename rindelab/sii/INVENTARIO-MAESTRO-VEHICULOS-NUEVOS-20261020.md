# RINDELAB — Inventario maestro de vehículos nuevos (lote Gildemeister Retail)

**Corte:** 20 de octubre de 2026. **Base de comparación:** 1.062 precios del catálogo `rindelab/sii/commercial-2026.json` en la rama de trabajo. **Fuente documental:** páginas comerciales de Gildemeister Retail enlazadas en cada fila.

## Criterio de captura

Se consigna el **precio de lista publicado con IVA incluido**, sin restar bonos ni convertir precios con financiamiento. Se conserva el nombre publicado por el concesionario. El enlace permite consultar el origen y sus condiciones; no implica vigencia permanente, stock ni homologación energética automática. Donde no sea posible asociar la versión con una ficha 3CV, mostrar una nota breve: **«Homologación de esta versión aún no identificada. Puedes consultar el precio publicado en la fuente.»**

Para migrar: **Agregar** pasa a JSON; **Registrado** no se duplica; **Registrado; fuente difiere** permanece con su precio existente y la alternativa documentada; **Revisar posible equivalencia** no se migra automáticamente.

**Resultado del barrido:** 63 versiones extraídas de 22 páginas de modelos; 12 altas propuestas; 38 presentes; 2 con otro precio publicado y 11 que podrían corresponder al mismo registro.

## Tabla maestra de versiones y fuentes

| Marca | Modelo | Versión comercial publicada | Tecnología | Precio lista CLP | Origen | Situación |
|---|---|---|---|---:|---|---|
| Hyundai | i20 | I20 BI3 1.4 MT GO FL | Gasolina | $14.990.000 | [Gildemeister Retail](https://www.gildemeisterretail.cl/marcas/hyundai/new-i20/) | Agregar |
| Hyundai | i20 | I20 BI3 1.4 MT PLUS FL | Gasolina | $16.390.000 | [Gildemeister Retail](https://www.gildemeisterretail.cl/marcas/hyundai/new-i20/) | Revisar posible equivalencia |
| Hyundai | i20 | I20 BI3 1.4 AT PLUS FL | Gasolina | $17.190.000 | [Gildemeister Retail](https://www.gildemeisterretail.cl/marcas/hyundai/new-i20/) | Registrado |
| Hyundai | i20 | I20 BI3 1.0T AT DESIGN FL | Gasolina | $19.690.000 | [Gildemeister Retail](https://www.gildemeisterretail.cl/marcas/hyundai/new-i20/) | Registrado |
| Hyundai | Creta | Creta SU2id 1.5 MT GO FL | Gasolina | $18.290.000 | [Gildemeister Retail](https://www.gildemeisterretail.cl/marcas/hyundai/new-creta/) | Registrado |
| Hyundai | Creta | Creta SU2id 1.5 MT PLUS FL | Gasolina | $19.090.000 | [Gildemeister Retail](https://www.gildemeisterretail.cl/marcas/hyundai/new-creta/) | Registrado |
| Hyundai | Creta | Creta SU2id 1.5 CVT PLUS FL | Gasolina | $20.590.000 | [Gildemeister Retail](https://www.gildemeisterretail.cl/marcas/hyundai/new-creta/) | Registrado |
| Hyundai | Creta | Creta SU2id 1.5 CVT DESIGN FL | Gasolina | $22.790.000 | [Gildemeister Retail](https://www.gildemeisterretail.cl/marcas/hyundai/new-creta/) | Registrado |
| Hyundai | Tucson | TUCSON NX4c 2.0 MT GO FL | Gasolina | $24.390.000 | [Gildemeister Retail](https://www.gildemeisterretail.cl/marcas/hyundai/the-new-tucson/) | Registrado |
| Hyundai | Tucson | TUCSON NX4c 2.0 AT PLUS FL | Gasolina | $25.990.000 | [Gildemeister Retail](https://www.gildemeisterretail.cl/marcas/hyundai/the-new-tucson/) | Registrado |
| Hyundai | Tucson | TUCSON NX4c 2.0 AT BLACKLINE FL | Gasolina | $30.190.000 | [Gildemeister Retail](https://www.gildemeisterretail.cl/marcas/hyundai/the-new-tucson/) | Registrado |
| Hyundai | Tucson | TUCSON NX4c 1.5T AT 4WD PLUS FL | Gasolina | $30.190.000 | [Gildemeister Retail](https://www.gildemeisterretail.cl/marcas/hyundai/the-new-tucson/) | Registrado |
| Hyundai | Kona | KONA SX2 1.6 AT HEV PLUS | HEV | $27.590.000 | [Gildemeister Retail](https://www.gildemeisterretail.cl/marcas/hyundai/all-new-kona-hibrido/) | Registrado |
| Hyundai | Kona | KONA SX2 1.6 AT HEV DESIGN | HEV | $30.190.000 | [Gildemeister Retail](https://www.gildemeisterretail.cl/marcas/hyundai/all-new-kona-hibrido/) | Registrado |
| Hyundai | Tucson | Tucson NX4 1.6T HEV AT PLUS FL | HEV | $31.890.000 | [Gildemeister Retail](https://www.gildemeisterretail.cl/marcas/hyundai/the-new-tucson-hibrido/) | Registrado |
| Hyundai | Tucson | TUCSON NX4 1.6T HEV AT DESIGN FL | HEV | $37.590.000 | [Gildemeister Retail](https://www.gildemeisterretail.cl/marcas/hyundai/the-new-tucson-hibrido/) | Registrado |
| Hyundai | Tucson | TUCSON NX4 1.6T HEV AT 4WD LIMITED FL | HEV | $42.390.000 | [Gildemeister Retail](https://www.gildemeisterretail.cl/marcas/hyundai/the-new-tucson-hibrido/) | Registrado |
| Hyundai | Palisade | PALISADE LX3 2.5T HEV AT AWD LIMITED | HEV | $59.990.000 | [Gildemeister Retail](https://www.gildemeisterretail.cl/marcas/hyundai/all-new-palisade-hibrido/) | Registrado |
| Hyundai | Palisade | PALISADE LX3 2.5T HEV AT AWD CALLIGRAPHY | HEV | $65.990.000 | [Gildemeister Retail](https://www.gildemeisterretail.cl/marcas/hyundai/all-new-palisade-hibrido/) | Registrado |
| Hyundai | Palisade | PALISADE LX3 2.5T HEV AT AWD 7P CALLIGRAPHY | HEV | $66.990.000 | [Gildemeister Retail](https://www.gildemeisterretail.cl/marcas/hyundai/all-new-palisade-hibrido/) | Registrado |
| Hyundai | Santa Fe | SANTA FE MX5 2.5T AT 4WD LIMITED | Gasolina | $50.090.000 | [Gildemeister Retail](https://www.gildemeisterretail.cl/marcas/hyundai/all-new-santa-fe/) | Registrado |
| Hyundai | Santa Fe | SANTA FE MX5 2.5T AT 4WD CALLIGRAPHY | Gasolina | $55.090.000 | [Gildemeister Retail](https://www.gildemeisterretail.cl/marcas/hyundai/all-new-santa-fe/) | Registrado |
| Hyundai | Kona | KONA SX2 1.6T AT 4WD N-LINE | Gasolina | $35.790.000 | [Gildemeister Retail](https://www.gildemeisterretail.cl/marcas/hyundai/all-new-kona/) | Registrado |
| Hyundai | Palisade | Palisade LX2 3.5 AT AWD Premium FL | Gasolina | $48.390.000 | [Gildemeister Retail](https://www.gildemeisterretail.cl/marcas/hyundai/new-palisade/) | Agregar |
| Hyundai | Palisade | Palisade LX2 2.2 CRDI AT AWD Premium FL | Diésel | $52.390.000 | [Gildemeister Retail](https://www.gildemeisterretail.cl/marcas/hyundai/new-palisade/) | Agregar |
| Hyundai | Palisade | Palisade LX2 2.2 CRDI AT AWD Limited FL | Diésel | $57.390.000 | [Gildemeister Retail](https://www.gildemeisterretail.cl/marcas/hyundai/new-palisade/) | Agregar |
| Hyundai | Accent | ACCENT BN7i 1.5 MT BLACK | Gasolina | $15.690.000 | [Gildemeister Retail](https://www.gildemeisterretail.cl/marcas/hyundai/all-new-accent/) | Revisar posible equivalencia |
| Hyundai | Accent | ACCENT BN7i 1.5 MT PLUS | Gasolina | $15.890.000 | [Gildemeister Retail](https://www.gildemeisterretail.cl/marcas/hyundai/all-new-accent/) | Revisar posible equivalencia |
| Hyundai | Accent | ACCENT BN7i 1.5 AT PLUS | Gasolina | $17.290.000 | [Gildemeister Retail](https://www.gildemeisterretail.cl/marcas/hyundai/all-new-accent/) | Registrado |
| Hyundai | Accent | ACCENT BN7i 1.5 MT DESIGN | Gasolina | $18.790.000 | [Gildemeister Retail](https://www.gildemeisterretail.cl/marcas/hyundai/all-new-accent/) | Registrado |
| Hyundai | Accent | ACCENT BN7i 1.5 AT DESIGN | Gasolina | $20.290.000 | [Gildemeister Retail](https://www.gildemeisterretail.cl/marcas/hyundai/all-new-accent/) | Registrado |
| Hyundai | Grand i10 Hatchback | GRAND I-10 AI3 HB 1.2 MT GO FL | Gasolina | $10.690.000 | [Gildemeister Retail](https://www.gildemeisterretail.cl/marcas/hyundai/new-grand-i10-hatchback/) | Revisar posible equivalencia |
| Hyundai | Grand i10 Hatchback | GRAND I-10 AI3 HB 1.2 MT PLUS FL | Gasolina | $11.790.000 | [Gildemeister Retail](https://www.gildemeisterretail.cl/marcas/hyundai/new-grand-i10-hatchback/) | Revisar posible equivalencia |
| Hyundai | Grand i10 Hatchback | GRAND I-10 AI3 HB 1.2 MT DESIGN FL | Gasolina | $12.990.000 | [Gildemeister Retail](https://www.gildemeisterretail.cl/marcas/hyundai/new-grand-i10-hatchback/) | Registrado |
| Hyundai | Grand i10 Hatchback | GRAND I-10 AI3 HB 1.2 AT PLUS FL | Gasolina | $13.290.000 | [Gildemeister Retail](https://www.gildemeisterretail.cl/marcas/hyundai/new-grand-i10-hatchback/) | Registrado |
| Hyundai | Grand i10 Sedan | GRAND I-10 AI3 SEDAN 1.2 MT PLUS FL | Gasolina | $12.490.000 | [Gildemeister Retail](https://www.gildemeisterretail.cl/marcas/hyundai/new-grand-i10-sedan/) | Revisar posible equivalencia |
| Hyundai | Grand i10 Sedan | GRAND I-10 AI3 SEDAN 1.2 MT DESIGN FL | Gasolina | $13.590.000 | [Gildemeister Retail](https://www.gildemeisterretail.cl/marcas/hyundai/new-grand-i10-sedan/) | Revisar posible equivalencia |
| Hyundai | Grand i10 Sedan | GRAND I-10 AI3 SEDAN 1.2 AT PLUS FL | Gasolina | $14.190.000 | [Gildemeister Retail](https://www.gildemeisterretail.cl/marcas/hyundai/new-grand-i10-sedan/) | Registrado |
| Hyundai | Staria | STARIA US4 MB 2.2 CRDI MT 11P | Diésel | $35.985.600 | [Gildemeister Retail](https://www.gildemeisterretail.cl/marcas/hyundai/staria/) | Registrado; fuente difiere |
| Hyundai | Staria | STARIA US4 MB 2.2 CRDI AT 9P | Diésel | $36.104.600 | [Gildemeister Retail](https://www.gildemeisterretail.cl/marcas/hyundai/staria/) | Registrado; fuente difiere |
| Hyundai | Staria | STARIA US4 MB 2.2 CRDI AT 4WD 7P LUXURY | Diésel | $48.897.100 | [Gildemeister Retail](https://www.gildemeisterretail.cl/marcas/hyundai/staria/) | Agregar |
| Hyundai | Staria | STARIA US4 MB 2.2 CRDI AT 4WD 9P LUXURY | Diésel | $49.373.100 | [Gildemeister Retail](https://www.gildemeisterretail.cl/marcas/hyundai/staria/) | Revisar posible equivalencia |
| Gac | GS8 | GS8 GL 2.0 AT 2WD | Gasolina | $25.990.000 | [Gildemeister Retail](https://www.gildemeisterretail.cl/marcas/gac/gs8/) | Agregar |
| Gac | GS8 | GS8 GX 2.0 AT 4WD | Gasolina | $32.990.000 | [Gildemeister Retail](https://www.gildemeisterretail.cl/marcas/gac/gs8/) | Agregar |
| Gac | Emzoom | EMZOOM GS + 1.5 AT 2WD | Gasolina | $13.490.000 | [Gildemeister Retail](https://www.gildemeisterretail.cl/marcas/gac/emzoom/) | Agregar |
| Gac | Emzoom | EMZOOM GB + 1.5 AT 2WD | Gasolina | $14.490.000 | [Gildemeister Retail](https://www.gildemeisterretail.cl/marcas/gac/emzoom/) | Agregar |
| Gac | Emzoom | EMZOOM GL 1.5 AT 2WD | Gasolina | $15.990.000 | [Gildemeister Retail](https://www.gildemeisterretail.cl/marcas/gac/emzoom/) | Agregar |
| Gac | Emzoom | EMZOOM GL R-STYLE 1.5 AT 2WD | Gasolina | $17.990.000 | [Gildemeister Retail](https://www.gildemeisterretail.cl/marcas/gac/emzoom/) | Revisar posible equivalencia |
| Gac | Emkoo | EMKOO GE 1.5 AT 2WD | Gasolina | $16.990.000 | [Gildemeister Retail](https://www.gildemeisterretail.cl/marcas/gac/emkoo/) | Agregar |
| Gac | Emkoo | EMKOO GL 1.5 AT 2WD | Gasolina | $18.990.000 | [Gildemeister Retail](https://www.gildemeisterretail.cl/marcas/gac/emkoo/) | Agregar |
| JAC | JS2 Pro | JS2 PRO MT LUXURY | Gasolina | $13.290.000 | [Gildemeister Retail](https://www.gildemeisterretail.cl/marcas/jac/jac-js2-pro/) | Registrado |
| JAC | JS2 Pro | JS2 PRO CVT ADVANCE | Gasolina | $14.290.000 | [Gildemeister Retail](https://www.gildemeisterretail.cl/marcas/jac/jac-js2-pro/) | Registrado |
| JAC | JS4 | JS4 COMFORT CVT | Gasolina | $15.390.000 | [Gildemeister Retail](https://www.gildemeisterretail.cl/marcas/jac/jac-js4/) | Registrado |
| JAC | JS4 | JS4 LUXURY CVT | Gasolina | $16.190.000 | [Gildemeister Retail](https://www.gildemeisterretail.cl/marcas/jac/jac-js4/) | Registrado |
| JAC | JS4 | JS4 ADVANCE CVT | Gasolina | $17.690.000 | [Gildemeister Retail](https://www.gildemeisterretail.cl/marcas/jac/jac-js4/) | Registrado |
| JAC | JS8 | JS8 COMFORT MT | Gasolina | $17.690.000 | [Gildemeister Retail](https://www.gildemeisterretail.cl/marcas/jac/js8/) | Registrado |
| JAC | JS8 | JS8 LUXURY MT | Gasolina | $18.190.000 | [Gildemeister Retail](https://www.gildemeisterretail.cl/marcas/jac/js8/) | Registrado |
| JAC | T9 | T9 4x4 MT Luxury | Diésel | $27.001.100 | [Gildemeister Retail](https://www.gildemeisterretail.cl/marcas/jac/jac-t9/) | Registrado |
| JAC | T9 | T9 4x4 AT Advance | Diésel | $28.786.100 | [Gildemeister Retail](https://www.gildemeisterretail.cl/marcas/jac/jac-t9/) | Registrado |
| JAC | T9 | T9 4x4 TEAM CHILE | Diésel | $31.166.100 | [Gildemeister Retail](https://www.gildemeisterretail.cl/marcas/jac/jac-t9/) | Registrado |
| JAC | T9 | T9 4X4 KIT OFF ROAD | Diésel | $31.880.100 | [Gildemeister Retail](https://www.gildemeisterretail.cl/marcas/jac/jac-t9/) | Registrado |
| Shineray | T30 | T30 Mini Truck CS 1.6 5MT ELT | Gasolina | $11.055.100 | [Gildemeister Retail](https://www.gildemeisterretail.cl/marcas/shineray/shineray-t30-con-a-c/) | Revisar posible equivalencia |
| Shineray | T52 | T52 Mini Truck CD 1.6 5MT STD | Gasolina | $13.316.100 | [Gildemeister Retail](https://www.gildemeisterretail.cl/marcas/shineray/shineray-t52-con-a-c/) | Revisar posible equivalencia |

## Cobertura y siguiente barrido

Este lote **no representa todos los vehículos nuevos vendidos en Chile**. Es un primer barrido ordenado por versiones y fuente. Continuar con Portillo, Salazar Israel, Pompeyo, Astara Retail, Gildemeister (otros modelos/marcas), fabricantes e importadores. No utilizar la cantidad total de fichas como equivalente de cobertura de mercado. Priorizar EV, HEV, PHEV, REEV, diésel y bencina; indicar origen de cada precio.

**Inconsistencias de fuente o nombre:** conservar el vínculo comercial; no detener carga por ortografía o naming. Evitar enlazar rendimientos energéticos a versiones distintas sin correspondencia fundamentada.
