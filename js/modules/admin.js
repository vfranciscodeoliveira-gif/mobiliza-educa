const modules={
'admin-dashboard':{title:'Dashboard administrativo',intro:'Painel único para acompanhar operação, alcance e qualidade pedagógica.',sections:['Atividade recente','Pendências da operação','Indicadores pedagógicos','Próximos eventos']},
'admin-cadastros':{title:'Cadastros educacionais',intro:'Escolas, turmas, professores e alunos com inclusão, edição, exclusão, pesquisa e armazenamento local.'},
'admin-eventos':{title:'Eventos e agenda',intro:'Planejamento das ações educativas com agenda, status, prioridade, responsáveis e vínculo com escolas.'},
'admin-conteudo':{title:'Conteúdo pedagógico',intro:'Governança do conteúdo usado em jogos, avaliações e atividades.',sections:['Banco de perguntas','Categorias','Dificuldade','Centro Editorial','Revisão e homologação','Histórico de alterações']},
'admin-avaliacao':{title:'Presença e avaliações',intro:'Registro de participação e medição de aprendizagem.',sections:['Presença','Pré-teste','Pós-teste','Evolução por turma','Indicadores','Comparativos']},
'admin-passaporte':{title:'Passaporte e certificados',intro:'Reconhecimento da participação e progressão educativa.',sections:['Passaporte digital','Medalhas','Certificados','Validação por QR Code','Histórico']},
'admin-relatorios':{title:'Relatórios e indicadores',intro:'Transformar dados da operação em gestão e comprovação de impacto.',sections:['Relatório de atividades','Relatório por evento','Relatório por escola','Ranking','Estatísticas','Exportação PDF/CSV']},
'admin-acessos':{title:'Usuários, perfis e auditoria',intro:'Controle de acesso e rastreabilidade administrativa.',sections:['Usuários','Perfis','Permissões','Auditoria','Acessibilidade','Segurança']},
'admin-sistema':{title:'Configurações, backup e sincronização',intro:'Configurações gerais e continuidade operacional.',sections:['Identidade institucional','Preferências','Telão e projeção','Backup local','Importação/exportação','Sincronização futura']}
};

const KEYS={
 escolas:'mobiliza.admin.escolas',
 turmas:'mobiliza.admin.turmas',
 professores:'mobiliza.admin.professores',
 alunos:'mobiliza.admin.alunos',
 eventos:'mobiliza.admin.eventos'
};
const read=k=>JSON.parse(localStorage.getItem(KEYS[k])||'[]');
const write=(k,v)=>localStorage.setItem(KEYS[k],JSON.stringify(v));
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const fmtDate=v=>v?new Date(v+'T00:00:00').toLocaleDateString('pt-BR'):'—';

function genericShell(m,inner){
 return `<section class="admin-module"><p class="eyebrow">CENTRO DE GESTÃO WEB • LOCAL</p><h2>${m.title}</h2><p class="admin-intro">${m.intro}</p>${inner}</section>`;
}

function renderDashboard(host){
 const e=read('escolas').length,a=read('alunos').length,ev=read('eventos').length;
 const games=JSON.parse(localStorage.getItem('mobiliza.results')||'{"games":0}').games||0;
 const upcoming=read('eventos').filter(x=>x.data&&x.data>=new Date().toISOString().slice(0,10)).sort((a,b)=>a.data.localeCompare(b.data)).slice(0,5);
 host.innerHTML=genericShell(modules['admin-dashboard'],`
 <div class="admin-kpis">
  <article class="admin-kpi"><span>Escolas</span><strong>${e}</strong></article>
  <article class="admin-kpi"><span>Participantes</span><strong>${a}</strong></article>
  <article class="admin-kpi"><span>Eventos</span><strong>${ev}</strong></article>
  <article class="admin-kpi"><span>Partidas</span><strong>${games}</strong></article>
 </div>
 <div class="admin-panel card"><h3>Próximos eventos</h3>${upcoming.length?upcoming.map(x=>`<div class="admin-list-row"><div><strong>${esc(x.nome)}</strong><small>${fmtDate(x.data)} • ${esc(x.local||'Local não informado')}</small></div><span class="status-chip">${esc(x.status||'Planejado')}</span></div>`).join(''):'<p class="empty-state">Nenhum evento futuro cadastrado.</p>'}</div>`);
}

