import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {agendaSummary} from '../js/core/agendaSummary.js';
const base={nome:'Visita',origem:'Escola',idEscola:'s',idsTurmas:['c'],dataInicio:'2026-10-07',dataFim:'2026-10-07',horaInicio:'10:00',horaFim:'11:00',status:'Confirmado',responsavel:'Equipe',local:'Escola'};
test('resumo trata semana segunda-domingo, intervalos de vários dias, cancelados e concluídos',()=>{
 const ctx={rows:[{...base,id:'a'},{...base,id:'b',status:'Cancelado'},{...base,id:'c',dataInicio:'2026-10-05',dataFim:'2026-10-09'},{...base,id:'d',dataInicio:'2026-10-06',dataFim:'2026-10-06',status:'Concluído'},{...base,id:'e',dataInicio:'2026-10-06',dataFim:'2026-10-06',status:'Planejado'}]};
 const summary=agendaSummary(ctx,[{id:'ev',nome:'Evento público',dataInicio:'2026-10-11',status:'Confirmado'}],new Date('2026-10-07T09:00:00'));
 assert.equal(summary.weekStart,'2026-10-05');assert.equal(summary.weekEnd,'2026-10-11');assert.equal(summary.todayRows.length,2);assert.equal(summary.week.length,5);assert.deepEqual(summary.overdue.map(r=>r.id),['e']);assert.ok(summary.alerts.some(a=>a.title.includes('próximas duas horas')));assert.equal(summary.conflicts,1);assert.equal(summary.onDay('2026-10-11')[0].kind,'Evento');
});
test('resumo de domingo permanece na mesma semana e eventos sem hora não geram horário inventado',()=>{
 const s=agendaSummary({rows:[]},[{id:'ev',dataInicio:'2026-10-11',status:'Confirmado',nome:'Dia inteiro'}],new Date('2026-10-11T09:00:00'));assert.equal(s.weekStart,'2026-10-05');assert.equal(s.todayRows[0].horaInicio,undefined);assert.equal(s.overdue.length,0);
});
const {JSDOM}=createRequire((process.env.ACL_TEST_NODE_MODULES||new URL('../node_modules',import.meta.url).pathname)+'/../package.json')('jsdom');
let source=(await readFile(new URL('../js/modules/agendaOverview.js',import.meta.url),'utf8')).replace(/^import .*;\n/gm,'');source='const agendaSummary=globalThis.overviewSummary;const getCloudTenantId=()=>globalThis.overviewTenant;const loadAppointments=()=>globalThis.overviewLoad();const accessDb=()=>globalThis.overviewDb();\n'+source;
globalThis.overviewSummary=agendaSummary;
const mod=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
function setup(){const dom=new JSDOM('<section></section>');globalThis.document=dom.window.document;globalThis.overviewTenant='t';globalThis.overviewLoad=async()=>({tenantId:'t',access:{allSchools:true},rows:[{...base,id:'a',nome:'<img src=x onerror=bad()>',dataInicio:new Date().toISOString().slice(0,10),dataFim:new Date().toISOString().slice(0,10)}],schools:[{id:'s',nome:'Escola'}]});globalThis.overviewDb=async()=>({db:{},fs:{collection:()=>({}),getDocsFromServer:async()=>({docs:[]})}});return document.querySelector('section');}
const tick=()=>new Promise(r=>setImmediate(r));
test('painel mostra dados online, escapa nomes, abre ficha e permite navegar pelos dias',async()=>{
 const host=setup(),calls=[];mod.renderAgendaOverview(host,options=>calls.push(options));await tick();await tick();assert.equal(host.querySelectorAll('.overview-kpis article').length,6);assert.equal(host.querySelector('img'),null);const btn=host.querySelector('[data-overview-row="appointment:a"]');btn.click();assert.deepEqual(calls,[{appointmentId:'a'}]);host.querySelector('[data-overview-day]').click();assert.equal(host.querySelector('[data-overview-day]').getAttribute('aria-pressed'),'true');host._agendaCleanup();
});
test('cliente alterado ou painel encerrado descarta resposta antiga; falha de eventos é explícita',async()=>{
 const host=setup();let finish;globalThis.overviewLoad=()=>new Promise(r=>finish=r);mod.renderAgendaOverview(host,()=>{});host._agendaCleanup();host.innerHTML='Outro cliente';finish({tenantId:'t',access:{allSchools:true},rows:[],schools:[]});await tick();assert.equal(host.textContent,'Outro cliente');
 const next=setup();globalThis.overviewDb=async()=>({db:{},fs:{collection:()=>({}),getDocsFromServer:async()=>{throw new Error('offline');}}});mod.renderAgendaOverview(next,()=>{});await tick();await tick();assert.match(next.textContent,/Não foi possível carregar os eventos/);next._agendaCleanup();
});

test('resumo da unidade não consulta eventos gerais do cliente',async()=>{const host=setup();globalThis.overviewLoad=async()=>({tenantId:'t',access:{allSchools:false,schoolIds:['s']},schools:[{id:'s',nome:'Unidade'}],classes:[],rows:[{...base,id:'a'}]});let reads=0;globalThis.overviewDb=async()=>({db:{},fs:{getDocsFromServer:async()=>{reads++;throw new Error('Não consultar');}}});const result=await mod.loadAgendaOverview();assert.equal(reads,0);assert.deepEqual(result.events,[]);assert.equal(result.eventsError,'');});
