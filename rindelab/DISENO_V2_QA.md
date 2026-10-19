# RINDELAB V2 — Registro de implementación y controles

**Fecha:** 18 de octubre de 2026
**Rama de trabajo:** `design/rindelab-v2-premium-20261018`
**Ámbito:** exclusivamente `/rindelab/`. La web publicada permanece sin cambios hasta integrar la propuesta.

## Protección y auditoría inicial (Fase 0)

- Se tomó como base el commit `ce41d85` y se creó una rama de trabajo independiente.
- Se conservaron las bases oficiales 3CV, la integración de los 272 registros adicionales de octubre, la nómina MTT y los recursos de precios comerciales y SII.
- La aplicación identifica 8.325 fichas energéticas al corte de la versión base (8.053 de la planilla histórica y 272 adicionales de la consulta oficial).
- No se reescribieron los cálculos de energía, la clasificación tecnológica, los supuestos de tarifas ni las estructuras de datos.
- Se mantuvo la fotografía existente `hero-foto-rindelab.webp`, de 450 × 253 píxeles, sin sustituirla por una ilustración generada.

## Rediseño aplicado

**Fase 1 — Cabecera, portada y buscador.** Se reorganizó la navegación en Inicio, Comparar, Rankings y Fuentes, manteniendo acceso a Cotizador y Marcas. La portada prioriza una pregunta comprensible, la fotografía conservada y un buscador visible. Se incorporaron filtros rápidos funcionales para vehículos eléctricos, híbridos HEV, híbridos enchufables PHEV, bencina y diésel; las categorías MHEV y REEV continúan disponibles en el selector completo.

**Fase 2 — Fichas de resultados.** La presentación es de tres columnas en escritorio, dos en tablet y una en móvil. El gasto energético mensual estimado tiene protagonismo, seguido del anual, costo cada 100 km, rendimiento homologado, ciclo y fuente. Se mantuvieron los botones de ficha y comparación. Cuando no existe una fotografía específica verificada, se muestra un recurso neutral que declara expresamente la ausencia de imagen, sin atribuir fotografías de modelos o versiones incorrectos.

**Fase 3 — Comparador.** Se conservaron todas las funciones de selección, incorporación y retiro de hasta cinco vehículos, así como la comparación y el cambio de referencia. Se homogeneizaron elementos visuales sin modificar los cálculos ni mezclar ciclos como equivalentes.

**Fase 4 — Escenarios.** Se conservó íntegramente la configuración energética editable, con precios, carga pública y domiciliaria, calculadora de boletas y parámetros existentes. Las modificaciones del escenario se reflejan en las cifras mensuales y anuales de las tarjetas.

**Fase 5 — Rankings.** Se armonizaron tipografía, barras, contrastes y navegación a estadísticas, conservando las reglas metodológicas y los filtros por categoría/ciclo.

**Fase 6 — Verificación.** Se mantuvo el conjunto de regresión `tests/e2e.cjs` actualizando únicamente las expectativas de texto/navegación que cambiaron en V2. Se añadió `tests/v2-visual.cjs` para validar la nueva capa visual en siete anchos, la disponibilidad de la portada, las fichas monetarias y la sincronización de filtros rápidos.

## Decisiones de seguridad y rigor

1. No se incorporaron fotografías comerciales de terceros sin verificar modelo, autorización o licencia.
2. No se presentaron ahorros ficticios ni se completaron datos faltantes con cero.
3. Las cifras son estimaciones con tarifas editables; no representan costos de propiedad ni precios energéticos vigentes garantizados.
4. Las fichas WLTP/NEDC se identifican sin declarar comparabilidad directa.
5. Los valores PHEV/REEV siguen respetando las limitaciones del conjunto 3CV original.

## Pendientes antes de considerar finalizada toda la visión V2

- Crear una biblioteca verificable de fotografías por modelo/generación, con licencias y autoría trazables.
- Simplificar progresivamente la sección avanzada de escenarios sin ocultar capacidades esenciales.
- Completar la reorganización visual profunda de todos los submódulos y páginas secundarias.
- Evaluar accesibilidad y rendimiento de la versión candidata en dispositivos reales, además de las pruebas automatizadas.

**Política de publicación:** presentar como pull request para revisión; no fusionar automáticamente a `main` ni afirmar que las fotografías faltantes están resueltas.
