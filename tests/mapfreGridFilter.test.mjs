import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
const grid=await readFile(new URL('../js/core/mapfreWeekGrid.js',import.meta.url),'utf8');
const ui=await readFile(new URL('../js/modules/appointments.js',import.meta.url),'utf8');
test('Filtro diário reduz a grade sem mudar a fonte de reservas',()=>{assert.match(grid,/selectedDay==='all'/);assert.match(grid,/MAPFRE_DAYS\.filter/);});
test('Alerta permite identificar as reservas legadas',()=>{assert.match(grid,/data-mapfre-conflict/);assert.match(ui,/apMapfreConflictInfo/);assert.match(ui,/matches=legacy\.filter/);});
test('Somente uma grade inicial é exibida',()=>{assert.equal((ui.match(/renderMapfreWeekGrid\(all,legacy,canManage\(\)\)/g)||[]).length,1);});
