# Agendamentos de escolas e demanda espontânea

Na Gestão → Agenda, solicitações e inscrições, a nova central online abre tanto para o proprietário quanto para usuários com Consultar agenda e acesso a todas as escolas do cliente. Gerenciar agenda permite cadastrar e editar; consulta não permite gravação. O seletor Cliente da Gestão determina a organização dos registros.

## Ativar

Publique o arquivo completo `firestore.rules` atualizado no Console Firebase → Firestore Database → Regras. Esta etapa é separada do GitHub Pages; não foi implantada automaticamente. A coleção privada `tenants/{cliente}/appointments` não possui acesso anônimo. As regras liberam a consulta dos nomes de escolas e turmas para a agenda, sem liberar alunos a usuários que só possuem agenda.

## Operação

- Atendimento de escola: atividade, escola e até cinco turmas da escola, contato, período, local, responsável, público, quantidades previstas e realizadas, capacidade, equipe, materiais e observações.
- Demanda espontânea: pessoa, grupo ou organização solicitante e os mesmos campos operacionais; sem escola ou turmas. A demanda é registrada por usuário autorizado. Não foi criado formulário público anônimo.
- Status: Solicitado, Planejado, Confirmado, Em andamento, Concluído e Cancelado. Edite o status para confirmar, concluir ou cancelar. Não existe exclusão definitiva pela interface.
- Lista com busca e filtros por origem, escola, status e período; calendário semanal e mensal; ficha e impressão da lista filtrada. Para PDF, use Salvar como PDF no diálogo de impressão do navegador.
- Recorrência semanal, mensal ou anual até uma data limite; máximo de 60 ocorrências por criação. Gravação de toda a série em um lote atômico. No fim do mês, usa o último dia válido, preservando o dia original nas próximas ocorrências. Ao editar, apenas aquela ocorrência muda.
- Sobreposição de horário com a mesma escola, local ou responsável produz aviso antes da gravação. Pode ser aceita pelo operador. A verificação consulta o servidor, mas não é um bloqueio transacional de recursos entre operadores simultâneos. Dois horários consecutivos não geram conflito.
- Uma edição usa a versão do registro carregada; se outro usuário já alterou, precisa atualizar antes de tentar novamente. Falhas mostram mensagem e mantêm o formulário.

O proprietário tem o botão Agenda anterior para consultar a operação local antiga, inclusive solicitações e inscrições. Não há migração automática desses registros. Os agendamentos privados novos não são publicados como eventos nem abrem inscrições públicas. Não há notificações ou encaminhamentos automáticos nesta etapa. Presença individual e certificados continuam no módulo de certificados por escola e turma; a quantidade realizada é um total informado pelo responsável.

## Validação

Testes de política cobrem datas, duração, capacidade, vínculo de turma, demanda espontânea, recorrência e sobreposição. Testes de interface em DOM cobrem gravação com mensagem, erro sem perder formulário, filtros de turma, calendário e navegação durante carregamento. Testes reais no Firebase Emulator cobrem criação, leitura, cancelamento, isolamento, lote de 60 ocorrências, proteção de metadados e edição concorrente do repositório. Os testes existentes de permissões também passaram. Não foram feitas gravações de teste no Firebase de produção.

Para repetir: em tests, execute npm install, npm run agenda e npm run rules.

## Carregamento de escolas e turmas

A nova central e o formulário da agenda anterior consultam o catálogo no Firestore sem depender da visita prévia aos cadastros. Trocar a escola limpa a seleção e carrega as turmas daquela escola no servidor. A tela ignora respostas de seleções anteriores. Enquanto carrega, ou se falhar, o salvamento fica bloqueado; a falha tem mensagem e botão Tentar novamente. As respostas também são descartadas se o cliente ou módulo mudar durante a consulta.
