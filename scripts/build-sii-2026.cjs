// Generate static, auditable SII 2026 lookup from its official public workbook.
// Usage: npm install --no-save exceljs && node scripts/build-sii-2026.cjs <input.xlsx>
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const ExcelJS=require('exceljs');
const input=process.argv[2];if(!input)throw Error('Usage: node scripts/build-sii-2026.cjs <sii.xlsx>');
const base=path.resolve(__dirname,'../rindelab/sii/data');
function clean(x){return x==null?'':String(x).trim();}
function key(s){return clean(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z0-9]+/g,' ').trim();}
async function main(){
 const wb=new ExcelJS.Workbook();await wb.xlsx.readFile(input);
 const sheet=wb.getWorksheet('LIV2026');if(!sheet)throw Error('Expected official LIV2026 sheet');
 const hdr=sheet.getRow(12).values;const expected={1:'Código SII',2:'Año',3:'Tipo',4:'Marca',5:'Modelo',6:'Versión',17:'Tasación 2026',18:'Permiso 2026'};
 for(const [i,label] of Object.entries(expected)){if(hdr[+i]!==label)throw Error('Header mismatch at '+i+': '+hdr[+i]);}
 const buckets=new Map();const brands=new Map(),codes=new Set();let rows=0,skipped=0,missingValue=0;
 sheet.eachRow((row,n)=>{
  if(n<=12)return;
  const c=row.values,code=clean(c[1]),year=Number(c[2]),brand=clean(c[4]);
  if(!/^[A-Z]{2}[0-9]{7}$/.test(code)||!Number.isInteger(year)||year<1950||year>2027||!brand){skipped++;return;}
  const tax=Number(c[17]),permit=Number(c[18]);
  const record=[code,year,brand,clean(c[5]),clean(c[6]),Number.isFinite(tax)&&tax>0?Math.round(tax):null,Number.isFinite(permit)&&permit>0?Math.round(permit):null,clean(c[3]),clean(c[10])];
  if(!record[5]||!record[6])missingValue++;
  const letter=key(brand)[0]||'_';const bucket=/^[A-Z]$/.test(letter)?letter:'_';
  if(!buckets.has(bucket))buckets.set(bucket,[]);
  buckets.get(bucket).push(record);
  const bkey=key(brand);if(!brands.has(bkey))brands.set(bkey,{name:brand,bucket,count:0});
  brands.get(bkey).count++;
  codes.add(code+'-'+year);rows++;
 });
 fs.mkdirSync(base,{recursive:true});
 const manifest={year:2026,source:'https://www.sii.cl/servicios_online/tasacion_fiscal_vehiculos/liv2026.xlsx',publication:'Resoluciones Exentas SII N°6 y N°96 de 2026',retrieved:'2026-10-17',sha256:crypto.createHash('sha256').update(fs.readFileSync(input)).digest('hex'),fields:['codigoSii','fabricacion','marca','modelo','version','tasacionClp','permisoClp','tipo','combustible'],records:rows,skipped,missingValue,uniqueCodeYear:codes.size,buckets:[],brands:[...brands.values()].sort((a,b)=>a.name.localeCompare(b.name,'es'))};
 for(const [bucket,arr] of [...buckets].sort((a,b)=>a[0].localeCompare(b[0]))){
  const filename='l'+bucket+'.json';fs.writeFileSync(path.join(base,filename),JSON.stringify(arr));
  manifest.buckets.push({bucket,file:filename,records:arr.length,bytes:fs.statSync(path.join(base,filename)).size});
 }
 fs.writeFileSync(path.join(base,'index.json'),JSON.stringify(manifest));
 console.log(JSON.stringify({records:rows,skipped,missingValue,brands:manifest.brands.length,uniqueCodeYear:codes.size,buckets:manifest.buckets,sha256:manifest.sha256},null,2));
}
main().catch(e=>{console.error(e.stack);process.exit(1)});
