import {refreshOnlineAccess,listAccessTenants,accessSnapshot,permissionAllowed} from './core/cloudAccess.js?v=1';
import {getCloudTenantId,setCloudTenantId} from './cloudGateway.js?v=6';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let onlineTenants=[];
import {adminModules} from './content.js?v=68';
import {ensureAdminAccess,isAdminUnlocked,lockAdmin,getCurrentAdminUser} from './modules/auth.js?v=3';
import {canAccessModule} from './core/accessControl.js?v=2';
import {activeTenant,installTenantWorkspaceBridge} from './core/tenantRegistry.js?v=2';
import {adminModuleEntitlement} from './core/saasContext.js?v=2';
import {openAdminModule} from './modules/admin.js?v=32';
import {cloudMe,syncCloudInbox} from './cloudGateway.js?v=6';
import {signInCloud,cloudSessionHint} from './core/cloudAuth.js?v=3';

const qs=s=>document.querySelector(s);

installTenantWorkspaceBridge();

function askFirestoreCredentials(){
 return new Promise(resolve=>{
  const old=document.getElementById('adminFirestoreLogin');if(old)old.remove();
  const d=document.createElement('dialog');d.id='adminFirestoreLogin';
  d.innerHTML='<form class="auth-card" id="adminFirestoreLoginForm"><p class="eyebrow">FIREBASE AUTHENTICATION</p><h2>Conectar Firestore</h2><p>Use o usuário cadastrado no Firebase Authentication. A senha é enviada apenas ao Firebase.</p><label>E-mail<input id="adminFirestoreEmail" type="email" autocomplete="username" required></label><label>Senha<input id="adminFirestorePassword" type="password" autocomplete="current-password" required></label><div class="form-actions"><button type="button" class="btn ghost" id="adminFirestoreCancel">Cancelar</button><button type="submit" class="btn primary">Conectar</button></div></form>';
  document.body.appendChild(d);d.showModal();
  d.querySelector('#adminFirestoreEmail').value=cloudSessionHint();
  const done=v=>{if(d.open)d.close();d.remove();resolve(v);};
  d.querySelector('#adminFirestoreCancel').onclick=()=>done(null);
  d.querySelector('#adminFirestoreLoginForm').onsubmit=e=>{e.preventDefault();done({email:d.querySelector('#adminFirestoreEmail').value,password:d.querySelector('#adminFirestorePassword').value});};
 });
}
async function syncFirestore(){
 const btn=qs('#adminCloudSync');if(btn){btn.disabled=true;btn.textContent='☁️ Sincronizando...';}
 try{
  if(!cloudSessionHint()){const cred=await askFirestoreCredentials();if(!cred)return;await signInCloud(cred.email,cred.password);}
  const result=await refreshOnlineAccess();onlineTenants=result.tenants;
  if(!result.access.active)throw new Error('Conta sem cliente autorizado.');
  if(permissionAllowed(result.access,'events.read')&&result.access.allSchools){const r=await syncCloudInbox();alert('Firestore sincronizado: '+r.solicitacoes+' solicitações e '+r.inscricoes+' inscrições.');}else alert('Acessos atualizados.');
  renderAuthenticated();
 }catch(e){alert(e?.code==='auth/invalid-credential'?'E-mail ou senha inválidos.':(e.message||'Não foi possível sincronizar o Firestore.'));}
 finally{if(btn){btn.disabled=false;btn.textContent='☁️ Firestore';}}
}

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
  const tenant=onlineTenants.find(t=>t.id===getCloudTenantId())||{name:getCloudTenantId()};
  const login=qs('#adminLoginState'),dash=qs('#adminDashboard');
  login.hidden=true;dash.hidden=false;

  qs('#adminUserCard').innerHTML=`<span>👤</span><div><small>Usuário conectado</small><strong>${esc(user?.name||user?.username||'Gestor')}</strong></div>`;
  qs('#adminContext').innerHTML=`Cliente: <select id="adminOnlineTenant">${onlineTenants.map(t=>`<option value="${esc(t.id)}" ${t.id===getCloudTenantId()?'selected':''}>${esc(t.name||t.id)}</option>`).join('')}</select> • usuário: <strong>${esc(user?.username||'—')}</strong>`;qs('#adminOnlineTenant').onchange=async e=>{qs('#adminDialog')?.close();setCloudTenantId(e.target.value);try{const result=await refreshOnlineAccess();onlineTenants=result.tenants;renderAuthenticated();}catch(error){alert(error.message);renderLoggedOut();}};
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
  if(ok){onlineTenants=await listAccessTenants();renderAuthenticated();}else renderLoggedOut();
}

qs('#adminDialogClose')?.addEventListener('click',()=>qs('#adminDialog')?.close());
qs('#adminCloudSync')?.addEventListener('click',syncFirestore);
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

if(isAdminUnlocked())listAccessTenants().then(rows=>{onlineTenants=rows;renderAuthenticated();}).catch(renderLoggedOut);
else{
  renderLoggedOut();
  setTimeout(requestLogin,80);
}

if('serviceWorker' in navigator)window.addEventListener('load',async()=>{try{const reg=await navigator.serviceWorker.register('./service-worker.js?v=0.62.0',{updateViaCache:'none'});await reg.update();}catch(e){console.warn(e);}});

