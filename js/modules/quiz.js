import { getQuestionSet } from '../core/questionEngine.js?v=3';
import { SoundManager } from '../core/soundManager.js?v=1';
import { recordGameResult } from '../core/historyStore.js?v=1';

const AUD={
  criancas:['🧒','Crianças','5–12 anos',['criancas']],
  adolescentes:['🧑','Adolescentes','13–17 anos',['adolescentes']],
  adultos:['🚘','Adultos','18+',['adultos']],
  misto:['👥','Misto','todas as idades',['criancas','adolescentes','adultos']]
};
const DIF={
  facil:['🌱','Fácil',['facil']],
  medio:['🎯','Médio',['medio']],
  dificil:['🔥','Difícil',['dificil']],
  misto:['⚡','Misto',['facil','medio','dificil']]
};
const safe=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const nice=v=>String(v||'').replace(/-/g,' ').replace(/\b\w/g,m=>m.toUpperCase());

export function openQuiz(dialog,host,onFinish){
  let cfg={aud:'criancas',dif:'misto',count:10,time:25};
  let qs=[],i=0,score=0,correct=0,streak=0,best=0,locked=false,timer=null,left=0,started=0;
  SoundManager.play('open');

  const stop=()=>{if(timer){clearInterval(timer);timer=null}};
  dialog.addEventListener('close',stop,{once:true});

  function setup(){
    stop();
    host.innerHTML=`<section class="game lightning-quiz lightning-v2">
      <div class="lightning-setup-hero">
        <div class="lightning-setup-copy">
          <span class="lightning-kicker">⚡ QUIZ RELÂMPAGO 2.0</span>
          <h2>Escolha o desafio e teste seus reflexos no trânsito</h2>
          <p>Perguntas variadas, imagens, sons, cronômetro, sequência de acertos e explicações educativas.</p>
        </div>
        <div class="lightning-setup-art" role="img" aria-label="Cena educativa de trânsito"></div>
      </div>
      <div class="lightning-config-grid">
        <fieldset class="lightning-config"><legend>Público</legend><div class="lightning-choice-row">
          ${Object.entries(AUD).map(([k,v])=>`<button class="lightning-choice ${cfg.aud===k?'active':''}" type="button" data-k="aud" data-v="${k}"><span>${v[0]}</span><strong>${v[1]}</strong><small>${v[2]}</small></button>`).join('')}
        </div></fieldset>
        <fieldset class="lightning-config"><legend>Dificuldade</legend><div class="lightning-choice-row compact">
          ${Object.entries(DIF).map(([k,v])=>`<button class="lightning-choice ${cfg.dif===k?'active':''}" type="button" data-k="dif" data-v="${k}"><span>${v[0]}</span><strong>${v[1]}</strong></button>`).join('')}
        </div></fieldset>
        <fieldset class="lightning-config"><legend>Quantidade</legend><div class="lightning-segmented">
          ${[8,10,12,15].map(n=>`<button type="button" data-k="count" data-v="${n}" class="${cfg.count===n?'active':''}">${n}</button>`).join('')}
        </div></fieldset>
        <fieldset class="lightning-config"><legend>Tempo por pergunta</legend><div class="lightning-segmented">
          ${[15,25,35,0].map(n=>`<button type="button" data-k="time" data-v="${n}" class="${cfg.time===n?'active':''}">${n?n+'s':'Livre'}</button>`).join('')}
        </div></fieldset>
      </div>
      <div class="lightning-setup-footer">
        <span>🔀 O banco reduz repetições recentes sempre que possível.</span>
        <button class="btn primary lightning-start" type="button" id="startLightning">▶ COMEÇAR DESAFIO</button>
      </div>
    </section>`;
    host.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{
      const k=b.dataset.k,v=b.dataset.v;
      cfg[k]=(k==='count'||k==='time')?Number(v):v;
      SoundManager.play('click');
      setup();
    });
    host.querySelector('#startLightning').onclick=start;
  }

  function start(){
    qs=getQuestionSet({
      count:cfg.count,
      audiences:AUD[cfg.aud][3],
      difficulties:DIF[cfg.dif][2],
      recentScope:'game:quiz:'+cfg.aud+':'+cfg.dif,
      recentLimit:56
    });
    i=0;score=0;correct=0;streak=0;best=0;locked=false;started=Date.now();
    SoundManager.play('open');
    render();
  }

  function render(){
    stop();
    const q=qs[i],pct=Math.round(i/qs.length*100);
    host.innerHTML=`<section class="game lightning-quiz lightning-v2 playing">
      <div class="lightning-topbar">
        <div><span class="lightning-kicker">⚡ QUIZ RELÂMPAGO</span><strong>${AUD[cfg.aud][1]} • ${DIF[cfg.dif][1]}</strong></div>
        <div class="lightning-scoreboard"><span>⭐ <b>${score}</b></span><span>🔥 <b>${streak}</b></span><span id="lightningTimer" class="lightning-timer">${cfg.time?'⏱ '+cfg.time+'s':'⏱ Livre'}</span></div>
      </div>
      <div class="lightning-progress"><span style="width:${pct}%"></span></div>
      <div class="lightning-question-layout">
        <div class="lightning-question-image"><img src="${safe(q.image||'assets/ai/hero_area_escolar.webp')}" alt=""><div class="lightning-image-caption"><span>${nice(q.category)}</span><span>${nice(q.difficulty)}</span></div></div>
        <div class="lightning-question-copy"><div class="lightning-question-count">PERGUNTA ${i+1} DE ${qs.length}</div><h2>${safe(q.prompt)}</h2><p>Escolha uma alternativa.</p></div>
      </div>
      <div class="quiz-options lightning-options">
        ${q.options.map((x,n)=>`<button type="button" class="quiz-option lightning-option" data-answer="${n}"><span class="answer-letter">${String.fromCharCode(65+n)}</span><span>${safe(x)}</span></button>`).join('')}
      </div>
      <div id="feedback"></div>
    </section>`;
    host.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>answer(Number(b.dataset.answer),false));
    clock();
  }

  function clock(){
    if(!cfg.time)return;
    left=cfg.time;
    timer=setInterval(()=>{
      left--;
      const el=host.querySelector('#lightningTimer');
      if(el){el.textContent='⏱ '+left+'s';el.classList.toggle('danger',left<=5)}
      if(left<=5&&left>0)SoundManager.play('warning');
      if(left<=0){stop();answer(-1,true)}
    },1000);
  }

  function answer(n,timeout){
    if(locked)return;
    locked=true;stop();
    const q=qs[i],ok=n===q.correct;
    if(ok){
      correct++;streak++;best=Math.max(best,streak);
      score+=100+(cfg.time?Math.max(0,left*2):20)+Math.min(80,(streak-1)*15);
      SoundManager.play(streak>=3?'bonus':'correct');
    }else{streak=0;SoundManager.play(timeout?'timeout':'wrong')}
    host.querySelectorAll('[data-answer]').forEach((b,x)=>{
      b.disabled=true;
      if(x===q.correct)b.classList.add('is-correct');
      if(x===n&&!ok)b.classList.add('is-wrong');
    });
    const fb=host.querySelector('#feedback');
    fb.innerHTML=`<div class="quiz-feedback lightning-feedback ${ok?'good':'bad'}">
      <div class="lightning-feedback-title"><strong>${ok?'✅ Resposta correta!':timeout?'⏱ Tempo esgotado!':'❌ Resposta incorreta'}</strong><span>${ok?'Pontos somados':'Vamos revisar'}</span></div>
      <p>${safe(q.why)}</p>
      <div class="lightning-feedback-meta"><span>🧭 ${nice(q.category)}</span>${streak>=3?`<span>🔥 Sequência ${streak}</span>`:''}</div>
      <button type="button" class="btn primary" id="nextQuestion">${i===qs.length-1?'VER RESULTADO':'PRÓXIMA PERGUNTA →'}</button>
    </div>`;
    host.querySelector('#nextQuestion').onclick=()=>{SoundManager.play('next');i++;locked=false;i>=qs.length?finish():render()};
  }

  function finish(){
    stop();
    const pct=Math.round(correct/qs.length*100),secs=Math.round((Date.now()-started)/1000);
    const medal=pct>=90?'🏆':pct>=75?'🥇':pct>=55?'🥈':'🎯';
    host.innerHTML=`<section class="game lightning-quiz lightning-v2 result">
      <div class="lightning-result-hero"><div class="lightning-result-medal">${medal}</div><div><span class="lightning-kicker">RESULTADO FINAL</span><h2>${score} pontos</h2><p>${correct} acertos em ${qs.length} perguntas.</p></div></div>
      <div class="lightning-result-grid"><div><strong>${pct}%</strong><span>aproveitamento</span></div><div><strong>${best}</strong><span>melhor sequência</span></div><div><strong>${secs}s</strong><span>tempo total</span></div><div><strong>${qs.length-correct}</strong><span>para revisar</span></div></div>
      <div class="lightning-result-note">💡 Jogue novamente: o banco prioriza outras perguntas e embaralha as alternativas.</div>
      <div class="lightning-result-actions"><button type="button" class="btn primary" id="playAgain">🔁 JOGAR NOVAMENTE</button><button type="button" class="btn ghost" id="changeLightning">⚙️ ALTERAR DESAFIO</button></div>
    </section>`;
    const s=JSON.parse(localStorage.getItem('mobiliza.results')||'{"games":0,"correct":0,"answers":0,"best":0,"streak":0}');
    s.games=(s.games||0)+1;s.correct=(s.correct||0)+correct;s.answers=(s.answers||0)+qs.length;s.best=Math.max(s.best||0,score);s.streak=Math.max(s.streak||0,best);localStorage.setItem('mobiliza.results',JSON.stringify(s));
    recordGameResult({
      kind:'game',moduleId:'quiz',title:'Quiz Relâmpago',score,correct,answers:qs.length,durationSec:secs,
      audience:AUD[cfg.aud][1],difficulty:DIF[cfg.dif][1],status:'concluido',
      meta:{count:qs.length,timePerQuestion:cfg.time,bestStreak:best}
    });
    SoundManager.play(pct>=75?'celebrate':'finish');onFinish?.();
    host.querySelector('#playAgain').onclick=start;
    host.querySelector('#changeLightning').onclick=setup;
  }

  setup();
  if(!dialog.open)dialog.showModal();
}
