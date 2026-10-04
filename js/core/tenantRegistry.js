const REGISTRY_KEY='mobiliza.platform.tenants';
const ACTIVE_KEY='mobiliza.platform.activeTenantId';
const WORKSPACE_PREFIX='mobiliza.platform.workspace.';
const SUBSCRIPTIONS_KEY='mobiliza.platform.subscriptions';
const PLAN_SETTINGS_KEY='mobiliza.platform.planSettings';
const MIGRATION_KEY='mobiliza.platform.multitenantMigrated';

const safe=(k,f)=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(f))}catch{return f}};
const now=()=>new Date().toISOString();
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,9);

export const PLATFORM_PLAN_DEFAULTS=[
 {id:'TRIAL',name:'Trial',monthlyCents:null,trialDays:14,active:true},
 {id:'ESSENCIAL',name:'Essencial',monthlyCents:null,trialDays:0,active:true},
 {id:'PROFISSIONAL',name:'Profissional',monthlyCents:null,trialDays:0,active:true},
 {id:'INSTITUCIONAL',name:'Institucional',monthlyCents:null,trialDays:0,active:true}
];

function workspaceKey(k){
 if(!k||!k.startsWith('mobiliza.'))return false;
 if(k.startsWith('mobiliza.platform.'))return false;
 if(k.startsWith('mobiliza.security.'))return false;
 if(k.startsWith('mobiliza.cloud.'))return false;
 if(k.startsWith('mobiliza.saas.'))return false;
 return (
  k.startsWith('mobiliza.admin.')||
  k.startsWith('mobiliza.content.')||
  k.startsWith('mobiliza.educador.')||
  k.startsWith('mobiliza.results')||
  k.startsWith('mobiliza.milhao.')||
  k.startsWith('mobiliza.questions.')||
  k.startsWith('mobiliza.learning.')||
  k.startsWith('mobiliza.participant.')||
  k.startsWith('mobiliza.assessment.')||
  k==='mobiliza.system.settings'
 );
}
function currentWorkspaceSnapshot(){
 const out={};
 for(let i=0;i<localStorage.length;i++){
  const k=localStorage.key(i);if(workspaceKey(k))out[k]=localStorage.getItem(k);
 }
 return out;
}
function clearWorkspace(){
 const keys=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(workspaceKey(k))keys.push(k);}
 keys.forEach(k=>localStorage.removeItem(k));
}
function loadSnapshot(snapshot){
 clearWorkspace();for(const [k,v] of Object.entries(snapshot||{}))localStorage.setItem(k,v);
}
export function listTenants(){return safe(REGISTRY_KEY,[]);}
export function listSubscriptions(){return safe(SUBSCRIPTIONS_KEY,[]);}
export function planSettings(){
 let rows=safe(PLAN_SETTINGS_KEY,null);
 if(!Array.isArray(rows)){rows=PLATFORM_PLAN_DEFAULTS.map(x=>({...x}));localStorage.setItem(PLAN_SETTINGS_KEY,JSON.stringify(rows));}
 return rows;
}
export function savePlanSettings(rows){
 const clean=PLATFORM_PLAN_DEFAULTS.map(base=>{const x=(rows||[]).find(r=>r.id===base.id)||{};return{...base,...x,id:base.id,name:base.name,monthlyCents:x.monthlyCents==null||x.monthlyCents===''?null:Math.max(0,Number(x.monthlyCents)||0),trialDays:Math.max(0,Number(x.trialDays??base.trialDays)||0),active:x.active!==false};});
 localStorage.setItem(PLAN_SETTINGS_KEY,JSON.stringify(clean));return clean;
}
function legacyTenant(){
 try{return JSON.parse(localStorage.getItem('mobiliza.saas.tenant')||'null')}catch{return null}
}
function legacySubscription(){
 try{return JSON.parse(localStorage.getItem('mobiliza.saas.subscription')||'null')}catch{return null}
}
export function ensureTenantRegistry(){
 let tenants=listTenants(),subs=listSubscriptions();
 if(!tenants.length){
  const legacy=legacyTenant();
  const t={
   id:legacy?.id||'tenant-'+uid(),
   name:legacy?.name||'Mobiliza Educa • Desenvolvimento',
   slug:legacy?.slug||'mobiliza-desenvolvimento',
   type:legacy?.type||'OWNER',
   status:'active',
   document:'',
   contactName:'',
   contactEmail:'',
   contactPhone:'',
   createdAt:legacy?.createdAt||now(),
   updatedAt:now()
  };
  tenants=[t];
  const ls=legacySubscription();
  subs=[{
   tenantId:t.id,
   planId:ls?.planId||'INSTITUCIONAL',
   status:ls?.status==='development'||ls?.status==='development-preview'?'active':(ls?.status||'active'),
   authority:'local-development',
   billingCycle:'monthly',
   trialStartedAt:ls?.startedAt||null,
   trialEndsAt:ls?.trialEndsAt||null,
   startedAt:ls?.startedAt||now(),
   currentPeriodStart:now(),
   currentPeriodEnd:null,
   externalCustomerId:null,
   externalSubscriptionId:null,
   updatedAt:now()
  }];
  localStorage.setItem(REGISTRY_KEY,JSON.stringify(tenants));
  localStorage.setItem(SUBSCRIPTIONS_KEY,JSON.stringify(subs));
  localStorage.setItem(ACTIVE_KEY,t.id);
  localStorage.setItem(WORKSPACE_PREFIX+t.id,JSON.stringify(currentWorkspaceSnapshot()));
  localStorage.removeItem('mobiliza.saas.tenant');
  localStorage.removeItem('mobiliza.saas.subscription');
  localStorage.setItem(MIGRATION_KEY,now());
 }
 if(!localStorage.getItem(ACTIVE_KEY)||!tenants.some(t=>t.id===localStorage.getItem(ACTIVE_KEY)))localStorage.setItem(ACTIVE_KEY,tenants[0].id);
 planSettings();
 return tenants;
}
export function activeTenantId(){ensureTenantRegistry();return localStorage.getItem(ACTIVE_KEY);}
export function activeTenant(){const id=activeTenantId();return listTenants().find(t=>t.id===id)||null;}
export function subscriptionFor(tenantId=activeTenantId()){return listSubscriptions().find(s=>s.tenantId===tenantId)||null;}
export function snapshotActiveTenant(){
 const id=activeTenantId();if(!id)return null;
 const snap=currentWorkspaceSnapshot();localStorage.setItem(WORKSPACE_PREFIX+id,JSON.stringify(snap));return snap;
}
export function tenantWorkspaceStats(tenantId){
 let snap;
 if(tenantId===activeTenantId())snap=currentWorkspaceSnapshot();
 else snap=safe(WORKSPACE_PREFIX+tenantId,{});
 const count=k=>{try{const x=JSON.parse(snap['mobiliza.admin.'+k]||'[]');return Array.isArray(x)?x.length:0}catch{return 0}};
 const events=(()=>{try{return JSON.parse(snap['mobiliza.admin.eventos']||'[]')}catch{return[]}})();
 const month=new Date().toISOString().slice(0,7);
 return{
  schools:count('escolas'),
  institutions:count('instituicoes'),
  people:count('pessoas'),
  students:count('alunos'),
  registrations:count('inscricoes'),
  eventsTotal:events.length,
  eventsMonth:events.filter(e=>String(e.dataInicio||e.data||'').startsWith(month)).length,
  questions:(()=>{try{return JSON.parse(snap['mobiliza.content.questions']||'[]').length}catch{return 0}})()
 };
}
export function createTenant(data={}){
 ensureTenantRegistry();
 const tenants=listTenants(),slug=String(data.slug||data.name||'cliente').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,60);
 if(!slug)throw new Error('Informe um nome válido para a organização.');
 if(tenants.some(t=>t.slug===slug))throw new Error('Já existe uma organização com este identificador.');
 const t={id:'tenant-'+uid(),name:String(data.name||'Nova organização').trim(),slug,type:data.type||'CLIENTE',status:data.status||'active',document:String(data.document||''),contactName:String(data.contactName||''),contactEmail:String(data.contactEmail||''),contactPhone:String(data.contactPhone||''),createdAt:now(),updatedAt:now()};
 tenants.push(t);localStorage.setItem(REGISTRY_KEY,JSON.stringify(tenants));
 const settings=planSettings(),planId=data.planId||'TRIAL',planCfg=settings.find(x=>x.id===planId)||settings[0],trialDays=planId==='TRIAL'?Number(data.trialDays??planCfg.trialDays??14):0,trialStartedAt=trialDays?now():null,trialEndsAt=trialDays?new Date(Date.now()+trialDays*86400000).toISOString():null;
 const subs=listSubscriptions();subs.push({tenantId:t.id,planId,status:trialDays?'trialing':'active',authority:'local-development',billingCycle:'monthly',trialStartedAt,trialEndsAt,startedAt:now(),currentPeriodStart:now(),currentPeriodEnd:null,externalCustomerId:null,externalSubscriptionId:null,updatedAt:now()});localStorage.setItem(SUBSCRIPTIONS_KEY,JSON.stringify(subs));
 localStorage.setItem(WORKSPACE_PREFIX+t.id,JSON.stringify({}));
 return t;
}
export function updateTenant(id,patch){
 const rows=listTenants(),i=rows.findIndex(x=>x.id===id);if(i<0)throw new Error('Organização não encontrada.');
 rows[i]={...rows[i],...patch,id:rows[i].id,slug:rows[i].slug,updatedAt:now()};localStorage.setItem(REGISTRY_KEY,JSON.stringify(rows));return rows[i];
}
export function updateSubscription(tenantId,patch){
 const rows=listSubscriptions(),i=rows.findIndex(x=>x.tenantId===tenantId);if(i<0)throw new Error('Assinatura não encontrada.');
 rows[i]={...rows[i],...patch,tenantId,updatedAt:now()};localStorage.setItem(SUBSCRIPTIONS_KEY,JSON.stringify(rows));return rows[i];
}
export function switchTenant(id){
 ensureTenantRegistry();if(id===activeTenantId())return true;
 if(!listTenants().some(t=>t.id===id))throw new Error('Organização não encontrada.');
 snapshotActiveTenant();
 const target=safe(WORKSPACE_PREFIX+id,{});
 localStorage.setItem(ACTIVE_KEY,id);loadSnapshot(target);
 window.dispatchEvent(new CustomEvent('mobiliza-tenant-change',{detail:{tenantId:id}}));
 return true;
}
export function deleteTenant(id){
 ensureTenantRegistry();const active=activeTenantId();if(id===active)throw new Error('Troque de organização antes de excluir o workspace ativo.');
 const tenants=listTenants(),t=tenants.find(x=>x.id===id);if(!t)throw new Error('Organização não encontrada.');
 if(t.type==='OWNER')throw new Error('A organização proprietária não pode ser excluída.');
 localStorage.setItem(REGISTRY_KEY,JSON.stringify(tenants.filter(x=>x.id!==id)));
 localStorage.setItem(SUBSCRIPTIONS_KEY,JSON.stringify(listSubscriptions().filter(x=>x.tenantId!==id)));
 localStorage.removeItem(WORKSPACE_PREFIX+id);return true;
}
export function subscriptionHealth(tenantId=activeTenantId()){
 const s=subscriptionFor(tenantId);if(!s)return{status:'missing',usable:false,daysRemaining:null};
 let status=s.status||'active',usable=['active','trialing','development','development-preview'].includes(status),daysRemaining=null;
 if(status==='trialing'&&s.trialEndsAt){const ms=new Date(s.trialEndsAt)-Date.now();daysRemaining=Math.ceil(ms/86400000);if(ms<0){status='trial_expired';usable=false;}}
 if(['suspended','canceled','past_due','trial_expired'].includes(status))usable=false;
 return{status,usable,daysRemaining};
}
export function projectedMrrCents(){
 const prices=new Map(planSettings().map(x=>[x.id,Number(x.monthlyCents)||0]));
 return listSubscriptions().filter(s=>['active','trialing'].includes(subscriptionHealth(s.tenantId).status)&&s.status==='active').reduce((sum,s)=>sum+(prices.get(s.planId)||0),0);
}
export function formatMoney(cents){return (Number(cents||0)/100).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});}
export function installTenantWorkspaceBridge(){
 ensureTenantRegistry();
 const save=()=>snapshotActiveTenant();
 window.addEventListener('pagehide',save);
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')save();});
 window.addEventListener('mobiliza-data-change',()=>{clearTimeout(installTenantWorkspaceBridge._t);installTenantWorkspaceBridge._t=setTimeout(save,250);});
}
