# Sebastián Elgueta Godoy — sitio oficial

Repositorio del sitio público de **Sebastián Elgueta Godoy**, sociólogo y consultor en asuntos públicos, análisis regulatorio e investigación aplicada sobre mercados regulados y políticas públicas en Chile y América Latina. Sectores de análisis: salud, energía, turismo, tecnología e infraestructura.

🌐 **Sitio oficial:** https://selguetagodoy.github.io/\n\n[![Site QA](https://github.com/selguetagodoy/selguetagodoy.github.io/actions/workflows/site-qa.yml/badge.svg)](https://github.com/selguetagodoy/selguetagodoy.github.io/actions/workflows/site-qa.yml) [![IndexNow](https://github.com/selguetagodoy/selguetagodoy.github.io/actions/workflows/indexnow.yml/badge.svg)](https://github.com/selguetagodoy/selguetagodoy.github.io/actions/workflows/indexnow.yml)

## Áreas y páginas temáticas

- [Asuntos públicos y análisis regulatorio en Chile](https://selguetagodoy.github.io/asuntos-publicos.html)
- [Mercados regulados: salud, energía, turismo y tecnología](https://selguetagodoy.github.io/mercados-regulados.html)
- [Políticas públicas](https://selguetagodoy.github.io/politicas-publicas.html)
- [Data centers e infraestructura digital en Chile](https://selguetagodoy.github.io/infraestructura-digital.html)
- [Telecomunicaciones en Chile](https://selguetagodoy.github.io/telecomunicaciones.html)
- [Inclusión digital en Chile](https://selguetagodoy.github.io/inclusion-digital.html)

## Investigación y producción pública

- [Investigación aplicada](https://selguetagodoy.github.io/investigacion.html)
- [Atlas de la Desconexión Digital de Chile](https://selguetagodoy.github.io/atlas-desconexion-digital-chile.html)
- [Índice de Vulnerabilidad Digital](https://selguetagodoy.github.io/indice-vulnerabilidad-digital-chile.html)
- [Publicaciones y análisis](https://selguetagodoy.github.io/publicaciones.html)
- [Archivo de publicaciones en LinkedIn](https://selguetagodoy.github.io/linkedin-publicaciones.html)
- [Perfiles y referencias verificadas](https://selguetagodoy.github.io/en-la-web.html)

## Identidad y trazabilidad

El sitio funciona como punto canónico para consolidar trayectoria profesional, investigación, datasets, publicaciones y referencias externas verificables. Incluye datos estructurados Schema.org, canonical URLs, `robots.txt`, `sitemap.xml` y archivos de identidad legibles por máquinas.

Nombre canónico: **Sebastián Elgueta Godoy**  
Versión internacional aceptada: **Sebastian Elgueta Godoy**

## Repositorios relacionados

- [Latin America Digital Infrastructure](https://github.com/selguetagodoy/latin-america-digital-infrastructure)
- [Chile Digital Inclusion](https://github.com/selguetagodoy/Chile-Digital-Inclusion)
- [Atlas de la Desconexión Digital de Chile](https://github.com/selguetagodoy/atlas-desconexion-digital-chile.)
- [Internet Speeds / Ookla](https://github.com/selguetagodoy/Ookla)

## Laboratorio y buscador

- [Laboratorio Digital](https://selguetagodoy.github.io/laboratorio.html): Atlas, RINDELAB y dashboard de data centers.
- [Buscar investigaciones](https://selguetagodoy.github.io/investigacion.html#buscador): índice estático generado con node scripts/build-search-index.mjs.

## Actualización automática del buscador

El buscador de investigaciones utiliza search-index.json, generado con
node scripts/build-search-index.mjs. El flujo Sync Research Search Index
de GitHub Actions regenera el catálogo al publicar o modificar páginas HTML
y mediante una comprobación semanal. Solo publica un nuevo índice si hay cambios.

Una nueva investigación se incorpora si tiene título, metadescripción,
URL canónica y datos estructurados de tipo Article, ScholarlyArticle, Report,
Dataset, ResearchProject o WebApplication. También puede indicarse la categoría
de forma explícita mediante el metadato HTML search-category con los valores
investigacion, datos, herramientas, politicas o publicaciones.

Se excluyen páginas noindex, URLs no canónicas y metadatos que identifiquen
vínculos comerciales reservados. El generador falla ante estos últimos en
lugar de añadirlos. Las aplicaciones y los respaldos en Drive/GitHub
no se modifican por este proceso.
