import { SoundManager } from '../core/soundManager.js?v=1';

const K='mobiliza.educador.';
const nowIso=()=>new Date().toISOString();
const today=()=>new Date().toISOString().slice(0,10);
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,8);
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const read=k=>{try{return JSON.parse(localStorage.getItem(K+k)||'[]')}catch{return []}};
const write=(k,v)=>{localStorage.setItem(K+k,JSON.stringify(v));window.dispatchEvent(new CustomEvent('mobiliza-educador-change',{detail:{entity:k}}));};
const fmtDate=v=>v?new Date(v+'T12:00:00').toLocaleDateString('pt-BR'):'—';
const download=(name,text,type='text/plain;charset=utf-8')=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['\ufeff'+text],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);};

const MODULES={
 agenda:{icon:'📅',title:'Agenda e eventos',sub:'Planeje ações, aulas, palestras e campanhas com objetivo, público, materiais e checklist.'},
 conteudo:{icon:'✍️',title:'Centro editorial',sub:'Crie rascunhos de perguntas e conteúdos para revisão pedagógica antes da publicação.'},
 avaliacao:{icon:'📈',title:'Avaliação pedagógica',sub:'Registre pré e pós-avaliação e acompanhe a evolução do público atendido.'},
 evidencias:{icon:'📷',title:'Evidências e impacto',sub:'Registre público alcançado, materiais, parceiros, observações e evidências da ação.'},
 certificados:{icon:'🎓',title:'Certificados e passaporte',sub:'Cadastre participantes e gere certificados simples para impressão ou PDF.'},
 acessibilidade:{icon:'♿',title:'Acessibilidade',sub:'Ajuste contraste, tamanho do texto, som e preferências de apresentação.'}
};

