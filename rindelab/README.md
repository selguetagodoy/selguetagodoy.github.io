# RINDELAB · Con las alzas, cada peso cuenta

**RINDELAB v6** es un buscador independiente de vehículos homologados en Chile, creado por **Sebastián Elgueta Godoy**.

Web pública: https://selguetagodoy.github.io/rindelab/

## Flujo principal

1. Escribir marca o modelo, o seleccionar **Marca → Modelo → Motorización**.
2. Pulsar **Buscar vehículos**. Los resultados no aparecen ni cambian antes del clic.
3. Ordenar la lista por **homologación más reciente**, **menor costo estimado**, **mayor costo estimado** o **marca y modelo**.
4. Elegir **Ver ficha** para revisar los datos 3CV o pulsar **Comparar +** para seleccionar **entre dos y cinco vehículos**. La bandeja conserva modelos al hacer una nueva búsqueda, incluso al usar «Limpiar» (que solo restablece filtros).
5. Desde la bandeja o la ventana de comparación, utilizar **«+ Agregar otro»** para buscar otra marca o modelo. Cada vehículo puede retirarse individualmente con «×», sin vaciar la lista. Con cinco modelos se puede reemplazar uno quitándolo primero.
6. Pulsar **«Comparar N vehículos»** para abrir la tabla lateral. En pantallas estrechas se desplaza horizontalmente con el dedo o las flechas; cuando caben todas las columnas no se muestran controles de desplazamiento.
7. Ampliar los **Filtros técnicos adicionales** cuando se requiera ciclo, fecha o carrocería.
8. Consultar la metodología o editar los precios referenciales en **Metodología y fuentes**.

La interfaz principal no incluye contadores de marcas, rankings de extremos, simuladores híbridos independientes, banners educativos ni comparador vacío. Tiene un único formulario, resultados y comparación opcional.

## Fuente, datos y límites

La base emplea el registro oficial 3CV publicado por el Ministerio de Energía con corte declarado **8 de mayo de 2026**. El manifiesto contiene **8.056 registros** y la aplicación utiliza **8.053** con fecha igual o anterior al corte. No se modifica el archivo de origen. Es una base de homologaciones históricas, no de vehículos disponibles actualmente para venta.

- El orden por costo utiliza supuestos iniciales editables: bencina 93 CLP 1.535/L, diésel CLP 1.503/L y electricidad CLP 340/kWh. No son precios en tiempo real ni especifican el octanaje exigido por el fabricante.
- Combustible: **100 ÷ rendimiento mixto km/L × precio CLP/L**. Eléctrico: **100 ÷ rendimiento km/kWh × tarifa CLP/kWh**, sin pérdidas de carga ni cobros adicionales.
- Los resultados y rankings muestran **NEDC y WLTP en una sola lista** de menor a mayor o mayor a menor costo, con el ciclo visible en cada ficha. Este orden conjunto es **orientativo**, ya que ambos procedimientos de ensayo no son directamente equivalentes. Se puede filtrar por ciclo cuando se requiera una comparación más homogénea.
- Para PHEV/REEV se muestran los rendimientos homologados eléctricos y ponderados; **no se calcula costo energético combinado** a partir de esos valores. No se generan categorías híbridas inferidas.
- La ficha conserva marca y motorización **de origen** separadas de los ajustes interpretativos para navegación.
- Para validación final consultar https://consumovehicular.minenergia.cl/sites/default/files/middleware/RENDIMIENTOOFICIAL08may2026.xlsx

## Auditoría de fichas y comparación de enchufables

Tras habilitar las estadísticas, se corrigió otra incoherencia: los resultados PHEV/REEV ofrecían ordenar por **menor o mayor costo energético** aun cuando ningún registro del filtro tenía un costo combinado calculable. Estas opciones se deshabilitan cuando todos los resultados carecen de costo estimable y se muestra una explicación visible; siguen funcionando para los filtros con costos calculables.

En la lista y las fichas se diferencian explícitamente el **rendimiento eléctrico informado (km/kWh)** y el **rendimiento ponderado informado (km/L)**. La matriz comparativa de hasta cinco vehículos incluye filas específicas para ambas medidas cuando al menos uno es PHEV o REEV, dejando «No aplica» cuando la motorización no corresponde. No se interpreta el campo eléctrico de la fuente como «ponderado km/kWh», ni se presenta el rendimiento ponderado de combustible como consumo con batería descargada.

