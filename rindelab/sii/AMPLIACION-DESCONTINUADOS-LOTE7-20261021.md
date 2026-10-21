# RINDELAB — Séptima ampliación de modelos y generaciones retiradas (21/10/2026)

**Corte documental:** 21 de octubre de 2026. **Estados editoriales:** 90 = **79 retiros de modelo/variante** + **11 generaciones anteriores**. Este lote incorpora **9 casos**, que corresponden a **66 códigos históricos distintos del 3CV** válidos en el corte del 8 de mayo de 2026 (tres registros fuera de corte se excluyen). Se conservan 1.504 referencias de precios sin cambios.

## Casos documentados y coincidencias 3CV

| Fabricante | Familia/generación | Coincidencias 3CV | Clasificación | Evidencia |
|---|---|---:|---|---|
| Nissan | Navara D23 / NP300 D23 (anterior) | 27 | Generación anterior | [Principal](https://noticias.autocosmos.cl/2025/11/07/nissan-saca-del-mercado-chileno-a-su-historica-pick-up); [Complementaria](https://global.nissannews.com/en/releases/frontier-pro-and-navara-pro-usher-in-new-generation-of-nissan-pickup-performance) |
| Nissan | Juke F15 (primera generación Chile) | 6 | Generación anterior | [Principal](https://noticias.autocosmos.cl/2024/02/14/nissan-juke-2024-sigue-con-vida-en-europa); [Complementaria](https://noticias.autocosmos.cl/2026/04/21/nuevo-nissan-juke-tercera-generacion-100-electrica-mas-radical-y-disruptivo) |
| Mazda | Mazda6 / Mazda 6 (GJ tercera generación) | 13 | Generación anterior | [Principal](https://noticias.autocosmos.cl/2026/02/26/chile-sale-a-la-venta-un-escaso-ejemplar-del-mazda-6-20-aniversario); [Complementaria](https://noticias.autocosmos.cl/2026/09/10/que-hay-de-nuevo-en-el-mazda-6e-2027) |
| Fiat | Punto / Grande Punto | 7 | Modelo retirado | [Principal](https://www.media.stellantis.com/em-en/heritage-hub-italy/press/heritage-celebrates-the-30th-anniversary-of-the-legendary-fiat-punto); [Complementaria](https://noticias.autocosmos.cl/2018/06/01/fca-fiat-se-concentrara-en-latinoamerica) |
| Fiat | Bravo (2007-2016) | 3 | Modelo retirado | [Principal](https://www.autotrader.co.za/car-research/fiat/bravo/619); [Complementaria](https://noticias.autocosmos.cl/listado?c=Lanzamientos&pidx=55) |
| Hyundai | Equus (VI) | 1 | Modelo retirado | [Principal](https://www.hyundai.com/worldwide/en/footer/corporate/vehicle-history/1990/centennial); [Complementaria](https://noticias.autocosmos.cl/2015/05/26/hyundai-equus-2015-llega-a-chile-el-renovado-sedan-premium-de-la-marca) |
| Renault | Zoe (original) | 1 | Modelo retirado | [Principal](https://www.autocar.co.uk/car-news/new-cars/renault-zoe-taken-sale-uk-after-11-years); [Complementaria](https://noticias.autocosmos.cl/2016/10/05/renault-zoe-2017-ahora-con-mayor-autonomia) |
| Renault | Fluence | 5 | Modelo retirado | [Principal](https://www.sernac.cl/portal/618/w3-article-5168.html); [Complementaria](https://noticias.autocosmos.cl/2015/02/23/nuevo-renault-fluence-version-2015-ya-esta-en-chile) |
| Mitsubishi | Lancer (sedán original) | 3 | Modelo retirado | [Principal](https://www.mitsubishicars.com/lancer-history); [Complementaria](https://mitsubishi-motors.cl/sobre-nosotros/) |

## Reglas de concordancia y límites

- **Nissan Navara**: 27 códigos del chasis D23, aun cuando sus nombres comienzan con `Navara (D23)`, `NP300 NAVARA (D23)` o `NP300 (D23)`. Su comercialización como vehículo nuevo se interrumpió en Chile en noviembre de 2025. El nuevo Frontier Pro/Navara Pro anunciado regionalmente en octubre de 2026 queda **excluido** de esa clasificación.
- **Nissan Juke**: seis registros chilenos de la primera generación F15; la segunda generación continuó vendiéndose en Europa, sin arribar a Chile. No se clasifica como extinto el nombre global ni su próxima variante eléctrica.
- **Mazda6 GJ**: 13 fichas, con las grafías `Mazda6` y `Mazda 6`. La última entrega de una edición especial a clientes chilenos fue en enero de 2025 según el representante local. No se etiqueta el nuevo `Mazda 6e` ni `EZ-6` anunciado para otros mercados.
- **Fiat Punto/Grande Punto**: siete fichas del Punto de producción finalizada en Melfi en agosto de 2018, según Stellantis, y comercializado en Chile. La etiqueta no alcanza a Fiat 500 ni a los vehículos de fabricación actual.
- **Fiat Bravo**: tres fichas, acreditada introducción comercial en Chile en 2008; su ciclo industrial europeo terminó en 2014 y el brasileño en 2016. Se distingue de Fiat Brava.
- **Hyundai Equus**: una ficha del sedán VI; el propio fabricante vincula Equus/Centennial con su sucesor Genesis G90. No se etiqueta a Genesis como retirada.
- **Renault Zoe**: una ficha y antecedentes de venta oficial en Chile; modelo eléctrico fuera de producción desde 2024. Renault 5 E-Tech queda protegido.
- **Renault Fluence**: cinco fichas y comercialización chilena confirmada oficialmente por SERNAC en 2015-2016; no es sinónimo de Mégane sedán. El cese de su fabricación no es una fecha acreditada de fin de existencias chilenas.
- **Mitsubishi Lancer**: tres fichas del sedán de combustión, con fin de fabricación documentado por Mitsubishi para la mayoría de mercados en 2017. Las versiones Grand Lancer de otros países no se infieren como vendidas en Chile.

## Mejoras técnicas desplegables

Nueva regla `model-prefix-list-cutoff`, que exige **marca coincidente + uno de varios prefijos explícitos + fecha de homologación anterior al umbral**. El triaje ahora reconoce los modelos que incluyen la marca en `modelo` y los que sólo informan la familia, de forma coherente con el buscador. Reglas de prueba separan generaciones históricas de Navara Pro, Mazda 6e y Juke eléctrico.

Los **66** registros son códigos 3CV vinculados a estos nueve casos, no modelos nuevos ni referencias de precios. El fin de fabricación no implica automáticamente la inexistencia de vehículos 0 km en inventario remanente. Las fichas originales del Ministerio de Transportes, los 1.504 precios comerciales y las homologaciones de octubre no se modificaron.

## Casos excluidos temporalmente

Se conservan fuera del directorio general: **Chevrolet Spin**, aún fabricado para otros mercados; **Hyundai Sonata**, con desarrollo generacional activo fuera de Chile; **Fiat 500X**, confirmado aún en la oferta europea durante 2024; **Mitsubishi Mirage**, cuyo comunicado de fin de producción aplica expresamente al mercado estadounidense y no acredita por sí solo su retiro nacional; y **Peugeot 301**, con evidencia de producción europea al menos hasta 2022 sin fecha chilena de retiro suficientemente contrastada.
