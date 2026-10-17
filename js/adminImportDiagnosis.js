// Diagnóstico isolado: execute individualmente cada dependência da Gestão.
const dependencies=[
 ['Módulos administrativos','./modules/admin.js?v=65'],
 ['QR Educação','./modules/qrEducacao.js?v=2'],
 ['Protocolos','./modules/protocolCenter.js?v=4'],
 ['Agenda resumida','./modules/agendaOverview.js?v=1'],
 ['Acessos Firestore','./core/cloudAccess.js?v=1'],
 ['Gateway Firebase','./cloudGateway.js?v=6'],
 ['Conteúdo','./content.js?v=68'],
 ['Autenticação','./modules/auth.js?v=3']
];
const box=document.querySelector('#diagnosticResults');
const report=(name,status,detail='')=>{const row=document.createElement('p');row.textContent=name+': '+status+(detail?' — '+detail:'');box.append(row);};
document.querySelector('#startDiagnosis').addEventListener('click',async()=>{
 box.replaceChildren();document.querySelector('#startDiagnosis').disabled=true;
 for(const [name,uri] of dependencies){
  try{const response=await fetch(uri,{cache:'no-store'});if(!response.ok){report(name,'HTTP '+response.status,uri);continue;}
  const type=response.headers.get('content-type')||'';
  if(!/javascript|ecmascript/i.test(type)){report(name,'Formato inesperado',type+' • '+uri);continue;}
  try{await import(uri);report(name,'Módulo carregado');}
  catch(error){report(name,'FALHA',String(error.stack||error.message||error).slice(0,700));}
  }catch(error){report(name,'Falha de rede',String(error));}
 }
 document.querySelector('#startDiagnosis').disabled=false;
});
