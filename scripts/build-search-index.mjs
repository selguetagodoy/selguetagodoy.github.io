// Índice estático de contenidos públicos. Evita archivos privados y metadatos de vínculos comerciales.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const curated=[
["mercados-regulados.html","politicas","salud energia turismo tecnologia regulación institucional mercados regulados"],
["politicas-publicas.html","politicas","politicas publicas implementación instituciones presupuesto"],
["asuntos-publicos.html","politicas","asuntos publicos regulación relaciones institucionales"],
["regulacion-telecomunicaciones-chile.html","investigacion","telecomunicaciones normas regulación derechos usuarios"],
["telecomunicaciones.html","investigacion","subtel fibra optica 5g servicios publicos"],
["atlas-desconexion-digital-chile.html","investigacion","atlas cotel conectividad comunal ivd territorial"],
["indice-vulnerabilidad-digital-chile.html","investigacion","indice vulnerabilidad digital ivd brecha"],
["conectividad-funcional-chile.html","investigacion","internet hogares conectividad funcional"],
["autonomia-digital-personas-mayores-chile.html","investigacion","personas mayores autonomía digital inclusión"],
["inclusion-digital.html","investigacion","inclusion brecha digital desigualdad"],
["benchmark-data-centers-2026.html","investigacion","data centers benchmarking hubs estudio competitividad"],
["dashboard-data-centers-2026.html","herramientas","dashboard panel interactivo capacidad instalada 10 hubs"],
["data-centers-chile-2026.html","investigacion","data centers chile capacidad pipeline mercado"],
["energia-data-centers-chile-2026.html","investigacion","energia electricidad data centers permisos inversión"],
["permisos-data-centers-chile.html","investigacion","permisos infraestructura digital"],
["permisos-data-centers-chile-2026.html","investigacion","permisos data centers tramitacion"],
["infraestructura-digital.html","investigacion","infraestructura digital mercados"],
["datos-abiertos.html","datos","datos abiertos reproducibilidad metodologia"],
["dataset-chile-digital-inclusion.html","datos","dataset inclusion digital hogares"],
["dataset-chile-state-institutional-map.html","datos","estado instituciones chile mapa institucional"],
["dataset-stakeholder-routes-chile.html","datos","stakeholder rutas instituciones"],
["dataset-velocidades-internet.html","datos","ookla velocidad internet chile colombia"],
["dataset-latin-america-digital-infrastructure.html","datos","infraestructura digital latinoamerica observatorio"],
["movilidad-urbana-geografia-oportunidades-forestal.html","investigacion","movilidad urbana geografía forestal viña del mar"],
["territorio.html","investigacion","territorio politicas publicas desarrollo"],
["metodologia-reproducibilidad.html","datos","metodologia reproducibilidad fuentes"],
["publicaciones.html","publicaciones","publicaciones articulos academia"],
["linkedin-publicaciones.html","publicaciones","articulos linkedin reflexiones"],
["laboratorio.html","herramientas","laboratorio aplicaciones atlas rindelab data centers"],
["proyectos.html","herramientas","proyectos repositorios aplicaciones herramientas"]
];
const external=[
{title:"Atlas de la Desconexión Digital — Visualizador comunal",url:"https://atlas-visualizador-cotel.vercel.app/",description:"Explora mapas comunales, conectividad e indicadores del Atlas con búsqueda y ranking.",category:"herramientas",keywords:"atlas cotel visualizador mapa comunas datos brecha digital"},
{title:"RINDELAB — Comparador vehicular",url:"https://selguetagodoy.github.io/rindelab/",description:"Consulta homologaciones y compara escenarios de costos de bencina, diésel y electricidad.",category:"herramientas",keywords:"rindelab autos vehículos movilidad energía eficiencia costos"}
];
const decode=s=>s.replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&#39;/g,"'");
const get=(html,re)=>decode(html.match(re)?.[1]||"").trim();
const results=[];
for(const [file,category,keywords] of curated){
const filepath=path.join(root,file);if(!fs.existsSync(filepath))throw Error("Falta página pública: "+file);
const html=fs.readFileSync(filepath,"utf8");
const title=get(html,/<title>([^<]+)<\/title>/i).replace(/\s+[|·]\s+Sebasti[aá]n Elgueta Godoy.*$/i,"").trim();
const description=get(html,/<meta\s+name="description"\s+content="([^"]+)"/i);
if(!title||!description)throw Error("Falta metadata: "+file);
results.push({title,url:file,description,category,keywords});
}
// Descubrimiento automático de nuevas investigaciones públicas y verificables.
// Excluye páginas de navegación, fuentes privadas y documentos no canónicos.
// Opt-in opcional: <meta name="search-category" content="investigacion">.
const categories=new Set(["investigacion","datos","herramientas","politicas","publicaciones"]);
const known=new Set(results.map(item=>item.url));
const autoTypes=new Set(["Article","ScholarlyArticle","Report","Dataset","ResearchProject","WebApplication"]);
const getMeta=(html,name)=>{
  for(const match of html.matchAll(/<meta\s+name="([^"]+)"\s+content="([^"]*)"/gi)){
    if(match[1].toLowerCase()===name.toLowerCase())return decode(match[2]).trim();
  }
  return "";
};
for(const file of fs.readdirSync(root).filter(f=>f.endsWith(".html")).sort()){
  if(known.has(file)||["index.html","contacto.html","bio.html","bio-en.html"].includes(file))continue;
  const html=fs.readFileSync(path.join(root,file),"utf8");
  if(/<meta[^>]+name="robots"[^>]+content="[^"]*noindex/i.test(html))continue;
  if(getMeta(html,"search-index").toLowerCase()==="no")continue;
  const title=get(html,/<title>([^<]+)<\/title>/i).replace(/\s+[|·]\s+Sebasti[aá]n Elgueta Godoy.*$/i,"").trim();
  const description=getMeta(html,"description");
  const canonical=get(html,/<link\s+rel="canonical"\s+href="([^"]+)"/i);
  if(!title||!description||canonical!=="https://selguetagodoy.github.io/"+file)continue;
  const explicit=getMeta(html,"search-category").toLowerCase();
  if(explicit&&!categories.has(explicit))throw Error("Categoría de búsqueda no autorizada: "+file);
  const types=new Set();
  for(const match of html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)){
    let ld;try{ld=JSON.parse(match[1])}catch{continue}
    for(const node of [ld,...(Array.isArray(ld["@graph"])?ld["@graph"]:[])]){
      for(const type of [].concat(node["@type"]||[]))types.add(type);
    }
  }
  if(!explicit&&![...types].some(t=>autoTypes.has(t)))continue;
  const category=explicit||(types.has("Dataset")?"datos":types.has("WebApplication")?"herramientas":"investigacion");
  const keywords=getMeta(html,"keywords")||title;
  results.push({title,url:file,description,category,keywords});
  known.add(file);
}
results.push(...external);
for(const r of results){if(/Prospectiva|CSL Behring|Vertex|Electrolux|Coordenadas P[uú]blicas/i.test(JSON.stringify(r)))throw Error("Entidad comercial inesperada en índice "+r.url)}
const target=path.join(root,"search-index.json");fs.writeFileSync(target,JSON.stringify(results,null,2)+"\n","utf8");
console.log("Índice de búsqueda actualizado:",results.length,"recursos de acceso público");