const {admin,db,text,featureAccess,membershipId,stamp,ROLES}=require('./core');

async function authUser(req){
 const h=text(req.headers.authorization,5000);
 if(!h.toLowerCase().startsWith('bearer '))return null;
 const token=h.slice(7).trim();if(!token)return null;
 try{return await admin.auth().verifyIdToken(token,true);}catch{return null;}
}
async function requireAuth(req,res){
 const user=await authUser(req);
 if(!user){res.status(401).json({ok:false,message:'Sessão Firebase inválida ou expirada.'});return null;}
 return user;
}
async function isPlatformOwner(uid){
 const d=await db.collection('platformOwners').doc(uid).get();
 return d.exists&&d.data()?.active!==false;
}
async function getMembership(uid,tenantId){
 const d=await db.collection('tenants').doc(tenantId).collection('members').doc(uid).get();
 if(!d.exists)return null;
 const m=d.data();return m.active===false?null:{id:d.id,...m};
}
async function requireTenant(req,res,{roles=null,feature=null}={}){
 const user=await requireAuth(req,res);if(!user)return null;
 const tenantId=text((req.body||{}).tenantId,120);
 if(!tenantId){res.status(400).json({ok:false,message:'tenantId obrigatório.'});return null;}
 const owner=await isPlatformOwner(user.uid);
 const member=owner?{role:'PLATFORM_OWNER',active:true}:await getMembership(user.uid,tenantId);
 if(!member){res.status(403).json({ok:false,message:'Usuário não pertence a esta organização.'});return null;}
 if(roles&&member.role!=='PLATFORM_OWNER'&&!roles.includes(member.role)){res.status(403).json({ok:false,message:'Seu perfil não possui permissão para esta operação.'});return null;}
 if(feature){const access=await featureAccess(tenantId,feature);if(!access.allowed){res.status(403).json({ok:false,message:access.reason,code:'FEATURE_NOT_ALLOWED'});return null;}}
 return{user,tenantId,member,isPlatformOwner:owner};
}
async function requirePlatformOwner(req,res){
 const user=await requireAuth(req,res);if(!user)return null;
 if(!await isPlatformOwner(user.uid)){res.status(403).json({ok:false,message:'Acesso restrito ao proprietário da plataforma.'});return null;}
 return user;
}
async function setMembership({uid,tenantId,role='GESTOR',name='',email='',createdBy=''}) {
 const normalizedRole=ROLES.includes(role)?role:'CONSULTA';
 const data={uid,tenantId,role:normalizedRole,active:true,name:text(name,180),email:text(email,180).toLowerCase(),createdBy:text(createdBy,120),updatedAt:stamp()};
 await Promise.all([
  db.collection('tenants').doc(tenantId).collection('members').doc(uid).set({...data,createdAt:stamp()},{merge:true}),
  db.collection('memberships').doc(membershipId(uid,tenantId)).set({...data,createdAt:stamp()},{merge:true})
 ]);
}
module.exports={authUser,requireAuth,isPlatformOwner,getMembership,requireTenant,requirePlatformOwner,setMembership};
