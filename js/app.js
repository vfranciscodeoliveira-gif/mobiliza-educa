import { games, audiences, learning, educatorModules, adminModules, tips } from './content.js';
import { openQuiz } from './modules/quiz.js';
import { openMilhao } from './modules/milhao.js';
import { openTrilha } from './modules/trilha.js';
import { openMemoria } from './modules/memoria.js';
import { openCruzadas } from './modules/cruzadas.js';
import { openCidade } from './modules/cidade.js';
import { openPlateia } from './modules/plateia.js';
import { openAdminModule } from './modules/admin.js';
import { ensureAdminAccess,isAdminUnlocked,lockAdmin } from './modules/auth.js';
import { renderHomeNotifications } from './modules/notifications.js';

const qs=s=>document.querySelector(s),qsa=s=>[...document.querySelectorAll(s)];
let deferredPrompt=null,tipIndex=0;

const moduleCard=(item,actionLabel='Abrir')=>`
<article class="module-card card ${item.image?'illustrated':''} ${item.accent?'accent-'+item.accent:''}">
  ${item.image?`<div class="module-cover"><img src="${item.image}" alt="" loading="lazy"><span class="cover-shine"></span></div>`:`<div class="module-icon" aria-hidden="true">${item.icon}</div>`}
  <div class="module-card-body">
    <h3>${item.title}</h3>
    <p>${item.description}</p>
    <div class="module-meta">${(item.tags||[]).map(t=>`<span class="chip">${t}</span>`).join('')}</div>
    <button class="btn ${item.ready?'primary':'ghost'}" data-module="${item.id}" ${item.disabled?'disabled':''}>${item.ready?actionLabel:'Em evolução'}</button>
  </div>
</article>`;

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
  else if(id==='cidade')openCidade(qs('#gameDialog'),qs('#gameHost'),updateResults);
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
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js?v=0.4.0'));
render();