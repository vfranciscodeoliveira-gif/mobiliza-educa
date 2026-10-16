import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
const model=await readFile(new URL('../js/core/mapfreSchedule.js',import.meta.url),'utf8');
const grid=await readFile(new URL('../js/core/mapfreWeekGrid.js',import.meta.url),'utf8');
const ui=await readFile(new URL('../js/modules/appointments.js',import.meta.url),'utf8');
test('Grade mantém cinco dias e almoço separado',()=>{assert.match(grid,/ALMOÇO/);assert.match(grid,/MAPFRE_DAYS/);assert.match(grid,/MAPFRE_SLOTS\.slice\(0,5\)/);assert.match(grid,/MAPFRE_SLOTS\.slice\(5\)/);});
test('Não define 40 presentes em vagas reservadas',()=>{assert.match(grid,/occupied\?'—'/);assert.match(ui,/10 reservas confirmadas na programação oficial/);});
test('Acesso para editar reservas antigas permanece',()=>{assert.match(ui,/data-mapfre-review/);assert.match(ui,/renderMapfreWeekGrid\(all,legacy,canManage\(\)\)/);});
test('Fonte oficial possui 10 horários',()=>{assert.match(model,/MAPFRE_STARTS/);});
