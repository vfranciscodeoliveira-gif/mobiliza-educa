import {onlineAccessEnabled,onlineUser,modulesForAccess} from './cloudAccess.js?v=1';
const USERS_KEY='mobiliza.security.users';
const PROFILES_KEY='mobiliza.security.profiles';
const AUDIT_KEY='mobiliza.security.audit';
const CONFIG_KEY='mobiliza.security.config';
const SESSION_KEY='mobiliza.security.session';
const LEGACY_HASH='mobiliza.admin.passwordHash';
const LEGACY_SALT='mobiliza.admin.passwordSalt';

export const ADMIN_MODULES=[
 'admin-dashboard','admin-cadastros','admin-eventos','admin-conteudo','admin-avaliacao',
 'admin-evidencias','admin-passaporte','admin-relatorios','admin-acessos','admin-sistema','admin-assinatura','admin-plataforma'
];
export const MODULE_LABELS={
 'admin-dashboard':'Dashboard',
 'admin-cadastros':'Pessoas e instituições',
 'admin-eventos':'Agenda, solicitações e inscrições',
 'admin-conteudo':'Conteúdo pedagógico',
 'admin-avaliacao':'Presença e avaliações',
 'admin-evidencias':'Evidências e impacto',
 'admin-passaporte':'Passaporte e certificados',
 'admin-relatorios':'Relatórios e indicadores',
 'admin-acessos':'Usuários, perfis e auditoria',
 'admin-sistema':'Configurações e backup',
 'admin-assinatura':'Produto e assinatura',
 'admin-plataforma':'Console do proprietário'
};
const DEFAULT_PROFILES=[
 {id:'GESTOR',name:'Gestor',description:'Acesso administrativo completo.',modules:[...ADMIN_MODULES],locked:true},
 {id:'EDUCADOR',name:'Educador',description:'Operação pedagógica, eventos, avaliações, evidências e relatórios.',modules:['admin-dashboard','admin-cadastros','admin-eventos','admin-conteudo','admin-avaliacao','admin-evidencias','admin-passaporte','admin-relatorios'],locked:false},
 {id:'OPERADOR',name:'Operador',description:'Cadastros, agenda, check-in, evidências e apoio operacional.',modules:['admin-dashboard','admin-cadastros','admin-eventos','admin-evidencias'],locked:false},
 {id:'CONSULTA',name:'Consulta',description:'Visualização de dashboard e relatórios consolidados.',modules:['admin-dashboard','admin-relatorios'],locked:false}
];
const now=()=>new Date().toISOString();
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,9);
const enc=s=>new TextEncoder().encode(s);
const hex=b=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
const safeJson=(k,f)=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(f))}catch{return f}};
const sessionJson=()=>{try{return JSON.parse(sessionStorage.getItem(SESSION_KEY)||'null')}catch{return null}};
const writeSession=s=>s?sessionStorage.setItem(SESSION_KEY,JSON.stringify(s)):sessionStorage.removeItem(SESSION_KEY);

export function securityConfig(){return{timeoutMinutes:30,maxFailed:5,lockMinutes:2,...safeJson(CONFIG_KEY,{})};}
export function setSecurityConfig(patch){const v={...securityConfig(),...patch};localStorage.setItem(CONFIG_KEY,JSON.stringify(v));recordAudit('SEGURANCA_CONFIG','seguranca','',`Sessão por inatividade: ${v.timeoutMinutes} min`);return v;}
export function listProfiles(){
 let rows=safeJson(PROFILES_KEY,[]);
 if(!rows.length){rows=DEFAULT_PROFILES.map(x=>({...x,modules:[...x.modules]}));localStorage.setItem(PROFILES_KEY,JSON.stringify(rows));}
 const gestor=rows.find(x=>x.id==='GESTOR');if(gestor){gestor.modules=[...ADMIN_MODULES];gestor.locked=true;}
 return rows;
}
export function saveProfileModules(profileId,modules){
 const rows=listProfiles(),p=rows.find(x=>x.id===profileId);if(!p)throw new Error('Perfil não encontrado.');
 if(p.id==='GESTOR')throw new Error('O perfil Gestor mantém acesso integral para evitar bloqueio administrativo.');
 p.modules=[...new Set((modules||[]).filter(x=>ADMIN_MODULES.includes(x)))];localStorage.setItem(PROFILES_KEY,JSON.stringify(rows));
 recordAudit('PERFIL_PERMISSOES','perfil',profileId,`${p.name}: ${p.modules.length} módulo(s)`);return p;
}
export function profileById(id){return listProfiles().find(x=>x.id===id)||listProfiles()[0];}

