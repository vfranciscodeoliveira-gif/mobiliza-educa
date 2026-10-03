import { getQuestionSet } from '../core/questionEngine.js?v=2';
import { SoundManager } from '../core/soundManager.js?v=1';

function css(){
  if(document.getElementById('plateia-local-v3')) return;
  const s=document.createElement('style');
  s.id='plateia-local-v3';
  s.textContent=[
    '#gameDialog.plateia-v3-dialog{width:min(1180px,96vw)!important;max-width:96vw!important;max-height:94vh!important}',
    '#gameDialog.plateia-v3-dialog>.dialog-shell{max-height:94vh!important;overflow:auto!important;background:#f2f8fb!important}',
    '.aud3{padding:22px;min-height:560px;color:#173f60}.aud3 *{box-sizing:border-box}',
    '.aud3-head{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:14px;align-items:center;padding:18px 20px;border-radius:20px;background:linear-gradient(135deg,#0f3c66,#0c6d9f 62%,#1493b7);color:#fff;box-shadow:0 12px 30px rgba(15,60,102,.18)}',
    '.aud3-head .eyebrow{margin:0 0 4px;color:#bcecff;font-size:.68rem;font-weight:900;letter-spacing:.12em}.aud3-head h2{margin:0 0 5px;color:#fff}.aud3-head p{margin:0;color:#e7f7ff;line-height:1.45}',
    '.aud3-badge{min-width:138px;padding:12px 14px;border:1px solid rgba(255,255,255,.24);border-radius:16px;background:rgba(255,255,255,.12);text-align:center}.aud3-badge b{display:block;font-size:1.15rem}.aud3-badge small{color:#d9f1fb}',
    '.aud3-setup{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:14px;margin-top:14px}',
    '.aud3-card{padding:18px;border:1px solid #d4e4ed;border-radius:18px;background:#fff;box-shadow:0 9px 24px rgba(15,60,102,.07)}.aud3-card h3{margin:0 0 7px;color:#0f3c66}.aud3-card p{margin:0;color:#607789;line-height:1.5}',
    '.aud3-steps{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:14px}.aud3-step{padding:13px;border-radius:14px;background:#f5fafc;border:1px solid #d9e7ee}.aud3-step b{display:block;color:#0f3c66;margin-bottom:4px}.aud3-step p{font-size:.83rem}',
    '.aud3-counterbox{display:grid;gap:10px}.aud3-countline{display:grid;grid-template-columns:44px minmax(0,1fr) 44px;gap:8px;align-items:center}.aud3-countline button{height:44px;border:1px solid #cfe0e9;border-radius:12px;background:#eef7fb;color:#0f5d8c;font-size:1.4rem;font-weight:900;cursor:pointer}.aud3-countline input{height:44px;border:1px solid #cfe0e9;border-radius:12px;background:#fff;color:#173f60;text-align:center;font-size:1.1rem;font-weight:900}',
    '.aud3-note{padding:11px 12px;border-radius:12px;background:#fff7db;border:1px solid #f1d77b;color:#715b13;font-size:.82rem;line-height:1.4}',
    '.aud3-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:12px}.aud3-actions .btn{min-height:42px}',
    '.aud3-toolbar{display:grid;grid-template-columns:repeat(4,minmax(0,1fr)) auto;gap:8px;margin:12px 0}.aud3-stat{padding:9px 11px;border:1px solid #d5e5ed;border-radius:12px;background:#fff}.aud3-stat small{display:block;color:#6f8493;font-size:.69rem;font-weight:800}.aud3-stat b{display:block;color:#0f3c66;font-size:1rem;margin-top:2px}',
    '.aud3-question{padding:18px;border:1px solid #d5e5ed;border-radius:18px;background:#fff;box-shadow:0 9px 24px rgba(15,60,102,.07)}.aud3-question h3{margin:0;color:#0f3c66;font-size:1.35rem;line-height:1.35}.aud3-question small{display:block;margin-bottom:6px;color:#6a8395;font-weight:900;letter-spacing:.06em}',
    '.aud3-votes{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px}.aud3-vote{min-height:92px;border:2px solid #d7e5ed;border-radius:16px;background:#fff;color:#173f60;text-align:left;padding:14px;font-weight:900;cursor:pointer;transition:.15s}.aud3-vote:hover{transform:translateY(-2px);border-color:#1689bd;background:#f1fbff}.aud3-vote b{display:inline-grid;place-items:center;width:36px;height:36px;border-radius:50%;background:#0e6faa;color:#fff;margin-right:10px;font-size:1rem}.aud3-vote span{vertical-align:middle}.aud3-vote:disabled{cursor:default;opacity:.72}',
    '.aud3-people{display:flex;flex-wrap:wrap;gap:5px;margin-top:12px;padding:10px;border:1px solid #d7e5ed;border-radius:14px;background:#fff}.aud3-person{width:24px;height:24px;display:grid;place-items:center;border-radius:50%;background:#edf4f8;color:#7590a2;font-size:.62rem;font-weight:900;border:1px solid #d6e3ea}.aud3-person.done{background:#2fb36d;color:#fff;border-color:#2fb36d}.aud3-person.current{background:#f3b437;color:#173f60;border-color:#f3b437;box-shadow:0 0 0 3px rgba(243,180,55,.2)}',
    '.aud3-privacy{position:fixed;inset:0;z-index:99998;display:grid;place-items:center;padding:18px;background:rgba(3,22,38,.78);backdrop-filter:blur(5px)}.aud3-privacy-card{width:min(520px,92vw);padding:26px;border-radius:24px;background:linear-gradient(180deg,#0f4f7c,#082f52);color:#fff;text-align:center;border:2px solid rgba(255,255,255,.2);box-shadow:0 24px 70px rgba(0,0,0,.42)}.aud3-privacy-card .big{font-size:3rem}.aud3-privacy-card h3{margin:6px 0;color:#fff}.aud3-privacy-card p{margin:0 0 14px;color:#dbeef8;line-height:1.45}.aud3-privacy-card .btn{min-width:210px}',
    '.aud3-results{margin-top:12px;padding:18px;border:1px solid #d5e5ed;border-radius:18px;background:#fff}.aud3-results h3{margin:0 0 8px;color:#0f3c66}.aud3-row{display:grid;grid-template-columns:34px minmax(0,1fr) 60px 54px;gap:8px;align-items:center;margin:9px 0}.aud3-row>span{display:grid;place-items:center;width:30px;height:30px;border-radius:50%;background:#0e6faa;color:#fff;font-weight:900}.aud3-row i{height:19px;border-radius:999px;background:#e6edf2;overflow:hidden}.aud3-row i b{display:block;height:100%;background:linear-gradient(90deg,#1689bd,#2fb36d)}.aud3-row em,.aud3-row strong{font-style:normal;text-align:right}.aud3-row.correct{padding:5px 7px;border-radius:10px;background:#eef9f2}.aud3-answer{margin-top:12px;padding:13px;border-radius:13px;background:#eaf8ef;color:#17643a;line-height:1.5}',
    '.aud3-finish{text-align:center;padding:28px;border:1px solid #c4e2cf;border-radius:18px;background:linear-gradient(145deg,#eefaf2,#fff);margin-top:14px}.aud3-finish .big{font-size:2.8rem}.aud3-finish h3{margin:6px 0;color:#0f3c66}',
    '@media(max-width:760px){#gameDialog.plateia-v3-dialog{width:100vw!important;max-width:100vw!important;height:100dvh!important;max-height:100dvh!important;margin:0!important;border-radius:0!important}.aud3{padding:14px;min-height:100dvh}.aud3-head{grid-template-columns:1fr}.aud3-badge{display:none}.aud3-setup{grid-template-columns:1fr}.aud3-steps{grid-template-columns:1fr}.aud3-toolbar{grid-template-columns:1fr 1fr}.aud3-toolbar .btn{grid-column:span 2}.aud3-votes{grid-template-columns:1fr}.aud3-row{grid-template-columns:30px minmax(0,1fr) 52px 46px}.aud3-actions{display:grid;grid-template-columns:1fr 1fr}.aud3-actions .btn:only-child{grid-column:1/-1}}'
  ].join('');
  document.head.appendChild(s);
}

