const {before,after,test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {initializeTestEnvironment,assertSucceeds,assertFails}=require('@firebase/rules-unit-testing');
const {doc,getDoc,setDoc,updateDoc,serverTimestamp}=require('firebase/firestore');
let env;
const eventPath='publicInvites/lorena-15';
const fixture=(pub=false,uid='owner-test')=>({
 titulo:'Lorena • 15 anos',mensagem:'Vamos celebrar!',data:'2027-02-27',horario:'',
 local:'',endereco:'',dressCode:'',presentes:'',presentesUrl:'',encerramento:'Obrigada',
 habilitarRsvp:false,publicado:pub,cover:'',photos:[],estilo:'encantado',paleta:'lilas',
 corFundo:'#20163b',corDestaque:'#f7ce87',corTitulo:'#ffbce9',
 fundo:'estrelas',fonte:'caligrafia',animacoes:true,updatedBy:uid,updatedAt:serverTimestamp()
});
before(async()=>{
 env=await initializeTestEnvironment({
  projectId:'demo-mobiliza-educa',
  firestore:{host:'127.0.0.1',port:8080,rules:fs.readFileSync(path.join(__dirname,'../firestore.rules'),'utf8')}
 });
 await env.withSecurityRulesDisabled(async ctx=>{
  const db=ctx.firestore();
  await setDoc(doc(db,'platformOwners/owner-test'),{active:true});
  await setDoc(doc(db,'platformOwners/inactive-test'),{active:false});
 });
});
after(async()=>{if(env)await env.cleanup();});
test('proprietario ativo consegue consultar convite antes do primeiro cadastro',async()=>{
 const db=env.authenticatedContext('owner-test').firestore();
 const snapshot=await assertSucceeds(getDoc(doc(db,eventPath)));
 assert.equal(snapshot.exists(),false);
 await assertFails(getDoc(doc(env.unauthenticatedContext().firestore(),eventPath)));
});
test('visitante e contas nao autorizadas nao criam convites',async()=>{
 await assertFails(setDoc(doc(env.unauthenticatedContext().firestore(),eventPath),fixture()));
 await assertFails(setDoc(doc(env.authenticatedContext('visitor-test').firestore(),eventPath),fixture(false,'visitor-test')));
 await assertFails(setDoc(doc(env.authenticatedContext('inactive-test').firestore(),eventPath),fixture(false,'inactive-test')));
});
test('proprietario ativo cria rascunho, mas visitantes nao leem',async()=>{
 const db=env.authenticatedContext('owner-test').firestore();
 await assertSucceeds(setDoc(doc(db,eventPath),fixture()));
 await assertFails(getDoc(doc(env.unauthenticatedContext().firestore(),eventPath)));
 await assertFails(getDoc(doc(env.authenticatedContext('visitor-test').firestore(),eventPath)));
 await assertSucceeds(getDoc(doc(db,eventPath)));
});
test('somente proprietario ativo publica e visitante pode ler',async()=>{
 const db=env.authenticatedContext('owner-test').firestore();
 await assertSucceeds(updateDoc(doc(db,eventPath),{publicado:true,updatedBy:'owner-test',updatedAt:serverTimestamp()}));
 await assertSucceeds(getDoc(doc(env.unauthenticatedContext().firestore(),eventPath)));
 await assertSucceeds(getDoc(doc(env.authenticatedContext('visitor-test').firestore(),eventPath)));
 await assertFails(updateDoc(doc(env.authenticatedContext('visitor-test').firestore(),eventPath),{titulo:'Ataque'}));
});
test('validacao rejeita campo inesperado e cor invalida',async()=>{
 const db=env.authenticatedContext('owner-test').firestore();
 await assertFails(updateDoc(doc(db,eventPath),{superAdmin:true,updatedBy:'owner-test',updatedAt:serverTimestamp()}));
 await assertFails(updateDoc(doc(db,eventPath),{corFundo:'javascript:alert(1)',updatedBy:'owner-test',updatedAt:serverTimestamp()}));
});
test('proprietario pode recolher convite publicado e leitura publica cessa',async()=>{
 const db=env.authenticatedContext('owner-test').firestore();
 await assertSucceeds(updateDoc(doc(db,eventPath),{publicado:false,updatedBy:'owner-test',updatedAt:serverTimestamp()}));
 await assertFails(getDoc(doc(env.unauthenticatedContext().firestore(),eventPath)));
});
