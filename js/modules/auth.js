import {
 bootstrapSecurity,listUsers,createFirstManager,normalizeUsername,verifyPassword,startSession,endSession,sessionState,
 markLoginFailure,userLockRemaining,resetUserPassword,changeCurrentPassword,currentUser,recordAudit
} from '../core/accessControl.js?v=1';

const LEGACY_HASH='mobiliza.admin.passwordHash';

export function isAdminUnlocked(){
 const s=sessionState();if(s.expired){endSession('timeout');return false;}return !!s.unlocked;
}
export function lockAdmin(){endSession('manual');}
export function hasAdminPassword(){return bootstrapSecurity().length>0||!!localStorage.getItem(LEGACY_HASH);}
export function getCurrentAdminUser(){return currentUser();}

function firstHtml(){
 return `<form method="dialog" class="auth-card" id="authForm">
  <img src="assets/brand-icon.webp" class="auth-logo" alt="">
  <p class="eyebrow">PRIMEIRO ACESSO • SEGURANÇA LOCAL</p><h2>Criar usuário Gestor</h2>
  <p>Este navegador ainda não possui usuário administrativo. O primeiro acesso recebe o perfil <strong>Gestor</strong> e poderá cadastrar os demais usuários.</p>
  <label>Nome completo<input id="authName" autocomplete="name" required></label>
  <label>Usuário<input id="authUsername" autocomplete="username" placeholder="ex.: valdecir" required></label>
  <label>Senha<input id="authPassword" type="password" minlength="8" autocomplete="new-password" required></label>
  <label>Confirmar senha<input id="authConfirm" type="password" minlength="8" autocomplete="new-password" required></label>
  <p class="auth-error" id="authError" hidden></p>
  <div class="form-actions"><button type="button" class="btn ghost" id="authCancel">Cancelar</button><button class="btn primary">Criar Gestor e entrar</button></div>
  <small class="auth-warning">Proteção local deste dispositivo. A autenticação em nuvem será ativada quando o backend institucional for conectado.</small>
 </form>`;
}
function loginHtml(users){
 const suggested=users.length===1?users[0].username:'';
 return `<form method="dialog" class="auth-card" id="authForm">
  <img src="assets/brand-icon.webp" class="auth-logo" alt="">
  <p class="eyebrow">ACESSO RESTRITO</p><h2>Centro de Gestão</h2>
  <p>Entre com seu usuário. As permissões exibidas depois do login dependem do perfil cadastrado.</p>
  <label>Usuário<input id="authUsername" autocomplete="username" value="${suggested}" required></label>
  <label>Senha<input id="authPassword" type="password" autocomplete="current-password" required></label>
  <p class="auth-error" id="authError" hidden></p>
  <div class="form-actions"><button type="button" class="btn ghost" id="authCancel">Cancelar</button><button class="btn primary">Entrar</button></div>
  <small class="auth-warning">Após 5 tentativas inválidas, o usuário fica temporariamente bloqueado neste dispositivo.</small>
 </form>`;
}
function forcedChangeHtml(user){
 return `<form method="dialog" class="auth-card" id="forceChangeForm">
  <p class="eyebrow">TROCA OBRIGATÓRIA DE SENHA</p><h2>Olá, ${user.name}</h2>
  <p>O Gestor definiu uma senha temporária. Crie sua senha definitiva antes de acessar o sistema.</p>
  <label>Nova senha<input id="forcePass" type="password" minlength="8" autocomplete="new-password" required></label>
  <label>Confirmar senha<input id="forceConfirm" type="password" minlength="8" autocomplete="new-password" required></label>
  <p class="auth-error" id="forceError" hidden></p>
  <div class="form-actions"><button type="button" class="btn ghost" id="forceCancel">Cancelar</button><button class="btn primary">Salvar senha e entrar</button></div>
 </form>`;
}

