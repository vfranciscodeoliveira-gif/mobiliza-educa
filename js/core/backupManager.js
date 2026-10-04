import {listEvidenceFiles,listAllEvidenceFiles,putEvidenceRecord,clearEvidenceFiles,clearAllEvidenceFiles} from './evidenceStore.js?v=3';
import {snapshotActiveTenant} from './tenantRegistry.js?v=1';

const APP_VERSION='0.47.0';
const FORMAT='MOBILIZA_BACKUP';
const SCHEMA=3;
const OPERATIONAL_EXCLUDE=['mobiliza.security.','mobiliza.platform.','mobiliza.saas.','mobiliza.cloud.','mobiliza.admin.password'];
const enc=s=>new TextEncoder().encode(s);
const dec=b=>new TextDecoder().decode(b);
const now=()=>new Date().toISOString();

function stable(v){
 if(Array.isArray(v))return '['+v.map(stable).join(',')+']';
 if(v&&typeof v==='object')return '{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+stable(v[k])).join(',')+'}';
 return JSON.stringify(v);
}
function hex(buf){return[...new Uint8Array(buf)].map(x=>x.toString(16).padStart(2,'0')).join('');}
async function sha256(text){return hex(await crypto.subtle.digest('SHA-256',enc(text)));}
function bytesToB64(bytes){
 let out='',u=bytes instanceof Uint8Array?bytes:new Uint8Array(bytes),step=0x8000;
 for(let i=0;i<u.length;i+=step)out+=String.fromCharCode(...u.subarray(i,i+step));
 return btoa(out);
}
function b64ToBytes(s){const bin=atob(s),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return u;}
function blobToB64(blob){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result).split(',')[1]||'');r.onerror=()=>reject(r.error);r.readAsDataURL(blob);});}
function jsonMaybe(s){try{return JSON.parse(s)}catch{return null}}
function localKeys(scope='operational'){
 const keys=[];
 for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(!k||!k.startsWith('mobiliza.'))continue;if(scope==='operational'&&OPERATIONAL_EXCLUDE.some(p=>k.startsWith(p)))continue;keys.push(k);}
 return keys.sort();
}
function statsFromStorage(obj){
 const stats={keys:Object.keys(obj||{}).length,collections:0,records:0,bytes:0};
 for(const [k,v] of Object.entries(obj||{})){stats.bytes+=String(v||'').length;const x=jsonMaybe(v);if(Array.isArray(x)){stats.collections++;stats.records+=x.length;}}
 return stats;
}
function mergeValue(current,imported){
 const a=jsonMaybe(current),b=jsonMaybe(imported);
 if(Array.isArray(a)&&Array.isArray(b)){
  const canId=[...a,...b].every(x=>x&&typeof x==='object'&&'id'in x);
  if(canId){const m=new Map(a.map(x=>[String(x.id),x]));b.forEach(x=>m.set(String(x.id),x));return JSON.stringify([...m.values()]);}
  return JSON.stringify([...a,...b]);
 }
 if(a&&b&&typeof a==='object'&&typeof b==='object'&&!Array.isArray(a)&&!Array.isArray(b))return JSON.stringify({...a,...b});
 return imported;
}

