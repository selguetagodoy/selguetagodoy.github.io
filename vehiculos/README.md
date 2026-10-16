# Observatorio de Eficiencia Vehicular de Chile

Visualizador estático de homologaciones vehiculares chilenas basado en la base 3CV publicada por el Ministerio de Energía. Disponible en `/vehiculos/` una vez incorporada la rama al sitio GitHub Pages.

## Base, límites y trazabilidad

- Fuente primaria: https://consumovehicular.minenergia.cl/sites/default/files/middleware/RENDIMIENTOOFICIAL08may2026.xlsx
- Corte de la base: **8 de mayo de 2026**. Archivo dividido en 9 partes JSON para una carga rápida en navegador.
- 8.056 filas con marca y modelo dentro de la extracción, de las cuales **8.053** presentan fecha de homologación hasta la fecha de publicación; tres registros posteriores se excluyen en la interfaz por consistencia temporal.
- Los datos son *homologaciones históricas*, **no** un inventario de vehículos nuevos actualmente a la venta. Una versión homologada no implica disponibilidad comercial ni precio vigente.
- La categorización Bencina/Diésel/MHEV/HEV/PHEV/REEV/EV se construye con la columna de propulsión, combustible y palabras identificables del nombre del modelo; clasificaciones poco claras requieren verificación manual.
- Se conserva código de homologación 3CV, fecha de homologación, ciclo, categoría de vehículo, potencia de batería cuando está disponible y atributos relevantes.
- NEDC y WLTP no son intercambiables; la interfaz muestra ciclo de cada ficha y filtra WLTP por defecto.

## Cálculo de costo energético

- Vehículos a bencina y diésel, incluyendo MHEV/HEV: `100 ÷ rendimiento_mixto_km_l × precio_litro`.
- EV: `100 ÷ rendimiento_electrico_km_kWh × precio_kWh × (1 + supuesto_pérdidas)`.
- PHEV/REEV: costos **separados** de electricidad y combustible según los dos rendimientos disponibles, nunca sumados sin un patrón de uso medido.
- Valores editables precargados como escenario de referencia: bencina 93 ($1.535/L), 95 ($1.572/L), 97 ($1.613/L); diésel ($1.503/L), AC ($340/kWh), DC ($495/kWh). No son precios actualizados en tiempo real.
- **Advertencia:** el consumo de combustible publicado para PHEV/REEV no significa necesariamente que la prueba se realizara con batería totalmente descargada. La diferencia entre conducción eléctrica y térmica real depende del ciclo, las condiciones y el patrón de recarga.
- Las pérdidas de recarga se consideran como un supuesto de sensibilidad entre 0 y 20%, no una observación por modelo.
- AC/DC es una tarifa de simulación; el equipamiento del vehículo puede no admitir carga DC.
- El costo energético no incluye compra, depreciación, seguro, permiso de circulación, estacionamiento, mantención, peajes ni rendimiento real observado.

## Uso

Abrir `index.html` mediante un servidor HTTP local o GitHub Pages; la interfaz requiere `fetch` de `data/manifest.json` y partes JSON. Filtrar por nombre, tecnología, marca, carrocería, fecha de homologación y ciclo. Permite comparar hasta 4 versiones, revisar ficha, descargar CSV con filtros y ordenar costos. CSV protege contra inyección de fórmulas.

## Estructura

- `index.html` — interfaz, visualizaciones, simulador y comparador sin librerías externas.
- `data/manifest.json` — fecha de corte, campos y lista de archivos.
- `data/vehiculos_01.json` … `vehiculos_09.json` — fichas 3CV en formato compacto, preservando código de homologación.

## Próxima etapa

Para convertirlo en catálogo de **oferta comercial actual** es indispensable cruzar cada versión con catálogos de fabricantes y concesionarios, mantener fecha de observación y marcar disponibilidad confirmada, sin extrapolar a partir de una homologación histórica. Se recomienda actualización periódica del 3CV y controles de calidad sobre registros inconsistentes.

Autor: Sebastián Elgueta Godoy. Proyecto de análisis independiente basado en información pública.
