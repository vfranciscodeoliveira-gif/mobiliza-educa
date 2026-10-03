import { connectParticipant, normalizeCode } from '../core/sharedSession.js?v=1';
import { SoundManager } from '../core/soundManager.js?v=1';

function css(){
  if(document.getElementById('plateia-participant-v1'))return;
  const s=document.createElement('style');
  s.id='plateia-participant-v1';
  s.textContent=[
    'body.plateia-participant-open{overflow:hidden;background:#071f37}',
    '.ppx{position:fixed;inset:0;z-index:100000;background:radial-gradient(circle at 50% 10%,#146ea6 0,#0b3c64 34%,#061d33 72%);color:#fff;overflow:auto;padding:max(18px,env(safe-area-inset-top)) 16px max(24px,env(safe-area-inset-bottom));display:grid;place-items:center}',
    '.ppx-shell{width:min(720px,100%);min-height:min(760px,calc(100dvh - 36px));display:flex;flex-direction:column;gap:14px}',
    '.ppx-brand{display:flex;align-items:center;gap:12px;padding:12px 14px;border:1px solid rgba(255,255,255,.14);border-radius:18px;background:rgba(4,29,51,.52);backdrop-filter:blur(8px)}',
    '.ppx-brand img{width:48px;height:48px;border-radius:12px}.ppx-brand h1{margin:0;font-size:1.05rem;letter-spacing:.02em}.ppx-brand p{margin:3px 0 0;color:#bfe9fb;font-size:.78rem}.ppx-code{margin-left:auto;padding:8px 11px;border-radius:12px;background:#fff;color:#0f3c66;font-weight:1000;letter-spacing:.12em}',
    '.ppx-card{flex:1;padding:22px;border:1px solid rgba(255,255,255,.16);border-radius:24px;background:rgba(255,255,255,.96);color:#173f60;box-shadow:0 24px 70px rgba(0,0,0,.25)}',
    '.ppx-card h2{margin:0 0 8px;color:#0f3c66;font-size:1.55rem}.ppx-card p{color:#607789;line-height:1.5}',
    '.ppx-label{display:block;margin-top:18px;font-size:.8rem;font-weight:900;color:#0f3c66}.ppx-input{width:100%;margin-top:6px;padding:14px 15px;border:1px solid #ccdde7;border-radius:13px;background:#fff;color:#173f60;font-size:1rem;font-weight:800;outline:none}.ppx-input:focus{border-color:#1689bd;box-shadow:0 0 0 4px rgba(22,137,189,.12)}',
    '.ppx-btn{width:100%;margin-top:14px;min-height:50px;border:0;border-radius:14px;background:linear-gradient(135deg,#0f6fa1,#12a0c8);color:#fff;font-weight:1000;font-size:1rem;cursor:pointer;box-shadow:0 10px 22px rgba(15,111,161,.22)}.ppx-btn:disabled{opacity:.55;cursor:default}.ppx-btn.secondary{background:#edf5f9;color:#0f3c66;box-shadow:none;border:1px solid #d1e2eb}',
    '.ppx-status{text-align:center;padding:26px 10px}.ppx-status .big{font-size:3.1rem;display:block;margin-bottom:7px}.ppx-status h2{margin:0 0 7px}.ppx-status p{margin:0 auto;max-width:520px}.ppx-pulse{width:72px;height:72px;margin:8px auto 16px;border-radius:50%;border:6px solid #d9edf6;border-top-color:#0f7fac;animation:ppxSpin .9s linear infinite}@keyframes ppxSpin{to{transform:rotate(360deg)}}',
    '.ppx-question-meta{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px}.ppx-chip{padding:6px 9px;border-radius:999px;background:#eaf5fa;color:#0f668f;font-size:.72rem;font-weight:900}.ppx-question{font-size:1.45rem;line-height:1.35;margin:6px 0 16px;color:#0f3c66}',
    '.ppx-options{display:grid;gap:10px}.ppx-option{display:grid;grid-template-columns:42px 1fr;gap:10px;align-items:center;min-height:66px;padding:11px 13px;border:2px solid #d8e6ee;border-radius:16px;background:#fff;color:#173f60;text-align:left;font-size:.96rem;font-weight:900;cursor:pointer;transition:.15s}.ppx-option:hover{border-color:#1590bd;background:#f1fbff}.ppx-option b{display:grid;place-items:center;width:38px;height:38px;border-radius:50%;background:#0d70a4;color:#fff}.ppx-option:disabled{opacity:.65;cursor:default}.ppx-option.selected{border-color:#f1b62f;background:#fff8df}',
    '.ppx-ack{padding:34px 14px;text-align:center}.ppx-ack .big{font-size:3.2rem}.ppx-ack h2{margin:7px 0}.ppx-ack p{margin:0 auto;max-width:520px}.ppx-ack .answer-tag{display:inline-block;margin-top:14px;padding:8px 12px;border-radius:999px;background:#eef6fa;color:#0f668f;font-weight:900}',
    '.ppx-results{display:grid;gap:10px;margin-top:16px}.ppx-row{display:grid;grid-template-columns:34px minmax(0,1fr) 56px;gap:8px;align-items:center;padding:6px;border-radius:12px}.ppx-row.correct{background:#eaf8ef}.ppx-row span{display:grid;place-items:center;width:30px;height:30px;border-radius:50%;background:#0d70a4;color:#fff;font-weight:900}.ppx-row i{height:18px;border-radius:999px;background:#e4edf2;overflow:hidden}.ppx-row i b{display:block;height:100%;background:linear-gradient(90deg,#1689bd,#31b16f)}.ppx-row strong{text-align:right}',
    '.ppx-explain{margin-top:14px;padding:13px;border-radius:13px;background:#eaf8ef;color:#17643a;line-height:1.5}.ppx-error{padding:13px;border-radius:13px;background:#fff0ef;color:#8d302c;margin-top:12px}',
    '.ppx-footer{text-align:center;color:#9bc8dc;font-size:.72rem}.ppx-exit{border:0;background:none;color:#bfe9fb;text-decoration:underline;cursor:pointer;font-size:.74rem}',
    '@media(max-width:520px){.ppx{padding:10px}.ppx-shell{min-height:calc(100dvh - 20px)}.ppx-card{padding:17px;border-radius:20px}.ppx-brand img{width:42px;height:42px}.ppx-brand h1{font-size:.92rem}.ppx-code{font-size:.78rem}.ppx-question{font-size:1.22rem}.ppx-option{min-height:62px}}'
  ].join('');
  document.head.appendChild(s);
}