export async function ensureAdminAccess(dialog){
 if(isAdminUnlocked())return true;
 let users=bootstrapSecurity(),first=users.length===0;
 dialog.innerHTML=first?firstHtml():loginHtml(users);dialog.showModal();
 return await new Promise(resolve=>{
  let done=false;
  const finish=v=>{if(done)return;done=true;if(dialog.open)dialog.close();resolve(v);};
  const bindCancel=()=>{const c=dialog.querySelector('#authCancel')||dialog.querySelector('#forceCancel');if(c)c.onclick=()=>finish(false);};
  bindCancel();
  dialog.addEventListener('cancel',e=>{e.preventDefault();finish(false);},{once:true});
  const form=dialog.querySelector('#authForm');
  form.onsubmit=async e=>{
   e.preventDefault();const error=dialog.querySelector('#authError');error.hidden=true;
   if(first){
    const name=dialog.querySelector('#authName').value.trim(),username=normalizeUsername(dialog.querySelector('#authUsername').value),pass=dialog.querySelector('#authPassword').value,confirm=dialog.querySelector('#authConfirm').value;
    if(!name||!username){error.hidden=false;error.textContent='Informe nome e usuário.';return;}
    if(pass.length<8){error.hidden=false;error.textContent='Use pelo menos 8 caracteres.';return;}
    if(pass!==confirm){error.hidden=false;error.textContent='As senhas não conferem.';return;}
    try{const u=await createFirstManager({name,username,password:pass});startSession(u);finish(true);}catch(err){error.hidden=false;error.textContent=err.message;}
    return;
   }
   const username=normalizeUsername(dialog.querySelector('#authUsername').value),pass=dialog.querySelector('#authPassword').value;
   users=listUsers();let u=users.find(x=>x.username===username);
   if(!u||!u.active){markLoginFailure(username);error.hidden=false;error.textContent='Usuário ou senha inválidos.';return;}
   const remaining=userLockRemaining(u);
   if(remaining>0){error.hidden=false;error.textContent='Usuário temporariamente bloqueado. Tente novamente em '+Math.ceil(remaining/60000)+' minuto(s).';return;}
   let ok=false;try{ok=await verifyPassword(u,pass);}catch{}
   if(!ok){markLoginFailure(username);error.hidden=false;error.textContent='Usuário ou senha inválidos.';return;}
   if(u.hashVersion==='legacy-sha256'){
    await resetUserPassword(u.id,pass,false);u=listUsers().find(x=>x.id===u.id)||u;
    recordAudit('SENHA_MIGRADA','usuario',u.id,'Hash legado atualizado para PBKDF2.',u);
   }
   if(u.mustChangePassword){
    dialog.innerHTML=forcedChangeHtml(u);bindCancel();
    dialog.querySelector('#forceChangeForm').onsubmit=async ev=>{
     ev.preventDefault();const a=dialog.querySelector('#forcePass').value,b=dialog.querySelector('#forceConfirm').value,err=dialog.querySelector('#forceError');
     if(a.length<8||a!==b){err.hidden=false;err.textContent=a.length<8?'Use pelo menos 8 caracteres.':'As senhas não conferem.';return;}
     try{await resetUserPassword(u.id,a,false);u=listUsers().find(x=>x.id===u.id)||u;startSession(u);finish(true);}catch(ex){err.hidden=false;err.textContent=ex.message;}
    };
    setTimeout(()=>dialog.querySelector('#forcePass')?.focus(),30);return;
   }
   startSession(u);finish(true);
  };
  setTimeout(()=>dialog.querySelector(first?'#authName':'#authUsername')?.focus(),50);
 });
}

export async function changeAdminPassword(dialog){
 if(!isAdminUnlocked())return false;const u=currentUser();if(!u)return false;
 dialog.innerHTML=`<form method="dialog" class="auth-card" id="changeForm"><p class="eyebrow">SEGURANÇA • ${u.username}</p><h2>Alterar minha senha</h2><p>Use uma senha com pelo menos 8 caracteres.</p><label>Nova senha<input id="newPass" type="password" minlength="8" required></label><label>Confirmar senha<input id="newConfirm" type="password" minlength="8" required></label><p id="changeError" class="auth-error" hidden></p><div class="form-actions"><button type="button" class="btn ghost" id="changeCancel">Cancelar</button><button class="btn primary">Salvar nova senha</button></div></form>`;
 dialog.showModal();
 return await new Promise(resolve=>{
  const end=v=>{if(dialog.open)dialog.close();resolve(v);};
  dialog.querySelector('#changeCancel').onclick=()=>end(false);
  dialog.querySelector('#changeForm').onsubmit=async e=>{e.preventDefault();const a=dialog.querySelector('#newPass').value,b=dialog.querySelector('#newConfirm').value,err=dialog.querySelector('#changeError');if(a.length<8||a!==b){err.hidden=false;err.textContent=a.length<8?'Use pelo menos 8 caracteres.':'As senhas não conferem.';return;}try{await changeCurrentPassword(a);recordAudit('MINHA_SENHA_ALTERADA','usuario',u.id,u.username);end(true);}catch(ex){err.hidden=false;err.textContent=ex.message;}};
 });
}
