import { games, audiences, audienceProfiles, experiences, learning, educatorModules, adminModules, tips } from './content.js?v=68';
import { openQuiz } from './modules/quiz.js?v=30';
import { openMilhao } from './modules/milhao.js?v=19';
import { openTrilha } from './modules/trilha.js?v=36';
import { openMemoria } from './modules/memoria.js?v=28';
import { openCruzadas } from './modules/cruzadas.js?v=31';
import { openEAgora } from './modules/eAgora.js?v=40';
import { openPlateia } from './modules/plateia.js?v=6';
import { openAtelier } from './modules/atelier.js?v=6';
import { openAtelierParticipant } from './modules/atelierParticipant.js?v=5';
import { openLearning } from './modules/learning.js?v=3';
import { openParticipantMode } from './modules/participant.js?v=3';
import { openExperience } from './modules/experiencias.js?v=46';
import { SoundManager } from './core/soundManager.js?v=1';
import { openAdminModule } from './modules/admin.js?v=32';
import { openEducatorModule } from './modules/educator.js?v=1';
import { renderResultsDashboard } from './modules/results.js?v=3';
import { ensureAdminAccess,isAdminUnlocked,lockAdmin,getCurrentAdminUser } from './modules/auth.js?v=3';
import { canAccessModule,installSecurityGuards } from './core/accessControl.js?v=2';
import { installTenantWorkspaceBridge,activeTenant } from './core/tenantRegistry.js?v=2';
import { adminModuleEntitlement } from './core/saasContext.js?v=2';
import { renderHomeNotifications } from './modules/notifications.js?v=12';
import { renderPublicService } from './modules/publicService.js?v=5';
import { syncCloudInbox,isCloudEmulatorMode } from './cloudGateway.js?v=6';
import { openPublicCheckin } from './modules/checkinPublic.js?v=3';
import { openCertificateValidation } from './modules/certValidation.js?v=3';
import { openPublicAssessment } from './modules/avaliacaoPublica.js?v=1';

const qs=s=>document.querySelector(s),qsa=s=>[...document.querySelectorAll(s)];
let deferredPrompt=null,tipIndex=0,currentAudience='criancas';

function installEmulatorBadge(){
 if(!isCloudEmulatorMode())return;
 document.title='[LOCAL] Mobiliza Educa';
 const old=document.getElementById('firebaseEmulatorBadge');if(old)return;
 const badge=document.createElement('div');
 badge.id='firebaseEmulatorBadge';
 badge.setAttribute('role','status');
 badge.textContent='🧪 MODO FIREBASE LOCAL • dados de teste • produção não é alterada';
 badge.style.cssText='padding:9px 14px;background:#fff3cd;color:#604800;border-bottom:1px solid #ead27a;font-weight:900;text-align:center;font-size:.82rem;letter-spacing:.02em';
 document.querySelector('.topbar')?.insertAdjacentElement('afterend',badge);
}

const moduleCard=(item,actionLabel='Abrir')=>{const image=item.cover||item.image||'';const visual=item.visual||'';const cover=image?`${image}?v=24`:'';return `
<article class="module-card card ${(image||visual)?'illustrated visual-card':''} ${item.accent?'accent-'+item.accent:''}">
  ${visual?`<div class="module-cover sprite-cover ${visual}" role="img" aria-label="${item.title}"><span class="cover-shine"></span><span class="module-cover-title">${item.icon||'🎮'} ${item.title}</span></div>`:image?`<div class="module-cover" style="--cover-image:url('${cover}')"><img src="${cover}" alt="${item.title}" loading="eager" decoding="async" onload="this.closest('.module-cover')?.classList.add('loaded')" onerror="this.closest('.module-cover')?.classList.add('cover-error')"><span class="cover-shine"></span><span class="module-cover-title">${item.icon||'🎮'} ${item.title}</span></div>`:`<div class="module-icon" aria-hidden="true">${item.icon}</div>`}
  <div class="module-card-body">
    <h3>${item.title}</h3>
    <p>${item.description}</p>
    <div class="module-meta">${(item.tags||[]).map(t=>`<span class="chip">${t}</span>`).join('')}</div>
    <button type="button" class="btn ${item.ready?'primary':'ghost'}" data-module="${item.id}" ${item.disabled?'disabled':''}>${item.ready?actionLabel:'Em evolução'}</button>
  </div>
</article>`;};


