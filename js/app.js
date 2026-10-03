import { games, audiences, learning, educatorModules, adminModules, tips } from './content.js?v=40';
import { openQuiz } from './modules/quiz.js?v=24';
import { openMilhao } from './modules/milhao.js?v=14';
import { openTrilha } from './modules/trilha.js?v=31';
import { openMemoria } from './modules/memoria.js?v=27';
import { openCruzadas } from './modules/cruzadas.js?v=30';
import { openPlateia } from './modules/plateia.js';
import { openAdminModule } from './modules/admin.js';
import { ensureAdminAccess,isAdminUnlocked,lockAdmin } from './modules/auth.js';
import { renderHomeNotifications } from './modules/notifications.js';

const qs=s=>document.querySelector(s),qsa=s=>[...document.querySelectorAll(s)];
let deferredPrompt=null,tipIndex=0;

const moduleCard=(item,actionLabel='Abrir')=>{const image=item.cover||item.image||'';const cover=image?`${image}?v=24`:'';return `
<article class="module-card card ${image?'illustrated':''} ${item.accent?'accent-'+item.accent:''}">
  ${image?`<div class="module-cover" style="--cover-image:url('${cover}')"><img src="${cover}" alt="${item.title}" loading="eager" decoding="async" onload="this.closest('.module-cover')?.classList.add('loaded')" onerror="this.closest('.module-cover')?.classList.add('cover-error')"><span class="cover-shine"></span><span class="module-cover-title">${item.icon||'🎮'} ${item.title}</span></div>`:`<div class="module-icon" aria-hidden="true">${item.icon}</div>`}
  <div class="module-card-body">
    <h3>${item.title}</h3>
    <p>${item.description}</p>
    <div class="module-meta">${(item.tags||[]).map(t=>`<span class="chip">${t}</span>`).join('')}</div>
    <button type="button" class="btn ${item.ready?'primary':'ghost'}" data-module="${item.id}" ${item.disabled?'disabled':''}>${item.ready?actionLabel:'Em evolução'}</button>
  </div>
</article>`;};

function updateAuthUI(){
 const unlocked=isAdminUnlocked(),lock=qs('#btnAdminLock'),nav=qs('[data-view="gestao"]');
 if(lock)lock.hidden=!unlocked;
 if(nav)nav.innerHTML=unlocked?'🛠️ Gestão':'🔒 Gestão';
 renderHomeNotifications(qs('#homeNotifications'),qs('#authDialog'),updateAuthUI);
}
function render(){
 qs('#audienceGrid').innerHTML=audiences.map(x=>moduleCard(x,'Explorar')).join('');
 qs('#gameGrid').innerHTML=games.map(x=>moduleCard(x,'Jogar agora')).join('');
 qs('#learningGrid').innerHTML=learning.map(x=>moduleCard(x,'Começar')).join('');
 qs('#educatorGrid').innerHTML=educatorModules.map(x=>moduleCard(x,'Abrir módulo')).join('');
 qs('#adminGrid').innerHTML=adminModules.map(x=>moduleCard(x,'Abrir')).join('');
 const stat=qs('#statJogos'); if(stat) stat.textContent=games.length;
 bindModuleButtons();showTip(0);updateResults();updateAuthUI();
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
  else if(id==='plateia')openPlateia(qs('#gameDialog'),qs('#gameHost'),updateResults);
  else if(adminModules.some(x=>x.id===id)){
   if(await ensureAdminAccess(qs('#authDialog'))){updateAuthUI();openAdminModule(id,qs('#adminDialog'),qs('#adminHost'),qs('#authDialog'));}
  }else if(!btn.disabled)alert('Este módulo está preparado para a próxima etapa funcional.');
 }));
}
function showTip(index){tipIndex=index%tips.length;qs('#tipTitle').textContent=tips[tipIndex].title;qs('#tipText').textContent=tips[tipIndex].text;}
function updateResults(){
 const s=JSON.parse(localStorage.getItem('mobiliza.results')||'{"games":0,"correct":0,"answers":0,"best":0,"streak":0}');
 qs('#localPartidas').textContent=s.games||0;
 qs('#localAcertos').textContent=s.answers?`${Math.round((s.correct/s.answers)*100)}%`:'0%';
 qs('#localRecorde').textContent=s.best||0;
 qs('#localStreak').textContent=s.streak||0;
}

qsa('.nav-item').forEach(b=>b.addEventListener('click',async()=>{const view=b.dataset.view;if(view==='gestao'&&!isAdminUnlocked()){if(!(await ensureAdminAccess(qs('#authDialog'))))return;updateAuthUI();}navigate(view);}));
qsa('[data-go]').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.go)));
qs('#nextTip').addEventListener('click',()=>showTip(tipIndex+1));
qs('#btnContrast').addEventListener('click',()=>document.documentElement.classList.toggle('high-contrast'));
qs('#btnFont').addEventListener('click',()=>document.documentElement.classList.toggle('large-text'));
qs('#btnAdminLock').addEventListener('click',()=>{lockAdmin();navigate('inicio');updateAuthUI();});

window.addEventListener('mobiliza-admin-auth',updateAuthUI);
window.addEventListener('mobiliza-data-change',()=>renderHomeNotifications(qs('#homeNotifications'),qs('#authDialog'),updateAuthUI));
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
if('serviceWorker'in navigator)window.addEventListener('load',async()=>{try{const reg=await navigator.serviceWorker.register('./service-worker.js?v=0.17.1',{updateViaCache:'none'});await reg.update();}catch(e){console.warn('Service Worker:',e);}});
render();