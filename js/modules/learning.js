import { getQuestionSet } from '../core/questionEngine.js?v=2';
import { SoundManager } from '../core/soundManager.js?v=1';
import { recordGameResult } from '../core/historyStore.js?v=1';

const M='assets/memory/';
const REAL='assets/ai/hero_area_escolar.webp';

const TRACKS={
  pedestre:{icon:'🚶',title:'Travessia e prioridade',audience:'Universal',cover:REAL,image:M+'pedestre.svg',categories:['pedestre','visibilidade'],slides:[
    {title:'Veja antes de agir',text:'Travessia segura começa pela leitura do ambiente: fluxo, velocidade, visibilidade e intenção dos outros usuários.',tip:'Antes de atravessar, procure enxergar a via inteira — não apenas o ponto imediatamente à sua frente.'},
    {title:'Torne-se visível',text:'Evite surgir de trás de veículos e obstáculos. Procure um local onde você possa ver e ser visto.',tip:'Se você não consegue ver o condutor, há chance de ele também não conseguir ver você.'},
    {title:'Confirme a decisão',text:'Faixa e sinalização ajudam a organizar o trânsito, mas observar se a situação realmente está segura continua essencial.',tip:'Sinalização orienta; observação confirma.'}
  ]},
  distracao:{icon:'📱',title:'Distração no trânsito',audience:'Adolescentes e adultos',cover:REAL,image:M+'celular.svg',categories:['distracao'],slides:[
    {title:'Atenção é limitada',text:'Celular, conversas e tarefas paralelas dividem recursos de atenção que deveriam estar no ambiente.',tip:'Olhos na via não significam atenção plena se a mente estiver em outra tarefa.'},
    {title:'Segundos importam',text:'Enquanto a atenção está fora da via, o cenário continua mudando e um risco pode surgir.',tip:'Quanto maior a velocidade, maior a distância percorrida durante uma distração.'},
    {title:'Crie uma rotina',text:'Antes de iniciar o deslocamento, organize rota, mensagens e equipamentos para reduzir tentações durante o trajeto.',tip:'Preparar antes de sair evita decisões improvisadas em movimento.'}
  ]},
  velocidade:{icon:'🛑',title:'Velocidade e risco',audience:'Adolescentes e adultos',cover:REAL,image:M+'velocidade.svg',categories:['velocidade','distancia'],slides:[
    {title:'Velocidade muda o tempo',text:'Quanto maior a velocidade, menor o tempo disponível para perceber, decidir e reagir.',tip:'Mais velocidade significa menos margem para corrigir um erro.'},
    {title:'Margem de segurança',text:'Reduzir a velocidade em ambientes complexos aumenta a margem para lidar com situações inesperadas.',tip:'Áreas escolares, cruzamentos e chuva pedem ainda mais antecipação.'},
    {title:'Distância também conta',text:'Espaço para o veículo da frente ajuda a transformar uma surpresa em uma reação possível.',tip:'Distância é tempo disponível para perceber e agir.'}
  ]},
  protecao:{icon:'🛡️',title:'Proteção dos ocupantes',audience:'Famílias e adultos',cover:REAL,image:M+'cinto.svg',categories:['passageiro','capacete'],slides:[
    {title:'Proteção desde o início',text:'Cinto e demais dispositivos precisam estar corretos antes do deslocamento começar.',tip:'O trajeto curto também começa com proteção completa.'},
    {title:'Todos participam',text:'Passageiros também influenciam a segurança: usam proteção e evitam distrair quem conduz.',tip:'Segurança dentro do veículo é responsabilidade compartilhada.'},
    {title:'Equipamento bem usado',text:'Capacete e cinto só cumprem seu papel quando ajustados e utilizados de forma adequada.',tip:'Equipamento solto ou mal ajustado reduz a proteção esperada.'}
  ]},
  bike:{icon:'🚲',title:'Bicicleta e micromobilidade',audience:'9+ e mobilidade',cover:REAL,image:M+'bicicleta.svg',categories:['bicicleta','visibilidade'],slides:[
    {title:'Seja previsível',text:'Sinalize intenções e evite mudanças bruscas de trajetória.',tip:'Previsibilidade ajuda os outros usuários a entenderem o que você fará.'},
    {title:'Veja e seja visto',text:'Cruzamentos, garagens e veículos grandes merecem atenção especial por causa da visibilidade.',tip:'Pontos cegos são especialmente relevantes perto de veículos maiores.'},
    {title:'Compartilhe o espaço',text:'Respeito, distância e velocidade compatível ajudam na convivência com pedestres e veículos.',tip:'Convivência segura depende de espaço e tempo para todos.'}
  ]},
  moto:{icon:'🏍️',title:'Motociclista seguro',audience:'Motociclistas',cover:REAL,image:M+'capacete.svg',categories:['moto','ponto-cego','capacete'],slides:[
    {title:'Visibilidade importa',text:'Motocicletas podem permanecer em áreas de menor visibilidade de outros veículos.',tip:'Evite permanecer por muito tempo em regiões de ponto cego.'},
    {title:'Espaço para reagir',text:'Distância e leitura do fluxo reduzem a necessidade de manobras bruscas.',tip:'Posição e distância podem criar uma rota de escape quando algo muda.'},
    {title:'Proteção correta',text:'Capacete ajustado e comportamento previsível fazem parte de uma condução mais segura.',tip:'Proteção e comportamento trabalham juntos.'}
  ]},
  familia:{icon:'👨‍👩‍👧',title:'Trânsito começa em casa',audience:'Famílias',cover:REAL,image:M+'escola.svg',categories:['familia','passageiro','convivencia'],slides:[
    {title:'Exemplo ensina',text:'Crianças observam comportamentos repetidos dos adultos e podem incorporá-los como padrão.',tip:'Uma atitude repetida vale mais do que uma orientação ocasional.'},
    {title:'Conversem sobre o caminho',text:'Situações reais do bairro, escola e viagens são oportunidades curtas de aprendizagem.',tip:'Pergunte à criança o que ela percebeu antes de explicar.'},
    {title:'Combinados simples',text:'Cinto, travessia atenta e celular guardado podem virar hábitos familiares consistentes.',tip:'Poucos combinados claros são mais fáceis de repetir todos os dias.'}
  ]},
  empresa:{icon:'🏢',title:'Segurança no deslocamento',audience:'Empresas e equipes',cover:REAL,image:M+'velocidade.svg',categories:['empresa','fadiga','distracao','distancia'],slides:[
    {title:'Planejamento reduz pressão',text:'Horário, rota e pausas ajudam a evitar que atraso se transforme em pressa.',tip:'A cultura da organização influencia decisões tomadas no trânsito.'},
    {title:'Fadiga é um risco',text:'Sonolência e cansaço reduzem percepção, julgamento e tempo de reação.',tip:'Pausa e descanso fazem parte da gestão do risco.'},
    {title:'Cultura de segurança',text:'Metas e rotinas devem favorecer decisões seguras, não premiar velocidade ou improviso.',tip:'Uma meta operacional não deve criar incentivo para assumir risco.'}
  ]}
};

