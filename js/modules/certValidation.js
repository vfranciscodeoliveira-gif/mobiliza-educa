import {cloudConfigured,validateCertificate} from '../cloudGateway.js?v=3';

const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const localFind=code=>JSON.parse(localStorage.getItem('mobiliza.admin.certificados')||'[]').find(x=>String(x.code||'').toUpperCase()===String(code||'').toUpperCase());

export async function openCertificateValidation(code){
 if(!code||document.getElementById('certValidationOverlay'))return;
 const box=document.createElement('div');box.id='certValidationOverlay';
 box.innerHTML='<style>#certValidationOverlay{position:fixed;inset:0;z-index:99999;background:rgba(5,25,38,.82);display:grid;place-items:center;padding:16px}#certValidationCard{width:min(620px,100%);background:#fff;border-radius:20px;padding:22px;color:#173f60;box-shadow:0 28px 80px rgba(0,0,0,.3)}.cv-ok{padding:14px;border-radius:12px;background:#e8f8ee;border:1px solid #b8e4c6}.cv-bad{padding:14px;border-radius:12px;background:#ffe9e9;border:1px solid #e3b6b6}.cv-pending{padding:14px;border-radius:12px;background:#fff7dc;border:1px solid #ecd88e}.cv-code{font-family:monospace;font-weight:900;font-size:1.05rem}</style><section id="certValidationCard"><p class="eyebrow">VALIDAÇÃO • MOBILIZA EDUCA</p><h2>Validar certificado</h2><div id="certValidationBody">Consultando...</div><div style="display:flex;justify-content:flex-end;margin-top:14px"><button class="btn ghost" id="certValidationClose">Fechar</button></div></section>';
 document.body.appendChild(box);
 const body=box.querySelector('#certValidationBody'),close=()=>{box.remove();const u=new URL(location.href);u.searchParams.delete('cert');history.replaceState({},'',u);};
 box.querySelector('#certValidationClose').onclick=close;box.onclick=e=>{if(e.target===box)close();};
 try{
  let c=localFind(code);
  if(!c&&cloudConfigured())c=await validateCertificate(code);
  if(c){
   const revoked=c.status==='Revogado';
   body.innerHTML='<div class="'+(revoked?'cv-bad':'cv-ok')+'"><strong>'+(revoked?'Certificado revogado':'Certificado válido')+'</strong><p class="cv-code">'+esc(c.code||code)+'</p><p><b>'+esc(c.participantName||c.nome||'')+'</b><br>'+esc(c.activityName||c.atividade||'')+'<br>'+esc(c.eventDateLabel||c.data||'')+' • '+esc(c.workloadLabel||c.cargaHoraria||'')+'</p></div>';
  }else if(!cloudConfigured()){
   body.innerHTML='<div class="cv-pending"><strong>Validação online ainda não ativada.</strong><p>Este código não está salvo neste aparelho. Quando o Firebase do Mobiliza Educa for ativado, a validação poderá ser feita de qualquer dispositivo.</p><p class="cv-code">'+esc(code)+'</p></div>';
  }else body.innerHTML='<div class="cv-bad"><strong>Certificado não encontrado.</strong><p class="cv-code">'+esc(code)+'</p></div>';
 }catch(e){body.innerHTML='<div class="cv-bad"><strong>Não foi possível validar.</strong><p>'+esc(e.message)+'</p></div>';}
}
