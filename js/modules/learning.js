import { getQuestionSet } from '../core/questionEngine.js?v=2';
import { SoundManager } from '../core/soundManager.js?v=1';

const M='assets/memory/';
const TRACKS={
 pedestre:{icon:'🚶',title:'Travessia e prioridade',image:M+'pedestre.svg',categories:['pedestre','visibilidade'],slides:[
  ['Veja antes de agir','Travessia segura começa pela leitura do ambiente: fluxo, velocidade, visibilidade e intenção dos outros usuários.'],
  ['Torne-se visível','Evite surgir de trás de veículos e obstáculos. Procure um local onde você possa ver e ser visto.'],
  ['Confirme a decisão','Faixa e sinalização ajudam a organizar o trânsito, mas observar se a situação realmente está segura continua essencial.']]},
 distracao:{icon:'📱',title:'Distração no trânsito',image:M+'celular.svg',categories:['distracao'],slides:[
  ['Atenção é limitada','Celular, conversas e tarefas paralelas dividem recursos de atenção que deveriam estar no ambiente.'],
  ['Segundos importam','Enquanto a atenção está fora da via, o cenário continua mudando e um risco pode surgir.'],
  ['Crie uma rotina','Antes de iniciar o deslocamento, organize rota, mensagens e equipamentos para reduzir tentações durante o trajeto.']]},
 velocidade:{icon:'🛑',title:'Velocidade e risco',image:M+'velocidade.svg',categories:['velocidade','distancia'],slides:[
  ['Velocidade muda o tempo','Quanto maior a velocidade, menor o tempo disponível para perceber, decidir e reagir.'],
  ['Margem de segurança','Reduzir a velocidade em ambientes complexos aumenta a margem para lidar com situações inesperadas.'],
  ['Distância também conta','Espaço para o veículo da frente ajuda a transformar uma surpresa em uma reação possível.']]},
 protecao:{icon:'🛡️',title:'Proteção dos ocupantes',image:M+'cinto.svg',categories:['passageiro','capacete'],slides:[
  ['Proteção desde o início','Cinto e demais dispositivos precisam estar corretos antes do deslocamento começar.'],
  ['Todos participam','Passageiros também influenciam a segurança: usam proteção e evitam distrair quem conduz.'],
  ['Equipamento bem usado','Capacete e cinto só cumprem seu papel quando ajustados e utilizados de forma adequada.']]},
 bike:{icon:'🚲',title:'Bicicleta e micromobilidade',image:M+'bicicleta.svg',categories:['bicicleta','visibilidade'],slides:[
  ['Seja previsível','Sinalize intenções e evite mudanças bruscas de trajetória.'],
  ['Veja e seja visto','Cruzamentos, garagens e veículos grandes merecem atenção especial por causa da visibilidade.'],
  ['Compartilhe o espaço','Respeito, distância e velocidade compatível ajudam na convivência com pedestres e veículos.']]},
 moto:{icon:'🏍️',title:'Motociclista seguro',image:M+'capacete.svg',categories:['moto','ponto-cego','capacete'],slides:[
  ['Visibilidade importa','Motocicletas podem permanecer em áreas de menor visibilidade de outros veículos.'],
  ['Espaço para reagir','Distância e leitura do fluxo reduzem a necessidade de manobras bruscas.'],
  ['Proteção correta','Capacete ajustado e comportamento previsível fazem parte de uma condução mais segura.']]},
 familia:{icon:'👨‍👩‍👧',title:'Trânsito começa em casa',image:M+'escola.svg',categories:['familia','passageiro','convivencia'],slides:[
  ['Exemplo ensina','Crianças observam comportamentos repetidos dos adultos e podem incorporá-los como padrão.'],
  ['Conversem sobre o caminho','Situações reais do bairro, escola e viagens são oportunidades curtas de aprendizagem.'],
  ['Combinados simples','Cinto, travessia atenta e celular guardado podem virar hábitos familiares consistentes.']]},
 empresa:{icon:'🏢',title:'Segurança no deslocamento',image:M+'velocidade.svg',categories:['empresa','fadiga','distracao','distancia'],slides:[
  ['Planejamento reduz pressão','Horário, rota e pausas ajudam a evitar que atraso se transforme em pressa.'],
  ['Fadiga é um risco','Sonolência e cansaço reduzem percepção, julgamento e tempo de reação.'],
  ['Cultura de segurança','Metas e rotinas devem favorecer decisões seguras, não premiar velocidade ou improviso.']]}
};