function css(){
 if(document.getElementById('educator-v2-css'))return;
 const s=document.createElement('style');s.id='educator-v2-css';
 s.textContent=[
  '#gameDialog.educator-v2-dialog{width:min(1180px,96vw)!important;max-width:96vw!important;max-height:95vh!important}',
  '#gameDialog.educator-v2-dialog>.dialog-shell{max-height:95vh!important;overflow:auto!important;background:#eef7fb!important}',
  '.edux{padding:24px;color:#173f60;min-height:600px}.edux *{box-sizing:border-box}',
  '.edux-head{display:grid;grid-template-columns:92px minmax(0,1fr) auto;gap:16px;align-items:center;padding:20px;border-radius:22px;background:linear-gradient(135deg,#0b426c,#0b89ad);color:#fff;box-shadow:0 14px 34px rgba(10,55,84,.18)}',
  '.edux-head-icon{width:84px;height:84px;border-radius:22px;background:rgba(255,255,255,.95);display:grid;place-items:center;font-size:2.7rem;box-shadow:0 8px 22px rgba(0,0,0,.18)}',
  '.edux-head .eyebrow{margin:0 0 4px;color:#a9ecff;font-size:.68rem;font-weight:1000;letter-spacing:.1em}.edux-head h2{margin:0 0 5px;color:#fff}.edux-head p{margin:0;color:#def5fb;line-height:1.45}.edux-version{padding:8px 10px;border-radius:12px;background:rgba(255,255,255,.13);border:1px solid rgba(255,255,255,.2);font-size:.72rem;font-weight:900}',
  '.edux-kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:14px 0}.edux-kpi{padding:13px 14px;border:1px solid #d8e7ee;border-radius:16px;background:#fff}.edux-kpi span{display:block;font-size:.7rem;color:#718696}.edux-kpi strong{display:block;font-size:1.35rem;color:#0d6f9c;margin-top:2px}',
  '.edux-toolbar{display:flex;gap:9px;justify-content:space-between;align-items:center;margin:14px 0}.edux-toolbar .left,.edux-toolbar .right{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.edux-toolbar input,.edux-toolbar select{min-height:42px;border:1px solid #cbdde7;border-radius:12px;padding:8px 11px;background:#fff;color:#183f5d}',
  '.edux-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}.edux-card{padding:16px;border:1px solid #d7e5ed;border-radius:18px;background:#fff;box-shadow:0 8px 22px rgba(15,60,102,.06)}.edux-card h3{margin:0 0 6px;color:#103f61}.edux-card p{margin:0;color:#668092;line-height:1.45}',
  '.edux-list{display:grid;gap:9px}.edux-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;align-items:center;padding:12px 13px;border:1px solid #dbe8ef;border-radius:14px;background:#fff}.edux-row strong{display:block;color:#173f60}.edux-row small{display:block;color:#708897;margin-top:3px;line-height:1.35}.edux-row-actions{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}',
  '.edux-empty{padding:28px;text-align:center;border:1px dashed #bfd5df;border-radius:16px;background:#f8fcfe;color:#6b8291}',
  '.edux-form{margin-top:14px;padding:18px;border:1px solid #cfe0e9;border-radius:18px;background:#fff;box-shadow:0 12px 28px rgba(15,60,102,.08)}.edux-form-head{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:12px}.edux-form-head h3{margin:0}.edux-form-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:11px}.edux-form label{display:grid;gap:5px;font-size:.75rem;font-weight:900;color:#365b73}.edux-form input,.edux-form select,.edux-form textarea{width:100%;min-height:42px;border:1px solid #cbdde7;border-radius:11px;padding:9px 10px;background:#fbfdfe;color:#173f60;font:inherit}.edux-form textarea{resize:vertical;min-height:92px}.edux-span2{grid-column:1/-1}.edux-form-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:13px}',
  '.edux-status{display:inline-flex;padding:5px 8px;border-radius:999px;background:#e9f5fa;color:#0b6f9a;font-size:.68rem;font-weight:1000}.edux-status.ok{background:#e9f8ef;color:#197247}.edux-status.warn{background:#fff4d9;color:#8a6412}',
  '.edux-metric{display:grid;grid-template-columns:1fr 1fr;gap:10px}.edux-metric-box{padding:16px;border:1px solid #d9e6ed;border-radius:16px;background:linear-gradient(145deg,#fff,#f4fafc)}.edux-metric-box strong{font-size:1.8rem;color:#0e7aa7}.edux-metric-box span{display:block;color:#6e8492;font-size:.75rem}',
  '.edux-evolution{height:14px;border-radius:999px;background:#dce9ef;overflow:hidden;margin-top:8px}.edux-evolution i{display:block;height:100%;background:linear-gradient(90deg,#efb43a,#2dbd72);border-radius:inherit}',
  '.edux-cert-preview{padding:28px;border:8px double #0c5f8a;border-radius:6px;background:#fff;text-align:center;color:#123b59}.edux-cert-preview h2{font-size:2rem;margin:10px 0}.edux-cert-preview .name{font-size:1.8rem;font-weight:1000;color:#0b719c;margin:15px 0}.edux-cert-preview small{color:#6e8290}',
  '.edux-access-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}.edux-access-card{padding:18px;border:1px solid #d8e6ed;border-radius:17px;background:#fff}.edux-access-card h3{margin:0 0 6px}.edux-access-card p{margin:0 0 12px;color:#687f90}.edux-switch{display:flex;justify-content:space-between;gap:12px;align-items:center}.edux-switch button{min-width:120px}',
  '.edux-help{margin-top:14px;padding:13px 14px;border-left:4px solid #19a5c7;background:#eaf8fc;border-radius:10px;color:#3f6479;line-height:1.45}',
  '@media(max-width:760px){#gameDialog.educator-v2-dialog{width:100vw!important;max-width:100vw!important;height:100dvh!important;max-height:100dvh!important;margin:0!important;border-radius:0!important}.edux{padding:12px;min-height:100dvh}.edux-head{grid-template-columns:64px 1fr;padding:15px}.edux-head-icon{width:60px;height:60px;font-size:2rem;border-radius:16px}.edux-version{grid-column:1/-1;text-align:center}.edux-kpis{grid-template-columns:1fr 1fr}.edux-grid,.edux-form-grid,.edux-metric,.edux-access-grid{grid-template-columns:1fr}.edux-span2{grid-column:auto}.edux-row{grid-template-columns:1fr}.edux-row-actions{justify-content:flex-start}.edux-toolbar{align-items:stretch;flex-direction:column}.edux-toolbar .left,.edux-toolbar .right{display:grid;grid-template-columns:1fr}.edux-form-actions{display:grid;grid-template-columns:1fr}.edux-form-actions .btn{width:100%}}'
 ].join('');
 document.head.appendChild(s);
}

