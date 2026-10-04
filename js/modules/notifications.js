import {isAdminUnlocked,ensureAdminAccess} from './auth.js';
import {cloudConfigured,enableManagerPush,hasManagerKey,setManagerKey,syncCloudInbox} from '../cloudGateway.js?v=3';

const read=k=>JSON.parse(localStorage.getItem('mobiliza.admin.'+k)||'[]');
const today=()=>new Date().toISOString().slice(0,10);
const addDays=(d,n)=>{const x=new Date(d+'T12:00:00');x.setDate(x.getDate()+n);return x.toISOString().slice(0,10);};

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
  host.querySelector('#homeAdminLogin').onclick=async()=>{if(await ensureAdminAccess(authDialog)){renderHomeNotifications(host,authDialog,onUnlocked);onUnlocked?.();}};
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
 host.innerHTML=`<div class="home-alert-grid">${items.map(x=>`<article class="home-alert"><div class="home-alert-icon">${x[0]}</div><div><strong>${x[1]}</strong><span>${x[2]}</span><p>${x[3]}</p></div></article>`).join('')}</div><article class="home-alert"><div class="home-alert-icon">📲</div><div><strong>Notificações no celular</strong><p>${cloudConfigured()?(hasManagerKey()?'Integração configurada. Você pode sincronizar e ativar o push neste aparelho.':'Informe a chave de gestão para conectar este aparelho.'):'Firebase/Cloud Functions ainda não conectado ao Mobiliza Educa.'}</p></div><div style="display:flex;gap:6px;flex-wrap:wrap"><button class="btn ghost" id="homeCloudKey" ${cloudConfigured()?'':'disabled'}>Chave de gestão</button><button class="btn ghost" id="homeCloudSync" ${cloudConfigured()&&hasManagerKey()?'':'disabled'}>Sincronizar</button><button class="btn primary" id="homePushEnable" ${cloudConfigured()?'':'disabled'}>Ativar push</button></div></article>`;
 const keyBtn=host.querySelector('#homeCloudKey'),syncBtn=host.querySelector('#homeCloudSync'),pushBtn=host.querySelector('#homePushEnable');
 if(keyBtn)keyBtn.onclick=()=>{const v=prompt('Informe a chave privada de gestão configurada no backend:')||'';if(v){setManagerKey(v);renderHomeNotifications(host,authDialog,onUnlocked);}};
 if(syncBtn)syncBtn.onclick=async()=>{syncBtn.disabled=true;try{await syncCloudInbox();renderHomeNotifications(host,authDialog,onUnlocked);}catch(e){alert(e.message);}finally{syncBtn.disabled=false;}};
 if(pushBtn)pushBtn.onclick=async()=>{pushBtn.disabled=true;try{await enableManagerPush();alert('Notificações ativadas neste aparelho.');}catch(e){alert(e.message);}finally{pushBtn.disabled=false;}};
}