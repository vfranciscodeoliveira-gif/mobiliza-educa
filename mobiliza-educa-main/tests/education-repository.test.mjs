import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {test} from 'node:test';
let code=await readFile(new URL('../js/core/educationRepository.js',import.meta.url),'utf8');
code=code.replace(/^import .*;\n/gm,'');
code="const cloudConfig={};const getCloudUser=async()=>null;const getCloudTenantId=()=>globalThis.testTenant;"+code;
globalThis.window={addEventListener(){}};
const repo=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
test('não retorna registros locais nem de outra organização',()=>{
 globalThis.testTenant='a';assert.deepEqual(repo.educationRows('escolas'),[]);
 globalThis.testTenant='b';assert.deepEqual(repo.educationRows('escolas'),[]);
 globalThis.testTenant='';assert.deepEqual(repo.educationRows('escolas'),[]);
});
test('cadastros exigem autenticação Firebase para leitura e escrita',async()=>{
 globalThis.testTenant='a';
 await assert.rejects(repo.loadEducation(),/Conecte sua conta Firebase/);
 await assert.rejects(repo.saveEducation('escolas',{id:'a',nome:'Escola'}),/Conecte sua conta Firebase/);
 await assert.rejects(repo.deleteEducation('escolas','a'),/Conecte sua conta Firebase/);
});
test('coleções administrativas reconhecidas sem aceitar coleção arbitrária',()=>{
 assert.equal(repo.supportsEducationEntity('escolas'),true);
 assert.equal(repo.supportsEducationEntity('turmas'),true);
 assert.equal(repo.supportsEducationEntity('platformOwners'),false);
});
