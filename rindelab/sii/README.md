## Referencia fiscal SII 2026: tasación y permiso
RINDELAB incorpora la nómina **LIV2026** del SII, descargada desde
https://www.sii.cl/servicios_online/tasacion_fiscal_vehiculos/liv2026.xlsx
en octubre de 2026 (planilla que indica Resolución Exenta SII N° 96 del 21/07/2026).
Su extracción reproducible contiene **81.697 códigos SII/años** y 264 marcas.
No se modifica la información fuente del 3CV.

**Cómo usar:** abrir «Ver ficha» → «Consultar tasación y permiso» → seleccionar marca, **año de fabricación** y texto de modelo/versión → «Buscar en tasaciones SII» → **elegir expresamente** el registro pertinente (incluye código SII, versión, tasación y permiso).
El código SII es distinto del código 3CV. La selección se almacena en el navegador para esa ficha 3CV y se incorpora al comparador. Se puede quitar en cualquier momento. Una homologación puede cubrir varios años y versiones SII, por lo que **nunca** se asigna automáticamente una tasación al vehículo.

El monto del **permiso de circulación** es la cifra publicada en la base SII 2026 para esa combinación SII/año. No representa necesariamente el cobro concreto realizado por una municipalidad ni habilita a calcular un valor para nuevos sin uso a partir de una ficha de homologación. La **tasación fiscal** no es el precio real de compraventa de un usado.

**Alcance temporal:** se trata de los valores de tasación y permisos **2026**. Los vehículos de fabricación 2026 o posteriores que no aparecen en la nómina necesitan consulta individual o factura; no se inventa un registro. Cualquier serie histórica fiscal requiere descargar por separado las nóminas de otros años tributarios.

**Precios de lista nuevos:** primera entrega de **114 precios de lista por versión**, de Toyota, Hyundai, Kia, Suzuki, MG, Changan, Ford, Mazda y Subaru, consultados el 17/10/2026. En esta ampliación se agregan 11 versiones Hyundai (Tucson, Venue, Creta Grand y Kona EV) con enlaces a las tablas de precio de lista; también se conserva la auditoría previa de Kia Morning y las correcciones de precios Toyota. Se excluye temporalmente la Hilux 4x2 2.4 MT SR Diesel porque la tienda Toyota publica precios de lista discrepantes para esa combinación (entre $34.790.000 y $35.290.000); no se elige una cifra sin reconciliar las publicaciones. Se añaden las cinco versiones Kia Morning con precios oficiales separados de los bonos. Fuente, versión, año de modelo cuando se explicita y precio base sin bonos se registran en `rindelab/sii/commercial-2026.json`. La ampliación del 17/10/2026 incorpora **27 precios de lista nuevos** de Suzuki (Swift, Fronx, Jimny y Celerio) y MG (MG3, MG3 Hybrid+, ZS y MGS5 EV), con enlaces directos al fabricante y sin usar precios «desde» que incluyen promociones. Los años de modelo se indican únicamente cuando constan en las fuentes; los nuevos registros incorporados sin año explícito quedan con `modelYear: null`. Además, la ampliación Changan incorpora **21 precios de lista** para CS35 Max, Hunter, X7 Plus, CS55 Plus, CS75 Plus, Deepal S07 y AVATR 07, publicados en `changan.cl` con la distinción expresa entre precio de lista y bonos. La familia Hunter diésel se mantiene separada de Hunter REEV, y las referencias Deepal/AVATR se consultan bajo la marca registrada Changan en 3CV sin modificar el archivo original. **La revisión semanal por GitHub Actions** ejecuta `scripts/audit-price-sources.cjs` para detectar duplicados, errores estructurales, enlaces inaccesibles y fechas de consulta de 30 días o más. Esta auditoría **no confirma automáticamente que el importe siga vigente**; cada diferencia debe validarse manualmente antes de actualizar los valores. La ampliación del 17/10/2026 agrega **22 precios de lista adicionales**, de Mazda (12: CX-3, CX-5, CX-30; versiones 2027 cuando lo señala la marca) y Subaru (10: Crosstrek, Forester y Outback). Los importes se extraen del campo oficial «Precio Lista», no del «Precio desde» ni del «Precio de campaña». Para Subaru Outback no se atribuye año comercial al no figurar en la ficha consultada. El precio nuevo requiere siempre selección manual y los cargos como impuesto verde, cuando corresponden, no están necesariamente incluidos. La ampliación Ford del 17/10/2026 incorpora **8 precios oficiales de lista o sugeridos**, separados de condiciones con financiamiento, para Territory (Trend, Titanium, Titanium Híbrida y Platinum Híbrida) y Maverick (XLT, Lariat Black, Lariat FHEV y Tremor). Los importes provienen de `ford.cl` e incluyen IVA; Ford documenta para Territory condiciones comerciales de octubre de 2026. La selección sigue siendo manual y no se supone que una homologación más antigua identifique la misma generación. **La cobertura es parcial**, no implica que todas las 8.053 homologaciones 3CV sigan a la venta. Las versiones cuyos valores no están documentados muestran un mensaje de falta de dato.