function css(){
 if(document.getElementById('learning-v1-css'))return;
 const s=document.createElement('style');s.id='learning-v1-css';
 s.textContent=[
 '.learnx{padding:24px;min-height:560px;color:#173f60}.learnx *{box-sizing:border-box}',
 '.learnx-hero{display:grid;grid-template-columns:150px 1fr;gap:16px;align-items:center;padding:18px;border-radius:20px;background:linear-gradient(135deg,#0f3c66,#168ab4);color:#fff}.learnx-hero img{width:150px;height:110px;object-fit:contain;border-radius:16px;background:rgba(255,255,255,.94);padding:12px}.learnx-hero h2{margin:2px 0 6px;color:#fff}.learnx-hero p{margin:0;color:#e2f5fc}.learnx-hero .eyebrow{color:#bceeff}',
 '.learnx-progress{height:8px;background:#dbe8ef;border-radius:999px;overflow:hidden;margin:14px 0}.learnx-progress i{display:block;height:100%;background:linear-gradient(90deg,#15a1cb,#2fb36d);transition:.25s}',
 '.learnx-card{padding:22px;border:1px solid #d8e6ee;border-radius:18px;background:#fff;box-shadow:0 10px 26px rgba(15,60,102,.07)}.learnx-card h3{margin:0 0 8px;color:#0f3c66;font-size:1.35rem}.learnx-card p{margin:0;color:#607789;line-height:1.55}',
 '.learnx-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:16px}',
 '.learnx-options{display:grid;gap:8px;margin-top:14px}.learnx-options button{padding:13px;border:1px solid #d6e4ec;border-radius:12px;background:#fff;color:#173f60;text-align:left;font-weight:800;cursor:pointer}.learnx-options button:hover{border-color:#1689bd;background:#eff9fd}.learnx-options button.ok{border-color:#37a86b;background:#ebf8f0}.learnx-options button.bad{border-color:#d85b55;background:#fff0ef}',
 '.learnx-feedback{margin-top:12px;padding:12px;border-radius:12px;background:#eef6fb}.learnx-feedback.ok{background:#eaf8ef;color:#17643a}.learnx-feedback.bad{background:#fff0ef;color:#8c302d}',
 '.learnx-summary{text-align:center;padding:26px;border:1px solid #c7e4d0;border-radius:18px;background:linear-gradient(145deg,#eefaf2,#fff)}.learnx-summary .big{font-size:2.7rem}.learnx-summary h3{margin:6px 0}',
 '@media(max-width:760px){.learnx{padding:14px;min-height:100dvh}.learnx-hero{grid-template-columns:90px 1fr}.learnx-hero img{width:90px;height:76px}.learnx-actions{display:grid;grid-template-columns:1fr 1fr}}'
 ].join('');
 document.head.appendChild(s);
}
function save(score,correct,answers){
 const r=JSON.parse(localStorage.getItem('mobiliza.results')||'{"games":0,"correct":0,"answers":0,"best":0,"streak":0}');
 r.games=(r.games||0)+1;r.correct=(r.correct||0)+correct;r.answers=(r.answers||0)+answers;r.best=Math.max(r.best||0,score);
 localStorage.setItem('mobiliza.results',JSON.stringify(r));
}
function hero(t,sub){
 return '<div class="learnx-hero"><img src="'+t.image+'" alt=""><div><p class="eyebrow">MOBILIZA EDUCA • TRILHA RÁPIDA</p><h2>'+t.icon+' '+t.title+'</h2><p>'+sub+'</p></div></div>';
}
export function openLearning(dialog,host,id,onFinish){
 css();const t=TRACKS[id];if(!t)return false;
 let step=-1,qIndex=0,score=0,correct=0,answers=0,locked=false;
 const questions=getQuestionSet({count:5,audiences:['criancas','adolescentes','adultos'],categories:t.categories,avoidRecent:true,markRecent:true,recentScope:'learning:'+id,recentLimit:15});
 function intro(){
  step=-1;host.innerHTML='<section class="learnx">'+hero(t,'Conteúdo objetivo, três etapas e uma checagem final de aprendizagem.')+
   '<div class="learnx-progress"><i style="width:0%"></i></div><div class="learnx-card"><h3>Como funciona</h3><p>Leia três pontos essenciais. Depois responda cinco questões. Você recebe feedback em cada resposta e pode refazer a trilha com novas perguntas.</p><div class="learnx-actions"><button class="btn primary" id="learnStart">▶ Começar trilha</button></div></div></section>';
  host.querySelector('#learnStart').onclick=()=>{SoundManager.play('open');step=0;slide()};
 }
 function slide(){
  const s=t.slides[step],pct=Math.round(((step+1)/4)*100);
  host.innerHTML='<section class="learnx">'+hero(t,'Etapa '+(step+1)+' de 3')+'<div class="learnx-progress"><i style="width:'+pct+'%"></i></div>'+
   '<div class="learnx-card"><h3>'+s[0]+'</h3><p>'+s[1]+'</p><div class="learnx-actions"><button class="btn primary" id="learnNext">'+(step===2?'Ir para a checagem':'Continuar')+'</button></div></div></section>';
  host.querySelector('#learnNext').onclick=()=>{SoundManager.play('next');step++;if(step>2)quiz();else slide()};
 }
 function quiz(){
  if(qIndex>=questions.length){finish();return}
  const q=questions[qIndex],pct=Math.round((75+(qIndex/questions.length)*25));
  host.innerHTML='<section class="learnx">'+hero(t,'Checagem '+(qIndex+1)+' de '+questions.length)+'<div class="learnx-progress"><i style="width:'+pct+'%"></i></div>'+
   '<div class="learnx-card"><small>'+q.category.toUpperCase()+' • '+q.difficulty.toUpperCase()+'</small><h3>'+q.prompt+'</h3><div class="learnx-options">'+q.options.map((x,n)=>'<button data-learn="'+n+'">'+String.fromCharCode(65+n)+'. '+x+'</button>').join('')+'</div><div id="learnFeedback"></div></div></section>';
  host.querySelectorAll('[data-learn]').forEach(b=>b.onclick=()=>answer(Number(b.dataset.learn)));
 }
 function answer(n){
  if(locked)return;locked=true;answers++;const q=questions[qIndex],ok=n===q.correct;if(ok){score+=200;correct++;SoundManager.play('correct')}else SoundManager.play('wrong');
  host.querySelectorAll('[data-learn]').forEach((b,k)=>{b.disabled=true;if(k===q.correct)b.classList.add('ok');if(k===n&&k!==q.correct)b.classList.add('bad')});
  const f=host.querySelector('#learnFeedback');f.className='learnx-feedback '+(ok?'ok':'bad');f.innerHTML='<strong>'+(ok?'✓ Correto!':'Vamos revisar.')+'</strong><br>'+q.why+'<div class="learnx-actions"><button class="btn primary" id="learnQuestionNext">'+(qIndex===questions.length-1?'Ver resultado':'Próxima pergunta')+'</button></div>';
  host.querySelector('#learnQuestionNext').onclick=()=>{qIndex++;locked=false;SoundManager.play('next');quiz()};
 }
 function finish(){
  save(score,correct,answers);if(onFinish)onFinish();SoundManager.play('finish');
  host.innerHTML='<section class="learnx">'+hero(t,'Trilha concluída')+'<div class="learnx-progress"><i style="width:100%"></i></div><div class="learnx-summary"><div class="big">🏅</div><h3>'+correct+' de '+answers+' respostas corretas</h3><p>Você concluiu a trilha <strong>'+t.title+'</strong>.</p><p><strong>'+score+' pontos</strong></p><div class="learnx-actions"><button class="btn primary" id="learnAgain">Refazer trilha</button><button class="btn ghost" id="learnClose">Encerrar</button></div></div></section>';
  host.querySelector('#learnAgain').onclick=()=>openLearning(dialog,host,id,onFinish);host.querySelector('#learnClose').onclick=()=>dialog.close();
 }
 intro();if(!dialog.open)dialog.showModal();return true;
}
