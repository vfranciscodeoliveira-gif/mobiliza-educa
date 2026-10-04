import {recordAudit} from './accessControl.js?v=1';
import {
 activeTenant,activeTenantId,subscriptionFor,updateTenant,updateSubscription,tenantWorkspaceStats,
 subscriptionHealth,planSettings
} from './tenantRegistry.js?v=1';

export const FEATURE_CATALOG={
 public_requests:'Solicitações públicas',
 events:'Agenda e eventos',
 checkin_qr:'Check-in por QR',
 assessments:'Avaliações pedagógicas',
 certificates:'Certificados e passaporte',
 evidence:'Evidências e impacto',
 reports360:'Relatórios 360',
 content_editor:'Centro Editorial',
 users:'Múltiplos usuários',
 audit:'Auditoria',
 backup:'Backup protegido',
 branding:'Identidade/white-label',
 cloud_sync:'Sincronização em nuvem'
};
export const PLAN_CATALOG=[
 {id:'TRIAL',name:'Trial',description:'Avaliação do produto antes da contratação.',features:['public_requests','events','checkin_qr'],limits:{users:1,eventsMonth:5,storageMb:50}},
 {id:'ESSENCIAL',name:'Essencial',description:'Operação básica para projetos e pequenas equipes.',features:['public_requests','events','checkin_qr','certificates','backup'],limits:{users:3,eventsMonth:30,storageMb:500}},
 {id:'PROFISSIONAL',name:'Profissional',description:'Gestão pedagógica completa com indicadores e conteúdo.',features:['public_requests','events','checkin_qr','assessments','certificates','evidence','reports360','content_editor','users','backup'],limits:{users:10,eventsMonth:150,storageMb:5000}},
 {id:'INSTITUCIONAL',name:'Institucional',description:'Operação ampliada, governança, identidade e integração.',features:Object.keys(FEATURE_CATALOG),limits:{users:null,eventsMonth:null,storageMb:null}}
];

export function tenant(){return activeTenant();}
export function subscription(){return subscriptionFor(activeTenantId());}
export function currentPlan(){const s=subscription();return PLAN_CATALOG.find(p=>p.id===s?.planId)||PLAN_CATALOG[0];}
export function planCommerce(){const p=currentPlan(),cfg=planSettings().find(x=>x.id===p.id);return{...p,monthlyCents:cfg?.monthlyCents??null,trialDays:cfg?.trialDays??0,active:cfg?.active!==false};}
export function hasEntitlement(feature){
 const health=subscriptionHealth();
 if(!health.usable)return false;
 return currentPlan().features.includes(feature);
}
export function entitlementState(feature){
 const health=subscriptionHealth(),p=currentPlan(),allowed=health.usable&&p.features.includes(feature);
 let reason='';
 if(!health.usable)reason='Assinatura indisponível: '+health.status;
 else if(!p.features.includes(feature))reason='Recurso não incluído no plano '+p.name;
 return{allowed,reason,feature,planId:p.id,status:health.status,daysRemaining:health.daysRemaining};
}
export function saveTenant(patch){
 const t=updateTenant(activeTenantId(),patch);
 recordAudit('SAAS_TENANT','produto',t.id,t.name);return t;
}
export function previewPlan(planId){
 const p=PLAN_CATALOG.find(x=>x.id===planId);if(!p)throw new Error('Plano não encontrado.');
 const s=updateSubscription(activeTenantId(),{planId:p.id,status:'active',authority:'local-development'});
 recordAudit('SAAS_PLANO_PREVIEW','produto',p.id,p.name);return s;
}
export function usageSnapshot(){
 const stats=tenantWorkspaceStats(activeTenantId());
 const users=(()=>{try{return JSON.parse(localStorage.getItem('mobiliza.security.users')||'[]')}catch{return[]}})();
 return{
  users:users.filter(x=>x.active).length,
  eventsMonth:stats.eventsMonth,
  eventsTotal:stats.eventsTotal,
  schools:stats.schools,
  institutions:stats.institutions,
  participants:stats.students+stats.registrations,
  questions:stats.questions
 };
}