function head(id,extra=''){
 const m=MODULES[id];
 return '<div class="edux-head"><div class="edux-head-icon">'+m.icon+'</div><div><p class="eyebrow">MOBILIZA EDUCA • CENTRAL DO EDUCADOR</p><h2>'+esc(m.title)+'</h2><p>'+esc(m.sub)+'</p></div><div class="edux-version">EDUCADOR 2.0</div></div>'+extra;
}
function btn(label,id,kind='ghost'){return '<button type="button" class="btn '+kind+'" id="'+id+'">'+label+'</button>'}
function closeForm(host){const x=host.querySelector('#eduxEditor');if(x)x.remove()}

function agenda(host){
 const data=()=>read('agenda').sort((a,b)=>(a.data||'9999').localeCompare(b.data||'9999'));
 function draw(){
  const rows=data(),next=rows.filter(x=>x.data>=today()&&x.status!=='Concluído').slice(0,6);
  host.innerHTML='<section class="edux">'+head('agenda')+
   '<div class="edux-kpis"><div class="edux-kpi"><span>Planejadas</span><strong>'+rows.filter(x=>x.status==='Planejado').length+'</strong></div><div class="edux-kpi"><span>Concluídas</span><strong>'+rows.filter(x=>x.status==='Concluído').length+'</strong></div><div class="edux-kpi"><span>Próximas</span><strong>'+next.length+'</strong></div><div class="edux-kpi"><span>Total</span><strong>'+rows.length+'</strong></div></div>'+
   '<div class="edux-toolbar"><div class="left"><strong>Plano de ações</strong></div><div class="right">'+btn('+ Nova ação','eduxNewAgenda','primary')+'</div></div>'+
   '<div class="edux-list">'+(rows.length?rows.map(r=>'<div class="edux-row"><div><strong>'+esc(r.titulo)+'</strong><small>'+fmtDate(r.data)+' • '+esc(r.hora||'horário não informado')+' • '+esc(r.local||'local não informado')+'</small><small>'+esc(r.publico||'Público não informado')+' • '+esc(r.objetivo||'Sem objetivo descrito')+'</small></div><div class="edux-row-actions"><span class="edux-status '+(r.status==='Concluído'?'ok':'')+'">'+esc(r.status)+'</span><button class="btn ghost small" data-agenda-edit="'+r.id+'">Editar</button><button class="btn danger small" data-agenda-del="'+r.id+'">Excluir</button></div></div>').join(''):'<div class="edux-empty">Nenhuma ação planejada. Crie a primeira atividade educativa.</div>')+'</div></section>';
  host.querySelector('#eduxNewAgenda').onclick=()=>edit();
  host.querySelectorAll('[data-agenda-edit]').forEach(b=>b.onclick=()=>edit(b.dataset.agendaEdit));
  host.querySelectorAll('[data-agenda-del]').forEach(b=>b.onclick=()=>{if(confirm('Excluir esta ação?')){write('agenda',read('agenda').filter(x=>x.id!==b.dataset.agendaDel));SoundManager.play('click');draw()}});
 }
 function edit(id){
  closeForm(host);const row=read('agenda').find(x=>x.id===id);
  host.querySelector('.edux').insertAdjacentHTML('beforeend','<form class="edux-form" id="eduxEditor"><div class="edux-form-head"><h3>'+(row?'Editar ação':'Nova ação educativa')+'</h3><button type="button" class="icon-btn" id="eduxCancel">×</button></div><div class="edux-form-grid">'+
   '<label>Título<input name="titulo" required value="'+esc(row?.titulo||'')+'"></label><label>Data<input name="data" type="date" required value="'+esc(row?.data||today())+'"></label>'+
   '<label>Hora<input name="hora" type="time" value="'+esc(row?.hora||'')+'"></label><label>Status<select name="status">'+['Planejado','Em andamento','Concluído'].map(x=>'<option '+(row?.status===x?'selected':'')+'>'+x+'</option>').join('')+'</select></label>'+
   '<label>Local<input name="local" value="'+esc(row?.local||'')+'"></label><label>Público-alvo<input name="publico" value="'+esc(row?.publico||'')+'"></label>'+
   '<label class="edux-span2">Objetivo<textarea name="objetivo" required>'+esc(row?.objetivo||'')+'</textarea></label><label>Materiais<textarea name="materiais" placeholder="Cartilhas, cones, projetor...">'+esc(row?.materiais||'')+'</textarea></label><label>Equipe / parceiros<textarea name="equipe">'+esc(row?.equipe||'')+'</textarea></label>'+
   '</div><div class="edux-form-actions">'+btn('Cancelar','eduxCancel2')+'<button class="btn primary">Salvar planejamento</button></div></form>');
  const form=host.querySelector('#eduxEditor');const cancel=()=>form.remove();host.querySelector('#eduxCancel').onclick=cancel;host.querySelector('#eduxCancel2').onclick=cancel;
  form.onsubmit=e=>{e.preventDefault();const o=Object.fromEntries(new FormData(form).entries()),all=read('agenda');if(row)Object.assign(row,o,{updatedAt:nowIso()});else all.push({id:uid(),...o,createdAt:nowIso()});write('agenda',all);SoundManager.play('correct');draw()};
 }
 draw();
}

