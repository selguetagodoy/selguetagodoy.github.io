const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path');
(async()=>{
 const b=await chromium.launch(process.platform==='win32'?{channel:'chrome',headless:true}:{headless:true,args:['--no-sandbox']});
 try{
  const p=await b.newPage();
  await p.goto('https://www.gildemeisterretail.cl/marcas/',{waitUntil:'domcontentloaded',timeout:40000});
  await p.waitForSelector('article.card--car a.card__title-link',{timeout:30000});
  const all=new Map();
  for(let page=1;page<=5;page++){
   await p.waitForFunction(()=>document.querySelectorAll('article.card--car a.card__title-link').length>0,{timeout:20000});
   const items=await p.locator('article.card--car').evaluateAll(cards=>cards.map(c=>{
     const brand=c.querySelector('.card__brand')?.textContent.trim();
     const family=c.querySelector('a.card__title-link')?.textContent.trim();
     const source=c.querySelector('a.card__title-link')?.href;
     return {brand,family,source,retailer:'Gildemeister Retail',observedAt:'2026-10-21',listing:'new',technology:null,listPriceClp:null,taxIncluded:null};
   }).filter(x=>x.brand&&x.family&&/^https:\/\/www\.gildemeisterretail\.cl\/marcas\//.test(x.source)));
   console.log('PAGE',page,items.length);
   for(const x of items)all.set(x.source,x);
   if(page===5)break;
   const b2=p.locator('button').filter({hasText:new RegExp('^'+(page+1)+'$')}).last();
   if(!await b2.count())throw Error('Missing pagination button '+(page+1));
   const old=items[0]?.source;
   await b2.click();
   await p.waitForFunction(old=>{const a=document.querySelector('article.card--car a.card__title-link');return a&&a.href!==old;},old,{timeout:22000});
   await p.waitForTimeout(650);
  }
  const items=[...all.values()];
  const currentDate=process.argv.some(x=>x.startsWith('--out='))?new Date().toISOString().slice(0,10):'2026-10-21';
  for(const item of items)item.observedAt=currentDate;
  if(items.length<48)throw Error('Incomplete Gildemeister listing '+items.length);
  fs.writeFileSync(process.argv.find(x=>x.startsWith('--out='))?.slice(6)||path.join(__dirname,'../rindelab/data/dealer-gildemeister-20261021.json'),JSON.stringify({schemaVersion:1,observedAt:currentDate,sources:['https://www.gildemeisterretail.cl/marcas/'],records:items,errors:[]},null,2)+'\n');
  console.log('GILDE UNIQUE',items.length);
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
