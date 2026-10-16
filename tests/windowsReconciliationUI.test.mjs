import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const ui=await readFile(new URL('../js/modules/windowsReconciliation.js',import.meta.url),'utf8');
const agenda=await readFile(new URL('../js/modules/appointments.js',import.meta.url),'utf8');
test('Interface importa módulos existentes e exporta renderização',()=>{
 assert.match(ui,/export async function renderWindowsReconciliation/);
 assert.match(ui,/reconcileWindowsReadOnly\(archive\.pack,ctx\.rows,hash\)/);
 assert.match(ui,/loadWindowsArchive\(hash,ctx\.tenantId\)/);
});
test('Agenda disponibiliza botão e ação de abrir reconciliação',()=>{
 assert.match(agenda,/id="apReconcile"/);
 assert.match(agenda,/qs\('#apReconcile'\)\.onclick/);
});
test('Painel é somente leitura, sem chamada de gravação',()=>{
 assert.doesNotMatch(ui,/\b(?:setDoc|updateDoc|addDoc|deleteDoc|writeBatch|saveAppointment|deleteAppointment)\s*\(/);
 assert.match(ui,/publicoRealizado|null/);
});
