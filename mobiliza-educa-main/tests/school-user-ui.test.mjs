import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
const {JSDOM}=createRequire(process.env.ACL_TEST_NODE_MODULES+'/../package.json')('jsdom');
let source=(await readFile(new URL('../js/modules/cloudUsers.js',import.meta.url),'utf8')).replace(/^import .*;\n/gm,'');
source=`const ACCESS_PERMISSIONS=['education.read','education.create','education.update','education.delete','certificates.emit','users.manage','events.read','events.manage','reports.read'],ACCESS_LABELS={};const accessDb=async()=>({db:{},fs:globalThis.unitUserFs});const loadAccess=async()=>({uid:'owner',active:true,owner:true,allSchools:true});const permissionAllowed=()=>true;const refreshOnlineAccess=async()=>{};const listAccessTenants=async()=>[{id:'a',name:'Cliente'}];const getCloudTenantId=()=>'a';const setCloudTenantId=()=>{};const getCloudUser=async()=>({uid:'owner'});`+source;
const mod=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const tick=()=>new Promise(r=>setImmediate(r));
test('configuração da escola não concede todas as unidades nem poderes de exclusão ou gestão',async()=>{
 const dom=new JSDOM('<main></main>');globalThis.FormData=dom.window.FormData;let writes=[];
 globalThis.unitUserFs={collection:(_db,...p)=>p.join('/'),doc:(_db,...p)=>p.join('/'),serverTimestamp:()=>1,getDocsFromServer:async ref=>({docs:ref.endsWith('/schools')?[{id:'s1',data:()=>({nome:'Minha escola'})},{id:'s2',data:()=>({nome:'Outra escola'})}]:[]}),writeBatch:()=>({set:(ref,row)=>writes.push({ref,row}),commit:async()=>{}})};
 const host=dom.window.document.querySelector('main');await mod.renderCloudUsers(host);const form=host.querySelector('#cuForm');assert.equal(form.elements.allSchools.checked,false);host.querySelector('#cuSchoolPreset').click();assert.equal(form.elements.role.value,'PERSONALIZADO');assert.equal(form.elements.allSchools.checked,false);assert.equal(host.querySelector('[data-permission="users.manage"]').checked,false);assert.equal(host.querySelector('[data-permission="events.manage"]').checked,false);assert.equal(host.querySelector('[data-permission="education.delete"]').checked,false);assert.equal(host.querySelector('[data-permission="certificates.emit"]').checked,true);
 form.elements.uid.value='school-user';form.elements.name.value='Responsável';form.elements.email.value='escola@example.com';host.querySelector('[data-school="s1"]').checked=true;form.dispatchEvent(new dom.window.Event('submit',{cancelable:true}));await tick();await tick();assert.equal(writes.length,2);assert.deepEqual(writes[0].row.schoolIds,['s1']);assert.equal(writes[0].row.allSchools,false);assert.equal(writes[0].row.role,'PERSONALIZADO');assert.ok(writes[0].row.permissions.includes('events.read'));assert.equal(host.querySelector('#cuMessage').textContent,'Acesso salvo online.');
});
