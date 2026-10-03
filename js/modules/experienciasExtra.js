import { SoundManager } from '../core/soundManager.js?v=1';
import { getQuestionSet } from '../core/questionEngine.js?v=2';

const M='assets/memory/';

function ensureCss(){
  if(document.getElementById('mobiliza-extra-exp-css'))return;
  const s=document.createElement('style');
  s.id='mobiliza-extra-exp-css';
  s.textContent=[
    '.ex2{padding:24px;color:#173f60;min-height:540px}.ex2 *{box-sizing:border-box}',
    '.ex2-head{padding:18px 20px;border-radius:18px;background:linear-gradient(135deg,#0f3c66,#128cb4);color:#fff;margin-bottom:14px}',
    '.ex2-head .eyebrow{margin:0 0 4px;color:#bceeff;font-size:.7rem;font-weight:900;letter-spacing:.1em}.ex2-head h2{margin:0 0 5px;color:#fff}.ex2-head p{margin:0;color:#e7f7ff}',
    '.ex2-chips{display:flex;gap:7px;flex-wrap:wrap;margin-top:10px}.ex2-chip{padding:5px 9px;border:1px solid rgba(255,255,255,.25);border-radius:999px;background:rgba(255,255,255,.12);font-size:.75rem;font-weight:900}',
    '.ex2-card{padding:18px;border:1px solid #d8e7ef;border-radius:16px;background:#fff;box-shadow:0 10px 24px rgba(15,60,102,.07)}',
    '.ex2-card h3{margin:0 0 8px;color:#0f3c66}.ex2-card p{color:#607789;line-height:1.5}',
    '.ex2-options{display:grid;gap:8px;margin-top:14px}.ex2-options button{padding:13px;border:1px solid #d6e5ed;border-radius:12px;background:#fff;color:#173f60;text-align:left;font-weight:800;cursor:pointer}.ex2-options button:hover{border-color:#1689bd;background:#eef9fd}.ex2-options button.ok{border-color:#36a76a;background:#ebf8f0}.ex2-options button.bad{border-color:#d95a53;background:#fff0ef}',
    '.ex2-feedback{margin-top:12px;padding:12px;border-radius:12px;background:#eef6fb;color:#31536b;line-height:1.45}.ex2-feedback.ok{background:#eaf8ef;color:#16623a}.ex2-feedback.bad{background:#fff0ef;color:#8e302c}',
    '.ex2-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:14px}',
    '.ex2-speed{display:grid;grid-template-columns:minmax(0,1fr) 170px;gap:14px}.ex2-qvisual{min-height:150px;margin:-4px 0 14px;border-radius:15px;background:linear-gradient(145deg,#eaf7fc,#fff5d7);border:1px solid #d6e6ee;display:grid;place-items:center;overflow:hidden}.ex2-qvisual img{width:120px;height:120px;object-fit:contain}.ex2-side{display:grid;align-content:start;gap:9px}',
    '.ex2-time{padding:16px;border-radius:16px;background:linear-gradient(180deg,#0f3c66,#071f37);color:#fff;text-align:center}.ex2-time strong{display:block;font-size:2.7rem}.ex2-time span{font-size:.72rem;color:#bfe9fb}',
    '.ex2-stat{padding:12px;border:1px solid #d8e7ef;border-radius:14px;background:#fff;text-align:center}.ex2-stat b{display:block;font-size:1.3rem;color:#0d78ad}',
    '.ex2-priority-scene{display:grid;grid-template-columns:160px minmax(0,1fr);gap:16px;align-items:center}.ex2-priority-image{min-height:145px;border-radius:17px;background:linear-gradient(145deg,#e7f6fc,#fff4d7);display:grid;place-items:center;border:1px solid #d5e5ed}.ex2-priority-image img{width:105px;height:105px;object-fit:contain}.ex2-priority{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:12px}.ex2-choice{min-height:145px;padding:16px;border:2px solid #d6e5ed;border-radius:16px;background:#fff;color:#173f60;text-align:left;font-weight:800;cursor:pointer}.ex2-choice span{display:block;font-size:1.8rem;margin-bottom:8px}.ex2-choice.ok{border-color:#36a76a;background:#ebf8f0}.ex2-choice.bad{border-color:#d95a53;background:#fff0ef}',
    '.ex2-story{display:grid;grid-template-columns:190px minmax(0,1fr);gap:16px}.ex2-picture{min-height:250px;border-radius:18px;background:linear-gradient(145deg,#e3f6ff,#fff4d5);border:1px solid #cde2ed;display:grid;place-items:center}.ex2-picture img{width:72%;height:72%;object-fit:contain}',
    '.ex2-family{display:grid;grid-template-columns:90px 1fr;gap:14px;align-items:start}.ex2-family-icon{width:86px;height:86px;border-radius:22px;display:grid;place-items:center;background:linear-gradient(145deg,#e5f6ff,#fff1c8);font-size:2.4rem}',
    '.ex2-steps{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:14px}.ex2-step{padding:13px;border:1px solid #d8e7ef;border-radius:14px;background:#f8fcfe}.ex2-step b{display:block;margin-bottom:5px;color:#0f3c66}.ex2-step p{margin:0;font-size:.84rem;color:#667f91}',
    '.ex2-complete{text-align:center;padding:26px;border:1px solid #bfe2ca;border-radius:18px;background:linear-gradient(145deg,#eefaf2,#fff)}.ex2-complete .big{font-size:2.6rem}',
    '@media(max-width:760px){.ex2{padding:14px;min-height:100dvh}.ex2-speed{grid-template-columns:1fr}.ex2-qvisual{min-height:120px}.ex2-qvisual img{width:90px;height:90px}.ex2-side{grid-template-columns:1fr 1fr}.ex2-priority-scene{grid-template-columns:1fr}.ex2-priority-image{min-height:110px}.ex2-priority-image img{width:82px;height:82px}.ex2-priority{grid-template-columns:1fr}.ex2-story{grid-template-columns:1fr}.ex2-picture{min-height:160px}.ex2-family{grid-template-columns:60px 1fr}.ex2-family-icon{width:58px;height:58px;font-size:1.7rem}.ex2-steps{grid-template-columns:1fr}}'
  ].join('');
  document.head.appendChild(s);
}

