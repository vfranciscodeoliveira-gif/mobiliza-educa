const {onRequest}=require('firebase-functions/v2/https');
const {onDocumentCreated}=require('firebase-functions/v2/firestore');
const {initializeApp}=require('firebase-admin/app');

initializeApp();

const {REGION,wrap}=require('./lib/core');
const publicApi=require('./lib/publicApi');
const adminApi=require('./lib/adminApi');
const ownerApi=require('./lib/ownerApi');

exports.bootstrapPlatformOwner=onRequest(
 {region:REGION,cors:false,secrets:[ownerApi.PLATFORM_BOOTSTRAP_KEY]},
 wrap(ownerApi.bootstrapPlatformOwner)
);

exports.me=onRequest({region:REGION,cors:false},wrap(ownerApi.me));
exports.tenantContext=onRequest({region:REGION,cors:false},wrap(ownerApi.tenantContext));
exports.planCatalog=onRequest({region:REGION,cors:false},wrap(ownerApi.planCatalog));
exports.ownerListTenants=onRequest({region:REGION,cors:false},wrap(ownerApi.ownerListTenants));
exports.ownerCreateTenant=onRequest({region:REGION,cors:false},wrap(ownerApi.ownerCreateTenant));
exports.ownerUpdateSubscription=onRequest({region:REGION,cors:false},wrap(ownerApi.ownerUpdateSubscription));
exports.ownerSetDefaultPublicTenant=onRequest({region:REGION,cors:false},wrap(ownerApi.ownerSetDefaultPublicTenant));

exports.submitSolicitacao=onRequest({region:REGION,cors:false},wrap(publicApi.submitSolicitacao));
exports.submitInscricao=onRequest({region:REGION,cors:false},wrap(publicApi.submitInscricao));
exports.publicEvents=onRequest({region:REGION,cors:false},wrap(publicApi.publicEvents));
exports.consultarProtocolo=onRequest({region:REGION,cors:false},wrap(publicApi.consultarProtocolo));
exports.checkinPublic=onRequest({region:REGION,cors:false},wrap(publicApi.checkinPublic));
exports.validateCertificate=onRequest({region:REGION,cors:false},wrap(publicApi.validateCertificate));

exports.gestorPendencias=onRequest({region:REGION,cors:false},wrap(adminApi.gestorPendencias));
exports.gestorAtualizarSolicitacao=onRequest({region:REGION,cors:false},wrap(adminApi.gestorAtualizarSolicitacao));
exports.gestorAtualizarInscricao=onRequest({region:REGION,cors:false},wrap(adminApi.gestorAtualizarInscricao));
exports.gestorPublicarEvento=onRequest({region:REGION,cors:false},wrap(adminApi.gestorPublicarEvento));
exports.gestorPublicarCertificado=onRequest({region:REGION,cors:false},wrap(adminApi.gestorPublicarCertificado));
exports.gestorRevogarCertificado=onRequest({region:REGION,cors:false},wrap(adminApi.gestorRevogarCertificado));
exports.registerGestorToken=onRequest({region:REGION,cors:false},wrap(adminApi.registerGestorToken));

exports.pushNovaSolicitacao=onDocumentCreated(
 {document:'tenants/{tenantId}/requests/{id}',region:REGION},
 async e=>{
  const x=e.data.data();
  await adminApi.notifyTenant(
   e.params.tenantId,
   'Nova solicitação • Mobiliza Educa',
   (x.origemNome||x.solicitanteNome||'Solicitante')+' • '+(x.atividade||'Atendimento')+' • '+(x.quantidade||1)+' participante(s)',
   './?gestao=solicitacoes'
  );
 }
);

exports.pushNovaInscricao=onDocumentCreated(
 {document:'tenants/{tenantId}/registrations/{id}',region:REGION},
 async e=>{
  const x=e.data.data();
  await adminApi.notifyTenant(
   e.params.tenantId,
   'Nova inscrição • Mobiliza Educa',
   (x.nome||'Participante')+' • '+(x.quantidade||1)+' vaga(s) solicitada(s)',
   './?gestao=inscricoes'
  );
 }
);
