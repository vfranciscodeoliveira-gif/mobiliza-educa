import {getCloudAuth,getCloudUser} from '../core/cloudAuth.js?v=3';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sdk=()=>import('https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js');
const errorText=e=>{const code=e?.code||'';return ({
 'auth/email-already-in-use':'Este e-mail já está cadastrado. Entre com a conta existente. Se o protocolo foi criado como visitante, não é possível transferi-lo automaticamente.',
 'auth/invalid-email':'Informe um e-mail válido.',
 'auth/weak-password':'Use uma senha mais forte, com pelo menos 8 caracteres.',
 'auth/invalid-credential':'E-mail ou senha incorretos.',
 'auth/wrong-password':'E-mail ou senha incorretos.',
 'auth/too-many-requests':'Muitas tentativas. Tente novamente mais tarde.',
 'auth/requires-recent-login':'Por segurança, entre novamente na conta para realizar essa alteração.',
 'auth/network-request-failed':'Sem conexão com o Firebase. Confira sua internet.'
 })[code]||e?.message||'Não foi possível autenticar.';};
function style(){if(document.getElementById('ps-account-css'))return;const e=document.createElement('style');e.id='ps-account-css';e.textContent=`.pa{border:1px solid #b7d8e9;border-radius:17px;background:#f3faff;margin:15px 0;padding:16px 18px;color:#173d57}.pa h3{margin:0 0 5px;font-size:1.12rem;color:#0b517a}.pa p{margin:5px 0 12px;font-size:.86rem}.pa .pa-tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px}.pa button{border:1px solid #83bad4;border-radius:9px;background:white;color:#075a82;padding:10px 12px;font-weight:800;cursor:pointer}.pa button.active,.pa button[type=submit]{background:#0b739d;border-color:#0b739d;color:#fff}.pa button:disabled{opacity:.5;cursor:progress}.pa form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;align-items:end}.pa form label{display:grid;gap:5px;font-size:.81rem;font-weight:700}.pa input{width:100%;padding:11px 12px;border:1px solid #adc8d7;border-radius:10px;font:inherit;background:white}.pa .pa-message{padding:8px 10px;margin:12px 0 0;border-radius:8px;background:#e6f5ff}.pa .pa-warning{color:#714400;background:#fff2d4;padding:10px 12px;border-radius:9px}.pa .pa-controls{display:flex;gap:8px;flex-wrap:wrap;align-items:center}.pa .pa-controls small{color:#40647a}@media(max-width:620px){.pa form{grid-template-columns:1fr}}`;document.head.appendChild(e);}
let mode='login';
export async function renderApplicantAccount(host,onSessionChange=()=>{}){
 if(!host)return;style();let user=null;
 try{user=await getCloudUser();}catch(e){host.innerHTML='<div class="pa">Não foi possível verificar a conta: '+esc(errorText(e))+'</div>';return;}
 const logged=user&&!user.isAnonymous;
 const label=logged?'<strong>Conta identificada:</strong> '+esc(user.email||'usuário autenticado'):user?.isAnonymous?'<strong>Modo visitante:</strong> acesso vinculado a este navegador.':'<strong>Sem conta:</strong> entre ou cadastre-se para acompanhar em qualquer aparelho.';
 const note=logged?'Os protocolos criados com esta conta podem ser consultados em outros dispositivos após entrar com o mesmo e-mail e senha.':user?.isAnonymous?'Você pode transformar esta sessão de visitante em uma conta de e-mail e senha sem perder os protocolos criados nesta sessão. Não entre em outra conta antes de vinculá-la, pois isso substitui a identidade anônima.':'Cadastre-se antes de solicitar o atendimento para manter acesso em outros dispositivos.';
 host.innerHTML='<section class="pa"><h3>🔐 Minha conta de acompanhamento</h3><p>'+label+'</p><p>'+note+'</p><div id="paBody"></div><div id="paFeedback" aria-live="polite"></div></section>';
 const body=host.querySelector('#paBody'),feedback=host.querySelector('#paFeedback');
 const message=(text,isError=false)=>{feedback.textContent=text;feedback.className=isError?'pa-message pa-warning':'pa-message';};
 const input=(n,type,autocomplete)=>'<label>'+({email:'E-mail',password:'Senha',confirm:'Repita a senha'}[n]||n)+'<input name="'+n+'" type="'+type+'" autocomplete="'+autocomplete+'" '+(n==='password'&&mode==='register'?'minlength="8"':'')+' required></label>';
 const draw=()=>{
 if(logged){body.innerHTML='<div class="pa-controls"><small>Utilize o mesmo e-mail e senha no celular ou em outro computador.</small><button id="paSignout" type="button">Sair da conta</button></div>';body.querySelector('#paSignout').onclick=async()=>{if(!confirm('Sair da conta de acompanhamento? Você poderá entrar novamente com e-mail e senha.'))return;try{const auth=await getCloudAuth();(await sdk()).signOut(auth).then(()=>onSessionChange()).catch(e=>message(errorText(e),true));}catch(e){message(errorText(e),true);}};return;}
 body.innerHTML='<div class="pa-tabs"><button type="button" id="paLoginTab" class="'+(mode==='login'?'active':'')+'">Já tenho conta</button><button type="button" id="paRegisterTab" class="'+(mode==='register'?'active':'')+'">Criar minha conta</button><button type="button" id="paResetTab" class="'+(mode==='reset'?'active':'')+'">Recuperar senha</button></div><form id="paForm">'+input('email','email','email')+(mode==='reset'?'':input('password','password',mode==='register'?'new-password':'current-password'))+(mode==='register'?input('confirm','password','new-password'):'')+'<button type="submit">'+({login:'Entrar',register:'Cadastrar e proteger meus protocolos',reset:'Enviar redefinição de senha'}[mode])+'</button></form>';
 for(const [id,value] of [['paLoginTab','login'],['paRegisterTab','register'],['paResetTab','reset']])body.querySelector('#'+id).onclick=()=>{mode=value;feedback.textContent='';draw();};
 body.querySelector('#paForm').onsubmit=async ev=>{
 ev.preventDefault();const form=ev.currentTarget,btn=form.querySelector('button[type=submit]'),data=Object.fromEntries(new FormData(form).entries());btn.disabled=true;
 try{
 const auth=await getCloudAuth(),api=await sdk(),email=String(data.email||'').trim().toLowerCase();
 if(mode==='register'){
  if(data.password!==data.confirm)throw new Error('As senhas não coincidem.');
  if(String(data.password).length<8)throw new Error('A senha precisa ter pelo menos oito caracteres.');
  if(user&&!user.isAnonymous)throw new Error('Saia da conta atual antes de cadastrar outra.');
  if(user?.isAnonymous){
   await api.linkWithCredential(user,api.EmailAuthProvider.credential(email,data.password));
  }else await api.createUserWithEmailAndPassword(auth,email,data.password);
  message('Conta cadastrada! Seus protocolos desta sessão continuarão vinculados à identidade convertida.');
  onSessionChange();
 }else if(mode==='login'){
  if(user?.isAnonymous&&!confirm('Entrar em outra conta substituirá a identidade visitante atual. Os protocolos desta sessão anônima não serão transferidos. Deseja continuar?'))return;
  await api.signInWithEmailAndPassword(auth,email,data.password);message('Acesso confirmado. Você pode consultar seus protocolos em qualquer dispositivo.');onSessionChange();
 }else{
  await api.sendPasswordResetEmail(auth,email);message('Se o e-mail estiver cadastrado, você receberá instruções de redefinição.');
 }
 }catch(e){message(errorText(e),true);}finally{btn.disabled=false;}
 };
 };
 draw();
}
