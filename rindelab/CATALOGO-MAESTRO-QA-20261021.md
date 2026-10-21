# RINDELAB — corrección de asociación comercial y búsqueda (21-10-2026)

## Alcance

Se mantiene el origen oficial 3CV como registro de homologaciones y **no** se deduce vigencia comercial de una homologación. La capa de precios contiene 1.504 referencias extraídas de fuentes publicadas, distribuidas en 80 marcas y 716 denominaciones de familia. No se les atribuye el mismo significado que a una versión homologada.

## Identidad y asociación

- `sii/catalog-identity.js` normaliza marca y familia en un índice de consulta. Conserva separadas Corolla/Corolla Cross, Tiggo 2 Pro/Pro Max y las tecnologías EV, HEV, PHEV y REEV.
- El precio de tarjeta **jamás** se asigna automáticamente desde otra tecnología identificada. Un precio de la misma tecnología se etiqueta como *familia, versión sin verificar*. La tecnología no informada se etiqueta explícitamente como no verificada.
- Las versiones de precio se siguen seleccionando de forma manual en la ficha, con fuente directa y condiciones. El cálculo de recuperación energética no utiliza campañas expiradas como referencia segura.
- Las campañas documentadas terminadas no desaparecen de la historia de precios, pero se posponen al elegir un mínimo cuando hay alternativas con fecha de término posterior. Si todas terminaron, se informa la situación.

## Cobertura

El filtro inicial ofrece **modelos con referencia comercial registrada**, no «todos los modelos nuevos del país» ni «oferta vigente garantizada». El segundo filtro muestra el registro histórico completo 3CV. Las homologaciones de generaciones descontinuadas identificadas se conservan solo en la vista histórica y no se confunden con el sucesor.

El selector de años se genera a partir de los años que constan en la base; ya no tiene saltos predefinidos.

## Ranking, imágenes y QA

- Se bloquea la proyección monetaria del registro BMW `BM9746EL1224S00-3`, pendiente de revisión documental, y se lo excluye de los rankings de extremos, manteniéndolo consultable.
- Se conservaron las 200 referencias fotográficas (4 originales más 196 en `images/commons`). Se comprobaron los 196 archivos que tienen ruta local en el lote, sin afirmar que fotografían la versión comercial exacta.
- `tests/catalog-identity.cjs` verifica asociaciones de tecnología, campañas terminadas y existencia de fotos. `tests/catalog-ui.cjs` verifica la nueva cobertura desde Chromium.
- CI añade ambos controles. Para revisar localmente: `node rindelab/tests/catalog-identity.cjs` y, con servidor en la raíz del repositorio, `node rindelab/tests/catalog-ui.cjs`.

## Límites y próxima actualización

Esto no crea una API viva del Ministerio ni renueva precios automáticamente: los datos siguen sujetos a sus cortes y fuentes originales. El flujo de ingreso en lotes Markdown y los controles de importación existentes se mantienen. Las familias sin precio o con tecnología insuficiente requieren contrastar fuentes antes de presentarse como equivalentes homologados. No modificar rendimientos oficiales, ni generar costos PHEV/REEV a partir de consumos ponderados no equiparables.
