# RINDELAB — Cruce documental hacia 1000

Corte 19/10/2026. Catálogo base: **406** versiones comerciales; estas filas son un lote candidato sin incorporar a `main` hasta aprobar QA y revisión de duplicados.

**Diagnóstico:** extraídos 191 registros, 28 coincidencias contra catálogo base, 9 anomalías en fuente o diferencias de precio, 150 candidatos únicos tras normalizar marca+versión. La extracción trae precios de lista explícitos de fuente oficial/dealer, no precios promocionales.

| Marca | Candidatos nuevos |
|---|---:|
| BMW | 34 |
| KGM | 24 |
| Chery | 22 |
| Mitsubishi | 21 |
| Mini | 20 |
| Toyota | 14 |
| Nissan | 7 |
| Foton | 5 |
| MG | 3 |

## Control

- La coincidencia normalizada se hace por marca + versión para evitar sumar la misma denominación por distinta familia, año o concesionario.
- Ante precios distintos entre dos fuentes para la misma versión, **no sustituir** el registro inicial: revisar manualmente la discrepancia y los periodos. Anomalías: 
  - KGM: LIMITED PLUS 2.2 TD 6AT 4WD (Euro 6D) (price_conflict, 45208100 / 43423100)
  - Chery: 1.5T DHT PHEV (price_conflict, 31990000 / 28990000)
  - Chery: 1.5T DHT PHEV (price_conflict, 31990000 / 25990000)
  - Mitsubishi: 4X4 AT GLS (price_conflict, 42990000 / 35490000)
  - Mitsubishi: GL (price_conflict, 23990000 / 21490000)
  - Mitsubishi: GLX (price_conflict, 25990000 / 23490000)
  - Mitsubishi: GLS (price_conflict, 31490000 / 24990000)
  - BMW: sDrive18i Comfort (price_conflict, 44900000 / 41900000)
  - BMW: iX1 xDrive 30 Comfort (data_invalid,  / ).
- No hay vínculos automáticos entre las versiones y homologaciones 3CV.
