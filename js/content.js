export const audiences=[
{id:'criancas',icon:'🧒',visual:'aud-criancas',title:'Crianças',description:'Aprender brincando com jogos, histórias, desafios visuais e missões adequadas à idade.',tags:['5–12 anos','gamificação'],ready:true},
{id:'adolescentes',icon:'🧑',visual:'aud-adolescentes',title:'Adolescentes',description:'Situações do cotidiano, escolhas, percepção de risco, bicicleta, celular, carona e convivência segura.',tags:['13–17 anos','vida real'],ready:true},
{id:'adultos',icon:'🚘',visual:'aud-adultos',title:'Adultos',description:'Conteúdos objetivos para condutores, motociclistas, ciclistas, pedestres e famílias.',tags:['18+','prevenção'],ready:true},
{id:'educadores-empresas',icon:'👩‍🏫',visual:'aud-educadores-empresas',title:'Educadores e empresas',description:'Trilhas prontas para escola, ações públicas, SIPAT, equipes, frotas e formação continuada.',tags:['escola','empresa'],ready:true}
];

export const games=[
{id:'quiz',icon:'⚡',cover:'assets/ai/hero_area_escolar.webp',title:'Quiz Relâmpago',description:'Escolha público, dificuldade, quantidade e tempo. Perguntas variadas, imagens, combos, sons e explicações.',tags:['níveis','cronômetro','offline'],ready:true},
{id:'milhao',icon:'💡',visual:'game-milhao',title:'Show do Milhão do Trânsito',description:'Perguntas, cronômetro, pulos, cartas e Plateia Conectada por QR Code, com fallback simulado.',tags:['plateia ao vivo','QR Code','telão'],ready:true},
{id:'trilha',icon:'🎲',visual:'game-trilha',title:'Trilha do Trânsito',description:'Tabuleiro, dado animado, peões, casas especiais e desafios educativos.',tags:['jogar agora','multijogador'],ready:true},
{id:'memoria',icon:'🧠',visual:'game-memoria',title:'Jogo da Memória',description:'Cartas animadas, pares de sinais e situações seguras, tempo e pontuação.',tags:['jogar agora','atenção'],ready:true},
{id:'cruzadas',icon:'✏️',visual:'game-cruzadas',title:'Palavras Cruzadas do Trânsito',description:'Pistas educativas, validação das respostas, tentativas e pontuação.',tags:['jogar agora','vocabulário'],ready:true},
{id:'eagora',icon:'🎬',cover:'assets/ai/hero_area_escolar.webp',title:'E Agora? — Decisões no Trânsito',description:'Cinco situações em movimento: observe, antecipe o risco, escolha a atitude e veja a consequência com explicação educativa.',tags:['5 situações','simulação','percepção de risco'],ready:true},
{id:'plateia',icon:'📱',cover:'assets/games/plateia_conectada.svg',title:'Plateia Conectada',description:'QR Code, participantes pelo próprio celular, uma resposta por aparelho, votação e resultado sincronizados no telão.',tags:['QR Code','multijogador','telão'],ready:true}
];

export const learning=[
{id:'pedestre',icon:'🚶',cover:'assets/ai/hero_area_escolar.webp',title:'Travessia e prioridade',description:'Visibilidade, faixa, semáforo, atenção e convivência entre os diferentes usuários da via.',tags:['universal','5 min'],ready:true},
{id:'distracao',icon:'📱',cover:'assets/games/cidade_mirim_realista_ai_v35.webp',title:'Distração no trânsito',description:'Celular, atenção dividida, tempo de reação e escolhas que aumentam o risco.',tags:['adolescentes','adultos'],ready:true},
{id:'velocidade',icon:'🛑',cover:'assets/games/cidade_mirim_realista_ai.webp',title:'Velocidade e risco',description:'Como a velocidade interfere na percepção, reação, distância de parada e gravidade das consequências.',tags:['adolescentes','adultos'],ready:true},
{id:'protecao',icon:'🛡️',cover:'assets/ai/hero_area_escolar.webp',title:'Proteção dos ocupantes',description:'Cinto, transporte de crianças, capacete e atitudes que reduzem consequências em uma ocorrência.',tags:['famílias','adultos'],ready:true},
{id:'bike',icon:'🚲',cover:'assets/games/trilha.webp',title:'Bicicleta e micromobilidade',description:'Visibilidade, equipamentos, circulação, cruzamentos e convivência segura.',tags:['9+','mobilidade'],ready:true},
{id:'moto',icon:'🏍️',cover:'assets/games/trilha_do_transito_agentes_mirins.webp',title:'Motociclista seguro',description:'Visibilidade, distância, pontos cegos, cruzamentos, frenagem e comportamento preventivo.',tags:['adultos','motociclistas'],ready:true},
{id:'familia',icon:'👨‍👩‍👧',cover:'assets/ai/hero_area_escolar.webp',title:'Trânsito começa em casa',description:'Conversas rápidas para pais, responsáveis e filhos sobre exemplos, hábitos e escolhas seguras.',tags:['famílias','5 min'],ready:true},
{id:'empresa',icon:'🏢',cover:'assets/games/cidade_mirim_realista_ai_v35.webp',title:'Segurança no deslocamento',description:'Conteúdo rápido para colaboradores, equipes externas, motoristas e deslocamentos a trabalho.',tags:['empresas','treinamento'],ready:true}
];