function head(title,subtitle,chips){
  return '<div class="ex2-head"><p class="eyebrow">MOBILIZA EDUCA • EXPERIÊNCIA INTERATIVA</p><h2>'+title+'</h2><p>'+subtitle+'</p>'+(chips?'<div class="ex2-chips">'+chips+'</div>':'')+'</div>';
}
function save(score,correct,answers){
  const r=JSON.parse(localStorage.getItem('mobiliza.results')||'{"games":0,"correct":0,"answers":0,"best":0,"streak":0}');
  r.games=(r.games||0)+1;r.correct=(r.correct||0)+correct;r.answers=(r.answers||0)+answers;r.best=Math.max(r.best||0,score);
  localStorage.setItem('mobiliza.results',JSON.stringify(r));
}
function complete(host,title,icon,html,score,again,dialog){
  SoundManager.play('finish');
  host.innerHTML='<section class="ex2">'+head(title,'Experiência concluída.')+'<div class="ex2-complete"><div class="big">'+icon+'</div>'+html+'<p><strong>'+score+' pontos</strong></p><div class="ex2-actions"><button class="btn primary" id="ex2Again">Jogar novamente</button><button class="btn ghost" id="ex2Close">Encerrar</button></div></div></section>';
  host.querySelector('#ex2Again').onclick=again;host.querySelector('#ex2Close').onclick=()=>dialog.close();
}
function optionsHtml(options,attr){
  return options.map((x,i)=>'<button type="button" '+attr+'="'+i+'">'+String.fromCharCode(65+i)+'. '+x+'</button>').join('');
}