function conteudo(host){
 function draw(){
  const rows=read('conteudos').sort((a,b)=>String(b.updatedAt||b.createdAt||'').localeCompare(String(a.updatedAt||a.createdAt||'')));
  host.innerHTML='<section class="edux">'+head('conteudo')+
   '<div class="edux-toolbar"><div class="left"><strong>Rascunhos pedagógicos</strong><span class="edux-status">'+rows.length+' item(ns)</span></div><div class="right">'+btn('+ Novo conteúdo','eduxNewContent','primary')+'</div></div>'+
   '<div class="edux-list">'+(rows.length?rows.map(r=>'<div class="edux-row"><div><strong>'+esc(r.titulo)+'</strong><small>'+esc(r.tipo)+' • '+esc(r.publico)+' • '+esc(r.dificuldade)+'</small><small>'+esc(r.enunciado).slice(0,180)+'</small></div><div class="edux-row-actions"><span class="edux-status '+(r.status==='Homologado'?'ok':r.status==='Em revisão'?'warn':'')+'">'+esc(r.status)+'</span><button class="btn ghost small" data-content-edit="'+r.id+'">Editar</button><button class="btn danger small" data-content-del="'+r.id+'">Excluir</button></div></div>').join(''):'<div class="edux-empty">Nenhum rascunho. Use o Centro Editorial para preparar conteúdo antes da publicação.</div>')+'</div>'+
   '<div class="edux-help">✍️ Este espaço funciona como <strong>pré-publicação</strong>. O conteúdo criado aqui não altera automaticamente as perguntas dos jogos; ele fica salvo para revisão e homologação.</div></section>';
  host.querySelector('#eduxNewContent').onclick=()=>edit();
  host.querySelectorAll('[data-content-edit]').forEach(b=>b.onclick=()=>edit(b.dataset.contentEdit));
  host.querySelectorAll('[data-content-del]').forEach(b=>b.onclick=()=>{if(confirm('Excluir este conteúdo?')){write('conteudos',read('conteudos').filter(x=>x.id!==b.dataset.contentDel));draw()}});
 }
 function edit(id){
  const row=read('conteudos').find(x=>x.id===id);closeForm(host);
  host.querySelector('.edux').insertAdjacentHTML('beforeend','<form class="edux-form" id="eduxEditor"><div class="edux-form-head"><h3>'+(row?'Editar conteúdo':'Novo conteúdo')+'</h3><button type="button" class="icon-btn" id="eduxCancel">×</button></div><div class="edux-form-grid">'+
   '<label>Título<input name="titulo" required value="'+esc(row?.titulo||'')+'"></label><label>Tipo<select name="tipo">'+['Pergunta','Texto curto','Dica','Situação-problema'].map(x=>'<option '+(row?.tipo===x?'selected':'')+'>'+x+'</option>').join('')+'</select></label>'+
   '<label>Público<select name="publico">'+['Crianças','Adolescentes','Adultos','Misto'].map(x=>'<option '+(row?.publico===x?'selected':'')+'>'+x+'</option>').join('')+'</select></label><label>Dificuldade<select name="dificuldade">'+['Fácil','Médio','Difícil'].map(x=>'<option '+(row?.dificuldade===x?'selected':'')+'>'+x+'</option>').join('')+'</select></label>'+
   '<label class="edux-span2">Enunciado / conteúdo<textarea name="enunciado" required>'+esc(row?.enunciado||'')+'</textarea></label><label class="edux-span2">Resposta esperada / orientação<textarea name="resposta">'+esc(row?.resposta||'')+'</textarea></label>'+
   '<label>Status<select name="status">'+['Rascunho','Em revisão','Homologado'].map(x=>'<option '+(row?.status===x?'selected':'')+'>'+x+'</option>').join('')+'</select></label><label>Categoria<input name="categoria" value="'+esc(row?.categoria||'')+'" placeholder="pedestre, velocidade, cinto..."></label>'+
   '</div><div class="edux-form-actions">'+btn('Cancelar','eduxCancel2')+'<button class="btn primary">Salvar</button></div></form>');
  const form=host.querySelector('#eduxEditor');const cancel=()=>form.remove();host.querySelector('#eduxCancel').onclick=cancel;host.querySelector('#eduxCancel2').onclick=cancel;
  form.onsubmit=e=>{e.preventDefault();const o=Object.fromEntries(new FormData(form).entries()),all=read('conteudos');if(row)Object.assign(row,o,{updatedAt:nowIso()});else all.unshift({id:uid(),...o,createdAt:nowIso()});write('conteudos',all);SoundManager.play('correct');draw()};
 }
 draw();
}

