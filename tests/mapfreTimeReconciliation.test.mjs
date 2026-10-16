import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
const src=await readFile(new URL('../js/modules/appointments.js',import.meta.url),'utf8');
test('Conflito exibe escola e previsto',()=>{assert.match(src,/data-mapfre-inspect/);assert.match(src,/ctx\.schools\.find/);assert.match(src,/r\.previsto/);});
test('Conferência abre o mesmo registro, não cria cópia',()=>{assert.match(src,/if\(record\)edit\(record\)/);});
