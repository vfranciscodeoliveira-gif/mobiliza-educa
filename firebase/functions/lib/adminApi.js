const crypto=require('crypto');
const {db,stamp,text,checkToken,jsonDate,audit}=require('./core');
const {requireTenant}=require('./authz');

async function gestorPendencias(req,res){
 const ctx=await requireTenant(req,res,{roles:['GESTOR','EDUCADOR','OPERADOR'],feature:'events'});if(!ctx)return;
 const base=db.collection('tenants').doc(ctx.tenantId);
 const [s,i]=await Promise.all([base.collection('requests').orderBy('createdAt','desc').limit(200).get(),base.collection('registrations').orderBy('createdAt','desc').limit(200).get()]);
 const cv=snap=>snap.docs.map(d=>{const x=d.data();return{id:d.id,...x,createdAt:jsonDate(x.createdAt)||'',updatedAt:jsonDate(x.updatedAt)||'',checkedInAt:jsonDate(x.checkedInAt)||x.checkedInAt||''};});
 res.json({ok:true,solicitacoes:cv(s),inscricoes:cv(i)});
}
async function gestorAtualizarSolicitacao(req,res){
 const ctx=await requireTenant(req,res,{roles:['GESTOR','EDUCADOR','OPERADOR'],feature:'events'});if(!ctx)return;
 const x=req.body||{},id=text(x.id,120),status=text(x.status,80);if(!id||!status)return res.status(400).json({ok:false,message:'Dados inválidos.'});
 await db.collection('tenants').doc(ctx.tenantId).collection('requests').doc(id).set({status,updatedAt:stamp(),idEvento:x.idEvento||null},{merge:true});
 await audit(ctx.tenantId,ctx.user,'SOLICITACAO_STATUS','request',id,status);res.json({ok:true});
}
async function gestorAtualizarInscricao(req,res){
 const ctx=await requireTenant(req,res,{roles:['GESTOR','EDUCADOR','OPERADOR'],feature:'events'});if(!ctx)return;
 const x=req.body||{},id=text(x.id,120),status=text(x.status,80);if(!id||!status)return res.status(400).json({ok:false,message:'Dados inválidos.'});
 await db.collection('tenants').doc(ctx.tenantId).collection('registrations').doc(id).set({status,updatedAt:stamp()},{merge:true});
 await audit(ctx.tenantId,ctx.user,'INSCRICAO_STATUS','registration',id,status);res.json({ok:true});
}
async function gestorPublicarEvento(req,res){
 const ctx=await requireTenant(req,res,{roles:['GESTOR','EDUCADOR'],feature:'events'});if(!ctx)return;
 const e=(req.body||{}).evento||{},ref=db.collection('tenants').doc(ctx.tenantId).collection('publicEvents'),id=text(e.id,120)||ref.doc().id;
 const doc={tenantId:ctx.tenantId,nome:text(e.nome,180),tipo:text(e.tipo,80),status:text(e.status,50)||'Confirmado',dataInicio:text(e.dataInicio,10),dataFim:text(e.dataFim,10),horaInicio:text(e.horaInicio,5),horaFim:text(e.horaFim,5),local:text(e.local,250),vagas:Math.max(0,Number(e.vagas)||0),checkinToken:text(e.checkinToken,20)||checkToken('E'),inscricoesAbertas:e.inscricoesAbertas!==false,publicadoOnline:true,dataLabel:text(e.dataLabel,40)||text(e.dataInicio,10),updatedAt:stamp()};
 await ref.doc(id).set(doc,{merge:true});await audit(ctx.tenantId,ctx.user,'EVENTO_PUBLICADO','event',id,doc.nome);res.json({ok:true,id});
}
async function gestorPublicarCertificado(req,res){
 const ctx=await requireTenant(req,res,{roles:['GESTOR','EDUCADOR'],feature:'certificates'});if(!ctx)return;
 const c=(req.body||{}).certificado||{},code=text(c.code,40).toUpperCase();if(!code||!text(c.participantName,180)||!text(c.activityName,220))return res.status(400).json({ok:false,message:'Dados do certificado inválidos.'});
 const doc={tenantId:ctx.tenantId,code,participantName:text(c.participantName,180),activityName:text(c.activityName,220),eventDateLabel:text(c.eventDateLabel,60),workloadLabel:text(c.workloadLabel,60),institution:text(c.institution,220),status:text(c.status,40)||'Emitido',issuedAt:text(c.issuedAt,60),updatedAt:stamp()};
 await db.collection('tenants').doc(ctx.tenantId).collection('certificates').doc(code).set(doc,{merge:true});await audit(ctx.tenantId,ctx.user,'CERTIFICADO_PUBLICADO','certificate',code,doc.participantName);res.json({ok:true,code});
}
async function gestorRevogarCertificado(req,res){
 const ctx=await requireTenant(req,res,{roles:['GESTOR'],feature:'certificates'});if(!ctx)return;
 const code=text((req.body||{}).code,40).toUpperCase();if(!code)return res.status(400).json({ok:false,message:'Código obrigatório.'});
 await db.collection('tenants').doc(ctx.tenantId).collection('certificates').doc(code).set({status:'Revogado',revokedAt:stamp(),updatedAt:stamp()},{merge:true});await audit(ctx.tenantId,ctx.user,'CERTIFICADO_REVOGADO','certificate',code,'');res.json({ok:true,code});
}
async function registerGestorToken(req,res){
 const ctx=await requireTenant(req,res,{roles:['GESTOR','EDUCADOR','OPERADOR']});if(!ctx)return;
 const x=req.body||{},token=text(x.token,4096);if(!token)return res.status(400).json({ok:false,message:'Token ausente.'});
 const id=crypto.createHash('sha256').update(token).digest('hex');
 await db.collection('tenants').doc(ctx.tenantId).collection('pushDevices').doc(id).set({token,uid:ctx.user.uid,userAgent:text(x.userAgent,500),updatedAt:stamp(),createdAt:stamp()},{merge:true});
 res.json({ok:true});
}
async function notifyTenant(tenantId,title,message,url='./'){
 const snap=await db.collection('tenants').doc(tenantId).collection('pushDevices').limit(500).get(),tokens=snap.docs.map(d=>d.data().token).filter(Boolean);if(!tokens.length)return;
 const result=await require('./core').admin.messaging().sendEachForMulticast({tokens,notification:{title,body:message},webpush:{fcmOptions:{link:url}}}),bad=[];
 result.responses.forEach((x,i)=>{if(!x.success&&['messaging/registration-token-not-registered','messaging/invalid-registration-token'].includes(x.error?.code))bad.push(snap.docs[i].ref.delete());});
 await Promise.all(bad);
}
module.exports={gestorPendencias,gestorAtualizarSolicitacao,gestorAtualizarInscricao,gestorPublicarEvento,gestorPublicarCertificado,gestorRevogarCertificado,registerGestorToken,notifyTenant};
