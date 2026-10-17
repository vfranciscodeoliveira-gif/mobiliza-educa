import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
const repoSource=await readFile(new URL('../js/core/educationRepository.js',import.meta.url),'utf8');
const ui=await readFile(new URL('../js/modules/admin.js',import.meta.url),'utf8');
test('Registro ausente explica cliente, entidade e ID sem criar duplicata',()=>{assert.match(repoSource,/Registro não localizado no Firestore desta organização/);assert.match(repoSource,/if\(!old\.exists\(\)\)throw/);});
test('Cadastro só muda interface depois da confirmação online',()=>{assert.match(ui,/await saveEducation\(targetEntity,pending,\{create:!row\}\)/);assert.doesNotMatch(ui,/all\[i\]=\{\.\.\.all\[i\],\.\.\.data/);});
