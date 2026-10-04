
import {
 ADMIN_MODULES,MODULE_LABELS,listUsers,listProfiles,createUser,updateUser,resetUserPassword,saveProfileModules,
 currentUser,currentProfile,userModules,securityConfig,setSecurityConfig,listAudit,auditCsv,purgeAudit,clearUserLock,userLockRemaining
} from '../core/accessControl.js?v=1';
import {changeAdminPassword} from './auth.js?v=2';

const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const fmt=v=>v?new Date(v).toLocaleString('pt-BR'):'—';
const download=(name,text)=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['\ufeff'+text],{type:'text/csv;charset=utf-8'}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);};

function css(){
 if(document.getElementById('sec360css'))return;
 const s=document.createElement('style');s.id='sec360css';
 s.textContent='.sec-tabs{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}.sec-tab{border:1px solid #c9dce7;background:#fff;color:#214e69;padding:10px 13px;border-radius:11px;font-weight:900;cursor:pointer}.sec-tab.active{background:#0b709f;color:#fff}.sec-kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:12px 0}.sec-kpi,.sec-panel{background:#fff;border:1px solid #d9e7ee;border-radius:14px;padding:14px}.sec-kpi strong{display:block;font-size:1.4rem;color:#0a678f}.sec-kpi span{font-size:.76rem;color:#6f8491}.sec-toolbar,.sec-actions{display:flex;gap:8px;align-items:center;justify-content:space-between;flex-wrap:wrap}.sec-actions{justify-content:flex-start}.sec-table-wrap{overflow:auto}.sec-table{width:100%;border-collapse:collapse;font-size:.78rem;margin-top:10px}.sec-table th,.sec-table td{padding:9px;border-bottom:1px solid #e4edf2;text-align:left;vertical-align:top}.sec-table th{font-size:.66rem;text-transform:uppercase;color:#6b8190}.sec-table small{display:block;color:#748894}.sec-chip{display:inline-flex;padding:4px 8px;border-radius:999px;font-size:.68rem;font-weight:900;background:#e4f6ea;color:#176638}.sec-chip.bad{background:#ffe5e5;color:#8e2c2c}.sec-chip.warn{background:#fff2d5;color:#855b05}.sec-editor{margin-top:12px;padding:14px;border:1px solid #cfe0e9;border-radius:14px;background:#f9fcfd}.sec-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}.sec-grid label{display:grid;gap:5px;font-size:.8rem;font-weight:900;color:#315a72}.sec-grid input,.sec-grid select{padding:10px;border:1px solid #c8dce7;border-radius:10px;background:#fff}.sec-span2{grid-column:1/-1}.perm-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:7px;margin-top:10px}.perm-item{display:flex;gap:8px;align-items:flex-start;border:1px solid #dce8ee;border-radius:10px;padding:8px;background:#fff}.perm-item small{display:block;color:#758996}.profile-card{border:1px solid #dbe7ed;border-radius:13px;padding:13px;margin-top:10px}.audit-filter{display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:8px}.audit-row{display:grid;grid-template-columns:150px 160px 145px 1fr;gap:8px;padding:9px;border:1px solid #dfe9ee;border-radius:10px;margin-top:7px;font-size:.75rem}.audit-row small{display:block;color:#748894}.audit-action{font-weight:900;color:#0b6893}.sec-note{padding:12px;border-left:4px solid #0b78a8;background:#eef8fc;border-radius:10px;line-height:1.45}.sec-warn{border-left-color:#dda000;background:#fff6d9}@media(max-width:850px){.sec-kpis{grid-template-columns:repeat(2,1fr)}.sec-grid,.perm-grid{grid-template-columns:1fr}.sec-span2{grid-column:auto}.audit-row{grid-template-columns:1fr 1fr}}@media(max-width:560px){.audit-filter,.audit-row{grid-template-columns:1fr}}';
 document.head.appendChild(s);
}
function profileName(id){return listProfiles().find(p=>p.id===id)?.name||id;}
function activeGestors(){return listUsers().filter(u=>u.active&&u.profileId==='GESTOR');}
function permHtml(mods){
 const set=new Set(mods||[]);
 return '<div class="perm-grid">'+ADMIN_MODULES.map(id=>'<label class="perm-item"><input type="checkbox" data-perm="'+id+'" '+(set.has(id)?'checked':'')+'><span><strong>'+esc(MODULE_LABELS[id])+'</strong><small>'+id+'</small></span></label>').join('')+'</div>';
}
function tempPass(){return 'Mz!'+Math.random().toString(36).slice(2,7).toUpperCase()+'#'+String(Date.now()).slice(-3);}