En cada ficha, el usuario revisa los candidatos por marca/familia y **elige expresamente la versión comercial**; solo entonces se incorpora ese precio al comparador. Se puede retirar la selección. Los precios de lista no incluyen descuentos financieros, bonificaciones comerciales ni cargos adicionales cuando se cobran aparte; son una fotografía documental que puede perder vigencia y debe contrastarse con la página original. No se calculan precios de lista a partir de tasaciones del SII ni se interpretan como precio de reventa.

**Fuente y trazabilidad:** `rindelab/sii/data/index.json` expone campos, SHA-256 del Excel oficial, fecha y número de registros; los 26 archivos de datos se separan por la inicial de marca para carga diferida. El Excel de origen contiene 81.697 registros con valores no vacíos y 0 descartados bajo las reglas de exportación.
El código de extracción en `scripts/build-sii-2026.cjs` necesita `exceljs`. Para volver a generarlo:

```bash
npm install --no-save exceljs
node scripts/build-sii-2026.cjs ruta/al/liv2026.xlsx
```

Regla editorial: nunca comparar como equivalentes tasación fiscal, permiso de circulación, precio de lista, precio promocional y valor comercial de reventa.

## Control semanal de vigencia comercial

La revisión automática corre los **lunes a las 12:15 UTC** y también puede iniciarse manualmente desde **GitHub Actions → RINDELAB — vigencia de precios de lista → Run workflow**. La ejecución:

- Evalúa registros duplicados, validez de precio/versión, dominios oficiales, antigüedad de `checkedAt` y estado HTTP de cada enlace oficial único.
- Deja el JSON **`price-audit.json`** como artefacto descargable por 90 días, con conteos por marca, fichas con 30 días o más de antigüedad y enlaces que requieren revisión.
- Abre o actualiza **una sola incidencia de GitHub** cuando existen precios pendientes de revalidación documental, enlaces inciertos o errores de datos. La cierra al desaparecer las incidencias automáticas.
- **No** considera un HTTP 200 como corroboración de un precio. Tampoco interpreta un HTTP 403, 429 o una página con JavaScript como prueba de cambio de precio.

**Actualización manual:** contrastar el monto y versión exacta con el campo «precio de lista» del fabricante, excluir todos los bonos, comprobar año comercial cuando conste, guardar URL y monto de la fuente y entonces actualizar `checkedAt`. Si no es verificable, mantener el registro sin nueva fecha o retirarlo tras revisión justificada. Nunca completar la revisión modificando las fechas en bloque sin cotejar cada versión. El flujo **no cambia automáticamente ninguno de los 114 importes** ni los datos 3CV/SII.

La auditoría se puede ejecutar localmente con `node scripts/audit-price-sources.cjs --online --report-json=price-audit.json`. Las restricciones antibot de fabricantes pueden producir alertas de acceso, que exigen interpretación humana.
