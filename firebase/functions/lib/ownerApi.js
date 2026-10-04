const {defineSecret}=require('firebase-functions/params');
const {Timestamp}=require('firebase-admin/firestore');
const {db,PLAN_DEFAULTS,stamp,text,ensurePlans,subscriptionStatus,jsonDate,audit}=require('./core');
const {requireAuth,requirePlatformOwner,setMembership}=require('./authz');
const {createTenantCore}=require('./tenant');

const PLATFORM_BOOTSTRAP_KEY=defineSecret('PLATFORM_BOOTSTRAP_KEY');

async function bootstrapPlatformOwner(req,res){
 const user=await requireAuth(req,res);if(!user)return;
 const key=text(req.headers['x-bootstrap-key'],500);
 if(!key||key!==PLATFORM_BOOTSTRAP_KEY.value())return res.status(403).json({ok:false,message:'Chave de implantação inválida.'});
 const owners=await db.collection('platformOwners').limit(1).get();
 if(!owners.empty)return res.status(409).json({ok:false,message:'O proprietário da plataforma já foi configurado.'});
 const x=req.body||{},name=text(x.name,180)||user.name||user.email||'Proprietário',organizationName=text(x.organizationName,180)||'Mobiliza Educa';
 await ensurePlans();
 const tenant=await createTenantCore({name:organizationName,slug:x.slug||organizationName,planId:'INSTITUCIONAL',type:'OWNER',publicDefault:true,createdBy:user.uid,contactName:name,contactEmail:user.email||''});
 await Promise.all([
  db.collection('platformOwners').doc(user.uid).set({uid:user.uid,name,email:user.email||'',active:true,createdAt:stamp(),updatedAt:stamp()}),
  db.collection('users').doc(user.uid).set({uid:user.uid,name,email:user.email||'',active:true,createdAt:stamp(),updatedAt:stamp()},{merge:true}),
  setMembership({uid:user.uid,tenantId:tenant.tenantId,role:'GESTOR',name,email:user.email||'',createdBy:user.uid}),
  db.collection('platform').doc('config').set({defaultPublicTenantId:tenant.tenantId,ownerTenantId:tenant.tenantId,initializedAt:stamp(),updatedAt:stamp()},{merge:true})
 ]);
 res.json({ok:true,uid:user.uid,tenantId:tenant.tenantId,slug:tenant.slug,email:user.email||''});
}

async function me(req,res){
 const user=await requireAuth(req,res);if(!user)return;
 const [owner,memberships,userDoc]=await Promise.all([
  require('./authz').isPlatformOwner(user.uid),
  db.collection('memberships').where('uid','==',user.uid).limit(100).get(),
  db.collection('users').doc(user.uid).get()
 ]);
 const rows=[];
 for(const d of memberships.docs){
  const m=d.data();if(m.active===false)continue;
  const [tenantSnap,subSnap]=await Promise.all([db.collection('tenants').doc(m.tenantId).get(),db.collection('subscriptions').doc(m.tenantId).get()]);
  if(!tenantSnap.exists)continue;
  const sub=subSnap.exists?subSnap.data():{};
  rows.push({
   tenantId:m.tenantId,
   role:m.role,
   tenant:{id:tenantSnap.id,...tenantSnap.data()},
   subscription:{...sub,trialStartedAt:jsonDate(sub.trialStartedAt),trialEndsAt:jsonDate(sub.trialEndsAt),currentPeriodStart:jsonDate(sub.currentPeriodStart),currentPeriodEnd:jsonDate(sub.currentPeriodEnd)},
   subscriptionHealth:subscriptionStatus(sub)
  });
 }
 res.json({ok:true,user:{uid:user.uid,email:user.email||'',name:userDoc.data()?.name||user.name||user.email||'',platformOwner:owner},memberships:rows});
}

async function tenantContext(req,res){
 const ctx=await require('./authz').requireTenant(req,res);if(!ctx)return;
 const [tenantSnap,subSnap]=await Promise.all([db.collection('tenants').doc(ctx.tenantId).get(),db.collection('subscriptions').doc(ctx.tenantId).get()]);
 const sub=subSnap.exists?subSnap.data():{},planSnap=await db.collection('plans').doc(sub.planId||'TRIAL').get(),plan=planSnap.exists?planSnap.data():PLAN_DEFAULTS.TRIAL;
 res.json({
  ok:true,
  tenant:{id:tenantSnap.id,...tenantSnap.data()},
  membership:ctx.member,
  subscription:{...sub,trialStartedAt:jsonDate(sub.trialStartedAt),trialEndsAt:jsonDate(sub.trialEndsAt),currentPeriodStart:jsonDate(sub.currentPeriodStart),currentPeriodEnd:jsonDate(sub.currentPeriodEnd)},
  subscriptionHealth:subscriptionStatus(sub),
  plan
 });
}