export const audienceProfiles={
criancas:{
  id:'criancas',icon:'🧒',eyebrow:'5 A 12 ANOS',title:'Aprender brincando e explorando',
  intro:'Jogos, histórias, memória, vocabulário, sinais e situações simples para desenvolver hábitos seguros desde cedo.',
  highlights:['Show do Milhão do Trânsito','Trilha do Trânsito','Jogo da Memória','Palavras Cruzadas do Trânsito'],
  tracks:[
    {icon:'🚦',title:'Primeiros passos no trânsito',text:'Semáforo, faixa, calçada, travessia e comportamento como passageiro.',format:'Trilha infantil'},
    {icon:'🎮',title:'Jogos do Mobiliza',text:'Quatro jogos já validados para escola, evento, computador, celular e telão.',format:'Jogos'},
    {icon:'🧩',title:'Descobrir e associar',text:'Sinais, equipamentos e atitudes seguras por associação visual e memória.',format:'Atividade'},
    {icon:'🏅',title:'Missões do Agente Mirim',text:'Pequenos desafios para observar, responder e praticar boas atitudes.',format:'Missões'}
  ]
},
adolescentes:{
  id:'adolescentes',icon:'🧑',eyebrow:'13 A 17 ANOS',title:'Decisões que fazem parte da vida real',
  intro:'Conteúdo direto, sem linguagem infantil, sobre celular, bicicleta, carona, velocidade, pressão do grupo e percepção de risco.',
  highlights:['Distração no trânsito','Velocidade e risco','Bicicleta e micromobilidade','Proteção dos ocupantes'],
  tracks:[
    {icon:'📱',title:'Celular e atenção',text:'O que muda quando a atenção sai da via por alguns segundos.',format:'Desafio rápido'},
    {icon:'🚲',title:'Mobilidade jovem',text:'Bicicleta, micromobilidade, visibilidade e convivência com veículos e pedestres.',format:'Trilha'},
    {icon:'👥',title:'Pressão dos amigos',text:'Como escolhas coletivas influenciam carona, velocidade, cinto e comportamento.',format:'Situações'},
    {icon:'🧠',title:'Percepção de risco',text:'Antecipar o que pode acontecer antes de tomar uma decisão.',format:'Teste visual'}
  ]
},
adultos:{
  id:'adultos',icon:'🚘',eyebrow:'18+ • TODOS OS MODAIS',title:'Conteúdo objetivo para escolhas seguras',
  intro:'Trilhas rápidas e práticas para condutores, motociclistas, ciclistas, pedestres e famílias, sem estética infantil.',
  highlights:['Velocidade e risco','Distração no trânsito','Motociclista seguro','Trânsito começa em casa'],
  tracks:[
    {icon:'🚘',title:'Condutor preventivo',text:'Distância, velocidade, distração, chuva, cruzamentos e convivência.',format:'Microcurso'},
    {icon:'🏍️',title:'Motociclista seguro',text:'Pontos cegos, frenagem, visibilidade, distância e cruzamentos.',format:'Trilha'},
    {icon:'🚶',title:'Pedestres e ciclistas',text:'Travessia, visibilidade, circulação e respeito aos usuários vulneráveis.',format:'Conteúdo rápido'},
    {icon:'👨‍👩‍👧',title:'Família no trânsito',text:'Como o exemplo dos adultos molda hábitos de crianças e adolescentes.',format:'Conversa guiada'}
  ]
},
'educadores-empresas':{
  id:'educadores-empresas',icon:'👩‍🏫',eyebrow:'ESCOLAS • ÓRGÃOS • EMPRESAS',title:'Aplicar, acompanhar e comprovar',
  intro:'Conteúdos prontos para ações educativas, sala de aula, campanhas, SIPAT, equipes, frotas e formação continuada.',
  highlights:['Agenda e eventos','Avaliação pedagógica','Evidências e impacto','Relatórios e indicadores'],
  tracks:[
    {icon:'🏫',title:'Escola',text:'Planos de aula, jogos, atividades, avaliação e material por faixa etária.',format:'Kit pedagógico'},
    {icon:'🏢',title:'Empresa e SIPAT',text:'Treinamentos rápidos, presença, avaliação e certificado por participante.',format:'Treinamento'},
    {icon:'📺',title:'Ações e telão',text:'Jogos coletivos, quiz, perguntas e experiências para campanhas públicas.',format:'Evento'},
    {icon:'📊',title:'Impacto',text:'Presença, pré/pós, participação, evidências e relatório final.',format:'Gestão'}
  ]
}
};

