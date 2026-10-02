const questions=[
{image:'assets/memory/faixa.svg?v=23',q:'Ao atravessar a rua, qual atitude é mais segura?',a:['Correr entre carros estacionados','Usar a faixa, observar os dois sentidos e atravessar com atenção','Olhar apenas para o lado de onde vem o ônibus','Usar o celular para avisar que está atravessando'],correct:1,why:'A faixa aumenta a previsibilidade da travessia, mas ainda é necessário observar o trânsito e confirmar que é seguro atravessar.'},
{image:'assets/memory/escola.svg?v=23',q:'Por que reduzir a velocidade perto de escolas?',a:['Apenas para evitar multas','Porque crianças podem ter menor percepção de risco e movimentos imprevisíveis','Porque veículos grandes não podem circular','Somente durante a saída das aulas'],correct:1,why:'Áreas escolares exigem atenção reforçada porque há maior circulação de crianças e situações imprevistas.'},
{image:'assets/memory/cinto.svg?v=23',q:'O cinto de segurança deve ser usado por quem?',a:['Somente motorista','Apenas ocupantes dos bancos dianteiros','Todos os ocupantes do veículo','Somente em rodovias'],correct:2,why:'Todos os ocupantes devem usar o cinto adequado, inclusive no banco traseiro.'},
{image:'assets/memory/bicicleta.svg?v=23',q:'Ao andar de bicicleta, qual atitude melhora a convivência segura?',a:['Mudar de direção sem avisar','Circular na contramão para ver os carros','Sinalizar intenções e manter comportamento previsível','Usar fones nos dois ouvidos'],correct:2,why:'Sinalizar e agir de forma previsível ajuda os demais usuários da via a compreender o que você pretende fazer.'},
{image:'assets/memory/semaforo.svg?v=23',q:'Se o semáforo abriu para o pedestre, ainda é importante observar os veículos?',a:['Não, nunca','Sim, porque segurança depende também de confirmar que os veículos realmente pararam','Somente à noite','Apenas se estiver chovendo'],correct:1,why:'A sinalização organiza a circulação, mas a atenção continua indispensável.'}
];

export function openQuiz(dialog,host,onFinish){
  let i=0,score=0,correct=0,streak=0,bestStreak=0,locked=false;
  function render(){
    const q=questions[i];
    host.innerHTML=`<section class="game lightning-quiz"><div class="quiz-hero-mini"><div class="quiz-bolt">⚡</div><div><p class="eyebrow">QUIZ RELÂMPAGO</p><h2>Desafio rápido</h2></div></div><div class="game-score"><span>Pergunta ${i+1}/${questions.length}</span><span>${score} pontos</span></div><div class="progress"><span style="width:${((i)/questions.length)*100}%"></span></div><div class="quiz-question-media"><div class="quiz-image-panel"><img src="${q.image}" alt="" loading="eager"></div><div class="quiz-question-card"><span>PERGUNTA ${i+1} DE ${questions.length}</span><h2>${q.q}</h2></div></div><div class="quiz-options lightning-options">${q.a.map((x,n)=>`<button type="button" class="quiz-option" data-answer="${n}">${String.fromCharCode(65+n)}. ${x}</button>`).join('')}</div><div id="feedback"></div></section>`;
    host.querySelectorAll('[data-answer]').forEach(b=>b.addEventListener('click',()=>answer(Number(b.dataset.answer))));
  }
  function answer(n){
    if(locked)return;locked=true;const q=questions[i];const ok=n===q.correct;
    if(ok){score+=100;correct++;streak++;bestStreak=Math.max(bestStreak,streak);}else{streak=0;}
    const f=host.querySelector('#feedback');
    f.innerHTML=`<div class="quiz-feedback"><strong>${ok?'✅ Acertou!':'💡 Vamos aprender com esta questão.'}</strong><p>${q.why}</p><button type="button" class="btn primary" id="nextQuestion">${i===questions.length-1?'Ver resultado':'Próxima'}</button></div>`;
    host.querySelector('#nextQuestion').addEventListener('click',()=>{i++;locked=false;if(i>=questions.length)finish();else render();});
  }
  function finish(){
    host.innerHTML=`<section class="game"><p class="eyebrow">RESULTADO</p><h2>${score} pontos</h2><p>Você acertou <strong>${correct} de ${questions.length}</strong> perguntas.</p><p>Melhor sequência: <strong>${bestStreak}</strong>.</p><button type="button" class="btn primary" id="playAgain">Jogar novamente</button></section>`;
    const s=JSON.parse(localStorage.getItem('mobiliza.results')||'{"games":0,"correct":0,"answers":0,"best":0,"streak":0}');
    s.games=(s.games||0)+1;s.correct=(s.correct||0)+correct;s.answers=(s.answers||0)+questions.length;s.best=Math.max(s.best||0,score);s.streak=Math.max(s.streak||0,bestStreak);localStorage.setItem('mobiliza.results',JSON.stringify(s));
    onFinish?.();host.querySelector('#playAgain').addEventListener('click',()=>openQuiz(dialog,host,onFinish));
  }
  render();dialog.showModal();
}