const defs={
 escolas:{label:'Escolas',fields:[['nome','Nome da escola','text'],['municipio','Município','text'],['contato','Contato','text'],['telefone','Telefone','text'],['observacao','Observações','text']]},
 turmas:{label:'Turmas',fields:[['nome','Turma','text'],['turno','Turno','select',['Manhã','Tarde','Noite','Integral']],['ano','Ano/Série','text'],['idEscola','Escola','school']]},
 professores:{label:'Professores',fields:[['nome','Nome','text'],['email','E-mail','email'],['telefone','Telefone','text'],['idEscola','Escola','school']]},
 alunos:{label:'Alunos',fields:[['nome','Nome','text'],['dataNascimento','Nascimento','date'],['idTurma','Turma','class'],['responsavel','Responsável','text']]}
};

function fieldHtml(k,f,val=''){
 const [name,label,type,opts]=f;
 if(type==='select')return `<label>${label}<select name="${name}" required><option value="">Selecione</option>${opts.map(o=>`<option ${val===o?'selected':''}>${o}</option>`).join('')}</select></label>`;
 if(type==='school'){const rows=read('escolas');return `<label>${label}<select name="${name}"><option value="">Sem vínculo</option>${rows.map(r=>`<option value="${r.id}" ${val===r.id?'selected':''}>${esc(r.nome)}</option>`).join('')}</select></label>`;}
 if(type==='class'){const rows=read('turmas');return `<label>${label}<select name="${name}"><option value="">Sem vínculo</option>${rows.map(r=>`<option value="${r.id}" ${val===r.id?'selected':''}>${esc(r.nome)} • ${esc(r.turno||'')}</option>`).join('')}</select></label>`;}
 return `<label>${label}<input name="${name}" type="${type}" value="${esc(val)}" ${name==='nome'?'required':''}></label>`;
}

function labelFor(type,id){
 if(!id)return '—';
 const src=type==='turmas'?read('escolas'):type==='alunos'?read('turmas'):type==='professores'?read('escolas'):[];
 const r=src.find(x=>x.id===id);return r?r.nome:'—';
}

function renderCrudTable(entity,host,query=''){
 const rows=read(entity),d=defs[entity],q=query.trim().toLowerCase();
 const filtered=!q?rows:rows.filter(r=>Object.values(r).some(v=>String(v??'').toLowerCase().includes(q)));
 const extra=entity==='turmas'?'Escola':entity==='professores'?'Escola':entity==='alunos'?'Turma':'Detalhes';
 const body=filtered.map(r=>`<tr><td><strong>${esc(r.nome)}</strong></td><td>${entity==='escolas'?esc(r.municipio||'—'):esc(labelFor(entity,entity==='alunos'?r.idTurma:r.idEscola))}</td><td>${entity==='turmas'?esc(r.turno||'—'):entity==='professores'?esc(r.email||'—'):entity==='alunos'?fmtDate(r.dataNascimento):esc(r.contato||r.telefone||'—')}</td><td class="table-actions"><button class="btn ghost small" data-edit="${r.id}">Editar</button><button class="btn danger small" data-delete="${r.id}">Excluir</button></td></tr>`).join('');
 host.querySelector('#crudBody').innerHTML=body||`<tr><td colspan="4" class="empty-state">Nenhum registro encontrado.</td></tr>`;
 host.querySelector('#crudCount').textContent=`${filtered.length} registro(s)`;
}

