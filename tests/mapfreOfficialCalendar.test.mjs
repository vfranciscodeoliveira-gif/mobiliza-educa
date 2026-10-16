import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
const src=await readFile(new URL('../js/core/mapfreSchedule.js',import.meta.url),'utf8');
const m=await import('data:text/javascript;base64,'+Buffer.from(src).toString('base64'));
test('Agenda oficial: 10 reservas e 40 horários livres',()=>{const rows=m.mapfreRows([]);assert.equal(rows.length,50);assert.equal(rows.filter(x=>x.confirmedSchool).length,10);assert.equal(rows.filter(x=>!x.confirmedSchool).length,40);});
test('Escolas confirmadas por dia e turno',()=>{assert.equal(m.officialMapfreSchool('2026-10-19','09:30'),'EM João Franco de Godoy');assert.equal(m.officialMapfreSchool('2026-10-21','14:00'),'EM Alayde Tortorella de Faria Motta');assert.equal(m.officialMapfreSchool('2026-10-23','14:00'),'EM José Soares Marcondes');});
test('Horários adicionais permanecem livres',()=>{for(const date of m.MAPFRE_DAYS)for(const time of ['08:30','09:00','10:00','10:30','13:30','14:30','15:00','15:30'])assert.equal(m.officialMapfreSchool(date,time),'');});
test('Não atribuir automaticamente público confirmado',()=>{assert.equal(m.mapfreRows([]).find(x=>x.start==='09:30').reserved,0);assert.equal(m.mapfreRows([]).find(x=>x.start==='09:30').available,0);});
test('Bloqueia novo agendamento em sessão já confirmada',()=>{assert.throws(()=>m.validateMapfreBooking({projetoId:m.MAPFRE_PROJECT,dataInicio:'2026-10-19',dataFim:'2026-10-19',horaInicio:'09:30',previsto:10}),/Horário confirmado/);});

test('Cada sessão tem uma hora de chegada até saída',()=>{const r=m.mapfreRows([]);assert.equal(r.find(x=>x.start==='09:30').end,'10:30');assert.equal(r.find(x=>x.start==='14:00').end,'15:00');assert.equal(r.find(x=>x.start==='15:30').end,'16:30');});