function desafio60(dialog,host,onFinish){
  const questions=getQuestionSet({count:14,audiences:['criancas','adolescentes','adultos'],difficulties:['facil','medio'],avoidRecent:true,markRecent:true});
  let i=0,score=0,correct=0,answers=0,left=60,locked=false,done=false,timer=null;
  function end(){
    if(done)return;done=true;if(timer)clearInterval(timer);save(score,correct,answers);if(onFinish)onFinish();
    complete(host,'Desafio 60 segundos','⏱️','<h3>'+correct+' acertos em '+answers+' respostas</h3><p>Na próxima rodada a sequência de perguntas muda.</p>',score,()=>desafio60(dialog,host,onFinish),dialog);
  }
  function render(){
    const q=questions[i%questions.length];
    host.innerHTML='<section class="ex2">'+head('Desafio 60 segundos','Responda o maior número possível antes do tempo terminar.','<span class="ex2-chip">⚡ Pergunta '+(answers+1)+'</span><span class="ex2-chip">⭐ '+score+' pts</span>')+
      '<div class="ex2-speed"><div class="ex2-card">'+(q.image?'<div class="ex2-qvisual"><img src="'+q.image+'" alt=""></div>':'')+'<small>'+q.category.toUpperCase()+' • '+q.difficulty.toUpperCase()+'</small><h3>'+q.prompt+'</h3><div class="ex2-options">'+optionsHtml(q.options,'data-speed')+'</div><div id="ex2Feedback"></div></div>'+
      '<aside class="ex2-side"><div class="ex2-time"><strong id="ex2Time">'+left+'</strong><span>segundos</span></div><div class="ex2-stat">Acertos<b>'+correct+'</b></div><div class="ex2-stat">Respondidas<b>'+answers+'</b></div></aside></div></section>';
    host.querySelectorAll('[data-speed]').forEach(b=>b.onclick=()=>answer(Number(b.dataset.speed)));
  }
  function answer(n){
    if(locked||done)return;locked=true;answers++;const q=questions[i%questions.length],ok=n===q.correct;
    if(ok){correct++;score+=100;SoundManager.play('correct')}else SoundManager.play('wrong');
    host.querySelectorAll('[data-speed]').forEach((b,k)=>{b.disabled=true;if(k===q.correct)b.classList.add('ok');if(k===n&&k!==q.correct)b.classList.add('bad')});
    const f=host.querySelector('#ex2Feedback');f.className='ex2-feedback '+(ok?'ok':'bad');f.innerHTML='<strong>'+(ok?'✓ Correto!':'Veja a resposta segura.')+'</strong><br>'+q.why;
    setTimeout(()=>{if(done)return;i++;locked=false;render()},850);
  }
  render();SoundManager.play('open');
  timer=setInterval(()=>{if(done)return;left--;const e=host.querySelector('#ex2Time');if(e)e.textContent=Math.max(0,left);if(left===10||left===5)SoundManager.play('warning');if(left<=0)end()},1000);
}

