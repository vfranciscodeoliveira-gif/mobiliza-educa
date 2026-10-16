import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
const ui=await readFile(new URL('../js/modules/appointments.js',import.meta.url),'utf8');
test('Grade lista reservas anteriores e acesso à edição do próprio agendamento',()=>{assert.match(ui,/data-mapfre-review/);assert.match(ui,/if\(row\)edit\(row\)/);});
test('HTML MAPFRE não contém abertura acidental de string',()=>{assert.doesNotMatch(ui,/<\/p><p>'19 a 23\/10/);});
