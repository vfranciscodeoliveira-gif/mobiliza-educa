const {onRequest}=require('firebase-functions/v2/https');
const {onDocumentCreated}=require('firebase-functions/v2/firestore');
const {defineSecret}=require('firebase-functions/params');
const admin=require('firebase-admin');
const crypto=require('crypto');
admin.initializeApp();
const db=admin.firestore(),REGION='southamerica-east1',GESTOR_PUSH_KEY=defineSecret('GESTOR_PUSH_KEY');

const cors=res=>{res.set('Access-Control-Allow-Origin','*');res.set('Access-Control-Allow-Headers','Content-Type, x-gestor-key');res.set('Access-Control-Allow-Methods','POST, OPTIONS');};
const wrap=fn=>async(req,res)=>{cors(res);if(req.method==='OPTIONS')return res.status(204).send('');if(req.method!=='POST')return res.status(405).json({ok:false,message:'Método não permitido.'});try{await fn(req,res);}catch(e){console.error(e);res.status(500).json({ok:false,message:'Não foi possível concluir a operação.'});}};
const body=req=>req.body&&typeof req.body==='object'?req.body:{};
const text=(v,n=500)=>String(v||'').trim().slice(0,n),digits=v=>String(v||'').replace(/\D/g,''),stamp=()=>admin.firestore.FieldValue.serverTimestamp();
const protocol=p=>{const d=new Date(),ymd=d.getFullYear()+String(d.getMonth()+1).padStart(2,'0')+String(d.getDate()).padStart(2,'0');return p+'-'+ymd+'-'+Math.random().toString(36).slice(2,7).toUpperCase();};
const checkToken=p=>String(p||'Q').slice(0,2).toUpperCase()+(Date.now().toString(36)+Math.random().toString(36).slice(2,10)).toUpperCase().replace(/[^A-Z0-9]/g,'').slice(-11);
const manager=(req,res)=>{if(text(req.headers['x-gestor-key'],300)!==GESTOR_PUSH_KEY.value()){res.status(403).json({ok:false,message:'Acesso do gestor não autorizado.'});return false;}return true;};

exports.submitSolicitacao=onRequest({region:REGION,cors:false},wrap(async(req,res)=>{
 const x=body(req);if(text(x.website))return res.json({ok:true,protocolo:'OK'});
 if(!text(x.origemNome)||!text(x.solicitanteNome)||!text(x.email)||!text(x.telefone)||!text(x.atividade))return res.status(400).json({ok:false,message:'Preencha os campos obrigatórios.'});
 const protocolo=protocol('SOL'),doc={protocolo,status:'Recebida',origemTipo:text(x.origemTipo,80),origemNome:text(x.origemNome,180),solicitanteNome:text(x.solicitanteNome,180),telefone:text(x.telefone,40),email:text(x.email,180).toLowerCase(),atividade:text(x.atividade,100),dataPreferida:text(x.dataPreferida,10),horaPreferida:text(x.horaPreferida,5),flexibilidade:text(x.flexibilidade,100),quantidade:Math.max(1,Number(x.quantidade)||1),publico:text(x.publico,180),local:text(x.local,250),necessidades:text(x.necessidades,1500),createdAt:stamp(),updatedAt:stamp()};
 const ref=await db.collection('solicitacoes').add(doc);res.json({ok:true,id:ref.id,protocolo,status:'Recebida'});
}));

