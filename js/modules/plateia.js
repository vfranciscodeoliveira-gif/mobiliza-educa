import { getQuestionSet } from '../core/questionEngine.js?v=2';
import { SoundManager } from '../core/soundManager.js?v=1';
import { createHostSession, renderQr, makeSessionCode } from '../core/sharedSession.js?v=1';

function css(){
  if(document.getElementById('plateia-connected-v1'))return;
  const s=document.createElement('style');
  s.id='plateia-connected-v1';
  s.textContent=[
    '#gameDialog.plateia-connected-dialog{width:min(1280px,97vw)!important;max-width:97vw!important;max-height:96vh!important}',
    '#gameDialog.plateia-connected-dialog>.dialog-shell{max-height:96vh!important;overflow:auto!important;background:#f1f8fb!important}',
    '.pcx{padding:22px;color:#173f60;min-height:620px}.pcx *{box-sizing:border-box}',
    '.pcx-head{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:14px;align-items:center;padding:18px 20px;border-radius:20px;background:linear-gradient(135deg,#0b365d,#0e729f 58%,#12a0bd);color:#fff;box-shadow:0 13px 32px rgba(11,54,93,.2)}',
    '.pcx-head .eyebrow{margin:0 0 4px;color:#bcecff;font-size:.68rem;font-weight:900;letter-spacing:.12em}.pcx-head h2{margin:0 0 5px;color:#fff}.pcx-head p{margin:0;color:#e7f7ff;line-height:1.45}.pcx-room{min-width:150px;padding:10px 13px;border:1px solid rgba(255,255,255,.24);border-radius:15px;background:rgba(255,255,255,.12);text-align:center}.pcx-room small{display:block;color:#cceeff;font-size:.68rem}.pcx-room strong{display:block;font-size:1.45rem;letter-spacing:.14em}',
    '.pcx-loader{padding:70px 20px;text-align:center}.pcx-spinner{width:72px;height:72px;margin:0 auto 16px;border-radius:50%;border:7px solid #d8ebf4;border-top-color:#0f7fab;animation:pcxSpin .9s linear infinite}@keyframes pcxSpin{to{transform:rotate(360deg)}}',
    '.pcx-wait{display:grid;grid-template-columns:330px minmax(0,1fr);gap:14px;margin-top:14px}.pcx-card{padding:18px;border:1px solid #d4e4ed;border-radius:18px;background:#fff;box-shadow:0 10px 25px rgba(15,60,102,.07)}.pcx-card h3{margin:0 0 7px;color:#0f3c66}.pcx-card p{margin:0;color:#607789;line-height:1.5}',
    '.pcx-qrbox{display:grid;place-items:center;gap:10px}.pcx-qr{width:238px;height:238px;display:grid;place-items:center;padding:9px;border-radius:18px;background:#fff;border:1px solid #d6e5ed}.pcx-qr img,.pcx-qr canvas{max-width:220px!important;max-height:220px!important}.pcx-code-big{font-size:1.65rem;font-weight:1000;letter-spacing:.16em;color:#0f3c66}.pcx-url{width:100%;padding:9px;border-radius:10px;background:#f4f9fb;color:#537083;font-size:.72rem;word-break:break-all;text-align:center}',
    '.pcx-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:13px}.pcx-actions .btn{min-height:42px}.pcx-actions.end{justify-content:flex-end}',
    '.pcx-people-title{display:flex;align-items:center;justify-content:space-between;gap:10px}.pcx-count{display:inline-grid;place-items:center;min-width:42px;height:34px;padding:0 10px;border-radius:999px;background:#eaf6fb;color:#0f6b98;font-weight:1000}',
    '.pcx-people{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:12px;max-height:340px;overflow:auto}.pcx-person{display:grid;grid-template-columns:40px 1fr auto;gap:9px;align-items:center;padding:9px;border:1px solid #dce8ef;border-radius:13px;background:#f9fcfd}.pcx-avatar{width:38px;height:38px;display:grid;place-items:center;border-radius:50%;background:linear-gradient(145deg,#e5f6ff,#d7effa);color:#0e6d9b;font-weight:1000}.pcx-person strong{display:block;color:#173f60}.pcx-person small{display:block;color:#6b8190}.pcx-dot{width:10px;height:10px;border-radius:50%;background:#2fb36d}.pcx-empty{grid-column:1/-1;padding:24px;border:1px dashed #cbdde7;border-radius:14px;text-align:center;color:#6a8191}',
    '.pcx-toolbar{display:grid;grid-template-columns:repeat(4,minmax(0,1fr)) auto;gap:8px;margin:12px 0}.pcx-stat{padding:9px 11px;border:1px solid #d5e5ed;border-radius:12px;background:#fff}.pcx-stat small{display:block;color:#6f8493;font-size:.68rem;font-weight:900}.pcx-stat b{display:block;color:#0f3c66;margin-top:2px}',
    '.pcx-question{padding:18px;border:1px solid #d5e5ed;border-radius:18px;background:#fff;box-shadow:0 9px 24px rgba(15,60,102,.07)}.pcx-question small{display:block;color:#698195;font-weight:900;letter-spacing:.06em;margin-bottom:6px}.pcx-question-grid{display:grid;grid-template-columns:220px minmax(0,1fr);gap:16px;align-items:center}.pcx-question-visual{min-height:180px;border-radius:16px;background:linear-gradient(145deg,#edf8fd,#fff7df);border:1px solid #d4e5ed;display:grid;place-items:center;overflow:hidden}.pcx-question-visual img{width:78%;height:150px;object-fit:contain;filter:drop-shadow(0 8px 12px rgba(15,60,102,.12))}.pcx-question h3{margin:0;color:#0f3c66;font-size:1.4rem;line-height:1.35}.pcx-options{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:12px}.pcx-option{display:grid;grid-template-columns:36px 1fr;gap:9px;align-items:center;padding:12px;border:1px solid #d9e6ed;border-radius:14px;background:#fafdff}.pcx-option b{display:grid;place-items:center;width:34px;height:34px;border-radius:50%;background:#0d70a4;color:#fff}.pcx-option span{font-weight:800;color:#173f60}',
    '.pcx-live{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:12px;margin-top:12px}.pcx-vote-list{display:flex;flex-wrap:wrap;gap:7px}.pcx-voter{padding:7px 9px;border-radius:10px;background:#f2f7fa;border:1px solid #dce7ed;color:#607789;font-size:.76rem;font-weight:800}.pcx-voter.voted{background:#e9f8ef;border-color:#bfe5cc;color:#17643a}.pcx-live-note{padding:14px;border-radius:14px;background:#eef7fb;border:1px solid #d2e6ef;color:#43677f;line-height:1.45;font-size:.83rem}',
    '.pcx-results{margin-top:12px;padding:18px;border:1px solid #d5e5ed;border-radius:18px;background:#fff}.pcx-result-head{display:grid;grid-template-columns:150px minmax(0,1fr);gap:14px;align-items:center;margin-bottom:12px}.pcx-result-image{min-height:120px;border-radius:14px;background:linear-gradient(145deg,#edf8fd,#fff7df);border:1px solid #d4e5ed;display:grid;place-items:center}.pcx-result-image img{width:74%;height:102px;object-fit:contain}.pcx-results h3{margin:0;color:#0f3c66}.pcx-row{display:grid;grid-template-columns:34px minmax(0,1fr) 72px 56px;gap:8px;align-items:center;padding:6px;border-radius:12px}.pcx-row.correct{background:#eaf8ef}.pcx-row>span{display:grid;place-items:center;width:30px;height:30px;border-radius:50%;background:#0d70a4;color:#fff;font-weight:900}.pcx-row i{height:19px;border-radius:999px;background:#e4edf2;overflow:hidden}.pcx-row i b{display:block;height:100%;background:linear-gradient(90deg,#1689bd,#31b16f)}.pcx-row strong,.pcx-row em{text-align:right;font-style:normal}.pcx-explain{margin-top:12px;padding:13px;border-radius:13px;background:#eaf8ef;color:#17643a;line-height:1.5}',
    '.pcx-finish{text-align:center;padding:28px;border:1px solid #c5e2d0;border-radius:18px;background:linear-gradient(145deg,#eefaf2,#fff);margin-top:14px}.pcx-finish .big{font-size:2.9rem}.pcx-finish h3{margin:6px 0;color:#0f3c66}',
    '.pcx-error{padding:18px;margin-top:14px;border:1px solid #efc5c2;border-radius:16px;background:#fff0ef;color:#8b322e}.pcx-tip{margin-top:12px;padding:12px;border-radius:13px;background:#fff7da;border:1px solid #f1db8a;color:#715c18;font-size:.82rem;line-height:1.45}',
    '@media(max-width:800px){#gameDialog.plateia-connected-dialog{width:100vw!important;max-width:100vw!important;height:100dvh!important;max-height:100dvh!important;margin:0!important;border-radius:0!important}.pcx{padding:13px;min-height:100dvh}.pcx-head{grid-template-columns:1fr}.pcx-room{display:none}.pcx-wait{grid-template-columns:1fr}.pcx-people{grid-template-columns:1fr}.pcx-toolbar{grid-template-columns:1fr 1fr}.pcx-toolbar .btn{grid-column:span 2}.pcx-question-grid{grid-template-columns:1fr}.pcx-question-visual{min-height:130px}.pcx-question-visual img{height:110px}.pcx-options{grid-template-columns:1fr}.pcx-live{grid-template-columns:1fr}.pcx-result-head{grid-template-columns:100px minmax(0,1fr)}.pcx-result-image{min-height:92px}.pcx-result-image img{height:78px}.pcx-row{grid-template-columns:30px minmax(0,1fr) 64px 46px}}'
  ].join('');
  document.head.appendChild(s);
}