const audienceTrackCard=item=>`<article class="audience-track-card"><div class="track-icon">${item.icon}</div><div><span class="track-format">${item.format}</span><h4>${item.title}</h4><p>${item.text}</p></div></article>`;

const experienceCard=item=>`<article class="experience-card ${item.ready?'available':''}">${item.cover?`<div class="experience-visual experience-cover"><img src="${item.cover}?v=25" alt="${item.title}" loading="lazy"></div>`:item.visual?`<div class="experience-visual ${item.visual}" role="img" aria-label="${item.title}"></div>`:`<div class="experience-icon">${item.icon}</div>`}<div class="experience-copy"><span class="track-format">${item.format}</span><h4>${item.title}</h4><p>${item.description}</p><div class="module-meta">${item.audiences.map(a=>`<span class="chip">${audienceProfiles[a]?.title||a}</span>`).join('')}</div>${item.ready?`<button type="button" class="btn primary experience-open" data-experience="${item.id}">Experimentar agora</button>`:''}</div><span class="experience-status ${item.ready?'active':''}">${item.ready?'Disponível':'Em planejamento'}</span></article>`;

function renderAudienceProfile(id){
 currentAudience=id in audienceProfiles?id:'criancas';
 const p=audienceProfiles[currentAudience];
 const hero=qs('#audienceProfile');
 if(hero)hero.innerHTML=`<div class="profile-photo aud-${currentAudience}" role="img" aria-label="${p.title}"></div><div><p class="eyebrow">${p.eyebrow}</p><h3>${p.title}</h3><p>${p.intro}</p><div class="profile-highlights">${p.highlights.map(x=>`<span>${x}</span>`).join('')}</div></div>`;
 const grid=qs('#audienceTrackGrid');
 if(grid)grid.innerHTML=p.tracks.map(audienceTrackCard).join('');
 const exp=qs('#experienceGrid');
 if(exp){exp.innerHTML=experiences.filter(x=>x.audiences.includes(currentAudience)).map(experienceCard).join('');bindExperienceButtons();}
 qsa('[data-audience-tab]').forEach(b=>b.classList.toggle('active',b.dataset.audienceTab===currentAudience));
}

function bindExperienceButtons(){
 qsa('[data-experience]').forEach(b=>b.addEventListener('click',()=>openExperience(qs('#gameDialog'),qs('#gameHost'),b.dataset.experience,updateResults)));
}
function bindGlobalSound(){
 const b=qs('#btnSound');
 if(!b)return;
 const paint=()=>{const on=SoundManager.isEnabled();b.textContent=on?'🔊':'🔇';b.title=on?'Som ligado':'Som desligado';b.setAttribute('aria-label',on?'Desligar sons':'Ligar sons');b.classList.toggle('active',on)};
 paint();
 b.addEventListener('click',()=>{SoundManager.toggle();paint()});
}
function bindAudienceUI(){
 qsa('[data-audience-tab]').forEach(b=>b.addEventListener('click',()=>renderAudienceProfile(b.dataset.audienceTab)));
}

function updateAuthUI(){
 const unlocked=isAdminUnlocked(),user=getCurrentAdminUser(),lock=qs('#btnAdminLock'),openBtn=qs('#btnAdminOpen'),nav=qs('[data-view="gestao"]'),adminState=qs('#adminAccessState');
 if(openBtn){openBtn.hidden=!unlocked;openBtn.style.display=unlocked?'inline-flex':'none';openBtn.textContent='🛠️ Gestão';}
 if(lock){
  lock.hidden=!unlocked;
  lock.style.display=unlocked?'inline-flex':'none';
  lock.textContent=unlocked?'🚪 Sair • '+(user?.name||'Gestor'):'🚪 Sair';
  lock.title=unlocked?'Encerrar sessão de '+(user?.username||''):'';
 }
 if(nav){nav.innerHTML=unlocked?'🛠️ Gestão':'🔒 Gestão';nav.title=unlocked?'Organização: '+(activeTenant()?.name||'—'):'';}
 if(adminState){
  const tenantName=activeTenant()?.name||'—';
  adminState.innerHTML=unlocked
   ?'<div class="admin-session-line"><div><strong>✅ Centro de Gestão online liberado</strong><p>Usuário: <b>'+(user?.name||user?.username||'Gestor')+'</b> • Organização: <b>'+tenantName+'</b> • '+adminModules.length+' módulos administrativos disponíveis.</p></div><button class="btn danger" id="adminLogoutInline" type="button">🚪 Sair do gestor</button></div>'
   :'<strong>🔒 Centro de Gestão protegido</strong><p>Faça login como Gestor para liberar os módulos administrativos.</p>';
  const inlineLogout=qs('#adminLogoutInline');
  if(inlineLogout)inlineLogout.onclick=()=>{lockAdmin();navigate('inicio');updateAuthUI();};
 }
 qsa('#adminGrid [data-module]').forEach(btn=>{const permissionAllowed=!unlocked||canAccessModule(btn.dataset.module),plan=unlocked?adminModuleEntitlement(btn.dataset.module):{allowed:true,reason:''},allowed=permissionAllowed&&plan.allowed;btn.disabled=!allowed;btn.textContent=allowed?'Abrir':(!permissionAllowed?'Sem permissão':'Não incluído no plano');btn.title=!permissionAllowed?'Seu perfil não possui acesso.':(!plan.allowed?plan.reason:'');btn.closest('.module-card')?.classList.toggle('permission-disabled',!allowed);});
 renderHomeNotifications(qs('#homeNotifications'),qs('#authDialog'),updateAuthUI);
}
installTenantWorkspaceBridge();
installSecurityGuards();

