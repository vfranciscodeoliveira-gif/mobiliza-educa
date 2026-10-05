import {openSchoolPdfImport} from './schoolPdfImport.js?v=1';
import {supportsEducationEntity,educationRows,loadEducation,saveEducation,deleteEducation} from '../core/educationRepository.js?v=1';
import {changeAdminPassword,lockAdmin} from './auth.js?v=2';
import {canAccessModule,recordAudit,auditDataWrite} from '../core/accessControl.js?v=1';
import {adminModuleEntitlement} from '../core/saasContext.js?v=2';
import {publishEvent,updateCloudRequestStatus,updateCloudRegistrationStatus} from '../cloudGateway.js?v=6';
import {renderPassaporteCertificados} from './passaporteCertificados.js?v=3';
import {renderAvaliacaoPedagogica} from './avaliacaoPedagogica.js?v=2';
import {renderEvidenciasImpacto} from './evidenciasImpacto.js?v=3';
import {renderRelatorios360} from './relatorios360.js?v=2';
import {renderUsuariosAuditoria} from './usuariosAuditoria.js?v=1';
import {renderSistemaContinuity} from './sistemaContinuity.js?v=4';
import {renderCentroEditorial} from './centroEditorial.js?v=1';
import {renderAssinaturaSaas} from './assinaturaSaas.js?v=2';
import {renderPlataformaComercial} from './plataformaComercial.js?v=1';
import {qrSvg,makeCheckinToken} from '../core/qr.js?v=1';
import {snapshotActiveTenant} from '../core/tenantRegistry.js?v=2';

const modules={
'admin-dashboard':{title:'Dashboard administrativo',intro:'Painel único para acompanhar operação, alcance e qualidade pedagógica.'},
'admin-cadastros':{title:'Pessoas e instituições',intro:'Escolas, instituições, contatos, turmas, professores e alunos em um cadastro único de apoio às ações educativas.'},
'admin-eventos':{title:'Agenda, solicitações e inscrições',intro:'Da demanda inicial ao atendimento: solicitação, agendamento, vagas, inscrições, presença, equipe, materiais e histórico.'},
'admin-conteudo':{title:'Conteúdo pedagógico',intro:'Governança do conteúdo usado em jogos, avaliações e atividades.'},
'admin-avaliacao':{title:'Presença e avaliações',intro:'Registro de participação e medição de aprendizagem.',sections:['Presença','Pré-teste','Pós-teste','Evolução por turma','Indicadores','Comparativos']},
'admin-evidencias':{title:'Evidências e impacto',intro:'Fechamento pós-evento, arquivos autorizados, alcance, materiais, parceiros e relatório final automático.'},
'admin-passaporte':{title:'Passaporte e certificados',intro:'Reconhecimento da participação e progressão educativa.',sections:['Passaporte digital','Medalhas','Certificados','Validação por QR Code','Histórico']},
'admin-relatorios':{title:'Relatórios e indicadores',intro:'Relatórios operacionais, pedagógicos e comprovação de impacto.'},
'admin-acessos':{title:'Usuários, perfis e auditoria',intro:'Controle de acesso e rastreabilidade administrativa.',sections:['Usuários','Perfis','Permissões','Auditoria','Acessibilidade','Segurança local']},
'admin-sistema':{title:'Configurações, backup e sincronização',intro:'Configurações gerais e continuidade operacional.'},
'admin-assinatura':{title:'Produto e assinatura',intro:'Plano, recursos e consumo da organização atualmente aberta.'},
'admin-plataforma':{title:'Console do proprietário',intro:'Carteira de clientes, trials, planos, preços, assinaturas e workspaces isolados.'}
};

const KEYS=['escolas','instituicoes','pessoas','turmas','professores','alunos','eventos','solicitacoes','inscricoes','certificados','avaliacaoPlanos','avaliacoes','impactos','evidencias'];
const storageKey=k=>'mobiliza.admin.'+k;
const read=k=>{
 if(supportsEducationEntity(k))return educationRows(k);
 try{
  const raw=localStorage.getItem(storageKey(k));if(raw==null)return[];
  const v=JSON.parse(raw);return Array.isArray(v)?v:[];
 }catch(e){console.error('Mobiliza Educa: falha ao ler '+k,e);return[];}
};
const write=(k,v)=>{
 if(!KEYS.includes(k))throw new Error('Coleção administrativa inválida: '+k);
 if(!Array.isArray(v))throw new Error('Os dados de '+k+' devem ser uma lista.');
 const before=read(k),payload=JSON.stringify(v);
 try{localStorage.setItem(storageKey(k),payload);}catch(e){throw new Error('Não foi possível salvar '+k+' neste navegador: '+(e?.message||e));}
 if(localStorage.getItem(storageKey(k))!==payload)throw new Error('Falha ao confirmar a gravação de '+k+'.');
 snapshotActiveTenant();
 auditDataWrite(k,before,v);
 window.dispatchEvent(new CustomEvent('mobiliza-data-change',{detail:{entity:k,audited:true,count:v.length}}));
 return v;
};
function updateById(entity,id,change){
 const all=read(entity),i=all.findIndex(x=>x.id===id);if(i<0)return null;
 const row={...all[i]};if(typeof change==='function')change(row);else Object.assign(row,change||{});
 all[i]=row;write(entity,all);return row;
}
function dependencySummary(entity,id){
 const refs=[];
 const add=(label,count)=>{if(count)refs.push(label+': '+count);};
 if(entity==='escolas'){add('turmas',read('turmas').filter(x=>x.idEscola===id).length);add('professores',read('professores').filter(x=>x.idEscola===id).length);add('agendamentos',read('eventos').filter(x=>x.idEscola===id).length);add('solicitações',read('solicitacoes').filter(x=>x.idEscola===id).length);}
 if(entity==='instituicoes'){add('contatos',read('pessoas').filter(x=>x.idInstituicao===id).length);add('agendamentos',read('eventos').filter(x=>x.idInstituicao===id).length);add('solicitações',read('solicitacoes').filter(x=>x.idInstituicao===id).length);}
 if(entity==='pessoas')add('solicitações',read('solicitacoes').filter(x=>x.idPessoa===id).length);
 if(entity==='turmas'){add('alunos',read('alunos').filter(x=>x.idTurma===id).length);add('agendamentos',read('eventos').filter(x=>(x.idsTurmas||[]).includes(id)).length);}
 if(entity==='alunos')add('presenças históricas',read('eventos').filter(x=>Object.prototype.hasOwnProperty.call(x.presenca||{},id)).length);
 return refs;
}
function dataIntegrity(){
 const issues=[],ids={};
 for(const k of KEYS){const rows=read(k),seen=new Set();ids[k]=new Set(rows.map(x=>x.id).filter(Boolean));rows.forEach((x,i)=>{if(!x||typeof x!=='object')issues.push(k+' #'+(i+1)+': registro inválido');else{if(!x.id)issues.push(k+' #'+(i+1)+': sem ID');else if(seen.has(x.id))issues.push(k+': ID duplicado '+x.id);seen.add(x.id);if(['escolas','instituicoes','pessoas','turmas','professores','alunos','eventos'].includes(k)&&!String(x.nome||'').trim())issues.push(k+' '+(x.id||'#'+(i+1))+': sem nome');}});}
 read('turmas').forEach(x=>{if(x.idEscola&&!ids.escolas.has(x.idEscola))issues.push('Turma "'+(x.nome||x.id)+'" aponta para escola inexistente.');});
 read('professores').forEach(x=>{if(x.idEscola&&!ids.escolas.has(x.idEscola))issues.push('Professor "'+(x.nome||x.id)+'" aponta para escola inexistente.');});
 read('alunos').forEach(x=>{if(x.idTurma&&!ids.turmas.has(x.idTurma))issues.push('Aluno "'+(x.nome||x.id)+'" aponta para turma inexistente.');});
 read('pessoas').forEach(x=>{if(x.idInstituicao&&!ids.instituicoes.has(x.idInstituicao))issues.push('Contato "'+(x.nome||x.id)+'" aponta para instituição inexistente.');});
 read('eventos').forEach(x=>{if(x.idEscola&&!ids.escolas.has(x.idEscola))issues.push('Agendamento "'+(x.nome||x.id)+'" aponta para escola inexistente.');if(x.idInstituicao&&!ids.instituicoes.has(x.idInstituicao))issues.push('Agendamento "'+(x.nome||x.id)+'" aponta para instituição inexistente.');for(const t of x.idsTurmas||[])if(!ids.turmas.has(t))issues.push('Agendamento "'+(x.nome||x.id)+'" aponta para turma inexistente.');if(x.dataInicio&&x.dataFim&&x.dataFim<x.dataInicio)issues.push('Agendamento "'+(x.nome||x.id)+'" possui período inválido.');});
 read('solicitacoes').forEach(x=>{if(x.idEscola&&!ids.escolas.has(x.idEscola))issues.push('Solicitação '+(x.protocolo||x.id)+' aponta para escola inexistente.');if(x.idInstituicao&&!ids.instituicoes.has(x.idInstituicao))issues.push('Solicitação '+(x.protocolo||x.id)+' aponta para instituição inexistente.');if(x.idPessoa&&!ids.pessoas.has(x.idPessoa))issues.push('Solicitação '+(x.protocolo||x.id)+' aponta para contato inexistente.');if(x.idEvento&&!ids.eventos.has(x.idEvento))issues.push('Solicitação '+(x.protocolo||x.id)+' aponta para agendamento inexistente.');});
 read('inscricoes').forEach(x=>{if(x.idEvento&&!ids.eventos.has(x.idEvento))issues.push('Inscrição '+(x.protocolo||x.id)+' aponta para agendamento inexistente.');});
 return{ok:issues.length===0,issues,counts:Object.fromEntries(KEYS.map(k=>[k,read(k).length]))};
}
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,8);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const today=()=>new Date().toISOString().slice(0,10);
const fmtDate=v=>v?new Date(v+'T12:00:00').toLocaleDateString('pt-BR'):'—';
const fmtPhone=v=>String(v||'').replace(/\D/g,'').replace(/^(\d{2})(\d)/,'($1) $2').replace(/(\d{5})(\d{4}).*/,'$1-$2');
const toLines=(arr,kind)=>kind==='materials'?(arr||[]).map(x=>`${x.nome};${x.quantidade||0}`).join('\n'):kind==='team'?(arr||[]).map(x=>`${x.nome};${x.funcao||''}`).join('\n'):(arr||[]).join('\n');
const parseLines=(txt,kind)=>String(txt||'').split(/\r?\n/).map(x=>x.trim()).filter(Boolean).map(line=>{if(kind==='materials'){const [nome,quantidade]=line.split(';');return {nome:nome.trim(),quantidade:Number(quantidade||0)};}if(kind==='team'){const [nome,funcao]=line.split(';');return {nome:nome.trim(),funcao:(funcao||'').trim()};}return line;});
const csvEscape=v=>'"'+String(v??'').replace(/"/g,'""')+'"';
const download=(name,text,type='text/csv;charset=utf-8')=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['\ufeff'+text],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);};

function shell(m,inner){return `<section class="admin-module"><p class="eyebrow">CENTRO DE GESTÃO WEB • v1.7</p><h2>${m.title}</h2><p class="admin-intro">${m.intro}</p>${inner}</section>`;}
function byId(entity,id){return read(entity).find(x=>x.id===id);}
function label(entity,id){const r=byId(entity,id);return r?.nome||'—';}
function uniqueName(entity,name,exclude){return !read(entity).some(x=>x.id!==exclude&&String(x.nome||'').trim().toLowerCase()===String(name||'').trim().toLowerCase());}
function addDays(v,n){const d=new Date(v+'T12:00:00');d.setDate(d.getDate()+n);return d.toISOString().slice(0,10);}
function addMonths(v,n){const d=new Date(v+'T12:00:00'),day=d.getDate();d.setDate(1);d.setMonth(d.getMonth()+n);const max=new Date(d.getFullYear(),d.getMonth()+1,0).getDate();d.setDate(Math.min(day,max));return d.toISOString().slice(0,10);}
function addYears(v,n){const d=new Date(v+'T12:00:00'),m=d.getMonth(),day=d.getDate();d.setFullYear(d.getFullYear()+n);if(d.getMonth()!==m){d.setMonth(m+1,0);}else d.setDate(day);return d.toISOString().slice(0,10);}
function dateDiffDays(a,b){return Math.round((new Date(b+'T12:00:00')-new Date(a+'T12:00:00'))/86400000);}

