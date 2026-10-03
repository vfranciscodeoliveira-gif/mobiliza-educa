export const audiences=[
{id:'criancas',icon:'🧒',title:'Crianças',description:'Aprender brincando com jogos, histórias, desafios visuais e missões adequadas à idade.',tags:['5–12 anos','gamificação'],ready:true},
{id:'adolescentes',icon:'🧑',title:'Adolescentes',description:'Situações do cotidiano, escolhas, percepção de risco, bicicleta, celular, carona e convivência segura.',tags:['13–17 anos','vida real'],ready:true},
{id:'adultos',icon:'🚘',title:'Adultos',description:'Conteúdos objetivos para condutores, motociclistas, ciclistas, pedestres e famílias.',tags:['18+','prevenção'],ready:true},
{id:'educadores-empresas',icon:'👩‍🏫',title:'Educadores e empresas',description:'Trilhas prontas para escola, ações públicas, SIPAT, equipes, frotas e formação continuada.',tags:['escola','empresa'],ready:true}
];

export const games=[
{id:'quiz',icon:'⚡',title:'Quiz Relâmpago',description:'Perguntas rápidas, pontuação, sequência de acertos e explicações pedagógicas.',tags:['funcional','offline'],ready:true},
{id:'milhao',icon:'💡',cover:'assets/games/quiz_do_milhao_do_transito.svg',title:'Show do Milhão do Trânsito',description:'Perguntas, cronômetro, pulos, cartas, plateia, progressão e resultado final.',tags:['jogar agora','telão'],ready:true},
{id:'trilha',icon:'🎲',cover:'assets/games/trilha_do_transito_agentes_mirins.svg',title:'Trilha do Trânsito',description:'Tabuleiro, dado animado, peões, casas especiais e desafios educativos.',tags:['jogar agora','multijogador'],ready:true},
{id:'memoria',icon:'🧠',cover:'assets/games/jogo_da_memoria_mobiliza_educa.svg',title:'Jogo da Memória',description:'Cartas animadas, pares de sinais e situações seguras, tempo e pontuação.',tags:['jogar agora','atenção'],ready:true},
{id:'cruzadas',icon:'✏️',cover:'assets/games/palavras_cruzadas_do_transito.svg',title:'Palavras Cruzadas do Trânsito',description:'Pistas educativas, validação das respostas, tentativas e pontuação.',tags:['jogar agora','vocabulário'],ready:true},
{id:'plateia',icon:'📱',title:'Plateia Interativa',description:'QR Code, respostas pelo celular, percentuais ao vivo e telão sincronizado.',tags:['coletivo','telão'],ready:false}
];

export const learning=[
{id:'pedestre',icon:'🚶',title:'Travessia e prioridade',description:'Visibilidade, faixa, semáforo, atenção e convivência entre os diferentes usuários da via.',tags:['universal','5 min'],ready:true},
{id:'distracao',icon:'📱',title:'Distração no trânsito',description:'Celular, atenção dividida, tempo de reação e escolhas que aumentam o risco.',tags:['adolescentes','adultos'],ready:true},
{id:'velocidade',icon:'🛑',title:'Velocidade e risco',description:'Como a velocidade interfere na percepção, reação, distância de parada e gravidade das consequências.',tags:['adolescentes','adultos'],ready:true},
{id:'protecao',icon:'🛡️',title:'Proteção dos ocupantes',description:'Cinto, transporte de crianças, capacete e atitudes que reduzem consequências em uma ocorrência.',tags:['famílias','adultos'],ready:true},
{id:'bike',icon:'🚲',title:'Bicicleta e micromobilidade',description:'Visibilidade, equipamentos, circulação, cruzamentos e convivência segura.',tags:['9+','mobilidade'],ready:true},
{id:'moto',icon:'🏍️',title:'Motociclista seguro',description:'Visibilidade, distância, pontos cegos, cruzamentos, frenagem e comportamento preventivo.',tags:['adultos','motociclistas'],ready:true},
{id:'familia',icon:'👨‍👩‍👧',title:'Trânsito começa em casa',description:'Conversas rápidas para pais, responsáveis e filhos sobre exemplos, hábitos e escolhas seguras.',tags:['famílias','5 min'],ready:true},
{id:'empresa',icon:'🏢',title:'Segurança no deslocamento',description:'Conteúdo rápido para colaboradores, equipes externas, motoristas e deslocamentos a trabalho.',tags:['empresas','treinamento'],ready:true}
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
{id:'mito-verdade',icon:'⚖️',title:'Mito ou Verdade?',description:'Afirmações rápidas para provocar discussão e corrigir percepções equivocadas.',audiences:['adolescentes','adultos','educadores-empresas'],format:'60–90 s',status:'ativo',ready:true},
{id:'desafio-60',icon:'⏱️',title:'Desafio 60 segundos',description:'Uma situação, uma pergunta e uma explicação curta. Ideal para celular, telão e ações rápidas.',audiences:['criancas','adolescentes','adultos'],format:'1 min',status:'planejado'},
{id:'prioridade',icon:'🔀',title:'Quem tem prioridade?',description:'Cenas esquemáticas simples para raciocinar sobre convivência, atenção e tomada de decisão.',audiences:['adolescentes','adultos'],format:'interativo',status:'planejado'},
{id:'percepcao',icon:'👁️',title:'Teste sua percepção',description:'Mostra elementos de uma cena por poucos segundos e depois testa o que ficou na memória visual.',audiences:['adolescentes','adultos'],format:'visual',status:'ativo',ready:true},
{id:'historia',icon:'📖',title:'Histórias do Dicas do Chico',description:'Narrativas curtas e ilustradas com escolhas simples para crianças.',audiences:['criancas'],format:'história',status:'planejado'},
{id:'arraste',icon:'🧩',title:'Arraste para o lugar certo',description:'Associe capacete, cinto, faixa e bicicleta às situações correspondentes, com feedback imediato.',audiences:['criancas'],format:'atividade',status:'ativo',ready:true},
{id:'familia-5',icon:'🏠',title:'5 minutos em família',description:'Perguntas e conversas guiadas para responsáveis e crianças aprenderem juntos.',audiences:['criancas','adultos'],format:'família',status:'planejado'},
{id:'empresa-rapido',icon:'💼',title:'Pausa de Segurança',description:'Microtreinamento para colaboradores com conteúdo, checagem final e registro local de conclusão.',audiences:['adultos','educadores-empresas'],format:'empresa',status:'ativo',ready:true}
];