function esc(s=''){
  return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

export function openParticipantMode(rawCode){
  css();
  const code=normalizeCode(rawCode);
  if(!code)return false;

  document.body.classList.add('plateia-participant-open');
  const root=document.createElement('div');
  root.className='ppx';
  root.id='plateiaParticipant';
  document.body.appendChild(root);

  let client=null;
  let participantName=localStorage.getItem('mobiliza.plateia.name')||'';
  let currentRound=null;
  let lastChoice=null;
  let closing=false;

  const shell=content=>'<div class="ppx-shell">'+
    '<div class="ppx-brand"><img src="assets/icon-192.webp?v=9" alt=""><div><h1>MOBILIZA EDUCA</h1><p>Plateia Conectada</p></div><span class="ppx-code">'+esc(code)+'</span></div>'+
    '<main class="ppx-card">'+content+'</main>'+
    '<div class="ppx-footer">Conectado à sessão do operador • <button class="ppx-exit" id="ppxExit">sair da sala</button></div>'+
  '</div>';

  const bindExit=()=>{
    root.querySelector('#ppxExit')?.addEventListener('click',()=>{
      if(!confirm('Sair desta sessão?'))return;
      closing=true;
      try{client?.close();}catch{}
      const u=new URL(location.href);u.searchParams.delete('plateia');history.replaceState({},'',u.pathname+u.search+u.hash);
      root.remove();document.body.classList.remove('plateia-participant-open');location.reload();
    });
  };

  const renderJoin=(error='')=>{
    root.innerHTML=shell(
      '<h2>Entrar na plateia</h2><p>Você participará do mesmo jogo que está sendo exibido no computador ou telão.</p>'+
      '<label class="ppx-label">Seu nome ou apelido<input id="ppxName" class="ppx-input" maxlength="40" autocomplete="name" placeholder="Ex.: Ana" value="'+esc(participantName)+'"></label>'+
      (error?'<div class="ppx-error">'+esc(error)+'</div>':'')+
      '<button type="button" class="ppx-btn" id="ppxJoin">ENTRAR NA SESSÃO</button>'+
      '<p style="font-size:.78rem;margin-top:12px">Cada aparelho registra apenas um voto por pergunta. Aguarde o operador liberar cada rodada.</p>'
    );
    bindExit();
    const input=root.querySelector('#ppxName');
    const button=root.querySelector('#ppxJoin');
    const go=()=>{participantName=input.value.trim();if(!participantName){input.focus();return;}localStorage.setItem('mobiliza.plateia.name',participantName);connect();};
    button.onclick=go;input.addEventListener('keydown',e=>{if(e.key==='Enter')go();});
  };

  const renderConnecting=()=>{
    root.innerHTML=shell('<div class="ppx-status"><div class="ppx-pulse"></div><h2>Entrando na sessão...</h2><p>Conectando ao computador do operador.</p></div>');
    bindExit();
  };

  const renderWaiting=(message='Você entrou. Aguarde o operador iniciar ou liberar a próxima pergunta.')=>{
    currentRound=null;lastChoice=null;
    root.innerHTML=shell('<div class="ppx-status"><span class="big">📱</span><h2>Você está na plateia!</h2><p>'+esc(message)+'</p><div class="answer-tag" style="display:inline-block;margin-top:14px;padding:8px 12px;border-radius:999px;background:#eef6fa;color:#0f668f;font-weight:900">👤 '+esc(participantName)+'</div></div>');
    bindExit();
  };

  const renderQuestion=data=>{
    currentRound=data.roundId;
    lastChoice=null;
    const options=Array.isArray(data.options)?data.options:[];
    root.innerHTML=shell(
      '<div class="ppx-question-meta"><span class="ppx-chip">PERGUNTA '+esc(data.index)+'/'+esc(data.total)+'</span><span class="ppx-chip">1 VOTO POR APARELHO</span></div>'+
      '<h2 class="ppx-question">'+esc(data.prompt)+'</h2>'+
      '<div class="ppx-options">'+options.map((x,n)=>'<button type="button" class="ppx-option" data-choice="'+n+'"><b>'+String.fromCharCode(65+n)+'</b><span>'+esc(x)+'</span></button>').join('')+'</div>'+
      '<p style="font-size:.78rem;margin-top:12px">Depois de votar, sua resposta fica bloqueada até o operador encerrar a rodada.</p>'
    );
    bindExit();
    root.querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>{
      if(lastChoice!==null)return;
      lastChoice=Number(b.dataset.choice);
      root.querySelectorAll('[data-choice]').forEach(x=>{x.disabled=true;x.classList.toggle('selected',Number(x.dataset.choice)===lastChoice);});
      client?.send({type:'vote',roundId:currentRound,choice:lastChoice});
      SoundManager.play('click');
      renderAck(lastChoice);
    });
  };

  const renderAck=choice=>{
    root.innerHTML=shell('<div class="ppx-ack"><div class="big">✅</div><h2>Voto registrado!</h2><p>Sua resposta foi enviada ao computador do operador e não pode ser alterada nesta rodada.</p><span class="answer-tag">Alternativa '+String.fromCharCode(65+choice)+'</span><p style="font-size:.78rem;margin-top:16px">Aguarde a votação ser encerrada para ver o resultado.</p></div>');
    bindExit();
  };

  const renderResult=data=>{
    const results=Array.isArray(data.results)?data.results:[];
    root.innerHTML=shell(
      '<div class="ppx-question-meta"><span class="ppx-chip">RESULTADO</span><span class="ppx-chip">'+esc(data.votes)+' VOTOS</span></div>'+
      '<h2 class="ppx-question">'+esc(data.prompt)+'</h2>'+
      '<div class="ppx-results">'+results.map((r,n)=>'<div class="ppx-row '+(n===data.correct?'correct':'')+'"><span>'+String.fromCharCode(65+n)+'</span><i><b style="width:'+Math.max(0,Math.min(100,Number(r.percent)||0))+'%"></b></i><strong>'+esc(r.percent)+'%</strong></div>').join('')+'</div>'+
      '<div class="ppx-explain"><strong>✅ Resposta de referência: '+String.fromCharCode(65+data.correct)+'. '+esc(data.options?.[data.correct]||'')+'</strong><br>'+esc(data.why||'')+'</div>'+
      '<p style="text-align:center;font-size:.78rem;margin-top:14px">Aguarde o operador liberar a próxima pergunta.</p>'
    );
    bindExit();SoundManager.play('correct');
  };

  const renderClosed=()=>{
    root.innerHTML=shell('<div class="ppx-status"><span class="big">🏁</span><h2>Sessão encerrada</h2><p>O operador finalizou a atividade.</p><button type="button" class="ppx-btn secondary" id="ppxLeaveDone">Voltar ao Mobiliza Educa</button></div>');
    bindExit();
    root.querySelector('#ppxLeaveDone').onclick=()=>{const u=new URL(location.href);u.searchParams.delete('plateia');location.href=u.pathname+u.search+u.hash;};
  };

  const onMessage=data=>{
    if(!data||typeof data!=='object')return;
    if(data.type==='hello-ack'||data.type==='host-ready')return;
    if(data.type==='waiting'){renderWaiting(data.message);return;}
    if(data.type==='question'){renderQuestion(data);SoundManager.play('open');return;}
    if(data.type==='vote-ack'){
      if(data.roundId===currentRound&&typeof data.choice==='number')renderAck(data.choice);
      return;
    }
    if(data.type==='already-voted'){
      currentRound=data.roundId||currentRound;
      lastChoice=Number.isInteger(data.choice)?data.choice:lastChoice;
      if(Number.isInteger(lastChoice))renderAck(lastChoice);
      return;
    }
    if(data.type==='result'){renderResult(data);return;}
    if(data.type==='session-finished'||data.type==='session-closed'){renderClosed();return;}
  };

  async function connect(){
    renderConnecting();
    try{
      client=await connectParticipant(code,participantName,{
        onMessage,
        onStatus:s=>{
          if((s.type==='closed'||s.type==='disconnected')&&!closing){
            setTimeout(()=>{if(document.body.contains(root)&&!closing)renderJoin('A conexão com a sessão foi encerrada. Tente entrar novamente.');},500);
          }
        }
      });
      renderWaiting();
      client.send({type:'ready'});
    }catch(e){
      try{client?.close();}catch{}
      client=null;
      renderJoin(e?.message||'Não foi possível entrar na sessão.');
    }
  }

  renderJoin();
  return true;
}