function ensureOpsCss(){
 if(document.getElementById('admin-ops-v1'))return;
 const s=document.createElement('style');s.id='admin-ops-v1';s.textContent=`
 .ops-tabs{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0 16px}.ops-tabs .admin-tab{white-space:nowrap}
 .ops-overview{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:12px 0 16px}.ops-card{padding:14px;border:1px solid #d9e7ef;border-radius:14px;background:#fff}.ops-card strong{display:block;font-size:1.35rem;color:#0b5f8a}.ops-card span{font-size:.8rem;color:#6d8391}
 .calendar-shell{border:1px solid #d7e5ee;border-radius:16px;background:#fff;overflow:hidden}.calendar-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 14px;border-bottom:1px solid #e4edf3}.calendar-title{font-weight:900;color:#173f60;text-transform:capitalize}.calendar-weekdays,.calendar-grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr))}.calendar-weekdays div{padding:8px;text-align:center;font-size:.75rem;font-weight:900;color:#6a8190;background:#f6f9fb}.calendar-day{min-height:116px;border-right:1px solid #edf3f6;border-top:1px solid #edf3f6;padding:7px;background:#fff}.calendar-day:nth-child(7n){border-right:0}.calendar-day.muted{background:#fafcfd;color:#a0adb6}.calendar-day.today{outline:2px solid #0a79ad;outline-offset:-2px}.calendar-date{font-size:.75rem;font-weight:900;margin-bottom:4px}.calendar-event{display:block;width:100%;text-align:left;border:0;border-radius:8px;padding:5px 6px;margin:3px 0;background:#e9f5fb;color:#0c5579;font-size:.72rem;cursor:pointer;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.calendar-event.conflict{background:#ffe7e7;color:#8b2323}.calendar-more{font-size:.7rem;color:#69808e}
 .ops-list{display:grid;gap:10px}.ops-item{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center;padding:12px;border:1px solid #dce8ef;border-radius:12px;background:#fff}.ops-item small{display:block;color:#6f8491;margin-top:3px}.ops-actions{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}.ops-badge{display:inline-flex;align-items:center;gap:4px;border-radius:999px;padding:4px 8px;font-size:.72rem;font-weight:900;background:#edf4f8;color:#33596f}.ops-badge.warn{background:#fff0d6;color:#7c4b00}.ops-badge.danger{background:#ffe4e4;color:#8e2626}.ops-badge.ok{background:#e4f7ea;color:#176339}
 .check-progress{height:10px;border-radius:999px;background:#e8eff3;overflow:hidden;margin:8px 0 16px}.check-progress>span{display:block;height:100%;background:linear-gradient(90deg,#0a79ad,#20a16a)}.check-grid-ops{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.check-op{display:flex;gap:10px;align-items:flex-start;border:1px solid #d9e7ef;border-radius:11px;padding:10px;background:#fff}.check-op input{margin-top:3px}.sheet-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
 .qr-preview{display:grid;place-items:center;background:#fff;border:1px solid #d9e6ed;border-radius:14px;padding:12px}.qr-preview svg{width:min(280px,80vw);height:auto}
 .checkin-shell{display:grid;gap:14px}.checkin-tools{display:grid;grid-template-columns:1fr auto;gap:8px}.checkin-camera{background:#08151d;border-radius:14px;overflow:hidden;position:relative;min-height:180px;display:grid;place-items:center}.checkin-camera video{width:100%;max-height:360px;object-fit:cover}.checkin-camera .hint{position:absolute;inset:auto 12px 12px;background:rgba(0,0,0,.65);color:#fff;padding:7px 9px;border-radius:8px;font-size:.78rem}
 .checkin-list{display:grid;gap:8px}.checkin-person{display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center;border:1px solid #dce8ef;border-radius:11px;padding:10px}.checkin-person small{display:block;color:#718493}.checkin-person.present{background:#ecf9f0;border-color:#bfe5ca}.checkin-state{font-size:.75rem;font-weight:900;border-radius:999px;padding:5px 8px;background:#edf3f6}.checkin-person.present .checkin-state{background:#d7f3df;color:#14632d}

 @media(max-width:900px){.ops-overview{grid-template-columns:repeat(2,minmax(0,1fr))}.calendar-day{min-height:92px}.calendar-event{font-size:.66rem}.check-grid-ops{grid-template-columns:1fr}}
 @media(max-width:650px){.calendar-weekdays div{font-size:.62rem;padding:5px 2px}.calendar-day{min-height:72px;padding:4px}.calendar-event{padding:3px 4px}.ops-item{grid-template-columns:1fr}.ops-actions{justify-content:flex-start}.sheet-grid{grid-template-columns:1fr}}
 `;document.head.appendChild(s);
}
function eventDateTime(e,which='start'){
 const d=which==='start'?(e.dataInicio||e.data):(e.dataFim||e.dataInicio||e.data),t=which==='start'?(e.horaInicio||'00:00'):(e.horaFim||'23:59');
 return new Date((d||today())+'T'+t+':00');
}
function sameText(a,b){const x=String(a||'').trim().toLowerCase(),y=String(b||'').trim().toLowerCase();return !!x&&x===y;}
function eventConflicts(candidate,excludeId=''){
 const cs=eventDateTime(candidate,'start'),ce=eventDateTime(candidate,'end'),ct=new Set(candidate.idsTurmas||[]);
 return read('eventos').filter(e=>{
  if(e.id===excludeId||e.status==='Cancelado')return false;
  const es=eventDateTime(e,'start'),ee=eventDateTime(e,'end');
  if(!(cs<ee&&ce>es))return false;
  const sharedTurma=(e.idsTurmas||[]).some(x=>ct.has(x));
  return sameText(candidate.local,e.local)||sameText(candidate.responsavel,e.responsavel)||(candidate.idEscola&&candidate.idEscola===e.idEscola)||(candidate.idInstituicao&&candidate.idInstituicao===e.idInstituicao)||sharedTurma;
 });
}
const checklistDefs=[
 ['solicitante','Solicitante contatado e horário reconfirmado'],
 ['local','Local, acesso e estrutura conferidos'],
 ['equipe','Equipe escalada e ciente'],
 ['materiais','Materiais separados / quantidades conferidas'],
 ['equipamentos','Equipamentos carregados e testados'],
 ['transporte','Transporte / deslocamento organizado'],
 ['participantes','Lista de participantes ou turmas conferida'],
 ['comunicacao','Comunicação/orientações finais enviadas']
];
function checklistProgress(e){
 const c=e.checklist||{},done=checklistDefs.filter(x=>!!c[x[0]]).length,total=checklistDefs.length;
 return {done,total,pct:Math.round(done*100/total)};
}
function checklistEditor(event,host,onDone){
 const p=checklistProgress(event);
 host.innerHTML=`<div class="crud-editor-head"><div><span class="eyebrow">CHECKLIST PRÉ-EVENTO</span><h3>${esc(event.nome)}</h3><p>${fmtDate(event.dataInicio||event.data)} • ${esc(event.horaInicio||'')} • ${esc(event.local||'Local a definir')}</p></div><button class="icon-btn" id="checkClose">×</button></div>
 <p><strong>${p.done}/${p.total}</strong> itens concluídos • ${p.pct}% pronto</p><div class="check-progress"><span style="width:${p.pct}%"></span></div>
 <div class="check-grid-ops">${checklistDefs.map(([k,t])=>`<label class="check-op"><input type="checkbox" data-check="${k}" ${event.checklist?.[k]?'checked':''}><span><strong>${esc(t)}</strong></span></label>`).join('')}</div>
 <label style="display:grid;gap:5px;margin-top:12px">Observações operacionais<textarea id="checkNotes" rows="4">${esc(event.checklistNotas||'')}</textarea></label>
 <div class="form-actions"><button class="btn ghost" id="checkCancel">Cancelar</button><button class="btn primary" id="checkSave">Salvar checklist</button></div>`;
 const close=()=>onDone(false);host.querySelector('#checkClose').onclick=close;host.querySelector('#checkCancel').onclick=close;
 host.querySelector('#checkSave').onclick=()=>{const c={};host.querySelectorAll('[data-check]').forEach(x=>c[x.dataset.check]=x.checked);const saved=updateById('eventos',event.id,x=>{x.checklist=c;x.checklistNotas=host.querySelector('#checkNotes').value;x.updatedAt=new Date().toISOString();});if(!saved){alert('Agendamento não encontrado para salvar o checklist.');return;}Object.assign(event,saved);onDone(true);};
}

function ensureEventCheckinToken(event){
 if(!event.checkinToken){const token=makeCheckinToken('E'),saved=updateById('eventos',event.id,x=>{x.checkinToken=token;x.updatedAt=new Date().toISOString();});event.checkinToken=saved?.checkinToken||token;}
 return event.checkinToken;
}
function ensureRegistrationCheckinToken(reg){
 if(!reg.checkinToken){const token=makeCheckinToken('I'),saved=updateById('inscricoes',reg.id,x=>{x.checkinToken=token;x.updatedAt=new Date().toISOString();});reg.checkinToken=saved?.checkinToken||token;}
 return reg.checkinToken;
}
function eventCheckinUrl(event){
 const token=ensureEventCheckinToken(event),u=new URL(location.href);u.search='';u.hash='';u.searchParams.set('checkin',token);
 const txt=u.toString();return new TextEncoder().encode(txt).length<=106?txt:'MZE|'+token;
}
function printEventQr(event){
 const payload=eventCheckinUrl(event),w=window.open('','_blank');if(!w)return;
 const qr=qrSvg(payload,{scale:7,ariaLabel:'QR de check-in do evento'});
 const html=`<!doctype html><html><head><meta charset="utf-8"><title>QR do evento</title><style>body{font-family:Arial;color:#173f60;padding:28px;text-align:center}.card{max-width:560px;margin:auto;border:1px solid #d3e1e9;border-radius:18px;padding:24px}.qr svg{width:320px;max-width:90%;height:auto}.token{font-family:monospace;font-weight:800;letter-spacing:1px}.note{background:#fff7dc;border-radius:10px;padding:10px;margin-top:14px;text-align:left}</style></head><body><div class="card"><h1>MOBILIZA EDUCA</h1><h2>Check-in do evento</h2><p><strong>${esc(event.nome)}</strong><br>${fmtDate(event.dataInicio)} • ${esc(event.horaInicio||'')}</p><div class="qr">${qr}</div><p class="token">${esc(ensureEventCheckinToken(event))}</p><div class="note"><strong>Como usar:</strong> o participante escaneia este QR com o celular e informa o protocolo de inscrição + e-mail/telefone. A presença só é aceita para inscrição confirmada pelo gestor.</div></div><script>window.onload=()=>setTimeout(()=>window.print(),250)<\/script></body></html>`;
 w.document.write(html);w.document.close();
}
function printRegistrationQr(reg){
 const ev=byId('eventos',reg.idEvento)||{},token=ensureRegistrationCheckinToken(reg),payload='MZI|'+token,w=window.open('','_blank');if(!w)return;
 const qr=qrSvg(payload,{scale:7,ariaLabel:'QR individual de check-in'});
 const html=`<!doctype html><html><head><meta charset="utf-8"><title>Credencial QR</title><style>body{font-family:Arial;color:#173f60;padding:28px;text-align:center}.card{max-width:520px;margin:auto;border:1px solid #d3e1e9;border-radius:18px;padding:24px}.qr svg{width:300px;max-width:90%;height:auto}.protocol{font-size:20px;font-weight:900;color:#0a648f}.small{font-size:12px;color:#6f8290}</style></head><body><div class="card"><h1>MOBILIZA EDUCA</h1><p>Credencial de check-in</p><h2>${esc(reg.nome||reg.responsavel||'Participante')}</h2><p>${esc(ev.nome||'Atividade')}<br>${fmtDate(ev.dataInicio)} • ${esc(ev.horaInicio||'')}</p><div class="qr">${qr}</div><div class="protocol">${esc(reg.protocolo||'')}</div><p class="small">Apresente este QR à equipe no credenciamento. A credencial não altera a regra de confirmação da inscrição.</p></div><script>window.onload=()=>setTimeout(()=>window.print(),250)<\/script></body></html>`;
 w.document.write(html);w.document.close();
}
function checkinDesk(event,host,onDone){
 let stream=null,timer=null,busy=false;
 const allRegs=()=>read('inscricoes').filter(r=>r.idEvento===event.id);
 allRegs().forEach(r=>ensureRegistrationCheckinToken(r));
 const stopCamera=()=>{if(timer)clearInterval(timer);timer=null;if(stream){stream.getTracks().forEach(t=>t.stop());stream=null;}};
 const redrawList=()=>{
  const box=host.querySelector('#checkinPeople');if(!box)return;
  const regs=allRegs().sort((a,b)=>String(a.nome||'').localeCompare(String(b.nome||''),'pt-BR'));
  box.innerHTML=regs.length?regs.map(r=>`<div class="checkin-person ${r.status==='Presente'?'present':''}"><div><strong>${esc(r.nome||r.responsavel||'Inscrição')}</strong><small>${esc(r.protocolo||'')} • ${Number(r.quantidade)||1} participante(s)</small>${r.checkedInAt?'<small>Entrada: '+new Date(r.checkedInAt).toLocaleString('pt-BR')+'</small>':''}</div><span class="checkin-state">${esc(r.status||'Recebida')}</span></div>`).join(''):'<p class="empty-state">Nenhuma inscrição vinculada a este evento.</p>';
 };
 const setMessage=(msg,type='')=>{const box=host.querySelector('#checkinMsg');if(box)box.innerHTML=`<div class="callout card" style="${type==='error'?'border-color:#d96b6b':''}"><strong>${type==='error'?'Atenção':'Check-in'}</strong><p>${esc(msg)}</p></div>`;};
 const process=async raw=>{
  if(busy)return;busy=true;
  try{
   let value=String(raw||'').trim(),token=value.startsWith('MZI|')?value.slice(4):value;
   if(value.includes('?checkin=')){setMessage('Este é o QR geral do evento. Para o credenciamento pela equipe, leia o QR individual do participante ou digite o protocolo.','error');return;}
   const regs=read('inscricoes'),reg=regs.find(r=>r.idEvento===event.id&&(String(r.protocolo||'').toUpperCase()===value.toUpperCase()||String(r.checkinToken||'').toUpperCase()===token.toUpperCase()));
   if(!reg){setMessage('Inscrição não encontrada neste evento.','error');return;}
   if(!['Confirmada','Presente'].includes(reg.status)){setMessage('Inscrição localizada, mas ainda não está confirmada pelo gestor. Status atual: '+(reg.status||'Recebida')+'.','error');return;}
   if(reg.status==='Presente'){setMessage((reg.nome||'Participante')+' já possui check-in registrado em '+(reg.checkedInAt?new Date(reg.checkedInAt).toLocaleString('pt-BR'):'horário anterior')+'.');return;}
   if(reg._cloud)await updateCloudRegistrationStatus(reg.id,'Presente');
   reg.status='Presente';reg.checkedInAt=new Date().toISOString();reg.checkinOrigem=value.startsWith('MZI|')?'QR_INDIVIDUAL':'MANUAL';reg.updatedAt=new Date().toISOString();write('inscricoes',regs);
   setMessage('✓ Presença registrada: '+(reg.nome||reg.responsavel||reg.protocolo)+'.');redrawList();
   const input=host.querySelector('#checkinInput');if(input){input.value='';input.focus();}
  }catch(err){setMessage(err.message||'Não foi possível registrar o check-in.','error');}
  finally{setTimeout(()=>busy=false,700);}
 };
 host.innerHTML=`<div class="crud-editor-head"><div><span class="eyebrow">CHECK-IN • QR CODE</span><h3>${esc(event.nome)}</h3><p>${fmtDate(event.dataInicio)} • ${esc(event.horaInicio||'')} • ${esc(event.local||'')}</p></div><button class="icon-btn" id="checkinClose">×</button></div>
 <div class="checkin-shell"><div class="callout card"><strong>Credenciamento assistido</strong><p>Leia o QR individual ou informe protocolo/token. Somente inscrições confirmadas podem ser marcadas como presentes.</p></div>
 <div class="checkin-tools"><input id="checkinInput" placeholder="INS-... ou token do QR"><button class="btn primary" id="checkinManual">Registrar</button></div>
 <div class="form-actions" style="justify-content:flex-start"><button class="btn ghost" id="checkinCamera">📷 Ler QR com câmera</button><button class="btn ghost" id="checkinEventQr">▦ Imprimir QR do evento</button></div>
 <div id="checkinCameraBox" class="checkin-camera" hidden><video id="checkinVideo" playsinline muted></video><div class="hint">Aponte a câmera para o QR individual do participante</div></div><div id="checkinMsg"></div>
 <div><h4>Participantes / grupos</h4><div id="checkinPeople" class="checkin-list"></div></div></div>`;
 redrawList();
 const close=()=>{stopCamera();onDone(false);};host.querySelector('#checkinClose').onclick=close;
 host.querySelector('#checkinManual').onclick=()=>process(host.querySelector('#checkinInput').value);
 host.querySelector('#checkinInput').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();process(e.target.value);}});
 host.querySelector('#checkinEventQr').onclick=()=>printEventQr(event);
 host.querySelector('#checkinCamera').onclick=async()=>{
  if(stream){stopCamera();host.querySelector('#checkinCameraBox').hidden=true;host.querySelector('#checkinCamera').textContent='📷 Ler QR com câmera';return;}
  if(!('BarcodeDetector'in window)){setMessage('Leitura pela câmera não é suportada neste navegador. Use o protocolo/token manualmente ou outro aparelho com navegador compatível.','error');return;}
  try{
   const detector=new BarcodeDetector({formats:['qr_code']});stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}},audio:false});
   const video=host.querySelector('#checkinVideo');video.srcObject=stream;await video.play();host.querySelector('#checkinCameraBox').hidden=false;host.querySelector('#checkinCamera').textContent='⏹ Parar câmera';
   timer=setInterval(async()=>{if(busy||video.readyState<2)return;try{const codes=await detector.detect(video);if(codes[0]?.rawValue)process(codes[0].rawValue);}catch{}},450);
  }catch(err){stopCamera();setMessage('Não foi possível abrir a câmera: '+(err.message||'permissão negada')+'.','error');}
 };
}
function printOperationalSheet(event){
 const w=window.open('','_blank');if(!w)return;
 const p=checklistProgress(event),regs=read('inscricoes').filter(r=>r.idEvento===event.id&&['Confirmada','Presente'].includes(r.status)),confirmed=regs.reduce((s,r)=>s+(Number(r.quantidade)||1),0);
 const html=`<!doctype html><html><head><meta charset="utf-8"><title>Ficha operacional</title><style>body{font-family:Arial;color:#173f60;padding:28px}h1{margin:0}.head{border-bottom:4px solid #0a6f9f;padding-bottom:12px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.box{border:1px solid #ccdce5;border-radius:12px;padding:14px;margin-top:12px}.lbl{font-size:11px;color:#728794}.val{font-weight:700;margin-bottom:8px}.check{padding:5px 0;border-bottom:1px solid #edf1f4}.ok{color:#197145}.no{color:#9a3131}footer{margin-top:20px;font-size:11px;color:#718492}</style></head><body><div class="head"><h1>MOBILIZA EDUCA</h1><p>Ficha operacional do atendimento</p></div><div class="box grid"><div><div class="lbl">Atividade</div><div class="val">${esc(event.nome)}</div></div><div><div class="lbl">Tipo / status</div><div class="val">${esc(event.tipo||'')} • ${esc(event.status||'')}</div></div><div><div class="lbl">Data</div><div class="val">${fmtDate(event.dataInicio)} a ${fmtDate(event.dataFim||event.dataInicio)}</div></div><div><div class="lbl">Horário</div><div class="val">${esc(event.horaInicio||'')} – ${esc(event.horaFim||'')}</div></div><div><div class="lbl">Solicitante</div><div class="val">${esc(sourceName(event))}</div></div><div><div class="lbl">Local</div><div class="val">${esc(event.local||'A definir')}</div></div><div><div class="lbl">Público</div><div class="val">${esc(event.publico||'—')}</div></div><div><div class="lbl">Previstos / confirmados</div><div class="val">${Number(event.previsto)||0} / ${confirmed}</div></div><div><div class="lbl">Responsável SEMOB</div><div class="val">${esc(event.responsavel||'—')}</div></div><div><div class="lbl">Contato solicitante</div><div class="val">${esc(event.contato||event.telefone||'—')}</div></div></div>
 <div class="box"><strong>Checklist • ${p.done}/${p.total} (${p.pct}%)</strong>${checklistDefs.map(([k,t])=>`<div class="check ${event.checklist?.[k]?'ok':'no'}">${event.checklist?.[k]?'✓':'○'} ${esc(t)}</div>`).join('')}</div>
 <div class="box"><strong>Equipe</strong><p>${(event.equipe||[]).map(x=>esc(x.nome)+(x.funcao?' — '+esc(x.funcao):'')).join('<br>')||'—'}</p><strong>Materiais</strong><p>${(event.materiais||[]).map(x=>esc(x.nome)+' — '+(Number(x.quantidade)||0)).join('<br>')||'—'}</p><strong>Parceiros</strong><p>${(event.parceiros||[]).map(esc).join('<br>')||'—'}</p></div>
 <div class="box"><strong>Observações</strong><p>${esc(event.observacao||'—')}</p><strong>Observações operacionais</strong><p>${esc(event.checklistNotas||'—')}</p></div><footer>Gerado em ${new Date().toLocaleString('pt-BR')}</footer><script>window.onload=()=>setTimeout(()=>window.print(),200)<\/script></body></html>`;
 w.document.write(html);w.document.close();
}

