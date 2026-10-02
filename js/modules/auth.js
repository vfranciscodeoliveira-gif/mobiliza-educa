const KEY_HASH='mobiliza.admin.passwordHash';
const KEY_SALT='mobiliza.admin.passwordSalt';
const SESSION='mobiliza.admin.unlocked';

const enc=s=>new TextEncoder().encode(s);
const hex=b=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
async function digest(password,salt){return hex(await crypto.subtle.digest('SHA-256',enc(salt+'|'+password)));}

export function isAdminUnlocked(){return sessionStorage.getItem(SESSION)==='1';}
export function lockAdmin(){sessionStorage.removeItem(SESSION);window.dispatchEvent(new CustomEvent('mobiliza-admin-auth',{detail:{unlocked:false}}));}
export function hasAdminPassword(){return !!localStorage.getItem(KEY_HASH);}

function modalHtml(first){
 return `<form method="dialog" class="auth-card" id="authForm">
   <img src="assets/brand-icon.webp" class="auth-logo" alt="">
   <p class="eyebrow">ACESSO RESTRITO</p>
   <h2>${first?'Criar senha do administrador':'Painel do Gestor'}</h2>
   <p>${first?'Este dispositivo ainda não possui senha administrativa. Crie uma senha para proteger a área de gestão local.':'Informe a senha administrativa para acessar cadastros, eventos, relatórios e configurações.'}</p>
   <label>Senha<input id="authPassword" type="password" minlength="6" autocomplete="${first?'new-password':'current-password'}" required></label>
   ${first?'<label>Confirmar senha<input id="authConfirm" type="password" minlength="6" autocomplete="new-password" required></label>':''}
   <p class="auth-error" id="authError" hidden></p>
   <div class="form-actions"><button type="button" class="btn ghost" id="authCancel">Cancelar</button><button class="btn primary">${first?'Criar senha e entrar':'Entrar'}</button></div>
   <small class="auth-warning">Proteção local do navegador. A autenticação institucional segura entrará com o backend.</small>
 </form>`;
}

export async function ensureAdminAccess(dialog){
 if(isAdminUnlocked())return true;
 const first=!hasAdminPassword();
 dialog.innerHTML=modalHtml(first);
 dialog.showModal();
 return await new Promise(resolve=>{
  const form=dialog.querySelector('#authForm'),cancel=dialog.querySelector('#authCancel'),error=dialog.querySelector('#authError');
  const finish=v=>{if(dialog.open)dialog.close();resolve(v);};
  cancel.onclick=()=>finish(false);
  dialog.addEventListener('cancel',e=>{e.preventDefault();finish(false);},{once:true});
  form.onsubmit=async e=>{
   e.preventDefault();
   const pass=dialog.querySelector('#authPassword').value;
   if(pass.length<6){error.hidden=false;error.textContent='Use pelo menos 6 caracteres.';return;}
   if(first){
    const confirm=dialog.querySelector('#authConfirm').value;
    if(pass!==confirm){error.hidden=false;error.textContent='As senhas não conferem.';return;}
    const salt=crypto.getRandomValues(new Uint32Array(4)).join('-');
    localStorage.setItem(KEY_SALT,salt);
    localStorage.setItem(KEY_HASH,await digest(pass,salt));
   }else{
    const salt=localStorage.getItem(KEY_SALT)||'';
    const ok=(await digest(pass,salt))===localStorage.getItem(KEY_HASH);
    if(!ok){error.hidden=false;error.textContent='Senha inválida.';return;}
   }
   sessionStorage.setItem(SESSION,'1');
   window.dispatchEvent(new CustomEvent('mobiliza-admin-auth',{detail:{unlocked:true}}));
   finish(true);
  };
  setTimeout(()=>dialog.querySelector('#authPassword')?.focus(),50);
 });
}

export async function changeAdminPassword(dialog){
 if(!isAdminUnlocked())return false;
 dialog.innerHTML=`<form method="dialog" class="auth-card" id="changeForm"><p class="eyebrow">SEGURANÇA LOCAL</p><h2>Alterar senha administrativa</h2><label>Nova senha<input id="newPass" type="password" minlength="6" required></label><label>Confirmar senha<input id="newConfirm" type="password" minlength="6" required></label><p id="changeError" class="auth-error" hidden></p><div class="form-actions"><button type="button" class="btn ghost" id="changeCancel">Cancelar</button><button class="btn primary">Salvar nova senha</button></div></form>`;
 dialog.showModal();
 return await new Promise(resolve=>{
  const end=v=>{if(dialog.open)dialog.close();resolve(v);};
  dialog.querySelector('#changeCancel').onclick=()=>end(false);
  dialog.querySelector('#changeForm').onsubmit=async e=>{e.preventDefault();const a=dialog.querySelector('#newPass').value,b=dialog.querySelector('#newConfirm').value,err=dialog.querySelector('#changeError');if(a.length<6||a!==b){err.hidden=false;err.textContent=a.length<6?'Use pelo menos 6 caracteres.':'As senhas não conferem.';return;}const salt=crypto.getRandomValues(new Uint32Array(4)).join('-');localStorage.setItem(KEY_SALT,salt);localStorage.setItem(KEY_HASH,await digest(a,salt));end(true);};
 });
}