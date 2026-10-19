#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),cp=require('node:child_process');
const repo=path.resolve(__dirname,'../..'),dir=fs.mkdtempSync(path.join(os.tmpdir(),'rindelab-price-queue-'));
try{
 const scripts=path.join(dir,'scripts'),data=path.join(dir,'rindelab/sii');
 fs.mkdirSync(scripts,{recursive:true});fs.mkdirSync(data,{recursive:true});
 fs.copyFileSync(path.join(repo,'scripts/rindelab-price-queue.cjs'),path.join(scripts,'rindelab-price-queue.cjs'));
 fs.copyFileSync(path.join(repo,'scripts/audit-price-sources.cjs'),path.join(scripts,'audit-price-sources.cjs'));
 const source=fs.readFileSync(path.join(repo,'rindelab/sii/bandeja-precios-electromovilidad.csv'),'utf8').replace(/^\uFEFF/,'');
 const header=source.split('\n')[0],row=source.split('\n')[1].split(',');
 assert.equal(row.length,23);
 row[9]='listo_para_importar';row[10]='JAC';row[11]='Caso Prueba EV';row[12]='Versión 2026';
 row[13]='2026';row[14]='EV';row[15]='12345000';row[16]='CLP';row[17]='lista_sin_bonos';
 row[18]='https://www.jacautoschile.cl/modelos/electricos/jac-ignite-30x/';
 row[19]='2026-10-19';row[20]='';row[21]='Tabla oficial indica precio lista 12345000 CLP sin bonos';
 row[22]='Prueba de integración; jamás publicar datos simulados';
 const file=path.join(data,'bandeja-precios-electromovilidad.csv');
 fs.writeFileSync(file,'\uFEFF'+header+'\n'+row.join(',')+'\n');
 const catalog=path.join(data,'commercial-2026.json');fs.writeFileSync(catalog,'[]\n');
 const run=flags=>cp.spawnSync(process.execPath,[path.join(scripts,'rindelab-price-queue.cjs'),...flags],{encoding:'utf8'});
 let result=run(['--dry-run']);assert.equal(result.status,0,result.stderr);
 assert.equal(JSON.parse(fs.readFileSync(catalog,'utf8')).length,0,'Simulación modificó datos públicos');
 result=run(['--apply']);assert.equal(result.status,0,result.stderr);
 let items=JSON.parse(fs.readFileSync(catalog,'utf8'));assert.equal(items.length,1);
 assert.equal(items[0].priceListClp,12345000);assert.equal(items[0].technology,'EV');
 assert.match(fs.readFileSync(file,'utf8'),/ya_importado/);
 result=run(['--apply']);assert.equal(result.status,0,result.stderr);
 assert.equal(JSON.parse(fs.readFileSync(catalog,'utf8')).length,1,'Segunda importación duplicó una versión');
 fs.writeFileSync(file,'\uFEFF'+header+'\n'+row.join(',')+'\n');
 items[0].priceListClp=99999999;fs.writeFileSync(catalog,JSON.stringify(items)+'\n');
 result=run(['--apply']);assert.notEqual(result.status,0,'No se bloqueó conflicto de precio');
 assert.equal(JSON.parse(fs.readFileSync(catalog,'utf8'))[0].priceListClp,99999999,'Conflicto alteró el catálogo');
 row[18]='http://fuente-no-autorizada.cl/';fs.writeFileSync(file,'\uFEFF'+header+'\n'+row.join(',')+'\n');fs.writeFileSync(catalog,'[]\n');
 result=run(['--apply']);assert.notEqual(result.status,0,'No se bloqueó dominio no autorizado');
 assert.equal(JSON.parse(fs.readFileSync(catalog,'utf8')).length,0,'Fuente no autorizada alteró catálogo');
 process.stdout.write('OK: bandeja CSV, simulación sin cambios, importación idempotente, conflicto y dominio prohibido\n');
}finally{fs.rmSync(dir,{recursive:true,force:true});}