function ensureDashboardCss(){
 if(document.getElementById('admin-dashboard-360-v2'))return;
 const s=document.createElement('style');s.id='admin-dashboard-360-v2';s.textContent=`
 .dash360-hero{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(280px,.8fr);gap:16px;margin:14px 0 18px}
 .dash360-primary{padding:20px;border:1px solid #d8e6ee;border-radius:18px;background:linear-gradient(135deg,#fafdff,#eef8fc)}
 .dash360-primary h3{margin:5px 0 8px;color:#103f63;font-size:1.35rem}
 .dash360-primary p{margin:0;color:#637a89}
 .dash360-health{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
 .dash360-health article{padding:14px;border:1px solid #dce8ef;border-radius:14px;background:#fff}
 .dash360-health span,.dash360-health strong,.dash360-health small{display:block}
 .dash360-health span{font-size:.7rem;font-weight:900;text-transform:uppercase;letter-spacing:.07em;color:#78909d}
 .dash360-health strong{font-size:1.4rem;color:#0b5f8a;margin:3px 0}
 .dash360-health small{font-size:.75rem;color:#738895}
 .dash360-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:0 0 16px}
 .dash360-kpi{padding:15px;border:1px solid #d9e7ef;border-radius:15px;background:#fff;box-shadow:0 6px 18px rgba(15,60,102,.06)}
 .dash360-kpi span,.dash360-kpi strong,.dash360-kpi small{display:block}
 .dash360-kpi span{font-size:.72rem;text-transform:uppercase;letter-spacing:.06em;color:#758a98;font-weight:900}
 .dash360-kpi strong{font-size:1.7rem;color:#0f3c66;margin:5px 0 2px}
 .dash360-kpi small{font-size:.76rem;color:#7b8e99}
 .dash360-grid{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(320px,.75fr);gap:14px;margin-top:14px}
 .dash360-panel{padding:18px;border:1px solid #d8e6ee;border-radius:17px;background:#fff}
 .dash360-panel-head{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:10px}
 .dash360-panel-head h3{margin:0;color:#173f60}
 .dash360-count{display:inline-flex;min-width:30px;height:30px;align-items:center;justify-content:center;border-radius:999px;background:#eaf5fb;color:#0a648f;font-weight:900}
 .dash360-list{display:grid;gap:8px}
 .dash360-row{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center;padding:11px 0;border-bottom:1px solid #edf3f6}
 .dash360-row:last-child{border-bottom:0}
 .dash360-row strong,.dash360-row small{display:block}
 .dash360-row small{margin-top:3px;color:#748895}
 .dash360-status{font-size:.72rem;font-weight:900;border-radius:999px;padding:5px 8px;background:#edf4f8;color:#35596d;white-space:nowrap}
 .dash360-status.warn{background:#fff1d8;color:#7a4b00}.dash360-status.danger{background:#ffe5e5;color:#8d2727}.dash360-status.ok{background:#e3f6e9;color:#176438}
 .dash360-actions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}
 .dash360-actions .btn{width:100%;min-height:44px;justify-content:flex-start}
 .dash360-progress{height:10px;border-radius:999px;background:#e8eff3;overflow:hidden;margin:8px 0 4px}
 .dash360-progress>span{display:block;height:100%;background:linear-gradient(90deg,#0a79ad,#20a16a)}
 .dash360-alerts{display:grid;gap:8px}
 .dash360-alert{display:grid;grid-template-columns:34px 1fr auto;gap:9px;align-items:center;padding:10px 11px;border-radius:12px;border:1px solid #e0e9ee;background:#f9fcfd}
 .dash360-alert.warn{background:#fff9ed;border-color:#f0dfb7}.dash360-alert.danger{background:#fff1f1;border-color:#efcaca}
 .dash360-alert b{color:#173f60}.dash360-alert small{display:block;color:#728694;margin-top:2px}
 .dash360-tools{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}
 .dash360-tools .btn{flex:1;min-width:180px}
 @media(max-width:980px){.dash360-hero,.dash360-grid{grid-template-columns:1fr}.dash360-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}}
 @media(max-width:620px){.dash360-kpis,.dash360-health,.dash360-actions{grid-template-columns:1fr}.dash360-row,.dash360-alert{grid-template-columns:1fr}.dash360-tools .btn{min-width:100%}}
 `;document.head.appendChild(s);
}

function renderDashboard(host,authDialog){
 ensureDashboardCss();
 const eventos=read('eventos'),solicitacoes=read('solicitacoes'),inscricoes=read('inscricoes'),impactos=read('impactos');
 const agora=today(),em7=addDays(agora,7);
 const escolas=read('escolas'),instituicoes=read('instituicoes');
 const upcoming=eventos.filter(x=>(x.dataInicio||x.data)>=agora&&x.status!=='Cancelado').sort((a,b)=>String(a.dataInicio||a.data||'').localeCompare(String(b.dataInicio||b.data||''))).slice(0,6);
 const hoje=eventos.filter(x=>{const a=x.dataInicio||x.data,b=x.dataFim||a;return a<=agora&&b>=agora&&x.status!=='Cancelado';});
 const proximos7=eventos.filter(x=>{const d=x.dataInicio||x.data;return d>=agora&&d<=em7&&x.status!=='Cancelado';});
 const checklistPendentes=proximos7.filter(x=>checklistProgress(x).pct<100);
 const conflitos=proximos7.filter(x=>eventConflicts(x,x.id).length>0);
 const semFechamento=eventos.filter(e=>e.status==='Concluído'&&!impactos.some(i=>i.eventId===e.id&&i.status==='Finalizado'));
 const abertas=solicitacoes.filter(x=>!['Agendada','Concluída','Cancelada','Não atendida'].includes(x.status)).length;
 const novasSolicitacoes=solicitacoes.filter(x=>['Recebida','Nova'].includes(x.status||'Recebida')).length;
 const novasInscricoes=inscricoes.filter(x=>['Recebida','Pré-inscrição'].includes(x.status||'Recebida')).length;
 const inscritos=inscricoes.filter(x=>['Confirmada','Presente'].includes(x.status)).reduce((s,x)=>s+(Number(x.quantidade)||1),0);
 const presentes=inscricoes.filter(x=>x.status==='Presente').reduce((s,x)=>s+(Number(x.quantidade)||1),0);
 const games=JSON.parse(localStorage.getItem('mobiliza.results')||'{"games":0}').games||0;
 const readiness=proximos7.length?Math.round(proximos7.reduce((sum,x)=>sum+checklistProgress(x).pct,0)/proximos7.length):100;
 const priorityCount=novasSolicitacoes+novasInscricoes+checklistPendentes.length+conflitos.length+semFechamento.length;
 const integrity=dataIntegrity(),statusLabel=priorityCount===0&&integrity.ok?'Operação em dia':(priorityCount+(integrity.ok?0:integrity.issues.length))+' pendência(s) para atenção';

 host.innerHTML=shell(modules['admin-dashboard'],`
 <section class="dash360-hero">
  <div class="dash360-primary">
   <p class="eyebrow">VISÃO EXECUTIVA • HOJE</p>
   <h3>${statusLabel}</h3>
   <p>${hoje.length?hoje.length+' atividade(s) ocorrendo hoje.':'Nenhuma atividade programada para hoje.'} Próximos 7 dias: <strong>${proximos7.length}</strong> evento(s).</p>
   <div class="dash360-progress" title="Prontidão média dos checklists"><span style="width:${readiness}%"></span></div>
   <small>Prontidão operacional média dos próximos 7 dias: <strong>${readiness}%</strong></small>
  </div>
  <div class="dash360-health">
   <article><span>Status</span><strong>${priorityCount===0&&integrity.ok?'OK':'Atenção'}</strong><small>${integrity.ok?(priorityCount===0?'Sem pendências críticas':'Revise os alertas abaixo'):integrity.issues.length+' inconsistência(s) na base'}</small></article>
   <article><span>Hoje</span><strong>${hoje.length}</strong><small>atividade(s) em andamento / prevista(s)</small></article>
   <article><span>Presenças</span><strong>${presentes}</strong><small>participantes registrados</small></article>
   <article><span>Jogos</span><strong>${games}</strong><small>partidas neste navegador</small></article>
  </div>
 </section>

 <section class="dash360-kpis">
  <article class="dash360-kpi"><span>Escolas</span><strong>${escolas.length}</strong><small>cadastros ativos</small></article>
  <article class="dash360-kpi"><span>Instituições</span><strong>${instituicoes.length}</strong><small>parceiros / solicitantes</small></article>
  <article class="dash360-kpi"><span>Solicitações abertas</span><strong>${abertas}</strong><small>${novasSolicitacoes} nova(s)</small></article>
  <article class="dash360-kpi"><span>Confirmados</span><strong>${inscritos}</strong><small>${novasInscricoes} inscrição(ões) aguardando análise</small></article>
 </section>

 <section class="dash360-grid">
  <div class="dash360-panel">
   <div class="dash360-panel-head"><h3>Próximos compromissos</h3><span class="dash360-count">${upcoming.length}</span></div>
   <div class="dash360-list">${upcoming.length?upcoming.map(x=>`<div class="dash360-row"><div><strong>${esc(x.nome)}</strong><small>${fmtDate(x.dataInicio||x.data)} • ${esc(x.horaInicio||'')} • ${esc(x.local||'Local não informado')}</small></div><span class="dash360-status">${esc(x.status||'Planejado')}</span></div>`).join(''):'<p class="empty-state">Nenhum evento futuro cadastrado.</p>'}</div>
   <button class="btn ghost" data-dash-route="admin-eventos" style="margin-top:10px">Abrir agenda completa</button>
  </div>

  <div class="dash360-panel">
   <div class="dash360-panel-head"><h3>Prioridades</h3><span class="dash360-count">${priorityCount}</span></div>
   <div class="dash360-alerts">
    <div class="dash360-alert ${novasSolicitacoes?'warn':''}"><span>📥</span><div><b>Solicitações novas</b><small>Aguardando análise inicial</small></div><strong>${novasSolicitacoes}</strong></div>
    <div class="dash360-alert ${novasInscricoes?'warn':''}"><span>📝</span><div><b>Inscrições pendentes</b><small>Necessitam confirmação</small></div><strong>${novasInscricoes}</strong></div>
    <div class="dash360-alert ${checklistPendentes.length?'warn':''}"><span>✅</span><div><b>Checklist incompleto</b><small>Eventos nos próximos 7 dias</small></div><strong>${checklistPendentes.length}</strong></div>
    <div class="dash360-alert ${conflitos.length?'danger':''}"><span>⚠️</span><div><b>Conflitos de agenda</b><small>Local, equipe, escola ou turma</small></div><strong>${conflitos.length}</strong></div>
    <div class="dash360-alert ${semFechamento.length?'danger':''}"><span>📷</span><div><b>Pós-evento pendente</b><small>Ações concluídas sem fechamento</small></div><strong>${semFechamento.length}</strong></div>
   </div>
  </div>
 </section>

 <section class="dash360-grid">
  <div class="dash360-panel">
   <div class="dash360-panel-head"><h3>Ações rápidas</h3></div>
   <div class="dash360-actions">
    <button class="btn primary" data-dash-action="new-event">📅 Novo agendamento</button>
    <button class="btn ghost" data-dash-action="requests">📥 Analisar solicitações</button>
    <button class="btn ghost" data-dash-action="registrations">📝 Conferir inscrições</button>
    <button class="btn ghost" data-dash-route="admin-cadastros">🏫 Pessoas e instituições</button>
    <button class="btn ghost" data-dash-route="admin-relatorios">📑 Relatórios 360</button>
    <button class="btn ghost" data-dash-route="admin-acessos">🔐 Usuários e auditoria</button>
   </div>
  </div>
  <div class="dash360-panel">
   <div class="dash360-panel-head"><h3>Resumo operacional</h3></div>
   <div class="dash360-row"><div><strong>Próximos 7 dias</strong><small>Agenda que exige preparação</small></div><span class="dash360-status ${readiness===100?'ok':'warn'}">${readiness}% pronto</span></div>
   <div class="dash360-row"><div><strong>Participantes confirmados</strong><small>Inscrições confirmadas ou presentes</small></div><span class="dash360-status ok">${inscritos}</span></div>
   <div class="dash360-row"><div><strong>Presenças registradas</strong><small>Check-ins/presenças confirmadas</small></div><span class="dash360-status">${presentes}</span></div>
  </div>
 </section>

 <div class="dash360-tools">
  <button class="btn ghost" id="adminChangePass">🔑 Alterar minha senha</button>
  <button class="btn ghost" id="adminExportAll">💾 Exportar backup local</button>
  <button class="btn danger" id="adminLogout">🚪 Encerrar sessão</button>
 </div>`);

 const goModule=id=>{
  if(id==='admin-cadastros')renderCadastros(host);
  else if(id==='admin-eventos')renderEventos(host);
  else if(id==='admin-relatorios')renderRelatorios360(host);
  else if(id==='admin-passaporte')renderPassaporteCertificados(host);
  else if(id==='admin-avaliacao')renderAvaliacaoPedagogica(host);
  else if(id==='admin-evidencias')renderEvidenciasImpacto(host);
  else if(id==='admin-conteudo')renderCentroEditorial(host);
  else if(id==='admin-acessos')renderUsuariosAuditoria(host,authDialog);
  else if(id==='admin-sistema')renderSistemaContinuity(host);
  else if(id==='admin-assinatura')renderAssinaturaSaas(host);
  else if(id==='admin-plataforma')renderPlataformaComercial(host);
 };

 host.querySelectorAll('[data-dash-route]').forEach(b=>b.onclick=()=>goModule(b.dataset.dashRoute));
 host.querySelectorAll('[data-dash-action]').forEach(b=>b.onclick=()=>{
  const action=b.dataset.dashAction;
  renderEventos(host);
  if(action==='new-event')setTimeout(()=>host.querySelector('#eventNew')?.click(),0);
  if(action==='requests')setTimeout(()=>host.querySelector('[data-central-tab="solicitacoes"]')?.click(),0);
  if(action==='registrations')setTimeout(()=>host.querySelector('[data-central-tab="inscricoes"]')?.click(),0);
 });
 host.querySelector('#adminChangePass').onclick=()=>changeAdminPassword(authDialog);
 host.querySelector('#adminLogout').onclick=()=>{lockAdmin();location.reload();};
 host.querySelector('#adminExportAll').onclick=()=>{const data={version:'0.52.0',exportedAt:new Date().toISOString()};KEYS.forEach(k=>data[k]=read(k));download('mobiliza-educa-backup.json',JSON.stringify(data,null,2),'application/json');};
}