function avaliacao(host){
 function draw(){
  const rows=read('avaliacoes').sort((a,b)=>(b.data||'').localeCompare(a.data||''));
  const valid=rows.filter(x=>Number.isFinite(Number(x.pre))&&Number.isFinite(Number(x.pos)));
  const avg=arr=>arr.length?arr.reduce((s,x)=>s+Number(x),0)/arr.length:0;
  const pre=avg(valid.map(x=>x.pre)),pos=avg(valid.map(x=>x.pos)),evo=pos-pre;
  host.innerHTML='<section class="edux">'+head('avaliacao')+
   '<div class="edux-kpis"><div class="edux-kpi"><span>Avaliações</span><strong>'+rows.length+'</strong></div><div class="edux-kpi"><span>Média pré</span><strong>'+pre.toFixed(1)+'</strong></div><div class="edux-kpi"><span>Média pós</span><strong>'+pos.toFixed(1)+'</strong></div><div class="edux-kpi"><span>Evolução média</span><strong>'+(evo>=0?'+':'')+evo.toFixed(1)+'</strong></div></div>'+
   '<div class="edux-toolbar"><div class="left"><strong>Registros de aprendizagem</strong></div><div class="right">'+btn('+ Registrar avaliação','eduxNewEval','primary')+'</div></div>'+
   '<div class="edux-list">'+(rows.length?rows.map(r=>{const d=Number(r.pos)-Number(r.pre),pct=Math.max(0,Math.min(100,(Number(r.pos)||0)*10));return '<div class="edux-row"><div><strong>'+esc(r.atividade)+'</strong><small>'+fmtDate(r.data)+' • '+esc(r.publico)+' • '+esc(r.grupo||'grupo não informado')+'</small><div class="edux-evolution"><i style="width:'+pct+'%"></i></div><small>Pré: '+esc(r.pre)+' • Pós: '+esc(r.pos)+' • Evolução: '+(d>=0?'+':'')+d.toFixed(1)+'</small></div><div class="edux-row-actions"><button class="btn danger small" data-eval-del="'+r.id+'">Excluir</button></div></div>'}).join(''):'<div class="edux-empty">Nenhuma avaliação registrada.</div>')+'</div></section>';
  host.querySelector('#eduxNewEval').onclick=edit;
  host.querySelectorAll('[data-eval-del]').forEach(b=>b.onclick=()=>{if(confirm('Excluir esta avaliação?')){write('avaliacoes',read('avaliacoes').filter(x=>x.id!==b.dataset.evalDel));draw()}});
 }
 function edit(){
  closeForm(host);
  host.querySelector('.edux').insertAdjacentHTML('beforeend','<form class="edux-form" id="eduxEditor"><div class="edux-form-head"><h3>Registrar avaliação</h3><button type="button" class="icon-btn" id="eduxCancel">×</button></div><div class="edux-form-grid">'+
  '<label>Atividade<input name="atividade" required></label><label>Data<input name="data" type="date" value="'+today()+'" required></label><label>Público<select name="publico"><option>Crianças</option><option>Adolescentes</option><option>Adultos</option><option>Misto</option></select></label><label>Grupo / turma<input name="grupo"></label>'+
  '<label>Nota média pré (0–10)<input name="pre" type="number" min="0" max="10" step=".1" required></label><label>Nota média pós (0–10)<input name="pos" type="number" min="0" max="10" step=".1" required></label>'+
  '<label class="edux-span2">Observações<textarea name="obs"></textarea></label></div><div class="edux-form-actions">'+btn('Cancelar','eduxCancel2')+'<button class="btn primary">Salvar avaliação</button></div></form>');
  const form=host.querySelector('#eduxEditor');const cancel=()=>form.remove();host.querySelector('#eduxCancel').onclick=cancel;host.querySelector('#eduxCancel2').onclick=cancel;
  form.onsubmit=e=>{e.preventDefault();const o=Object.fromEntries(new FormData(form).entries());write('avaliacoes',[{id:uid(),...o,createdAt:nowIso()},...read('avaliacoes')]);SoundManager.play('correct');draw()};
 }
 draw();
}