function renderCadastros(host){
 let current='escolas';
 host.innerHTML=genericShell(modules['admin-cadastros'],`
 <div class="admin-tabs">${Object.keys(defs).map((k,i)=>`<button class="admin-tab ${i===0?'active':''}" data-entity="${k}">${defs[k].label}</button>`).join('')}</div>
 <div class="crud-toolbar"><div><h3 id="crudTitle">Escolas</h3><span id="crudCount"></span></div><div class="crud-toolbar-actions"><input id="crudSearch" type="search" placeholder="Pesquisar..."><button class="btn primary" id="crudNew">+ Novo</button></div></div>
 <div class="table-wrap"><table class="admin-table"><thead><tr><th>Nome</th><th>Vínculo/Local</th><th>Detalhes</th><th>Ações</th></tr></thead><tbody id="crudBody"></tbody></table></div>
 <div id="crudEditor" class="crud-editor" hidden></div>`);

 const refresh=()=>renderCrudTable(current,host,host.querySelector('#crudSearch').value);
 const openEditor=(id=null)=>{
  const row=id?read(current).find(x=>x.id===id):null,d=defs[current],box=host.querySelector('#crudEditor');
  box.hidden=false;box.innerHTML=`<form id="crudForm"><div class="crud-editor-head"><div><span class="eyebrow">${row?'EDITAR':'NOVO REGISTRO'}</span><h3>${d.label}</h3></div><button type="button" class="icon-btn" id="crudCancel">×</button></div><div class="form-grid">${d.fields.map(f=>fieldHtml(current,f,row?.[f[0]]||'')).join('')}</div><div class="form-actions"><button type="button" class="btn ghost" id="crudCancel2">Cancelar</button><button class="btn primary">Salvar</button></div></form>`;
  const close=()=>box.hidden=true;box.querySelector('#crudCancel').onclick=close;box.querySelector('#crudCancel2').onclick=close;
  box.querySelector('#crudForm').onsubmit=e=>{e.preventDefault();const data=Object.fromEntries(new FormData(e.target).entries());const all=read(current);if(row)Object.assign(row,data,{updatedAt:new Date().toISOString()});else all.unshift({id:uid(),...data,createdAt:new Date().toISOString()});write(current,all);close();refresh();};
 };
 host.querySelectorAll('[data-entity]').forEach(b=>b.onclick=()=>{current=b.dataset.entity;host.querySelectorAll('.admin-tab').forEach(x=>x.classList.toggle('active',x===b));host.querySelector('#crudTitle').textContent=defs[current].label;host.querySelector('#crudSearch').value='';host.querySelector('#crudEditor').hidden=true;refresh();});
 host.querySelector('#crudSearch').oninput=refresh;host.querySelector('#crudNew').onclick=()=>openEditor();
 host.querySelector('#crudBody').onclick=e=>{const edit=e.target.closest('[data-edit]'),del=e.target.closest('[data-delete]');if(edit)openEditor(edit.dataset.edit);if(del&&confirm('Excluir este registro?')){write(current,read(current).filter(x=>x.id!==del.dataset.delete));refresh();}};
 refresh();
}

function eventForm(row,host,onDone){
 const schools=read('escolas');
 host.innerHTML=`<form id="eventForm"><div class="crud-editor-head"><div><span class="eyebrow">${row?'EDITAR':'NOVO EVENTO'}</span><h3>Evento / compromisso</h3></div><button type="button" class="icon-btn" id="eventCancel">×</button></div><div class="form-grid">
 <label>Nome<input name="nome" required value="${esc(row?.nome||'')}"></label>
 <label>Tipo<select name="tipo"><option>Escolar</option><option>Palestra</option><option>SIPAT</option><option>Campanha</option><option>Outro</option></select></label>
 <label>Data<input name="data" type="date" value="${esc(row?.data||'')}"></label>
 <label>Hora inicial<input name="horaInicio" type="time" value="${esc(row?.horaInicio||'')}"></label>
 <label>Hora final<input name="horaFim" type="time" value="${esc(row?.horaFim||'')}"></label>
 <label>Status<select name="status">${['Planejado','Em andamento','Concluído','Cancelado'].map(x=>`<option ${row?.status===x?'selected':''}>${x}</option>`).join('')}</select></label>
 <label>Prioridade<select name="prioridade">${['Baixa','Normal','Alta','Urgente'].map(x=>`<option ${row?.prioridade===x?'selected':''}>${x}</option>`).join('')}</select></label>
 <label>Escola<select name="idEscola"><option value="">Sem vínculo</option>${schools.map(s=>`<option value="${s.id}" ${row?.idEscola===s.id?'selected':''}>${esc(s.nome)}</option>`).join('')}</select></label>
 <label>Local<input name="local" value="${esc(row?.local||'')}"></label>
 <label>Responsável<input name="responsavel" value="${esc(row?.responsavel||'')}"></label>
 <label>Público-alvo<input name="publico" value="${esc(row?.publico||'')}"></label>
 <label class="span-2">Observações<textarea name="observacao" rows="3">${esc(row?.observacao||'')}</textarea></label>
 </div><div class="form-actions"><button type="button" class="btn ghost" id="eventCancel2">Cancelar</button><button class="btn primary">Salvar evento</button></div></form>`;
 const close=()=>onDone(null);host.querySelector('#eventCancel').onclick=close;host.querySelector('#eventCancel2').onclick=close;
 host.querySelector('#eventForm').onsubmit=e=>{e.preventDefault();const data=Object.fromEntries(new FormData(e.target).entries());const all=read('eventos');if(row)Object.assign(row,data,{updatedAt:new Date().toISOString()});else all.unshift({id:uid(),...data,createdAt:new Date().toISOString()});write('eventos',all);onDone(true);};
}