exports.submitInscricao=onRequest({region:REGION,cors:false},wrap(async(req,res)=>{
 const x=body(req),idEvento=text(x.idEvento,120);if(!idEvento||!text(x.nome)||!text(x.email)||!text(x.telefone))return res.status(400).json({ok:false,message:'Preencha os campos obrigatórios.'});
 const ev=await db.collection('eventosPublicos').doc(idEvento).get();if(!ev.exists)return res.status(404).json({ok:false,message:'Atividade não encontrada.'});
 const e=ev.data();if(!e.inscricoesAbertas||e.status!=='Confirmado')return res.status(409).json({ok:false,message:'As inscrições não estão abertas para esta atividade.'});
 const protocolo=protocol('INS'),doc={protocolo,status:'Recebida',checkinToken:checkToken('I'),idEvento,tipoInscricao:text(x.tipoInscricao,60),nome:text(x.nome,180),responsavel:text(x.responsavel,180),telefone:text(x.telefone,40),email:text(x.email,180).toLowerCase(),quantidade:Math.max(1,Number(x.quantidade)||1),observacao:text(x.observacao,1000),createdAt:stamp(),updatedAt:stamp()};
 const ref=await db.collection('inscricoes').add(doc);res.json({ok:true,id:ref.id,protocolo,status:'Recebida'});
}));

exports.publicEvents=onRequest({region:REGION,cors:false},wrap(async(req,res)=>{
 const snap=await db.collection('eventosPublicos').where('publicadoOnline','==',true).limit(100).get(),now=new Date().toISOString().slice(0,10),eventos=[];
 for(const d of snap.docs){const e=d.data();if(e.status!=='Confirmado'||!e.inscricoesAbertas||String(e.dataInicio||'')<now)continue;eventos.push({id:d.id,nome:e.nome,dataInicio:e.dataInicio,horaInicio:e.horaInicio,horaFim:e.horaFim,local:e.local,vagas:e.vagas||0,dataLabel:e.dataLabel||e.dataInicio,vagasInfo:e.vagas?'até '+e.vagas+' vagas':'vagas sob confirmação'});}
 eventos.sort((a,b)=>String(a.dataInicio).localeCompare(String(b.dataInicio)));res.json({ok:true,eventos});
}));

exports.consultarProtocolo=onRequest({region:REGION,cors:false},wrap(async(req,res)=>{
 const x=body(req),p=text(x.protocolo,40).toUpperCase(),c=text(x.contato,180).toLowerCase();if(!p||!c)return res.status(400).json({ok:false,message:'Informe protocolo e contato.'});
 const collection=p.startsWith('INS-')?'inscricoes':'solicitacoes',snap=await db.collection(collection).where('protocolo','==',p).limit(1).get();if(snap.empty)return res.status(404).json({ok:false,message:'Protocolo não encontrado.'});
 const d=snap.docs[0].data(),matches=(d.email&&d.email===c)||(d.telefone&&digits(d.telefone)===digits(c));if(!matches)return res.status(403).json({ok:false,message:'Os dados informados não conferem com o protocolo.'});
 const status=d.status||'Recebida',confirmed=['Agendada','Confirmada','Concluída','Presente'].includes(status),msg=confirmed?'Há confirmação registrada pelo gestor. Confira os detalhes recebidos nos canais de contato informados.':'O registro foi recebido, mas ainda não representa atendimento ou vaga garantida.';
 res.json({ok:true,protocolo:p,status,tipoLabel:collection==='inscricoes'?'Inscrição':'Solicitação',mensagem:msg});
}));