const defs={
 escolas:{label:'Escolas',headers:['nome','municipio','endereco','contato','telefone','email'],fields:[['nome','Nome da escola','text'],['municipio','Município','text'],['endereco','Endereço','text'],['contato','Contato','text'],['telefone','Telefone','tel'],['email','E-mail','email']]},
 instituicoes:{label:'Instituições',headers:['nome','tipo','municipio','contato','telefone','email'],fields:[['nome','Nome da instituição','text'],['tipo','Tipo','select',['Empresa','Órgão público','ONG / Associação','Universidade / Faculdade','Entidade religiosa','Condomínio','Outro']],['municipio','Município','text'],['endereco','Endereço','text'],['contato','Contato principal','text'],['telefone','Telefone','tel'],['email','E-mail','email']]},
 pessoas:{label:'Contatos / Pessoas',headers:['nome','funcao','telefone','email','instituicao'],fields:[['nome','Nome','text'],['funcao','Cargo / vínculo','text'],['telefone','Telefone','tel'],['email','E-mail','email'],['idInstituicao','Instituição','institution']]},
 turmas:{label:'Turmas',headers:['nome','turno','ano','escola'],fields:[['nome','Turma','text'],['turno','Turno','select',['Manhã','Tarde','Noite','Integral']],['ano','Ano/Série','text'],['idEscola','Escola','school']]},
 professores:{label:'Professores',headers:['nome','email','telefone','escola'],fields:[['nome','Nome','text'],['email','E-mail','email'],['telefone','Telefone','tel'],['idEscola','Escola','school']]},
 alunos:{label:'Alunos',headers:['nome','dataNascimento','turma','responsavel','telefoneResponsavel'],fields:[['nome','Nome','text'],['dataNascimento','Nascimento','date'],['idTurma','Turma','class'],['responsavel','Responsável','text'],['telefoneResponsavel','Telefone do responsável','tel']]}
};

function fieldHtml(f,val=''){
 const [name,labelTxt,type,opts]=f;
 if(type==='select')return `<label>${labelTxt}<select name="${name}" required><option value="">Selecione</option>${opts.map(o=>`<option ${val===o?'selected':''}>${o}</option>`).join('')}</select></label>`;
 if(type==='school')return `<label>${labelTxt}<select name="${name}"><option value="">Sem vínculo</option>${read('escolas').map(r=>`<option value="${r.id}" ${val===r.id?'selected':''}>${esc(r.nome)}</option>`).join('')}</select></label>`;
 if(type==='institution')return `<label>${labelTxt}<select name="${name}"><option value="">Sem vínculo</option>${read('instituicoes').map(r=>`<option value="${r.id}" ${val===r.id?'selected':''}>${esc(r.nome)}</option>`).join('')}</select></label>`;
 if(type==='class')return `<label>${labelTxt}<select name="${name}"><option value="">Sem vínculo</option>${read('turmas').map(r=>`<option value="${r.id}" ${val===r.id?'selected':''}>${esc(r.nome)} • ${esc(r.turno||'')}</option>`).join('')}</select></label>`;
 return `<label>${labelTxt}<input name="${name}" type="${type}" value="${esc(type==='tel'?fmtPhone(val):val)}" ${name==='nome'?'required':''} ${type==='tel'?'data-phone maxlength="15"':''}></label>`;
}

function entityDetail(entity,r){
 if(entity==='escolas')return [r.municipio||'—',r.email||r.telefone||'—'];
 if(entity==='instituicoes')return [[r.tipo,r.municipio].filter(Boolean).join(' • ')||'—',r.email||r.telefone||'—'];
 if(entity==='pessoas')return [label('instituicoes',r.idInstituicao),[r.funcao,r.email||r.telefone].filter(Boolean).join(' • ')||'—'];
 if(entity==='turmas')return [label('escolas',r.idEscola),[r.turno,r.ano].filter(Boolean).join(' • ')||'—'];
 if(entity==='professores')return [label('escolas',r.idEscola),r.email||r.telefone||'—'];
 return [label('turmas',r.idTurma),[r.responsavel,r.telefoneResponsavel].filter(Boolean).join(' • ')||'—'];
}

function parseCsv(text,entity){
 const lines=String(text).replace(/^\ufeff/,'').split(/\r?\n/).filter(x=>x.trim());
 if(lines.length<2)return [];
 const delim=(lines[0].match(/;/g)||[]).length>=(lines[0].match(/,/g)||[]).length?';':',';
 const split=line=>{let out=[],cur='',q=false;for(let i=0;i<line.length;i++){const c=line[i];if(c==='"'){if(q&&line[i+1]==='"'){cur+='"';i++;}else q=!q;}else if(c===delim&&!q){out.push(cur.trim());cur='';}else cur+=c;}out.push(cur.trim());return out;};
 const heads=split(lines[0]).map(x=>x.trim());
 return lines.slice(1).map(line=>{const vals=split(line),o={};heads.forEach((h,i)=>o[h]=vals[i]||'');return o;});
}

function normalizeImport(entity,row){
 const base={id:uid(),createdAt:new Date().toISOString()};
 if(entity==='escolas')return {...base,nome:row.nome||'',municipio:row.municipio||'',endereco:row.endereco||'',contato:row.contato||'',telefone:fmtPhone(row.telefone),email:row.email||''};
 if(entity==='instituicoes')return {...base,nome:row.nome||'',tipo:row.tipo||'Outro',municipio:row.municipio||'',endereco:row.endereco||'',contato:row.contato||'',telefone:fmtPhone(row.telefone),email:row.email||''};
 if(entity==='pessoas'){const inst=read('instituicoes').find(x=>x.nome.toLowerCase()===String(row.instituicao||'').toLowerCase());return {...base,nome:row.nome||'',funcao:row.funcao||'',telefone:fmtPhone(row.telefone),email:row.email||'',idInstituicao:inst?.id||''};}
 if(entity==='turmas'){const escola=read('escolas').find(x=>x.nome.toLowerCase()===String(row.escola||'').toLowerCase());return {...base,nome:row.nome||'',turno:row.turno||'',ano:row.ano||'',idEscola:escola?.id||''};}
 if(entity==='professores'){const escola=read('escolas').find(x=>x.nome.toLowerCase()===String(row.escola||'').toLowerCase());return {...base,nome:row.nome||'',email:row.email||'',telefone:fmtPhone(row.telefone),idEscola:escola?.id||''};}
 const turma=read('turmas').find(x=>x.nome.toLowerCase()===String(row.turma||'').toLowerCase());return {...base,nome:row.nome||'',dataNascimento:row.dataNascimento||'',idTurma:turma?.id||'',responsavel:row.responsavel||'',telefoneResponsavel:fmtPhone(row.telefoneResponsavel)};
}

async function renderCadastros(host){
 host.innerHTML='<p class="empty-state">Carregando cadastros da organização no Firestore...</p>';
 try{await loadEducation();}catch(e){host.innerHTML='<p class="form-error">'+esc(e.message)+'</p><p>Use Conectar Firestore no painel e tente novamente. Os dados locais anteriores continuam preservados.</p>';return;}
 let entity='escolas',page=1,pageSize=10,sort='nameAsc',query='';
 host.innerHTML=shell(modules['admin-cadastros'],`
 <div class="admin-tabs">${Object.keys(defs).map((k,i)=>`<button class="admin-tab ${i===0?'active':''}" data-entity="${k}">${defs[k].label}</button>`).join('')}</div>
 <div class="crud-toolbar"><div><h3 id="crudTitle">Escolas</h3><span id="crudCount"></span></div><div class="crud-toolbar-actions"><input id="crudSearch" type="search" placeholder="Pesquisar..."><select id="crudSort"><option value="nameAsc">Nome A–Z</option><option value="nameDesc">Nome Z–A</option><option value="recent">Mais recentes</option></select><button type="button" class="btn ghost" id="crudPdfImport">📄 Lista da escola (PDF)</button><button class="btn ghost" id="crudImport">⬆ Importar CSV</button><button class="btn primary" id="crudNew">+ Novo</button></div></div>
 <div class="table-wrap"><table class="admin-table"><thead><tr><th>Nome</th><th>Vínculo / Local</th><th>Detalhes</th><th>Ações</th></tr></thead><tbody id="crudBody"></tbody></table></div>
 <div class="pagination"><button class="btn ghost small" id="pagePrev">←</button><span id="pageInfo"></span><button class="btn ghost small" id="pageNext">→</button></div>
 <div id="crudEditor" class="crud-editor" hidden></div>`);

 const allFiltered=()=>{let rows=read(entity),q=query.toLowerCase();if(q)rows=rows.filter(r=>Object.values(r).some(v=>String(v??'').toLowerCase().includes(q)));rows.sort((a,b)=>sort==='recent'?String(b.createdAt||'').localeCompare(String(a.createdAt||'')):sort==='nameDesc'?String(b.nome||'').localeCompare(String(a.nome||''),'pt-BR'):String(a.nome||'').localeCompare(String(b.nome||''),'pt-BR'));return rows;};
 const draw=()=>{const rows=allFiltered(),pages=Math.max(1,Math.ceil(rows.length/pageSize));page=Math.min(page,pages);const visible=rows.slice((page-1)*pageSize,page*pageSize);host.querySelector('#crudBody').innerHTML=visible.map(r=>{const d=entityDetail(entity,r);return `<tr><td><strong>${esc(r.nome)}</strong></td><td>${esc(d[0])}</td><td>${esc(d[1])}</td><td class="table-actions"><button class="btn ghost small" data-edit="${r.id}">Editar</button><button class="btn danger small" data-delete="${r.id}">Excluir</button></td></tr>`;}).join('')||'<tr><td colspan="4" class="empty-state">Nenhum registro encontrado.</td></tr>';host.querySelector('#crudCount').textContent=`${rows.length} registro(s)`;host.querySelector('#pageInfo').textContent=`Página ${page} de ${pages}`;host.querySelector('#pagePrev').disabled=page<=1;host.querySelector('#pageNext').disabled=page>=pages;};

 const bindMasks=box=>box.querySelectorAll('[data-phone]').forEach(i=>i.addEventListener('input',()=>i.value=fmtPhone(i.value)));
 const openEditor=id=>{const row=id?byId(entity,id):null,d=defs[entity],box=host.querySelector('#crudEditor');box.hidden=false;box.innerHTML=`<form id="crudForm"><div class="crud-editor-head"><div><span class="eyebrow">${row?'EDITAR':'NOVO REGISTRO'}</span><h3>${d.label}</h3></div><button type="button" class="icon-btn" id="crudCancel">×</button></div><div class="form-grid">${d.fields.map(f=>fieldHtml(f,row?.[f[0]]||'')).join('')}</div><p class="form-error" id="crudError" hidden></p><div class="form-actions"><button type="button" class="btn ghost" id="crudCancel2">Cancelar</button><button class="btn primary">Salvar</button></div></form>`;bindMasks(box);const close=()=>box.hidden=true;box.querySelector('#crudCancel').onclick=close;box.querySelector('#crudCancel2').onclick=close;box.querySelector('#crudForm').onsubmit=async e=>{e.preventDefault();const targetEntity=entity,data=Object.fromEntries(new FormData(e.target).entries()),err=box.querySelector('#crudError');if(!uniqueName(entity,data.nome,row?.id)){err.hidden=false;err.textContent='Já existe um registro com este nome.';return;}if(data.dataNascimento&&data.dataNascimento>today()){err.hidden=false;err.textContent='A data de nascimento não pode estar no futuro.';return;}Object.keys(data).filter(k=>k.toLowerCase().includes('telefone')).forEach(k=>data[k]=fmtPhone(data[k]));const all=read(entity);try{if(row){const i=all.findIndex(x=>x.id===row.id);if(i<0)throw new Error('Registro não encontrado para atualização.');all[i]={...all[i],...data,updatedAt:new Date().toISOString()};}else all.unshift({id:uid(),...data,createdAt:new Date().toISOString()});const button=e.target.querySelector('button.btn.primary');button.disabled=true;try{await saveEducation(targetEntity,row?all.find(x=>x.id===row.id):all[0]);}finally{button.disabled=false;}close();draw();}catch(ex){err.hidden=false;err.textContent=ex.message||'Não foi possível salvar o registro.';}};};

 const openImport=()=>{const box=host.querySelector('#crudEditor'),d=defs[entity];box.hidden=false;box.innerHTML=`<div class="crud-editor-head"><div><span class="eyebrow">IMPORTAÇÃO EM LOTE</span><h3>${d.label}</h3></div><button class="icon-btn" id="importClose">×</button></div><p>Use CSV com cabeçalho: <code>${d.headers.join(';')}</code></p><input id="importFile" type="file" accept=".csv,text/csv"><textarea id="importText" rows="8" placeholder="Ou cole o conteúdo CSV aqui..."></textarea><p class="form-error" id="importMsg" hidden></p><div class="form-actions"><button class="btn ghost" id="downloadTemplate">Baixar modelo</button><button class="btn primary" id="runImport">Importar dados</button></div>`;box.querySelector('#importClose').onclick=()=>box.hidden=true;box.querySelector('#downloadTemplate').onclick=()=>download(`modelo-${entity}.csv`,d.headers.join(';')+'\n');box.querySelector('#importFile').onchange=async e=>box.querySelector('#importText').value=await e.target.files[0].text();box.querySelector('#runImport').onclick=async()=>{try{const rows=parseCsv(box.querySelector('#importText').value,entity).map(r=>normalizeImport(entity,r)).filter(r=>r.nome);if(!rows.length){const m=box.querySelector('#importMsg');m.hidden=false;m.textContent='Nenhum registro válido encontrado.';return;}const existing=read(entity),names=new Set(existing.map(x=>x.nome.toLowerCase()));const fresh=rows.filter(x=>!names.has(x.nome.toLowerCase()));for(const record of fresh)await saveEducation(entity,record);box.hidden=true;page=1;draw();alert(`${fresh.length} registro(s) importado(s). Duplicados por nome foram ignorados.`);}catch(e){const m=box.querySelector('#importMsg');m.hidden=false;m.textContent=e.message;draw();}};};

 host.querySelectorAll('[data-entity]').forEach(b=>b.onclick=()=>{entity=b.dataset.entity;page=1;query='';host.querySelectorAll('.admin-tab').forEach(x=>x.classList.toggle('active',x===b));host.querySelector('#crudTitle').textContent=defs[entity].label;host.querySelector('#crudSearch').value='';host.querySelector('#crudEditor').hidden=true;draw();});
 host.querySelector('#crudPdfImport').onclick=()=>openSchoolPdfImport(host.querySelector('#crudEditor'),draw);
 host.querySelector('#crudSearch').oninput=e=>{query=e.target.value;page=1;draw();};host.querySelector('#crudSort').onchange=e=>{sort=e.target.value;page=1;draw();};host.querySelector('#crudNew').onclick=()=>openEditor();host.querySelector('#crudImport').onclick=openImport;host.querySelector('#pagePrev').onclick=()=>{page--;draw();};host.querySelector('#pageNext').onclick=()=>{page++;draw();};
 host.querySelector('#crudBody').onclick=async e=>{const edit=e.target.closest('[data-edit]'),del=e.target.closest('[data-delete]');if(edit)openEditor(edit.dataset.edit);if(del){const refs=dependencySummary(entity,del.dataset.delete);if(refs.length){alert('Este registro não pode ser excluído porque possui vínculos:\n\n• '+refs.join('\n• ')+'\n\nRemova ou altere os vínculos primeiro.');return;}if(confirm('Excluir este registro?')){try{await deleteEducation(entity,del.dataset.delete);draw();}catch(ex){alert(ex.message);}}}};
 draw();
}

