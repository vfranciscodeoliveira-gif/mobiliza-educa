export const audiences=[
{id:'criancas',icon:'🧒',title:'Crianças e estudantes',description:'Jogos, desafios e missões com linguagem simples, feedback imediato e progressão.',tags:['gamificação','7+'],ready:true},
{id:'educadores',icon:'👩‍🏫',title:'Educadores e professores',description:'Planos de aula, atividades, telão, avaliações e materiais para ações educativas.',tags:['escola','eventos'],ready:true},
{id:'familias',icon:'👨‍👩‍👧',title:'Famílias e comunidade',description:'Conteúdos rápidos e desafios para transformar comportamentos cotidianos.',tags:['cidadania','prevenção'],ready:true}
];

export const games=[
{id:'quiz',icon:'⚡',title:'Quiz Relâmpago',description:'Perguntas rápidas, pontuação, sequência de acertos e explicações pedagógicas.',tags:['funcional','offline'],ready:true,accent:'quiz'},
{id:'milhao',icon:'💡',title:'Quiz do Milhão do Trânsito',description:'Experiência de palco com cronômetro, confirmação, pulos, cartas, plateia, ranking e modo telão.',tags:['destaque','telão'],ready:true,image:'assets/games/milhao.webp'},
{id:'trilha',icon:'🎲',title:'Trilha do Trânsito',description:'Tabuleiro educativo com dado animado, peões, avanço por casas, eventos especiais e desafios.',tags:['multijogador','offline'],ready:true,image:'assets/games/trilha.webp'},
{id:'memoria',icon:'🧠',title:'Jogo da Memória',description:'Pares visuais de segurança viária com animação, tempo, jogadas e pontuação.',tags:['atenção','visual'],ready:true,image:'assets/games/memoria.webp'},
{id:'cruzadas',icon:'✏️',title:'Palavras Cruzadas do Trânsito',description:'Pistas educativas, validação imediata e pontuação por desempenho.',tags:['vocabulário','desafio'],ready:true,image:'assets/games/cruzadas.webp'},
{id:'cidade',icon:'🏙️',title:'Cidade Mirim',description:'Missões em ambiente urbano com decisões de pedestre, ciclista e ocupante de veículo.',tags:['simulação','missões'],ready:true,accent:'city'},
{id:'plateia',icon:'📱',title:'Plateia Interativa',description:'Modo local para respostas coletivas e percentuais ao vivo, preparado para sincronização futura.',tags:['coletivo','telão'],ready:true,accent:'audience'}
];

export const learning=[
{id:'pedestre',icon:'🚶',title:'Pedestre seguro',description:'Travessia, visibilidade, faixa, semáforo e atenção.',tags:['5 min'],ready:true},
{id:'bike',icon:'🚲',title:'Mobilidade por bicicleta',description:'Circulação, sinalização, equipamentos e convivência segura.',tags:['5 min'],ready:true},
{id:'velocidade',icon:'🛑',title:'Velocidade e risco',description:'Por que pequenas diferenças de velocidade mudam distância de parada e gravidade.',tags:['7 min'],ready:true},
{id:'cinto',icon:'🚗',title:'Proteção veicular',description:'Cinto, transporte de crianças e comportamento seguro dos ocupantes.',tags:['5 min'],ready:true}
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