const modules={
'admin-dashboard':{title:'Dashboard administrativo',intro:'Painel único para acompanhar operação, alcance e qualidade pedagógica.',stats:[['Escolas','0'],['Participantes','0'],['Eventos','0'],['Partidas','0']],sections:['Atividade recente','Pendências da operação','Indicadores pedagógicos','Próximos eventos']},
'admin-cadastros':{title:'Cadastros educacionais',intro:'Base estruturada de instituições e participantes.',sections:['Escolas','Turmas','Professores','Alunos','Jogadores','Vínculos e importação']},
'admin-eventos':{title:'Eventos, agenda e operação',intro:'Planejamento e execução de ações educativas do início ao relatório final.',sections:['Agenda inteligente','Eventos','Fila e operação','Equipe','Parceiros','Materiais distribuídos','Evidências']},
'admin-conteudo':{title:'Conteúdo pedagógico',intro:'Governança do conteúdo usado em jogos, avaliações e atividades.',sections:['Banco de perguntas','Categorias','Dificuldade','Centro Editorial','Revisão e homologação','Histórico de alterações']},
'admin-avaliacao':{title:'Presença e avaliações',intro:'Registro de participação e medição de aprendizagem.',sections:['Presença','Pré-teste','Pós-teste','Evolução por turma','Indicadores','Comparativos']},
'admin-passaporte':{title:'Passaporte e certificados',intro:'Reconhecimento da participação e progressão educativa.',sections:['Passaporte digital','Medalhas','Certificados','Validação por QR Code','Histórico']},
'admin-relatorios':{title:'Relatórios e indicadores',intro:'Transformar dados da operação em gestão e comprovação de impacto.',sections:['Relatório de atividades','Relatório por evento','Relatório por escola','Ranking','Estatísticas','Exportação PDF/CSV']},
'admin-acessos':{title:'Usuários, perfis e auditoria',intro:'Controle de acesso e rastreabilidade administrativa.',sections:['Usuários','Perfis','Permissões','Auditoria','Acessibilidade','Segurança']},
'admin-sistema':{title:'Configurações, backup e sincronização',intro:'Configurações gerais e continuidade operacional.',sections:['Identidade institucional','Preferências','Telão e projeção','Backup local','Importação/exportação','Sincronização futura']}
};

export function openAdminModule(id,dialog,host){
 const m=modules[id]; if(!m)return;
 const stored=JSON.parse(localStorage.getItem('mobiliza.admin.demo')||'{}');
 const stats=(m.stats||[]).map(([k,v])=>`<article class="admin-kpi"><span>${k}</span><strong>${stored[k]??v}</strong></article>`).join('');
 host.innerHTML=`<section class="admin-module"><p class="eyebrow">CENTRO DE GESTÃO WEB • ALPHA</p><h2>${m.title}</h2><p class="admin-intro">${m.intro}</p>${stats?`<div class="admin-kpis">${stats}</div>`:''}<div class="admin-module-grid">${m.sections.map((s,i)=>`<article class="admin-feature"><span class="admin-feature-index">${String(i+1).padStart(2,'0')}</span><div><strong>${s}</strong><p>Fluxo previsto e pronto para ativação progressiva na versão web.</p></div><button type="button" class="btn ghost" data-admin-action="${s}">Abrir</button></article>`).join('')}</div><div class="admin-note"><strong>Fase atual:</strong> arquitetura e experiência de uso. Persistência institucional, login e banco remoto entrarão em uma etapa posterior sem impedir o uso offline/local.</div></section>`;
 host.querySelectorAll('[data-admin-action]').forEach(b=>b.addEventListener('click',()=>{alert(`${b.dataset.adminAction}: estrutura preparada. O próximo passo será implementar cadastro, edição, filtros, pesquisa, relatórios e persistência.`);}));
 dialog.showModal();
}