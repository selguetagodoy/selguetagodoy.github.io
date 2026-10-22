# RINDELAB — Evidencia adicional para vehículos usados descontinuados

**Corte de investigación:** 21 de octubre de 2026. **Estado: candidatos documentales, aún no incorporados a los 299 registros publicados.** Ninguno de los valores siguientes es tasación fiscal SII ni precio de transacción acreditada.

| Marca | Identidad observada | Año | Precio(s) CLP | Naturaleza | Fuente | Estado de conciliación |
|---|---|---:|---:|---|---|---|
| Kia | Rio 5 | 2015 | 5.527.000–8.339.000 | Rango estimado según Autofact (referencia publicada en 2025) | https://cotiza.autofact.cl/blog/comprar-auto/cotizar-precios/kia-rio-precio | Separar de Rio 4 y Rio genérico |
| Kia | Rio 4 | 2015 | 4.994.000–8.154.000 | Rango estimado según Autofact (referencia publicada en 2025) | https://cotiza.autofact.cl/blog/comprar-auto/cotizar-precios/kia-rio-precio | No fusionar con Rio 5 |
| Kia | Rio 5 EX | 2015 | 5.808.000–8.038.000 | Rango estimado de versión específica, Autofact | https://checkout.autofact.cl/blog/comprar-auto/modelos/kia-rio-ex | No promediar con Rio 5 |
| Toyota | Prius C 1.5 Auto Hybrid | 2021 | 14.200.000 | Precio de un aviso, citado por Autofact en julio de 2026 | https://cotiza.autofact.cl/blog/comprar-auto/mercado/mejores-autos-hibridos | Candidato de un aviso, no mediana |
| MINI | Cooper S Clubman 2.0 T | 2016 | 12.990.000 | Precio de aviso individual, WebCars / AutoExplora | https://www.autoexplora.cl/automotora/webcars?page=2 | Verificar identidad y vigencia del anuncio individual |
| Mitsubishi | Lancer RT 1.8 | 2018 | 9.990.000 | Precio de aviso individual, Cars Outlet / AutoExplora | https://www.autoexplora.cl/automotora/cars-outlet?page=17 | Verificar carrocería y versión |
| Mitsubishi | Lancer | 2018 | 9.580.000 | Precio de aviso individual, Matías Pelayo / AutoExplora | https://www.autoexplora.cl/automotora/matias-pelayo-automoviles?page=4 | Verificar versión antes de agregación |
| Mitsubishi | Lancer 1.6 | 2015 | 7.990.000 | Precio de aviso individual, Automotriz Copayapu / AutoExplora | https://www.autoexplora.cl/automotora/automotriz-copayapu?page=3 | Verificar carrocería y generación |

## Reglas de ingreso

1. **No cambiar** el conteo publicado (299 registros / 296 habilitados / 3 retenidos) hasta incorporar las nuevas referencias mediante pruebas.
2. El rango histórico de Autofact por **Rio 4**, **Rio 5** y **Rio 5 EX** es independiente: preservar etiqueta, periodo y URL del artículo; nunca presentarlo como cotización directa de octubre de 2026.
3. Una ficha de **aviso individual** no equivale a un rango mínimo–máximo ni sustenta una mediana. Requiere una estructura distinta a `approximate-published-range` y a las medianas AutoExplora de muestra ≥5.
4. Verificar que los avisos de concesionarias siguen disponibles y, de ser posible, sustituir la URL de listado paginado por la URL canónica del aviso.
5. Antes de declarar cerrada una de las 12 familias, conciliar exactamente el identificador del registro `model-lifecycle-2026.json`, incluida la generación y la carrocería.
6. No inferir valores de otros años, ni reproducir precios de los modelos sucesores. Mantener la consulta tributaria SII independiente.

## Hallazgo de calidad

La brecha de **Kia Rio** no debe cerrarse simplemente por semejanza de nombre: existen al menos tres clasificaciones comerciales históricas en Autofact y es necesario confirmar la correspondencia con el registro de retiro. La misma cautela se aplica a los Lancer y a MINI Cooper frente a Clubman.

**Resultado de esta etapa:** 8 observaciones externas identificadas para análisis; **0 registros productivos nuevos**, a la espera de conciliación y validación estructural.
