# Importar lista escolar PDF

Em Pessoas e instituições, clique em **Lista da escola (PDF)**. Envie um PDF de até 10 MB / 50 páginas com texto selecionável e cabeçalhos no modelo SED: Escola, Ano Letivo, Turma, Ativos, Cadastrados e tabela com série, número, nome, RA, dígito, UF, nascimento e situação.

O parser reconhece turmas e turnos, recompõe nomes quebrados em linhas e confronta os totais com os cabeçalhos. PDFs escaneados ou outros modelos não são aceitos automaticamente. Cada arquivo deve conter uma escola. O processamento é no navegador, usando PDF.js carregado do CDN; o PDF não é enviado ao Firestore.

Escolha a escola de destino ou **Criar escola com o nome do PDF**. Não há seleção automática da primeira escola. Se o nome selecionado diferir do PDF, a interface pede confirmação. Confira todos os nomes na prévia e marque a revisão para habilitar o fluxo de gravação.

São importados apenas alunos ATIVO. RA/dígito/UF identificam duplicados. Data de nascimento é opcional, desmarcada por padrão. Informações de deficiência não são importadas. As turmas armazenam ano/série e ano letivo, com vínculo à escola. As mesmas regras Firestore dos seis cadastros já publicadas são suficientes.

Cada registro é confirmado no servidor. A operação completa não é atômica: interrupções podem deixar escola, turmas e parte dos alunos gravados. Repetir a importação ignora os registros existentes. IDs derivados da escola/turma/RA limitam duplicação do mesmo arquivo em reenvios. Não se move automaticamente um aluno já encontrado pelo mesmo RA em outra turma; o resumo informa a contagem de conflitos para revisão manual. A detecção por RA consulta os dados carregados e ainda não impõe unicidade global por transação em importações simultâneas distintas.

Verificação: 8 testes locais passaram. A extração do PDF de referência foi executada com PDF.js e conferiu 4 turmas, 102 registros e 95 ativos; nomes em duas linhas foram recompostos. O Chromium não estava instalado no ambiente, portanto a interface completa não foi exercitada em navegador nem foram feitas gravações com esse arquivo em produção. Após publicação, validar a prévia, importação, repetição e leitura em outro computador com a conta Firebase da organização.


## DOCX e arrastar e soltar

O seletor e a área de arrastar e soltar aceitam um PDF ou DOCX por vez, até 10 MB. A área também funciona por clique, Enter e Espaço. DOCX é descompactado no navegador com JSZip; o XML principal é lido sem executar macros ou carregar relacionamentos externos. São reconhecidas tabelas com coluna Nome / Nome do aluno / Nome completo, com campos opcionais RA, nascimento e situação, ou listas numeradas. Não são suportados arquivos DOC antigos, textos livres sem estrutura, nomes dentro de imagens ou tabelas com outras organizações de colunas.

Turma, turno e ano letivo podem ser corrigidos na prévia. O ano letivo do DOCX é extraído do cabeçalho quando disponível; caso contrário, aparece o ano corrente para revisão. Sem escola identificada, é obrigatório escolher uma escola já cadastrada. Sem RA, a detecção de duplicados usa nome e turma; homônimos precisam de revisão. Sem coluna de situação, o aluno é tratado como ATIVO. A data de nascimento continua opcional.

Verificação adicional: testes de parsing de blocos DOCX (tabelas, listas, situações, cabeçalhos repetidos e escola), clique/teclado, descarte de vários arquivos e rejeição de .doc com instrução de conversão. Total de 14 testes locais passou. A abertura de um DOCX real no navegador e a gravação no Firestore ainda exigem validação no site.

## Fila de vários arquivos

O seletor aceita múltiplos arquivos e a área aceita soltar vários PDFs/DOCX ao mesmo tempo. Até 20 arquivos por lote, 10 MB por arquivo; a leitura é sequencial. Cada arquivo tem uma prévia independente de escola/turma/turno/ano. Arquivos com erro são sinalizados e não importados. Antes de começar a gravar, todas as prévias válidas e pendentes devem ter escola, turma, turno, ano e revisão confirmados. A importação é sequencial, com resumo individual e geral; arquivos já concluídos não são reexecutados pelo botão do lote. Uma falha de gravação interrompe o lote e informa o arquivo; uma tentativa seguinte usa a prevenção de duplicados existente. Fechar e reabrir o importador inicia uma nova fila.

Atualização de validação: 18 testes locais passaram, incluindo fila de vários arquivos, limite do lote, preflight de todas as prévias antes da primeira gravação e execução sequencial que ignora erros de leitura. Testes de fila usam controladores simulados; lote real e gravações continuam pendentes de validação no site. O lote inteiro não é atômico.
