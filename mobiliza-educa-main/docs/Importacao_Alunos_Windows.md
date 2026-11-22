# Importar alunos do Windows — Mobiliza Educa 0.63.4

O arquivo Alunos_Windows_06102026.json foi extraído do backup de 06/10/2026 fornecido nesta conversa. Contém 1.487 alunos ativos com vínculo consistente a turma e escola. Os 83 participantes sem esse vínculo ou de outro tipo não foram incluídos.

1. Extraia este ZIP em seu computador.
2. Atualize o site com Ctrl + F5 e confirme versão 0.63.4 no administrador.
3. Abra Pessoas e instituições e clique em Alunos do Windows.
4. Selecione ou arraste Alunos_Windows_06102026.json. Este arquivo é específico de alunos; o JSON anterior da agenda não contém seus nomes.
5. Confira as escolas e turmas correspondentes. As escolas e turmas importadas são reconhecidas pela origem mesmo que tenham sido renomeadas. Se a turma não existir no site, importe-a antes de continuar.
6. Confira nomes iguais na mesma turma: escolha Preservar existente ou Criar aluno distinto quando forem pessoas diferentes. Sem essa escolha, o aluno fica pendente.
7. Clique Selecionar alunos válidos e ativos, depois Importar alunos selecionados. A gravação é feita por aluno, com progresso e mensagem final. Em caso de falha, os já salvos permanecem; reabra o arquivo para conferir e continuar.
8. Feche a importação e abra Alunos para conferir. Os alunos ficam disponíveis nas turmas para emissão dos certificados.

Data de nascimento e responsável não estão presentes no cadastro de origem e ficam em branco. Idade, sexo, telefone, observação, situação e registro de origem são preservados quando existentes. Os dados do site não são sobrescritos. Escolher preservar um aluno existente mantém seu cadastro; não anexa nem substitui seus dados.

O pacote não emite certificados automaticamente, não migra PDFs antigos nem marca presença. Os alunos não são publicados no histórico da agenda ou no GitHub; a gravação usa o cadastro privado de alunos do cliente selecionado.

Para exportar novamente do Windows: no SQL Server Management Studio, selecione o banco correto e execute Exportar_Alunos_Windows.sql (somente leitura). Salve o XML completo como .xml e importe pelo mesmo botão. O exportador foi preparado a partir do esquema do backup; não foi executado nesta sessão em um servidor SQL Server.