function renderAdminGrid(force=false){
 const grid=qs('#adminGrid');
 if(!grid)return;
 if(force||!grid.children.length)grid.innerHTML=adminModules.map(x=>moduleCard(x,'Abrir')).join('');
}
function render(){
 qs('#audienceGrid').innerHTML=audiences.map(x=>moduleCard(x,'Explorar')).join('');
 const tabs=qs('#audienceTabs'); if(tabs)tabs.innerHTML=audiences.map(x=>`<button class="audience-tab ${x.id===currentAudience?'active':''}" data-audience-tab="${x.id}">${x.icon} ${x.title}</button>`).join('');
 qs('#gameGrid').innerHTML=games.map(x=>moduleCard(x,'Jogar agora')).join('');
 qs('#learningGrid').innerHTML=learning.map(x=>moduleCard(x,'Começar')).join('');
 qs('#educatorGrid').innerHTML=educatorModules.map(x=>moduleCard(x,'Abrir módulo')).join('');
 renderAdminGrid();
 const stat=qs('#statJogos'); if(stat) stat.textContent=games.length;
 bindModuleButtons();bindAudienceUI();bindGlobalSound();renderAudienceProfile(currentAudience);renderPublicService(qs('#publicServiceHost'));showTip(0);updateResults();updateAuthUI();
}
function navigate(view){
 if(view==='gestao'){renderAdminGrid(false);bindModuleButtons();updateAuthUI();}
 qsa('.view').forEach(v=>v.classList.toggle('active',v.id===`view-${view}`));
 qsa('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.view===view));
 qs('#conteudo').focus();window.scrollTo({top:0,behavior:'smooth'});
}
function bindModuleButtons(){
 qsa('[data-module]').forEach(btn=>{
  if(btn.dataset.mobilizaBound==='1')return;
  btn.dataset.mobilizaBound='1';
  btn.addEventListener('click',async()=>{
  const id=btn.dataset.module;
  if(id==='quiz')openQuiz(qs('#gameDialog'),qs('#gameHost'),updateResults);
  else if(id==='milhao')openMilhao(qs('#gameDialog'),qs('#gameHost'),updateResults);
  else if(id==='trilha')openTrilha(qs('#gameDialog'),qs('#gameHost'),updateResults);
  else if(id==='memoria')openMemoria(qs('#gameDialog'),qs('#gameHost'),updateResults);
  else if(id==='cruzadas')openCruzadas(qs('#gameDialog'),qs('#gameHost'),updateResults);
  else if(id==='eagora')openEAgora(qs('#gameDialog'),qs('#gameHost'),updateResults);
  else if(id==='plateia')openPlateia(qs('#gameDialog'),qs('#gameHost'),updateResults);
  else if(id==='atelier')openAtelier(qs('#gameDialog'),qs('#gameHost'),updateResults);
  else if(educatorModules.some(x=>x.id===id))openEducatorModule(id,qs('#gameDialog'),qs('#gameHost'),updateResults);
  else if(learning.some(x=>x.id===id))openLearning(qs('#gameDialog'),qs('#gameHost'),id,updateResults);
  else if(audiences.some(x=>x.id===id)){currentAudience=id;navigate('publicos');renderAudienceProfile(id);}
  else if(adminModules.some(x=>x.id===id)){
   if(await ensureAdminAccess(qs('#authDialog'))){updateAuthUI();openAdminModule(id,qs('#adminDialog'),qs('#adminHost'),qs('#authDialog'));}
  }else if(!btn.disabled)alert('Este módulo está preparado para a próxima etapa funcional.');
  });
 });
}
function showTip(index){tipIndex=index%tips.length;qs('#tipTitle').textContent=tips[tipIndex].title;qs('#tipText').textContent=tips[tipIndex].text;}
function updateResults(){
 renderResultsDashboard(qs('#resultsDashboard'));
}

qsa('.nav-item').forEach(b=>b.addEventListener('click',async()=>{const view=b.dataset.view;if(view==='gestao'){location.href='./admin.html';return;}navigate(view);}));
qsa('[data-go]').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.go)));
qs('#adminDialogClose')?.addEventListener('click',()=>qs('#adminDialog')?.close());
qs('#nextTip').addEventListener('click',()=>showTip(tipIndex+1));
qs('#btnContrast').addEventListener('click',()=>document.documentElement.classList.toggle('high-contrast'));
qs('#btnFont').addEventListener('click',()=>document.documentElement.classList.toggle('large-text'));
qs('#btnAdminOpen')?.addEventListener('click',()=>{location.href='./admin.html';});
qs('#btnAdminLock').addEventListener('click',()=>{lockAdmin();navigate('inicio');updateAuthUI();});

