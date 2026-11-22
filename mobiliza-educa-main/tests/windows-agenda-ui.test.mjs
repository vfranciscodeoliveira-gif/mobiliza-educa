import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import * as policy from '../js/core/windowsAgendaPolicy.js';
import {APPOINTMENT_STATUSES,appointmentConflicts} from '../js/core/appointmentPolicy.js';
import {normalizeIntegral} from '../js/core/windowsIntegralPolicy.js';
const req=createRequire((process.env.ACL_TEST_NODE_MODULES || new URL('./node_modules',import.meta.url).pathname)+'/package.json');
const {JSDOM}=req('jsdom');
let source=await readFile(new URL('../js/modules/windowsAgendaImport.js',import.meta.url),'utf8');
source=source.replace(/^import .*;\n/gm,'');
source='const {loadAppointments,completeWindowsAppointmentClasses,importWindowsAppointment,checkWindowsPackage,windowsDocumentId,windowsStatus,schoolSuggestion,windowsClassSuggestion,mapWindowsAppointment,APPOINTMENT_STATUSES,appointmentConflicts,normalizeIntegral,saveWindowsArchive,permissionAllowed,importWindowsSchool,loadWindowsSchoolCatalog}=globalThis.wiDeps;\n'+source;
const ctx={tenantId:'t1',schools:[{id:'s1',nome:'Escola Gilza'}],classes:[],rows:[]};
const calls=[];globalThis.wiDeps={...policy,APPOINTMENT_STATUSES,appointmentConflicts,loadAppointments:async()=>ctx,importWindowsAppointment:async(d,c,id)=>{calls.push(id);if(ctx.rows.some(r=>r.id===id))return false;ctx.rows.push({...d,id});return true;}};
globalThis.wiDeps.loadWindowsSchoolCatalog=async()=>ctx;globalThis.wiDeps.normalizeIntegral=normalizeIntegral;globalThis.wiDeps.permissionAllowed=()=>true;globalThis.wiDeps.importWindowsSchool=async(s,b,c)=>{const id='windows-school-'+b+'-'+s.idEscola;ctx.schools.push({id,nome:s.nome});return {id,created:true};};
const archived=[];globalThis.wiDeps.saveWindowsArchive=async(p,m)=>{archived.push({p,m});return 'a'.repeat(64);};
const mod=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
test('XML export parses, school mapping and review prevent premature save; rerun skips',async()=>{
 const dom=new JSDOM('<section id="host"></section>');globalThis.DOMParser=dom.window.DOMParser;globalThis.document=dom.window.document;dom.window.HTMLElement.prototype.scrollIntoView=function(){};
 const xml='<mobilizaAgenda versao="1" banco="Windows"><escolas><escola><idEscola>1</idEscola><nome>Escola Gilza</nome></escola></escolas><turmas/><agendamentos><agendamento><idAgenda>1</idAgenda><idEscola>1</idEscola><titulo>Visita</titulo><dataInicio>2026-10-05T09:00:00</dataInicio><dataFim>2026-10-05T10:00:00</dataFim><status>CONFIRMADO</status><ativo>1</ativo><vinculos/></agendamento></agendamentos></mobilizaAgenda>';
 assert.equal(mod.parseWindowsFile(xml).agendamentos.length,1);
 const host=document.querySelector('#host');await mod.renderWindowsImport(host);
 await host.querySelector('#wiFile').onchange({target:{files:[{size:xml.length,text:async()=>xml}]}});
 assert.equal(host.querySelector('[data-school]').value,'s1');assert.equal(host.querySelector('[data-select]').checked,false);
 await host.querySelector('#wiSave').onclick();assert.equal(calls.length,0);
 host.querySelector('#wiAll').onclick();await host.querySelector('#wiSave').onclick();assert.deepEqual(calls,['windows-agenda-Windows-1']);assert.equal(host.querySelector('[data-select]').disabled,true);
 host.querySelector('#wiAll').onclick();await host.querySelector('#wiSave').onclick();assert.equal(calls.length,1);
});
test('integral import archives untouched source before creating agenda and preserves original status',async()=>{
 const pack=JSON.parse(await readFile(new URL('../../entregas/agenda_integral/Agenda_Integral_06102026.json',import.meta.url),'utf8'));
 const dom=new JSDOM('<section id="host"></section>');globalThis.DOMParser=dom.window.DOMParser;globalThis.document=dom.window.document;dom.window.HTMLElement.prototype.scrollIntoView=function(){};
 ctx.rows=[];ctx.schools=[{id:'s1',nome:pack.tabelas.tblEscola.find(s=>s.idEscola===3).nome}];const host=document.querySelector('#host');await mod.renderWindowsImport(host);
 const json=JSON.stringify(pack);await host.querySelector('#wiFile').onchange({target:{files:[{size:json.length,text:async()=>json}]}});
 const entry=host.querySelector('[data-select="0"]');assert.equal(entry.disabled,false);entry.checked=true;entry.onchange();host.querySelector('#wiConflicts').checked=true;await host.querySelector('#wiSave').onclick();
 assert.equal(archived.length,1);assert.deepEqual(archived[0].p,pack);assert.equal(ctx.rows.length,1);assert.equal(ctx.rows[0].status,policy.windowsStatus(pack.tabelas.tblAgendaEvento[0]));assert.equal(host.querySelector('[data-select="0"]').disabled,false);
});
test('administrator imports missing school in same screen and agenda becomes selectable',async()=>{
 const dom=new JSDOM('<section id="host"></section>');globalThis.document=dom.window.document;dom.window.HTMLElement.prototype.scrollIntoView=function(){};
 ctx.schools=[];ctx.rows=[];const p={versao:1,banco:'Windows',escolas:[{idEscola:42,nome:'Escola Nova',cidade:'Presidente Prudente'}],turmas:[],agendamentos:[{idAgenda:999,idEscola:42,titulo:'Agente Mirim',status:'CONFIRMADO',ativo:1,dataInicio:'2026-10-12T09:00:00',dataFim:'2026-10-12T10:00:00'}]};
 const host=document.querySelector('#host');await mod.renderWindowsImport(host);const text=JSON.stringify(p);await host.querySelector('#wiFile').onchange({target:{files:[{size:text.length,text:async()=>text}]}});
 assert.equal(host.querySelector('[data-select]').disabled,true);host.querySelector('#wiMarkSchools').onclick();assert.equal(host.querySelector('[data-school]').value,'__create__');assert.equal(ctx.schools.length,0);
 await host.querySelector('#wiCreateSchools').onclick();assert.equal(ctx.schools.length,1);assert.equal(host.querySelector('[data-school]').value,'windows-school-Windows-42');assert.equal(host.querySelector('[data-select]').disabled,false);assert.equal(host.querySelector('[data-select]').checked,false);assert.match(host.querySelector('#wiMessage').textContent,/1 escolas importadas/);
 host.querySelector('#wiAll').onclick();await host.querySelector('#wiSave').onclick();assert.equal(ctx.rows[0].idEscola,'windows-school-Windows-42');
});
test('school-only mode imports school with no appointment and leaves agenda untouched',async()=>{
 const dom=new JSDOM('<section id="host"></section>');globalThis.document=dom.window.document;dom.window.HTMLElement.prototype.scrollIntoView=function(){};ctx.schools=[];ctx.rows=[];
 const p={versao:1,banco:'Windows',escolas:[{idEscola:1,nome:'Escola com agenda'},{idEscola:2,nome:'Escola sem agenda'}],turmas:[],agendamentos:[{idAgenda:1,idEscola:1,titulo:'Visita',status:'CONFIRMADO',ativo:1,dataInicio:'2026-10-12T09:00:00',dataFim:'2026-10-12T10:00:00'}]};
 const host=document.querySelector('#host');await mod.renderWindowsImport(host,null,{schoolsOnly:true});const text=JSON.stringify(p);await host.querySelector('#wiFile').onchange({target:{files:[{size:text.length,text:async()=>text}]}});
 assert.equal(host.querySelectorAll('[data-school]').length,2);assert.ok(host.querySelector('#wiSave').closest('[hidden]'));host.querySelector('#wiMarkSchools').onclick();await host.querySelector('#wiCreateSchools').onclick();assert.equal(ctx.schools.length,2);assert.ok(ctx.schools.some(s=>s.nome==='Escola sem agenda'));assert.equal(ctx.rows.length,0);assert.match(host.querySelector('#wiMessage').textContent,/Cadastros salvos/);
});