const PRIORITY=[
 {img:M+'pedestre.svg',icon:'🚶',title:'Pedestre já atravessando',text:'Uma pessoa já iniciou a travessia e você se aproxima.',choices:['Acelerar para passar primeiro','Reduzir e aguardar a travessia terminar','Buzinar para a pessoa voltar'],correct:1,why:'A decisão segura é reduzir e preservar espaço para que a travessia seja concluída.'},
 {img:M+'semaforo.svg',icon:'🚦',title:'Sinal vermelho',text:'Seu semáforo está vermelho, embora a via pareça vazia.',choices:['Parar e aguardar a indicação adequada','Avançar porque não há ninguém visível','Apenas reduzir e seguir'],correct:0,why:'A sinalização organiza movimentos que podem não estar totalmente visíveis.'},
 {img:M+'velocidade.svg',icon:'🚑',title:'Veículo de emergência',text:'Você percebe sinais sonoros e luminosos se aproximando.',choices:['Criar espaço de forma previsível e segura','Acelerar para ficar na frente','Parar de repente no meio da faixa'],correct:0,why:'Facilitar a passagem deve ser feito sem criar um novo risco.'},
 {img:M+'pedestre.svg',icon:'🚌',title:'Visão bloqueada',text:'Um veículo grande esconde parte do cruzamento.',choices:['Avançar rápido para descobrir o que há atrás','Reduzir e só avançar com campo visual suficiente','Manter a velocidade e usar apenas a buzina'],correct:1,why:'Veículos grandes podem esconder pedestres, bicicletas e outros veículos.'},
 {img:M+'bicicleta.svg',icon:'🚲',title:'Conversão com ciclista próximo',text:'Você pretende converter e há um ciclista seguindo ao lado do fluxo.',choices:['Converter antes dele a qualquer custo','Verificar sua posição, sinalizar e preservar espaço','Aproximar o veículo para obrigá-lo a parar'],correct:1,why:'Conversões exigem leitura do entorno e atenção a usuários mais vulneráveis.'},
 {img:M+'escola.svg',icon:'🏫',title:'Área escolar movimentada',text:'Há crianças próximas à calçada e veículos parados perto da escola.',choices:['Reduzir a velocidade e ampliar a observação','Manter a velocidade porque ninguém entrou na rua','Passar rápido antes da saída dos alunos'],correct:0,why:'Áreas escolares exigem antecipação, menor velocidade e atenção a movimentos inesperados.'},
 {img:M+'faixa.svg',icon:'↪️',title:'Conversão sobre a faixa',text:'Você vai entrar em outra rua e há uma pessoa próxima da faixa.',choices:['Completar a conversão sem olhar para a faixa','Observar a travessia e só concluir a manobra com segurança','Usar a buzina e converter imediatamente'],correct:1,why:'Conversões criam conflito potencial com a travessia e exigem observação antes da manobra.'},
 {img:M+'celular.svg',icon:'📱',title:'Mensagem no celular',text:'O telefone toca enquanto você está conduzindo.',choices:['Responder rapidamente para acabar logo','Manter a atenção na condução e tratar a mensagem em local seguro','Olhar a tela em cada parada do fluxo'],correct:1,why:'A atenção precisa permanecer no ambiente de trânsito; mensagens podem esperar.'}
];
function prioridade(dialog,host,onFinish){
  const round=[...PRIORITY].sort(()=>Math.random()-.5).slice(0,5);
  let i=0,score=0,correct=0,locked=false;
  function render(){
    const s=round[i];
    host.innerHTML='<section class="ex2">'+head('Quem tem prioridade?','Escolha a decisão que preserva mais segurança e previsibilidade.','<span class="ex2-chip">🔀 Situação '+(i+1)+'/'+round.length+'</span><span class="ex2-chip">⭐ '+score+' pts</span>')+
      '<div class="ex2-card ex2-priority-scene"><div class="ex2-priority-image"><img src="'+s.img+'" alt=""></div><div><h3>'+s.icon+' '+s.title+'</h3><p>'+s.text+'</p></div></div><div class="ex2-priority">'+s.choices.map((x,n)=>'<button class="ex2-choice" data-priority="'+n+'"><span>'+['🅰️','🅱️','🅲️'][n]+'</span>'+x+'</button>').join('')+'</div><div id="ex2PriorityFeedback"></div></section>';
    host.querySelectorAll('[data-priority]').forEach(b=>b.onclick=()=>answer(Number(b.dataset.priority)));
  }
  function answer(n){
    if(locked)return;locked=true;const s=round[i],ok=n===s.correct;
    if(ok){score+=250;correct++;SoundManager.play('correct')}else SoundManager.play('wrong');
    host.querySelectorAll('[data-priority]').forEach((b,k)=>{b.disabled=true;if(k===s.correct)b.classList.add('ok');if(k===n&&k!==s.correct)b.classList.add('bad')});
    const f=host.querySelector('#ex2PriorityFeedback');f.className='ex2-feedback '+(ok?'ok':'bad');f.innerHTML='<strong>'+(ok?'✓ Boa decisão.':'Revise a situação.')+'</strong><br>'+s.why+'<div class="ex2-actions"><button class="btn primary" id="ex2PriorityNext">'+(i===round.length-1?'Ver resultado':'Próxima situação')+'</button></div>';
    host.querySelector('#ex2PriorityNext').onclick=()=>{i++;locked=false;if(i>=round.length){save(score,correct,round.length);if(onFinish)onFinish();complete(host,'Quem tem prioridade?','🔀','<h3>'+correct+' de '+round.length+'</h3><p>Observe, sinalize e preserve espaço antes de decidir.</p>',score,()=>prioridade(dialog,host,onFinish),dialog)}else{SoundManager.play('next');render()}};
  }
  render();SoundManager.play('open');
}