export const educatorModules=[
{id:'agenda',icon:'📅',title:'Agenda e eventos',description:'Planejamento da ação, local, público, equipe, materiais, metas e alarmes.',tags:['planejar'],ready:true},
{id:'conteudo',icon:'✍️',title:'Centro editorial',description:'Banco de perguntas, revisão pedagógica, categorias, dificuldade e homologação.',tags:['conteúdo'],ready:true},
{id:'avaliacao',icon:'📈',title:'Avaliação pedagógica',description:'Pré-teste, pós-teste, participação, evolução e indicadores de aprendizagem.',tags:['avaliar'],ready:true},
{id:'evidencias',icon:'📷',title:'Evidências e impacto',description:'Registro de atividades, materiais distribuídos, fotos autorizadas e relatório final.',tags:['comprovar'],ready:true},
{id:'certificados',icon:'🎓',title:'Certificados e passaporte',description:'Progresso, participação, certificados digitais e validação.',tags:['reconhecimento'],ready:true},
{id:'acessibilidade',icon:'♿',title:'Acessibilidade',description:'Contraste, tamanho de texto, navegação por teclado e futura leitura assistida.',tags:['inclusão'],ready:true}
];

export const adminModules=[
{id:'admin-dashboard',icon:'📊',title:'Dashboard administrativo',description:'Visão geral de escolas, participantes, eventos, partidas, presença, avaliações e pendências.',tags:['Windows → Web','prioridade'],ready:true},
{id:'admin-cadastros',icon:'🏫',title:'Cadastros educacionais',description:'Escolas, turmas, professores, alunos, jogadores e vínculos institucionais.',tags:['cadastros'],ready:true},
{id:'admin-eventos',icon:'📅',title:'Eventos, agenda e operação',description:'Agenda, eventos, fila, recursos, materiais, equipes, parceiros e execução das ações.',tags:['operação'],ready:true},
{id:'admin-conteudo',icon:'📝',title:'Conteúdo pedagógico',description:'Banco de perguntas, categorias, dificuldades, revisão, auditoria e Centro Editorial.',tags:['editorial'],ready:true},
{id:'admin-avaliacao',icon:'📈',title:'Presença e avaliações',description:'Presença, pré-teste, pós-teste, evolução, indicadores e desempenho pedagógico.',tags:['impacto'],ready:true},
{id:'admin-passaporte',icon:'🎓',title:'Passaporte e certificados',description:'Medalhas, passaporte, certificados, validação e histórico de participação.',tags:['reconhecimento'],ready:true},
{id:'admin-relatorios',icon:'📑',title:'Relatórios e indicadores',description:'Relatórios operacionais, pedagógicos, estatísticas, ranking e comprovação de impacto.',tags:['gestão'],ready:true},
{id:'admin-acessos',icon:'🔐',title:'Usuários, perfis e auditoria',description:'Perfis, permissões, trilha de auditoria, segurança, acessibilidade e políticas.',tags:['segurança'],ready:true},
{id:'admin-sistema',icon:'⚙️',title:'Configurações, backup e sincronização',description:'Preferências, identidade, telão, dados locais, exportação, backup e futura sincronização em nuvem.',tags:['sistema'],ready:true}
];

export const tips=[
{title:'Segurança também se aprende pelo exemplo.',text:'Quando adultos respeitam a faixa, o semáforo e os limites, crianças aprendem que segurança é parte natural da convivência.'},
{title:'Velocidade muda tudo.',text:'Quanto maior a velocidade, menor o tempo para perceber, decidir e reagir. Reduzir a velocidade perto de escolas protege quem ainda está aprendendo a circular.'},
{title:'Celular e direção não combinam.',text:'Uma mensagem pode esperar. No trânsito, alguns segundos de distração significam muitos metros percorridos sem atenção plena.'},
{title:'Atravessar é uma decisão.',text:'Procure um ponto seguro, torne-se visível, observe os dois sentidos e só atravesse quando houver tempo suficiente.'}
];