function occurrenceSeries(data){
 const freq=data.recorrencia||'Nenhuma',until=data.repetirAte||data.dataInicio;if(freq==='Nenhuma'||!data.dataInicio||!until||until<data.dataInicio)return [{...data}];
 const group=uid(),duration=Math.max(0,dateDiffDays(data.dataInicio,data.dataFim||data.dataInicio));let d=data.dataInicio,n=0,out=[];
 while(d<=until&&n<500){const end=addDays(d,duration);out.push({...data,dataInicio:d,dataFim:end,recorrenciaGrupo:group,recorrenciaOrigem:data.dataInicio,recorrenciaIndice:n});n++;d=freq==='Semanal'?addDays(d,7):freq==='Mensal'?addMonths(d,1):addYears(d,1);}
 return out;
}

function eventForm(row,host,onDone){
 const editing=!!(row&&!row._new),escolas=read('escolas'),instituicoes=read('instituicoes'),turmas=read('turmas'),selected=new Set(row?.idsTurmas||[]);
 host.innerHTML=`<form id="eventForm"><div class="crud-editor-head"><div><span class="eyebrow">${editing?'EDITAR AGENDAMENTO':'NOVO AGENDAMENTO'}</span><h3>Ficha do evento / atividade</h3></div><button type="button" class="icon-btn" id="eventCancel">×</button></div>
 <div class="form-grid">
 <label>Nome / título<input name="nome" required value="${esc(row?.nome||'')}"></label>
 <label>Atividade<select name="tipo">${['Palestra','Curso','Oficina','Ação educativa','Evento','SIPAT','Programa','Campanha','Reunião','Visita técnica','Outro'].map(x=>`<option ${row?.tipo===x?'selected':''}>${x}</option>`).join('')}</select></label>
 <label>Modalidade<select name="modalidade">${['Presencial','Online','Híbrida'].map(x=>`<option ${(row?.modalidade||'Presencial')===x?'selected':''}>${x}</option>`).join('')}</select></label>
 <label>Status<select name="status">${['Planejado','Confirmado','Em andamento','Concluído','Cancelado'].map(x=>`<option ${row?.status===x?'selected':''}>${x}</option>`).join('')}</select></label>
 <label>Data inicial<input name="dataInicio" type="date" required value="${esc(row?.dataInicio||row?.data||today())}"></label>
 <label>Hora inicial<input name="horaInicio" type="time" required value="${esc(row?.horaInicio||'09:00')}"></label>
 <label>Data final<input name="dataFim" type="date" required value="${esc(row?.dataFim||row?.dataInicio||row?.data||today())}"></label>
 <label>Hora final<input name="horaFim" type="time" required value="${esc(row?.horaFim||'10:00')}"></label>
 <label>Escola solicitante<select name="idEscola"><option value="">Sem vínculo</option>${escolas.map(s=>`<option value="${s.id}" ${row?.idEscola===s.id?'selected':''}>${esc(s.nome)}</option>`).join('')}</select></label>
 <label>Instituição solicitante<select name="idInstituicao"><option value="">Sem vínculo</option>${instituicoes.map(s=>`<option value="${s.id}" ${row?.idInstituicao===s.id?'selected':''}>${esc(s.nome)}</option>`).join('')}</select></label>
 <label>Local / endereço<input name="local" value="${esc(row?.local||'')}"></label>
 <label>Responsável pelo atendimento<input name="responsavel" value="${esc(row?.responsavel||'')}"></label>
 <label>Contato do solicitante<input name="contato" value="${esc(row?.contato||'')}"></label>
 <label>Telefone<input name="telefone" data-phone maxlength="15" value="${esc(fmtPhone(row?.telefone||''))}"></label>
 <label>E-mail<input name="email" type="email" value="${esc(row?.email||'')}"></label>
 <label>Público-alvo<input name="publico" value="${esc(row?.publico||'')}" placeholder="Ex.: 2º ano, colaboradores, comunidade"></label>
 <label>Participantes previstos<input name="previsto" type="number" min="0" value="${esc(row?.previsto||'')}"></label>
 <label>Capacidade / vagas<input name="vagas" type="number" min="0" value="${esc(row?.vagas||'')}"></label>
 <label>Inscrições até<input name="inscricaoAte" type="date" value="${esc(row?.inscricaoAte||'')}"></label>
 <label>Prioridade<select name="prioridade">${['Baixa','Normal','Alta','Urgente'].map(x=>`<option ${row?.prioridade===x?'selected':''}>${x}</option>`).join('')}</select></label>
 </div>
 <fieldset class="form-section"><legend>Recorrência</legend><div class="form-grid"><label>Repetir<select name="recorrencia">${['Nenhuma','Semanal','Mensal','Anual'].map(x=>`<option ${(row?.recorrencia||'Nenhuma')===x?'selected':''}>${x}</option>`).join('')}</select></label><label>Replicar até<input name="repetirAte" type="date" value="${esc(row?.repetirAte||'')}"></label></div></fieldset>
 <fieldset class="form-section"><legend>Turmas vinculadas</legend><div class="check-grid">${turmas.length?turmas.map(t=>`<label class="check-card"><input type="checkbox" name="turma" value="${t.id}" ${selected.has(t.id)?'checked':''}><span><strong>${esc(t.nome)}</strong><small>${esc(label('escolas',t.idEscola))} • ${esc(t.turno||'')}</small></span></label>`).join(''):'<p class="empty-state">Nenhuma turma cadastrada.</p>'}</div></fieldset>
 <fieldset class="form-section"><legend>Operação</legend><div class="form-grid"><label>Materiais <small>material;quantidade</small><textarea name="materiaisText" rows="5" placeholder="Cartilha;100\nPanfleto;250">${esc(toLines(row?.materiais,'materials'))}</textarea></label><label>Equipe <small>nome;função</small><textarea name="equipeText" rows="5" placeholder="Maria;Educadora\nJoão;Operador">${esc(toLines(row?.equipe,'team'))}</textarea></label><label>Parceiros <small>um por linha</small><textarea name="parceirosText" rows="5">${esc(toLines(row?.parceiros,'partners'))}</textarea></label><label>Observações / necessidades<textarea name="observacao" rows="5">${esc(row?.observacao||row?.necessidades||'')}</textarea></label></div></fieldset>
 <p class="form-error" id="eventError" hidden></p><div class="form-actions"><button type="button" class="btn ghost" id="eventCancel2">Cancelar</button><button class="btn primary">Salvar agendamento</button></div></form>`;
 const close=()=>onDone(null);host.querySelector('#eventCancel').onclick=close;host.querySelector('#eventCancel2').onclick=close;
 host.querySelectorAll('[data-phone]').forEach(i=>i.oninput=()=>i.value=fmtPhone(i.value));
 host.querySelector('#eventForm').onsubmit=e=>{e.preventDefault();const fd=new FormData(e.target),data=Object.fromEntries(fd.entries()),err=host.querySelector('#eventError');data.idsTurmas=fd.getAll('turma');data.materiais=parseLines(data.materiaisText,'materials');data.equipe=parseLines(data.equipeText,'team');data.parceiros=parseLines(data.parceirosText,'partners');data.telefone=fmtPhone(data.telefone);delete data.materiaisText;delete data.equipeText;delete data.parceirosText;
  if(data.dataFim<data.dataInicio){err.hidden=false;err.textContent='A data final não pode ser anterior à data inicial.';return;}
  if(data.dataFim===data.dataInicio&&data.horaFim<=data.horaInicio){err.hidden=false;err.textContent='A hora final deve ser posterior à hora inicial.';return;}
  if(data.recorrencia!=='Nenhuma'&&(!data.repetirAte||data.repetirAte<data.dataInicio)){err.hidden=false;err.textContent='Informe uma data válida para o fim da recorrência.';return;}
  const conflicts=eventConflicts(data,row?.id||'');
  if(conflicts.length&&!confirm('Atenção: este horário conflita com '+conflicts.length+' agendamento(s):\n\n'+conflicts.slice(0,5).map(x=>'• '+x.nome+' — '+fmtDate(x.dataInicio||x.data)+' '+(x.horaInicio||'')).join('\n')+'\n\nDeseja salvar mesmo assim?'))return;
  const all=read('eventos');let saved;
  if(editing){const i=all.findIndex(x=>x.id===row.id);if(i<0){err.hidden=false;err.textContent='Agendamento não encontrado para atualização.';return;}saved={...all[i],...data,updatedAt:new Date().toISOString()};all[i]=saved;write('eventos',all);}
  else{const series=occurrenceSeries(data).map((x,i)=>({id:uid(),checkinToken:makeCheckinToken('E'),...x,idSolicitacao:row?.idSolicitacao||'',presenca:{},createdAt:new Date().toISOString(),seriePrincipal:i===0}));saved=series[0];write('eventos',[...series,...all]);}
  onDone(saved);
 };
}

