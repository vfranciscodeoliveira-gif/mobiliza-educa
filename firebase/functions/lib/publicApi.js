const {db,stamp,text,digits,protocol,checkToken,jsonDate}=require('./core');
const {resolvePublicTenant,publicResolve}=require('./tenant');

async function submitSolicitacao(req,res){
 const x=req.body||{};if(text(x.website))return res.json({ok:true,protocolo:'OK'});
 const pub=await publicResolve(res,resolvePublicTenant(x,{requireUsable:true,feature:'public_requests'}));if(!pub)return;
 if(!text(x.origemNome)||!text(x.solicitanteNome)||!text(x.email)||!text(x.telefone)||!text(x.atividade))return res.status(400).json({ok:false,message:'Preencha os campos obrigatórios.'});
 const protocolo=protocol('SOL'),doc={tenantId:pub.tenantId,protocolo,status:'Recebida',origemTipo:text(x.origemTipo,80),origemNome:text(x.origemNome,180),solicitanteNome:text(x.solicitanteNome,180),telefone:text(x.telefone,40),email:text(x.email,180).toLowerCase(),atividade:text(x.atividade,100),dataPreferida:text(x.dataPreferida,10),horaPreferida:text(x.horaPreferida,5),flexibilidade:text(x.flexibilidade,100),quantidade:Math.max(1,Number(x.quantidade)||1),publico:text(x.publico,180),local:text(x.local,250),necessidades:text(x.necessidades,1500),createdAt:stamp(),updatedAt:stamp()};
 const ref=await db.collection('tenants').doc(pub.tenantId).collection('requests').add(doc);
 res.json({ok:true,id:ref.id,protocolo,status:'Recebida',tenant:pub.slug});
}

async function submitInscricao(req,res){
 const x=req.body||{},pub=await publicResolve(res,resolvePublicTenant(x,{requireUsable:true,feature:'events'}));if(!pub)return;
 const idEvento=text(x.idEvento,120);if(!idEvento||!text(x.nome)||!text(x.email)||!text(x.telefone))return res.status(400).json({ok:false,message:'Preencha os campos obrigatórios.'});
 const ev=await db.collection('tenants').doc(pub.tenantId).collection('publicEvents').doc(idEvento).get();if(!ev.exists)return res.status(404).json({ok:false,message:'Atividade não encontrada.'});
 const e=ev.data();if(!e.inscricoesAbertas||e.status!=='Confirmado')return res.status(409).json({ok:false,message:'As inscrições não estão abertas para esta atividade.'});
 const protocolo=protocol('INS'),doc={tenantId:pub.tenantId,protocolo,status:'Recebida',checkinToken:checkToken('I'),idEvento,tipoInscricao:text(x.tipoInscricao,60),nome:text(x.nome,180),responsavel:text(x.responsavel,180),telefone:text(x.telefone,40),email:text(x.email,180).toLowerCase(),quantidade:Math.max(1,Number(x.quantidade)||1),observacao:text(x.observacao,1000),createdAt:stamp(),updatedAt:stamp()};
 const ref=await db.collection('tenants').doc(pub.tenantId).collection('registrations').add(doc);
 res.json({ok:true,id:ref.id,protocolo,status:'Recebida',tenant:pub.slug});
}

async function publicEvents(req,res){
 const x=req.body||{},pub=await publicResolve(res,resolvePublicTenant(x,{requireUsable:true,feature:'events'}));if(!pub)return;
 const snap=await db.collection('tenants').doc(pub.tenantId).collection('publicEvents').where('publicadoOnline','==',true).limit(100).get(),today=new Date().toISOString().slice(0,10),eventos=[];
 for(const d of snap.docs){const e=d.data();if(e.status!=='Confirmado'||!e.inscricoesAbertas||String(e.dataInicio||'')<today)continue;eventos.push({id:d.id,nome:e.nome,dataInicio:e.dataInicio,horaInicio:e.horaInicio,horaFim:e.horaFim,local:e.local,vagas:e.vagas||0,dataLabel:e.dataLabel||e.dataInicio,vagasInfo:e.vagas?'até '+e.vagas+' vagas':'vagas sob confirmação'});}
 eventos.sort((a,b)=>String(a.dataInicio).localeCompare(String(b.dataInicio)));res.json({ok:true,eventos,tenant:pub.slug});
}

