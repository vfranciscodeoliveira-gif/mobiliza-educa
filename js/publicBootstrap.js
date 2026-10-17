// Bootstrap leve: não depende de Firebase, módulos administrativos nem engines de jogos.
import {audiences,games,learning} from './content.js?v=71';
const $=selector=>document.querySelector(selector);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cover=item=>item.cover?'<img src="'+esc(item.cover)+'" alt="" loading="lazy" style="width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:12px">':'';
const card=(item,label,view)=>'<article class="card public-boot-card">'+cover(item)+'<h3>'+esc(item.title)+'</h3><p>'+esc(item.description)+'</p><button class="btn secondary" type="button" data-public-view="'+view+'">'+label+'</button></article>';
const render=()=>{if(window.__mobilizaMainReady)return;
 const audiencesHost=$('#audienceGrid'),gamesHost=$('#gameGrid'),learnHost=$('#learningGrid');
 if(audiencesHost)audiencesHost.innerHTML=audiences.map(item=>card(item,'Conhecer conteúdo','publicos')).join('');
 if(gamesHost)gamesHost.innerHTML=games.map(item=>card(item,'Abrir jogos','jogos')).join('');
 if(learnHost)learnHost.innerHTML=learning.map(item=>card(item,'Ver trilhas','aprender')).join('');
 const tips=$('#tipText');if(tips)tips.textContent='No trânsito, atitudes responsáveis protegem vidas. Conheça os jogos e atividades educativas.';
 document.body.dataset.publicBoot='fallback';
};
document.addEventListener('DOMContentLoaded',()=>{queueMicrotask(render);});
window.addEventListener('error',e=>{const msg=String(e.message||'');if(/import|module|script|export/i.test(msg)){document.querySelector('#homeBootWarning')?.removeAttribute('hidden');}});
document.addEventListener('click',event=>{const button=event.target.closest('[data-public-view]');if(!button||window.__mobilizaMainReady)return;const name=button.dataset.publicView;document.querySelectorAll('.view').forEach(el=>el.classList.toggle('active',el.id==='view-'+name));document.querySelectorAll('.nav-item').forEach(el=>el.classList.toggle('active',el.dataset.view===name));window.scrollTo(0,0);});
