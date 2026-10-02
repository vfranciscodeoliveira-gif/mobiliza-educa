const BOARD_SIZE=24;
const COLS=6;

const SPECIALS={
  4:{icon:'🚦',label:'Semáforo',title:'Atenção no amarelo',message:'Boa conduta no semáforo. Avance 1 casa.',delta:1,tone:'good'},
  7:{icon:'🚶',label:'Pedestre',title:'Faixa respeitada',message:'Você deu preferência ao pedestre. Avance 2 casas.',delta:2,tone:'good'},
  10:{icon:'📵',label:'Celular',title:'Distração ao volante',message:'Usar o celular tira a atenção da via. Volte 2 casas.',delta:-2,tone:'bad'},
  13:{icon:'🚲',label:'Ciclista',title:'Convivência segura',message:'Você manteve distância segura do ciclista. Avance 2 casas.',delta:2,tone:'good'},
  16:{icon:'🛡️',label:'Cinto',title:'Proteção para todos',message:'Todos estão usando cinto de segurança. Avance 1 casa.',delta:1,tone:'good'},
  19:{icon:'⚠️',label:'Velocidade',title:'Excesso de velocidade',message:'Velocidade incompatível aumenta o risco. Volte 3 casas.',delta:-3,tone:'bad'},
  21:{icon:'🚸',label:'Escola',title:'Área escolar',message:'Você reduziu a velocidade e redobrou a atenção. Avance 1 casa.',delta:1,tone:'good'}
};

const BONUS_HOUSES=new Set([3,8,12,18,22]);

