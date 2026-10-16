import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const file=fileURLToPath(new URL('../js/modules/relatorios360.js',import.meta.url));
test('Relatórios 360 carrega agenda por organização e distingue registros locais',async()=>{
 const source=await readFile(file,'utf8');
 assert.match(source,/getCloudTenantId\(\)/);
 assert.match(source,/requirePermission\('reports.read'\)/);
 assert.match(source,/getDocsFromServer\(fs.collection\(db,'tenants',tenant,'publicEvents'\)\)/);
 assert.match(source,/reportCloudEvents\.map|reportCloudEvents=snapshot\.docs\.map/);
 assert.match(source,/readLocal\('eventos'\)/);
 assert.match(source,/r360SourceDiagnostic/);
 assert.match(source,/Nenhuma ação no recorte/);
});
test('Relatórios 360 permanece válido como módulo ES',async()=>{
 const source=await readFile(file,'utf8');
 const {SourceTextModule}=await import('node:vm');
 if(typeof SourceTextModule==='function')new SourceTextModule(source);
 else assert.match(source,/export async function renderRelatorios360/);
});
