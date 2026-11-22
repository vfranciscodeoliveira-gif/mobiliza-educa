const {Timestamp}=require('firebase-admin/firestore');
const {db,PLAN_DEFAULTS,stamp,text,slugify,jsonDate,featureAccess}=require('./core');

async function createTenantCore({name,slug,planId='TRIAL',trialDays=14,type='CLIENTE',contactName='',contactEmail='',contactPhone='',document='',publicDefault=false,createdBy=''}) {
 const cleanSlug=slugify(slug||name);
 if(!cleanSlug)throw new Error('Slug inválido.');
 const existing=await db.collection('publicTenants').doc(cleanSlug).get();
 if(existing.exists)throw new Error('Já existe uma organização com este slug.');
 const tenantRef=db.collection('tenants').doc(),tenantId=tenantRef.id;
 const plan=PLAN_DEFAULTS[planId]?planId:'TRIAL',isTrial=plan==='TRIAL',days=Math.max(1,Number(trialDays)||PLAN_DEFAULTS.TRIAL.trialDays);
 const trialEndsAt=isTrial?Timestamp.fromDate(new Date(Date.now()+days*86400000)):null;
 const batch=db.batch();
 batch.set(tenantRef,{id:tenantId,name:text(name,180),slug:cleanSlug,type:text(type,40)||'CLIENTE',status:'active',document:text(document,40),contactName:text(contactName,180),contactEmail:text(contactEmail,180).toLowerCase(),contactPhone:text(contactPhone,50),publicDefault:!!publicDefault,createdBy:text(createdBy,120),createdAt:stamp(),updatedAt:stamp()});
 batch.set(db.collection('publicTenants').doc(cleanSlug),{tenantId,name:text(name,180),slug:cleanSlug,status:'active',publicDefault:!!publicDefault,updatedAt:stamp()});
 batch.set(db.collection('subscriptions').doc(tenantId),{tenantId,planId:plan,status:isTrial?'trialing':'active',authority:'firebase',billingCycle:'monthly',trialStartedAt:isTrial?stamp():null,trialEndsAt,currentPeriodStart:stamp(),currentPeriodEnd:null,externalCustomerId:null,externalSubscriptionId:null,createdAt:stamp(),updatedAt:stamp()});
 await batch.commit();
 return{tenantId,slug:cleanSlug,planId:plan,status:isTrial?'trialing':'active',trialEndsAt:jsonDate(trialEndsAt)};
}

async function resolvePublicTenant(payload,{requireUsable=true,feature=null}={}){
 let tenantId='';
 const tenantSlug=slugify(payload?.tenantSlug||'');
 if(tenantSlug){
  const pub=await db.collection('publicTenants').doc(tenantSlug).get();
  if(pub.exists)tenantId=pub.data().tenantId||'';
 }else{
  const cfg=await db.collection('platform').doc('config').get();
  tenantId=cfg.exists?text(cfg.data().defaultPublicTenantId,120):'';
 }
 if(!tenantId)throw Object.assign(new Error('Organização pública não configurada.'),{http:404});
 const tenantSnap=await db.collection('tenants').doc(tenantId).get();
 if(!tenantSnap.exists||tenantSnap.data().status==='disabled')throw Object.assign(new Error('Organização indisponível.'),{http:404});
 if(requireUsable&&feature){
  const access=await featureAccess(tenantId,feature);
  if(!access.allowed)throw Object.assign(new Error('Serviço temporariamente indisponível para esta organização.'),{http:403});
 }
 return{tenantId,tenant:tenantSnap.data(),slug:tenantSlug||tenantSnap.data().slug||''};
}

async function publicResolve(res,promise){
 try{return await promise;}
 catch(e){res.status(e.http||500).json({ok:false,message:e.message||'Não foi possível concluir a operação.'});return null;}
}

module.exports={createTenantCore,resolvePublicTenant,publicResolve};