export const experiences=[
{id:'mito-verdade',icon:'⚖️',visual:'exp-mito',title:'Mito ou Verdade?',description:'Afirmações rápidas para provocar discussão e corrigir percepções equivocadas.',audiences:['adolescentes','adultos','educadores-empresas'],format:'60–90 s',status:'ativo',ready:true},
{id:'desafio-60',icon:'⏱️',cover:'assets/ai/hero_area_escolar.webp',title:'Desafio 60 segundos',description:'Uma situação, uma pergunta e uma explicação curta. Ideal para celular, telão e ações rápidas.',audiences:['criancas','adolescentes','adultos'],format:'1 min',status:'ativo',ready:true},
{id:'prioridade',icon:'🔀',cover:'assets/games/cidade_mirim_realista_ai_v35.webp',title:'Quem tem prioridade?',description:'Situações interativas para raciocinar sobre convivência, atenção, previsibilidade e tomada de decisão.',audiences:['adolescentes','adultos'],format:'interativo',status:'ativo',ready:true},
{id:'percepcao',icon:'👁️',visual:'exp-percepcao',title:'Teste sua percepção',description:'Mostra elementos de uma cena por poucos segundos e depois testa o que ficou na memória visual.',audiences:['adolescentes','adultos'],format:'visual',status:'ativo',ready:true},
{id:'historia',icon:'📖',cover:'assets/brand-cover.webp',title:'Histórias do Dicas do Chico',description:'Narrativas curtas com escolhas, feedback e pontuação para crianças.',audiences:['criancas'],format:'história',status:'ativo',ready:true},
{id:'arraste',icon:'🧩',visual:'exp-arraste',title:'Arraste para o lugar certo',description:'Associe capacete, cinto, faixa e bicicleta às situações correspondentes, com feedback imediato.',audiences:['criancas'],format:'atividade',status:'ativo',ready:true},
{id:'familia-5',icon:'🏠',cover:'assets/hero-ai.webp',title:'5 minutos em família',description:'Perguntas, conversas guiadas e combinados práticos para responsáveis e crianças.',audiences:['criancas','adultos'],format:'família',status:'ativo',ready:true},
{id:'empresa-rapido',icon:'💼',visual:'exp-pausa',title:'Pausa de Segurança',description:'Microtreinamento para colaboradores com conteúdo, checagem final e registro local de conclusão.',audiences:['adultos','educadores-empresas'],format:'empresa',status:'ativo',ready:true}
];

export const educatorModules=[
{id:'agenda',icon:'📅',cover:'assets/ai/hero_area_escolar.webp',title:'Agenda e eventos',description:'Planejamento da ação, local, público, equipe, materiais, metas e alarmes.',tags:['planejar'],ready:true},
{id:'conteudo',icon:'✍️',cover:'assets/brand-cover.webp',title:'Centro editorial',description:'Banco de perguntas, revisão pedagógica, categorias, dificuldade e homologação.',tags:['conteúdo'],ready:true},
{id:'avaliacao',icon:'📈',cover:'assets/games/plateia_conectada.svg',title:'Avaliação pedagógica',description:'Pré-teste, pós-teste, participação, evolução e indicadores de aprendizagem.',tags:['avaliar'],ready:true},
{id:'evidencias',icon:'📷',cover:'assets/games/cidade_mirim_realista_ai_v35.webp',title:'Evidências e impacto',description:'Registro de atividades, materiais distribuídos, fotos autorizadas e relatório final.',tags:['comprovar'],ready:true},
{id:'certificados',icon:'🎓',cover:'assets/mobiliza_educa_caminhos_para_a_vida.webp',title:'Certificados e passaporte',description:'Progresso, participação, certificados digitais e validação.',tags:['reconhecimento'],ready:true},
{id:'acessibilidade',icon:'♿',cover:'assets/ai/hero_area_escolar.webp',title:'Acessibilidade',description:'Contraste, tamanho de texto, navegação por teclado e futura leitura assistida.',tags:['inclusão'],ready:true}
];

