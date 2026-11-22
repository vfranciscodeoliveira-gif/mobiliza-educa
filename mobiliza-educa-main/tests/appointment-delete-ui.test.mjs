import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {APPOINTMENT_STATUSES,localDay,appointmentConflicts} from '../js/core/appointmentPolicy.js';
const {JSDOM}=createRequire((process.env.ACL_TEST_NODE_MODULES||new URL('../node_modules',import.meta.url).pathname)+'/../package.json')('jsdom');
let source=(await readFile(new URL('../js/modules/appointments.js',import.meta.url),'utf8')).replace(/^import .*;\n/gm,'');
source='const {APPOINTMENT_STATUSES,localDay,appointmentConflicts}=globalThis.delPolicy;const loadAppointments=()=>globalThis.delLoad();const deleteAppointment=(...a)=>globalThis.delRemove(...a);const permissionAllowed=(a,p)=>a.permissions.includes(p);\n'+source;
globalThis.delPolicy={APPOINTMENT_STATUSES,localDay,appointmentConflicts};
const {renderAppointments}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const row={id:'a1',nome:'Atendimento teste',origem:'Demanda espontânea',solicitante:'Grupo teste',dataInicio:'2026-10-19',dataFim:'2026-10-19',horaInicio:'09:00',horaFim:'10:00',status:'Confirmado',idsTurmas:[],previsto:0,realizado:0,updatedAt:{seconds:1,nanoseconds:0}};
function setup(manage=true){const dom=new JSDOM('<html><head><link data-appointments></head><body><main></main></body></html>');globalThis.window=dom.window;globalThis.document=dom.window.document;dom.window.HTMLElement.prototype.scrollIntoView=function(){};const ctx={tenantId:'t',access:{allSchools:true,permissions:manage?['events.read','events.manage']:['events.read']},schools:[],classes:[],rows:[structuredClone(row)]};globalThis.delLoad=async()=>structuredClone(ctx);return {host:document.querySelector('main'),ctx};}
test('exclusão exige confirmação, remove registro, mostra sucesso e aparece na ficha/edição',async()=>{
 const {host,ctx}=setup();let calls=0,confirmation='';globalThis.delRemove=async(id,c,v)=>{calls++;assert.equal(id,'a1');assert.deepEqual(v,row.updatedAt);ctx.rows=[];};window.confirm=text=>{confirmation=text;return false;};await renderAppointments(host);
 await host.querySelector('[data-delete]').onclick();assert.equal(calls,0);assert.match(confirmation,/Atendimento teste/);assert.match(confirmation,/19\/10\/2026/);
 host.querySelector('[data-details]').onclick();assert.ok(host.querySelector('#apDetailDelete'));host.querySelector('#apDetailEdit').onclick();assert.ok(host.querySelector('#apEditDelete'));
 window.confirm=()=>true;await host.querySelector('#apEditDelete').onclick();assert.equal(calls,1);assert.equal(host.querySelector('[data-delete]'),null);assert.match(host.querySelector('#apMessage').textContent,/excluído da agenda/);
});
test('permissão negada mantém registro com mensagem; perfil de consulta não oferece excluir',async()=>{
 const {host}=setup();window.confirm=()=>true;globalThis.delRemove=async()=>{const e=new Error('Denied');e.code='permission-denied';throw e;};await renderAppointments(host);await host.querySelector('[data-delete]').onclick();assert.ok(host.querySelector('[data-delete]'));assert.match(host.querySelector('#apMessage').textContent,/regras atuais do Firestore/);
 const read=setup(false);await renderAppointments(read.host);assert.equal(read.host.querySelector('[data-delete]'),null);read.host.querySelector('[data-details]').onclick();assert.equal(read.host.querySelector('#apDetailDelete'),null);
});

test('responsável de escola consulta ficha sem importação, arquivo Windows ou gestão',async()=>{const {host,ctx}=setup(true);ctx.access.allSchools=false;ctx.rows[0].windowsSource={archiveId:'a'.repeat(64),agendaId:1};globalThis.delLoad=async()=>structuredClone(ctx);await renderAppointments(host);assert.equal(host.querySelector('#apWindowsHistory'),null);assert.equal(host.querySelector('#apWindows'),null);assert.equal(host.querySelector('#apNewSchool'),null);host.querySelector('[data-details]').click();assert.equal(host.querySelector('#apOriginal'),null);assert.equal(host.querySelector('#apDetailDelete'),null);});
