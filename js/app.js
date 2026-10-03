import { games, audiences, audienceProfiles, experiences, learning, educatorModules, adminModules, tips } from './content.js?v=57';
import { openQuiz } from './modules/quiz.js?v=29';
import { openMilhao } from './modules/milhao.js?v=18';
import { openTrilha } from './modules/trilha.js?v=35';
import { openMemoria } from './modules/memoria.js?v=28';
import { openCruzadas } from './modules/cruzadas.js?v=31';
import { openEAgora } from './modules/eAgora.js?v=40';
import { openPlateia } from './modules/plateia.js?v=6';
import { openLearning } from './modules/learning.js?v=3';
import { openParticipantMode } from './modules/participant.js?v=3';
import { openExperience } from './modules/experiencias.js?v=46';
import { SoundManager } from './core/soundManager.js?v=1';
import { openAdminModule } from './modules/admin.js?v=6';
import { openEducatorModule } from './modules/educator.js?v=1';
import { renderResultsDashboard } from './modules/results.js?v=2';
import { ensureAdminAccess,isAdminUnlocked,lockAdmin } from './modules/auth.js';
import { renderHomeNotifications } from './modules/notifications.js?v=2';

const qs=s=>document.querySelector(s),qsa=s=>[...document.querySelectorAll(s)];
let deferredPrompt=null,tipIndex=0,currentAudience='criancas';

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
 const unlocked=isAdminUnlocked(),lock=qs('#btnAdminLock'),nav=qs('[data-view="gestao"]');
 if(lock)lock.hidden=!unlocked;
 if(nav)nav.innerHTML=unlocked?'🛠️ Gestão':'🔒 Gestão';
 renderHomeNotifications(qs('#homeNotifications'),qs('#authDialog'),updateAuthUI);
}
function render(){
 qs('#audienceGrid').innerHTML=audiences.map(x=>moduleCard(x,'Explorar')).join('');
 const tabs=qs('#audienceTabs'); if(tabs)tabs.innerHTML=audiences.map(x=>`<button class="audience-tab ${x.id===currentAudience?'active':''}" data-audience-tab="${x.id}">${x.icon} ${x.title}</button>`).join('');
 qs('#gameGrid').innerHTML=games.map(x=>moduleCard(x,'Jogar agora')).join('');
 qs('#learningGrid').innerHTML=learning.map(x=>moduleCard(x,'Começar')).join('');
 qs('#educatorGrid').innerHTML=educatorModules.map(x=>moduleCard(x,'Abrir módulo')).join('');
 qs('#adminGrid').innerHTML=adminModules.map(x=>moduleCard(x,'Abrir')).join('');
 const stat=qs('#statJogos'); if(stat) stat.textContent=games.length;
 bindModuleButtons();bindAudienceUI();bindGlobalSound();renderAudienceProfile(currentAudience);showTip(0);updateResults();updateAuthUI();
}
function navigate(view){
 qsa('.view').forEach(v=>v.classList.toggle('active',v.id===`view-${view}`));
 qsa('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.view===view));
 qs('#conteudo').focus();window.scrollTo({top:0,behavior:'smooth'});
}
function bindModuleButtons(){
 qsa('[data-module]').forEach(btn=>btn.addEventListener('click',async()=>{
  const id=btn.dataset.module;
  if(id==='quiz')openQuiz(qs('#gameDialog'),qs('#gameHost'),updateResults);
  else if(id==='milhao')openMilhao(qs('#gameDialog'),qs('#gameHost'),updateResults);
  else if(id==='trilha')openTrilha(qs('#gameDialog'),qs('#gameHost'),updateResults);
  else if(id==='memoria')openMemoria(qs('#gameDialog'),qs('#gameHost'),updateResults);
  else if(id==='cruzadas')openCruzadas(qs('#gameDialog'),qs('#gameHost'),updateResults);
  else if(id==='eagora')openEAgora(qs('#gameDialog'),qs('#gameHost'),updateResults);
  else if(id==='plateia')openPlateia(qs('#gameDialog'),qs('#gameHost'),updateResults);
  else if(educatorModules.some(x=>x.id===id))openEducatorModule(id,qs('#gameDialog'),qs('#gameHost'),updateResults);
  else if(learning.some(x=>x.id===id))openLearning(qs('#gameDialog'),qs('#gameHost'),id,updateResults);
  else if(audiences.some(x=>x.id===id)){currentAudience=id;navigate('publicos');renderAudienceProfile(id);}
  else if(adminModules.some(x=>x.id===id)){
   if(await ensureAdminAccess(qs('#authDialog'))){updateAuthUI();openAdminModule(id,qs('#adminDialog'),qs('#adminHost'),qs('#authDialog'));}
  }else if(!btn.disabled)alert('Este módulo está preparado para a próxima etapa funcional.');
 }));
}
function showTip(index){tipIndex=index%tips.length;qs('#tipTitle').textContent=tips[tipIndex].title;qs('#tipText').textContent=tips[tipIndex].text;}
function updateResults(){
 renderResultsDashboard(qs('#resultsDashboard'));
}

qsa('.nav-item').forEach(b=>b.addEventListener('click',async()=>{const view=b.dataset.view;if(view==='gestao'&&!isAdminUnlocked()){if(!(await ensureAdminAccess(qs('#authDialog'))))return;updateAuthUI();}navigate(view);}));
qsa('[data-go]').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.go)));
qs('#nextTip').addEventListener('click',()=>showTip(tipIndex+1));
qs('#btnContrast').addEventListener('click',()=>document.documentElement.classList.toggle('high-contrast'));
qs('#btnFont').addEventListener('click',()=>document.documentElement.classList.toggle('large-text'));
qs('#btnAdminLock').addEventListener('click',()=>{lockAdmin();navigate('inicio');updateAuthUI();});

window.addEventListener('mobiliza-admin-auth',updateAuthUI);
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
if('serviceWorker'in navigator)window.addEventListener('load',async()=>{try{const reg=await navigator.serviceWorker.register('./service-worker.js?v=0.36.0',{updateViaCache:'none'});await reg.update();}catch(e){console.warn('Service Worker:',e);}});
render();
const plateiaJoinCode=new URLSearchParams(location.search).get('plateia');
if(plateiaJoinCode)openParticipantMode(plateiaJoinCode);