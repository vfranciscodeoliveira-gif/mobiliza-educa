import {cloudConfig} from './cloudConfig.js?v=1';

const base=()=>String(cloudConfig.functionsBaseUrl||'').replace(/\/$/,'');
export const cloudConfigured=()=>!!(cloudConfig.enabled&&base());

async function api(name,payload={},managerKey=''){
 if(!cloudConfigured())throw new Error('Integração online ainda não configurada.');
 const r=await fetch(base()+'/'+name,{method:'POST',headers:{'Content-Type':'application/json',...(managerKey?{'x-gestor-key':managerKey}:{})},body:JSON.stringify(payload)});
 let data={};try{data=await r.json();}catch{}
 if(!r.ok||data.ok===false)throw new Error(data.message||('Falha HTTP '+r.status));
 return data;
}
export const submitSolicitacao=data=>api('submitSolicitacao',data);
export const submitInscricao=data=>api('submitInscricao',data);
export const consultarProtocolo=(protocolo,contato)=>api('consultarProtocolo',{protocolo,contato});
export const listPublicEvents=()=>api('publicEvents',{});
export const publicCheckin=(eventToken,protocolo,contato)=>api('checkinPublic',{eventToken,protocolo,contato});
export const validateCertificate=code=>api('validateCertificate',{code});
const key=()=>localStorage.getItem('mobiliza.cloud.gestorKey')||'';
export function setManagerKey(v){if(v)localStorage.setItem('mobiliza.cloud.gestorKey',v);else localStorage.removeItem('mobiliza.cloud.gestorKey');}
export const hasManagerKey=()=>!!key();

function mergeStore(name,remote){
 const k='mobiliza.admin.'+name,local=JSON.parse(localStorage.getItem(k)||'[]'),map=new Map(local.map(x=>[x.id,x]));
 for(const r of remote||[]){const old=map.get(r.id)||{};map.set(r.id,{...old,...r,_cloud:true});}
 localStorage.setItem(k,JSON.stringify([...map.values()]));
}
export async function syncCloudInbox(){
 if(!cloudConfigured()||!key())return {synced:false};
 const data=await api('gestorPendencias',{},key());
 mergeStore('solicitacoes',data.solicitacoes);mergeStore('inscricoes',data.inscricoes);
 window.dispatchEvent(new CustomEvent('mobiliza-data-change',{detail:{entity:'cloud'}}));
 return {synced:true,solicitacoes:data.solicitacoes?.length||0,inscricoes:data.inscricoes?.length||0};
}
export async function updateCloudRequestStatus(id,status,extra={}){if(!cloudConfigured())return;return api('gestorAtualizarSolicitacao',{id,status,...extra},key());}
export async function updateCloudRegistrationStatus(id,status){if(!cloudConfigured())return;return api('gestorAtualizarInscricao',{id,status},key());}
export async function publishEvent(evento){if(!cloudConfigured())throw new Error('Nuvem não configurada.');return api('gestorPublicarEvento',{evento},key());}
export async function publishCertificate(certificado){if(!cloudConfigured())throw new Error('Nuvem não configurada.');return api('gestorPublicarCertificado',{certificado},key());}
export async function revokeCertificateCloud(code){if(!cloudConfigured())return;return api('gestorRevogarCertificado',{code},key());}

export async function enableManagerPush(){
 if(!cloudConfigured())throw new Error('Configure o Firebase/Cloud Functions antes de ativar notificações.');
 let managerKey=key();
 if(!managerKey){managerKey=prompt('Informe a chave privada de gestão configurada no backend:')||'';if(!managerKey)throw new Error('Chave de gestão não informada.');setManagerKey(managerKey);}
 if(!('Notification'in window))throw new Error('Este navegador não oferece notificações Web.');
 const p=await Notification.requestPermission();if(p!=='granted')throw new Error('Permissão de notificação não concedida.');
 if(!cloudConfig.firebaseWebConfig||!cloudConfig.vapidKey)throw new Error('Firebase Web/FCM ainda não configurado.');
 const [{initializeApp},{getMessaging,getToken}]=await Promise.all([
  import('https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js'),
  import('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging.js')
 ]);
 const app=initializeApp(cloudConfig.firebaseWebConfig),messaging=getMessaging(app),reg=await navigator.serviceWorker.ready;
 const token=await getToken(messaging,{vapidKey:cloudConfig.vapidKey,serviceWorkerRegistration:reg});
 if(!token)throw new Error('Não foi possível gerar o token de notificação.');
 await api('registerGestorToken',{token,userAgent:navigator.userAgent},managerKey);
 localStorage.setItem('mobiliza.cloud.pushEnabled','1');
 return true;
}
