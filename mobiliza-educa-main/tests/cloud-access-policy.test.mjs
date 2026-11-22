import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
let source=(await readFile(new URL('../js/core/cloudAccess.js',import.meta.url),'utf8')).replace(/^import .*;\n/gm,'');
globalThis.window={addEventListener(){}};
const policy=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
test('permissões por ação não concedem exclusão ou gestão implícita',()=>{const a={active:true,role:'PERSONALIZADO',allSchools:false,schoolIds:['school'],permissions:['education.read','certificates.emit']};assert.equal(policy.permissionAllowed(a,'education.delete'),false);assert.equal(policy.permissionAllowed(a,'users.manage'),false);assert.equal(policy.schoolAllowed(a,'school'),true);assert.equal(policy.schoolAllowed(a,'other'),false);assert.deepEqual(policy.modulesForAccess(a),['admin-dashboard','admin-cadastros','admin-passaporte']);assert.equal(policy.permissionAllowed({...a,active:false},'certificates.emit'),false);});
test('administrador do sistema tem todos os módulos e escopos; usuário gestor não recebe console global',()=>{const owner={active:true,owner:true};assert.equal(policy.schoolAllowed(owner,'any'),true);assert.equal(policy.permissionAllowed(owner,'users.manage'),true);assert.ok(policy.modulesForAccess(owner).includes('admin-plataforma'));assert.ok(!policy.modulesForAccess({active:true,role:'GESTOR',allSchools:true}).includes('admin-plataforma'));});


test('responsável de escola recebe agenda e relatórios concedidos, sem gestão de usuários',()=>{const a={active:true,role:'PERSONALIZADO',allSchools:false,schoolIds:['s1'],permissions:['education.read','events.read','reports.read','certificates.emit','users.manage']};const modules=policy.modulesForAccess(a);assert.ok(modules.includes('admin-eventos'));assert.ok(modules.includes('admin-relatorios'));assert.ok(!modules.includes('admin-acessos'));assert.equal(policy.schoolAllowed(a,'s2'),false);});