## Ajuste PHEV y REEV — estadísticas con datos homologados

El registro base 3CV al corte visible incluye **232 fichas PHEV** y **8 REEV**, todas con el campo eléctrico (km/kWh) y el ponderado (km/L) informado. Esas fichas **no deben desaparecer** del apartado de estadísticas porque no se calcule un costo de energía combinado.

Al seleccionar **PHEV** o **REEV**, la medida se ajusta explícitamente a «Rendimiento eléctrico informado (km/kWh)». El usuario puede seleccionar alternativamente «Rendimiento ponderado informado (km/L)» y ordenar ascendente/descendente, filtrando por ciclo y carrocería. El top 10 muestra el número real de fichas elegibles; REEV muestra ocho cuando no hay otros filtros. Cada vehículo se vincula a su ficha 3CV. NEDC y WLTP se identifican individualmente y no se equiparan sus resultados.

**Se mantiene deshabilitado el ranking de costo combinado para PHEV y REEV**, porque los datos ponderados no bastan para asignar un costo energético de 100 km sin supuestos adicionales sobre electricidad, combustible y perfil de uso. Tampoco se convierten km/kWh en km/L.

**Se retira «Híbrido por verificar» del selector público.** La categoría era una inferencia de la web basada en palabras como Hybrid, y no una clasificación registrada como tal por el 3CV. No se modificarán las tecnologías declaradas en el archivo original ni se reclasificarán automáticamente. Si el nombre comercial sugiere híbrido pero el registro declara Bencina, la ficha deja constancia de la diferencia sin asignar MHEV/HEV.

## Renovación visual y ventana de estadísticas (v7)

La portada incorpora la ilustración original de vehículos y cordillera (`hero-rindelab.svg`), un tratamiento visual más trabajado y un acceso a **Ver rankings y estadísticas**. Se conserva **una sola búsqueda** y la lista de resultados aparece únicamente al pulsar «Buscar». Las fichas de resultados tienen una jerarquía visual más clara, sin añadir cifras no respaldadas.

Las estadísticas se muestran en un **diálogo independiente y accesible**, no en el flujo principal. Permiten consultar **top 10** con controles dinámicos de:
- Métrica: costo energético estimado en CLP/100 km o rendimiento homologado.
- Orden: menor a mayor y mayor a menor.
- Motorización: bencina, diésel, MHEV, HEV, PHEV, REEV, EV u otras categorías según fuente.
- Carrocería: SUV/Station Wagon, sedán, hatchback, camioneta, coupé, furgón o bus.
- Ciclo: **Todos (WLTP + NEDC) por defecto**, o bien solo WLTP o solo NEDC. Cada posición del top 10 señala su ciclo mediante una etiqueta visible.

Los rankings están calculados a partir de las fichas reales que cumplen los filtros; cada fila permite abrir la ficha técnica. Los costos de PHEV y REEV sin valores comparables no se modelan ni sustituyen con proxies. Para rendimiento es necesario seleccionar una motorización con unidades homogéneas (km/L o km/kWh). Sin filas elegibles, el panel informa la limitación en vez de inventar valores. Las tarifas son las mismas que utiliza el buscador y pueden editarse en «Metodología y fuentes».

## Estructura

- `rindelab/index.html`: buscador, resultados, diálogos y metodología.
- `rindelab/v6.js`: carga oficial, búsqueda explícita, filtros dependientes, costo, ordenamiento y comparación.
- `rindelab/v6.css`: sistema visual responsive.
- `rindelab/tests/e2e.cjs`: pruebas E2E con Playwright Chromium; incluye 320, 390, 768 y 1.440 px.
- `.github/workflows/rindelab-ui-e2e.yml`: CI de Playwright en pull requests y main.

Para pruebas locales servir la raíz del repositorio en puerto 8765, instalar Playwright y ejecutar `node rindelab/tests/e2e.cjs`. La verificación de datos y tarifas no sustituye la documentación 3CV.