export function renderUsuariosAuditoria(host,authDialog){
 css();let tab='usuarios';
 function shell(){
  const us=listUsers(),au=listAudit(),locked=us.filter(u=>userLockRemaining(u)>0).length;
  host.innerHTML='<section class="admin-module"><p class="eyebrow">USUÁRIOS, PERFIS & AUDITORIA • v1.0</p><h2>Segurança e rastreabilidade administrativa</h2><p class="admin-intro">Controle usuários, permissões por módulo e histórico das principais ações administrativas.</p>'+
   '<div class="sec-kpis"><div class="sec-kpi"><strong>'+us.filter(x=>x.active).length+'</strong><span>usuários ativos</span></div><div class="sec-kpi"><strong>'+listProfiles().length+'</strong><span>perfis</span></div><div class="sec-kpi"><strong>'+au.length+'</strong><span>registros de auditoria</span></div><div class="sec-kpi"><strong>'+locked+'</strong><span>bloqueados</span></div></div>'+
   '<div class="sec-tabs"><button class="sec-tab '+(tab==='usuarios'?'active':'')+'" data-tab="usuarios">👤 Usuários</button><button class="sec-tab '+(tab==='perfis'?'active':'')+'" data-tab="perfis">🧩 Perfis e permissões</button><button class="sec-tab '+(tab==='auditoria'?'active':'')+'" data-tab="auditoria">🧾 Auditoria</button><button class="sec-tab '+(tab==='seguranca'?'active':'')+'" data-tab="seguranca">🛡️ Segurança</button></div><div id="secBody"></div></section>';
  host.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{tab=b.dataset.tab;shell();});
  renderBody();
 }
 function renderBody(){
  const b=host.querySelector('#secBody');
  if(tab==='usuarios')usersView(b);else if(tab==='perfis')profilesView(b);else if(tab==='auditoria')auditView(b);else securityView(b);
 }
 function usersView(b){
  const us=listUsers(),cur=currentUser();
  b.innerHTML='<div class="sec-panel"><div class="sec-toolbar"><div><h3>Usuários locais</h3><small>Sessão atual: <strong>'+esc(cur?.name||'—')+'</strong> • @'+esc(cur?.username||'')+'</small></div><button class="btn primary" id="newUser">+ Novo usuário</button></div>'+
   '<div class="sec-table-wrap"><table class="sec-table"><thead><tr><th>Usuário</th><th>Perfil</th><th>Módulos</th><th>Último login</th><th>Status</th><th>Ações</th></tr></thead><tbody>'+
   us.map(u=>{const lock=userLockRemaining(u)>0;return '<tr><td><strong>'+esc(u.name)+'</strong><small>@'+esc(u.username)+(u.id===cur?.id?' • atual':'')+'</small></td><td>'+esc(profileName(u.profileId))+'<small>'+(Array.isArray(u.permissions)?'personalizado':'herda perfil')+'</small></td><td>'+userModules(u).length+'</td><td>'+fmt(u.lastLoginAt)+'</td><td><span class="sec-chip '+(!u.active?'bad':lock?'warn':'')+'">'+(!u.active?'Inativo':lock?'Bloqueado':'Ativo')+'</span></td><td><div class="sec-actions"><button class="btn ghost small" data-edit="'+u.id+'">Editar</button><button class="btn ghost small" data-reset="'+u.id+'">Senha</button>'+(lock?'<button class="btn ghost small" data-unlock="'+u.id+'">Desbloquear</button>':'')+'<button class="btn '+(u.active?'danger':'ghost')+' small" data-toggle="'+u.id+'" '+(u.id===cur?.id?'disabled':'')+'>'+(u.active?'Desativar':'Ativar')+'</button></div></td></tr>';}).join('')+
   '</tbody></table></div><div id="secEditor"></div></div>';
  b.querySelector('#newUser').onclick=()=>editUser(null,b.querySelector('#secEditor'));
  b.querySelectorAll('[data-edit]').forEach(x=>x.onclick=()=>editUser(listUsers().find(u=>u.id===x.dataset.edit),b.querySelector('#secEditor')));
  b.querySelectorAll('[data-toggle]').forEach(x=>x.onclick=()=>{const u=listUsers().find(z=>z.id===x.dataset.toggle);if(!u)return;if(u.active&&u.profileId==='GESTOR'&&activeGestors().length===1){alert('Mantenha ao menos um Gestor ativo.');return;}if(confirm((u.active?'Desativar ':'Ativar ')+u.name+'?')){updateUser(u.id,{active:!u.active});shell();}});
  b.querySelectorAll('[data-unlock]').forEach(x=>x.onclick=()=>{clearUserLock(x.dataset.unlock);shell();});
  b.querySelectorAll('[data-reset]').forEach(x=>x.onclick=async()=>{const u=listUsers().find(z=>z.id===x.dataset.reset),p=prompt('Nova senha temporária para '+u.name+':',tempPass());if(!p)return;try{await resetUserPassword(u.id,p,u.id!==cur?.id);alert('Senha redefinida.\n\nSenha: '+p+(u.id!==cur?.id?'\nTroca obrigatória no próximo acesso.':''));shell();}catch(e){alert(e.message);}});
 }
 function editUser(u,ed){
  const ps=listProfiles(),base=u?userModules(u):(ps.find(p=>p.id==='OPERADOR')?.modules||[]),custom=Array.isArray(u?.permissions);
  ed.innerHTML='<div class="sec-editor"><div class="sec-toolbar"><h3>'+(u?'Editar usuário':'Novo usuário')+'</h3><button class="btn ghost small" id="closeEd">Fechar</button></div><form id="userForm"><div class="sec-grid">'+
   '<label>Nome<input name="name" value="'+esc(u?.name||'')+'" required></label><label>Usuário<input name="username" value="'+esc(u?.username||'')+'" required></label>'+
   '<label>Perfil<select name="profileId">'+ps.map(p=>'<option value="'+p.id+'" '+(p.id===(u?.profileId||'OPERADOR')?'selected':'')+'>'+esc(p.name)+'</option>').join('')+'</select></label>'+
   (u?'':'<label>Senha inicial<input name="password" type="password" minlength="8" required></label>')+
   '<label><span><input name="active" type="checkbox" '+(u?.active!==false?'checked':'')+'> Ativo</span></label>'+
   (u?'':'<label><span><input name="mustChange" type="checkbox" checked> Trocar senha no primeiro acesso</span></label>')+
   '<label class="sec-span2"><span><input id="custom" type="checkbox" '+(custom?'checked':'')+'> Personalizar permissões</span></label></div><div id="permBox" '+(custom?'':'hidden')+'>'+permHtml(base)+'</div><div class="sec-actions" style="justify-content:flex-end;margin-top:12px"><button class="btn primary">Salvar</button></div></form></div>';
  ed.querySelector('#closeEd').onclick=()=>ed.innerHTML='';
  const customBox=ed.querySelector('#custom'),permBox=ed.querySelector('#permBox'),profileSel=ed.querySelector('[name="profileId"]');
  const syncCustom=()=>{const gestor=profileSel.value==='GESTOR';customBox.disabled=gestor;if(gestor){customBox.checked=false;permBox.hidden=true;}else{permBox.hidden=!customBox.checked;if(customBox.checked)permBox.innerHTML=permHtml(listProfiles().find(p=>p.id===profileSel.value)?.modules||[]);}};
  customBox.onchange=syncCustom;profileSel.onchange=syncCustom;syncCustom();
  ed.querySelector('#userForm').onsubmit=async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.target).entries()),mods=d.profileId==='GESTOR'?null:(customBox.checked?[...ed.querySelectorAll('[data-perm]:checked')].map(x=>x.dataset.perm):null);try{if(u){if(u.profileId==='GESTOR'&&d.profileId!=='GESTOR'&&activeGestors().length===1)throw new Error('Mantenha ao menos um Gestor ativo.');updateUser(u.id,{name:d.name.trim(),username:d.username.trim(),profileId:d.profileId,active:!!d.active,permissions:mods});}else await createUser({name:d.name,username:d.username,profileId:d.profileId,password:d.password,active:!!d.active,mustChangePassword:!!d.mustChange,permissions:mods});shell();}catch(err){alert(err.message);}};
 }
 function profilesView(b){
  const ps=listProfiles(),us=listUsers();
  b.innerHTML='<div class="sec-panel"><div class="sec-note"><strong>Permissões por módulo.</strong> O perfil define a base. O usuário pode ter exceções personalizadas. O perfil Gestor permanece integral.</div>'+
   ps.map(p=>'<article class="profile-card" data-profile="'+p.id+'"><div class="sec-toolbar"><div><h3>'+esc(p.name)+'</h3><small>'+esc(p.description||'')+'</small></div><span class="sec-chip">'+us.filter(u=>u.profileId===p.id).length+' usuário(s)</span></div>'+permHtml(p.modules)+'<div class="sec-actions" style="justify-content:flex-end;margin-top:9px"><button class="btn primary small" data-save-profile="'+p.id+'" '+(p.id==='GESTOR'?'disabled':'')+'>Salvar permissões</button></div></article>').join('')+'</div>';
  b.querySelectorAll('[data-profile="GESTOR"] [data-perm]').forEach(x=>x.disabled=true);
  b.querySelectorAll('[data-save-profile]').forEach(x=>x.onclick=()=>{const card=b.querySelector('[data-profile="'+x.dataset.saveProfile+'"]'),mods=[...card.querySelectorAll('[data-perm]:checked')].map(z=>z.dataset.perm);try{saveProfileModules(x.dataset.saveProfile,mods);alert('Permissões atualizadas.');shell();}catch(e){alert(e.message);}});
 }
 function auditView(b){
  const rows=listAudit(),names=[...new Set(rows.map(x=>x.userName).filter(Boolean))].sort(),acts=[...new Set(rows.map(x=>x.action))].sort();
  b.innerHTML='<div class="sec-panel"><div class="sec-toolbar"><div><h3>Trilha de auditoria</h3><small>Até 3.000 registros recentes neste navegador.</small></div><div class="sec-actions"><button class="btn ghost" id="auditCsv">⬇ CSV</button><button class="btn danger" id="auditPurge">Limpar antigos</button></div></div><div class="audit-filter" style="margin-top:10px"><input id="aq" type="search" placeholder="Pesquisar..."><select id="au"><option value="">Todos os usuários</option>'+names.map(n=>'<option>'+esc(n)+'</option>').join('')+'</select><select id="aa"><option value="">Todas as ações</option>'+acts.map(n=>'<option>'+esc(n)+'</option>').join('')+'</select></div><div id="auditList"></div></div>';
  const paint=()=>{const q=b.querySelector('#aq').value.toLowerCase(),u=b.querySelector('#au').value,a=b.querySelector('#aa').value,rs=listAudit().filter(x=>(!q||JSON.stringify(x).toLowerCase().includes(q))&&(!u||x.userName===u)&&(!a||x.action===a)).slice(0,500);b.querySelector('#auditList').innerHTML=rs.map(x=>'<article class="audit-row"><div><strong>'+new Date(x.at).toLocaleDateString('pt-BR')+'</strong><small>'+new Date(x.at).toLocaleTimeString('pt-BR')+'</small></div><div><strong>'+esc(x.userName)+'</strong><small>@'+esc(x.username||'—')+' • '+esc(x.profileId||'—')+'</small></div><div><span class="audit-action">'+esc(x.action)+'</span><small>'+esc(x.target||'')+(x.recordId?' • '+esc(x.recordId):'')+'</small></div><div>'+esc(x.details||'—')+'</div></article>').join('')||'<div class="sec-note">Nenhum registro encontrado.</div>';};
  b.querySelector('#aq').oninput=paint;b.querySelector('#au').onchange=paint;b.querySelector('#aa').onchange=paint;b.querySelector('#auditCsv').onclick=()=>download('mobiliza-auditoria.csv',auditCsv());b.querySelector('#auditPurge').onclick=()=>{if(confirm('Manter somente os 200 registros mais recentes?')){purgeAudit(200);shell();}};paint();
 }
 function securityView(b){
  const cfg=securityConfig(),u=currentUser(),p=currentProfile();
  b.innerHTML='<div class="sec-panel"><div class="sec-note"><strong>Sessão atual:</strong> '+esc(u?.name||'—')+' • @'+esc(u?.username||'')+' • perfil '+esc(p?.name||'—')+' • '+userModules(u).length+' módulo(s).</div><div class="sec-grid" style="margin-top:12px"><label>Bloquear por inatividade<select id="timeout">'+[15,30,60,120].map(n=>'<option value="'+n+'" '+(n===cfg.timeoutMinutes?'selected':'')+'>'+n+' minutos</option>').join('')+'</select></label><label>Tentativas antes do bloqueio<input value="'+cfg.maxFailed+'" disabled></label><label>Duração do bloqueio<input value="'+cfg.lockMinutes+' minuto(s)" disabled></label></div><div class="sec-actions" style="margin-top:12px"><button class="btn primary" id="saveSec">Salvar política</button><button class="btn ghost" id="myPass">Alterar minha senha</button></div><div class="sec-note sec-warn" style="margin-top:12px"><strong>Escopo atual.</strong> Estas contas e a auditoria são locais deste dispositivo. Elas melhoram o controle operacional, mas não substituem autenticação de servidor. Quando ativarmos o Firebase, identidade e autorização deverão ser centralizadas.</div></div>';
  b.querySelector('#saveSec').onclick=()=>{setSecurityConfig({timeoutMinutes:Number(b.querySelector('#timeout').value)});alert('Política atualizada.');shell();};
  b.querySelector('#myPass').onclick=async()=>{if(await changeAdminPassword(authDialog))alert('Senha alterada.');};
 }
 shell();
}