function attendanceEditor(event,host,onDone){
 const turmaIds=event.idsTurmas||[],alunos=read('alunos').filter(a=>turmaIds.includes(a.idTurma)),presence=event.presenca||{},regs=read('inscricoes').filter(r=>r.idEvento===event.id&&!['Cancelada','Lista de espera'].includes(r.status));
 host.innerHTML=`<div class="crud-editor-head"><div><span class="eyebrow">PRESENÇA / CHECK-IN</span><h3>${esc(event.nome)}</h3><p>${fmtDate(event.dataInicio||event.data)} • ${alunos.length} aluno(s) vinculados • ${regs.length} inscrição(ões)</p></div><button class="icon-btn" id="presenceClose">×</button></div>
 <div class="presence-toolbar"><button class="btn ghost small" id="markAll">Marcar todos</button><button class="btn ghost small" id="clearAll">Limpar</button></div>
 <h4>Turmas / alunos</h4><div class="presence-list">${alunos.length?alunos.map(a=>`<label class="check-card"><input type="checkbox" data-presence="${a.id}" ${presence[a.id]?'checked':''}><span><strong>${esc(a.nome)}</strong><small>${esc(label('turmas',a.idTurma))}</small></span></label>`).join(''):'<p class="empty-state">Nenhum aluno encontrado nas turmas vinculadas.</p>'}</div>
 <h4>Inscrições externas / grupos</h4><div class="presence-list">${regs.length?regs.map(r=>`<label class="check-card"><input type="checkbox" data-regpresence="${r.id}" ${r.status==='Presente'?'checked':''}><span><strong>${esc(r.nome||r.responsavel||'Inscrição')}</strong><small>${Number(r.quantidade)||1} participante(s) • ${esc(r.protocolo||'')}</small></span></label>`).join(''):'<p class="empty-state">Nenhuma inscrição externa confirmada.</p>'}</div>
 <div class="form-actions"><button class="btn primary" id="savePresence">Salvar presença</button></div>`;
 host.querySelector('#presenceClose').onclick=()=>onDone(false);host.querySelector('#markAll').onclick=()=>host.querySelectorAll('[data-presence],[data-regpresence]').forEach(x=>x.checked=true);host.querySelector('#clearAll').onclick=()=>host.querySelectorAll('[data-presence],[data-regpresence]').forEach(x=>x.checked=false);
 host.querySelector('#savePresence').onclick=()=>{const map={};host.querySelectorAll('[data-presence]').forEach(x=>map[x.dataset.presence]=x.checked);const savedEvent=updateById('eventos',event.id,x=>{x.presenca=map;x.updatedAt=new Date().toISOString();});if(savedEvent)Object.assign(event,savedEvent);const all=read('inscricoes');host.querySelectorAll('[data-regpresence]').forEach(x=>{const r=all.find(z=>z.id===x.dataset.regpresence);if(r){if(x.checked)r.status='Presente';else if(r.status==='Presente')r.status='Confirmada';r.updatedAt=new Date().toISOString();}});write('inscricoes',all);onDone(true);};
}
function protocol(prefix='ME'){const d=new Date(),ymd=d.getFullYear()+String(d.getMonth()+1).padStart(2,'0')+String(d.getDate()).padStart(2,'0');return prefix+'-'+ymd+'-'+Math.random().toString(36).slice(2,7).toUpperCase();}
function sourceName(r){if(r.idEscola)return label('escolas',r.idEscola);if(r.idInstituicao)return label('instituicoes',r.idInstituicao);if(r.idPessoa)return label('pessoas',r.idPessoa);return r.solicitanteNome||r.nome||'—';}
function occupied(idEvento,exclude=''){return read('inscricoes').filter(x=>x.idEvento===idEvento&&x.id!==exclude&&['Confirmada','Presente'].includes(x.status)).reduce((s,x)=>s+(Number(x.quantidade)||1),0);}
function requestForm(row,host,onDone){
 const escolas=read('escolas'),instituicoes=read('instituicoes'),pessoas=read('pessoas'),editing=!!row;
 host.innerHTML=`<form id="requestForm"><div class="crud-editor-head"><div><span class="eyebrow">${editing?'EDITAR SOLICITAÇÃO':'NOVA SOLICITAÇÃO / DEMANDA'}</span><h3>Pedido de palestra, curso ou ação</h3></div><button type="button" class="icon-btn" id="requestClose">×</button></div>
 <div class="callout card"><strong>Importante</strong><p>O envio da solicitação gera apenas um protocolo de recebimento. O atendimento somente será garantido após análise e confirmação do gestor.</p></div>
 <div class="form-grid">
 <label>Origem<select name="origemTipo">${['Escola','Instituição','Pessoa / Comunidade'].map(x=>`<option ${row?.origemTipo===x?'selected':''}>${x}</option>`).join('')}</select></label>
 <label>Escola<select name="idEscola"><option value="">Não se aplica</option>${escolas.map(x=>`<option value="${x.id}" ${row?.idEscola===x.id?'selected':''}>${esc(x.nome)}</option>`).join('')}</select></label>
 <label>Instituição<select name="idInstituicao"><option value="">Não se aplica</option>${instituicoes.map(x=>`<option value="${x.id}" ${row?.idInstituicao===x.id?'selected':''}>${esc(x.nome)}</option>`).join('')}</select></label>
 <label>Pessoa / contato cadastrado<select name="idPessoa"><option value="">Não se aplica</option>${pessoas.map(x=>`<option value="${x.id}" ${row?.idPessoa===x.id?'selected':''}>${esc(x.nome)}</option>`).join('')}</select></label>
 <label>Solicitante / responsável<input name="solicitanteNome" required value="${esc(row?.solicitanteNome||'')}"></label>
 <label>Telefone<input name="telefone" data-phone maxlength="15" value="${esc(fmtPhone(row?.telefone||''))}"></label>
 <label>E-mail<input name="email" type="email" value="${esc(row?.email||'')}"></label>
 <label>Atividade desejada<select name="atividade">${['Palestra','Curso','Oficina','Ação educativa','Programa','SIPAT','Visita técnica','Outro'].map(x=>`<option ${row?.atividade===x?'selected':''}>${x}</option>`).join('')}</select></label>
 <label>Data preferida<input name="dataPreferida" type="date" value="${esc(row?.dataPreferida||'')}"></label>
 <label>Hora preferida<input name="horaPreferida" type="time" value="${esc(row?.horaPreferida||'')}"></label>
 <label>Duração estimada (min)<input name="duracaoMin" type="number" min="15" step="15" value="${esc(row?.duracaoMin||60)}"></label>
 <label>Flexibilidade<select name="flexibilidade">${['Data/horário fixos','Pode ajustar horário','Pode ajustar data','Data e horário flexíveis'].map(x=>`<option ${row?.flexibilidade===x?'selected':''}>${x}</option>`).join('')}</select></label>
 <label>Público-alvo<input name="publico" value="${esc(row?.publico||'')}"></label>
 <label>Quantidade prevista<input name="quantidade" type="number" min="1" value="${esc(row?.quantidade||'')}"></label>
 <label>Local desejado<input name="local" value="${esc(row?.local||'')}"></label>
 <label>Status<select name="status">${['Recebida','Em análise','Aguardando complementação','Aguardando disponibilidade','Agendada','Concluída','Não atendida','Cancelada'].map(x=>`<option ${(row?.status||'Recebida')===x?'selected':''}>${x}</option>`).join('')}</select></label>
 </div><label>Necessidades / objetivo da solicitação<textarea name="necessidades" rows="4">${esc(row?.necessidades||'')}</textarea></label><label>Observações<textarea name="observacao" rows="4">${esc(row?.observacao||'')}</textarea></label>
 <div class="form-actions"><button type="button" class="btn ghost" id="requestCancel">Cancelar</button><button class="btn primary">Salvar solicitação</button></div></form>`;
 const close=()=>onDone(null);host.querySelector('#requestClose').onclick=close;host.querySelector('#requestCancel').onclick=close;host.querySelectorAll('[data-phone]').forEach(i=>i.oninput=()=>i.value=fmtPhone(i.value));
 host.querySelector('#requestForm').onsubmit=e=>{e.preventDefault();const data=Object.fromEntries(new FormData(e.target).entries());data.telefone=fmtPhone(data.telefone);const all=read('solicitacoes');let saved;if(row){const i=all.findIndex(x=>x.id===row.id);if(i<0){alert('Solicitação não encontrada para atualização.');return;}saved={...all[i],...data,updatedAt:new Date().toISOString()};all[i]=saved;}else{saved={id:uid(),protocolo:protocol('SOL'),...data,createdAt:new Date().toISOString()};all.unshift(saved);}write('solicitacoes',all);onDone(saved);};
}
function registrationForm(row,host,onDone,presetEvent=''){
 const eventos=read('eventos').filter(x=>x.status!=='Cancelado').sort((a,b)=>(a.dataInicio||'').localeCompare(b.dataInicio||'')),editing=!!row,selectedEvent=row?.idEvento||presetEvent||eventos[0]?.id||'';
 host.innerHTML=`<form id="registrationForm"><div class="crud-editor-head"><div><span class="eyebrow">${editing?'EDITAR INSCRIÇÃO':'NOVA INSCRIÇÃO'}</span><h3>Ficha de inscrição</h3></div><button type="button" class="icon-btn" id="regClose">×</button></div>
 <div class="callout card"><strong>Inscrição sujeita à análise</strong><p>O registro desta ficha não garante vaga nem atendimento. A participação só estará confirmada quando o gestor alterar o status para <b>Confirmada</b>.</p></div>
 <div class="form-grid"><label>Evento / atividade<select name="idEvento" required><option value="">Selecione</option>${eventos.map(x=>`<option value="${x.id}" ${selectedEvent===x.id?'selected':''}>${fmtDate(x.dataInicio)} • ${esc(x.nome)}</option>`).join('')}</select></label><label>Tipo de inscrição<select name="tipoInscricao">${['Instituição / Grupo','Pessoa individual'].map(x=>`<option ${row?.tipoInscricao===x?'selected':''}>${x}</option>`).join('')}</select></label><label>Nome / grupo / participante<input name="nome" required value="${esc(row?.nome||'')}"></label><label>Responsável / contato<input name="responsavel" value="${esc(row?.responsavel||'')}"></label><label>Telefone<input name="telefone" data-phone maxlength="15" value="${esc(fmtPhone(row?.telefone||''))}"></label><label>E-mail<input name="email" type="email" value="${esc(row?.email||'')}"></label><label>Quantidade de vagas<input name="quantidade" type="number" min="1" value="${esc(row?.quantidade||1)}"></label><label>Status<select name="status">${['Recebida','Em análise','Confirmada','Lista de espera','Não confirmada','Presente','Cancelada'].map(x=>`<option ${(row?.status||'Recebida')===x?'selected':''}>${x}</option>`).join('')}</select></label></div>
 <label>Observações / necessidades de acessibilidade<textarea name="observacao" rows="4">${esc(row?.observacao||'')}</textarea></label><p class="form-error" id="regError" hidden></p><div class="form-actions"><button type="button" class="btn ghost" id="regCancel">Cancelar</button><button class="btn primary">Salvar inscrição</button></div></form>`;
 const close=()=>onDone(null);host.querySelector('#regClose').onclick=close;host.querySelector('#regCancel').onclick=close;host.querySelectorAll('[data-phone]').forEach(i=>i.oninput=()=>i.value=fmtPhone(i.value));
 host.querySelector('#registrationForm').onsubmit=e=>{e.preventDefault();const data=Object.fromEntries(new FormData(e.target).entries()),err=host.querySelector('#regError'),ev=byId('eventos',data.idEvento);data.telefone=fmtPhone(data.telefone);data.quantidade=Math.max(1,Number(data.quantidade)||1);const cap=Number(ev?.vagas)||0,used=occupied(data.idEvento,row?.id||'');if(cap&&['Confirmada','Presente'].includes(data.status)&&used+data.quantidade>cap){err.hidden=false;err.textContent=`Capacidade excedida. Vagas: ${cap}; já ocupadas: ${used}. Use “Lista de espera” ou reduza a quantidade.`;return;}const all=read('inscricoes');let saved;if(row){const i=all.findIndex(x=>x.id===row.id);if(i<0){err.hidden=false;err.textContent='Inscrição não encontrada para atualização.';return;}saved={...all[i],...data,updatedAt:new Date().toISOString()};all[i]=saved;}else{saved={id:uid(),protocolo:protocol('INS'),checkinToken:makeCheckinToken('I'),...data,createdAt:new Date().toISOString()};all.unshift(saved);}write('inscricoes',all);onDone(saved);};
}
function printRegistration(r){
 const ev=byId('eventos',r.idEvento)||{},w=window.open('','_blank');if(!w)return;
 const html='<!doctype html><html><head><meta charset="utf-8"><title>Ficha de inscrição</title><style>body{font-family:Arial;color:#173f60;padding:32px}.head{border-bottom:4px solid #0b679b;padding-bottom:14px}h1{margin:0}.box{border:1px solid #ccdce5;border-radius:12px;padding:16px;margin-top:14px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.label{font-size:12px;color:#6b8290}.value{font-weight:700;margin-bottom:8px}.protocol{font-size:20px;font-weight:800;color:#0b679b}footer{margin-top:26px;font-size:12px;color:#718492}</style></head><body><div class="head"><h1>MOBILIZA EDUCA</h1><p>Ficha de inscrição / protocolo</p><div class="protocol">'+esc(r.protocolo||'')+'</div></div><div class="box"><div class="grid"><div><div class="label">Atividade</div><div class="value">'+esc(ev.nome||'—')+'</div></div><div><div class="label">Data e horário</div><div class="value">'+fmtDate(ev.dataInicio)+' • '+esc(ev.horaInicio||'')+' a '+esc(ev.horaFim||'')+'</div></div><div><div class="label">Inscrito / grupo</div><div class="value">'+esc(r.nome||'—')+'</div></div><div><div class="label">Responsável</div><div class="value">'+esc(r.responsavel||'—')+'</div></div><div><div class="label">Quantidade</div><div class="value">'+(Number(r.quantidade)||1)+'</div></div><div><div class="label">Status</div><div class="value">'+esc(r.status||'Recebida')+'</div></div><div><div class="label">Telefone</div><div class="value">'+esc(r.telefone||'—')+'</div></div><div><div class="label">E-mail</div><div class="value">'+esc(r.email||'—')+'</div></div></div></div><div class="box"><div class="label">Local</div><div class="value">'+esc(ev.local||'A definir')+'</div><div class="label">Observações</div><div>'+esc(r.observacao||'—')+'</div></div><div class="box"><strong>Atenção:</strong> este protocolo comprova o recebimento da inscrição, mas não garante vaga ou atendimento até a confirmação do gestor.</div><footer>Documento gerado em '+new Date().toLocaleString('pt-BR')+'.</footer></body></html>';
 w.document.write(html);w.document.close();setTimeout(()=>w.print(),250);
}