function esc(v=''){return String(v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function css(){
  if(document.getElementById('learning-v2-css'))return;
  const s=document.createElement('style');s.id='learning-v2-css';
  s.textContent=[
    '#gameDialog.learning-v2-dialog{width:min(1120px,96vw)!important;max-width:96vw!important;max-height:95vh!important}',
    '#gameDialog.learning-v2-dialog>.dialog-shell{max-height:95vh!important;overflow:auto!important;background:#edf6fa!important}',
    '.learn2{padding:22px;min-height:590px;color:#173f60}.learn2 *{box-sizing:border-box}',
    '.learn2-hero{position:relative;min-height:220px;border-radius:22px;overflow:hidden;background:#0c456d;box-shadow:0 14px 32px rgba(10,53,83,.18);margin-bottom:14px}',
    '.learn2-cover{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:saturate(.9) contrast(1.02)}',
    '.learn2-hero:after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(3,27,48,.94) 0%,rgba(4,42,70,.82) 48%,rgba(5,51,81,.22) 100%)}',
    '.learn2-hero-content{position:relative;z-index:2;min-height:220px;display:grid;grid-template-columns:100px minmax(0,1fr) auto;gap:18px;align-items:center;padding:24px}',
    '.learn2-symbol{width:94px;height:94px;border-radius:24px;background:rgba(255,255,255,.94);display:grid;place-items:center;box-shadow:0 10px 25px rgba(0,0,0,.22)}',
    '.learn2-symbol img{width:68px;height:68px;object-fit:contain}.learn2-hero-copy .eyebrow{margin:0 0 5px;color:#9fe6ff;font-size:.67rem;font-weight:1000;letter-spacing:.12em}.learn2-hero h2{margin:0 0 6px;color:#fff;font-size:1.75rem}.learn2-hero p{margin:0;color:#e5f5fb;line-height:1.45}',
    '.learn2-meta{display:grid;gap:7px;min-width:170px}.learn2-meta span{padding:8px 10px;border:1px solid rgba(255,255,255,.24);border-radius:12px;background:rgba(255,255,255,.12);color:#fff;font-size:.76rem;font-weight:900;text-align:center;backdrop-filter:blur(4px)}',
    '.learn2-statusbar{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:center;margin-bottom:14px}.learn2-progress{height:12px;background:#d7e7ee;border-radius:999px;overflow:hidden}.learn2-progress i{display:block;height:100%;background:linear-gradient(90deg,#138cbd,#2fc778);border-radius:inherit;transition:width .28s ease}.learn2-status{font-size:.76rem;font-weight:900;color:#537389}',
    '.learn2-intro{display:grid;grid-template-columns:1.2fr .8fr;gap:14px}.learn2-card{padding:20px;border:1px solid #d6e5ed;border-radius:18px;background:#fff;box-shadow:0 9px 24px rgba(15,60,102,.07)}.learn2-card h3{margin:0 0 8px;color:#0e3e61}.learn2-card p{margin:0;color:#60798b;line-height:1.5}',
    '.learn2-road{display:grid;gap:8px}.learn2-road-step{display:grid;grid-template-columns:42px 1fr;gap:9px;align-items:center;padding:9px;border-radius:13px;background:#f5fafc;border:1px solid #dce9ef}.learn2-road-step b{width:38px;height:38px;border-radius:50%;display:grid;place-items:center;background:#0e79a9;color:#fff}.learn2-road-step strong{display:block;color:#173f60}.learn2-road-step small{color:#6c8494}',
    '.learn2-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:14px}.learn2-actions .btn{min-height:42px}',
    '.learn2-slide{display:grid;grid-template-columns:280px minmax(0,1fr);gap:16px}.learn2-slide-visual{min-height:285px;border-radius:18px;overflow:hidden;position:relative;background:#dcebf2}.learn2-slide-visual>img.scene{width:100%;height:100%;object-fit:cover}.learn2-slide-visual:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 50%,rgba(5,37,59,.72))}.learn2-slide-symbol{position:absolute;z-index:2;left:18px;bottom:18px;width:74px;height:74px;border-radius:20px;background:#fff;display:grid;place-items:center;box-shadow:0 9px 22px rgba(0,0,0,.18)}.learn2-slide-symbol img{width:52px;height:52px;object-fit:contain}',
    '.learn2-lesson{display:flex;flex-direction:column;justify-content:center}.learn2-step-label{font-size:.7rem;font-weight:1000;letter-spacing:.1em;color:#0b83b1;margin-bottom:7px}.learn2-lesson h3{font-size:1.55rem;line-height:1.12}.learn2-lesson p{font-size:1rem}.learn2-tip{margin-top:15px;padding:13px 14px;border-radius:14px;background:#fff7da;border:1px solid #edd98f;color:#6e5b1c;line-height:1.45}',
    '.learn2-quiz{display:grid;grid-template-columns:235px minmax(0,1fr);gap:15px}.learn2-qvisual{min-height:250px;border-radius:18px;background:linear-gradient(145deg,#eaf8fd,#fff5d9);border:1px solid #d4e5ed;display:grid;place-items:center;overflow:hidden}.learn2-qvisual img{width:76%;height:200px;object-fit:contain;filter:drop-shadow(0 8px 12px rgba(15,60,102,.12))}.learn2-qcopy small{display:block;color:#6c8494;font-weight:900;letter-spacing:.05em;margin-bottom:5px}.learn2-qcopy h3{font-size:1.35rem;line-height:1.3}',
    '.learn2-options{display:grid;gap:8px;margin-top:13px}.learn2-options button{display:grid;grid-template-columns:36px 1fr;gap:9px;align-items:center;padding:10px 12px;border:2px solid #d8e6ed;border-radius:14px;background:#fff;color:#173f60;text-align:left;font-weight:800;cursor:pointer;transition:.14s}.learn2-options button:hover:not(:disabled){border-color:#168bb9;transform:translateY(-1px)}.learn2-options button b{width:32px;height:32px;border-radius:50%;display:grid;place-items:center;background:#0f79aa;color:#fff}.learn2-options button.ok{border-color:#35ae6d;background:#eaf8ef}.learn2-options button.bad{border-color:#d95853;background:#fff0ef}',
    '.learn2-feedback{margin-top:12px;padding:13px;border-radius:14px;line-height:1.5}.learn2-feedback.ok{background:#eaf8ef;color:#17643a;border:1px solid #bce2c9}.learn2-feedback.bad{background:#fff0ef;color:#8c312d;border:1px solid #efc4c1}',
    '.learn2-summary{display:grid;grid-template-columns:220px minmax(0,1fr);gap:16px;align-items:center}.learn2-score-ring{width:190px;height:190px;margin:auto;border-radius:50%;display:grid;place-items:center;background:conic-gradient(#2eb875 var(--pct),#dce9ef 0);position:relative}.learn2-score-ring:after{content:"";position:absolute;inset:16px;border-radius:50%;background:#fff}.learn2-score-ring div{position:relative;z-index:2;text-align:center}.learn2-score-ring strong{display:block;font-size:2.1rem;color:#0e6e9b}.learn2-score-ring span{font-size:.72rem;color:#6b8292}',
    '.learn2-summary-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:13px 0}.learn2-summary-grid div{padding:12px;border-radius:14px;background:#f5fafc;border:1px solid #dce8ee;text-align:center}.learn2-summary-grid strong{display:block;font-size:1.3rem;color:#0e6d9a}.learn2-summary-grid span{font-size:.7rem;color:#6d8292}',
    '.learn2-record{padding:11px 12px;border-radius:12px;background:#eaf7fc;color:#365f78;font-size:.8rem}',
    '@media(max-width:760px){#gameDialog.learning-v2-dialog{width:100vw!important;max-width:100vw!important;height:100dvh!important;max-height:100dvh!important;margin:0!important;border-radius:0!important}.learn2{padding:12px;min-height:100dvh}.learn2-hero-content{grid-template-columns:72px 1fr;padding:16px;min-height:175px}.learn2-symbol{width:68px;height:68px;border-radius:18px}.learn2-symbol img{width:50px;height:50px}.learn2-hero h2{font-size:1.35rem}.learn2-meta{grid-column:1/-1;grid-template-columns:repeat(3,1fr);min-width:0}.learn2-meta span{padding:6px}.learn2-intro,.learn2-slide,.learn2-quiz,.learn2-summary{grid-template-columns:1fr}.learn2-slide-visual{min-height:155px}.learn2-qvisual{min-height:135px}.learn2-qvisual img{height:110px}.learn2-summary-grid{grid-template-columns:repeat(3,1fr)}.learn2-score-ring{width:150px;height:150px}.learn2-actions{display:grid;grid-template-columns:1fr}.learn2-actions .btn{width:100%}}'
  ].join('');
  document.head.appendChild(s);
}

function saveGlobal(score,correct,answers){
  const r=JSON.parse(localStorage.getItem('mobiliza.results')||'{"games":0,"correct":0,"answers":0,"best":0,"streak":0}');
  r.games=(r.games||0)+1;r.correct=(r.correct||0)+correct;r.answers=(r.answers||0)+answers;r.best=Math.max(r.best||0,score);
  localStorage.setItem('mobiliza.results',JSON.stringify(r));
}
function getProgress(){
  try{return JSON.parse(localStorage.getItem('mobiliza.learning.progress')||'{}')}catch{return {}}
}
function setTrackProgress(id,data){
  const p=getProgress();p[id]={...(p[id]||{}),...data,last:new Date().toISOString()};localStorage.setItem('mobiliza.learning.progress',JSON.stringify(p));
  window.dispatchEvent(new CustomEvent('mobiliza-learning-progress',{detail:{id,data:p[id]}}));
}
function hero(t,sub,phase='TRILHA RÁPIDA'){
  return '<div class="learn2-hero"><img class="learn2-cover" src="'+t.cover+'" alt=""><div class="learn2-hero-content"><div class="learn2-symbol"><img src="'+t.image+'" alt=""></div><div class="learn2-hero-copy"><p class="eyebrow">MOBILIZA EDUCA • '+phase+'</p><h2>'+t.icon+' '+esc(t.title)+'</h2><p>'+esc(sub)+'</p></div><div class="learn2-meta"><span>⏱ 4–6 min</span><span>👥 '+esc(t.audience)+'</span><span>🔊 Interativa</span></div></div></div>';
}
function status(pct,label){
  return '<div class="learn2-statusbar"><div class="learn2-progress"><i style="width:'+pct+'%"></i></div><span class="learn2-status">'+esc(label)+'</span></div>';
}
function collectQuestions(t,id){
  let q=getQuestionSet({count:5,audiences:['criancas','adolescentes','adultos'],categories:t.categories,avoidRecent:true,markRecent:true,recentScope:'learning-v2:'+id,recentLimit:24});
  if(q.length<5){
    const extra=getQuestionSet({count:8,audiences:['criancas','adolescentes','adultos'],avoidRecent:true,markRecent:false,recentScope:'learning-v2:fallback',recentLimit:20});
    const seen=new Set(q.map(x=>x.id));
    for(const item of extra){if(!seen.has(item.id)){q.push(item);seen.add(item.id)}if(q.length>=5)break}
  }
  return q.slice(0,5);
}

export function openLearning(dialog,host,id,onFinish){
  css();
  const t=TRACKS[id];
  if(!t)return false;
  dialog.classList.add('learning-v2-dialog');
  dialog.addEventListener('close',()=>dialog.classList.remove('learning-v2-dialog'),{once:true});

  let step=0,qIndex=0,score=0,correct=0,answers=0,locked=false;
  let questions=collectQuestions(t,id);
  let startedAt=Date.now();
  const previous=getProgress()[id]||{};

  function intro(){
    step=0;qIndex=0;score=0;correct=0;answers=0;locked=false;questions=collectQuestions(t,id);
    host.innerHTML='<section class="learn2">'+hero(t,'Uma trilha curta, visual e prática para aprender um conceito e conferir a compreensão.')+
      status(0,'Pronto para começar')+
      '<div class="learn2-intro"><div class="learn2-card"><h3>O que você vai fazer</h3><p>São três etapas rápidas de conteúdo e cinco situações de checagem. As perguntas mudam entre as rodadas para reduzir repetição.</p><div class="learn2-actions"><button class="btn primary" id="learn2Start">▶ COMEÇAR TRILHA</button></div></div>'+
      '<div class="learn2-card"><h3>Roteiro</h3><div class="learn2-road"><div class="learn2-road-step"><b>1</b><div><strong>Aprender</strong><small>3 ideias essenciais</small></div></div><div class="learn2-road-step"><b>2</b><div><strong>Aplicar</strong><small>5 situações rápidas</small></div></div><div class="learn2-road-step"><b>3</b><div><strong>Concluir</strong><small>resultado e recorde local</small></div></div></div>'+(previous.bestPct!=null?'<div class="learn2-record" style="margin-top:12px">🏅 Melhor resultado nesta trilha: <strong>'+previous.bestPct+'%</strong></div>':'')+'</div></div></section>';
    host.querySelector('#learn2Start').onclick=()=>{startedAt=Date.now();SoundManager.play('open');slide()};
  }

  function slide(){
    const s=t.slides[step],pct=Math.round(((step+1)/8)*100);
    host.innerHTML='<section class="learn2">'+hero(t,'Etapa '+(step+1)+' de 3','CONTEÚDO')+status(pct,'Etapa '+(step+1)+' de 3')+
      '<div class="learn2-slide"><div class="learn2-slide-visual"><img class="scene" src="'+t.cover+'" alt=""><div class="learn2-slide-symbol"><img src="'+t.image+'" alt=""></div></div><div class="learn2-card learn2-lesson"><div class="learn2-step-label">PONTO ESSENCIAL '+(step+1)+'</div><h3>'+esc(s.title)+'</h3><p>'+esc(s.text)+'</p><div class="learn2-tip">💡 <strong>Leve para a prática:</strong> '+esc(s.tip)+'</div><div class="learn2-actions"><button class="btn primary" id="learn2Next">'+(step===2?'IR PARA A CHECAGEM →':'CONTINUAR →')+'</button></div></div></div></section>';
    host.querySelector('#learn2Next').onclick=()=>{SoundManager.play('next');step++;if(step>2)quiz();else slide()};
  }

  function quiz(){
    if(qIndex>=questions.length){finish();return}
    const q=questions[qIndex],pct=Math.round(38+((qIndex)/questions.length)*58);
    host.innerHTML='<section class="learn2">'+hero(t,'Agora aplique o que acabou de revisar.','CHECAGEM')+status(pct,'Questão '+(qIndex+1)+' de '+questions.length)+
      '<div class="learn2-quiz"><div class="learn2-qvisual"><img src="'+esc(q.image||t.image)+'" alt=""></div><div class="learn2-card learn2-qcopy"><small>'+esc(String(q.category||'').toUpperCase())+' • '+esc(String(q.difficulty||'').toUpperCase())+'</small><h3>'+esc(q.prompt)+'</h3><div class="learn2-options">'+q.options.map((x,n)=>'<button data-learn="'+n+'"><b>'+String.fromCharCode(65+n)+'</b><span>'+esc(x)+'</span></button>').join('')+'</div><div id="learn2Feedback"></div></div></div></section>';
    host.querySelectorAll('[data-learn]').forEach(b=>b.onclick=()=>answer(Number(b.dataset.learn)));
  }

  function answer(n){
    if(locked)return;
    locked=true;answers++;
    const q=questions[qIndex],ok=n===q.correct;
    if(ok){score+=200;correct++;SoundManager.play('correct')}else SoundManager.play('wrong');
    host.querySelectorAll('[data-learn]').forEach((b,k)=>{b.disabled=true;if(k===q.correct)b.classList.add('ok');if(k===n&&k!==q.correct)b.classList.add('bad')});
    const f=host.querySelector('#learn2Feedback');
    f.className='learn2-feedback '+(ok?'ok':'bad');
    f.innerHTML='<strong>'+(ok?'✅ Correto!':'❌ Vamos revisar.')+'</strong><br>'+esc(q.why||'')+'<div class="learn2-actions"><button class="btn primary" id="learn2QuestionNext">'+(qIndex===questions.length-1?'VER RESULTADO':'PRÓXIMA SITUAÇÃO →')+'</button></div>';
    host.querySelector('#learn2QuestionNext').onclick=()=>{qIndex++;locked=false;SoundManager.play('next');quiz()};
  }

  function finish(){
    const pct=answers?Math.round(correct/answers*100):0;
    const prev=getProgress()[id]||{};
    setTrackProgress(id,{completed:true,bestPct:Math.max(prev.bestPct||0,pct),lastPct:pct,completions:(prev.completions||0)+1});
    saveGlobal(score,correct,answers);
    recordGameResult({
      kind:'learning',moduleId:'learning-'+id,title:t.title,score,correct,answers,
      durationSec:Math.round((Date.now()-startedAt)/1000),audience:t.audience,status:'concluido',
      meta:{trackId:id,bestPct:Math.max(prev.bestPct||0,pct),pct}
    });
    onFinish?.();
    SoundManager.play(pct>=80?'celebrate':'finish');
    host.innerHTML='<section class="learn2">'+hero(t,'Trilha concluída','RESULTADO')+status(100,'Concluída')+
      '<div class="learn2-summary"><div class="learn2-score-ring" style="--pct:'+pct+'%"><div><strong>'+pct+'%</strong><span>aproveitamento</span></div></div><div class="learn2-card"><h3>'+(pct>=80?'Excelente revisão!':pct>=60?'Bom caminho!':'Vale revisar novamente')+'</h3><p>Você concluiu <strong>'+esc(t.title)+'</strong>.</p><div class="learn2-summary-grid"><div><strong>'+correct+'/'+answers+'</strong><span>acertos</span></div><div><strong>'+score+'</strong><span>pontos</span></div><div><strong>'+Math.max(prev.bestPct||0,pct)+'%</strong><span>melhor</span></div></div><div class="learn2-record">💡 Refazer a trilha traz uma nova seleção de perguntas e reforça os pontos essenciais.</div><div class="learn2-actions"><button class="btn primary" id="learn2Again">🔁 NOVA RODADA</button><button class="btn ghost" id="learn2Close">ENCERRAR</button></div></div></div></section>';
    host.querySelector('#learn2Again').onclick=intro;
    host.querySelector('#learn2Close').onclick=()=>dialog.close();
  }

  intro();
  if(!dialog.open)dialog.showModal();
  return true;
}
