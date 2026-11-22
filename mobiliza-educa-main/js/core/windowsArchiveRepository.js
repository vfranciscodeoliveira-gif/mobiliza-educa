import {accessDb,requirePermission} from './cloudAccess.js?v=1';
import {getCloudTenantId} from '../cloudGateway.js?v=6';
import {archivePayload} from './windowsIntegralPolicy.js?v=1';
async function context(permission,tenant){const access=await requirePermission(permission);if(!access.allSchools||getCloudTenantId()!==tenant)throw new Error('Cliente alterado ou sem acesso a todas as escolas. Reabra a agenda.');return {access,...await accessDb()};}
function current(tenant){if(getCloudTenantId()!==tenant)throw new Error('Cliente alterado. Reabra a agenda.');}
export async function saveWindowsArchive(pack,mappings,tenant,onProgress=()=>{}){
 const {hash,chunks}=await archivePayload(pack,mappings),{access,db,fs}=await context('events.manage',tenant);
 const manifest=fs.doc(db,'tenants',tenant,'windowsArchives',hash);
 const found=await fs.getDocFromServer(manifest);current(tenant);if(found.exists())return hash;
 for(let i=0;i<chunks.length;i++){
  current(tenant);onProgress(`Preservando histórico: parte ${i+1} de ${chunks.length}...`);
  const ref=fs.doc(db,'tenants',tenant,'windowsArchiveChunks',hash+'-'+i);
  await fs.runTransaction(db,async tx=>{const old=await tx.get(ref);current(tenant);if(old.exists()){if(old.data().data!==chunks[i])throw new Error('Histórico divergente.');return;}tx.set(ref,{tenantId:tenant,archiveId:hash,index:i,data:chunks[i],createdBy:access.uid,createdAt:fs.serverTimestamp()});});
 }
 current(tenant);
 await fs.runTransaction(db,async tx=>{const old=await tx.get(manifest);current(tenant);if(old.exists())return;tx.set(manifest,{tenantId:tenant,banco:pack.banco,versao:Number(pack.versao),chunks:chunks.length,agendamentos:pack.tabelas.tblAgendaEvento.length,createdBy:access.uid,createdAt:fs.serverTimestamp()});});
 return hash;
}
export async function listWindowsArchives(tenant){const {db,fs}=await context('events.read',tenant);const s=await fs.getDocsFromServer(fs.collection(db,'tenants',tenant,'windowsArchives'));current(tenant);return s.docs.map(d=>({...d.data(),id:d.id}));}
export async function loadWindowsArchive(hash,tenant){
 if(!/^[a-f0-9]{64}$/.test(hash))throw new Error('Histórico inválido.');
 const {db,fs}=await context('events.read',tenant),manifest=await fs.getDocFromServer(fs.doc(db,'tenants',tenant,'windowsArchives',hash));current(tenant);
 if(!manifest.exists())throw new Error('Histórico não encontrado.');const count=manifest.data().chunks;if(!Number.isInteger(count)||count<1||count>110)throw new Error('Histórico inválido.');
 const out=[];for(let i=0;i<count;i++){const snap=await fs.getDocFromServer(fs.doc(db,'tenants',tenant,'windowsArchiveChunks',hash+'-'+i));current(tenant);if(!snap.exists())throw new Error('Histórico incompleto. Reimporte o arquivo original.');out.push(snap.data().data);}
 const value=JSON.parse(out.join(''));const check=await archivePayload(value.pack,value.mappings);if(check.hash!==hash)throw new Error('Falha de integridade do histórico.');return value;
}
