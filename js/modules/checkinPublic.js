import {cloudConfigured,publicCheckin} from '../cloudGateway.js?v=2';

const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const digits=v=>String(v||'').replace(/\D/g,'');
const read=k=>JSON.parse(localStorage.getItem('mobiliza.admin.'+k)||'[]');
const write=(k,v)=>{localStorage.setItem('mobiliza.admin.'+k,JSON.stringify(v));window.dispatchEvent(new CustomEvent('mobiliza-data-change',{detail:{entity:k}}));};

function localCheckin(eventToken,protocol,contact){
 const event=read('eventos').find(x=>x.checkinToken===eventToken);
 if(!event)throw new Error('Este aparelho não possui o evento sincronizado. Procure a equipe de atendimento.');
 const regs=read('inscricoes'),r=regs.find(x=>x.idEvento===event.id&&String(x.protocolo||'').toUpperCase()===String(protocol||'').toUpperCase());
 if(!r)throw new Error('Inscrição não encontrada para este evento.');
 const okContact=(r.email&&String(r.email).toLowerCase()===String(contact).trim().toLowerCase())||(r.telefone&&digits(r.telefone)===digits(contact));
 if(!okContact)throw new Error('Os dados informados não conferem com a inscrição.');
 if(!['Confirmada','Presente'].includes(r.status))throw new Error('Sua inscrição ainda não está confirmada pelo gestor.');
 if(r.status!=='Presente'){r.status='Presente';r.checkedInAt=new Date().toISOString();r.checkinOrigem='QR_EVENTO_LOCAL';write('inscricoes',regs);}
 return {ok:true,nome:r.nome||r.responsavel||'Participante',evento:event.nome,status:'Presente',checkedInAt:r.checkedInAt};
}

export function openPublicCheckin(eventToken){
 if(!eventToken)return;
 if(document.getElementById('publicCheckinOverlay'))return;
 const box=document.createElement('div');box.id='publicCheckinOverlay';box.innerHTML=`
 <style>
 #publicCheckinOverlay{position:fixed;inset:0;z-index:99999;background:rgba(5,25,38,.82);display:grid;place-items:center;padding:16px}
 #publicCheckinCard{width:min(560px,100%);background:#fff;border-radius:20px;padding:22px;color:#173f60;box-shadow:0 28px 80px rgba(0,0,0,.3)}
 #publicCheckinCard h2{margin:6px 0}#publicCheckinCard p{line-height:1.45}
 #publicCheckinCard label{display:grid;gap:5px;font-weight:800;margin:10px 0}#publicCheckinCard input{padding:11px;border:1px solid #c9dbe6;border-radius:10px;font:inherit}
 .pc-note{padding:11px 12px;border-radius:10px;background:#fff7dc;border-left:4px solid #efb323}.pc-ok{padding:14px;border-radius:12px;background:#e8f8ee;border:1px solid #b8e4c6}.pc-error{padding:12px;border-radius:10px;background:#ffe9e9;color:#7e2222}
 .pc-actions{display:flex;gap:8px;justify-content:flex-end;margin-top:14px}
 </style>
 <section id="publicCheckinCard"><p class="eyebrow">CHECK-IN • MOBILIZA EDUCA</p><h2>Registrar presença</h2><p>Escaneamento do QR do evento reconhecido.</p>
 <div class="pc-note"><strong>Importante:</strong> o check-in só é aceito para inscrição já <b>Confirmada</b> pelo gestor.</div>
 <form id="pcForm"><label>Protocolo da inscrição<input name="protocolo" required placeholder="INS-..."></label><label>E-mail ou telefone usado na inscrição<input name="contato" required></label><div class="pc-actions"><button type="button" class="btn ghost" id="pcClose">Fechar</button><button class="btn primary">Confirmar presença</button></div></form><div id="pcResult"></div></section>`;
 document.body.appendChild(box);
 const form=box.querySelector('#pcForm'),result=box.querySelector('#pcResult'),close=()=>{box.remove();const u=new URL(location.href);u.searchParams.delete('checkin');history.replaceState({},'',u);};
 box.querySelector('#pcClose').onclick=close;box.addEventListener('click',e=>{if(e.target===box)close();});
 form.onsubmit=async e=>{e.preventDefault();const b=form.querySelector('button[type="submit"]'),data=Object.fromEntries(new FormData(form).entries());b.disabled=true;b.textContent='Registrando...';result.innerHTML='';try{const r=cloudConfigured()?await publicCheckin(eventToken,data.protocolo.trim(),data.contato.trim()):localCheckin(eventToken,data.protocolo.trim(),data.contato.trim());result.innerHTML=`<div class="pc-ok"><strong>✓ Presença registrada</strong><p>${esc(r.nome||'Participante')} • ${esc(r.evento||'Atividade')}</p><p>Status: <b>Presente</b></p></div>`;form.hidden=true;}catch(err){result.innerHTML=`<div class="pc-error">${esc(err.message)}</div>`;}finally{b.disabled=false;b.textContent='Confirmar presença';}};
}