export function listUsers(){bootstrapSecurity();return safeJson(USERS_KEY,[]);}
function saveUsers(rows){localStorage.setItem(USERS_KEY,JSON.stringify(rows));}
export function bootstrapSecurity(){
 listProfiles();
 let users=safeJson(USERS_KEY,[]);
 if(!users.length&&localStorage.getItem(LEGACY_HASH)){
  users=[{id:'legacy-admin',name:'Administrador',username:'admin',profileId:'GESTOR',active:true,passwordHash:localStorage.getItem(LEGACY_HASH),passwordSalt:localStorage.getItem(LEGACY_SALT)||'',hashVersion:'legacy-sha256',createdAt:now(),migratedAt:now(),lastLoginAt:null,failedCount:0,lockedUntil:null,permissions:null}];
  saveUsers(users);
  localStorage.removeItem(LEGACY_HASH);
  localStorage.removeItem(LEGACY_SALT);
 }
 return users;
}
async function legacyDigest(password,salt){return hex(await crypto.subtle.digest('SHA-256',enc(salt+'|'+password)));}
async function pbkdf2Digest(password,salt){
 const base=await crypto.subtle.importKey('raw',enc(password),'PBKDF2',false,['deriveBits']);
 const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt:enc(salt),iterations:150000,hash:'SHA-256'},base,256);
 return hex(bits);
}
function randomSalt(){const a=new Uint32Array(6);crypto.getRandomValues(a);return [...a].map(x=>x.toString(16)).join('-');}
export async function hashPassword(password){const salt=randomSalt();return{passwordSalt:salt,passwordHash:await pbkdf2Digest(password,salt),hashVersion:'pbkdf2-150k'};}
export async function verifyPassword(user,password){
 if(user.hashVersion==='legacy-sha256')return(await legacyDigest(password,user.passwordSalt||''))===user.passwordHash;
 return(await pbkdf2Digest(password,user.passwordSalt||''))===user.passwordHash;
}
export async function createFirstManager({name,username,password}){
 const users=bootstrapSecurity();if(users.length)throw new Error('Já existe usuário administrativo.');
 const normalized=normalizeUsername(username);if(!normalized)throw new Error('Informe um usuário válido.');if(String(password||'').length<8)throw new Error('Use pelo menos 8 caracteres.');
 const h=await hashPassword(password),u={id:uid(),name:String(name||'Gestor').trim()||'Gestor',username:normalized,profileId:'GESTOR',active:true,...h,createdAt:now(),lastLoginAt:null,lastPasswordChangeAt:now(),failedCount:0,lockedUntil:null,permissions:null};
 saveUsers([u]);recordAudit('USUARIO_CRIADO','usuario',u.id,'Primeiro Gestor criado',u);return u;
}
export function normalizeUsername(v){return String(v||'').trim().toLowerCase().replace(/\s+/g,'.').replace(/[^a-z0-9._-]/g,'').slice(0,60);}
export async function createUser(data){
 const rows=listUsers(),username=normalizeUsername(data.username);if(!username)throw new Error('Informe um usuário válido.');if(rows.some(x=>x.username===username))throw new Error('Este usuário já existe.');
 if(String(data.password||'').length<8)throw new Error('A senha temporária deve ter pelo menos 8 caracteres.');
 const h=await hashPassword(data.password),u={id:uid(),name:String(data.name||'').trim(),username,profileId:data.profileId||'OPERADOR',active:data.active!==false,...h,createdAt:now(),lastLoginAt:null,lastPasswordChangeAt:now(),mustChangePassword:!!data.mustChangePassword,failedCount:0,lockedUntil:null,permissions:Array.isArray(data.permissions)?[...new Set(data.permissions)]:null};
 if(!u.name)throw new Error('Informe o nome do usuário.');rows.push(u);saveUsers(rows);recordAudit('USUARIO_CRIADO','usuario',u.id,`${u.name} • ${u.username} • ${u.profileId}`);return u;
}
export function updateUser(id,patch){
 const rows=listUsers(),u=rows.find(x=>x.id===id);if(!u)throw new Error('Usuário não encontrado.');
 if(id===currentUser()?.id&&patch.active===false)throw new Error('Você não pode desativar sua própria sessão.');
 const willRemainGestor=(patch.profileId??u.profileId)==='GESTOR'&&(patch.active??u.active)!==false;
 if(u.profileId==='GESTOR'&&u.active&&!willRemainGestor&&rows.filter(x=>x.id!==id&&x.active&&x.profileId==='GESTOR').length===0)throw new Error('Mantenha ao menos um Gestor ativo.');
 if(patch.username){const n=normalizeUsername(patch.username);if(rows.some(x=>x.id!==id&&x.username===n))throw new Error('Este usuário já existe.');patch.username=n;}
 Object.assign(u,patch,{updatedAt:now()});saveUsers(rows);recordAudit('USUARIO_ATUALIZADO','usuario',id,`${u.name} • ${u.profileId} • ${u.active?'ativo':'inativo'}`);return u;
}
export async function resetUserPassword(id,password,mustChange=true){
 if(String(password||'').length<8)throw new Error('Use pelo menos 8 caracteres.');
 const rows=listUsers(),u=rows.find(x=>x.id===id);if(!u)throw new Error('Usuário não encontrado.');
 Object.assign(u,await hashPassword(password),{lastPasswordChangeAt:now(),mustChangePassword:!!mustChange,failedCount:0,lockedUntil:null,updatedAt:now()});saveUsers(rows);recordAudit('SENHA_REDEFINIDA','usuario',id,`${u.name} • troca obrigatória: ${mustChange?'sim':'não'}`);return true;
}
export async function changeCurrentPassword(password){
 const u=currentUser();if(!u)throw new Error('Sessão não autenticada.');await resetUserPassword(u.id,password,false);return true;
}
export function getUser(id){return listUsers().find(x=>x.id===id)||null;}
export function currentUser(){
 if(onlineAccessEnabled())return onlineUser();
 const s=sessionJson();if(!s)return null;
 const users=safeJson(USERS_KEY,[]),u=users.find(x=>x.id===s.userId&&x.active);return u||null;
}
export function currentProfile(){const u=currentUser();return u?profileById(u.profileId):null;}
export function userModules(user){
 if(!user)return[];if(user._cloud)return modulesForAccess(user);if(user.profileId==='GESTOR')return[...ADMIN_MODULES];if(Array.isArray(user.permissions))return user.permissions.filter(x=>ADMIN_MODULES.includes(x));
 return profileById(user.profileId).modules||[];
}
export function canAccessModule(id,user=currentUser()){return !!user&&user.active&&userModules(user).includes(id);}
export function sessionState(){
 const s=sessionJson(),u=currentUser();if(onlineAccessEnabled())return {unlocked:!!u,user:u,expired:false};if(!s||!u)return{unlocked:false,user:null,expired:false};
 const timeout=securityConfig().timeoutMinutes*60000,expired=Date.now()-Number(s.lastActivity||0)>timeout;
 return{unlocked:!expired,user,expired,loginAt:s.loginAt,lastActivity:s.lastActivity};
}
export function startSession(user){
 const s={userId:user.id,loginAt:Date.now(),lastActivity:Date.now()};writeSession(s);
 const rows=listUsers(),u=rows.find(x=>x.id===user.id);if(u){u.lastLoginAt=now();u.failedCount=0;u.lockedUntil=null;saveUsers(rows);}
 recordAudit('LOGIN','sessao','',`Entrada de ${user.username}`,user);
 window.dispatchEvent(new CustomEvent('mobiliza-admin-auth',{detail:{unlocked:true,userId:user.id}}));return true;
}
export function touchSession(){
 const s=sessionJson();if(!s)return false;
 if(Date.now()-Number(s.lastActivity||0)<30000)return true;s.lastActivity=Date.now();writeSession(s);return true;
}
export function endSession(reason='manual'){
 const u=currentUser();if(u)recordAudit('LOGOUT','sessao','',reason==='timeout'?'Sessão encerrada por inatividade':'Saída do sistema',u);
 writeSession(null);window.dispatchEvent(new CustomEvent('mobiliza-admin-auth',{detail:{unlocked:false,reason}}));
}
export function markLoginFailure(username){
 const rows=listUsers(),u=rows.find(x=>x.username===normalizeUsername(username)),cfg=securityConfig();if(!u){recordAudit('LOGIN_FALHOU','sessao','',`Usuário inexistente: ${normalizeUsername(username)||'vazio'}`,{id:'',name:'Não autenticado',username:normalizeUsername(username)});return;}
 u.failedCount=Number(u.failedCount||0)+1;if(u.failedCount>=cfg.maxFailed){u.lockedUntil=new Date(Date.now()+cfg.lockMinutes*60000).toISOString();u.failedCount=0;}saveUsers(rows);recordAudit('LOGIN_FALHOU','sessao',u.id,`Tentativa inválida para ${u.username}`,u);
}
export function userLockRemaining(user){if(!user?.lockedUntil)return 0;return Math.max(0,new Date(user.lockedUntil).getTime()-Date.now());}
export function clearUserLock(id){const rows=listUsers(),u=rows.find(x=>x.id===id);if(u){u.failedCount=0;u.lockedUntil=null;saveUsers(rows);recordAudit('USUARIO_DESBLOQUEADO','usuario',id,u.name);}return u;}

