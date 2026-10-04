const DB_NAME='mobiliza-evidence-db',DB_VERSION=1,STORE='files';

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
export async function putEvidenceFile(id,file){
 if(!id||!file)throw new Error('Arquivo inválido.');
 await tx('readwrite',s=>s.put({id,blob:file,name:file.name||'',type:file.type||'',size:file.size||0,updatedAt:new Date().toISOString()}));
 return true;
}
export async function getEvidenceFile(id){
 const db=await openDb();
 return new Promise((resolve,reject)=>{
  const t=db.transaction(STORE,'readonly'),r=t.objectStore(STORE).get(id);
  r.onsuccess=()=>{const v=r.result;db.close();resolve(v||null)};r.onerror=()=>{db.close();reject(r.error||new Error('Arquivo não encontrado.'))};
 });
}
export async function deleteEvidenceFile(id){await tx('readwrite',s=>s.delete(id));return true;}
export async function clearEvidenceFiles(){
 const db=await openDb();return new Promise((resolve,reject)=>{const t=db.transaction(STORE,'readwrite');t.objectStore(STORE).clear();t.oncomplete=()=>{db.close();resolve(true)};t.onerror=()=>{db.close();reject(t.error)};});
}
export function blobToDataUrl(blob){
 return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(r.error);r.readAsDataURL(blob);});
}
export async function estimateEvidenceStorage(){
 if(navigator.storage?.estimate){const x=await navigator.storage.estimate();return{usage:x.usage||0,quota:x.quota||0};}
 return{usage:0,quota:0};
}