export async function buildBackup({scope='operational',includeEvidenceFiles=false}={}){
 if(scope==='full')snapshotActiveTenant();
 const storage={};for(const k of localKeys(scope))storage[k]=localStorage.getItem(k);
 const evidence=[];
 if(includeEvidenceFiles){
  const files=scope==='full'?await listAllEvidenceFiles():await listEvidenceFiles();
  for(const f of files)evidence.push({id:f.id,tenantId:f.tenantId||null,name:f.name||'',type:f.type||'',size:f.size||f.blob?.size||0,updatedAt:f.updatedAt||'',data:await blobToB64(f.blob)});
 }
 const payload={format:FORMAT,schema:SCHEMA,appVersion:APP_VERSION,createdAt:now(),scope,storage,evidenceFiles:evidence};
 const checksum=await sha256(stable(payload));
 return{payload,checksum,stats:{...statsFromStorage(storage),evidenceFiles:evidence.length,evidenceBytes:evidence.reduce((s,x)=>s+Number(x.size||0),0)}};
}
export async function exportOperationalBackup(){
 const built=await buildBackup({scope:'operational',includeEvidenceFiles:false});
 return JSON.stringify({format:FORMAT,container:'plain',schema:SCHEMA,checksum:built.checksum,payload:built.payload},null,2);
}
async function deriveKey(passphrase,salt){
 const base=await crypto.subtle.importKey('raw',enc(passphrase),'PBKDF2',false,['deriveKey']);
 return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:200000,hash:'SHA-256'},base,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
}
export async function exportProtectedBackup(passphrase,{includeEvidenceFiles=true}={}){
 if(String(passphrase||'').length<10)throw new Error('Use uma senha de backup com pelo menos 10 caracteres.');
 const built=await buildBackup({scope:'full',includeEvidenceFiles});
 const inner=JSON.stringify({checksum:built.checksum,payload:built.payload});
 const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12)),key=await deriveKey(passphrase,salt);
 const cipher=await crypto.subtle.encrypt({name:'AES-GCM',iv},key,enc(inner));
 const wrapper={format:FORMAT,container:'aes-gcm',schema:SCHEMA,kdf:'PBKDF2-SHA256',iterations:200000,salt:bytesToB64(salt),iv:bytesToB64(iv),ciphertext:bytesToB64(cipher),createdAt:built.payload.createdAt,appVersion:APP_VERSION};
 return{json:JSON.stringify(wrapper),stats:built.stats};
}
export function inspectBackupContainer(text){
 let x;try{x=JSON.parse(text)}catch{throw new Error('Arquivo JSON inválido.');}
 if(x?.format!==FORMAT)throw new Error('Este arquivo não é um backup reconhecido do Mobiliza Educa.');
 return{encrypted:x.container==='aes-gcm',container:x.container||'plain',schema:x.schema||1,createdAt:x.createdAt||x.payload?.createdAt||'',appVersion:x.appVersion||x.payload?.appVersion||'',scope:x.payload?.scope||((x.container==='aes-gcm')?'full':'operational')};
}
export async function parseBackup(text,passphrase=''){
 let x;try{x=JSON.parse(text)}catch{throw new Error('Arquivo JSON inválido.');}
 if(x?.format!==FORMAT)throw new Error('Backup incompatível ou sem assinatura Mobiliza Educa.');
 let pack=x;
 if(x.container==='aes-gcm'){
  if(!passphrase)throw new Error('Informe a senha deste backup protegido.');
  try{
   const key=await deriveKey(passphrase,b64ToBytes(x.salt)),plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:b64ToBytes(x.iv)},key,b64ToBytes(x.ciphertext));
   pack=JSON.parse(dec(plain));
  }catch{throw new Error('Não foi possível abrir o backup. Confira a senha e a integridade do arquivo.');}
 }
 const payload=pack.payload,checksum=pack.checksum;
 if(!payload||payload.format!==FORMAT)throw new Error('Conteúdo de backup inválido.');
 if(Number(payload.schema||0)>SCHEMA)throw new Error('Este backup foi criado por uma versão mais nova e não pode ser restaurado com segurança.');
 const actual=await sha256(stable(payload));if(actual!==checksum)throw new Error('Falha na verificação de integridade. O arquivo pode estar corrompido ou alterado.');
 const stats={...statsFromStorage(payload.storage||{}),evidenceFiles:(payload.evidenceFiles||[]).length,evidenceBytes:(payload.evidenceFiles||[]).reduce((s,x)=>s+Number(x.size||0),0)};
 return{payload,checksum,stats};
}
export async function restoreBackup(parsed,{mode='replace',restoreEvidenceFiles=true}={}){
 const p=parsed?.payload;if(!p?.storage)throw new Error('Backup sem dados restauráveis.');
 const keys=Object.keys(p.storage);
 if(mode==='replace'){
  const scope=p.scope||'operational';
  for(const k of localKeys(scope==='full'?'full':'operational'))if(!(k in p.storage))localStorage.removeItem(k);
 }
 for(const [k,v] of Object.entries(p.storage)){
  if(mode==='merge'&&localStorage.getItem(k)!=null)localStorage.setItem(k,mergeValue(localStorage.getItem(k),v));else localStorage.setItem(k,v);
 }
 let files=0;
 if(restoreEvidenceFiles&&(p.evidenceFiles||[]).length){
  if(mode==='replace'){if(p.scope==='full')await clearAllEvidenceFiles();else await clearEvidenceFiles();}
  for(const f of p.evidenceFiles){const blob=new Blob([b64ToBytes(f.data)],{type:f.type||'application/octet-stream'});await putEvidenceRecord({id:f.id,tenantId:f.tenantId||undefined,blob,name:f.name||'',type:f.type||'',size:blob.size,updatedAt:f.updatedAt||now()});files++;}
 }
 return{keys:keys.length,evidenceFiles:files,mode};
}
export async function storageEstimate(){
 const local={bytes:0,keys:localStorage.length};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);local.bytes+=String(k||'').length+String(localStorage.getItem(k)||'').length;}
 let quota={usage:0,quota:0};if(navigator.storage?.estimate)quota=await navigator.storage.estimate();
 return{localBytes:local.bytes,localKeys:local.keys,usage:quota.usage||0,quota:quota.quota||0};
}
export function backupFilename(kind='operacional'){const d=new Date().toISOString().slice(0,19).replace(/[:T]/g,'-');return'mobiliza-educa-'+kind+'-'+d+'.json';}