export function listAudit(){return safeJson(AUDIT_KEY,[]);}
export function recordAudit(action,target='',recordId='',details='',actor=null,severity='info'){
 const u=actor||currentUser(),rows=safeJson(AUDIT_KEY,[]),entry={id:uid(),at:now(),action:String(action||'').slice(0,80),target:String(target||'').slice(0,80),recordId:String(recordId||'').slice(0,120),details:String(details||'').slice(0,1000),severity,userId:u?.id||'',userName:u?.name||'Não autenticado',username:u?.username||'',profileId:u?.profileId||'',device:navigator.userAgent.slice(0,240)};
 rows.unshift(entry);localStorage.setItem(AUDIT_KEY,JSON.stringify(rows.slice(0,3000)));window.dispatchEvent(new CustomEvent('mobiliza-audit-change',{detail:{entry}}));return entry;
}
export function auditDataWrite(entity,before,after){
 const a=Array.isArray(before)?before:[],b=Array.isArray(after)?after:[],ma=new Map(a.filter(x=>x?.id).map(x=>[String(x.id),x])),mb=new Map(b.filter(x=>x?.id).map(x=>[String(x.id),x]));
 const added=[...mb.keys()].filter(k=>!ma.has(k)),removed=[...ma.keys()].filter(k=>!mb.has(k)),changed=[...mb.keys()].filter(k=>ma.has(k)&&JSON.stringify(ma.get(k))!==JSON.stringify(mb.get(k)));
 const ids=[...added,...removed,...changed].slice(0,8),bits=[];if(added.length)bits.push(`${added.length} incluído(s)`);if(changed.length)bits.push(`${changed.length} alterado(s)`);if(removed.length)bits.push(`${removed.length} excluído(s)`);
 if(bits.length)recordAudit('DADOS_ALTERADOS',entity,ids.join(','),bits.join(' • '));
}
let genericAuditInstalled=false,lastGeneric='';
export function installSecurityGuards(){
 bootstrapSecurity();if(genericAuditInstalled)return;genericAuditInstalled=true;
 const activity=()=>touchSession();['pointerdown','keydown','touchstart'].forEach(ev=>window.addEventListener(ev,activity,{passive:true}));
 setInterval(()=>{const st=sessionState();if(st.expired)endSession('timeout');},30000);
 window.addEventListener('mobiliza-data-change',e=>{if(e.detail?.audited)return;const entity=e.detail?.entity||'dados',sig=entity+'|'+Math.floor(Date.now()/1500);if(sig===lastGeneric)return;lastGeneric=sig;recordAudit('DADOS_ATUALIZADOS',entity,e.detail?.id||'',e.detail?.action||'Alteração registrada pelo módulo.');});
}
export function auditCsv(){
 const rows=listAudit(),head='DataHora;Usuario;Login;Perfil;Acao;Entidade;Registro;Detalhes\n';
 return head+rows.map(x=>[new Date(x.at).toLocaleString('pt-BR'),x.userName,x.username,x.profileId,x.action,x.target,x.recordId,x.details].map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(';')).join('\n');
}
export function purgeAudit(keep=200){
 const rows=listAudit().slice(0,Math.max(0,keep));localStorage.setItem(AUDIT_KEY,JSON.stringify(rows));recordAudit('AUDITORIA_LIMPA','auditoria','',`Mantidos os ${keep} registros mais recentes.`);return rows.length;
}