const STORY=[
 {img:M+'escola.svg',title:'Saída da escola',text:'Chico saiu da escola com dois colegas. Eles querem atravessar para encontrar a família do outro lado.',choices:[['Correr logo antes que venham carros',false],['Parar, observar e escolher um momento seguro',true]],why:'A travessia começa pela observação. Pressa reduz o tempo para perceber o ambiente.'},
 {img:M+'celular.svg',title:'Mensagem chegando',text:'Antes de atravessar, o celular de Chico vibrou com uma mensagem.',choices:[['Guardar o celular e manter a atenção na via',true],['Ler a mensagem enquanto atravessa',false]],why:'Durante a travessia, a atenção deve permanecer no trânsito.'},
 {img:M+'semaforo.svg',title:'O sinal mudou',text:'O grupo chega a um local com semáforo e faixa.',choices:[['Observar a indicação e também conferir o entorno',true],['Olhar apenas para o semáforo e ignorar o entorno',false]],why:'A sinalização ajuda a organizar o trânsito, mas observar o entorno continua importante.'},
 {img:M+'cinto.svg',title:'Hora de ir para casa',text:'Depois da caminhada, Chico entra no carro com a família.',choices:[['Colocar o cinto corretamente antes de sair',true],['Deixar para colocar depois porque o trajeto é curto',false]],why:'A proteção deve estar correta desde o início do deslocamento.'}
];
function historia(dialog,host,onFinish){
  let i=0,score=0,correct=0,locked=false;
  function render(){
    const s=STORY[i];
    host.innerHTML='<section class="ex2">'+head('Histórias do Dicas do Chico','Ajude Chico a fazer escolhas seguras.','<span class="ex2-chip">📖 Cena '+(i+1)+'/'+STORY.length+'</span><span class="ex2-chip">⭐ '+score+' pts</span>')+
      '<div class="ex2-story"><div class="ex2-picture"><img src="'+s.img+'" alt=""></div><div class="ex2-card"><p class="eyebrow">DICAS DO CHICO</p><h3>'+s.title+'</h3><p>'+s.text+'</p><div class="ex2-options">'+s.choices.map((x,n)=>'<button data-story="'+n+'">'+(n===0?'🅰️ ':'🅱️ ')+x[0]+'</button>').join('')+'</div><div id="ex2StoryFeedback"></div></div></div></section>';
    host.querySelectorAll('[data-story]').forEach(b=>b.onclick=()=>answer(Number(b.dataset.story)));
  }
  function answer(n){
    if(locked)return;locked=true;const s=STORY[i],ok=!!s.choices[n][1];if(ok){score+=250;correct++;SoundManager.play('correct')}else SoundManager.play('wrong');
    host.querySelectorAll('[data-story]').forEach(b=>b.disabled=true);
    const f=host.querySelector('#ex2StoryFeedback');f.className='ex2-feedback '+(ok?'ok':'bad');f.innerHTML='<strong>'+(ok?'✓ Chico gostou dessa escolha!':'Vamos pensar de novo.')+'</strong><br>'+s.why+'<div class="ex2-actions"><button class="btn primary" id="ex2StoryNext">'+(i===STORY.length-1?'Terminar história':'Continuar')+'</button></div>';
    host.querySelector('#ex2StoryNext').onclick=()=>{i++;locked=false;if(i>=STORY.length){save(score,correct,STORY.length);if(onFinish)onFinish();SoundManager.play('celebrate');complete(host,'Histórias do Dicas do Chico','🏅','<h3>Missão concluída!</h3><p>Você ajudou Chico em '+correct+' de '+STORY.length+' decisões.</p>',score,()=>historia(dialog,host,onFinish),dialog)}else{SoundManager.play('next');render()}};
  }
  render();SoundManager.play('open');
}

