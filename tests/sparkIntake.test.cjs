const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const root=require('node:path').resolve(__dirname,'..');
const load=f=>fs.readFileSync(require('node:path').join(root,f),'utf8');
test('pedidos e inscrições utilizam identidade Firebase e gravação atômica',()=>{
 const c=load('js/directFirestore.js');
 assert.match(c,/signInAnonymously\(auth\)/);
 assert.match(c,/ownerUid:user\.uid/);
 assert.match(c,/fs\.writeBatch\(ctx\.db\)/);
 assert.match(c,/publicSubmissionId\(user\.uid\)/);
});
test('regras restringem criação e leitura por proprietário, gestor e data UTC',()=>{
 const r=load('firestore.rules');
 assert.match(r,/function intakeId\(id\)/);
 assert.match(r,/request\.auth\.uid \+ '_' \+ string\(int\(request\.time\.toMillis\(\) \/ 86400000\)\)/);
 assert.match(r,/request\.resource\.data\.ownerUid == request\.auth\.uid/);
 assert.match(r,/request\.resource\.data\.createdAt == request\.time/);
 assert.match(r,/allow get: if \(signedIn\(\) && resource\.data\.ownerUid == request\.auth\.uid\)/);
 assert.match(r,/allow create: if intakeId\(id\) && validPublicRequest/);
 assert.match(r,/allow create: if intakeId\(id\) && validPublicRegistration/);
 assert.match(r,/allow update: if permitted\(t,'events\.manage'\)/);
});
test('frontend informa condição para consultar protocolo',()=>{
 const s=load('js/modules/publicService.js');
 assert.match(s,/mesmo navegador e a mesma sessão/);
});
test('frontend não depende das Cloud Functions para recepção',()=>{
 const s=load('js/modules/publicService.js');
 assert.match(s,/submitSolicitacaoDireta/);
 assert.match(s,/submitInscricaoDireta/);
});