function save(score,correct,answers){
  const r=JSON.parse(localStorage.getItem('mobiliza.results')||'{"games":0,"correct":0,"answers":0,"best":0,"streak":0}');
  r.games=(r.games||0)+1;
  r.correct=(r.correct||0)+correct;
  r.answers=(r.answers||0)+answers;
  r.best=Math.max(r.best||0,score);
  localStorage.setItem('mobiliza.results',JSON.stringify(r));
}

function clamp(v,min,max){return Math.max(min,Math.min(max,v));}

export function openPlateia(dialog,host,onFinish){
  css();
  dialog.classList.add('plateia-v3-dialog');
  const cleanup=()=>dialog.classList.remove('plateia-v3-dialog');
  dialog.addEventListener('close',cleanup,{once:true});

  let participantTarget=10;
  let questions=[];
  let qIndex=0;
  let participant=1;
  let votes=[0,0,0,0];
  let sessionVotes=0;
  let questionsCompleted=0;
  let majorityCorrect=0;
  let score=0;
  let state='setup';

  function loadQuestions(){
    questions=getQuestionSet({
      count:6,
      audiences:['criancas','adolescentes','adultos'],
      avoidRecent:true,
      markRecent:true,
      recentScope:'game:plateia',
      recentLimit:24
    });
  }

  function header(title,subtitle,badge='MODO LOCAL'){
    return '<div class="aud3-head"><div><p class="eyebrow">MOBILIZA EDUCA • PLATEIA INTERATIVA</p><h2>'+title+'</h2><p>'+subtitle+'</p></div><div class="aud3-badge"><b>'+badge+'</b><small>um aparelho compartilhado</small></div></div>';
  }

  function setup(){
    state='setup';
    host.innerHTML='<section class="aud3">'+
      header('Como a plateia participa?','Nesta versão, o mesmo aparelho circula entre os participantes. Cada pessoa registra um único voto por pergunta.')+
      '<div class="aud3-setup">'+
        '<div class="aud3-card"><h3>Fluxo da atividade</h3><p>O sistema controla a vez de cada participante para evitar votos repetidos acidentais.</p>'+
          '<div class="aud3-steps">'+
            '<div class="aud3-step"><b>1. Vote</b><p>Uma pessoa escolhe A, B, C ou D.</p></div>'+
            '<div class="aud3-step"><b>2. Tela bloqueia</b><p>A resposta some e aparece apenas “voto registrado”.</p></div>'+
            '<div class="aud3-step"><b>3. Próxima pessoa</b><p>O operador libera o próximo participante. O resultado só aparece no fim.</p></div>'+
          '</div>'+
        '</div>'+
        '<div class="aud3-card aud3-counterbox"><h3>Quantas pessoas vão votar?</h3>'+
          '<div class="aud3-countline"><button type="button" id="aud3Minus" aria-label="Diminuir participantes">−</button><input id="aud3Target" type="number" min="2" max="60" value="'+participantTarget+'"><button type="button" id="aud3Plus" aria-label="Aumentar participantes">+</button></div>'+
          '<div class="aud3-note"><strong>Importante:</strong> este modo não conecta celulares diferentes. Para cada pessoa votar no próprio telefone, será necessário ativar uma sessão online sincronizada.</div>'+
          '<button type="button" class="btn primary big" id="aud3Start">▶ INICIAR SESSÃO LOCAL</button>'+
        '</div>'+
      '</div>'+
    '</section>';

    const input=host.querySelector('#aud3Target');
    const sync=()=>{participantTarget=clamp(parseInt(input.value||'10',10)||10,2,60);input.value=participantTarget;};
    host.querySelector('#aud3Minus').onclick=()=>{participantTarget=clamp(participantTarget-1,2,60);input.value=participantTarget;SoundManager.play('click');};
    host.querySelector('#aud3Plus').onclick=()=>{participantTarget=clamp(participantTarget+1,2,60);input.value=participantTarget;SoundManager.play('click');};
    input.onchange=sync;
    host.querySelector('#aud3Start').onclick=()=>{
      sync();
      loadQuestions();
      qIndex=0;participant=1;votes=[0,0,0,0];sessionVotes=0;questionsCompleted=0;majorityCorrect=0;score=0;
      SoundManager.play('open');
      renderQuestion();
    };
  }

  function peopleHtml(){
    const max=Math.min(participantTarget,60);
    return Array.from({length:max},(_,i)=>{
      const n=i+1;
      return '<span class="aud3-person '+(n<participant?'done':n===participant?'current':'')+'" title="Participante '+n+'">'+n+'</span>';
    }).join('');
  }

  function renderQuestion(){
    state='voting';
    const q=questions[qIndex];
    host.innerHTML='<section class="aud3">'+
      header('Votação em andamento','Passe o aparelho para uma pessoa por vez. O resultado fica oculto até todos votarem.','PERGUNTA '+(qIndex+1)+'/'+questions.length)+
      '<div class="aud3-toolbar">'+
        '<div class="aud3-stat"><small>PARTICIPANTE</small><b>'+participant+' de '+participantTarget+'</b></div>'+
        '<div class="aud3-stat"><small>VOTOS NESTA PERGUNTA</small><b>'+votes.reduce((a,b)=>a+b,0)+'/'+participantTarget+'</b></div>'+
        '<div class="aud3-stat"><small>PERGUNTA</small><b>'+(qIndex+1)+'/'+questions.length+'</b></div>'+
        '<div class="aud3-stat"><small>RESULTADO</small><b>Oculto</b></div>'+
        '<button type="button" class="btn ghost" id="aud3Sound">'+(SoundManager.isEnabled()?'🔊 Som':'🔇 Som')+'</button>'+
      '</div>'+
      '<div class="aud3-question"><small>ESCOLHA UMA ALTERNATIVA</small><h3>'+q.prompt+'</h3></div>'+
      '<div class="aud3-votes">'+q.options.map((x,n)=>'<button type="button" class="aud3-vote" data-vote="'+n+'"><b>'+String.fromCharCode(65+n)+'</b><span>'+x+'</span></button>').join('')+'</div>'+
      '<div class="aud3-people">'+peopleHtml()+'</div>'+
      '<div class="aud3-actions"><button type="button" class="btn ghost" id="aud3AbortQuestion">Encerrar votação agora</button></div>'+
    '</section>';

    host.querySelectorAll('[data-vote]').forEach(b=>b.onclick=()=>registerVote(Number(b.dataset.vote)));
    host.querySelector('#aud3Sound').onclick=()=>{SoundManager.toggle();renderQuestion();};
    host.querySelector('#aud3AbortQuestion').onclick=()=>{
      if(votes.reduce((a,b)=>a+b,0)===0){SoundManager.play('warning');return;}
      reveal();
    };
  }

  function registerVote(choice){
    if(state!=='voting')return;
    state='locked';
    votes[choice]++;
    sessionVotes++;
    SoundManager.play('click');

    host.querySelectorAll('[data-vote]').forEach(b=>b.disabled=true);

    const allDone=participant>=participantTarget;
    const layer=document.createElement('div');
    layer.className='aud3-privacy';
    layer.id='aud3Privacy';
    layer.innerHTML='<div class="aud3-privacy-card"><div class="big">✅</div><h3>Voto registrado!</h3>'+
      '<p>A alternativa escolhida foi ocultada. '+(allDone?'Todos os participantes já votaram nesta pergunta.':'Entregue o aparelho ao próximo participante.')+'</p>'+
      '<button type="button" class="btn primary big" id="aud3Continue">'+(allDone?'📊 MOSTRAR RESULTADO':'👤 LIBERAR PARTICIPANTE '+(participant+1))+'</button></div>';
    document.body.appendChild(layer);

    layer.querySelector('#aud3Continue').onclick=()=>{
      SoundManager.play(allDone?'next':'open');
      layer.remove();
      if(allDone) reveal();
      else{participant++;renderQuestion();}
    };
  }

  function reveal(){
    const total=votes.reduce((a,b)=>a+b,0);
    if(!total)return;
    state='result';
    const q=questions[qIndex];
    const max=Math.max(...votes);
    const top=votes.map((v,i)=>v===max?i:-1).filter(i=>i>=0);
    const majorityIsCorrect=top.length===1&&top[0]===q.correct;
    if(majorityIsCorrect){majorityCorrect++;score+=250;SoundManager.play('correct');}
    else SoundManager.play('next');
    questionsCompleted++;

    host.innerHTML='<section class="aud3">'+
      header('Resultado da plateia','Agora os percentuais aparecem para discussão coletiva.','RESULTADO '+(qIndex+1)+'/'+questions.length)+
      '<div class="aud3-results"><h3>'+q.prompt+'</h3>'+
      q.options.map((x,n)=>{
        const p=Math.round(votes[n]/total*100);
        return '<div class="aud3-row '+(n===q.correct?'correct':'')+'"><span>'+String.fromCharCode(65+n)+'</span><i><b style="width:'+p+'%"></b></i><strong>'+votes[n]+' voto'+(votes[n]===1?'':'s')+'</strong><em>'+p+'%</em></div>';
      }).join('')+
      '<div class="aud3-answer"><strong>✅ Resposta de referência: '+String.fromCharCode(65+q.correct)+'. '+q.options[q.correct]+'</strong><br>'+q.why+'</div>'+
      '<div class="aud3-actions"><button type="button" class="btn ghost" id="aud3Discuss">🔁 Ver pergunta novamente</button><button type="button" class="btn primary" id="aud3Next">'+(qIndex===questions.length-1?'Encerrar sessão':'Próxima pergunta')+'</button></div>'+
      '</div></section>';

    host.querySelector('#aud3Discuss').onclick=()=>{SoundManager.play('click');};
    host.querySelector('#aud3Next').onclick=()=>{
      if(qIndex===questions.length-1) finish();
      else{
        qIndex++;
        participant=1;
        votes=[0,0,0,0];
        SoundManager.play('next');
        renderQuestion();
      }
    };
  }

  function finish(){
    state='finish';
    save(score,majorityCorrect,questionsCompleted);
    if(onFinish)onFinish();
    SoundManager.play('finish');
    host.innerHTML='<section class="aud3">'+
      header('Sessão concluída','Resumo da atividade realizada com a plateia.','FINAL')+
      '<div class="aud3-finish"><div class="big">📱</div><h3>'+sessionVotes+' votos registrados</h3>'+
      '<p><strong>'+questionsCompleted+'</strong> pergunta(s) realizadas com até <strong>'+participantTarget+'</strong> participantes por rodada.</p>'+
      '<p>Em <strong>'+majorityCorrect+'</strong> pergunta(s), a alternativa mais votada coincidiu com a resposta de referência.</p>'+
      '<p><strong>'+score+' pontos</strong></p>'+
      '<div class="aud3-actions"><button type="button" class="btn primary" id="aud3Again">Nova sessão</button><button type="button" class="btn ghost" id="aud3Close">Encerrar</button></div>'+
      '</div></section>';
    host.querySelector('#aud3Again').onclick=()=>setup();
    host.querySelector('#aud3Close').onclick=()=>dialog.close();
  }

  setup();
  if(!dialog.open)dialog.showModal();
}