exports.checkinPublic=onRequest({region:REGION,cors:false},wrap(async(req,res)=>{
 const x=body(req),eventToken=text(x.eventToken,30),p=text(x.protocolo,40).toUpperCase(),c=text(x.contato,180).toLowerCase();
 if(!eventToken||!p||!c)return res.status(400).json({ok:false,message:'Informe o QR do evento, protocolo e contato.'});
 const evs=await db.collection('eventosPublicos').where('checkinToken','==',eventToken).limit(1).get();
 if(evs.empty)return res.status(404).json({ok:false,message:'Evento de check-in não encontrado.'});
 const evDoc=evs.docs[0],ev=evDoc.data();
 const regs=await db.collection('inscricoes').where('protocolo','==',p).limit(1).get();
 if(regs.empty)return res.status(404).json({ok:false,message:'Inscrição não encontrada.'});
 const regDoc=regs.docs[0],r=regDoc.data();
 if(r.idEvento!==evDoc.id)return res.status(409).json({ok:false,message:'Esta inscrição pertence a outro evento.'});
 const matches=(r.email&&r.email===c)||(r.telefone&&digits(r.telefone)===digits(c));
 if(!matches)return res.status(403).json({ok:false,message:'Os dados informados não conferem com a inscrição.'});
 if(!['Confirmada','Presente'].includes(r.status))return res.status(409).json({ok:false,message:'Sua inscrição ainda não está confirmada pelo gestor.'});
 if(r.status!=='Presente')await regDoc.ref.set({status:'Presente',checkedInAt:stamp(),checkinOrigem:'QR_EVENTO',updatedAt:stamp()},{merge:true});
 res.json({ok:true,nome:r.nome||r.responsavel||'Participante',evento:ev.nome||'Atividade',status:'Presente'});
}));

exports.validateCertificate=onRequest({region:REGION,cors:false},wrap(async(req,res)=>{
 const code=text(body(req).code,40).toUpperCase();
 if(!code)return res.status(400).json({ok:false,message:'Informe o código do certificado.'});
 const snap=await db.collection('certificados').doc(code).get();
 if(!snap.exists)return res.status(404).json({ok:false,message:'Certificado não encontrado.'});
 const c=snap.data();
 res.json({ok:true,code,participantName:c.participantName||'',activityName:c.activityName||'',eventDateLabel:c.eventDateLabel||'',workloadLabel:c.workloadLabel||'',status:c.status||'Emitido',institution:c.institution||'',issuedAt:c.issuedAt||''});
}));