const FAMILY=[
 {icon:'🚶',title:'Travessia segura',q:'Qual ponto do caminho da família exige mais atenção antes de atravessar?',action:'Na próxima saída, escolham juntos um ponto de travessia e expliquem por que ele parece mais seguro.'},
 {icon:'📱',title:'Celular e atenção',q:'Em quais momentos do deslocamento o celular mais disputa a atenção de adultos e crianças?',action:'Combinem um momento do trajeto em que todos deixam o celular guardado e observam o ambiente.'},
 {icon:'🚗',title:'O exemplo dos adultos',q:'Que hábito de um adulto dentro do veículo uma criança pode copiar sem perceber?',action:'Escolham um hábito seguro para reforçar em todas as viagens desta semana.'},
 {icon:'🚲',title:'Bicicleta no bairro',q:'Quais situações exigem mais atenção quando alguém da família usa bicicleta?',action:'Escolham uma situação real para observar juntos e conversem sobre visibilidade e previsibilidade.'},
 {icon:'🏫',title:'Entrada e saída da escola',q:'Onde surgem mais conflitos ou pressa na chegada e na saída da escola?',action:'Definam uma atitude que a família pode adotar para tornar esse momento mais calmo.'}
];
function familia(dialog,host,onFinish){
  let idx=Math.floor(Math.random()*FAMILY.length),done=0,score=0;
  function render(){
    const p=FAMILY[idx];
    host.innerHTML='<section class="ex2">'+head('5 minutos em família','Uma conversa curta para transformar exemplos cotidianos em aprendizagem.','<span class="ex2-chip">🏠 Conversa '+(done+1)+'/3</span><span class="ex2-chip">⭐ '+score+' pts</span>')+
      '<div class="ex2-card ex2-family"><div class="ex2-family-icon">'+p.icon+'</div><div><small>CONVERSEM JUNTOS</small><h3>'+p.title+'</h3><p>'+p.q+'</p></div></div>'+
      '<div class="ex2-steps"><div class="ex2-step"><b>1. Cada pessoa responde</b><p>Adulto e criança falam o que pensam antes de comparar.</p></div><div class="ex2-step"><b>2. Lembrem de um exemplo</b><p>Pensem em uma situação que realmente aconteceu.</p></div><div class="ex2-step"><b>3. Façam um combinado</b><p>'+p.action+'</p></div></div>'+
      '<div class="ex2-actions"><button class="btn ghost" id="ex2FamilyOther">🔄 Outra conversa</button><button class="btn primary" id="ex2FamilyDone">✓ Fizemos o combinado</button></div></section>';
    host.querySelector('#ex2FamilyOther').onclick=()=>{SoundManager.play('next');idx=(idx+1)%FAMILY.length;render()};
    host.querySelector('#ex2FamilyDone').onclick=()=>{done++;score+=300;SoundManager.play('correct');if(done>=3){save(score,done,done);if(onFinish)onFinish();SoundManager.play('celebrate');complete(host,'5 minutos em família','💛','<h3>3 combinados construídos juntos</h3><p>Agora observem esses combinados nos deslocamentos reais.</p>',score,()=>familia(dialog,host,onFinish),dialog)}else{idx=(idx+1)%FAMILY.length;render()}};
  }
  render();SoundManager.play('open');
}

export function openExtraExperience(dialog,host,id,onFinish){
  ensureCss();
  if(id==='desafio-60'){desafio60(dialog,host,onFinish);return true}
  if(id==='prioridade'){prioridade(dialog,host,onFinish);return true}
  if(id==='historia'){historia(dialog,host,onFinish);return true}
  if(id==='familia-5'){familia(dialog,host,onFinish);return true}
  return false;
}