function renderEventos(host){
 let status='';
 const draw=()=>{
  const q=host.querySelector('#eventSearch')?.value?.toLowerCase()||'',rows=read('eventos').filter(x=>(!status||x.status===status)&&(!q||Object.values(x).some(v=>String(v??'').toLowerCase().includes(q)))).sort((a,b)=>(a.data||'9999').localeCompare(b.data||'9999'));
  host.querySelector('#eventBody').innerHTML=rows.map(r=>`<tr><td><strong>${esc(r.nome)}</strong><small>${esc(r.tipo||'')}</small></td><td>${fmtDate(r.data)}<small>${esc(r.horaInicio||'')} ${r.horaFim?'– '+esc(r.horaFim):''}</small></td><td>${esc(r.local||'—')}</td><td><span class="status-chip status-${esc((r.status||'').toLowerCase().replace(/\s/g,'-'))}">${esc(r.status||'Planejado')}</span></td><td class="table-actions"><button class="btn ghost small" data-event-edit="${r.id}">Editar</button><button class="btn danger small" data-event-delete="${r.id}">Excluir</button></td></tr>`).join('')||`<tr><td colspan="5" class="empty-state">Nenhum evento encontrado.</td></tr>`;
  host.querySelector('#eventCount').textContent=`${rows.length} evento(s)`;
 };
 host.innerHTML=genericShell(modules['admin-eventos'],`
 <div class="crud-toolbar"><div><h3>Agenda e eventos</h3><span id="eventCount"></span></div><div class="crud-toolbar-actions"><input id="eventSearch" type="search" placeholder="Pesquisar evento..."><button class="btn primary" id="eventNew">+ Novo evento</button></div></div>
 <div class="filter-row"><button class="chip-filter active" data-status="">Todos</button>${['Planejado','Em andamento','Concluído','Cancelado'].map(s=>`<button class="chip-filter" data-status="${s}">${s}</button>`).join('')}</div>
 <div class="table-wrap"><table class="admin-table"><thead><tr><th>Evento</th><th>Data/Hora</th><th>Local</th><th>Status</th><th>Ações</th></tr></thead><tbody id="eventBody"></tbody></table></div>
 <div id="eventEditor" class="crud-editor" hidden></div>`);
 const editor=host.querySelector('#eventEditor');
 const open=(id=null)=>{const row=id?read('eventos').find(x=>x.id===id):null;editor.hidden=false;eventForm(row,editor,saved=>{editor.hidden=true;if(saved)draw();});};
 host.querySelector('#eventNew').onclick=()=>open();host.querySelector('#eventSearch').oninput=draw;
 host.querySelectorAll('[data-status]').forEach(b=>b.onclick=()=>{status=b.dataset.status;host.querySelectorAll('[data-status]').forEach(x=>x.classList.toggle('active',x===b));draw();});
 host.querySelector('#eventBody').onclick=e=>{const edit=e.target.closest('[data-event-edit]'),del=e.target.closest('[data-event-delete]');if(edit)open(edit.dataset.eventEdit);if(del&&confirm('Excluir este evento?')){write('eventos',read('eventos').filter(x=>x.id!==del.dataset.eventDelete));draw();}};
 draw();
}

function renderPlaceholder(id,host){
 const m=modules[id];host.innerHTML=genericShell(m,`<div class="admin-module-grid">${m.sections.map((s,i)=>`<article class="admin-feature"><span class="admin-feature-index">${String(i+1).padStart(2,'0')}</span><div><strong>${s}</strong><p>Fluxo previsto e pronto para ativação progressiva na versão web.</p></div><button type="button" class="btn ghost">Em breve</button></article>`).join('')}</div><div class="admin-note"><strong>Fase atual:</strong> estrutura pronta para a próxima implementação funcional.</div>`);
}

export function openAdminModule(id,dialog,host){
 if(!modules[id])return;
 if(id==='admin-dashboard')renderDashboard(host);
 else if(id==='admin-cadastros')renderCadastros(host);
 else if(id==='admin-eventos')renderEventos(host);
 else renderPlaceholder(id,host);
 dialog.showModal();
}