function evidencias(host){
 function draw(){
  const rows=read('evidencias').sort((a,b)=>(b.data||'').localeCompare(a.data||''));
  const people=rows.reduce((s,x)=>s+(Number(x.publico)||0),0),materials=rows.reduce((s,x)=>s+(Number(x.materiais)||0),0);
  host.innerHTML='<section class="edux">'+head('evidencias')+
   '<div class="edux-kpis"><div class="edux-kpi"><span>Ações registradas</span><strong>'+rows.length+'</strong></div><div class="edux-kpi"><span>Público alcançado</span><strong>'+people+'</strong></div><div class="edux-kpi"><span>Materiais distribuídos</span><strong>'+materials+'</strong></div><div class="edux-kpi"><span>Evidências</span><strong>'+rows.reduce((s,x)=>s+(Number(x.fotos)||0),0)+'</strong></div></div>'+
   '<div class="edux-toolbar"><div class="left"><strong>Comprovação de impacto</strong></div><div class="right">'+btn('⬇ Exportar CSV','eduxExportEvidence')+btn('+ Registrar ação','eduxNewEvidence','primary')+'</div></div>'+
   '<div class="edux-list">'+(rows.length?rows.map(r=>'<div class="edux-row"><div><strong>'+esc(r.acao)+'</strong><small>'+fmtDate(r.data)+' • '+esc(r.local||'')+' • '+esc(r.parceiros||'sem parceiros informados')+'</small><small>'+esc(r.publico)+' pessoa(s) • '+esc(r.materiais)+' material(is) • '+esc(r.fotos)+' evidência(s)</small><small>'+esc(r.obs||'')+'</small></div><div class="edux-row-actions"><button class="btn danger small" data-evidence-del="'+r.id+'">Excluir</button></div></div>').join(''):'<div class="edux-empty">Nenhuma evidência registrada.</div>')+'</div>'+
   '<div class="edux-help">📷 Registre aqui a <strong>quantidade e descrição</strong> das evidências. As imagens originais devem permanecer em repositório institucional próprio; esta versão web não grava fotos pesadas no navegador.</div></section>';
  host.querySelector('#eduxNewEvidence').onclick=edit;
  host.querySelector('#eduxExportEvidence').onclick=()=>{const h='Data;Acao;Local;Publico;Materiais;Evidencias;Parceiros;Observacoes\n';const lines=rows.map(r=>[r.data,r.acao,r.local,r.publico,r.materiais,r.fotos,r.parceiros,r.obs].map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(';')).join('\n');download('mobiliza-evidencias.csv',h+lines,'text/csv;charset=utf-8')};
  host.querySelectorAll('[data-evidence-del]').forEach(b=>b.onclick=()=>{if(confirm('Excluir este registro?')){write('evidencias',read('evidencias').filter(x=>x.id!==b.dataset.evidenceDel));draw()}});
 }
 function edit(){
  closeForm(host);
  host.querySelector('.edux').insertAdjacentHTML('beforeend','<form class="edux-form" id="eduxEditor"><div class="edux-form-head"><h3>Registrar ação realizada</h3><button type="button" class="icon-btn" id="eduxCancel">×</button></div><div class="edux-form-grid"><label>Ação / evento<input name="acao" required></label><label>Data<input name="data" type="date" value="'+today()+'" required></label><label>Local<input name="local"></label><label>Parceiros<input name="parceiros"></label><label>Público alcançado<input name="publico" type="number" min="0" value="0"></label><label>Materiais distribuídos<input name="materiais" type="number" min="0" value="0"></label><label>Quantidade de fotos/evidências<input name="fotos" type="number" min="0" value="0"></label><label>Responsável<input name="responsavel"></label><label class="edux-span2">Observações / resultados<textarea name="obs"></textarea></label></div><div class="edux-form-actions">'+btn('Cancelar','eduxCancel2')+'<button class="btn primary">Salvar registro</button></div></form>');
  const form=host.querySelector('#eduxEditor');const cancel=()=>form.remove();host.querySelector('#eduxCancel').onclick=cancel;host.querySelector('#eduxCancel2').onclick=cancel;
  form.onsubmit=e=>{e.preventDefault();const o=Object.fromEntries(new FormData(form).entries());write('evidencias',[{id:uid(),...o,createdAt:nowIso()},...read('evidencias')]);SoundManager.play('correct');draw()};
 }
 draw();
}