async function consultarProtocolo(req,res){
 const x=req.body||{},pub=await publicResolve(res,resolvePublicTenant(x,{requireUsable:false}));if(!pub)return;
 const p=text(x.protocolo,40).toUpperCase(),c=text(x.contato,180).toLowerCase();if(!p||!c)return res.status(400).json({ok:false,message:'Informe protocolo e contato.'});
 const collection=p.startsWith('INS-')?'registrations':'requests',snap=await db.collection('tenants').doc(pub.tenantId).collection(collection).where('protocolo','==',p).limit(1).get();if(snap.empty)return res.status(404).json({ok:false,message:'Protocolo não encontrado.'});
 const d=snap.docs[0].data(),matches=(d.email&&d.email===c)||(d.telefone&&digits(d.telefone)===digits(c));if(!matches)return res.status(403).json({ok:false,message:'Os dados informados não conferem com o protocolo.'});
 const status=d.status||'Recebida',confirmed=['Agendada','Confirmada','Concluída','Presente'].includes(status),msg=confirmed?'Há confirmação registrada pelo gestor. Confira os detalhes recebidos nos canais de contato informados.':'O registro foi recebido, mas ainda não representa atendimento ou vaga garantida.';
 res.json({ok:true,protocolo:p,status,tipoLabel:collection==='registrations'?'Inscrição':'Solicitação',mensagem:msg});
}

async function checkinPublic(req,res){
 const x=req.body||{},pub=await publicResolve(res,resolvePublicTenant(x,{requireUsable:true,feature:'checkin_qr'}));if(!pub)return;
 const eventToken=text(x.eventToken,30),p=text(x.protocolo,40).toUpperCase(),c=text(x.contato,180).toLowerCase();if(!eventToken||!p||!c)return res.status(400).json({ok:false,message:'Informe o QR do evento, protocolo e contato.'});
 const evs=await db.collection('tenants').doc(pub.tenantId).collection('publicEvents').where('checkinToken','==',eventToken).limit(1).get();if(evs.empty)return res.status(404).json({ok:false,message:'Evento de check-in não encontrado.'});
 const evDoc=evs.docs[0],ev=evDoc.data(),regs=await db.collection('tenants').doc(pub.tenantId).collection('registrations').where('protocolo','==',p).limit(1).get();if(regs.empty)return res.status(404).json({ok:false,message:'Inscrição não encontrada.'});
 const regDoc=regs.docs[0],r=regDoc.data();if(r.idEvento!==evDoc.id)return res.status(409).json({ok:false,message:'Esta inscrição pertence a outro evento.'});
 const matches=(r.email&&r.email===c)||(r.telefone&&digits(r.telefone)===digits(c));if(!matches)return res.status(403).json({ok:false,message:'Os dados informados não conferem com a inscrição.'});
 if(!['Confirmada','Presente'].includes(r.status))return res.status(409).json({ok:false,message:'Sua inscrição ainda não está confirmada pelo gestor.'});
 if(r.status!=='Presente')await regDoc.ref.set({status:'Presente',checkedInAt:stamp(),checkinOrigem:'QR_EVENTO',updatedAt:stamp()},{merge:true});
 res.json({ok:true,nome:r.nome||r.responsavel||'Participante',evento:ev.nome||'Atividade',status:'Presente'});
}

async function validateCertificate(req,res){
 const x=req.body||{},pub=await publicResolve(res,resolvePublicTenant(x,{requireUsable:false}));if(!pub)return;
 const code=text(x.code,40).toUpperCase();if(!code)return res.status(400).json({ok:false,message:'Informe o código do certificado.'});
 const snap=await db.collection('tenants').doc(pub.tenantId).collection('certificates').doc(code).get();if(!snap.exists)return res.status(404).json({ok:false,message:'Certificado não encontrado.'});
 const c=snap.data();res.json({ok:true,code,participantName:c.participantName||'',activityName:c.activityName||'',eventDateLabel:c.eventDateLabel||'',workloadLabel:c.workloadLabel||'',status:c.status||'Emitido',institution:c.institution||'',issuedAt:jsonDate(c.issuedAt)||c.issuedAt||''});
}
module.exports={submitSolicitacao,submitInscricao,publicEvents,consultarProtocolo,checkinPublic,validateCertificate};
