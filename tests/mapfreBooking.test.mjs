import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
const code=await readFile(new URL('../js/core/mapfreSchedule.js',import.meta.url),'utf8');
const {validateMapfreBooking}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
const booking={projetoId:'na-pista-certa-mapfre',dataInicio:'2026-10-19',dataFim:'2026-10-19',horaInicio:'08:30',horaFim:'09:30',previsto:25};
test('Aceita agendamento até limite',()=>assert.equal(validateMapfreBooking(booking,[]).remaining,15));
test('Impede capacidade acima de 40 em horário sobreposto',()=>assert.throws(()=>validateMapfreBooking(booking,[{id:'a',projetoId:'na-pista-certa-mapfre',status:'Confirmado',dataInicio:'2026-10-19',horaInicio:'08:30',horaFim:'09:30',previsto:20}]),/excedida/));
test('Impede dias e horários fora da grade',()=>assert.throws(()=>validateMapfreBooking({...booking,dataInicio:'2026-10-24',dataFim:'2026-10-24'},[]),/dias autorizados/));
test('Ignora ações de outros projetos',()=>assert.equal(validateMapfreBooking(booking,[{id:'a',projetoId:'agente-mirim',dataInicio:'2026-10-19',horaInicio:'08:30',horaFim:'09:30',previsto:40}]).remaining,15));
