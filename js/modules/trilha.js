const BOARD_SIZE=24;
const COLS=6;
const DICE=['⚀','⚁','⚂','⚃','⚄','⚅'];

const SPECIALS={
  4:{icon:'🚦',label:'Semáforo',title:'Atenção no amarelo',message:'Você reduziu e agiu com prudência. Avance 1 casa.',delta:1,tone:'good'},
  7:{icon:'🚶',label:'Pedestre',title:'Faixa respeitada',message:'Você deu preferência ao pedestre. Avance 2 casas.',delta:2,tone:'good'},
  10:{icon:'📵',label:'Celular',title:'Distração ao volante',message:'Usar o celular tira a atenção da via. Volte 2 casas.',delta:-2,tone:'bad'},
  13:{icon:'🚲',label:'Ciclista',title:'Convivência segura',message:'Você manteve distância segura do ciclista. Avance 2 casas.',delta:2,tone:'good'},
  16:{icon:'🛡️',label:'Cinto',title:'Proteção para todos',message:'Todos estão usando cinto de segurança. Avance 1 casa.',delta:1,tone:'good'},
  19:{icon:'⚠️',label:'Velocidade',title:'Excesso de velocidade',message:'Velocidade incompatível aumenta o risco. Volte 3 casas.',delta:-3,tone:'bad'},
  21:{icon:'🚸',label:'Escola',title:'Área escolar',message:'Você reduziu a velocidade e redobrou a atenção. Avance 1 casa.',delta:1,tone:'good'}
};

const QUIZ_HOUSES=new Set([3,8,12,18,22]);
const QUESTIONS=[
  {q:'Antes de atravessar, o pedestre deve observar os dois sentidos?',answer:true,why:'Sim. Mesmo na faixa, atenção e observação continuam essenciais.'},
  {q:'É seguro usar o celular enquanto dirige?',answer:false,why:'Não. A distração reduz percepção e tempo de reação.'},
  {q:'O cinto de segurança deve ser usado também no banco traseiro?',answer:true,why:'Sim. Todos os ocupantes devem estar protegidos.'},
  {q:'Em área escolar é importante reduzir a velocidade?',answer:true,why:'Sim. Crianças e pedestres exigem atenção reforçada.'},
  {q:'O semáforo amarelo significa acelerar para passar antes do vermelho?',answer:false,why:'Não. O amarelo indica atenção e preparação para parar com segurança.'},
  {q:'Ao ultrapassar um ciclista, deve-se manter distância lateral segura?',answer:true,why:'Sim. Distância e visibilidade ajudam a proteger o ciclista.'}
];

function sleep(ms){return new Promise(r=>setTimeout(r,ms));}
function clamp(v,min,max){return Math.max(min,Math.min(max,v));}
function shuffle(a){const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b;}
function saveResult(score){
  const s=JSON.parse(localStorage.getItem('mobiliza.results')||'{"games":0,"correct":0,"answers":0,"best":0,"streak":0}');
  s.games=(s.games||0)+1;
  s.best=Math.max(s.best||0,score);
  localStorage.setItem('mobiliza.results',JSON.stringify(s));
}

