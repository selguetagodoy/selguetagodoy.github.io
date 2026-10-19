# RINDELAB — Simplificación de portada y contenidos técnicos

## Objetivo

Corregir la saturación informativa en la página principal. El buscador y la comparación deben ser la primera tarea; los ajustes de tarifas, la calculadora de boleta, los pliegos BT1 y la metodología son funciones de apoyo.

## Cambios

1. `index.html` presenta el buscador, resumen compacto del escenario y un acceso a **Personalizar costos**, inicialmente cerrado. Al abrirlo, muestra cuatro parámetros básicos: kilometraje anual, precio de bencina, precio de diésel y escenario de carga eléctrica.
2. Las tarifas públicas, valor de carga domiciliaria, mezclas, tarifa efectiva, calculadora de boleta, ejemplo de recarga, directorio BT1 y notas técnicas se encuentran dentro de **Tarifas de recarga y opciones avanzadas**. El panel se abre automáticamente al elegir carga domiciliaria o mixta para que el usuario no pierda el campo necesario.
3. Toda la metodología y las fuentes se trasladaron íntegramente a `metodologia.html`, con acceso desde menú principal, menú móvil y una reseña corta en la portada. No se han eliminado fuentes, advertencias ni fórmulas.
4. `#supuestos` sigue funcionando como enlace directo: al entrar desde otra página se abre el bloque correspondiente.
5. Se conservan los identificadores y los scripts del motor de costos. No se modifican bases 3CV, API, SII, tarifas ni precios de lista. La lógica de PHEV y REEV permanece intacta.
6. Se incorporó `tests/v2-claridad.cjs` a GitHub Actions y se ajustaron las regresiones existentes para probar controles avanzados en abierto sin forzar a que el usuario los vea al ingresar.

## Qué cambia para el visitante

**Antes:** escenario de carga, tarifa pública por potencia y horario, calculadora domiciliaria, directorio BT1 y metodología competían por espacio en la misma pantalla.

**Ahora:** búsqueda y comparación primero. Un ajuste rápido y una página independiente de fuentes quedan disponibles cuando el visitante los requiera.

## QA local, previo a publicar

- 155 pruebas funcionales de regresión aprobadas; 0 fallas.
- 10 pruebas visuales V2 aprobadas; 0 fallas.
- 23 pruebas de fotografía y páginas secundarias aprobadas; 0 fallas.
- 6 pruebas de simplificación aprobadas; 0 fallas.
- La portada se comprobó en 320, 390, 768 y 1440 píxeles y la documentación permaneció accesible.
- La verificación de GitHub Actions deberá aprobar sobre el commit final antes de declarar terminada la publicación.

## Capturas

[Portada en escritorio](qa-v2/claridad-1440.jpg) · [Portada en móvil](qa-v2/claridad-390.jpg) · [Ajustes básicos](qa-v2/claridad-ajustes-1440.jpg) · [Metodología independiente](qa-v2/claridad-metodologia.jpg)

## Vigencia y fuentes

Los precios de energía que aparecen por defecto son supuestos, no datos nacionales vigentes ni tarifas garantizadas. Las advertencias técnicas y referencias oficiales están disponibles en la página metodológica y en los ajustes avanzados.