test('suggestions require review, ambiguous classes require choice, existing appointments keep fields',async()=>{
 const dom=new JSDOM('<section id="host"></section>');globalThis.document=dom.window.document;dom.window.HTMLElement.prototype.scrollIntoView=function(){};
 ctx.schools=[{id:'s1',nome:'Escola Gilza'}];ctx.classes=[{id:'c1',idEscola:'s1',nome:'Tarde',turno:'Tarde',anoLetivo:2026},{id:'wrong-year',idEscola:'s1',nome:'Tarde anterior',turno:'Tarde',anoLetivo:2025},{id:'wrong-school',idEscola:'s2',nome:'Tarde',turno:'Tarde',anoLetivo:2026}];
 ctx.rows=[];const linked=[];globalThis.wiDeps.completeWindowsAppointmentClasses=async(id,ids,c,old)=>{linked.push(ids);ctx.rows.find(r=>r.id===id).idsTurmas=[...ids];return true;};
 // The module captures dependencies at import time, so reload for this scenario.
 const m=await import('data:text/javascript;base64,'+Buffer.from(source+'\n// reviewed scenario').toString('base64'));
 const p={versao:1,banco:'Windows',escolas:[{idEscola:1,nome:'Escola Gilza'}],turmas:[],agendamentos:[{idAgenda:123,idEscola:1,titulo:'Visita',turno:'TARDE',quantidadeTurmas:1,status:'CONFIRMADO',ativo:1,dataInicio:'2026-11-04T13:30:00',dataFim:'2026-11-04T15:10:00'}]};
 const host=document.querySelector('#host');await m.renderWindowsImport(host);const txt=JSON.stringify(p);const open=()=>host.querySelector('#wiFile').onchange({target:{files:[{size:txt.length,text:async()=>txt}]}});await open();
 assert.equal(host.querySelectorAll('[data-class]').length,1);assert.equal(host.querySelector('[data-class]').checked,true);
 host.querySelector('#wiAll').onclick();await host.querySelector('#wiSave').onclick();assert.equal(ctx.rows.length,0);assert.match(host.querySelector('#wiMessage').textContent,/Confirme a conferência/);
 const review=host.querySelector('[data-reviewed]');review.checked=true;review.onchange();host.querySelector('#wiAll').onclick();host.querySelector('#wiConflicts').checked=true;await host.querySelector('#wiSave').onclick();assert.deepEqual(ctx.rows[0].idsTurmas,['c1']);
 // Existing integral appointment: completing class links preserves manual title/status/time.
 p.formato='mobiliza-windows-integral'; // use fixture normalizer to create integral wrapper below
 const full=JSON.parse(await readFile(new URL('../../entregas/agenda_integral/Agenda_Integral_06102026.json',import.meta.url),'utf8'));
 const a=full.tabelas.tblAgendaEvento.find(r=>r.idAgenda===34),school=full.tabelas.tblEscola.find(s=>s.idEscola===a.idEscola);
 ctx.schools=[{id:'s1',nome:school.nome}];ctx.rows=[{...ctx.rows[0],id:policy.windowsDocumentId(full,a),nome:'Título editado',status:'Reagendado',idsTurmas:[],dataInicio:'2026-11-04',dataFim:'2026-11-04',horaInicio:'13:30',horaFim:'15:10',publico:'TARDE',updatedAt:{seconds:1,nanoseconds:0}}];
 const json=JSON.stringify(full);await host.querySelector('#wiFile').onchange({target:{files:[{size:json.length,text:async()=>json}]}});const index=full.tabelas.tblAgendaEvento.findIndex(r=>r.idAgenda===34);
 const r=host.querySelector(`[data-reviewed="${index}"]`);r.checked=true;r.onchange();const choose=host.querySelector(`[data-select="${index}"]`);choose.checked=true;choose.onchange();await host.querySelector('#wiSave').onclick();assert.deepEqual(linked,[['c1']]);assert.equal(ctx.rows[0].nome,'Título editado');assert.equal(ctx.rows[0].status,'Reagendado');assert.match(host.querySelector('#wiMessage').textContent,/1 vínculos de turmas completados/);
 ctx.classes.push({id:'c2',idEscola:'s1',nome:'2 B',turno:'Tarde',anoLetivo:2026});assert.deepEqual(policy.windowsClassSuggestion(a,'s1',ctx.classes).suggested,[]);
});
