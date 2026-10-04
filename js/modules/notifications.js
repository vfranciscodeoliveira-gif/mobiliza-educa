import {isAdminUnlocked,ensureAdminAccess} from './auth.js?v=2';
import {cloudConfigured,enableManagerPush,syncCloudInbox,cloudMe,getCachedCloudMe,getCloudTenantId,setCloudTenantId,isCloudEmulatorMode} from '../cloudGateway.js?v=5';
import {signInCloud,signOutCloud,cloudSessionHint} from '../core/cloudAuth.js?v=2';

const read=k=>JSON.parse(localStorage.getItem('mobiliza.admin.'+k)||'[]');
const today=()=>new Date().toISOString().slice(0,10);
const addDays=(d,n)=>{const x=new Date(d+'T12:00:00');x.setDate(x.getDate()+n);return x.toISOString().slice(0,10);};
const esc=s=>String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));

function askCloudCredentials(){
 return new Promise(resolve=>{
  const old=document.getElementById('cloudLoginDialog');if(old)old.remove();
  const d=document.createElement('dialog');d.id='cloudLoginDialog';
  d.innerHTML='<form method="dialog" class="auth-card" id="cloudLoginForm"><p class="eyebrow">FIREBASE AUTHENTICATION</p><h2>Conectar conta da nuvem</h2><p>Use o usuário cadastrado no Firebase Authentication.</p><label>E-mail<input id="cloudEmail" type="email" autocomplete="username" required></label><label>Senha<input id="cloudPassword" type="password" autocomplete="current-password" required></label><p class="auth-error" id="cloudLoginError" hidden></p><div class="form-actions"><button type="button" class="btn ghost" id="cloudCancel">Cancelar</button><button class="btn primary">Conectar Firebase</button></div></form>';
  document.body.appendChild(d);d.showModal();
  const finish=v=>{if(d.open)d.close();d.remove();resolve(v);};
  d.querySelector('#cloudEmail').value=cloudSessionHint();
  d.querySelector('#cloudCancel').onclick=()=>finish(null);
  d.querySelector('#cloudLoginForm').onsubmit=e=>{e.preventDefault();finish({email:d.querySelector('#cloudEmail').value,password:d.querySelector('#cloudPassword').value});};
  setTimeout(()=>d.querySelector('#cloudEmail')?.focus(),30);
 });
}

export function getAdminAlerts(){
 const eventos=read('eventos'),solicitacoes=read('solicitacoes'),inscricoes=read('inscricoes'),impactos=read('impactos'),agora=today(),em7=addDays(agora,7);
 const hoje=eventos.filter(x=>(x.dataInicio||x.data)===agora&&x.status!=='Cancelado');
 const proximos=eventos.filter(x=>{const d=x.dataInicio||x.data;return d>agora&&d<=em7&&x.status!=='Cancelado';});
 const atrasados=eventos.filter(x=>{const d=x.dataInicio||x.data;return d<agora&&['Planejado','Em andamento'].includes(x.status||'Planejado');});
 const semVinculo=eventos.filter(x=>!(x.idsTurmas||[]).length&&!x.idEscola&&!x.idInstituicao&&x.status!=='Cancelado');
 const novasSolicitacoes=solicitacoes.filter(x=>['Recebida','Nova'].includes(x.status||'Recebida'));
 const novasInscricoes=inscricoes.filter(x=>['Recebida','Pré-inscrição'].includes(x.status||'Recebida'));
 const semFechamento=eventos.filter(e=>e.status==='Concluído'&&!impactos.some(i=>i.eventId===e.id&&i.status==='Finalizado'));
 return {hoje,proximos,atrasados,semVinculo,novasSolicitacoes,novasInscricoes,semFechamento,total:hoje.length+proximos.length+atrasados.length+semVinculo.length+novasSolicitacoes.length+novasInscricoes.length+semFechamento.length};
}