function esc(s=''){
  return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function save(score,correct,answers){
  const r=JSON.parse(localStorage.getItem('mobiliza.results')||'{"games":0,"correct":0,"answers":0,"best":0,"streak":0}');
  r.games=(r.games||0)+1;r.correct=(r.correct||0)+correct;r.answers=(r.answers||0)+answers;r.best=Math.max(r.best||0,score);
  localStorage.setItem('mobiliza.results',JSON.stringify(r));
}
function uid(){
  return (crypto?.randomUUID?.()||('r-'+Date.now()+'-'+Math.random().toString(36).slice(2))).slice(0,80);
}

export function openPlateia(dialog,host,onFinish){
  css();
  dialog.classList.add('plateia-connected-dialog');

  let session=null;
  let participants=[];
  let questions=[];
  let qIndex=0;
  let state='boot';
  let roundId=null;
  let votes=new Map();
  let currentResult=null;
  let totalVotes=0;
  let majorityCorrect=0;
  let score=0;
  let destroyed=false;

  const header=(title,subtitle,badge='CONECTADA')=>'<div class="pcx-head"><div><p class="eyebrow">MOBILIZA EDUCA • PLATEIA CONECTADA</p><h2>'+title+'</h2><p>'+subtitle+'</p></div><div class="pcx-room"><small>SALA</small><strong>'+esc(session?.code||'------')+'</strong><small>'+badge+'</small></div></div>';

  const peopleHtml=(showVote=false)=>{
    if(!participants.length)return '<div class="pcx-empty">📱 Aguardando participantes entrarem pelo QR Code.</div>';
    return participants.map((p,i)=>{
      const voted=roundId&&votes.has(p.clientId);
      return '<div class="pcx-person"><span class="pcx-avatar">'+esc((p.name||'?').slice(0,1).toUpperCase())+'</span><div><strong>'+esc(p.name||('Participante '+(i+1)))+'</strong><small>'+(showVote?(voted?'voto recebido':'aguardando voto'):'conectado à sala')+'</small></div><i class="pcx-dot"></i></div>';
    }).join('');
  };

  const broadcastWaiting=()=>{
    session?.broadcast({type:'waiting',message:state==='waiting'?'Você entrou. Aguarde o operador iniciar o jogo.':'Aguarde o operador liberar a próxima pergunta.'});
  };

  function currentQuestionPayload(){
    const q=questions[qIndex];
    if(!q||!roundId)return null;
    return {type:'question',roundId,index:qIndex+1,total:questions.length,prompt:q.prompt,options:q.options,image:q.image||null,category:q.category||'',difficulty:q.difficulty||''};
  }

  function syncParticipant(clientId){
    if(!session)return;
    if(state==='waiting'||state==='boot'){
      session.sendTo(clientId,{type:'waiting',message:'Você entrou. Aguarde o operador iniciar o jogo.'});
      return;
    }
    if(state==='question'){
      const payload=currentQuestionPayload();
      if(payload)session.sendTo(clientId,payload);
      if(votes.has(clientId))session.sendTo(clientId,{type:'already-voted',roundId,choice:votes.get(clientId)});
      return;
    }
    if(state==='result'&&currentResult){
      session.sendTo(clientId,currentResult);
      return;
    }
    if(state==='finished')session.sendTo(clientId,{type:'session-finished'});
  }

  function updateWaitingPeople(){
    if(state!=='waiting')return;
    const count=host.querySelector('#pcxCount');
    if(count)count.textContent=participants.length;
    const list=host.querySelector('#pcxPeople');
    if(list)list.innerHTML=peopleHtml(false);
    const start=host.querySelector('#pcxStart');
    if(start)start.disabled=participants.length<1;
  }

  function updateLive(){
    if(state!=='question')return;
    const vc=host.querySelector('#pcxVoteCount');
    if(vc)vc.textContent=votes.size;
    const online=host.querySelector('#pcxOnline');
    if(online)online.textContent=participants.length;
    const list=host.querySelector('#pcxVoters');
    if(list)list.innerHTML=participants.map(p=>'<span class="pcx-voter '+(votes.has(p.clientId)?'voted':'')+'">'+(votes.has(p.clientId)?'✓ ':'○ ')+esc(p.name)+'</span>').join('');
    const reveal=host.querySelector('#pcxReveal');
    if(reveal)reveal.disabled=votes.size<1;
  }

  async function createSession(){
    state='boot';
    host.innerHTML='<section class="pcx">'+
      '<div class="pcx-loader"><div class="pcx-spinner"></div><h2>Criando sala compartilhada...</h2><p>Preparando conexão para os celulares da plateia.</p></div>'+
    '</section>';
    if(!dialog.open)dialog.showModal();

    let lastError=null;
    for(let attempt=0;attempt<4&&!session;attempt++){
      try{
        session=await createHostSession({
          code:makeSessionCode(),
          onParticipants:list=>{
            participants=list;
            updateWaitingPeople();
            updateLive();
          },
          onMessage:event=>handleMessage(event),
          onStatus:s=>{
            if(s.type==='error'&&state!=='finished')showConnectionWarning(s.error);
          }
        });
      }catch(e){lastError=e;}
    }
    if(!session){showFatal(lastError||new Error('Não foi possível criar a sessão.'));return;}
    renderWaiting();
  }

  function showConnectionWarning(error){
    const note=host.querySelector('#pcxConnectionNote');
    if(note)note.textContent='A conexão em tempo real apresentou instabilidade: '+(error?.message||'verifique a internet.');
  }

  function showFatal(error){
    state='error';
    host.innerHTML='<section class="pcx">'+header('Não foi possível abrir a Plateia Conectada','A sessão depende de internet para conectar os celulares.')+
      '<div class="pcx-error"><strong>Falha na conexão.</strong><br>'+esc(error?.message||'Erro desconhecido')+'</div>'+
      '<div class="pcx-tip">Confira se o computador está online e se a rede permite conexões WebRTC. Depois tente novamente.</div>'+
      '<div class="pcx-actions"><button type="button" class="btn primary" id="pcxRetry">Tentar novamente</button></div></section>';
    host.querySelector('#pcxRetry').onclick=()=>{try{session?.close();}catch{}session=null;createSession();};
  }

  function renderWaiting(){
    state='waiting';
    host.innerHTML='<section class="pcx">'+header('Sala de espera','Os participantes apontam a câmera para o QR Code, informam o nome e entram na mesma sessão.')+
      '<div class="pcx-wait">'+
        '<div class="pcx-card pcx-qrbox"><h3>Entrar pelo celular</h3><div id="pcxQr" class="pcx-qr"><span>Gerando QR...</span></div><div class="pcx-code-big">'+esc(session.code)+'</div><div class="pcx-url">'+esc(session.joinUrl)+'</div>'+
          '<div class="pcx-actions"><button type="button" class="btn ghost" id="pcxCopy">📋 Copiar link</button><button type="button" class="btn ghost" id="pcxFull">⛶ Telão</button></div>'+
          '<div id="pcxConnectionNote" class="pcx-tip">Internet necessária durante a sessão. Cada celular recebe uma identidade e só pode votar uma vez por pergunta.</div>'+
        '</div>'+
        '<div class="pcx-card"><div class="pcx-people-title"><div><h3>Participantes conectados</h3><p>Os nomes aparecem automaticamente ao entrar.</p></div><span class="pcx-count" id="pcxCount">'+participants.length+'</span></div><div class="pcx-people" id="pcxPeople">'+peopleHtml(false)+'</div>'+
          '<div class="pcx-actions end"><button type="button" class="btn primary big" id="pcxStart" '+(participants.length?'':'disabled')+'>▶ INICIAR JOGO COMPARTILHADO</button></div>'+
        '</div>'+
      '</div>'+
    '</section>';

    renderQr(host.querySelector('#pcxQr'),session.joinUrl,220).catch(()=>{const q=host.querySelector('#pcxQr');if(q)q.innerHTML='<strong>Use o código<br>'+esc(session.code)+'</strong>';});
    host.querySelector('#pcxCopy').onclick=async()=>{try{await navigator.clipboard.writeText(session.joinUrl);SoundManager.play('click');host.querySelector('#pcxCopy').textContent='✓ Link copiado';}catch{}};
    host.querySelector('#pcxFull').onclick=()=>{if(!document.fullscreenElement)dialog.requestFullscreen?.();else document.exitFullscreen?.();};
    host.querySelector('#pcxStart').onclick=()=>startGame();
    broadcastWaiting();
  }

  function startGame(){
    if(participants.length<1)return;
    questions=getQuestionSet({
      count:8,
      audiences:['criancas','adolescentes','adultos'],
      avoidRecent:true,
      markRecent:true,
      recentScope:'game:plateia-connected',
      recentLimit:28
    });
    qIndex=0;totalVotes=0;majorityCorrect=0;score=0;
    openQuestion();
  }

  function openQuestion(){
    state='question';
    roundId=uid();
    votes=new Map();
    currentResult=null;
    session.resetVotes();

    const q=questions[qIndex];
    const payload=currentQuestionPayload();
    session.broadcast(payload);

    host.innerHTML='<section class="pcx">'+header('Jogo compartilhado','A pergunta está aberta nos celulares. Os percentuais só aparecem quando você encerrar a votação.','PERGUNTA '+(qIndex+1)+'/'+questions.length)+
      '<div class="pcx-toolbar">'+
        '<div class="pcx-stat"><small>PERGUNTA</small><b>'+(qIndex+1)+'/'+questions.length+'</b></div>'+
        '<div class="pcx-stat"><small>ONLINE</small><b id="pcxOnline">'+participants.length+'</b></div>'+
        '<div class="pcx-stat"><small>VOTOS RECEBIDOS</small><b id="pcxVoteCount">0</b></div>'+
        '<div class="pcx-stat"><small>DISTRIBUIÇÃO</small><b>Oculta</b></div>'+
        '<button type="button" class="btn ghost" id="pcxFull">⛶ Telão</button>'+
      '</div>'+
      '<div class="pcx-question"><small>VOTAÇÃO ABERTA • '+esc(q.category||'')+' • '+esc(q.difficulty||'')+'</small><div class="pcx-question-grid">'+(q.image?'<div class="pcx-question-visual"><img src="'+esc(q.image)+'" alt="Ilustração relacionada à pergunta"></div>':'')+'<div><h3>'+esc(q.prompt)+'</h3><div class="pcx-options">'+q.options.map((x,n)=>'<div class="pcx-option"><b>'+String.fromCharCode(65+n)+'</b><span>'+esc(x)+'</span></div>').join('')+'</div></div></div></div>'+
      '<div class="pcx-live"><div class="pcx-card"><h3>Quem já votou?</h3><div id="pcxVoters" class="pcx-vote-list">'+participants.map(p=>'<span class="pcx-voter">○ '+esc(p.name)+'</span>').join('')+'</div></div><div class="pcx-live-note">🔒 Cada aparelho aceita <strong>um voto nesta rodada</strong>. O operador não vê qual alternativa cada pessoa escolheu antes de revelar o resultado.</div></div>'+
      '<div class="pcx-actions end"><button type="button" class="btn primary big" id="pcxReveal" disabled>📊 ENCERRAR VOTAÇÃO E REVELAR</button></div>'+
    '</section>';

    host.querySelector('#pcxFull').onclick=()=>{if(!document.fullscreenElement)dialog.requestFullscreen?.();else document.exitFullscreen?.();};
    host.querySelector('#pcxReveal').onclick=()=>reveal();
    SoundManager.play('open');
  }

  function handleMessage({data,clientId}){
    if(!data)return;

    if(data.type==='participant-ready'||data.type==='ready'){
      syncParticipant(clientId);
      return;
    }

    if(data.type==='vote'){
      if(state!=='question'||data.roundId!==roundId)return;
      const choice=Number(data.choice);
      if(!Number.isInteger(choice)||choice<0||choice>3)return;

      if(votes.has(clientId)){
        session.sendTo(clientId,{type:'already-voted',roundId,choice:votes.get(clientId)});
        return;
      }

      votes.set(clientId,choice);
      totalVotes++;
      session.markVoted(clientId,roundId);
      session.sendTo(clientId,{type:'vote-ack',roundId,choice});
      updateLive();
      SoundManager.play('click');
      return;
    }

    if(data.type==='participant-left'){
      updateLive();
      updateWaitingPeople();
    }
  }

  function reveal(){
    if(state!=='question'||votes.size<1)return;
    state='result';

    const q=questions[qIndex];
    const counts=[0,0,0,0];
    votes.forEach(v=>{if(v>=0&&v<4)counts[v]++;});
    const total=counts.reduce((a,b)=>a+b,0);
    const results=counts.map(v=>({count:v,percent:total?Math.round(v/total*100):0}));
    const max=Math.max(...counts);
    const leaders=counts.map((v,i)=>v===max?i:-1).filter(i=>i>=0);
    const majorityOk=leaders.length===1&&leaders[0]===q.correct;
    if(majorityOk){majorityCorrect++;score+=250;SoundManager.play('correct');}
    else SoundManager.play('next');

    currentResult={
      type:'result',
      roundId,
      prompt:q.prompt,
      options:q.options,
      image:q.image||null,
      category:q.category||'',
      difficulty:q.difficulty||'',
      correct:q.correct,
      why:q.why,
      votes:total,
      results
    };
    session.broadcast(currentResult);

    host.innerHTML='<section class="pcx">'+header('Resultado da plateia','O resultado foi enviado simultaneamente para todos os celulares.','RESULTADO '+(qIndex+1)+'/'+questions.length)+
      '<div class="pcx-results"><div class="pcx-result-head">'+(q.image?'<div class="pcx-result-image"><img src="'+esc(q.image)+'" alt="Ilustração relacionada à pergunta"></div>':'')+'<div><small>'+esc(q.category||'').toUpperCase()+' • '+esc(q.difficulty||'').toUpperCase()+'</small><h3>'+esc(q.prompt)+'</h3></div></div>'+
      results.map((r,n)=>'<div class="pcx-row '+(n===q.correct?'correct':'')+'"><span>'+String.fromCharCode(65+n)+'</span><i><b style="width:'+r.percent+'%"></b></i><strong>'+r.count+' voto'+(r.count===1?'':'s')+'</strong><em>'+r.percent+'%</em></div>').join('')+
      '<div class="pcx-explain"><strong>✅ Resposta de referência: '+String.fromCharCode(65+q.correct)+'. '+esc(q.options[q.correct])+'</strong><br>'+esc(q.why||'')+'</div>'+
      '<div class="pcx-actions end"><button type="button" class="btn primary big" id="pcxNext">'+(qIndex===questions.length-1?'🏁 ENCERRAR JOGO':'PRÓXIMA PERGUNTA ▶')+'</button></div>'+
      '</div></section>';

    host.querySelector('#pcxNext').onclick=()=>{
      if(qIndex===questions.length-1)finish();
      else{qIndex++;openQuestion();}
    };
  }

  function finish(){
    state='finished';
    session.broadcast({type:'session-finished'});
    save(score,majorityCorrect,questions.length);
    if(onFinish)onFinish();
    SoundManager.play('finish');

    host.innerHTML='<section class="pcx">'+header('Jogo encerrado','A sessão permanece aberta até você fechar esta tela.','FINAL')+
      '<div class="pcx-finish"><div class="big">🏁</div><h3>'+participants.length+' participante'+(participants.length===1?'':'s')+' conectado'+(participants.length===1?'':'s')+'</h3>'+
      '<p><strong>'+totalVotes+'</strong> votos recebidos em <strong>'+questions.length+'</strong> perguntas.</p>'+
      '<p>Em <strong>'+majorityCorrect+'</strong> rodada(s), a alternativa mais votada coincidiu com a resposta de referência.</p>'+
      '<p><strong>'+score+' pontos coletivos</strong></p>'+
      '<div class="pcx-actions" style="justify-content:center"><button type="button" class="btn primary" id="pcxAgain">Novo jogo com esta plateia</button><button type="button" class="btn ghost" id="pcxFinishClose">Encerrar sessão</button></div>'+
      '</div></section>';

    host.querySelector('#pcxAgain').onclick=()=>{broadcastWaiting();renderWaiting();};
    host.querySelector('#pcxFinishClose').onclick=()=>dialog.close();
  }

  const onClose=()=>{
    if(destroyed)return;
    destroyed=true;
    try{session?.close();}catch{}
    dialog.classList.remove('plateia-connected-dialog');
  };
  dialog.addEventListener('close',onClose,{once:true});

  createSession();
}
