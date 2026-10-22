# RINDELAB — Auditoría y ampliación fotográfica (21/10/2026)

## Resultado comprobado mediante el catálogo vigente

| Indicador | Antes | Después |
|---|---:|---:|
| Grupos comerciales activos por familia/tecnología | 696 | 696 |
| Grupos con fotografía asociada | 223 | **255** |
| Grupos sin fotografía | 473 | **441** |
| Cobertura asociativa | 32,0 % | **36,6 %** |
| Fotografías referenciales en biblioteca comercial | 224 | **238** |
| Nuevas fotografías históricas ahora alojadas localmente | 0 | **8** |
| Total de archivos nuevos en esta ampliación | — | **22** |

La ampliación agregó 14 fotografías comerciales (8 BMW/Audi y 6 de Toyota/Citroën/Škoda/Foton/Maxus/Porsche) y localizó 8 referencias históricas que anteriormente se servían desde Wikimedia Commons. Las nuevas fotografías comerciales pueden representar más de un grupo de versiones de la misma familia, por eso el avance de asociaciones es de 32, no de 14.

## Criterios de asignación

- **Modelo/familia y generación**: una fotografía es referencial y no acredita la versión ni el código de homologación 3CV; se enlazan origen, autor y licencia.
- **Motorización ausente**: el motor admite fotografías neutras solo mediante una **lista autorizada de 9 archivos** que representan de manera razonable la misma carrocería/generación. No asigna de manera general una imagen de gasolina a un vehículo eléctrico.
- **Eléctricos**: Foton G7 y Maxus T90 no utilizan sus nuevas fotos de camioneta diésel en fichas con motorización EV, REEV o PHEV. Maxus T90 EV/eTERRON queda independiente.
- **Año y generación**: un archivo BMW Serie 3 G20 de 2024 se admite hasta año modelo 2026, **no se extrapola a 2027**; Porsche 911 usa imagen 992.2, identificada como Targa de referencia, no como versión exacta.
- **Correcciones visuales**: se reemplazó una imagen del *interior* del BMW Serie 3 por exterior y una imagen de Focus de generación anterior por Ford Focus Mk III facelift 2016.
- **Autos retirados**: fotografías locales para Nissan March, Toyota Prius C, Kia Rio 5, MINI Clubman, Mitsubishi Lancer, Hyundai Veloster, Ford Focus y Nissan Tiida. No se aplica foto de Rio 5 a Rio 4 ni Lancer 2014 a Lancer 2018.
- **Metadatos**: cada uno de los 22 archivos nuevos registra Commons, autor, licencia, bytes y SHA256, revisados en las pruebas.

## Experiencia de ficha única

En `usados.html`, el vehículo con fotografía identificable presenta la imagen junto a su **valor de oferta comercial** (si existe), **tasación fiscal y permiso SII 2026** por año, y enlaces respectivos. Si hay varias versiones SII, se ofrece selección en la propia tarjeta. Si falta imagen o precio, se reconoce la ausencia; no se crea un valor ni se usa fotografía de otra generación. En el buscador 3CV, la foto se asocia al resultado y la ficha muestra el acceso directo a tasación por año.

No cambia el corte de **299 referencias comerciales** ni las **12 familias completamente retiradas sin rango comercial confirmado**.

## Brechas restantes

Quedan **441 de 696 grupos comerciales** sin foto, además de importantes desafíos de normalización: **486 grupos sin tecnología identificada** y **590 sin año modelo documentado**. No es correcto inventar esos campos para conseguir una foto. La siguiente cola es la lista de 100 grupos en `rindelab/sii/LOTE-PENDIENTES-100-20261021.md`, calculada mediante `scripts/rindelab-market-queue.cjs`.

Meta 60 %: se requieren **418 grupos con foto**; tras este lote faltan **163 asociaciones adicionales** verificadas. Priorizar Foton, Dongfeng, Toyota, BMW, Mercedes-Benz, Volvo y los usados sin foto histórica. Preferir repositorios con licencias libres verificables y fotografías de fuente oficial solo cuando exista autorización de reutilización.

## Control técnico

`node rindelab/tests/photo-integrity.cjs` comprueba integridad y atribución de los 22 archivos, motor fotográfico y exclusiones generacionales; `node rindelab/tests/used-photo-preview.cjs` comprueba renderizado real, SII y búsqueda en móvil/escritorio. El workflow RINDELAB UI V2 QA ejecuta ambas pruebas en el pull request y en `main`.

**Alcance:** cobertura medida en asociaciones de familia/tecnología del registro comercial, no porcentaje de fichas 3CV, disponibilidad real ni coincidencia de acabado. Esta auditoría no autoriza a sustituir fotos de 2027 por fotos de 2026 sin identificación de generación.
