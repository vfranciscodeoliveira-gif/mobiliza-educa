(function(){
let errorText='';
const identify=value=>String(value?.message||value||'Erro desconhecido').slice(0,400);
window.addEventListener('error',event=>{errorText=identify(event.error||event.message);},true);
window.addEventListener('unhandledrejection',event=>{errorText=identify(event.reason);});
function recover(){
const context=document.getElementById('adminContext'),session=document.getElementById('adminUserCard');
const waiting=/Carregando organização|Verificando sessão/.test(context?.textContent||'')||/Validando acesso/.test(session?.textContent||'');
if(!waiting||document.getElementById('adminStuckHelp'))return;
const panel=document.createElement('aside');panel.id='adminStuckHelp';panel.setAttribute('role','alert');panel.style.cssText='margin:16px 0;padding:20px;background:#fff8e7;border:2px solid #dfb04b;border-radius:14px;color:#624316;max-width:840px;';
const title=document.createElement('h2');title.textContent='Falha ao iniciar o Centro de Gestão';title.style.margin='0 0 10px';
const description=document.createElement('p');description.textContent=window.__mobilizaAdminModuleLoaded?(errorText||'A verificação de acesso não terminou. Sua sessão permanece protegida.'):(errorText||'O módulo administrativo não iniciou. Pode haver um erro de importação ou arquivo JavaScript indisponível.');
const btn=document.createElement('button');btn.type='button';btn.className='btn primary';btn.textContent='Recarregar gestão';btn.onclick=()=>location.reload();
const link=document.createElement('a');link.href='./';link.textContent='Voltar ao site';link.style.cssText='margin-left:14px;display:inline-block';
panel.append(title,description,btn,link);
const main=document.querySelector('main')||context?.parentElement||document.body;main.prepend(panel);
if(context)context.textContent='Inicialização interrompida; consulte o diagnóstico acima.';
if(session)session.querySelector('strong')?.replaceChildren(document.createTextNode('Falha na validação'));
}
document.addEventListener('DOMContentLoaded',()=>{setTimeout(recover,4500);setTimeout(recover,13000);});
})();