exports.gestorPendencias=onRequest({region:REGION,cors:false,secrets:[GESTOR_PUSH_KEY]},wrap(async(req,res)=>{
 if(!manager(req,res))return;const [s,i]=await Promise.all([db.collection('solicitacoes').orderBy('createdAt','desc').limit(200).get(),db.collection('inscricoes').orderBy('createdAt','desc').limit(200).get()]);
 const cv=snap=>snap.docs.map(d=>({id:d.id,...d.data(),createdAt:d.data().createdAt?.toDate?.().toISOString?.()||'',updatedAt:d.data().updatedAt?.toDate?.().toISOString?.()||''}));
 res.json({ok:true,solicitacoes:cv(s),inscricoes:cv(i)});
}));
exports.gestorAtualizarSolicitacao=onRequest({region:REGION,cors:false,secrets:[GESTOR_PUSH_KEY]},wrap(async(req,res)=>{if(!manager(req,res))return;const x=body(req),id=text(x.id,120),status=text(x.status,80);if(!id||!status)return res.status(400).json({ok:false,message:'Dados inválidos.'});await db.collection('solicitacoes').doc(id).set({status,updatedAt:stamp(),idEvento:x.idEvento||null},{merge:true});res.json({ok:true});}));
exports.gestorAtualizarInscricao=onRequest({region:REGION,cors:false,secrets:[GESTOR_PUSH_KEY]},wrap(async(req,res)=>{if(!manager(req,res))return;const x=body(req),id=text(x.id,120),status=text(x.status,80);if(!id||!status)return res.status(400).json({ok:false,message:'Dados inválidos.'});await db.collection('inscricoes').doc(id).set({status,updatedAt:stamp()},{merge:true});res.json({ok:true});}));
exports.gestorPublicarEvento=onRequest({region:REGION,cors:false,secrets:[GESTOR_PUSH_KEY]},wrap(async(req,res)=>{if(!manager(req,res))return;const e=body(req).evento||{},id=text(e.id,120)||db.collection('eventosPublicos').doc().id,doc={nome:text(e.nome,180),tipo:text(e.tipo,80),status:text(e.status,50)||'Confirmado',dataInicio:text(e.dataInicio,10),dataFim:text(e.dataFim,10),horaInicio:text(e.horaInicio,5),horaFim:text(e.horaFim,5),local:text(e.local,250),vagas:Math.max(0,Number(e.vagas)||0),checkinToken:text(e.checkinToken,20)||checkToken('E'),inscricoesAbertas:e.inscricoesAbertas!==false,publicadoOnline:true,dataLabel:text(e.dataLabel,40)||text(e.dataInicio,10),updatedAt:stamp()};await db.collection('eventosPublicos').doc(id).set(doc,{merge:true});res.json({ok:true,id});}));
exports.gestorPublicarCertificado=onRequest({region:REGION,cors:false,secrets:[GESTOR_PUSH_KEY]},wrap(async(req,res)=>{
 if(!manager(req,res))return;
 const c=body(req).certificado||{},code=text(c.code,40).toUpperCase();
 if(!code||!text(c.participantName,180)||!text(c.activityName,220))return res.status(400).json({ok:false,message:'Dados do certificado inválidos.'});
 const doc={code,participantName:text(c.participantName,180),activityName:text(c.activityName,220),eventDateLabel:text(c.eventDateLabel,60),workloadLabel:text(c.workloadLabel,60),institution:text(c.institution,220),status:text(c.status,40)||'Emitido',issuedAt:text(c.issuedAt,60),updatedAt:stamp()};
 await db.collection('certificados').doc(code).set(doc,{merge:true});res.json({ok:true,code});
}));
exports.gestorRevogarCertificado=onRequest({region:REGION,cors:false,secrets:[GESTOR_PUSH_KEY]},wrap(async(req,res)=>{
 if(!manager(req,res))return;const code=text(body(req).code,40).toUpperCase();
 if(!code)return res.status(400).json({ok:false,message:'Código obrigatório.'});
 await db.collection('certificados').doc(code).set({status:'Revogado',revokedAt:stamp(),updatedAt:stamp()},{merge:true});res.json({ok:true,code});
}));
exports.registerGestorToken=onRequest({region:REGION,cors:false,secrets:[GESTOR_PUSH_KEY]},wrap(async(req,res)=>{if(!manager(req,res))return;const x=body(req),token=text(x.token,4096);if(!token)return res.status(400).json({ok:false,message:'Token ausente.'});const id=crypto.createHash('sha256').update(token).digest('hex');await db.collection('gestorTokens').doc(id).set({token,userAgent:text(x.userAgent,500),updatedAt:stamp()},{merge:true});res.json({ok:true});}));

async function notifyGestores(title,body,url='./'){
 const snap=await db.collection('gestorTokens').limit(500).get(),tokens=snap.docs.map(d=>d.data().token).filter(Boolean);if(!tokens.length)return;
 const r=await admin.messaging().sendEachForMulticast({tokens,notification:{title,body},webpush:{fcmOptions:{link:url}}}),bad=[];
 r.responses.forEach((x,i)=>{if(!x.success&&['messaging/registration-token-not-registered','messaging/invalid-registration-token'].includes(x.error?.code))bad.push(snap.docs[i].ref.delete());});await Promise.all(bad);
}
exports.pushNovaSolicitacao=onDocumentCreated({document:'solicitacoes/{id}',region:REGION},async e=>{const x=e.data.data();await notifyGestores('Nova solicitação • Mobiliza Educa',(x.origemNome||x.solicitanteNome||'Solicitante')+' • '+(x.atividade||'Atendimento')+' • '+(x.quantidade||1)+' participante(s)','./?gestao=solicitacoes');});
exports.pushNovaInscricao=onDocumentCreated({document:'inscricoes/{id}',region:REGION},async e=>{const x=e.data.data();await notifyGestores('Nova inscrição • Mobiliza Educa',(x.nome||'Participante')+' • '+(x.quantidade||1)+' vaga(s) solicitada(s)','./?gestao=inscricoes');});
