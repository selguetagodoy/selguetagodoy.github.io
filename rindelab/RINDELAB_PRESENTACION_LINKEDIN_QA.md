# RINDELAB — Auditoría final de portada y preparación para LinkedIn

**Alcance:** contenido visible de la página principal, navegación, fichas y presentación de enlaces; sin alteración de datos ni fórmulas energéticas.

## Residuos eliminados

| Antes | Corrección |
| --- | --- |
| Bloque «Datos oficiales, cálculos transparentes» y recuento de 8.325 fichas repetido al final | Eliminado visualmente. El contador técnico `#recordCount` se conserva oculto para mantener la carga y sus validaciones |
| Recuadro «Personalizar costos» separado de «Ajustar costos» | Se muestra solo un acceso a ajustes. El editor aparece cuando la persona lo solicita |
| Tres precios iniciales expuestos en la barra de escenario | Barra resumida a kilómetros, tipo de carga y aviso «precios editables» |
| Hero con etiqueta introductoria y segunda línea institucional | Eliminados; se conserva un único párrafo explicativo |
| Encabezado del buscador con explicación redundante | Eliminado; el buscador empieza directamente por filtros y vehículo |
| Campo «Tipo de motor» duplicado con los filtros rápidos | Trasladado a «Más filtros», donde permanecen HEV, MHEV, PHEV y REEV, sin perder categorías |
| Navegación con «Inicio» y «Comparar» llevando a lo mismo | Fusionada en «Buscar» y cinco destinos con nombres claros |
| Leyenda de resultados excesivamente extensa | Presentada como «Sobre estos resultados» desplegable; se preserva la explicación al abrir |
| Párrafo largo bajo «Fichas energéticas 3CV» | Eliminado; las fuentes siguen en las fichas y en metodología |
| Pie con mensaje redundante «Chequea la información…» | Consolidado a autor, metodología, contacto y «Más recursos» |
| Enlace compartido con fotografía de 450 × 253 px | Imagen exclusiva de vista previa en 1200 × 630 px, referencia gráfica coherente con la web y metadatos Open Graph |

## Qué se mantiene

Búsqueda, filtros de motor completo (incluidos PHEV/REEV), comparación de hasta cinco vehículos, fotografías referenciales verificables y atribuidas, cálculos de gasto con tarifa editable, documentos 3CV y MTT, consulta SII, rankings, cotizador, métodos de carga domiciliaria/pública/mixta y acceso integral a `metodologia.html`.

**Transparencia:** el recuento 8.325 sigue siendo un dato reproducible de la base de mayo/octubre 2026, aunque ya no ocupa espacio en la portada. La nueva tarjeta para redes no promete ahorro monetario ni afirma que las fotografías correspondan a una versión comercial exacta.

## Imágenes de presentación

- Vista previa para publicaciones: [linkedin-preview.png](linkedin-preview.png), PNG de **1200 × 630**.
- Capturas de la portada: [escritorio](qa-v2/claridad-1440.jpg) y [celular](qa-v2/claridad-390.jpg).
- Fichas de vehículos: [resultados en escritorio](qa-v2/resultados-1440.jpg).
- Fuentes: [metodologia.html](metodologia.html).

## QA

- Se agregó `tests/v2-showcase.cjs` a GitHub Actions para bloquear futuras regresiones de contenido redundante, tamaño de la tarjeta social, enlaces de fuentes, accesibilidad de motores menos frecuentes y overflow en 320/390/768/1440 px.
- Las 6 comprobaciones específicas de claridad, 6 de presentación social, 10 de diseño y 23 de submódulos han aprobado en la rama local.
- La regresión completa se verificará nuevamente en GitHub Actions antes de fusionar y desplegar.

**Publicación:** compartir la URL canónica `https://selguetagodoy.github.io/rindelab/` sin parámetros de seguimiento obligatorios. La previsualización de LinkedIn depende de la caché del servicio y no puede garantizarse hasta que su rastreador vuelva a leer los metadatos.
