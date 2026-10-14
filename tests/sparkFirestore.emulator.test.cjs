const {before,after,test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {initializeTestEnvironment,assertSucceeds,assertFails}=require('@firebase/rules-unit-testing');
const {doc,setDoc,getDoc,updateDoc,writeBatch,serverTimestamp,collection,query,where,getDocs}=require('firebase/firestore');
let env;
const tenant='mobiliza-educa';
const pathFor=(col,id)=>'tenants/'+tenant+'/'+col+'/'+id;
const p='SOL-20261014-ABCDEF0123456789ABCDEF01';
const request=(uid,proto=p)=>({tenantId:tenant,ownerUid:uid,protocolo:proto,status:'Recebida',origemTipo:'Escola',origemNome:'Escola Teste',solicitanteNome:'Responsavel Teste',telefone:'(18) 99999-9999',email:'teste@example.org',atividade:'Palestra',dataPreferida:'2026-10-24',horaPreferida:'09:00',flexibilidade:'Data/horario fixos',quantidade:20,publico:'2 ano',local:'Escola',necessidades:'',createdAt:serverTimestamp(),updatedAt:serverTimestamp()});
const status=(uid,proto=p)=>({tenantId:tenant,ownerUid:uid,protocolo:proto,status:'Recebida',tipo:'Solicitação',createdAt:serverTimestamp(),updatedAt:serverTimestamp()});
before(async()=>{
 env=await initializeTestEnvironment({projectId:'demo-mobiliza-educa',firestore:{host:'127.0.0.1',port:8080,rules:fs.readFileSync(path.resolve(__dirname,'../firestore.rules'),'utf8')}});
 await env.withSecurityRulesDisabled(async ctx=>{
  const db=ctx.firestore();
  await setDoc(doc(db,pathFor('members','gestor1')),{uid:'gestor1',tenantId:tenant,active:true,role:'GESTOR',permissions:[],allSchools:true,schoolIds:[]});
  await setDoc(doc(db,pathFor('publicEvents','evt1')),{tenantId:tenant,nome:'Oficina Teste',status:'Confirmado',publicadoOnline:true,inscricoesAbertas:true});
 });
});
after(async()=>{if(env)await env.cleanup();});
test('solicitação e protocolo: lote válido cria ambos',async()=>{
 const db=env.authenticatedContext('visitor1').firestore(),b=writeBatch(db);
 b.set(doc(db,pathFor('requests','visitor1')),request('visitor1'));
 b.set(doc(db,pathFor('publicStatuses',p)),status('visitor1'));
 await assertSucceeds(b.commit());
 const x=await assertSucceeds(getDoc(doc(db,pathFor('publicStatuses',p))));
 assert.equal(x.data().status,'Recebida');
});
test('visitante diferente não consulta protocolo nem solicitação',async()=>{
 const db=env.authenticatedContext('visitor2').firestore();
 await assertFails(getDoc(doc(db,pathFor('publicStatuses',p))));
 await assertFails(getDoc(doc(db,pathFor('requests','visitor1'))));
});
test('criação isolada, falsificação de dono e duplicação são recusadas',async()=>{
 const db=env.authenticatedContext('visitor3').firestore();
 await assertFails(setDoc(doc(db,pathFor('requests','visitor3')),request('visitor3','SOL-20261014-1234567890ABCDEF12345678')));
 await assertFails(setDoc(doc(db,pathFor('requests','random-id')),request('visitor3')));
 const b=writeBatch(db);b.set(doc(db,pathFor('requests','visitor3')),request('victim'));b.set(doc(db,pathFor('publicStatuses','SOL-20261014-1234567890ABCDEF12345678')),status('visitor3','SOL-20261014-1234567890ABCDEF12345678'));
 await assertFails(b.commit());
});
test('gestor autorizado lê pedido e altera só o status',async()=>{
 const db=env.authenticatedContext('gestor1').firestore();
 const record=doc(db,pathFor('requests','visitor1'));
 await assertSucceeds(getDoc(record));
 await assertSucceeds(updateDoc(record,{status:'Agendada',updatedAt:serverTimestamp()}));
 await assertFails(updateDoc(record,{email:'changed@example.org',updatedAt:serverTimestamp()}));
 const stat=doc(db,pathFor('publicStatuses',p));
 await assertSucceeds(updateDoc(stat,{status:'Agendada',updatedAt:serverTimestamp()}));
});
test('visitante não altera status',async()=>{
 const db=env.authenticatedContext('visitor1').firestore();
 await assertFails(updateDoc(doc(db,pathFor('requests','visitor1')),{status:'Concluída',updatedAt:serverTimestamp()}));
});
test('somente eventos publicados aparecem para visitante autenticado',async()=>{
 const db=env.authenticatedContext('visitor4').firestore();
 await assertSucceeds(getDocs(query(collection(db,'tenants',tenant,'publicEvents'),where('publicadoOnline','==',true))));
 await assertFails(getDocs(collection(db,'tenants',tenant,'publicEvents')));
});