const QUESTIONS=[
  {q:'Ao se aproximar de uma faixa de pedestres ocupada, o condutor deve:',options:['Acelerar para passar primeiro','Reduzir a velocidade e dar passagem','Buzinar para o pedestre sair','Desviar pela contramão'],correct:1,why:'A travessia deve ser protegida com velocidade compatível e prioridade ao pedestre.'},
  {q:'O cinto de segurança deve ser usado:',options:['Somente pelo motorista','Somente em rodovias','Por todos os ocupantes','Só nos bancos dianteiros'],correct:2,why:'Todos os ocupantes devem usar cinto, inclusive no banco traseiro.'},
  {q:'Usar o celular enquanto dirige:',options:['É seguro em baixa velocidade','Só é arriscado à noite','Divide a atenção e aumenta o risco','É permitido se o trânsito estiver parado'],correct:2,why:'A distração visual, manual e cognitiva reduz a percepção e o tempo de reação.'},
  {q:'Em área escolar, a atitude mais segura é:',options:['Acelerar para liberar a via','Reduzir a velocidade e redobrar a atenção','Buzinar continuamente','Parar sobre a faixa'],correct:1,why:'Áreas escolares exigem velocidade adequada e atenção reforçada aos pedestres.'},
  {q:'No semáforo amarelo, o condutor deve:',options:['Acelerar sempre','Ignorar a sinalização','Reduzir e parar com segurança quando possível','Parar no meio do cruzamento'],correct:2,why:'O amarelo indica atenção e transição; a parada deve ocorrer de modo seguro.'},
  {q:'Ao ultrapassar um ciclista, o mais seguro é:',options:['Passar muito perto','Manter distância lateral segura','Buzinar até ele sair da via','Ultrapassar em curva'],correct:1,why:'Distância lateral e visibilidade ajudam a proteger o ciclista.'},
  {q:'Em pista molhada, é recomendado:',options:['Aumentar a velocidade','Reduzir a distância do veículo da frente','Reduzir a velocidade e aumentar a distância','Frear bruscamente nas curvas'],correct:2,why:'A aderência diminui na chuva e a distância necessária para parar aumenta.'},
  {q:'Antes de mudar de faixa, o condutor deve:',options:['Sinalizar e verificar espelhos e ponto cego','Mudar rapidamente sem sinalizar','Olhar apenas para frente','Buzinar e mudar imediatamente'],correct:0,why:'A sinalização e a verificação do entorno tornam a manobra previsível e segura.'},
  {q:'Para atravessar a rua com segurança, o pedestre deve:',options:['Atravessar entre carros estacionados','Usar a faixa e observar os dois sentidos','Correr sem olhar','Usar o celular durante a travessia'],correct:1,why:'A faixa organiza a travessia, mas a atenção ao trânsito continua indispensável.'},
  {q:'Se o motorista estiver cansado ou sonolento, deve:',options:['Abrir a janela e seguir','Aumentar a velocidade','Interromper a condução e descansar','Usar o celular para se manter acordado'],correct:2,why:'A sonolência compromete atenção e tempo de reação.'},
  {q:'Manter distância segura do veículo da frente serve para:',options:['Criar espaço para reagir e frear','Diminuir o tempo de reação','Aumentar a velocidade média','Evitar olhar para os espelhos'],correct:0,why:'A distância de segurança fornece espaço para percepção, reação e frenagem.'},
  {q:'A seta deve ser usada:',options:['Depois que a manobra começou','Somente em rodovias','Antes de conversões e mudanças de faixa','Apenas quando houver fiscalização'],correct:2,why:'A sinalização deve anteceder a manobra para que os demais usuários percebam sua intenção.'}
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
  let rounds=0;
  let busy=false;
  let correctAnswers=0;
  let answers=0;
  let soundOn=localStorage.getItem('mobiliza.trilha.sound')!=='0';
  let audioCtx=null;
  let questionOrder=shuffle(QUESTIONS.map((_,i)=>i));
  let qCursor=0;

  const current=()=>players[turn];

  const ensureAudio=()=>{
    if(!soundOn)return null;
    try{
      const C=window.AudioContext||window.webkitAudioContext;
      if(!C)return null;
      if(!audioCtx)audioCtx=new C();
      if(audioCtx.state==='suspended')audioCtx.resume();
      return audioCtx;
    }catch{return null;}
  };

  const tone=(freq,duration=.09,delay=0,type='sine',gain=.045)=>{
    const c=ensureAudio();
    if(!c)return;
    const o=c.createOscillator(),g=c.createGain();
    const start=c.currentTime+delay;
    o.type=type;
    o.frequency.setValueAtTime(freq,start);
    g.gain.setValueAtTime(0.0001,start);
    g.gain.exponentialRampToValueAtTime(gain,start+.01);
    g.gain.exponentialRampToValueAtTime(0.0001,start+duration);
    o.connect(g);g.connect(c.destination);
    o.start(start);o.stop(start+duration+.03);
  };

  const sounds={
    click:()=>tone(520,.045,0,'square',.025),
    correct:()=>{tone(523,.09,0,'sine',.05);tone(659,.09,.09,'sine',.05);tone(784,.16,.18,'sine',.055);},
    error:()=>{tone(330,.11,0,'sawtooth',.04);tone(220,.16,.12,'sawtooth',.04);},
    bonus:()=>{tone(659,.08,0,'triangle',.05);tone(784,.08,.08,'triangle',.05);tone(988,.18,.16,'triangle',.055);},
    step:()=>tone(380,.035,0,'square',.018),
    turn:()=>{tone(440,.05,0,'triangle',.026);tone(554,.07,.055,'triangle',.025);},
    diceTick:(n)=>tone(170+(n*45),.035,0,'square',.018),
    diceStop:(n)=>{tone(300+n*70,.10,0,'triangle',.045);tone(520+n*55,.13,.08,'triangle',.04);},
    badSpecial:()=>{tone(260,.08,0,'sawtooth',.035);tone(185,.14,.08,'sawtooth',.03);},
    win:()=>{tone(523,.10,0,'triangle',.05);tone(659,.10,.10,'triangle',.05);tone(784,.10,.20,'triangle',.05);tone(1046,.28,.30,'triangle',.06);}
  };

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
    const bonus=BONUS_HOUSES.has(i);
    const row=Math.floor(i/COLS);
    const direction=row%2===0?'→':'←';
    return `<div class="trail-cell ${i===0?'start':''} ${i===BOARD_SIZE-1?'finish':''} ${sp?'special':''} ${bonus?'quiz-house':''}" data-cell="${i}" style="order:${visualOrder(i)}">
      <div class="trail-cell-top">
        <span class="trail-cell-no">${cellLabel(i)}</span>
        ${i!==BOARD_SIZE-1&&i!==0?`<span class="trail-direction" aria-hidden="true">${direction}</span>`:''}
      </div>
      ${i===0?'<div class="trail-special trail-start-mark"><em>🚦</em><small>LARGADA</small></div>':i===BOARD_SIZE-1?'<div class="trail-special trail-finish-mark"><em>🏁</em><small>CHEGADA</small></div>':sp?`<div class="trail-special"><em>${sp.icon}</em><small>${sp.label}</small></div>`:bonus?'<div class="trail-special"><em>⭐</em><small>BÔNUS</small></div>':''}
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
    host.innerHTML=`<section class="game trail-game trail-v18">
      <div class="trail-hero">
        <img src="assets/games/trilha_do_transito_agentes_mirins.svg?v=18" alt="Trilha do Trânsito">
        <div>
          <p class="eyebrow">TRILHA DO TRÂNSITO</p>
          <h2>Corrida pela segurança</h2>
          <p>Responda corretamente, libere o dado e avance. Se errar, perde a vez.</p>
        </div>
      </div>

      <div class="trail-dashboard">
        <div class="trail-turn-panel">
          <span class="turn-label">VEZ DE</span>
          <h3><span class="trail-pawn ${current().color}"></span> ${current().name}</h3>
          <p>Rodadas: <strong>${rounds}</strong></p>
        </div>

        <div class="trail-player-list">${playerStatus()}</div>

        <div class="trail-actions-top">
          <button type="button" class="btn ghost" id="trailSound">${soundOn?'🔊 Som':'🔇 Som'}</button>
          <button type="button" class="btn ghost" id="trailRules">❔ Como jogar</button>
          <button type="button" class="btn ghost" id="trailRestart">↻ Reiniciar</button>
        </div>
      </div>

      <div class="trail-turn-action">
        <div class="trail-dice-lock">
          <span class="trail-dice-preview ${current().color}"><b>?</b></span>
          <div>
            <strong>Dado bloqueado</strong>
            <small>Acerte a pergunta para liberar o lançamento.</small>
          </div>
        </div>
        <button type="button" class="btn primary big trail-question-button" id="answerQuestion">❓ RESPONDER PERGUNTA</button>
      </div>

      <div class="trail-board-wrap">
        <div class="trail-board" id="trailBoard">${drawBoard()}</div>
      </div>

      <div id="trailMessage" class="trail-message"></div>
      <div id="trailOverlay" class="trail-overlay" aria-live="polite"></div>
    </section>`;

    host.querySelector('#answerQuestion').onclick=playTurn;
    host.querySelector('#trailRules').onclick=showRules;
    host.querySelector('#trailRestart').onclick=confirmRestart;
    host.querySelector('#trailSound').onclick=()=>{
      soundOn=!soundOn;
      localStorage.setItem('mobiliza.trilha.sound',soundOn?'1':'0');
      if(soundOn){ensureAudio();sounds.click();}
      render();
      host.querySelector(`[data-cell="${current().pos}"]`)?.classList.add('occupied-current');
    };
  };

  const repaint=()=>{
    host.querySelectorAll('.trail-pawns').forEach(el=>el.innerHTML='');
    players.forEach(p=>{
      const box=host.querySelector(`[data-cell="${p.pos}"] .trail-pawns`);
      if(box)box.insertAdjacentHTML('beforeend',pawnHtml(p));
    });
    host.querySelectorAll('.trail-cell').forEach(el=>el.classList.remove('occupied-current'));
    host.querySelector(`[data-cell="${current().pos}"]`)?.classList.add('occupied-current');
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

  const nextQuestion=()=>{
    if(qCursor>=questionOrder.length){
      questionOrder=shuffle(QUESTIONS.map((_,i)=>i));
      qCursor=0;
    }
    return QUESTIONS[questionOrder[qCursor++]];
  };

  const askQuestion=async()=>{
    ensureAudio();
    sounds.click();
    const q=nextQuestion();
    const o=overlay(`<div class="trail-modal trail-question-modal trail-turn-question">
      <div class="trail-event-icon">❓</div>
      <p class="eyebrow">PERGUNTA DA RODADA</p>
      <h3>${q.q}</h3>
      <div class="trail-answer-grid">
        ${q.options.map((opt,i)=>`<button type="button" class="trail-answer-option" data-answer="${i}"><b>${String.fromCharCode(65+i)}</b><span>${opt}</span></button>`).join('')}
      </div>
      <div id="trailQuestionResult"></div>
    </div>`,'question-overlay');

    return await new Promise(resolve=>{
      o.querySelectorAll('[data-answer]').forEach(btn=>btn.onclick=()=>{
        const picked=Number(btn.dataset.answer);
        const ok=picked===q.correct;
        answers++;

        o.querySelectorAll('[data-answer]').forEach((x,i)=>{
          x.disabled=true;
          if(i===q.correct)x.classList.add('correct');
          if(i===picked&&i!==q.correct)x.classList.add('wrong');
        });

        const result=o.querySelector('#trailQuestionResult');
        if(ok){
          correctAnswers++;
          sounds.correct();
          result.innerHTML=`<div class="trail-question-result ok">
            <strong>✅ RESPOSTA CORRETA!</strong>
            <p>${q.why}</p>
            <button type="button" class="btn primary big" id="questionOkContinue">🎲 LIBERAR O DADO</button>
          </div>`;
          result.querySelector('#questionOkContinue').onclick=()=>{
            sounds.click();
            closeOverlay();
            resolve(true);
          };
        }else{
          sounds.error();
          result.innerHTML=`<div class="trail-question-result no">
            <strong>❌ RESPOSTA INCORRETA</strong>
            <p>${q.why}</p>
            <p><b>${current().name}</b> perde a vez.</p>
            <button type="button" class="btn primary" id="questionWrongContinue">PASSAR A VEZ</button>
          </div>`;
          result.querySelector('#questionWrongContinue').onclick=()=>{
            sounds.click();
            closeOverlay();
            resolve(false);
          };
        }
      });
    });
  };

  const dieFace=(value)=>`<span class="trail-die-pips">${['⚀','⚁','⚂','⚃','⚄','⚅'][value-1]}</span><span class="trail-die-number">${value}</span>`;

  const throwDice=async()=>{
    const o=overlay(`<div class="trail-modal trail-dice-modal trail-dice-ready">
      <p class="eyebrow">DADO LIBERADO</p>
      <h3>${current().name}, clique no dado!</h3>
      <button type="button" class="trail-die-cube ${current().color}" id="trailBigDice" data-value="1" aria-label="Jogar dado">${dieFace(1)}</button>
      <p id="trailDiceText">Clique para lançar</p>
    </div>`,'dice-overlay');

    return await new Promise(resolve=>{
      const die=o.querySelector('#trailBigDice');
      let rolling=false;
      die.onclick=async()=>{
        if(rolling)return;
        rolling=true;
        die.disabled=true;
        sounds.click();
        o.querySelector('#trailDiceText').textContent='Jogando...';

        for(let k=0;k<18;k++){
          const n=Math.floor(Math.random()*6)+1;
          die.dataset.value=String(n);
          die.innerHTML=dieFace(n);
          die.classList.toggle('rolling-a',k%2===0);
          die.classList.toggle('rolling-b',k%2!==0);
          sounds.diceTick(n);
          await sleep(65+k*2);
        }

        const value=Math.floor(Math.random()*6)+1;
        die.dataset.value=String(value);
        die.innerHTML=dieFace(value);
        die.classList.remove('rolling-a','rolling-b');
        die.classList.add('stopped');
        sounds.diceStop(value);
        o.querySelector('#trailDiceText').innerHTML=`Você tirou <strong>${value}</strong>!`;
        await sleep(900);
        closeOverlay();
        resolve(value);
      };
    });
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
      sounds.step();
      await sleep(210);
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

  const showSpecial=async(sp)=>{
    if(sp.tone==='bad')sounds.badSpecial();else sounds.bonus();
    const toneClass=sp.tone==='bad'?'bad':'good';
    const o=overlay(`<div class="trail-modal trail-event-modal ${toneClass}">
      <div class="trail-event-icon">${sp.icon}</div>
      <p class="eyebrow">CASA ESPECIAL</p>
      <h3>${sp.title}</h3>
      <p>${sp.message}</p>
      <button type="button" class="btn primary" id="trailEventContinue">CONTINUAR</button>
    </div>`,'event-overlay');

    await new Promise(resolve=>{
      o.querySelector('#trailEventContinue').onclick=()=>{sounds.click();closeOverlay();resolve();};
    });

    if(sp.delta!==0)return await move(sp.delta,{showMessage:false});
    return false;
  };

  const showBonus=async()=>{
    sounds.bonus();
    const o=overlay(`<div class="trail-modal trail-event-modal good">
      <div class="trail-event-icon">⭐</div>
      <p class="eyebrow">CASA BÔNUS</p>
      <h3>Bônus de segurança!</h3>
      <p>Boa atitude: avance mais 1 casa.</p>
      <button type="button" class="btn primary" id="trailBonusContinue">CONTINUAR</button>
    </div>`,'event-overlay');

    await new Promise(resolve=>{
      o.querySelector('#trailBonusContinue').onclick=()=>{sounds.click();closeOverlay();resolve();};
    });
    return await move(1,{showMessage:false});
  };

  const processLanding=async()=>{
    if(current().pos>=BOARD_SIZE-1){finish(current());return true;}
    const sp=SPECIALS[current().pos];
    if(sp)return await showSpecial(sp);
    if(BONUS_HOUSES.has(current().pos))return await showBonus();
    return false;
  };

  const passTurn=async(message)=>{
    if(message){
      host.querySelector('#trailMessage').innerHTML=`<div class="trail-inline-status"><span>🔄</span><strong>${message}</strong></div>`;
      await sleep(420);
    }
    turn=(turn+1)%players.length;
    sounds.turn();
    busy=false;
    render();
    host.querySelector(`[data-cell="${current().pos}"]`)?.classList.add('occupied-current');
  };

  const playTurn=async()=>{
    if(busy)return;
    busy=true;
    ensureAudio();

    const btn=host.querySelector('#answerQuestion');
    if(btn)btn.disabled=true;

    const correct=await askQuestion();

    if(!correct){
      await passTurn(`${players[turn].name} perdeu a vez. Agora é a vez de ${players[(turn+1)%players.length].name}.`);
      return;
    }

    const value=await throwDice();
    rounds++;

    if(await move(value)){busy=false;return;}
    if(await processLanding()){busy=false;return;}

    await passTurn(`Fim da jogada de ${current().name}. Vez do próximo jogador.`);
  };

  const showRules=()=>{
    sounds.click();
    const o=overlay(`<div class="trail-modal trail-rules-modal">
      <div class="trail-event-icon">🛣️</div>
      <p class="eyebrow">COMO JOGAR</p>
      <h3>Regra da versão Windows</h3>
      <div class="trail-rules-list">
        <p><b>1. ❓ Pergunta:</b> o jogador responde primeiro.</p>
        <p><b>2. ✅ Acertou:</b> o dado é liberado.</p>
        <p><b>3. 🎲 Dado:</b> clique no dado colorido para sortear de 1 a 6.</p>
        <p><b>4. 🚶 Movimento:</b> o peão avança casa por casa.</p>
        <p><b>5. ❌ Errou:</b> não joga o dado e perde a vez.</p>
        <p><b>6. ⭐ Casas especiais:</b> podem avançar ou voltar.</p>
        <p><b>7. 🏁 Vitória:</b> vence quem chegar primeiro.</p>
      </div>
      <button type="button" class="btn primary" id="trailRulesClose">ENTENDI</button>
    </div>`,'rules-overlay');
    o.querySelector('#trailRulesClose').onclick=()=>{sounds.click();closeOverlay();};
  };

  const confirmRestart=()=>{
    sounds.click();
    const o=overlay(`<div class="trail-modal trail-restart-modal">
      <div class="trail-event-icon">↻</div>
      <h3>Reiniciar a partida?</h3>
      <p>As posições atuais serão zeradas.</p>
      <div class="trail-question-actions">
        <button type="button" class="btn primary" id="restartYes">SIM, REINICIAR</button>
        <button type="button" class="btn ghost" id="restartNo">CANCELAR</button>
      </div>
    </div>`,'restart-overlay');
    o.querySelector('#restartYes').onclick=()=>{sounds.click();openTrilha(dialog,host,onFinish);};
    o.querySelector('#restartNo').onclick=()=>{sounds.click();closeOverlay();};
  };

  const finish=p=>{
    busy=true;
    sounds.win();
    saveResult(Math.max(0,1000-rounds*10)+(correctAnswers*20));
    onFinish?.();

    host.innerHTML=`<section class="game trail-result trail-v18">
      <img class="trail-result-cover" src="assets/games/trilha_do_transito_agentes_mirins.svg?v=18" alt="">
      <div class="result-trophy">🏁</div>
      <p class="eyebrow">CHEGADA!</p>
      <h2><span class="trail-pawn ${p.color}"></span> ${p.name} venceu a Trilha do Trânsito!</h2>
      <p>Partida concluída em <strong>${rounds}</strong> rodada(s), com <strong>${correctAnswers}</strong> acerto(s) em <strong>${answers}</strong> resposta(s).</p>
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