function certificados(host){
 let previewId=null;
 function draw(){
  const rows=read('certificados').sort((a,b)=>String(b.createdAt||'').localeCompare(String(a.createdAt||'')));
  host.innerHTML='<section class="edux">'+head('certificados')+
   '<div class="edux-toolbar"><div class="left"><strong>Participantes e certificados</strong><span class="edux-status">'+rows.length+' emitido(s)</span></div><div class="right">'+btn('+ Novo certificado','eduxNewCert','primary')+'</div></div>'+
   '<div class="edux-list">'+(rows.length?rows.map(r=>'<div class="edux-row"><div><strong>'+esc(r.nome)+'</strong><small>'+esc(r.atividade)+' • '+fmtDate(r.data)+' • '+esc(r.carga||'')+'</small></div><div class="edux-row-actions"><button class="btn ghost small" data-cert-view="'+r.id+'">Visualizar</button><button class="btn danger small" data-cert-del="'+r.id+'">Excluir</button></div></div>').join(''):'<div class="edux-empty">Nenhum certificado emitido neste dispositivo.</div>')+'</div><div id="eduxCertPreview"></div></section>';
  host.querySelector('#eduxNewCert').onclick=edit;
  host.querySelectorAll('[data-cert-view]').forEach(b=>b.onclick=()=>preview(b.dataset.certView));
  host.querySelectorAll('[data-cert-del]').forEach(b=>b.onclick=()=>{if(confirm('Excluir este certificado?')){write('certificados',read('certificados').filter(x=>x.id!==b.dataset.certDel));draw()}});
  if(previewId)preview(previewId);
 }
 function edit(){
  closeForm(host);
  host.querySelector('.edux').insertAdjacentHTML('beforeend','<form class="edux-form" id="eduxEditor"><div class="edux-form-head"><h3>Novo certificado</h3><button type="button" class="icon-btn" id="eduxCancel">×</button></div><div class="edux-form-grid"><label>Participante<input name="nome" required></label><label>Atividade<input name="atividade" required value="Mobiliza Educa"></label><label>Data<input name="data" type="date" value="'+today()+'" required></label><label>Carga horária<input name="carga" placeholder="2 horas"></label><label>Instituição<input name="instituicao" value="Mobiliza Educa"></label><label>Responsável / assinatura<input name="responsavel"></label></div><div class="edux-form-actions">'+btn('Cancelar','eduxCancel2')+'<button class="btn primary">Gerar certificado</button></div></form>');
  const form=host.querySelector('#eduxEditor');const cancel=()=>form.remove();host.querySelector('#eduxCancel').onclick=cancel;host.querySelector('#eduxCancel2').onclick=cancel;
  form.onsubmit=e=>{e.preventDefault();const o=Object.fromEntries(new FormData(form).entries()),r={id:uid(),...o,createdAt:nowIso()};write('certificados',[r,...read('certificados')]);previewId=r.id;SoundManager.play('celebrate');draw()};
 }
 function certHtml(r){
  return '<div class="edux-cert-preview" id="certToPrint"><div style="font-size:14px;letter-spacing:.18em;font-weight:900;color:#0b6e98">MOBILIZA EDUCA</div><h2>Certificado de Participação</h2><p>Certificamos que</p><div class="name">'+esc(r.nome)+'</div><p>participou da atividade <strong>'+esc(r.atividade)+'</strong>, realizada em '+fmtDate(r.data)+(r.carga?', com carga horária de '+esc(r.carga):'')+'.</p><p style="margin-top:30px">'+esc(r.instituicao||'Mobiliza Educa')+'</p><small>'+esc(r.responsavel||'')+'</small><p style="margin-top:28px;font-size:11px;color:#6d8290">Código: '+esc(r.id.toUpperCase())+'</p></div>';
 }
 function preview(id){
  previewId=id;const r=read('certificados').find(x=>x.id===id),box=host.querySelector('#eduxCertPreview');if(!r||!box)return;
  box.innerHTML='<div class="edux-form" style="margin-top:16px">'+certHtml(r)+'<div class="edux-form-actions"><button class="btn primary" id="printCert">🖨 Imprimir / Salvar PDF</button></div></div>';
  box.querySelector('#printCert').onclick=()=>{const w=window.open('','_blank');w.document.write('<!doctype html><html><head><meta charset="utf-8"><title>Certificado</title><style>body{font-family:Arial;padding:30px}.edux-cert-preview{max-width:900px;margin:auto;padding:70px 55px;border:12px double #0c5f8a;text-align:center;color:#123b59}.edux-cert-preview h2{font-size:36px}.name{font-size:32px;font-weight:900;color:#0b719c;margin:26px}</style></head><body>'+certHtml(r)+'</body></html>');w.document.close();setTimeout(()=>w.print(),250)};
 }
 draw();
}

