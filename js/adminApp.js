import {adminModules} from './content.js?v=67';
import {ensureAdminAccess,isAdminUnlocked,lockAdmin,getCurrentAdminUser} from './modules/auth.js?v=2';
import {canAccessModule} from './core/accessControl.js?v=1';
import {activeTenant,installTenantWorkspaceBridge} from './core/tenantRegistry.js?v=1';
import {adminModuleEntitlement} from './core/saasContext.js?v=2';
import {openAdminModule} from './modules/admin.js?v=20';

const qs=s=>document.querySelector(s);

installTenantWorkspaceBridge();

function moduleState(id){
  const permissionAllowed=canAccessModule(id);
  const plan=adminModuleEntitlement(id);
  return {
    allowed:permissionAllowed&&plan.allowed,
    reason:!permissionAllowed?'Seu perfil não possui acesso.':(!plan.allowed?plan.reason:'')
  };
}

function moduleCard(item){
  const state=moduleState(item.id);
  return `<article class="admin-online-module ${state.allowed?'':'disabled'}">
    <div class="admin-online-module-icon">${item.icon||'⚙️'}</div>
    <div class="admin-online-module-copy">
      <h3>${item.title}</h3>
      <p>${item.description}</p>
      <div class="module-meta">${(item.tags||[]).map(t=>`<span class="chip">${t}</span>`).join('')}</div>
    </div>
    <button class="btn ${state.allowed?'primary':'ghost'}" type="button" data-admin-module="${item.id}" ${state.allowed?'':'disabled'}>${state.allowed?'Abrir':state.reason||'Indisponível'}</button>
  </article>`;
}

function sidebarButton(item){
  const state=moduleState(item.id);
  return `<button type="button" class="admin-online-nav-item" data-admin-module="${item.id}" ${state.allowed?'':'disabled'}>
    <span>${item.icon||'⚙️'}</span><b>${item.title}</b>
  </button>`;
}

function bindModules(){
  document.querySelectorAll('[data-admin-module]').forEach(btn=>{
    if(btn.dataset.bound==='1')return;
    btn.dataset.bound='1';
    btn.addEventListener('click',()=>{
      const id=btn.dataset.adminModule;
      if(!id||btn.disabled)return;
      openAdminModule(id,qs('#adminDialog'),qs('#adminHost'),qs('#authDialog'));
    });
  });
}

function renderAuthenticated(){
  const user=getCurrentAdminUser();
  const tenant=activeTenant();
  const login=qs('#adminLoginState'),dash=qs('#adminDashboard');
  login.hidden=true;dash.hidden=false;

  qs('#adminUserCard').innerHTML=`<span>👤</span><div><small>Usuário conectado</small><strong>${user?.name||user?.username||'Gestor'}</strong></div>`;
  qs('#adminContext').innerHTML=`Organização: <strong>${tenant?.name||'Mobiliza Educa'}</strong> • usuário: <strong>${user?.username||'—'}</strong>`;
  qs('#adminProfileKpi').textContent=user?.profileId||'GESTOR';
  qs('#adminModulesKpi').textContent=String(adminModules.length);
  qs('#adminSidebarNav').innerHTML=adminModules.map(sidebarButton).join('');
  qs('#adminModuleGrid').innerHTML=adminModules.map(moduleCard).join('');
  bindModules();
}

function renderLoggedOut(){
  qs('#adminDashboard').hidden=true;
  qs('#adminLoginState').hidden=false;
  qs('#adminUserCard').innerHTML='<span>🔒</span><div><small>Sessão</small><strong>Não autenticado</strong></div>';
  qs('#adminContext').textContent='Faça login para acessar os módulos administrativos.';
  qs('#adminSidebarNav').innerHTML='';
}

async function requestLogin(){
  const ok=await ensureAdminAccess(qs('#authDialog'));
  if(ok)renderAuthenticated();else renderLoggedOut();
}

qs('#adminLoginButton')?.addEventListener('click',requestLogin);
qs('#adminLogout')?.addEventListener('click',()=>{
  lockAdmin();
  renderLoggedOut();
});
qs('#adminRefresh')?.addEventListener('click',()=>{
  if(isAdminUnlocked())renderAuthenticated();else renderLoggedOut();
});

window.addEventListener('mobiliza-admin-auth',e=>{
  if(e.detail?.unlocked)renderAuthenticated();else renderLoggedOut();
});
window.addEventListener('mobiliza-tenant-change',()=>{if(isAdminUnlocked())renderAuthenticated();});

if(isAdminUnlocked())renderAuthenticated();
else{
  renderLoggedOut();
  setTimeout(requestLogin,80);
}