function renderEventos(host){
 ensureOpsCss();
 let tab='agenda',status='',query='',page=1,sort='dateAsc',calendarCursor=new Date(today()+'T12:00:00');const pageSize=10;
 host.innerHTML=shell(modules['admin-eventos'],`
 <div class="admin-kpis"><article class="admin-kpi"><span>Agendamentos</span><strong id="centralEventKpi">0</strong></article><article class="admin-kpi"><span>Solicitações abertas</span><strong id="centralReqKpi">0</strong></article><article class="admin-kpi"><span>Inscrições</span><strong id="centralRegKpi">0</strong></article><article class="admin-kpi"><span>Vagas confirmadas</span><strong id="centralSeatsKpi">0</strong></article></div>
 <div class="admin-tabs ops-tabs"><button class="admin-tab active" data-central-tab="agenda">📋 Lista</button><button class="admin-tab" data-central-tab="calendario">🗓 Calendário</button><button class="admin-tab" data-central-tab="operacao">✅ Operação</button><button class="admin-tab" data-central-tab="solicitacoes">📥 Solicitações</button><button class="admin-tab" data-central-tab="inscricoes">📝 Inscrições</button></div><div id="centralPanel"></div><div id="eventEditor" class="crud-editor" hidden></div>`);
 const panel=host.querySelector('#centralPanel'),editor=host.querySelector('#eventEditor');
 const kpis=()=>{const req=read('solicitacoes').filter(x=>['Recebida','Nova','Em análise','Aguardando complementação','Aguardando disponibilidade'].includes(x.status||'Recebida')).length,regs=read('inscricoes'),seats=regs.filter(x=>['Confirmada','Presente'].includes(x.status)).reduce((s,x)=>s+(Number(x.quantidade)||1),0);host.querySelector('#centralEventKpi').textContent=read('eventos').length;host.querySelector('#centralReqKpi').textContent=req;host.querySelector('#centralRegKpi').textContent=regs.length;host.querySelector('#centralSeatsKpi').textContent=seats;};
 const closeEditor=()=>editor.hidden=true;
 const openEvent=(row=null,after=null)=>{editor.hidden=false;eventForm(row,editor,saved=>{closeEditor();if(saved&&after)after(saved);renderTab();});};
 const openRequest=(row=null)=>{editor.hidden=false;requestForm(row,editor,()=>{closeEditor();renderTab();});};
 const openReg=(row=null,eventId='')=>{editor.hidden=false;registrationForm(row,editor,()=>{closeEditor();renderTab();},eventId);};
 function agenda(){
  const rowsFiltered=()=>{let rows=read('eventos').filter(x=>(!status||x.status===status)&&(!query||JSON.stringify(x).toLowerCase().includes(query.toLowerCase())));rows.sort((a,b)=>sort==='dateDesc'?String(b.dataInicio||'').localeCompare(String(a.dataInicio||'')):sort==='nameAsc'?String(a.nome||'').localeCompare(String(b.nome||''),'pt-BR'):String(a.dataInicio||'9999').localeCompare(String(b.dataInicio||'9999')));return rows;};
  panel.innerHTML=`<div class="crud-toolbar"><div><h3>Agenda de palestras, cursos e ações</h3><span id="eventCount"></span></div><div class="crud-toolbar-actions"><input id="eventSearch" type="search" placeholder="Pesquisar..."><select id="eventSort"><option value="dateAsc">Data crescente</option><option value="dateDesc">Data decrescente</option><option value="nameAsc">Nome A–Z</option></select><button class="btn primary" id="eventNew">+ Agendar</button></div></div><div class="filter-row"><button class="chip-filter active" data-status="">Todos</button>${['Planejado','Confirmado','Em andamento','Concluído','Cancelado'].map(s=>`<button class="chip-filter" data-status="${s}">${s}</button>`).join('')}</div><div class="table-wrap"><table class="admin-table"><thead><tr><th>Atividade</th><th>Data / hora</th><th>Solicitante</th><th>Vagas</th><th>Status</th><th>Ações</th></tr></thead><tbody id="eventBody"></tbody></table></div><div class="pagination"><button class="btn ghost small" id="eventPrev">←</button><span id="eventPage"></span><button class="btn ghost small" id="eventNext">→</button></div>`;
  const draw=()=>{const rows=rowsFiltered(),pages=Math.max(1,Math.ceil(rows.length/pageSize));page=Math.min(page,pages);const vis=rows.slice((page-1)*pageSize,page*pageSize);panel.querySelector('#eventBody').innerHTML=vis.map(r=>{const used=occupied(r.id),cap=Number(r.vagas)||0;return `<tr><td><strong>${esc(r.nome)}</strong><small>${esc(r.tipo||'')} • ${esc(r.modalidade||'Presencial')}</small></td><td>${fmtDate(r.dataInicio||r.data)}<small>${esc(r.horaInicio||'')} – ${esc(r.horaFim||'')}</small></td><td>${esc(sourceName(r))}<small>${esc(r.local||'Local a definir')}</small></td><td><strong>${used}${cap?' / '+cap:''}</strong><small>${cap?Math.max(0,cap-used)+' disponível(is)':'sem limite definido'}</small></td><td><span class="status-chip">${esc(r.status||'Planejado')}</span> ${eventConflicts(r,r.id).length?'<span class="ops-badge danger">⚠ conflito</span>':''}<small>Checklist ${checklistProgress(r).pct}%</small></td><td class="table-actions"><button class="btn primary small" data-checkin="${r.id}">QR Check-in</button><button class="btn ghost small" data-event-qr="${r.id}">QR Evento</button><button class="btn ghost small" data-checklist="${r.id}">Checklist</button><button class="btn ghost small" data-sheet="${r.id}">Ficha</button><button class="btn ghost small" data-reg-event="${r.id}">+ Inscrição</button><button class="btn ghost small" data-publish-event="${r.id}">${r.publicadoOnline?'✓ Online':'Publicar inscrições'}</button><button class="btn ghost small" data-presence="${r.id}">Presença</button><button class="btn ghost small" data-event-edit="${r.id}">Editar</button><button class="btn danger small" data-event-delete="${r.id}">Excluir</button></td></tr>`;}).join('')||'<tr><td colspan="6" class="empty-state">Nenhum agendamento encontrado.</td></tr>';panel.querySelector('#eventCount').textContent=rows.length+' registro(s)';panel.querySelector('#eventPage').textContent='Página '+page+' de '+pages;panel.querySelector('#eventPrev').disabled=page<=1;panel.querySelector('#eventNext').disabled=page>=pages;};
  panel.querySelector('#eventNew').onclick=()=>openEvent();panel.querySelector('#eventSearch').oninput=e=>{query=e.target.value;page=1;draw();};panel.querySelector('#eventSort').onchange=e=>{sort=e.target.value;page=1;draw();};panel.querySelector('#eventPrev').onclick=()=>{page--;draw();};panel.querySelector('#eventNext').onclick=()=>{page++;draw();};panel.querySelectorAll('[data-status]').forEach(b=>b.onclick=()=>{status=b.dataset.status;page=1;panel.querySelectorAll('[data-status]').forEach(x=>x.classList.toggle('active',x===b));draw();});
  panel.querySelector('#eventBody').onclick=e=>{const edit=e.target.closest('[data-event-edit]'),del=e.target.closest('[data-event-delete]'),pres=e.target.closest('[data-presence]'),reg=e.target.closest('[data-reg-event]'),pub=e.target.closest('[data-publish-event]'),chk=e.target.closest('[data-checklist]'),sheet=e.target.closest('[data-sheet]'),cin=e.target.closest('[data-checkin]'),evqr=e.target.closest('[data-event-qr]');if(cin){const ev=byId('eventos',cin.dataset.checkin);editor.hidden=false;checkinDesk(ev,editor,()=>{closeEditor();renderTab();});}if(evqr)printEventQr(byId('eventos',evqr.dataset.eventQr));if(chk){const ev=byId('eventos',chk.dataset.checklist);editor.hidden=false;checklistEditor(ev,editor,()=>{closeEditor();renderTab();});}if(sheet)printOperationalSheet(byId('eventos',sheet.dataset.sheet));if(pub){const ev=byId('eventos',pub.dataset.publishEvent);ensureEventCheckinToken(ev);publishEvent({...ev,inscricoesAbertas:true}).then(()=>{const saved=updateById('eventos',ev.id,x=>{x.publicadoOnline=true;x.status=x.status==='Planejado'?'Confirmado':x.status;x.updatedAt=new Date().toISOString();});if(saved)Object.assign(ev,saved);renderTab();}).catch(x=>alert(x.message));}if(edit)openEvent(byId('eventos',edit.dataset.eventEdit));if(reg)openReg(null,reg.dataset.regEvent);if(pres){const ev=byId('eventos',pres.dataset.presence);editor.hidden=false;attendanceEditor(ev,editor,s=>{closeEditor();if(s)renderTab();});}if(del&&confirm('Excluir este agendamento? As inscrições vinculadas não serão excluídas automaticamente.')){write('eventos',read('eventos').filter(x=>x.id!==del.dataset.eventDelete));draw();kpis();}};draw();
 }

 function calendario(){
  const month=calendarCursor.getMonth(),year=calendarCursor.getFullYear(),first=new Date(year,month,1),last=new Date(year,month+1,0),start=new Date(year,month,1-first.getDay()),end=new Date(year,month,last.getDate()+(6-last.getDay()));
  const monthLabel=calendarCursor.toLocaleDateString('pt-BR',{month:'long',year:'numeric'});
  panel.innerHTML=`<div class="calendar-shell"><div class="calendar-head"><button class="btn ghost small" id="calPrev">←</button><div><div class="calendar-title">${esc(monthLabel)}</div><small>Clique em um evento para editar</small></div><div style="display:flex;gap:6px"><button class="btn ghost small" id="calToday">Hoje</button><button class="btn ghost small" id="calNext">→</button></div></div><div class="calendar-weekdays">${['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map(x=>'<div>'+x+'</div>').join('')}</div><div class="calendar-grid" id="calGrid"></div></div>`;
  const events=read('eventos').filter(x=>x.status!=='Cancelado');
  let html='',d=new Date(start);
  while(d<=end){
   const iso=d.toISOString().slice(0,10),same=d.getMonth()===month,dayEvents=events.filter(x=>{const a=x.dataInicio||x.data,b=x.dataFim||a;return iso>=a&&iso<=b;}).sort((a,b)=>String(a.horaInicio||'').localeCompare(String(b.horaInicio||''))),isToday=iso===today();
   html+=`<div class="calendar-day ${same?'':'muted'} ${isToday?'today':''}"><div class="calendar-date">${d.getDate()}</div>${dayEvents.slice(0,4).map(x=>`<button class="calendar-event ${eventConflicts(x,x.id).length?'conflict':''}" data-cal-event="${x.id}" title="${esc(x.nome)}">${esc(x.horaInicio||'')} ${esc(x.nome)}</button>`).join('')}${dayEvents.length>4?'<div class="calendar-more">+'+(dayEvents.length-4)+' evento(s)</div>':''}</div>`;
   d.setDate(d.getDate()+1);
  }
  panel.querySelector('#calGrid').innerHTML=html;
  panel.querySelector('#calPrev').onclick=()=>{calendarCursor=new Date(year,month-1,1);calendario();};
  panel.querySelector('#calNext').onclick=()=>{calendarCursor=new Date(year,month+1,1);calendario();};
  panel.querySelector('#calToday').onclick=()=>{calendarCursor=new Date(today()+'T12:00:00');calendario();};
  panel.querySelector('#calGrid').onclick=e=>{const b=e.target.closest('[data-cal-event]');if(b)openEvent(byId('eventos',b.dataset.calEvent));};
 }
 function operacao(){
  const all=read('eventos').filter(x=>x.status!=='Cancelado'),now=today(),in7=addDays(now,7);
  const hoje=all.filter(x=>(x.dataInicio||x.data)<=now&&(x.dataFim||x.dataInicio||x.data)>=now).sort((a,b)=>String(a.horaInicio||'').localeCompare(String(b.horaInicio||'')));
  const proximos=all.filter(x=>(x.dataInicio||x.data)>now&&(x.dataInicio||x.data)<=in7).sort((a,b)=>String(a.dataInicio||'').localeCompare(String(b.dataInicio||'')));
  const naoProntos=all.filter(x=>(x.dataInicio||x.data)>=now&&(x.dataInicio||x.data)<=in7&&checklistProgress(x).pct<100);
  const conflitos=all.filter(x=>eventConflicts(x,x.id).length);
  const pendReq=read('solicitacoes').filter(x=>['Recebida','Nova','Em análise','Aguardando complementação','Aguardando disponibilidade'].includes(x.status||'Recebida'));
  const renderItems=rows=>rows.length?rows.map(x=>{const p=checklistProgress(x),c=eventConflicts(x,x.id).length;return `<article class="ops-item"><div><strong>${esc(x.nome)}</strong><small>${fmtDate(x.dataInicio||x.data)} • ${esc(x.horaInicio||'')}–${esc(x.horaFim||'')} • ${esc(x.local||'Local a definir')}</small><div style="margin-top:6px"><span class="ops-badge ${p.pct===100?'ok':'warn'}">Checklist ${p.pct}%</span> ${c?'<span class="ops-badge danger">⚠ '+c+' conflito(s)</span>':''}</div></div><div class="ops-actions"><button class="btn primary small" data-op-checkin="${x.id}">Check-in</button><button class="btn ghost small" data-op-check="${x.id}">Checklist</button><button class="btn ghost small" data-op-sheet="${x.id}">Ficha</button><button class="btn ghost small" data-op-edit="${x.id}">Editar</button></div></article>`;}).join(''):'<p class="empty-state">Nenhum item.</p>';
  panel.innerHTML=`<div class="ops-overview"><article class="ops-card"><strong>${hoje.length}</strong><span>atendimento(s) hoje</span></article><article class="ops-card"><strong>${proximos.length}</strong><span>próximos 7 dias</span></article><article class="ops-card"><strong>${naoProntos.length}</strong><span>ainda não prontos</span></article><article class="ops-card"><strong>${conflitos.length}</strong><span>com conflito de agenda</span></article></div>
  <div class="admin-dashboard-grid"><div class="admin-panel card"><div class="panel-head"><h3>Hoje</h3><span>${hoje.length}</span></div><div class="ops-list">${renderItems(hoje)}</div></div><div class="admin-panel card"><div class="panel-head"><h3>Próximos 7 dias</h3><span>${proximos.length}</span></div><div class="ops-list">${renderItems(proximos)}</div></div></div>
  <div class="admin-dashboard-grid" style="margin-top:12px"><div class="admin-panel card"><div class="panel-head"><h3>Preparação pendente</h3><span>${naoProntos.length}</span></div><div class="ops-list">${renderItems(naoProntos)}</div></div><div class="admin-panel card"><div class="panel-head"><h3>Solicitações aguardando providência</h3><span>${pendReq.length}</span></div>${pendReq.slice(0,8).map(r=>`<div class="admin-list-row"><div><strong>${esc(r.protocolo||'')}</strong><small>${esc(sourceName(r))} • ${esc(r.atividade||'')}</small></div><span class="status-chip">${esc(r.status||'Recebida')}</span></div>`).join('')||'<p class="empty-state">Nenhuma solicitação pendente.</p>'}</div></div>`;
  panel.onclick=e=>{const ch=e.target.closest('[data-op-check]'),sh=e.target.closest('[data-op-sheet]'),ed=e.target.closest('[data-op-edit]'),cin=e.target.closest('[data-op-checkin]');if(cin){const ev=byId('eventos',cin.dataset.opCheckin);editor.hidden=false;checkinDesk(ev,editor,()=>{closeEditor();renderTab();});}if(ch){const ev=byId('eventos',ch.dataset.opCheck);editor.hidden=false;checklistEditor(ev,editor,()=>{closeEditor();renderTab();});}if(sh)printOperationalSheet(byId('eventos',sh.dataset.opSheet));if(ed)openEvent(byId('eventos',ed.dataset.opEdit));};
 }
 function solicitacoes(){
  let q='';panel.innerHTML=`<div class="crud-toolbar"><div><h3>Solicitações e demandas</h3><span id="reqCount"></span></div><div class="crud-toolbar-actions"><input id="reqSearch" type="search" placeholder="Pesquisar solicitação..."><button class="btn primary" id="reqNew">+ Nova solicitação</button></div></div><div class="callout card"><strong>Fluxo recomendado</strong><p>Registre o pedido mesmo quando a data ainda não estiver confirmada. Depois use <b>Agendar</b> para transformar a solicitação em compromisso oficial sem redigitar os dados.</p></div><div class="table-wrap"><table class="admin-table"><thead><tr><th>Protocolo</th><th>Solicitante</th><th>Demanda</th><th>Preferência</th><th>Status</th><th>Ações</th></tr></thead><tbody id="reqBody"></tbody></table></div>`;
  const draw=()=>{const rows=read('solicitacoes').filter(x=>!q||JSON.stringify(x).toLowerCase().includes(q.toLowerCase())).sort((a,b)=>String(b.createdAt||'').localeCompare(String(a.createdAt||'')));panel.querySelector('#reqBody').innerHTML=rows.map(r=>`<tr><td><strong>${esc(r.protocolo||'')}</strong><small>${esc(r.origemTipo||'')}</small></td><td><strong>${esc(sourceName(r))}</strong><small>${esc(r.solicitanteNome||'')} • ${esc(r.telefone||r.email||'')}</small></td><td>${esc(r.atividade||'')}<small>${esc(r.publico||'')} • ${Number(r.quantidade)||0} pessoa(s)</small></td><td>${fmtDate(r.dataPreferida)}<small>${esc(r.horaPreferida||'')} • ${esc(r.flexibilidade||'')}</small></td><td><span class="status-chip">${esc(r.status||'Recebida')}</span></td><td class="table-actions">${!r.idEvento&&['Recebida','Nova'].includes(r.status||'Recebida')?`<button class="btn ghost small" data-req-analyze="${r.id}">Analisar</button>`:''}${r.idEvento?'<button class="btn ghost small" disabled>Agendada</button>':`<button class="btn primary small" data-req-schedule="${r.id}">Agendar</button>`}${!r.idEvento&&!['Não atendida','Cancelada'].includes(r.status)?`<button class="btn ghost small" data-req-complement="${r.id}">Complemento</button><button class="btn danger small" data-req-reject="${r.id}">Não atender</button>`:''}<button class="btn ghost small" data-req-edit="${r.id}">Editar</button></td></tr>`).join('')||'<tr><td colspan="6" class="empty-state">Nenhuma solicitação registrada.</td></tr>';panel.querySelector('#reqCount').textContent=rows.length+' solicitação(ões)';};
  panel.querySelector('#reqNew').onclick=()=>openRequest();panel.querySelector('#reqSearch').oninput=e=>{q=e.target.value;draw();};panel.querySelector('#reqBody').onclick=e=>{const edit=e.target.closest('[data-req-edit]'),sch=e.target.closest('[data-req-schedule]'),an=e.target.closest('[data-req-analyze]'),comp=e.target.closest('[data-req-complement]'),rej=e.target.closest('[data-req-reject]');const setStatus=async(id,s)=>{const all=read('solicitacoes'),r=all.find(x=>x.id===id);if(!r)return;try{if(r._cloud)await updateCloudRequestStatus(id,s);r.status=s;r.updatedAt=new Date().toISOString();write('solicitacoes',all);renderTab();}catch(x){alert(x.message);}};if(edit)openRequest(byId('solicitacoes',edit.dataset.reqEdit));if(an)setStatus(an.dataset.reqAnalyze,'Em análise');if(comp)setStatus(comp.dataset.reqComplement,'Aguardando complementação');if(rej&&confirm('Registrar esta solicitação como não atendida?'))setStatus(rej.dataset.reqReject,'Não atendida');if(sch){const r=byId('solicitacoes',sch.dataset.reqSchedule),start=r.dataPreferida||today(),mins=Number(r.duracaoMin)||60,h=r.horaPreferida||'09:00',parts=h.split(':').map(Number),endMin=parts[0]*60+parts[1]+mins,end=String(Math.floor(endMin/60)%24).padStart(2,'0')+':'+String(endMin%60).padStart(2,'0'),pre={_new:true,idSolicitacao:r.id,nome:r.atividade+' - '+sourceName(r),tipo:r.atividade,dataInicio:start,dataFim:start,horaInicio:h,horaFim:end,idEscola:r.idEscola||'',idInstituicao:r.idInstituicao||'',contato:r.solicitanteNome||'',telefone:r.telefone||'',email:r.email||'',publico:r.publico||'',previsto:r.quantidade||'',local:r.local||'',observacao:r.necessidades||'',status:'Planejado'};openEvent(pre,saved=>{const all=read('solicitacoes'),orig=all.find(x=>x.id===r.id);if(orig){orig.status='Agendada';orig.idEvento=saved.id;orig.updatedAt=new Date().toISOString();write('solicitacoes',all);if(orig._cloud)updateCloudRequestStatus(orig.id,'Agendada',{idEvento:saved.id}).catch(x=>alert(x.message));}});}};draw();
 }
 function inscricoes(){
  let q='';panel.innerHTML=`<div class="crud-toolbar"><div><h3>Inscrições e controle de vagas</h3><span id="regCount"></span></div><div class="crud-toolbar-actions"><input id="regSearch" type="search" placeholder="Pesquisar inscrição..."><button class="btn primary" id="regNew">+ Nova inscrição</button></div></div><div class="table-wrap"><table class="admin-table"><thead><tr><th>Protocolo</th><th>Inscrito</th><th>Evento</th><th>Vagas</th><th>Status</th><th>Ações</th></tr></thead><tbody id="regBody"></tbody></table></div>`;
  const draw=()=>{const rows=read('inscricoes').filter(x=>!q||JSON.stringify(x).toLowerCase().includes(q.toLowerCase())).sort((a,b)=>String(b.createdAt||'').localeCompare(String(a.createdAt||'')));panel.querySelector('#regBody').innerHTML=rows.map(r=>{const ev=byId('eventos',r.idEvento)||{};return `<tr><td><strong>${esc(r.protocolo||'')}</strong><small>${esc(r.tipoInscricao||'')}</small></td><td><strong>${esc(r.nome||'')}</strong><small>${esc(r.responsavel||'')} • ${esc(r.telefone||r.email||'')}</small></td><td>${esc(ev.nome||'Evento não encontrado')}<small>${fmtDate(ev.dataInicio)} • ${esc(ev.horaInicio||'')}</small></td><td>${Number(r.quantidade)||1}</td><td><span class="status-chip">${esc(r.status||'Recebida')}</span></td><td class="table-actions">${['Recebida','Pré-inscrição','Em análise'].includes(r.status||'Recebida')?`<button class="btn primary small" data-reg-confirm="${r.id}">Confirmar</button><button class="btn ghost small" data-reg-wait="${r.id}">Espera</button><button class="btn danger small" data-reg-deny="${r.id}">Não confirmar</button>`:''}<button class="btn ghost small" data-reg-qr="${r.id}">QR</button><button class="btn ghost small" data-reg-print="${r.id}">Ficha</button><button class="btn ghost small" data-reg-edit="${r.id}">Editar</button></td></tr>`;}).join('')||'<tr><td colspan="6" class="empty-state">Nenhuma inscrição cadastrada.</td></tr>';panel.querySelector('#regCount').textContent=rows.length+' inscrição(ões)';};
  panel.querySelector('#regNew').onclick=()=>openReg();panel.querySelector('#regSearch').oninput=e=>{q=e.target.value;draw();};panel.querySelector('#regBody').onclick=e=>{const edit=e.target.closest('[data-reg-edit]'),pr=e.target.closest('[data-reg-print]'),cf=e.target.closest('[data-reg-confirm]'),wt=e.target.closest('[data-reg-wait]'),dn=e.target.closest('[data-reg-deny]'),qr=e.target.closest('[data-reg-qr]');if(qr)printRegistrationQr(byId('inscricoes',qr.dataset.regQr));const setReg=async(id,s)=>{const all=read('inscricoes'),r=all.find(x=>x.id===id);if(!r)return;const ev=byId('eventos',r.idEvento),cap=Number(ev?.vagas)||0,used=occupied(r.idEvento,r.id);if(s==='Confirmada'&&cap&&used+(Number(r.quantidade)||1)>cap){alert('Não há vagas suficientes para confirmar esta inscrição. Use Lista de espera.');return;}try{if(r._cloud)await updateCloudRegistrationStatus(id,s);r.status=s;r.updatedAt=new Date().toISOString();write('inscricoes',all);renderTab();}catch(x){alert(x.message);}};if(edit)openReg(byId('inscricoes',edit.dataset.regEdit));if(pr)printRegistration(byId('inscricoes',pr.dataset.regPrint));if(cf)setReg(cf.dataset.regConfirm,'Confirmada');if(wt)setReg(wt.dataset.regWait,'Lista de espera');if(dn&&confirm('Registrar esta inscrição como não confirmada?'))setReg(dn.dataset.regDeny,'Não confirmada');};draw();
 }
 function renderTab(){kpis();closeEditor();if(tab==='agenda')agenda();else if(tab==='calendario')calendario();else if(tab==='operacao')operacao();else if(tab==='solicitacoes')solicitacoes();else inscricoes();host.querySelectorAll('[data-central-tab]').forEach(b=>b.classList.toggle('active',b.dataset.centralTab===tab));}
 host.querySelectorAll('[data-central-tab]').forEach(b=>b.onclick=()=>{tab=b.dataset.centralTab;page=1;status='';query='';renderTab();});renderTab();
}

