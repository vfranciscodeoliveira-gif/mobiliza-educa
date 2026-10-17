import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('../js/core/institutionPolicy.js',import.meta.url),'utf8');
const {normalizeInstitutionDraft,SEMOB_PRESET}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
test('SEMOB possui dados completos para cadastro',()=>{const x=normalizeInstitutionDraft(SEMOB_PRESET);assert.equal(x.municipality,'Presidente Prudente');assert.equal(x.state,'SP');});
test('Bloqueia duplicação da SEMOB no mesmo município',()=>{assert.throws(()=>normalizeInstitutionDraft(SEMOB_PRESET,[{name:'SEMOB — Presidente Prudente',municipality:'Presidente Prudente',state:'SP'}]),/já cadastrada/);});
test('Não aceita UF inválida',()=>{assert.throws(()=>normalizeInstitutionDraft({...SEMOB_PRESET,state:'XYZ'}),/UF/);});
test('Não confunde mesma sigla de municípios distintos',()=>{assert.equal(normalizeInstitutionDraft(SEMOB_PRESET,[{...SEMOB_PRESET,municipality:'Outra Cidade'}]).state,'SP');});