export const adminModules=[
{id:'admin-dashboard',icon:'📊',title:'Dashboard administrativo',description:'Visão geral de escolas, participantes, eventos, partidas, presença, avaliações e pendências.',tags:['Windows → Web','prioridade'],ready:true},
{id:'admin-cadastros',icon:'🏫',title:'Pessoas e instituições',description:'Escolas, instituições, contatos, turmas, professores e alunos em uma base única.',tags:['cadastros','solicitantes'],ready:true},
{id:'admin-eventos',icon:'📅',title:'Agenda, solicitações e inscrições',description:'Receba demandas, transforme pedidos em agendamentos e acompanhe calendário, conflitos, checklist, QR Code, check-in, vagas, inscrições, presença, equipe e materiais.',tags:['agenda','inscrições','atendimento'],ready:true},
{id:'admin-conteudo',icon:'📝',title:'Conteúdo pedagógico',description:'Banco editorial versionado com categorias, público, dificuldade, revisão e homologação. Só conteúdo homologado alimenta jogos e avaliações.',tags:['editorial'],ready:true},
{id:'admin-avaliacao',icon:'📈',title:'Presença e avaliações',description:'Pré-teste e pós-teste pareados, aplicação por QR no celular, importação offline, evolução por participante/turma e indicadores por categoria.',tags:['impacto'],ready:true},
{id:'admin-evidencias',icon:'📷',title:'Evidências e impacto',description:'Fechamento pós-evento, público alcançado, materiais distribuídos, parceiros, fotos/documentos autorizados e relatório final automático.',tags:['comprovação','pós-evento'],ready:true},
{id:'admin-passaporte',icon:'🎓',title:'Passaporte e certificados',description:'Passaporte digital, conquistas, certificados por participante, QR de validação, revogação e histórico de emissão.',tags:['reconhecimento'],ready:true},
{id:'admin-relatorios',icon:'📑',title:'Relatórios e indicadores',description:'Painel 360 com filtros por período, instituição, ação e público; alcance, pré/pós, materiais, certificados, parceiros, evidências, rankings e qualidade dos dados.',tags:['gestão'],ready:true},
{id:'admin-acessos',icon:'🔐',title:'Usuários, perfis e auditoria',description:'Múltiplos usuários, perfis Gestor/Educador/Operador/Consulta, permissões por módulo, sessão por inatividade, bloqueio e trilha de auditoria.',tags:['segurança'],ready:true},
{id:'admin-sistema',icon:'⚙️',title:'Configurações, backup e sincronização',description:'Identidade institucional, backup operacional, backup completo criptografado, restauração com integridade, diagnóstico de armazenamento e prontidão da nuvem.',tags:['sistema'],ready:true},
{id:'admin-assinatura',icon:'💳',title:'Produto e assinatura',description:'Base SaaS com organização/tenant, catálogo de planos, recursos liberados e limites de uso — cobrança segura será autoritativa no backend.',tags:['SaaS','comercial'],ready:true}
];

export const tips=[
{title:'Segurança também se aprende pelo exemplo.',text:'Quando adultos respeitam a faixa, o semáforo e os limites, crianças aprendem que segurança é parte natural da convivência.'},
{title:'Velocidade muda tudo.',text:'Quanto maior a velocidade, menor o tempo para perceber, decidir e reagir. Reduzir a velocidade perto de escolas protege quem ainda está aprendendo a circular.'},
{title:'Celular e direção não combinam.',text:'Uma mensagem pode esperar. No trânsito, alguns segundos de distração significam muitos metros percorridos sem atenção plena.'},
{title:'Atravessar é uma decisão.',text:'Procure um ponto seguro, torne-se visível, observe os dois sentidos e só atravesse quando houver tempo suficiente.'}
];