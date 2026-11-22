import {assessmentQuestionIds,resolveAssessmentQuestions,parseInviteToken,buildResultToken,scoreAssessment} from '../core/assessmentEngine.js?v=2';
import {qrSvg} from '../core/qr.js?v=1';

const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

function savePending(result){
 const key='mobiliza.assessment.pendingResults';
 let rows=[];try{rows=JSON.parse(localStorage.getItem(key)||'[]');}catch{}
 rows.unshift({...result,receivedAt:new Date().toISOString()});
 localStorage.setItem(key,JSON.stringify(rows.slice(0,50)));
}

export function openPublicAssessment(rawToken){
 const cfg=parseInviteToken(rawToken);
 if(!cfg||document.getElementById('assessmentPublicOverlay'))return;
 const ids=assessmentQuestionIds(cfg),questions=resolveAssessmentQuestions(ids),answers=Array(questions.length).fill(null);
 let i=0,startedAt=new Date().toISOString();
 const box=document.createElement('div');box.id='assessmentPublicOverlay';
 box.innerHTML='<style>#assessmentPublicOverlay{position:fixed;inset:0;z-index:99999;background:#eef5f8;overflow:auto;padding:14px}.ap-wrap{max-width:760px;margin:auto}.ap-head{background:linear-gradient(135deg,#083f69,#0c86ae);color:#fff;padding:20px;border-radius:18px;margin-bottom:12px}.ap-card{background:#fff;border:1px solid #d7e6ee;border-radius:16px;padding:18px;box-shadow:0 10px 30px rgba(18,55,77,.08)}.ap-progress{height:9px;border-radius:99px;background:#e5edf2;overflow:hidden;margin:8px 0 16px}.ap-progress span{display:block;height:100%;background:#0b77a6}.ap-q{font-size:1.18rem;font-weight:900;line-height:1.35;margin:10px 0}.ap-options{display:grid;gap:9px}.ap-opt{width:100%;text-align:left;padding:12px;border:1px solid #cbdde7;border-radius:12px;background:#fff;color:#173f60;font:inherit;cursor:pointer}.ap-opt.selected{background:#e8f5fb;border-color:#0b78a8;box-shadow:0 0 0 2px rgba(11,120,168,.12)}.ap-actions{display:flex;justify-content:space-between;gap:8px;margin-top:14px}.ap-finish{text-align:center}.ap-finish svg{width:min(300px,85vw);height:auto}.ap-code{font-family:monospace;font-weight:900;letter-spacing:1px;word-break:break-all}.ap-note{padding:11px;border-radius:10px;background:#fff7dc;border-left:4px solid #e5a100;margin:12px 0}</style><div class="ap-wrap"><div class="ap-head"><p style="margin:0;font-size:.78rem;font-weight:900">MOBILIZA EDUCA • AVALIAÇÃO PEDAGÓGICA</p><h2 style="margin:6px 0">'+(cfg.phase==='PRE'?'Pré-teste':'Pós-teste')+'</h2><p style="margin:0">Responda com atenção. Não há correção durante o teste para preservar a comparação pedagógica.</p></div><div id="assessmentPublicBody" class="ap-card"></div></div>';
 document.body.appendChild(box);
 const body=box.querySelector('#assessmentPublicBody');
 const close=()=>{box.remove();const u=new URL(location.href);u.searchParams.delete('a');u.searchParams.delete('avaliar');history.replaceState({},'',u);};

 function start(){
  body.innerHTML='<h3>Antes de começar</h3><p>São '+questions.length+' questões rápidas. Escolha a alternativa que você considera correta.</p><div class="ap-note"><strong>Importante:</strong> esta avaliação mede aprendizagem do grupo e não substitui habilitação, prova oficial ou qualquer exame de trânsito.</div><div class="ap-actions"><button class="btn ghost" id="apClose">Sair</button><button class="btn primary" id="apStart">Começar</button></div>';
  body.querySelector('#apClose').onclick=close;body.querySelector('#apStart').onclick=()=>{startedAt=new Date().toISOString();renderQuestion();};
 }
 function renderQuestion(){
  const q=questions[i],pct=Math.round(i/questions.length*100);
  body.innerHTML='<div><small>Questão '+(i+1)+' de '+questions.length+'</small><div class="ap-progress"><span style="width:'+pct+'%"></span></div><div class="ap-q">'+esc(q.prompt)+'</div><div class="ap-options">'+q.options.map((o,idx)=>'<button type="button" class="ap-opt '+(answers[i]===idx?'selected':'')+'" data-answer="'+idx+'">'+esc(o)+'</button>').join('')+'</div><div class="ap-actions"><button class="btn ghost" id="apPrev" '+(i===0?'disabled':'')+'>← Anterior</button><button class="btn primary" id="apNext" '+(answers[i]===null?'disabled':'')+'>'+(i===questions.length-1?'Concluir':'Próxima →')+'</button></div></div>';
  body.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>{answers[i]=Number(b.dataset.answer);renderQuestion();});
  body.querySelector('#apPrev').onclick=()=>{if(i>0){i--;renderQuestion();}};
  body.querySelector('#apNext').onclick=()=>{if(answers[i]===null)return;if(i<questions.length-1){i++;renderQuestion();}else finish();};
 }
 function finish(){
  const score=scoreAssessment(ids,answers),resultToken=buildResultToken({planCode:cfg.planCode,participantCode:cfg.participantCode,phase:cfg.phase,answers});
  savePending({token:resultToken,planCode:cfg.planCode,participantCode:cfg.participantCode,phase:cfg.phase,answers,scorePct:score.pct,startedAt,finishedAt:new Date().toISOString()});
  const qr=qrSvg(resultToken,{scale:6,ariaLabel:'QR do resultado da avaliação'});
  body.innerHTML='<div class="ap-finish"><h2>✓ Avaliação concluída</h2><p>Apresente este QR à equipe do Mobiliza Educa para importar seu resultado.</p><div>'+qr+'</div><p class="ap-code">'+esc(resultToken)+'</p><div class="ap-note">'+(cfg.phase==='PRE'?'O resultado do pré-teste fica registrado para comparação posterior.':'O pós-teste foi concluído. A equipe poderá comparar sua evolução com o pré-teste.')+'</div><button class="btn primary" id="apDone">Finalizar</button></div>';
  body.querySelector('#apDone').onclick=close;
 }
 start();
}
