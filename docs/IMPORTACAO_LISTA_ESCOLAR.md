# Importar lista escolar PDF

Em Pessoas e instituições, clique em **Lista da escola (PDF)**. Envie um PDF de até 10 MB / 50 páginas com texto selecionável e cabeçalhos no modelo SED: Escola, Ano Letivo, Turma, Ativos, Cadastrados e tabela com série, número, nome, RA, dígito, UF, nascimento e situação.

O parser reconhece turmas e turnos, recompõe nomes quebrados em linhas e confronta os totais com os cabeçalhos. PDFs escaneados ou outros modelos não são aceitos automaticamente. Cada arquivo deve conter uma escola. O processamento é no navegador, usando PDF.js carregado do CDN; o PDF não é enviado ao Firestore.

Escolha a escola de destino ou **Criar escola com o nome do PDF**. Não há seleção automática da primeira escola. Se o nome selecionado diferir do PDF, a interface pede confirmação. Confira todos os nomes na prévia e marque a revisão para habilitar o fluxo de gravação.

São importados apenas alunos ATIVO. RA/dígito/UF identificam duplicados. Data de nascimento é opcional, desmarcada por padrão. Informações de deficiência não são importadas. As turmas armazenam ano/série e ano letivo, com vínculo à escola. As mesmas regras Firestore dos seis cadastros já publicadas são suficientes.

Cada registro é confirmado no servidor. A operação completa não é atômica: interrupções podem deixar escola, turmas e parte dos alunos gravados. Repetir a importação ignora os registros existentes. IDs derivados da escola/turma/RA limitam duplicação do mesmo arquivo em reenvios. Não se move automaticamente um aluno já encontrado pelo mesmo RA em outra turma; o resumo informa a contagem de conflitos para revisão manual. A detecção por RA consulta os dados carregados e ainda não impõe unicidade global por transação em importações simultâneas distintas.

Verificação: 8 testes locais passaram. A extração do PDF de referência foi executada com PDF.js e conferiu 4 turmas, 102 registros e 95 ativos; nomes em duas linhas foram recompostos. O Chromium não estava instalado no ambiente, portanto a interface completa não foi exercitada em navegador nem foram feitas gravações com esse arquivo em produção. Após publicação, validar a prévia, importação, repetição e leitura em outro computador com a conta Firebase da organização.
