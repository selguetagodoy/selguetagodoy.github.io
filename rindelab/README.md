# RINDELAB · Con las alzas, cada peso cuenta

**RINDELAB** es la interfaz de análisis de costos de energía vehicular y rendimientos homologados en Chile, creada por Sebastián Elgueta Godoy.

## Abrir sitio

La interfaz principal es `/rindelab/index.html`; al publicar el repositorio con GitHub Pages queda disponible en:

https://selguetagodoy.github.io/rindelab/

El visualizador usa la misma base de datos en `../vehiculos/data/` para evitar duplicar las 9 particiones de datos. **Ambas carpetas deben existir juntas en la rama publicada.**

## Identidad

- Marca: **RINDELAB**.
- Propuesta editorial: *Inteligencia vehicular basada en datos*.
- Eslogan: *Con las alzas, cada peso cuenta*.
- Advertencia: *Chequea la información en los sitios oficiales*.
- Firma: *Creada por Sebastián Elgueta Godoy*.
- Contacto: e.elguetagodoy@gmail.com.
- Azul petróleo `#0a2138`, turquesa `#23d9d2`, blanco `#ffffff`.

## Datos y metodología

Registros de homologación 3CV del Ministerio de Energía, base publicada el 8 de mayo de 2026. No implican disponibilidad comercial en octubre de 2026. Se conserva ciclo NEDC o WLTP, la fecha, la homologación por código y las distintas motorizaciones.

**Cálculos:** combustible `100 / km/L × precio/L`; electricidad `100 / km/kWh × precio/kWh × (1 + porcentaje de pérdidas asumidas)`. Para enchufables, PHEV y REEV muestran por separado los costos eléctricos y de combustible declarados. Los resultados representan escenarios comparativos, no promesas de costo real.

Precios iniciales editables: bencina 93 ($1.535/L), 95 ($1.572/L), 97 ($1.613/L), diésel ($1.503/L), AC ($340/kWh), DC ($495/kWh), con corte de referencia 16 de octubre de 2026.

## Componentes

- `index.html`: portal responsivo, portada, catálogo, comparador, costo por 100 km, tabla y CSV.
- `hero-rindelab.svg`: ilustración vectorial original del paisaje urbano chileno y vehículos.
- `favicon.svg`: identidad abreviada RINDELAB.
- `../vehiculos/data/manifest.json`: fecha de corte y estructura de datos.
- `../vehiculos/data/vehiculos_01.json` a `vehiculos_09.json`: fichas homologadas.

## Estado

El código de front-end ha superado validación sintáctica de JavaScript y referencia todos los IDs críticos de interfaz. La verificación en navegador y el despliegue final en Pages son pasos adicionales. Cualquier ranking que combine tecnologías o ciclos requiere lectura de sus advertencias metodológicas.

Proyecto independiente, sin patrocinio ni afiliación oficial con las marcas.