export function renderHomeNotifications(host,authDialog,onUnlocked){
 if(!host)return;
 if(!isAdminUnlocked()){
  host.innerHTML=`<article class="home-alert locked-alert"><div class="home-alert-icon">🔒</div><div><strong>Notificações administrativas protegidas</strong><p>Entre como administrador para visualizar agenda, alertas operacionais e pendências.</p></div><button class="btn primary" id="homeAdminLogin">Acessar gestor</button></article>`;
  host.querySelector('#homeAdminLogin').onclick=async()=>{if(await ensureAdminAccess(authDialog)){renderHomeNotifications(host,authDialog,onUnlocked);onUnlocked?.();window.dispatchEvent(new CustomEvent('mobiliza-open-gestao'));}};
  return;
 }
 const a=getAdminAlerts();
 const items=[
  ['📥','Novas solicitações',a.novasSolicitacoes.length,'pedido(s) aguardam análise do gestor.'],
  ['📝','Novas inscrições',a.novasInscricoes.length,'inscrição(ões) aguardam confirmação.'],
  ['📅','Hoje',a.hoje.length,'evento(s) programado(s) para hoje.'],
  ['⏰','Próximos 7 dias',a.proximos.length,'evento(s) exigem preparação.'],
  ['⚠️','Pendências',a.atrasados.length,'evento(s) vencido(s) ainda não concluído(s).'],
  ['📷','Fechamento pós-evento',a.semFechamento.length,'ação(ões) concluída(s) ainda sem fechamento de impacto.'],
  ['🔗','Sem vínculo',a.semVinculo.length,'evento(s) sem escola ou turma vinculada.']
 ];
 const cached=getCachedCloudMe(),email=cloudSessionHint(),memberships=cached?.memberships||[],tenantId=getCloudTenantId(),selected=memberships.find(x=>x.tenantId===tenantId)||memberships[0],connected=!!email;
 const tenantSelect=connected&&memberships.length?'<select id="homeCloudTenant" style="max-width:270px;padding:8px;border:1px solid #c9dbe6;border-radius:9px">'+memberships.map(m=>'<option value="'+esc(m.tenantId)+'" '+(m.tenantId===(selected?.tenantId||tenantId)?'selected':'')+'>'+esc(m.tenant?.name||m.tenantId)+' • '+esc(m.role||'')+'</option>').join('')+'</select>':'';
 const emulator=isCloudEmulatorMode();
 const cloudText=emulator?(connected?'Emulador local conectado como <strong>'+esc(email)+'</strong>'+(selected?' • '+esc(selected.tenant?.name||'organização'):'')+'. Nenhum dado é enviado à produção.':'Emulador Firebase local ativo. Conecte o usuário de teste para sincronizar sem usar o Blaze.'):(cloudConfigured()?(connected?'Conectado como <strong>'+esc(email)+'</strong>'+(selected?' • '+esc(selected.tenant?.name||'organização'):'')+'.':'Firebase configurado. Conecte seu usuário para sincronizar dados administrativos.'):'Firebase/Cloud Functions ainda não conectado ao Mobiliza Educa.');
 const gestorEntry='<article class="home-alert" style="margin-bottom:14px;align-items:center"><div class="home-alert-icon">🛠️</div><div><strong>Centro de Gestão liberado</strong><p>Seu acesso administrativo está ativo. Abra o painel para visualizar todos os módulos de gestão.</p></div><button class="btn primary" id="homeOpenGestao">Abrir Centro de Gestão</button></article>';
 host.innerHTML=gestorEntry+'<div class="home-alert-grid">'+items.map(x=>'<article class="home-alert"><div class="home-alert-icon">'+x[0]+'</div><div><strong>'+x[1]+'</strong><span>'+x[2]+'</span><p>'+x[3]+'</p></div></article>').join('')+'</div><article class="home-alert"><div class="home-alert-icon">☁️</div><div><strong>'+(emulator?'Backend Firebase • EMULADOR LOCAL':'Backend Firebase')+'</strong><p>'+cloudText+'</p>'+tenantSelect+'</div><div style="display:flex;gap:6px;flex-wrap:wrap"><button class="btn ghost" id="homeCloudLogin" '+(cloudConfigured()?'':'disabled')+'>'+(connected?'Trocar conta':'Conectar Firebase')+'</button><button class="btn ghost" id="homeCloudSync" '+(cloudConfigured()&&connected?'':'disabled')+'>Sincronizar</button><button class="btn primary" id="homePushEnable" '+(cloudConfigured()&&connected&&!emulator?'':'disabled')+'>Ativar push</button>'+(connected?'<button class="btn danger" id="homeCloudLogout">Sair da nuvem</button>':'')+'</div></article>';
 const openGestaoBtn=host.querySelector('#homeOpenGestao'),loginBtn=host.querySelector('#homeCloudLogin'),syncBtn=host.querySelector('#homeCloudSync'),pushBtn=host.querySelector('#homePushEnable'),logoutBtn=host.querySelector('#homeCloudLogout'),tenantSel=host.querySelector('#homeCloudTenant');
 if(openGestaoBtn)openGestaoBtn.onclick=()=>window.dispatchEvent(new CustomEvent('mobiliza-open-gestao'));
 if(loginBtn)loginBtn.onclick=async()=>{const cred=await askCloudCredentials();if(!cred)return;loginBtn.disabled=true;try{await signInCloud(cred.email,cred.password);await cloudMe();renderHomeNotifications(host,authDialog,onUnlocked);}catch(e){alert(e?.code==='auth/invalid-credential'?'E-mail ou senha inválidos.':e.message);}finally{loginBtn.disabled=false;}};
 if(tenantSel)tenantSel.onchange=()=>{setCloudTenantId(tenantSel.value);renderHomeNotifications(host,authDialog,onUnlocked);};
 if(syncBtn)syncBtn.onclick=async()=>{syncBtn.disabled=true;try{await cloudMe();await syncCloudInbox();renderHomeNotifications(host,authDialog,onUnlocked);}catch(e){alert(e.message);}finally{syncBtn.disabled=false;}};
 if(pushBtn)pushBtn.onclick=async()=>{pushBtn.disabled=true;try{await enableManagerPush();alert('Notificações Firebase ativadas neste aparelho.');}catch(e){alert(e.message);}finally{pushBtn.disabled=false;}};
 if(logoutBtn)logoutBtn.onclick=async()=>{await signOutCloud();renderHomeNotifications(host,authDialog,onUnlocked);};
}
