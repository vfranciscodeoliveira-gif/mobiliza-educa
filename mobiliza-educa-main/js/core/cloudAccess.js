import {cloudConfig} from '../cloudConfig.js?v=3';
import {getCloudUser,cloudStoragePrefix,isCloudEmulatorMode} from './cloudAuth.js?v=3';
export const ACCESS_PERMISSIONS=['education.read','education.create','education.update','education.delete','certificates.emit','users.manage','events.read','events.manage','reports.read'];
export const ACCESS_LABELS={'education.read':'Consultar cadastros','education.create':'Cadastrar e importar','education.update':'Editar cadastros','education.delete':'Excluir cadastros','certificates.emit':'Emitir certificados','users.manage':'Gerenciar usuários do cliente','events.read':'Consultar agenda','events.manage':'Gerenciar agenda','reports.read':'Consultar relatórios'};
export const onlineAccessEnabled=()=>!!cloudConfig.directFirestore?.enabled||isCloudEmulatorMode();
let contextPromise,snapshot=null;
export const accessSnapshot=()=>snapshot;
export const clearOnlineAccess=()=>{snapshot=null;};
export const accessTenantId=()=>localStorage.getItem(cloudStoragePrefix()+'.tenantId')||'';
export function permissionAllowed(access,permission){return !!access&&(access.owner===true||(access.active===true&&(access.role==='GESTOR'||access.permissions?.includes(permission))));}
export function schoolAllowed(access,id){return !!access&&(access.owner===true||(access.active===true&&(access.allSchools===true||access.schoolIds?.includes(id))));}
export function modulesForAccess(a){if(!a?.active)return[];if(a.owner)return ['admin-dashboard','admin-cadastros','admin-eventos','admin-conteudo','admin-avaliacao','admin-evidencias','admin-passaporte','admin-relatorios','admin-acessos','admin-sistema','admin-assinatura','admin-plataforma'];const out=['admin-dashboard'];if(permissionAllowed(a,'education.read'))out.push('admin-cadastros');if(permissionAllowed(a,'certificates.emit'))out.push('admin-passaporte');if(a.allSchools&&permissionAllowed(a,'users.manage'))out.push('admin-acessos');if((a.allSchools||a.schoolIds?.length)&&permissionAllowed(a,'events.read'))out.push('admin-eventos');if((a.allSchools||a.schoolIds?.length)&&permissionAllowed(a,'reports.read'))out.push('admin-relatorios');return out;}
export async function accessDb(){if(!contextPromise)contextPromise=Promise.all([import('https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js'),import('https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js')]).then(([app,fs])=>{const db=fs.getFirestore(app.getApps().length?app.getApp():app.initializeApp(cloudConfig.firebaseWebConfig));if(isCloudEmulatorMode())fs.connectFirestoreEmulator(db,'127.0.0.1',8080);return{db,fs};});return contextPromise;}
export async function loadAccess(tenantId=accessTenantId()){
 const user=await getCloudUser();if(!user)throw new Error('Conecte sua conta Firebase para acessar os cadastros online.');
 const {db,fs}=await accessDb(),owner=await fs.getDocFromServer(fs.doc(db,'platformOwners',user.uid));
 let a={uid:user.uid,name:user.displayName||user.email,email:user.email,tenantId,active:false,owner:owner.exists()&&owner.data().active===true};
 if(a.owner)a={...a,active:true,allSchools:true,permissions:[...ACCESS_PERMISSIONS],role:'GESTOR'};
 else {
  const staff=await fs.getDocFromServer(fs.doc(db,'platformStaff',user.uid));const d=staff?.exists()?staff.data():null;
  if(d?.active===true&&(d.allClients===true||d.tenantIds?.includes(tenantId)))a={...a,...d,uid:user.uid,tenantId,owner:false,allSchools:true};
  else if(tenantId){const m=await fs.getDocFromServer(fs.doc(db,'tenants',tenantId,'members',user.uid));if(m.exists())a={...a,...m.data(),uid:user.uid,tenantId,owner:false};}
 }
 if(a.role==='GESTOR'&&a.active)a={...a,allSchools:true,permissions:[...ACCESS_PERMISSIONS]};
 if(tenantId===accessTenantId())snapshot=a;return a;
}
export async function requirePermission(permission,schoolId){const a=await loadAccess();if(!permissionAllowed(a,permission)||schoolId&&!schoolAllowed(a,schoolId))throw new Error('Seu usuário não possui permissão para esta ação ou escola.');return a;}
export async function listAccessTenants(){
 const user=await getCloudUser();if(!user)throw new Error('Entre com sua conta Firebase.');const {db,fs}=await accessDb(),o=await fs.getDocFromServer(fs.doc(db,'platformOwners',user.uid)),staff=o.exists()&&o.data().active===true?null:await fs.getDocFromServer(fs.doc(db,'platformStaff',user.uid));
 let ids=[];if(o.exists()&&o.data().active===true||staff?.exists()&&staff.data().active===true&&staff.data().allClients===true){const tenants=await fs.getDocsFromServer(fs.collection(db,'tenants'));const rows=tenants.docs.map(d=>({id:d.id,...d.data()}));if(o.exists()&&o.data().active===true){const id=cloudConfig.directFirestore?.tenantId;if(id&&!rows.some(t=>t.id===id))rows.push({id,name:'Mobiliza Educa'});}return rows;}
 if(staff?.exists()&&staff.data().active===true)ids.push(...staff.data().tenantIds||[]);
 const memberships=await fs.getDocsFromServer(fs.query(fs.collection(db,'memberships'),fs.where('uid','==',user.uid)));ids.push(...memberships.docs.filter(d=>d.data().active===true).map(d=>d.data().tenantId));
 const rows=[];for(const id of [...new Set(ids)]){const a=await loadAccess(id);if(!a.active)continue;const t=await fs.getDocFromServer(fs.doc(db,'tenants',id));if(t.exists())rows.push({id:t.id,...t.data()});else rows.push({id,name:id});}return rows;
}
export async function refreshOnlineAccess(){const rows=await listAccessTenants();let id=accessTenantId();if(!rows.some(t=>t.id===id)){id=rows[0]?.id||'';if(id)localStorage.setItem(cloudStoragePrefix()+'.tenantId',id);else localStorage.removeItem(cloudStoragePrefix()+'.tenantId');}const a=await loadAccess(id);window.dispatchEvent(new CustomEvent('mobiliza-admin-auth',{detail:{unlocked:a.active}}));return{access:a,tenants:rows};}
export function onlineUser(){const a=snapshot;return a?.active?{...a,id:a.uid,username:a.email,profileId:a.role||'PERSONALIZADO',_cloud:true}:null;}
window.addEventListener('mobiliza-cloud-auth',()=>{snapshot=null;});window.addEventListener('mobiliza-cloud-tenant',()=>{snapshot=null;});