export function openTrilha(dialog,host,onFinish){
  let players=[
    {name:'Azul',pos:0,color:'blue'},
    {name:'Amarelo',pos:0,color:'yellow'}
  ];
  let turn=0;
  let rolls=0;
  let busy=false;
  let lastQuestionOrder=shuffle(QUESTIONS.map((_,i)=>i));
  let qCursor=0;

  const current=()=>players[turn];

  const visualOrder=index=>{
    const row=Math.floor(index/COLS);
    const col=index%COLS;
    return row%2===0 ? row*COLS+col : row*COLS+(COLS-1-col);
  };

  const pawnHtml=p=>`<span class="trail-pawn ${p.color}" title="${p.name}" aria-label="${p.name}"></span>`;

  const cellLabel=i=>{
    if(i===0)return 'INÍCIO';
    if(i===BOARD_SIZE-1)return 'CHEGADA';
    return String(i+1);
  };

  const drawBoard=()=>Array.from({length:BOARD_SIZE},(_,i)=>{
    const here=players.filter(p=>p.pos===i);
    const sp=SPECIALS[i];
    const quiz=QUIZ_HOUSES.has(i);
    const row=Math.floor(i/COLS);
    const direction=row%2===0?'→':'←';
    return `<div class="trail-cell ${i===0?'start':''} ${i===BOARD_SIZE-1?'finish':''} ${sp?'special':''} ${quiz?'quiz-house':''}" data-cell="${i}" style="order:${visualOrder(i)}">
      <div class="trail-cell-top">
        <span class="trail-cell-no">${cellLabel(i)}</span>
        ${i!==BOARD_SIZE-1&&i!==0?`<span class="trail-direction" aria-hidden="true">${direction}</span>`:''}
      </div>
      ${sp?`<div class="trail-special"><em>${sp.icon}</em><small>${sp.label}</small></div>`:quiz?'<div class="trail-special"><em>❓</em><small>DESAFIO</small></div>':''}
      <div class="trail-pawns">${here.map(pawnHtml).join('')}</div>
    </div>`;
  }).join('');

  const playerStatus=()=>players.map((p,i)=>{
    const percent=Math.round((p.pos/(BOARD_SIZE-1))*100);
    return `<div class="trail-player-card ${i===turn?'active':''}">
      <div class="trail-player-name"><span class="trail-pawn ${p.color}"></span><strong>${p.name}</strong></div>
      <div class="trail-progress"><i style="width:${percent}%"></i></div>
      <small>Casa ${p.pos+1} • ${percent}%</small>
    </div>`;
  }).join('');

  const render=()=>{
    host.innerHTML=`<section class="game trail-game trail-v15">
      <div class="trail-hero">
        <img src="assets/games/trilha_do_transito_agentes_mirins.svg?v=15" alt="Trilha do Trânsito">
        <div>
          <p class="eyebrow">TRILHA DO TRÂNSITO</p>
          <h2>Corrida pela segurança</h2>
          <p>Jogue o dado, avance casa por casa e enfrente situações educativas até chegar primeiro.</p>
        </div>
      </div>

      <div class="trail-dashboard">
        <div class="trail-turn-panel">
          <span class="turn-label">VEZ DE</span>
          <h3><span class="trail-pawn ${current().color}"></span> ${current().name}</h3>
          <p>Rodadas: <strong>${rolls}</strong></p>
        </div>
        <div class="trail-player-list">${playerStatus()}</div>
        <div class="trail-actions-top">
          <button type="button" class="btn ghost" id="trailRules">❔ Como jogar</button>
          <button type="button" class="btn ghost" id="trailRestart">↻ Reiniciar</button>
        </div>
      </div>

      <div class="trail-board-wrap">
        <div class="trail-board" id="trailBoard">${drawBoard()}</div>
      </div>

      <div class="trail-controls">
        <div class="trail-tip">
          <strong>Objetivo:</strong> chegue à casa ${BOARD_SIZE} antes do adversário.
        </div>
        <button type="button" class="btn primary big trail-roll-button" id="rollDice">🎲 JOGAR DADO</button>
      </div>

      <div id="trailMessage" class="trail-message"></div>
      <div id="trailOverlay" class="trail-overlay" aria-live="polite"></div>
    </section>`;

    host.querySelector('#rollDice').onclick=roll;
    host.querySelector('#trailRules').onclick=showRules;
    host.querySelector('#trailRestart').onclick=confirmRestart;
  };

  const repaint=()=>{
    host.querySelectorAll('.trail-pawns').forEach(el=>el.innerHTML='');
    players.forEach(p=>{
      const box=host.querySelector(`[data-cell="${p.pos}"] .trail-pawns`);
      if(box)box.insertAdjacentHTML('beforeend',pawnHtml(p));
    });
    host.querySelectorAll('.trail-cell').forEach(el=>el.classList.remove('occupied-current'));
    const curCell=host.querySelector(`[data-cell="${current().pos}"]`);
    curCell?.classList.add('occupied-current');
  };

  const overlay=(html,extra='')=>{
    const o=host.querySelector('#trailOverlay');
    if(!o)return null;
    o.className=`trail-overlay show ${extra}`;
    o.innerHTML=html;
    return o;
  };

  const closeOverlay=()=>{
    const o=host.querySelector('#trailOverlay');
    if(!o)return;
    o.className='trail-overlay';
    o.innerHTML='';
  };

  const showDice=async()=>{
    const o=overlay(`<div class="trail-modal trail-dice-modal">
      <p class="eyebrow">LANÇANDO O DADO</p>
      <div class="trail-big-dice" id="trailBigDice">⚀</div>
      <h3 id="trailDiceText">Boa sorte, ${current().name}!</h3>
    </div>`,'dice-overlay');

    const die=o.querySelector('#trailBigDice');
    for(let k=0;k<14;k++){
      die.textContent=DICE[Math.floor(Math.random()*6)];
      die.classList.toggle('flip',k%2===0);
      await sleep(75);
    }
    const value=Math.floor(Math.random()*6)+1;
    die.textContent=DICE[value-1];
    die.classList.add('stopped');
    o.querySelector('#trailDiceText').textContent=`${current().name} tirou ${value}!`;
    await sleep(800);
    closeOverlay();
    return value;
  };

  const move=async(delta,{showMessage=true}={})=>{
    const p=current();
    const start=p.pos;
    const target=clamp(start+delta,0,BOARD_SIZE-1);
    const step=target>=start?1:-1;

    if(target===start)return false;

    for(let x=start+step;step>0?x<=target:x>=target;x+=step){
      p.pos=x;
      repaint();
      const cell=host.querySelector(`[data-cell="${x}"]`);
      cell?.classList.add('moving');
      await sleep(220);
      cell?.classList.remove('moving');
    }

    if(showMessage){
      const verb=delta>0?'avançou':'voltou';
      host.querySelector('#trailMessage').innerHTML=`<div class="trail-inline-status"><span>📍</span><strong>${p.name} ${verb} para a casa ${p.pos+1}.</strong></div>`;
    }

    if(p.pos>=BOARD_SIZE-1){
      finish(p);
      return true;
    }
    return false;
  };

  const showEvent=async(sp)=>{
    const tone=sp.tone==='bad'?'bad':'good';
    const o=overlay(`<div class="trail-modal trail-event-modal ${tone}">
      <div class="trail-event-icon">${sp.icon}</div>
      <p class="eyebrow">CASA ESPECIAL</p>
      <h3>${sp.title}</h3>
      <p>${sp.message}</p>
      <button type="button" class="btn primary" id="trailEventContinue">CONTINUAR</button>
    </div>`,'event-overlay');

    await new Promise(resolve=>{
      o.querySelector('#trailEventContinue').onclick=()=>{closeOverlay();resolve();};
    });

    if(sp.delta!==0)return await move(sp.delta,{showMessage:false});
    return false;
  };

  const nextQuestion=()=>{
    if(qCursor>=lastQuestionOrder.length){
      lastQuestionOrder=shuffle(QUESTIONS.map((_,i)=>i));
      qCursor=0;
    }
    return QUESTIONS[lastQuestionOrder[qCursor++]];
  };

  const showQuestion=async()=>{
    const q=nextQuestion();
    const o=overlay(`<div class="trail-modal trail-question-modal">
      <div class="trail-event-icon">❓</div>
      <p class="eyebrow">DESAFIO EDUCATIVO</p>
      <h3>${q.q}</h3>
      <div class="trail-question-actions">
        <button type="button" class="btn primary" data-answer="true">SIM</button>
        <button type="button" class="btn ghost" data-answer="false">NÃO</button>
      </div>
      <div id="trailQuestionResult"></div>
    </div>`,'question-overlay');

    return await new Promise(resolve=>{
      o.querySelectorAll('[data-answer]').forEach(btn=>btn.onclick=()=>{
        const answer=btn.dataset.answer==='true';
        const ok=answer===q.answer;
        o.querySelectorAll('[data-answer]').forEach(x=>x.disabled=true);
        const result=o.querySelector('#trailQuestionResult');
        result.innerHTML=`<div class="trail-question-result ${ok?'ok':'no'}">
          <strong>${ok?'✅ Acertou!':'💡 Quase!'}</strong>
          <p>${q.why}</p>
          <button type="button" class="btn primary" id="trailQuestionContinue">CONTINUAR</button>
        </div>`;
        result.querySelector('#trailQuestionContinue').onclick=()=>{
          closeOverlay();
          resolve(ok);
        };
      });
    });
  };

  const processLanding=async()=>{
    const p=current();
    if(p.pos>=BOARD_SIZE-1){finish(p);return true;}

    const sp=SPECIALS[p.pos];
    if(sp){
      if(await showEvent(sp))return true;
      return false;
    }

    if(QUIZ_HOUSES.has(p.pos)){
      const ok=await showQuestion();
      if(ok){
        host.querySelector('#trailMessage').innerHTML='<div class="trail-inline-status good"><span>✅</span><strong>Resposta correta: avance 1 casa extra!</strong></div>';
        if(await move(1,{showMessage:false}))return true;
      }else{
        host.querySelector('#trailMessage').innerHTML='<div class="trail-inline-status"><span>💡</span><strong>Continue no jogo e leve a dica para o trânsito.</strong></div>';
      }
    }
    return false;
  };

  const switchTurn=()=>{
    turn=(turn+1)%players.length;
    render();
    const cell=host.querySelector(`[data-cell="${current().pos}"]`);
    cell?.classList.add('occupied-current');
  };

  const roll=async()=>{
    if(busy)return;
    busy=true;
    const btn=host.querySelector('#rollDice');
    if(btn)btn.disabled=true;

    const value=await showDice();
    rolls++;

    if(await move(value)){busy=false;return;}
    if(await processLanding()){busy=false;return;}

    await sleep(350);
    busy=false;
    switchTurn();
  };

  const showRules=()=>{
    const o=overlay(`<div class="trail-modal trail-rules-modal">
      <div class="trail-event-icon">🛣️</div>
      <p class="eyebrow">COMO JOGAR</p>
      <h3>Chegue primeiro à casa ${BOARD_SIZE}</h3>
      <div class="trail-rules-list">
        <p><b>🎲 Dado:</b> clique em Jogar dado e avance casa por casa.</p>
        <p><b>🚦 Casas especiais:</b> boas atitudes fazem avançar; situações de risco podem fazer voltar.</p>
        <p><b>❓ Desafios:</b> respostas corretas dão 1 casa extra.</p>
        <p><b>🏁 Vitória:</b> vence quem alcançar primeiro a chegada.</p>
      </div>
      <button type="button" class="btn primary" id="trailRulesClose">ENTENDI</button>
    </div>`,'rules-overlay');
    o.querySelector('#trailRulesClose').onclick=closeOverlay;
  };

  const confirmRestart=()=>{
    const o=overlay(`<div class="trail-modal trail-restart-modal">
      <div class="trail-event-icon">↻</div>
      <h3>Reiniciar a partida?</h3>
      <p>As posições atuais serão zeradas.</p>
      <div class="trail-question-actions">
        <button type="button" class="btn primary" id="restartYes">SIM, REINICIAR</button>
        <button type="button" class="btn ghost" id="restartNo">CANCELAR</button>
      </div>
    </div>`,'restart-overlay');
    o.querySelector('#restartYes').onclick=()=>openTrilha(dialog,host,onFinish);
    o.querySelector('#restartNo').onclick=closeOverlay;
  };

  const finish=p=>{
    busy=true;
    saveResult(Math.max(0,1000-rolls*10));
    onFinish?.();
    host.innerHTML=`<section class="game trail-result trail-v15">
      <img class="trail-result-cover" src="assets/games/trilha_do_transito_agentes_mirins.svg?v=15" alt="">
      <div class="result-trophy">🏁</div>
      <p class="eyebrow">CHEGADA!</p>
      <h2><span class="trail-pawn ${p.color}"></span> ${p.name} venceu a Trilha do Trânsito!</h2>
      <p>Partida concluída em <strong>${rolls}</strong> rodadas.</p>
      <div class="hero-actions">
        <button type="button" class="btn primary" id="trailAgain">Jogar novamente</button>
        <button type="button" class="btn ghost" id="trailClose">Encerrar</button>
      </div>
    </section>`;
    host.querySelector('#trailAgain').onclick=()=>openTrilha(dialog,host,onFinish);
    host.querySelector('#trailClose').onclick=()=>dialog.close();
  };

  render();
  host.querySelector(`[data-cell="${current().pos}"]`)?.classList.add('occupied-current');
  if(!dialog.open)dialog.showModal();
}