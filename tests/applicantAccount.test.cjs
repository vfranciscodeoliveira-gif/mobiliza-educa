const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
test('cadastro preserva identidade anônima via vínculo de credencial',()=>{
 const s=read('js/modules/publicAccount.js');
 assert.match(s,/linkWithCredential\(user,api\.EmailAuthProvider\.credential\(email,data\.password\)\)/);
 assert.match(s,/createUserWithEmailAndPassword/);
 assert.match(s,/signInWithEmailAndPassword/);
 assert.match(s,/sendPasswordResetEmail/);
});
test('mudança de identidade anônima requer confirmação explícita',()=>{
 const s=read('js/modules/publicAccount.js');
 assert.match(s,/user\?\.isAnonymous&&!confirm/);
});
test('conta é apresentada antes do formulário público',()=>{
 const s=read('js/modules/publicService.js');
 assert.match(s,/id="psAccount"/);
 assert.match(s,/await refreshAccount\(\)/);
 assert.match(s,/renderApplicantAccount/);
});
test('consultar protocolo ainda exige permissão pelo uid',()=>{
 const s=read('firestore.rules');
 assert.match(s,/resource\.data\.ownerUid == request\.auth\.uid/);
});