window.addEventListener('mobiliza-admin-auth',e=>{updateAuthUI();if(e.detail?.unlocked===false&&qs('#view-gestao')?.classList.contains('active'))navigate('inicio');});
window.addEventListener('mobiliza-open-gestao',()=>{location.href='./admin.html';});
window.addEventListener('mobiliza-plan-change',updateAuthUI);
window.addEventListener('mobiliza-data-change',()=>{renderHomeNotifications(qs('#homeNotifications'),qs('#authDialog'),updateAuthUI);updateResults();});
window.addEventListener('mobiliza-learning-progress',updateResults);
window.addEventListener('mobiliza-educador-change',updateResults);
window.addEventListener('mobiliza-history-change',updateResults);
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;qs('#btnInstall').hidden=false;});
qs('#btnInstall').addEventListener('click',async()=>{if(!deferredPrompt)return;deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;qs('#btnInstall').hidden=true;});
function network(){qs('#networkStatus').textContent=navigator.onLine?'● online':'● offline';}
window.addEventListener('online',network);window.addEventListener('offline',network);network();
const gameDialog=qs('#gameDialog');
const gameHost=qs('#gameHost');
const closeGame=()=>{if(!gameDialog?.open)return;gameDialog.dataset.closing='1';gameDialog.close();gameDialog.dataset.closing='';};
qs('#closeGameDialog')?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();closeGame();});
gameDialog?.addEventListener('cancel',e=>{e.preventDefault();});
gameDialog?.addEventListener('click',e=>{e.stopPropagation();});
gameHost?.addEventListener('click',e=>e.stopPropagation());
if('serviceWorker'in navigator)window.addEventListener('load',async()=>{try{if(isCloudEmulatorMode()){const regs=await navigator.serviceWorker.getRegistrations();await Promise.all(regs.map(r=>r.unregister()));return;}const reg=await navigator.serviceWorker.register('./service-worker.js?v=0.56.0',{updateViaCache:'none'});await reg.update();}catch(e){console.warn('Service Worker:',e);}});
const cloudRefresh=()=>syncCloudInbox().catch(()=>{});window.addEventListener('focus',cloudRefresh);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')cloudRefresh();});
installEmulatorBadge();
render();
const assessmentInvite=new URLSearchParams(location.search).get('a')||new URLSearchParams(location.search).get('avaliar');
if(assessmentInvite)openPublicAssessment(assessmentInvite);
const certCode=new URLSearchParams(location.search).get('cert');
if(certCode)openCertificateValidation(certCode);
const checkinToken=new URLSearchParams(location.search).get('checkin');
if(checkinToken)openPublicCheckin(checkinToken);
const plateiaJoinCode=new URLSearchParams(location.search).get('plateia');
if(plateiaJoinCode)openParticipantMode(plateiaJoinCode);
const atelierJoinCode=new URLSearchParams(location.search).get('atelier');
if(atelierJoinCode)openAtelierParticipant(atelierJoinCode);