async function planCatalog(req,res){
 await ensurePlans();
 const snap=await db.collection('plans').where('active','==',true).get();
 const plans=snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(a.order||0)-(b.order||0));
 res.json({ok:true,plans});
}

async function ownerListTenants(req,res){
 const user=await requirePlatformOwner(req,res);if(!user)return;
 const [tenantsSnap,subsSnap]=await Promise.all([db.collection('tenants').limit(500).get(),db.collection('subscriptions').limit(500).get()]);
 const subs=new Map(subsSnap.docs.map(d=>[d.id,d.data()]));
 const tenants=tenantsSnap.docs.map(d=>{
  const s=subs.get(d.id)||{};
  return{id:d.id,...d.data(),subscription:{...s,trialStartedAt:jsonDate(s.trialStartedAt),trialEndsAt:jsonDate(s.trialEndsAt),currentPeriodStart:jsonDate(s.currentPeriodStart),currentPeriodEnd:jsonDate(s.currentPeriodEnd)},subscriptionHealth:subscriptionStatus(s)};
 });
 tenants.sort((a,b)=>String(a.name||'').localeCompare(String(b.name||''),'pt-BR'));
 res.json({ok:true,tenants});
}

async function ownerCreateTenant(req,res){
 const owner=await requirePlatformOwner(req,res);if(!owner)return;
 await ensurePlans();
 const x=req.body||{};
 const tenant=await createTenantCore({
  name:x.name,
  slug:x.slug,
  planId:text(x.planId,40)||'TRIAL',
  trialDays:Number(x.trialDays)||14,
  type:'CLIENTE',
  contactName:x.contactName,
  contactEmail:x.contactEmail,
  contactPhone:x.contactPhone,
  document:x.document,
  createdBy:owner.uid
 });
 await audit(tenant.tenantId,owner,'TENANT_CRIADO','tenant',tenant.tenantId,'Criado pelo proprietário da plataforma.');
 res.json({ok:true,tenant});
}

async function ownerUpdateSubscription(req,res){
 const owner=await requirePlatformOwner(req,res);if(!owner)return;
 const x=req.body||{},tenantId=text(x.tenantId,120),planId=text(x.planId,40),status=text(x.status,40);
 if(!tenantId||!PLAN_DEFAULTS[planId]||!['trialing','active','past_due','suspended','canceled'].includes(status))return res.status(400).json({ok:false,message:'Plano/status inválidos.'});
 const patch={planId,status,authority:'firebase',updatedAt:stamp()};
 if(status==='trialing'){
  const days=Math.max(1,Number(x.trialDays)||PLAN_DEFAULTS.TRIAL.trialDays);
  patch.trialStartedAt=stamp();
  patch.trialEndsAt=Timestamp.fromDate(new Date(Date.now()+days*86400000));
 }
 if(status==='active'){
  patch.currentPeriodStart=stamp();
  const end=x.currentPeriodEnd?new Date(x.currentPeriodEnd):new Date(Date.now()+31*86400000);
  patch.currentPeriodEnd=Timestamp.fromDate(end);
 }
 await db.collection('subscriptions').doc(tenantId).set(patch,{merge:true});
 await audit(tenantId,owner,'ASSINATURA_ATUALIZADA','subscription',tenantId,planId+' • '+status);
 res.json({ok:true,tenantId,planId,status});
}

async function ownerSetDefaultPublicTenant(req,res){
 const owner=await requirePlatformOwner(req,res);if(!owner)return;
 const tenantId=text((req.body||{}).tenantId,120);
 if(!tenantId)return res.status(400).json({ok:false,message:'tenantId obrigatório.'});
 const t=await db.collection('tenants').doc(tenantId).get();
 if(!t.exists)return res.status(404).json({ok:false,message:'Organização não encontrada.'});
 await db.collection('platform').doc('config').set({defaultPublicTenantId:tenantId,updatedAt:stamp()},{merge:true});
 res.json({ok:true,tenantId});
}

module.exports={
 PLATFORM_BOOTSTRAP_KEY,
 bootstrapPlatformOwner,
 me,
 tenantContext,
 planCatalog,
 ownerListTenants,
 ownerCreateTenant,
 ownerUpdateSubscription,
 ownerSetDefaultPublicTenant
};
