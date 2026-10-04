import {activeTenantId} from './tenantRegistry.js?v=1';

const DB_NAME='mobiliza-evidence-db',DB_VERSION=1,STORE='files';
function tenantId(){try{return activeTenantId()}catch{return'legacy'}}

function openDb(){
 return new Promise((resolve,reject)=>{
  if(!('indexedDB'in window)){reject(new Error('IndexedDB não disponível neste navegador.'));return;}
  const req=indexedDB.open(DB_NAME,DB_VERSION);
  req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE,{keyPath:'id'});};
  req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error||new Error('Falha ao abrir o armazenamento de evidências.'));
 });
}
function tx(mode,fn){
 return openDb().then(db=>new Promise((resolve,reject)=>{
  const t=db.transaction(STORE,mode),s=t.objectStore(STORE);let out;
  try{out=fn(s);}catch(e){reject(e);return;}
  t.oncomplete=()=>{db.close();resolve(out)};t.onerror=()=>{db.close();reject(t.error||new Error('Falha no armazenamento.'))};t.onabort=()=>{db.close();reject(t.error||new Error('Operação cancelada.'))};
 }));
}
async function rawGet(id){
 const db=await openDb();return new Promise((resolve,reject)=>{const t=db.transaction(STORE,'readonly'),r=t.objectStore(STORE).get(id);r.onsuccess=()=>{const v=r.result;db.close();resolve(v||null)};r.onerror=()=>{db.close();reject(r.error||new Error('Arquivo não encontrado.'))};});
}
async function rawAll(){
 const db=await openDb();return new Promise((resolve,reject)=>{const t=db.transaction(STORE,'readonly'),r=t.objectStore(STORE).getAll();r.onsuccess=()=>{const v=r.result||[];db.close();resolve(v)};r.onerror=()=>{db.close();reject(r.error||new Error('Falha ao listar evidências.'))};});
}
async function migrateLegacy(records,current){
 const legacy=(records||[]).filter(x=>!x.tenantId);if(!legacy.length)return records;
 await tx('readwrite',s=>legacy.forEach(x=>s.put({...x,tenantId:current,tenantMigratedAt:new Date().toISOString()})));
 return records.map(x=>x.tenantId?x:{...x,tenantId:current});
}
export async function putEvidenceFile(id,file){
 if(!id||!file)throw new Error('Arquivo inválido.');
 await tx('readwrite',s=>s.put({id,tenantId:tenantId(),blob:file,name:file.name||'',type:file.type||'',size:file.size||0,updatedAt:new Date().toISOString()}));return true;
}
export async function getEvidenceFile(id){
 const current=tenantId(),v=await rawGet(id);if(!v)return null;
 if(!v.tenantId){const migrated={...v,tenantId:current,tenantMigratedAt:new Date().toISOString()};await tx('readwrite',s=>s.put(migrated));return migrated;}
 return v.tenantId===current?v:null;
}
export async function deleteEvidenceFile(id){
 const v=await rawGet(id);if(v&&v.tenantId&&v.tenantId!==tenantId())throw new Error('Arquivo pertence a outra organização.');
 await tx('readwrite',s=>s.delete(id));return true;
}
export async function clearEvidenceFiles(){
 const current=tenantId(),all=await rawAll();await tx('readwrite',s=>all.filter(x=>(x.tenantId||current)===current).forEach(x=>s.delete(x.id)));return true;
}
export async function clearAllEvidenceFiles(){await tx('readwrite',s=>s.clear());return true;}
export function blobToDataUrl(blob){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(r.error);r.readAsDataURL(blob);});}
export async function estimateEvidenceStorage(){if(navigator.storage?.estimate){const x=await navigator.storage.estimate();return{usage:x.usage||0,quota:x.quota||0};}return{usage:0,quota:0};}
export async function listEvidenceFiles(){
 const current=tenantId(),all=await migrateLegacy(await rawAll(),current);return all.filter(x=>x.tenantId===current);
}
export async function listAllEvidenceFiles(){
 const current=tenantId();return migrateLegacy(await rawAll(),current);
}
export async function putEvidenceRecord(record){
 if(!record?.id||!record?.blob)throw new Error('Registro de evidência inválido.');
 await tx('readwrite',s=>s.put({...record,tenantId:record.tenantId||tenantId()}));return true;
}
