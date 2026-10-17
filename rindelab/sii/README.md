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

**Precios de lista nuevos:** primera entrega de **36 precios oficiales por versión**, de Toyota, Hyundai y Kia, consultados el 17/10/2026. En esta ampliación se agregan 11 versiones Hyundai (Tucson, Venue, Creta Grand y Kona EV) con enlaces a las tablas de precio de lista; también se conserva la auditoría previa de Kia Morning y las correcciones de precios Toyota. Se excluye temporalmente la Hilux 4x2 2.4 MT SR Diesel porque la tienda Toyota publica precios de lista discrepantes para esa combinación (entre $34.790.000 y $35.290.000); no se elige una cifra sin reconciliar las publicaciones. Se añaden las cinco versiones Kia Morning con precios oficiales separados de los bonos. Fuente, versión, año de modelo cuando se explicita y precio base sin bonos se registran en `rindelab/sii/commercial-2026.json`. **La cobertura es parcial**, no implica que todas las 8.053 homologaciones 3CV sigan a la venta. Las versiones cuyos valores no están documentados muestran un mensaje de falta de dato.

En cada ficha, el usuario revisa los candidatos por marca/familia y **elige expresamente la versión comercial**; solo entonces se incorpora ese precio al comparador. Se puede retirar la selección. Los precios de lista no incluyen descuentos financieros, bonificaciones comerciales ni cargos adicionales cuando se cobran aparte; son una fotografía documental que puede perder vigencia y debe contrastarse con la página original. No se calculan precios de lista a partir de tasaciones del SII ni se interpretan como precio de reventa.

**Fuente y trazabilidad:** `rindelab/sii/data/index.json` expone campos, SHA-256 del Excel oficial, fecha y número de registros; los 26 archivos de datos se separan por la inicial de marca para carga diferida. El Excel de origen contiene 81.697 registros con valores no vacíos y 0 descartados bajo las reglas de exportación.
El código de extracción en `scripts/build-sii-2026.cjs` necesita `exceljs`. Para volver a generarlo:

```bash
npm install --no-save exceljs
node scripts/build-sii-2026.cjs ruta/al/liv2026.xlsx
```

Regla editorial: nunca comparar como equivalentes tasación fiscal, permiso de circulación, precio de lista, precio promocional y valor comercial de reventa.
