import {recordAudit} from './accessControl.js?v=1';

const TENANT_KEY='mobiliza.saas.tenant';
const SUB_KEY='mobiliza.saas.subscription';

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
const safe=(k,f)=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(f))}catch{return f}};
export function tenant(){
 const current=safe(TENANT_KEY,null);
 if(current)return current;
 const t={id:'local-owner',name:'Mobiliza Educa • Desenvolvimento',slug:'mobiliza-desenvolvimento',type:'OWNER',createdAt:new Date().toISOString()};
 localStorage.setItem(TENANT_KEY,JSON.stringify(t));return t;
}
export function subscription(){
 const s=safe(SUB_KEY,null);if(s)return s;
 const value={planId:'INSTITUCIONAL',status:'development',authority:'local-preview',startedAt:new Date().toISOString(),trialEndsAt:null,externalCustomerId:null,externalSubscriptionId:null};
 localStorage.setItem(SUB_KEY,JSON.stringify(value));return value;
}
export function currentPlan(){const s=subscription();return PLAN_CATALOG.find(p=>p.id===s.planId)||PLAN_CATALOG[0];}
export function hasEntitlement(feature){return currentPlan().features.includes(feature);}
export function saveTenant(patch){const t={...tenant(),...patch,updatedAt:new Date().toISOString()};localStorage.setItem(TENANT_KEY,JSON.stringify(t));recordAudit('SAAS_TENANT','produto',t.id,t.name);return t;}
export function previewPlan(planId){
 const p=PLAN_CATALOG.find(x=>x.id===planId);if(!p)throw new Error('Plano não encontrado.');
 const s={...subscription(),planId:p.id,status:'development-preview',authority:'local-preview',updatedAt:new Date().toISOString()};
 localStorage.setItem(SUB_KEY,JSON.stringify(s));recordAudit('SAAS_PLANO_PREVIEW','produto',p.id,p.name);return s;
}
export function usageSnapshot(){
 const count=k=>{try{const x=JSON.parse(localStorage.getItem('mobiliza.admin.'+k)||'[]');return Array.isArray(x)?x.length:0}catch{return 0}};
 const month=new Date().toISOString().slice(0,7),events=(()=>{try{return JSON.parse(localStorage.getItem('mobiliza.admin.eventos')||'[]')}catch{return[]}})();
 const users=(()=>{try{return JSON.parse(localStorage.getItem('mobiliza.security.users')||'[]')}catch{return[]}})();
 return{users:users.filter(x=>x.active).length,eventsMonth:events.filter(e=>String(e.dataInicio||e.data||'').startsWith(month)).length,eventsTotal:events.length,schools:count('escolas'),participants:count('alunos')+count('inscricoes')};
}
