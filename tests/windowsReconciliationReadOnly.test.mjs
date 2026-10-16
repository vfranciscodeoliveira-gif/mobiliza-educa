import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('../js/core/windowsReconciliationReadOnly.js',import.meta.url),'utf8');
const {reconcileWindowsReadOnly}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
test('Não associa jogo a agenda sem idEvento nem inventa participantes realizados',()=>{
 const pack={formato:'mobiliza-windows-integral',tabelas:{tblAgendaEvento:[{idAgenda:1,idEvento:null,publicoEstimado:null,quantidadeTurmas:1,status:'CONCLUIDO'}],tblEvento:[{idEvento:9}],tblEventoTurma:[{idEvento:9,idTurma:3}],tblFilaEvento:[{idEvento:9,statusFila:'FINALIZADO'}]}};
 const online=[{id:'agenda-1',windowsSource:{archiveId:'abc',agendaId:1},idsTurmas:[],realizado:0},{id:'novo',realizado:3}];
 const report=reconcileWindowsReadOnly(pack,online,'abc');
 assert.equal(report.matched,1);
 assert.equal(report.rows[0].publicoPrevistoOriginal,null);
 assert.equal(report.rows[0].publicoRealizado,null);
 assert.equal(report.rows[0].registrosJogoVinculados,null);
 assert.deepEqual(report.rows[0].onlineIds,['agenda-1']);
 assert.equal(report.onlineWithoutMatch.length,1);
 assert.ok(report.rows[0].issues.includes('evento_sem_vinculo_explicito'));
});
test('Identifica correspondências ambíguas sem sobrescrever dados',()=>{
 const pack={formato:'mobiliza-windows-integral',tabelas:{tblAgendaEvento:[{idAgenda:8,idEvento:4,publicoEstimado:25}],tblEvento:[{idEvento:4}],tblEventoTurma:[],tblFilaEvento:[]}};
 const report=reconcileWindowsReadOnly(pack,[{id:'a',windowsSource:{archiveId:'x',agendaId:8}},{id:'b',windowsSource:{archiveId:'x',agendaId:8}}],'x');
 assert.equal(report.ambiguous,1);
 assert.equal(report.rows[0].publicoPrevistoOriginal,25);
 assert.equal(report.rows[0].publicoRealizado,null);
 assert.ok(report.rows[0].issues.includes('correspondencia_duplicada'));
});
