(function(){
 const problems=[];
 const message=err=>String(err&&err.message||err||'Falha não identificada').slice(0,350);
 window.addEventListener('error',e=>{if(e.error||e.message)problems.push(message(e.error||e.message));},{capture:true});
 window.addEventListener('unhandledrejection',e=>problems.push(message(e.reason)));
 function show(){
  if(window.__mobilizaMainReady)return;
  let status=document.getElementById('mobilizaDiagnostic');
  if(!status){status=document.createElement('aside');status.id='mobilizaDiagnostic';status.setAttribute('role','status');status.style.cssText='margin:12px auto;padding:14px;border:1px solid #e4b34d;border-radius:12px;background:#fff8e8;max-width:1100px;color:#654100';document.querySelector('#conteudo')?.prepend(status);}
  if(!status)return;
  const source=problems.length?problems.join(' | '):'A inicialização completa não sinalizou conclusão. Verifique os módulos e a conexão.';
  status.textContent='Diagnóstico Mobiliza Educa: '+source;
 }
 document.addEventListener('DOMContentLoaded',()=>setTimeout(show,3500));
})();