function reportData(from,to,status){
 return read('eventos').filter(e=>{const d=e.dataInicio||e.data||'';return (!from||d>=from)&&(!to||d<=to)&&(!status||e.status===status);}).sort((a,b)=>(a.dataInicio||a.data||'').localeCompare(b.dataInicio||b.data||''));
}
function reportHtml(rows){
 const totalPeople=rows.reduce((s,e)=>s+Object.values(e.presenca||{}).filter(Boolean).length+read('inscricoes').filter(r=>r.idEvento===e.id&&r.status==='Presente').reduce((q,r)=>q+(Number(r.quantidade)||1),0),0),materials=rows.reduce((s,e)=>s+(e.materiais||[]).reduce((q,m)=>q+(Number(m.quantidade)||0),0),0);
 return `<div class="report-sheet" id="reportSheet"><div class="report-brand"><img src="assets/brand-icon.webp"><div><h1>MOBILIZA EDUCA</h1><p>Relatório de atividades e ações educativas</p></div></div><div class="report-kpis"><div><strong>${rows.length}</strong><span>Eventos</span></div><div><strong>${totalPeople}</strong><span>Presenças</span></div><div><strong>${materials}</strong><span>Materiais</span></div></div><table><thead><tr><th>Data</th><th>Ação/Evento</th><th>Local</th><th>Status</th><th>Presença</th><th>Materiais</th></tr></thead><tbody>${rows.map(e=>`<tr><td>${fmtDate(e.dataInicio||e.data)}</td><td>${esc(e.nome)}</td><td>${esc(e.local||'—')}</td><td>${esc(e.status||'')}</td><td>${Object.values(e.presenca||{}).filter(Boolean).length}</td><td>${(e.materiais||[]).reduce((s,m)=>s+(Number(m.quantidade)||0),0)}</td></tr>`).join('')}</tbody></table><footer>Gerado em ${new Date().toLocaleString('pt-BR')}</footer></div>`;
}
function renderReports(host){
 host.innerHTML=shell(modules['admin-relatorios'],`<div class="report-filters card"><label>Data inicial<input id="reportFrom" type="date"></label><label>Data final<input id="reportTo" type="date"></label><label>Status<select id="reportStatus"><option value="">Todos</option>${['Planejado','Em andamento','Concluído','Cancelado'].map(x=>`<option>${x}</option>`).join('')}</select></label><button class="btn primary" id="runReport">Gerar relatório</button></div><div id="reportHost"></div>`);
 const run=()=>{const rows=reportData(host.querySelector('#reportFrom').value,host.querySelector('#reportTo').value,host.querySelector('#reportStatus').value);host.querySelector('#reportHost').innerHTML=`<div class="report-actions"><button class="btn ghost" id="printReport">🖨 Imprimir / Salvar PDF</button><button class="btn ghost" id="csvReport">⬇ Exportar CSV</button></div>${reportHtml(rows)}`;host.querySelector('#printReport').onclick=()=>{const w=window.open('','_blank');w.document.write(`<!doctype html><html><head><title>Relatório Mobiliza Educa</title><style>body{font-family:Arial;padding:28px;color:#14283b}.report-brand{display:flex;gap:14px;align-items:center}.report-brand img{width:60px;border-radius:12px}.report-kpis{display:flex;gap:24px;margin:20px 0}.report-kpis div{border:1px solid #ddd;padding:12px 18px;border-radius:10px}.report-kpis strong,.report-kpis span{display:block}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f3f6f8}footer{margin-top:20px;font-size:12px;color:#666}</style></head><body>${reportHtml(rows)}</body></html>`);w.document.close();setTimeout(()=>w.print(),250);};host.querySelector('#csvReport').onclick=()=>download('relatorio-mobiliza-educa.csv','Data;Evento;Local;Status;Presencas;Materiais\n'+rows.map(e=>[fmtDate(e.dataInicio||e.data),e.nome,e.local||'',e.status||'',Object.values(e.presenca||{}).filter(Boolean).length,(e.materiais||[]).reduce((s,m)=>s+(Number(m.quantidade)||0),0)].map(csvEscape).join(';')).join('\n'));};
 host.querySelector('#runReport').onclick=run;run();
}

function renderPlaceholder(id,host){
 const m=modules[id];host.innerHTML=shell(m,`<div class="admin-module-grid">${(m.sections||[]).map((s,i)=>`<article class="admin-feature"><span class="admin-feature-index">${String(i+1).padStart(2,'0')}</span><div><strong>${s}</strong><p>Fluxo preparado para implementação progressiva.</p></div><button class="btn ghost">Em breve</button></article>`).join('')}</div>`);
}

export function openAdminModule(id,dialog,host,authDialog){
 if(!modules[id])return;
 if(!canAccessModule(id)){recordAudit('ACESSO_NEGADO','modulo',id,'Usuário tentou abrir módulo sem permissão.','', 'warn');alert('Seu perfil não possui permissão para acessar este módulo.');return;}
 const entitlement=adminModuleEntitlement(id);if(!entitlement.allowed){recordAudit('PLANO_NEGOU_RECURSO','modulo',id,entitlement.reason,'','warn');alert(entitlement.reason+'\n\nAltere o plano em Produto e assinatura. Este bloqueio é apenas uma prévia local até a ativação do backend.');return;}
 recordAudit('MODULO_ABERTO','modulo',id,modules[id].title);
 if(id==='admin-dashboard')renderDashboard(host,authDialog);
 else if(id==='admin-cadastros')renderCadastros(host);
 else if(id==='admin-eventos')renderEventos(host);
 else if(id==='admin-relatorios')renderRelatorios360(host);
 else if(id==='admin-passaporte')renderPassaporteCertificados(host);
 else if(id==='admin-avaliacao')renderAvaliacaoPedagogica(host);
 else if(id==='admin-evidencias')renderEvidenciasImpacto(host);
 else if(id==='admin-conteudo')renderCentroEditorial(host);
 else if(id==='admin-acessos')renderUsuariosAuditoria(host,authDialog);
 else if(id==='admin-sistema')renderSistemaContinuity(host);
 else if(id==='admin-assinatura')renderAssinaturaSaas(host);
 else if(id==='admin-plataforma')renderPlataformaComercial(host);
 else renderPlaceholder(id,host);
 dialog.showModal();
}