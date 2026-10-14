const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const load=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
test('gravação atômica e sessão anônima',()=>{
 const s=load('js/directFirestore.js');
 assert.match(s,/signInAnonymously\(auth\)/);
 assert.match(s,/ownerUid:user\.uid/);
 assert.match(s,/fs\.writeBatch\(ctx\.db\)/);
 assert.match(s,/return uid;/);
});
test('regras preservam controle de administradores',()=>{
 const rules=load('firestore.rules');
 assert.match(rules,/function publicBase\(d\)/);
 assert.match(rules,/id == request\.auth\.uid/);
 assert.match(rules,/request\.resource\.data\.ownerUid == request\.auth\.uid/);
 assert.match(rules,/allow get: if signedIn\(\) && resource\.data\.ownerUid == request\.auth\.uid/);
 assert.match(rules,/allow update: if permitted\(t,'events\.manage'\)/);
 assert.equal((rules.match(/match \/publicStatuses\/\{id\}/g)||[]).length,1);
});
test('UI informa limitação ao usuário',()=>{
 const s=load('js/modules/publicService.js');
 assert.match(s,/mesmo navegador e a mesma sessão/);
 assert.match(s,/identidade Firebase/);
});
