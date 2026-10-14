// Regression checks for the public request/registration transport.
// Run: node --test tests/publicServiceRouting.test.cjs
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

test('public forms use server-backed API, not anonymous direct Firestore writes',()=>{
 const publicService=read('js/modules/publicService.js');
 for(const line of [
  'const sendRequest=data=>submitSolicitacao(data);',
  'const sendRegistration=data=>submitInscricao(data);',
  'const lookupProtocol=(p,c)=>consultarProtocolo(p,c);',
  'const loadEvents=()=>listPublicEvents();'
 ])assert.ok(publicService.includes(line), 'Missing: '+line);
 assert.doesNotMatch(publicService,/const sendRequest=data=>directMode\(\)/);
 assert.doesNotMatch(publicService,/const sendRegistration=data=>directMode\(\)/);
});

test('cloud base URL points at regional Firebase Functions and exports all endpoints',()=>{
 const config=read('js/cloudConfig.js');
 const gateway=read('js/cloudGateway.js');
 const index=read('firebase/functions/index.js');
 assert.match(config,/southamerica-east1-mobiliza-educa\.cloudfunctions\.net/);
 for(const name of ['submitSolicitacao','submitInscricao','consultarProtocolo','publicEvents']){
  assert.ok(index.includes('exports.'+name+'='),'Missing deployed handler '+name);
  assert.ok(gateway.includes("api('"+name+"'"),'Missing gateway '+name);
 }
});

test('Firestore denies anonymous direct request writes',()=>{
 const rules=read('firestore.rules');
 for(const col of ['requests','registrations']){
  assert.match(rules,new RegExp('match /'+col+'/\\{id\\}\\{[^\\n]*allow write: if false;'));
 }
});

test('public-facing UI does not claim an unverified database write succeeded',()=>{
 const ui=read('js/modules/publicService.js');
 assert.doesNotMatch(ui,/Envio online ativo pelo Firestore/);
 assert.match(ui,/O protocolo só será apresentado depois da confirmação/);
});

test('GitHub Pages cache references current frontend bundle',()=>{
 const html=read('index.html'),sw=read('service-worker.js'),app=read('js/app.js');
 assert.match(html,/js\/app\.js\?v=113/);
 assert.match(sw,/js\/app\.js\?v=113/);
 assert.match(app,/modules\/publicService\.js\?v=6/);
 assert.match(sw,/modules\/publicService\.js\?v=6/);
});
