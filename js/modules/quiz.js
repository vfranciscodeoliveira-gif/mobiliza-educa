import { getGameQuestions } from '../core/questionEngine.js?v=2';
import { SoundManager } from '../core/soundManager.js?v=1';


export function openQuiz(dialog,host,onFinish){
  const questions=getGameQuestions('quiz',8).map(x=>({image:x.image,q:x.prompt,a:x.options,correct:x.correct,why:x.why,id:x.id}));
  let i=0,score=0,correct=0,streak=0,bestStreak=0,locked=false;
  SoundManager.play('open');
  function render(){
    const q=questions[i];
    host.innerHTML=`<section class="game lightning-quiz"><div class="quiz-hero-mini"><div class="quiz-bolt">⚡</div><div><p class="eyebrow">QUIZ RELÂMPAGO</p><h2>Desafio rápido</h2></div></div><div class="game-score"><span>Pergunta ${i+1}/${questions.length}</span><span>${score} pontos</span></div><div class="progress"><span style="width:${((i)/questions.length)*100}%"></span></div><div class="quiz-question-media"><div class="quiz-image-panel"><img src="${q.image}" alt="" loading="eager"></div><div class="quiz-question-card"><span>PERGUNTA ${i+1} DE ${questions.length}</span><h2>${q.q}</h2></div></div><div class="quiz-options lightning-options">${q.a.map((x,n)=>`<button type="button" class="quiz-option" data-answer="${n}">${String.fromCharCode(65+n)}. ${x}</button>`).join('')}</div><div id="feedback"></div></section>`;
    host.querySelectorAll('[data-answer]').forEach(b=>b.addEventListener('click',()=>answer(Number(b.dataset.answer))));
  }
  function answer(n){
    if(locked)return;locked=true;const q=questions[i];const ok=n===q.correct;
    if(ok){score+=100;correct++;streak++;bestStreak=Math.max(bestStreak,streak);SoundManager.play('correct');}else{streak=0;SoundManager.play('wrong');}
    const f=host.querySelector('#feedback');
    f.innerHTML=`<div class="quiz-feedback"><strong>${ok?'✅ Acertou!':'💡 Vamos aprender com esta questão.'}</strong><p>${q.why}</p><button type="button" class="btn primary" id="nextQuestion">${i===questions.length-1?'Ver resultado':'Próxima'}</button></div>`;
    host.querySelector('#nextQuestion').addEventListener('click',()=>{SoundManager.play('next');i++;locked=false;if(i>=questions.length)finish();else render();});
  }
  function finish(){
    host.innerHTML=`<section class="game"><p class="eyebrow">RESULTADO</p><h2>${score} pontos</h2><p>Você acertou <strong>${correct} de ${questions.length}</strong> perguntas.</p><p>Melhor sequência: <strong>${bestStreak}</strong>.</p><button type="button" class="btn primary" id="playAgain">Jogar novamente</button></section>`;
    const s=JSON.parse(localStorage.getItem('mobiliza.results')||'{"games":0,"correct":0,"answers":0,"best":0,"streak":0}');
    s.games=(s.games||0)+1;s.correct=(s.correct||0)+correct;s.answers=(s.answers||0)+questions.length;s.best=Math.max(s.best||0,score);s.streak=Math.max(s.streak||0,bestStreak);localStorage.setItem('mobiliza.results',JSON.stringify(s));
    SoundManager.play('finish');onFinish?.();host.querySelector('#playAgain').addEventListener('click',()=>openQuiz(dialog,host,onFinish));
  }
  render();if(!dialog.open)dialog.showModal();
}