function acessibilidade(host){
 const key='mobiliza.educador.access';
 const state=()=>{try{return JSON.parse(localStorage.getItem(key)||'{}')}catch{return {}}};
 const set=(k,v)=>{const s=state();s[k]=v;localStorage.setItem(key,JSON.stringify(s));apply();draw()};
 const apply=()=>{
  const s=state();document.documentElement.classList.toggle('high-contrast',!!s.contrast);document.documentElement.classList.toggle('large-text',!!s.largeText);
  if(s.sound===false&&SoundManager.isEnabled())SoundManager.toggle();
  if(s.sound===true&&!SoundManager.isEnabled())SoundManager.toggle();
 };
 function draw(){
  const s=state(),sound=s.sound!==false;
  host.innerHTML='<section class="edux">'+head('acessibilidade')+
   '<div class="edux-access-grid">'+
    '<div class="edux-access-card"><h3>◐ Alto contraste</h3><p>Aumenta contraste de elementos principais da interface.</p><div class="edux-switch"><strong>'+(s.contrast?'Ativado':'Desativado')+'</strong><button class="btn '+(s.contrast?'primary':'ghost')+'" id="accContrast">'+(s.contrast?'Desativar':'Ativar')+'</button></div></div>'+
    '<div class="edux-access-card"><h3>A+ Texto ampliado</h3><p>Aumenta o tamanho geral do texto para facilitar leitura.</p><div class="edux-switch"><strong>'+(s.largeText?'Ativado':'Desativado')+'</strong><button class="btn '+(s.largeText?'primary':'ghost')+'" id="accText">'+(s.largeText?'Desativar':'Ativar')+'</button></div></div>'+
    '<div class="edux-access-card"><h3>🔊 Sons</h3><p>Ativa feedback sonoro em jogos, trilhas e experiências.</p><div class="edux-switch"><strong>'+(sound?'Ativado':'Desativado')+'</strong><button class="btn '+(sound?'primary':'ghost')+'" id="accSound">'+(sound?'Desativar':'Ativar')+'</button></div></div>'+
    '<div class="edux-access-card"><h3>⌨️ Navegação</h3><p>Botões e formulários seguem a ordem de navegação por teclado. Use Tab, Shift+Tab e Enter.</p><div class="edux-switch"><strong>Disponível</strong><span class="edux-status ok">Ativo</span></div></div>'+
   '</div><div class="edux-help">♿ Acessibilidade não é apenas aparência. Ao preparar uma atividade, combine ajustes visuais com linguagem simples, tempo adequado e alternativas de participação.</div></section>';
  host.querySelector('#accContrast').onclick=()=>set('contrast',!s.contrast);host.querySelector('#accText').onclick=()=>set('largeText',!s.largeText);host.querySelector('#accSound').onclick=()=>set('sound',!sound);
 }
 apply();draw();
}

export function openEducatorModule(id,dialog,host,onFinish){
 css();
 if(!MODULES[id])return false;
 dialog.classList.add('educator-v2-dialog');
 dialog.addEventListener('close',()=>dialog.classList.remove('educator-v2-dialog'),{once:true});
 SoundManager.play('open');
 if(id==='agenda')agenda(host);
 else if(id==='conteudo')conteudo(host);
 else if(id==='avaliacao')avaliacao(host);
 else if(id==='evidencias')evidencias(host);
 else if(id==='certificados')certificados(host);
 else if(id==='acessibilidade')acessibilidade(host);
 if(!dialog.open)dialog.showModal();
 onFinish?.();
 return true;
}
