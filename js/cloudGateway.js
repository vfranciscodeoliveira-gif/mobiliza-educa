import {cloudConfig} from './cloudConfig.js?v=2';
import {getCloudAuth,getCloudIdToken,getCloudUser,cloudSessionHint} from './core/cloudAuth.js?v=1';

const base=()=>String(cloudConfig.functionsBaseUrl||'').replace(/\/$/,'');
export const cloudConfigured=()=>!!(cloudConfig.enabled&&base());

function publicTenantSlug(){
 try{
  const q=new URLSearchParams(location.search).get('tenant');
  return String(q||cloudConfig.publicTenantSlug||'').trim();
 }catch{return String(cloudConfig.publicTenantSlug||'').trim();}
}
const tenantKey='mobiliza.cloud.tenantId';
export const getCloudTenantId=()=>localStorage.getItem(tenantKey)||'';
export function setCloudTenantId(v){if(v)localStorage.setItem(tenantKey,v);else localStorage.removeItem(tenantKey);window.dispatchEvent(new CustomEvent('mobiliza-cloud-tenant',{detail:{tenantId:v||''}}));}
export const hasCloudSession=()=>!!cloudSessionHint();

async function api(name,payload={},opts={}){
 if(!cloudConfigured())throw new Error('Integração online ainda não configurada.');
 const headers={'Content-Type':'application/json'};
 if(opts.auth){
  const token=await getCloudIdToken();
  if(!token)throw new Error('Conecte sua conta Firebase antes de sincronizar.');
  headers.Authorization='Bearer '+token;
 }
 const r=await fetch(base()+'/'+name,{method:'POST',headers,body:JSON.stringify(payload)});
 let data={};try{data=await r.json();}catch{}
 if(!r.ok||data.ok===false)throw new Error(data.message||('Falha HTTP '+r.status));
 return data;
}
const publicPayload=p=>({...p,tenantSlug:publicTenantSlug()});

export const submitSolicitacao=data=>api('submitSolicitacao',publicPayload(data));
export const submitInscricao=data=>api('submitInscricao',publicPayload(data));
export const consultarProtocolo=(protocolo,contato)=>api('consultarProtocolo',publicPayload({protocolo,contato}));
export const listPublicEvents=()=>api('publicEvents',publicPayload({}));
export const publicCheckin=(eventToken,protocolo,contato)=>api('checkinPublic',publicPayload({eventToken,protocolo,contato}));
export const validateCertificate=code=>api('validateCertificate',publicPayload({code}));
export const listPlans=()=>api('planCatalog',{});

export async function cloudMe(){
 const data=await api('me',{}, {auth:true});
 if(!getCloudTenantId()&&data.memberships?.length)setCloudTenantId(data.memberships[0].tenantId);
 return data;
}
export async function cloudTenantContext(tenantId=getCloudTenantId()){
 if(!tenantId)throw new Error('Selecione uma organização da nuvem.');
 return api('tenantContext',{tenantId},{auth:true});
}
export const ownerListTenants=()=>api('ownerListTenants',{}, {auth:true});
export const ownerCreateTenant=data=>api('ownerCreateTenant',data,{auth:true});
export const ownerUpdateSubscription=data=>api('ownerUpdateSubscription',data,{auth:true});
export const ownerSetDefaultPublicTenant=tenantId=>api('ownerSetDefaultPublicTenant',{tenantId},{auth:true});

function mergeStore(name,remote){
 const k='mobiliza.admin.'+name,local=JSON.parse(localStorage.getItem(k)||'[]'),map=new Map(local.map(x=>[x.id,x]));
 for(const r of remote||[]){const old=map.get(r.id)||{};map.set(r.id,{...old,...r,_cloud:true});}
 localStorage.setItem(k,JSON.stringify([...map.values()]));
}
export async function syncCloudInbox(){
 const tenantId=getCloudTenantId();if(!tenantId)throw new Error('Organização da nuvem não selecionada.');
 const data=await api('gestorPendencias',{tenantId},{auth:true});
 mergeStore('solicitacoes',data.solicitacoes);mergeStore('inscricoes',data.inscricoes);
 window.dispatchEvent(new CustomEvent('mobiliza-data-change',{detail:{entity:'cloud'}}));
 return {synced:true,solicitacoes:data.solicitacoes?.length||0,inscricoes:data.inscricoes?.length||0};
}
export async function updateCloudRequestStatus(id,status,extra={}){
 if(!cloudConfigured())return;
 const tenantId=getCloudTenantId();if(!tenantId)throw new Error('Organização da nuvem não selecionada.');
 return api('gestorAtualizarSolicitacao',{tenantId,id,status,...extra},{auth:true});
}
export async function updateCloudRegistrationStatus(id,status){
 if(!cloudConfigured())return;
 const tenantId=getCloudTenantId();if(!tenantId)throw new Error('Organização da nuvem não selecionada.');
 return api('gestorAtualizarInscricao',{tenantId,id,status},{auth:true});
}
export async function publishEvent(evento){
 if(!cloudConfigured())throw new Error('Nuvem não configurada.');
 const tenantId=getCloudTenantId();if(!tenantId)throw new Error('Organização da nuvem não selecionada.');
 return api('gestorPublicarEvento',{tenantId,evento},{auth:true});
}
export async function publishCertificate(certificado){
 if(!cloudConfigured())throw new Error('Nuvem não configurada.');
 const tenantId=getCloudTenantId();if(!tenantId)throw new Error('Organização da nuvem não selecionada.');
 return api('gestorPublicarCertificado',{tenantId,certificado},{auth:true});
}
export async function revokeCertificateCloud(code){
 if(!cloudConfigured())return;
 const tenantId=getCloudTenantId();if(!tenantId)throw new Error('Organização da nuvem não selecionada.');
 return api('gestorRevogarCertificado',{tenantId,code},{auth:true});
}

export async function enableManagerPush(){
 if(!cloudConfigured())throw new Error('Configure o Firebase antes de ativar notificações.');
 const user=await getCloudUser();if(!user)throw new Error('Conecte sua conta Firebase primeiro.');
 const tenantId=getCloudTenantId();if(!tenantId)throw new Error('Selecione a organização da nuvem.');
 if(!('Notification'in window))throw new Error('Este navegador não oferece notificações Web.');
 const permission=await Notification.requestPermission();if(permission!=='granted')throw new Error('Permissão de notificação não concedida.');
 if(!cloudConfig.firebaseWebConfig||!cloudConfig.vapidKey)throw new Error('Firebase Web/FCM ou VAPID ainda não configurado.');
 const sdk=await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging.js');
 const auth=await getCloudAuth(),messaging=sdk.getMessaging(auth.app),reg=await navigator.serviceWorker.ready;
 const token=await sdk.getToken(messaging,{vapidKey:cloudConfig.vapidKey,serviceWorkerRegistration:reg});
 if(!token)throw new Error('Não foi possível gerar o token de notificação.');
 await api('registerGestorToken',{tenantId,token,userAgent:navigator.userAgent},{auth:true});
 localStorage.setItem('mobiliza.cloud.pushEnabled','1');
 return true;
}
