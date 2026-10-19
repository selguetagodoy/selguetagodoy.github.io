# RINDELAB — Lote 200 de denominaciones por investigar y cruzar

**Corte:** 19 de octubre de 2026. **Estado:** inventario documentado; NO son 200 precios comerciales nuevos ni 200 vehículos de venta vigente confirmada.

## Resultado del cruce

- Base 3CV consolidada en bandeja: **988 denominaciones técnicas**; la bandeja original contiene homologaciones históricas, no catálogo comercial actual.
- Grupo prioritario del lote anterior: **66 registros**, preservados en [triaje-66-electromovilidad-20261019.csv](./triaje-66-electromovilidad-20261019.csv).
- Candidatos adicionales recientes B/C evaluados: **309**; de ellos **5** coincidencias literales de versión y tecnología quedan fuera del nuevo lote (la literalidad no prueba identidad de homologación).
- **304** registros adicionales sin coincidencia literal después del filtro; este lote selecciona **200**, y quedan **104** para un lote siguiente.
- Base comercial utilizada para cruce: **359 precios (de ellos 165 electrificados)**, correspondiente a la rama del [PR #85](https://github.com/selguetagodoy/selguetagodoy.github.io/pull/85), todavía **no publicada en main** al generar este documento. Main contiene 347 precios.
- Distribución de 200: **56 marcas/grupos**. Tecnologías: EV 95; PHEV 58; REEV 5; HEV 22; MHEV 20.

| Resultado en base RINDELAB | Casos | Interpretación |
|---|---:|---|
| Marca sin precios comerciales documentados | 98 | La marca no aparece en el catálogo consultado; buscar fuente oficial |
| Marca presente, pero sin coincidencia de versión y tecnología | 67 | Buscar precio de versión; posible cambio de denominación |
| Familia/tecnología candidatas en catálogo | 35 | Requiere correspondencia exacta antes de reutilizar valor |

**Importante:** todos los `precio_lista_clp` del CSV nuevo están vacíos. Ningún importe comercial existente se traspasó por parecido textual. Los precios de familia que se muestran solo sirven de referencia de cotejo.

## Inventario de 200: nombres fuente y diagnóstico por versión

| Nº | Marca | Denominación técnica 3CV | Motor | Última ficha | Resultado del cruce | Próxima acción |
|---:|---|---|---|---|---|---|
| 1 | Porsche | Macan GTS Electric | EV | 2026-04-24 | Marca sin precios | Buscar fuente y precio |
| 2 | Peugeot | E3008 DUAL MOTOR | EV | 2026-04-17 | Sin versión equivalente | Buscar fuente y precio |
| 3 | Porsche | Panamera Turbo E-Hybrid G3 | PHEV | 2026-04-16 | Marca sin precios | Buscar fuente y precio |
| 4 | Smart | Smart 5 Brabus | EV | 2026-04-15 | Marca sin precios | Buscar fuente y precio |
| 5 | Smart | Smart 5 Pro Plus | EV | 2026-04-15 | Marca sin precios | Buscar fuente y precio |
| 6 | Smart | Smart 5 Pulse | EV | 2026-04-15 | Marca sin precios | Buscar fuente y precio |
| 7 | Changan | Nevo Q05 EV | EV | 2026-04-13 | Sin versión equivalente | Buscar fuente y precio |
| 8 | Eveasy | NEW EV3 | EV | 2026-04-13 | Marca sin precios | Buscar fuente y precio |
| 9 | Geely | EX5 EM-i 30Kw | PHEV | 2026-04-10 | Familia candidata | Cotejar familia y versión |
| 10 | Geely | EX5 eMi | PHEV | 2026-04-10 | Sin versión equivalente | Buscar fuente y precio |
| 11 | Toyota | Hilux BEV | EV | 2026-04-10 | Sin versión equivalente | Buscar fuente y precio |
| 12 | Tesla | Model 3 AWD Premium | EV | 2026-04-08 | Marca sin precios | Buscar fuente y precio |
| 13 | Tesla | Model Y AWD Premium | EV | 2026-04-08 | Marca sin precios | Buscar fuente y precio |
| 14 | Tesla | Model Y RWD Premium | EV | 2026-04-08 | Marca sin precios | Buscar fuente y precio |
| 15 | Tesla | Model 3 RWD Premium | EV | 2026-04-02 | Marca sin precios | Buscar fuente y precio |
| 16 | Changan | Avatr 07 REEV AWD | REEV | 2026-03-20 | Familia candidata | Cotejar familia y versión |
| 17 | Changan | Avatr 07 REEV RWD | REEV | 2026-03-20 | Familia candidata | Cotejar familia y versión |
| 18 | Volvo | EC40 P6 CORE | EV | 2026-03-20 | Sin versión equivalente | Buscar fuente y precio |
| 19 | Volvo | EC40 P6 PLUS | EV | 2026-03-20 | Sin versión equivalente | Buscar fuente y precio |
| 20 | Lexus | RZ550e BEV | EV | 2026-03-13 | Marca sin precios | Buscar fuente y precio |
| 21 | Soueast | S06 DM | PHEV | 2026-03-12 | Marca sin precios | Buscar fuente y precio |
| 22 | BMW | 330e Berlina | PHEV | 2026-02-25 | Sin versión equivalente | Buscar fuente y precio |
| 23 | BMW | 330e Sedán | PHEV | 2026-02-25 | Sin versión equivalente | Buscar fuente y precio |
| 24 | BYD | Dolphin Mini 5S GL | EV | 2026-02-17 | Familia candidata | Cotejar familia y versión |
| 25 | BYD | Dolphin Mini 5S GS | EV | 2026-02-17 | Familia candidata | Cotejar familia y versión |
| 26 | Volvo | XC90 T8 AWD Ultra Dark | PHEV | 2026-02-13 | Sin versión equivalente | Buscar fuente y precio |
| 27 | M. Benz | eSprinter 320 | EV | 2026-02-12 | Marca sin precios | Buscar fuente y precio |
| 28 | Exeed Born For More | EXLANTIX ES BEV AWD | EV | 2026-02-10 | Marca sin precios | Buscar fuente y precio |
| 29 | Geely | EX2 EV | EV | 2026-02-10 | Sin versión equivalente | Buscar fuente y precio |
| 30 | Chery | Tiggo 8 Pro Max 1,5T GLX DHT PHEV | PHEV | 2026-02-04 | Familia candidata | Cotejar familia y versión |
| 31 | Ferrari | 296 GTB | PHEV | 2026-02-04 | Marca sin precios | Buscar fuente y precio |
| 32 | Ferrari | 296 GTS | PHEV | 2026-02-04 | Marca sin precios | Buscar fuente y precio |
| 33 | Porsche | Cayenne E-Hybrid Coupe E3 II Black Edition | PHEV | 2026-01-29 | Marca sin precios | Buscar fuente y precio |
| 34 | Porsche | Cayenne V6 E-Hybrid E3 II Black Edition | PHEV | 2026-01-29 | Marca sin precios | Buscar fuente y precio |
| 35 | BMW | X3 xDrive 30e | PHEV | 2026-01-27 | Sin versión equivalente | Buscar fuente y precio |
| 36 | BYD | BYD ATTO 8 DM-i | PHEV | 2026-01-23 | Familia candidata | Cotejar familia y versión |
| 37 | Chery | Tiggo 7 Pro Max 1,5T GLX DHT PHEV | PHEV | 2026-01-23 | Familia candidata | Cotejar familia y versión |
| 38 | BYD | BYD SEALION 7 GL | EV | 2026-01-22 | Familia candidata | Cotejar familia y versión |
| 39 | Changan | AVATR 11 | EV | 2026-01-22 | Sin versión equivalente | Buscar fuente y precio |
| 40 | Mini | Cooper JCW E | EV | 2026-01-21 | Marca sin precios | Buscar fuente y precio |
| 41 | BYD | BYD ATTO 8 DM-p | PHEV | 2026-01-07 | Familia candidata | Cotejar familia y versión |
| 42 | Chery | Tiggo 9 1.5T DHT PHEV GLX | PHEV | 2026-01-07 | Familia candidata | Cotejar familia y versión |
| 43 | Jaecoo | Jaecoo8 1,5T AWD PHEV | PHEV | 2026-01-07 | Sin versión equivalente | Buscar fuente y precio |
| 44 | Jaecoo | Jaecoo8 1,5T AWD PHEV 6 Asientos | PHEV | 2026-01-07 | Sin versión equivalente | Buscar fuente y precio |
| 45 | Jetour | T1 iDM 1.5T PHEV | PHEV | 2025-12-29 | Marca sin precios | Buscar fuente y precio |
| 46 | Jaecoo | Jaecco5 EV | EV | 2025-12-26 | Sin versión equivalente | Buscar fuente y precio |
| 47 | Opel | New Mokka Electric GS | EV | 2025-12-26 | Marca sin precios | Buscar fuente y precio |
| 48 | Omoda | C7 1.5T PHEV | PHEV | 2025-12-22 | Sin versión equivalente | Buscar fuente y precio |
| 49 | BMW | M5 Berlina | PHEV | 2025-12-19 | Sin versión equivalente | Buscar fuente y precio |
| 50 | Mazda | CX-60 2.5 PHEV AT AWD | PHEV | 2025-12-19 | Sin versión equivalente | Buscar fuente y precio |
| 51 | Foton | G7 EV PLUS | EV | 2025-12-16 | Marca sin precios | Buscar fuente y precio |
| 52 | Bentley | Continental GT PHEV | PHEV | 2025-12-15 | Marca sin precios | Buscar fuente y precio |
| 53 | Bentley | Continental GTC PHEV | PHEV | 2025-12-15 | Marca sin precios | Buscar fuente y precio |
| 54 | Changan | Eado Plus IDD | PHEV | 2025-12-10 | Sin versión equivalente | Buscar fuente y precio |
| 55 | Changan | Deepal G318 REEV | REEV | 2025-12-04 | Sin versión equivalente | Buscar fuente y precio |
| 56 | BMW | I5 eDrive40 | EV | 2025-12-03 | Familia candidata | Cotejar familia y versión |
| 57 | Riddara | RD6 Pick Up 73kWh | EV | 2025-12-03 | Marca sin precios | Buscar fuente y precio |
| 58 | BMW | 750e xDrive | PHEV | 2025-12-02 | Sin versión equivalente | Buscar fuente y precio |
| 59 | Kia | EV6 EV 84 KWH AWD | EV | 2025-11-27 | Sin versión equivalente | Buscar fuente y precio |
| 60 | Mitsubishi | New Outlander 2.4 PHEV 4X4 AT GLS | PHEV | 2025-11-25 | Sin versión equivalente | Buscar fuente y precio |
| 61 | Mitsubishi | New Outlander 2.4 PHEV 4X4 AT GLS Limited | PHEV | 2025-11-25 | Sin versión equivalente | Buscar fuente y precio |
| 62 | Mitsubishi | New Outlander 2.4 PHEV 4X4 AT GLX | PHEV | 2025-11-25 | Sin versión equivalente | Buscar fuente y precio |
| 63 | Riddara | RD6 Pick Up PHEV | PHEV | 2025-11-17 | Marca sin precios | Buscar fuente y precio |
| 64 | Land Rover | Range Rover 3.0i PHEV Autobiography | PHEV | 2025-11-11 | Marca sin precios | Buscar fuente y precio |
| 65 | Land Rover | Range Rover 3.0i PHEV HSE | PHEV | 2025-11-11 | Marca sin precios | Buscar fuente y precio |
| 66 | Land Rover | Range Rover 3.0i PHEV SE | PHEV | 2025-11-11 | Marca sin precios | Buscar fuente y precio |
| 67 | DFSK | EC75 EV AT | EV | 2025-11-06 | Sin versión equivalente | Buscar fuente y precio |
| 68 | BMW | X1 xDrive 25e | PHEV | 2025-11-05 | Sin versión equivalente | Buscar fuente y precio |
| 69 | Lynk Co | 01 PHEV | PHEV | 2025-11-05 | Marca sin precios | Buscar fuente y precio |
| 70 | Chevrolet | Blazer EV eAWD | EV | 2025-11-04 | Marca sin precios | Buscar fuente y precio |
| 71 | BMW | X5 M60i xDrive | PHEV | 2025-11-03 | Sin versión equivalente | Buscar fuente y precio |
| 72 | Toyota | BZ4X AWD BEV | EV | 2025-11-03 | Sin versión equivalente | Buscar fuente y precio |
| 73 | Toyota | BZ4X BEV | EV | 2025-11-03 | Sin versión equivalente | Buscar fuente y precio |
| 74 | Eveasy | EV3 SE | EV | 2025-11-01 | Marca sin precios | Buscar fuente y precio |
| 75 | Changan | DEEPAL S05 REEV | REEV | 2025-10-27 | Familia candidata | Cotejar familia y versión |
| 76 | Mini | Aceman JCW E | EV | 2025-10-27 | Marca sin precios | Buscar fuente y precio |
| 77 | Volvo | EX40 P8 ULTRA | EV | 2025-10-27 | Sin versión equivalente | Buscar fuente y precio |
| 78 | Suzuki | e Vitara 2WD (128 kW) | EV | 2025-10-15 | Sin versión equivalente | Buscar fuente y precio |
| 79 | Suzuki | e Vitara 4WD (135 kW) | EV | 2025-10-15 | Sin versión equivalente | Buscar fuente y precio |
| 80 | Peugeot | e-Traveller 8P 75 kW | EV | 2025-10-13 | Sin versión equivalente | Buscar fuente y precio |
| 81 | Audi | A6 e-tron | EV | 2025-10-07 | Marca sin precios | Buscar fuente y precio |
| 82 | Audi | A6 e-tron Avant | EV | 2025-10-07 | Marca sin precios | Buscar fuente y precio |
| 83 | Volvo | EX30 Cross Country Ultra | EV | 2025-09-30 | Sin versión equivalente | Buscar fuente y precio |
| 84 | Volvo | EX30 Twin Motor Performance | EV | 2025-09-30 | Sin versión equivalente | Buscar fuente y precio |
| 85 | Volvo | XC90 T8 AWD CORE | PHEV | 2025-09-29 | Sin versión equivalente | Buscar fuente y precio |
| 86 | Volvo | XC90 T8 AWD PLUS | PHEV | 2025-09-29 | Sin versión equivalente | Buscar fuente y precio |
| 87 | Chevrolet | Captiva PHEV | PHEV | 2025-09-11 | Marca sin precios | Buscar fuente y precio |
| 88 | Audi | A6 e-tron Performance | EV | 2025-09-04 | Marca sin precios | Buscar fuente y precio |
| 89 | Audi | A6 e-tron Performance Avant | EV | 2025-09-04 | Marca sin precios | Buscar fuente y precio |
| 90 | Changan | HUNTER E | PHEV | 2025-09-01 | Sin versión equivalente | Buscar fuente y precio |
| 91 | DFSK | 600 1,5L PHEV | PHEV | 2025-09-01 | Sin versión equivalente | Buscar fuente y precio |
| 92 | Land Rover | Range Rover Sport 3.0i PHEV Autobiography | PHEV | 2025-09-01 | Marca sin precios | Buscar fuente y precio |
| 93 | Land Rover | Range Rover Sport 3.0i PHEV Dynamic HSE | PHEV | 2025-09-01 | Marca sin precios | Buscar fuente y precio |
| 94 | Land Rover | Range Rover Sport 3.0i PHEV Dynamic SE | PHEV | 2025-09-01 | Marca sin precios | Buscar fuente y precio |
| 95 | Land Rover | Range Rover Sport 3.0i PHEV S | PHEV | 2025-09-01 | Marca sin precios | Buscar fuente y precio |
| 96 | Land Rover | Range Rover Sport 3.0i PHEV SE | PHEV | 2025-09-01 | Marca sin precios | Buscar fuente y precio |
| 97 | KGM | Torres EVX | EV | 2025-08-25 | Sin versión equivalente | Buscar fuente y precio |
| 98 | Lynk Co | LYNK CO 02 | EV | 2025-08-14 | Marca sin precios | Buscar fuente y precio |
| 99 | SWM | G03F EDI 1.5 REEV AT E6e | REEV | 2025-08-13 | Marca sin precios | Buscar fuente y precio |
| 100 | Jeep | AVENGER SUMMIT BEV | EV | 2025-08-11 | Sin versión equivalente | Buscar fuente y precio |
| 101 | Lynk Co | 08 PHEV | PHEV | 2025-08-11 | Marca sin precios | Buscar fuente y precio |
| 102 | M. Benz | EQE 350 PLUS | EV | 2025-08-08 | Marca sin precios | Buscar fuente y precio |
| 103 | Cupra | Tavascan 82 kWh 286 CV RWD | EV | 2025-08-06 | Marca sin precios | Buscar fuente y precio |
| 104 | Bentley | Bentayga Hybrid | PHEV | 2025-08-04 | Marca sin precios | Buscar fuente y precio |
| 105 | M. Benz | eVito 112 | EV | 2025-08-01 | Marca sin precios | Buscar fuente y precio |
| 106 | Cupra | Formentor PA 1.5 AT E-Hybrid 204 CV | PHEV | 2025-07-30 | Marca sin precios | Buscar fuente y precio |
| 107 | Farizon | Supervan | EV | 2025-07-23 | Marca sin precios | Buscar fuente y precio |
| 108 | Farizon | SuperVan 3A | EV | 2025-07-23 | Marca sin precios | Buscar fuente y precio |
| 109 | Maxus | T90 EV 4x4 AT DC | EV | 2025-07-21 | Marca sin precios | Buscar fuente y precio |
| 110 | Chevrolet | Captiva EV | EV | 2025-07-18 | Marca sin precios | Buscar fuente y precio |
| 111 | Skoda | Elroq 85 | EV | 2025-07-04 | Familia candidata | Cotejar familia y versión |
| 112 | Skoda | Enyaq 85 | EV | 2025-07-04 | Familia candidata | Cotejar familia y versión |
| 113 | Skoda | Enyaq Coupe 85 | EV | 2025-07-04 | Familia candidata | Cotejar familia y versión |
| 114 | Audi | Q6 e-tron 45 | EV | 2025-06-23 | Marca sin precios | Buscar fuente y precio |
| 115 | Audi | Q6 e-tron 45 Sportback | EV | 2025-06-23 | Marca sin precios | Buscar fuente y precio |
| 116 | Volkswagen | ID.4 Pro 77kWh | EV | 2025-06-23 | Sin versión equivalente | Buscar fuente y precio |
| 117 | Audi | Q4 e-tron 45 | EV | 2025-06-06 | Marca sin precios | Buscar fuente y precio |
| 118 | Audi | Q4 e-tron 45 Sportback | EV | 2025-06-06 | Marca sin precios | Buscar fuente y precio |
| 119 | Maserati | Grecale Folgore | EV | 2025-06-04 | Marca sin precios | Buscar fuente y precio |
| 120 | BYD | BYD SEALION 7 | EV | 2025-05-30 | Familia candidata | Cotejar familia y versión |
| 121 | Porsche | Panamera 4S E-Hybrid G3 | PHEV | 2025-05-29 | Marca sin precios | Buscar fuente y precio |
| 122 | Hyundai | Inster AX1 EV AT (Batería estándar) | EV | 2025-05-28 | Familia candidata | Cotejar familia y versión |
| 123 | Hyundai | Inster AX1 EV AT (Batería extendida) | EV | 2025-05-28 | Familia candidata | Cotejar familia y versión |
| 124 | Neta | Neta X | EV | 2025-05-26 | Marca sin precios | Buscar fuente y precio |
| 125 | Honda | eNy1 Advance | EV | 2025-05-09 | Marca sin precios | Buscar fuente y precio |
| 126 | Jeep | Avenger e | EV | 2025-05-06 | Sin versión equivalente | Buscar fuente y precio |
| 127 | Lexus | RZ450e BEV | EV | 2025-05-06 | Marca sin precios | Buscar fuente y precio |
| 128 | Tesla | Model Y AWD | EV | 2025-05-05 | Marca sin precios | Buscar fuente y precio |
| 129 | Tesla | Model Y RWD | EV | 2025-05-05 | Marca sin precios | Buscar fuente y precio |
| 130 | Chevrolet | Spark EUV | EV | 2025-04-29 | Marca sin precios | Buscar fuente y precio |
| 131 | Geely | EX5 EV | EV | 2025-04-28 | Sin versión equivalente | Buscar fuente y precio |
| 132 | Chevrolet | Blazer EV RWD | EV | 2025-04-16 | Marca sin precios | Buscar fuente y precio |
| 133 | Porsche | Taycan Turbo GT II | EV | 2025-04-10 | Marca sin precios | Buscar fuente y precio |
| 134 | Kia | EV5 EV LIGHT 64,2 KWH | EV | 2025-04-07 | Sin versión equivalente | Buscar fuente y precio |
| 135 | BYD | BYD SHARK | PHEV | 2025-04-02 | Familia candidata | Cotejar familia y versión |
| 136 | Smart | Smart 1 Brabus | EV | 2025-03-05 | Marca sin precios | Buscar fuente y precio |
| 137 | Smart | Smart 1 Pro Plus | EV | 2025-03-05 | Marca sin precios | Buscar fuente y precio |
| 138 | Smart | Smart 1 Pure | EV | 2025-03-05 | Marca sin precios | Buscar fuente y precio |
| 139 | Smart | Smart 3 Brabus | EV | 2025-03-05 | Marca sin precios | Buscar fuente y precio |
| 140 | Smart | Smart 3 Pro | EV | 2025-03-05 | Marca sin precios | Buscar fuente y precio |
| 141 | Mini | Aceman SE | EV | 2025-02-28 | Marca sin precios | Buscar fuente y precio |
| 142 | Mini | Aceman E | EV | 2025-02-25 | Marca sin precios | Buscar fuente y precio |
| 143 | Chevrolet | Equinox EV eAWD | EV | 2025-02-19 | Marca sin precios | Buscar fuente y precio |
| 144 | Porsche | Macan 4S Electric | EV | 2025-02-12 | Marca sin precios | Buscar fuente y precio |
| 145 | Renault | KWID E-TECH | EV | 2025-02-03 | Marca sin precios | Buscar fuente y precio |
| 146 | Mitsubishi | Outlander PHEV 4x4 AT GLS | PHEV | 2025-01-28 | Familia candidata | Cotejar familia y versión |
| 147 | Mitsubishi | Outlander PHEV 4x4 AT GLS Limited | PHEV | 2025-01-28 | Familia candidata | Cotejar familia y versión |
| 148 | Mitsubishi | Outlander PHEV 4x4 AT GLX | PHEV | 2025-01-28 | Familia candidata | Cotejar familia y versión |
| 149 | Porsche | Macan Electric | EV | 2025-01-20 | Marca sin precios | Buscar fuente y precio |
| 150 | Jaecoo | Jaecoo7 1,5T PHEV | PHEV | 2025-01-06 | Sin versión equivalente | Buscar fuente y precio |
| 151 | Foton | G7 EV Pro | EV | 2025-01-03 | Marca sin precios | Buscar fuente y precio |
| 152 | Jetour | T2 1.5T PHEV | PHEV | 2025-01-03 | Marca sin precios | Buscar fuente y precio |
| 153 | Landking | LK5 EV | EV | 2025-01-03 | Marca sin precios | Buscar fuente y precio |
| 154 | Opel | New Crossland Electric GS | EV | 2025-01-03 | Marca sin precios | Buscar fuente y precio |
| 155 | ZNA | R7 EV 2WD | EV | 2025-01-03 | Marca sin precios | Buscar fuente y precio |
| 156 | ZNA | R7 EV 4x4 | EV | 2025-01-03 | Marca sin precios | Buscar fuente y precio |
| 157 | Livan | RL7 T0 | EV | 2025-01-02 | Marca sin precios | Buscar fuente y precio |
| 158 | Honda | ZR-V Hybrid | HEV | 2026-04-15 | Marca sin precios | Buscar fuente y precio |
| 159 | Kia | Carnival 1.6T 6AT HEV | HEV | 2026-04-10 | Familia candidata | Cotejar familia y versión |
| 160 | Fiat | 600 ICON MHEV | MHEV | 2026-04-09 | Sin versión equivalente | Buscar fuente y precio |
| 161 | Suzuki | Swift 1.2 ISG CVT | MHEV | 2026-03-10 | Sin versión equivalente | Buscar fuente y precio |
| 162 | Suzuki | Swift 1.2 ISG MT | MHEV | 2026-03-10 | Sin versión equivalente | Buscar fuente y precio |
| 163 | Toyota | RAV4 2.5 HEV AWD | HEV | 2026-02-12 | Sin versión equivalente | Buscar fuente y precio |
| 164 | Toyota | RAV4 2.5 HEV | HEV | 2026-02-05 | Sin versión equivalente | Buscar fuente y precio |
| 165 | Toyota | Yaris SD 1.5 HEV | HEV | 2026-01-29 | Sin versión equivalente | Buscar fuente y precio |
| 166 | Kia | Sportage 1.6T AT HEV | HEV | 2026-01-23 | Familia candidata | Cotejar familia y versión |
| 167 | Kia | Sportage 1.6T AT HEV 2WD | HEV | 2026-01-23 | Familia candidata | Cotejar familia y versión |
| 168 | Kia | Sorento 1.6T 6AT HEV 2WD | HEV | 2026-01-22 | Familia candidata | Cotejar familia y versión |
| 169 | Kia | Sorento 1.6T 6AT HEV AWD | HEV | 2026-01-22 | Familia candidata | Cotejar familia y versión |
| 170 | Omoda | C5 1.5T HEV | HEV | 2025-12-29 | Sin versión equivalente | Buscar fuente y precio |
| 171 | Suzuki | Across 1.5 ISG MT 2WD | MHEV | 2025-12-18 | Sin versión equivalente | Buscar fuente y precio |
| 172 | Hyundai | Palisade LX3 2.5T-GDI HEV 6AT 7P 4WD E6c | HEV | 2025-12-03 | Familia candidata | Cotejar familia y versión |
| 173 | Hyundai | Palisade LX3 2.5T-GDI HEV 6AT 8P 4WD E6c | HEV | 2025-12-03 | Familia candidata | Cotejar familia y versión |
| 174 | Suzuki | Across 1.5 ISG AT 2WD | MHEV | 2025-11-26 | Sin versión equivalente | Buscar fuente y precio |
| 175 | Mazda | CX-60 3.3 MHEV AT AWD | MHEV | 2025-11-06 | Sin versión equivalente | Buscar fuente y precio |
| 176 | Peugeot | 208 MHEV 100 eDCT | MHEV | 2025-10-20 | Sin versión equivalente | Buscar fuente y precio |
| 177 | Peugeot | 308 MCA Hybrid MHEV eDCT | MHEV | 2025-10-02 | Sin versión equivalente | Buscar fuente y precio |
| 178 | Toyota | Yaris Cross 1.5 HEV | HEV | 2025-09-26 | Familia candidata | Cotejar familia y versión |
| 179 | Subaru | Crosstrek | HEV | 2025-09-23 | Familia candidata | Cotejar familia y versión |
| 180 | DS | DS3 MHEV eDCT | MHEV | 2025-09-12 | Marca sin precios | Buscar fuente y precio |
| 181 | Chery | Tiggo 4 Pro Max 1.5 GLS HEV | HEV | 2025-09-10 | Familia candidata | Cotejar familia y versión |
| 182 | Ford | Territory FHEV (CX743) 1.5 AT | HEV | 2025-09-01 | Familia candidata | Cotejar familia y versión |
| 183 | Opel | OPEL MOKKA MHEV 136 eDCT | MHEV | 2025-08-27 | Marca sin precios | Buscar fuente y precio |
| 184 | Subaru | Forester 2.5 HEV | HEV | 2025-08-14 | Familia candidata | Cotejar familia y versión |
| 185 | Skoda | New Octavia 1.5 MHEV | MHEV | 2025-08-13 | Sin versión equivalente | Buscar fuente y precio |
| 186 | Lexus | IS300h HEV | HEV | 2025-08-05 | Marca sin precios | Buscar fuente y precio |
| 187 | Mazda | Mazda CX-90 MHEV | MHEV | 2025-08-05 | Sin versión equivalente | Buscar fuente y precio |
| 188 | Lexus | ES300h HEV | HEV | 2025-08-04 | Marca sin precios | Buscar fuente y precio |
| 189 | Alfa Romeo | Tonale MHEV | MHEV | 2025-07-02 | Marca sin precios | Buscar fuente y precio |
| 190 | Suzuki | Dzire 1.2L ISG CVT | MHEV | 2025-06-26 | Sin versión equivalente | Buscar fuente y precio |
| 191 | Skoda | New Kodiaq 1.5 MHEV | MHEV | 2025-06-25 | Sin versión equivalente | Buscar fuente y precio |
| 192 | Suzuki | Dzire 1.2L ISG MT | MHEV | 2025-06-25 | Sin versión equivalente | Buscar fuente y precio |
| 193 | Toyota | Corolla SD 1.8 HEV | HEV | 2025-05-28 | Sin versión equivalente | Buscar fuente y precio |
| 194 | Renault | Koleos 1.5T HEV | HEV | 2025-05-27 | Marca sin precios | Buscar fuente y precio |
| 195 | Citroen | C4 Hybrid MHEV eDCT | MHEV | 2025-05-12 | Sin versión equivalente | Buscar fuente y precio |
| 196 | DS | DS4 Hybrid MHEV eDCT | MHEV | 2025-04-07 | Marca sin precios | Buscar fuente y precio |
| 197 | Honda | CR-V Hybrid | HEV | 2025-03-12 | Marca sin precios | Buscar fuente y precio |
| 198 | Opel | Corsa GS Hybrid MHEV 100 eDCT | MHEV | 2025-02-17 | Marca sin precios | Buscar fuente y precio |
| 199 | Opel | Corsa Hybrid MHEV 100 eDCT | MHEV | 2025-02-17 | Marca sin precios | Buscar fuente y precio |
| 200 | BMW | X5 xDrive50e | PHEV | 2025-11-03 | Sin versión equivalente | Buscar fuente y precio |

## Distribución por marcas

| Marca o grupo | Registros nuevos |
|---|---:|
| BMW | 9 |
| Audi | 8 |
| Changan | 8 |
| Land Rover | 8 |
| Porsche | 8 |
| Smart | 8 |
| Suzuki | 8 |
| Toyota | 8 |
| Volvo | 8 |
| BYD | 7 |
| Kia | 7 |
| Chevrolet | 6 |
| Mitsubishi | 6 |
| Tesla | 6 |
| Opel | 5 |
| Skoda | 5 |
| Chery | 4 |
| Geely | 4 |
| Hyundai | 4 |
| Jaecoo | 4 |
| Lexus | 4 |
| Mini | 4 |
| Peugeot | 4 |
| Bentley | 3 |
| Honda | 3 |
| Lynk Co | 3 |
| M. Benz | 3 |
| Mazda | 3 |
| Cupra | 2 |
| DFSK | 2 |
| DS | 2 |
| Eveasy | 2 |
| Farizon | 2 |
| Ferrari | 2 |
| Foton | 2 |
| Jeep | 2 |
| Jetour | 2 |
| Omoda | 2 |
| Renault | 2 |
| Riddara | 2 |
| Subaru | 2 |
| ZNA | 2 |
| Alfa Romeo | 1 |
| Citroen | 1 |
| Exeed Born For More | 1 |
| Fiat | 1 |
| Ford | 1 |
| KGM | 1 |
| Landking | 1 |
| Livan | 1 |
| Maserati | 1 |
| Maxus | 1 |
| Neta | 1 |
| Soueast | 1 |
| SWM | 1 |
| Volkswagen | 1 |

## Método operativo para llenar por lotes (sin publicar uno a uno)

1. Abrir [lote-200-cruce-precios-20261019.csv](./lote-200-cruce-precios-20261019.csv), filtrar por marca y buscar en sitio oficial chileno de fabricante/importador. No confundir ficha homologada con una venta vigente.
2. Completar las columnas de **versión comercial confirmada**, `precio_lista_clp` literal con IVA cuando corresponda, `fuente_precio_oficial_url`, fecha y evidencia textual. Si solo se publica precio con financiamiento/bonos, dejar vacío y justificar.
3. Para `FAMILIA_CANDIDATA`, revisar en el CSV los nombres y rangos de precios de versiones de la **misma tecnología**; los comparables no se importan automáticamente. Excluir duplicados por marca+familia+versión+año.
4. Aprobar un lote documental completo, no ejecuciones por marca. Para incorporar precios nuevos al catálogo público, usar exclusivamente `scripts/rindelab-price-queue.cjs` y su CSV maestro con los estados e invariantes definidos en [GUIA-BANDEJA-PRECIOS.md](./GUIA-BANDEJA-PRECIOS.md). Este CSV de trabajo no se importa sin revisión.
5. Ejecutar `--check`, `--dry-run`, auditorías de versiones, fuentes y QA E2E. Fusionar solo con verificaciones verdes. **El PR #85 de 12 precios presenta una prueba E2E fallida y sigue sin fusionar** al corte de este documento.

## Fuentes internas de referencia

- `rindelab/sii/bandeja-precios-electromovilidad.csv`: 988 denominaciones y códigos 3CV.
- `rindelab/sii/commercial-2026.json`: catálogo comercial vigente en `main` (347 precios).
- Rama `feat/rindelab-marcas-electrificadas-lote-20261019`: catálogo de contraste de 359 entradas, pendiente PR #85.
- `rindelab/sii/triaje-66-electromovilidad-20261019.csv`: lote previo de 66 prioritarios, sin duplicarlo.

