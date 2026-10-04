const admin=require('firebase-admin');
const crypto=require('crypto');

const db=admin.firestore();
const REGION='southamerica-east1';
const PLAN_DEFAULTS={
 TRIAL:{name:'Trial',description:'Avaliação do produto antes da contratação.',features:['public_requests','events','checkin_qr'],limits:{users:1,eventsMonth:5,storageMb:50},trialDays:14,order:10},
 ESSENCIAL:{name:'Essencial',description:'Operação básica para pequenas equipes.',features:['public_requests','events','checkin_qr','certificates','backup'],limits:{users:3,eventsMonth:30,storageMb:500},trialDays:0,order:20},
 PROFISSIONAL:{name:'Profissional',description:'Gestão pedagógica completa com indicadores.',features:['public_requests','events','checkin_qr','assessments','certificates','evidence','reports360','content_editor','users','backup'],limits:{users:10,eventsMonth:150,storageMb:5000},trialDays:0,order:30},
 INSTITUCIONAL:{name:'Institucional',description:'Governança, identidade e integração ampliadas.',features:['public_requests','events','checkin_qr','assessments','certificates','evidence','reports360','content_editor','users','audit','backup','branding','cloud_sync'],limits:{users:null,eventsMonth:null,storageMb:null},trialDays:0,order:40}
};
const ROLES=['GESTOR','EDUCADOR','OPERADOR','CONSULTA'];
const stamp=()=>admin.firestore.FieldValue.serverTimestamp();
const text=(v,n=500)=>String(v??'').trim().slice(0,n);
const digits=v=>String(v??'').replace(/\D/g,'');
const slugify=v=>text(v,100).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,60);
const protocol=p=>{const d=new Date(),ymd=d.getFullYear()+String(d.getMonth()+1).padStart(2,'0')+String(d.getDate()).padStart(2,'0');return p+'-'+ymd+'-'+Math.random().toString(36).slice(2,7).toUpperCase();};
const checkToken=p=>String(p||'Q').slice(0,2).toUpperCase()+(Date.now().toString(36)+Math.random().toString(36).slice(2,10)).toUpperCase().replace(/[^A-Z0-9]/g,'').slice(-11);
const jsonDate=v=>v?.toDate?.().toISOString?.()||v||null;
const membershipId=(uid,tenantId)=>crypto.createHash('sha256').update(uid+'|'+tenantId).digest('hex');
function cors(res){res.set('Access-Control-Allow-Origin','*');res.set('Access-Control-Allow-Headers','Content-Type, Authorization, x-bootstrap-key');res.set('Access-Control-Allow-Methods','POST, OPTIONS');}
const wrap=fn=>async(req,res)=>{cors(res);if(req.method==='OPTIONS')return res.status(204).send('');if(req.method!=='POST')return res.status(405).json({ok:false,message:'Método não permitido.'});try{await fn(req,res);}catch(e){console.error(e);if(!res.headersSent)res.status(500).json({ok:false,message:'Não foi possível concluir a operação.'});}};
const body=req=>req.body&&typeof req.body==='object'?req.body:{};
async function ensurePlans(){await Promise.all(Object.entries(PLAN_DEFAULTS).map(([id,p])=>db.collection('plans').doc(id).set({id,...p,active:true,updatedAt:stamp()},{merge:true})));}
function subscriptionStatus(sub={}){let status=sub.status||'active',usable=['active','trialing'].includes(status),daysRemaining=null;if(status==='trialing'&&sub.trialEndsAt){const end=sub.trialEndsAt?.toDate?.()||new Date(sub.trialEndsAt),ms=end-Date.now();daysRemaining=Math.ceil(ms/86400000);if(ms<0){status='trial_expired';usable=false;}}if(['past_due','suspended','canceled','trial_expired'].includes(status))usable=false;return{status,usable,daysRemaining};}
async function featureAccess(tenantId,feature){const subSnap=await db.collection('subscriptions').doc(tenantId).get();if(!subSnap.exists)return{allowed:false,reason:'Assinatura não encontrada.'};const sub=subSnap.data(),health=subscriptionStatus(sub);if(!health.usable)return{allowed:false,reason:'Assinatura indisponível: '+health.status+'.'};const planSnap=await db.collection('plans').doc(sub.planId||'TRIAL').get(),plan=planSnap.exists?planSnap.data():PLAN_DEFAULTS[sub.planId]||PLAN_DEFAULTS.TRIAL;if(!(plan.features||[]).includes(feature))return{allowed:false,reason:'Recurso não incluído no plano '+(plan.name||sub.planId)+'.'};return{allowed:true,plan,health,sub};}
async function audit(tenantId,user,action,target='',recordId='',details=''){await db.collection('tenants').doc(tenantId).collection('auditLogs').add({action,target,recordId,details,userId:user?.uid||'',userEmail:user?.email||'',createdAt:stamp()});}
module.exports={admin,db,REGION,PLAN_DEFAULTS,ROLES,stamp,text,digits,slugify,protocol,checkToken,jsonDate,membershipId,cors,wrap,body,ensurePlans,subscriptionStatus,featureAccess,audit};
