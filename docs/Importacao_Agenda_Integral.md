# Importação integral da agenda do Windows — versão 0.63.0

## Antes de importar

No Firebase Console, abra o projeto mobiliza-educa → Firestore Database → Regras.
Substitua o conteúdo pelo arquivo firestore.rules completo desta versão e clique em Publicar.
Não acrescente as novas regras às antigas: use o arquivo completo. A publicação no GitHub não publica regras no Firebase.

## Importar o arquivo fornecido

1. Extraia o ZIP Agenda_Integral_Web_0630.zip.
2. Abra o administrador do site e confirme a versão 0.63.0 no cabeçalho. Atualize com Ctrl+F5 se necessário.
3. Abra Agenda, solicitações e inscrições → Importar do Windows.
4. Selecione ou arraste Agenda_Integral_06102026.json. Não arraste o ZIP nem o backup SQL.
5. Confira cada escola de origem e selecione sua escola correspondente no site. Os agendamentos escolares exigem essa associação.
6. Marque os registros desejados. A seleção automática inclui somente registros válidos e ativos; cancelados ativos também são incluídos. Você pode desmarcar qualquer registro.
7. Se houver sobreposição de horários, confira os registros e marque o aceite somente se estiver correto.
8. Clique em Importar selecionados e aguarde a mensagem com as quantidades importadas, existentes e falhas.
9. Feche a importação para atualizar a agenda. Use os filtros de escola, período e status.
10. Abra Histórico Windows para consultar o arquivo integral, os status originais, checklist, alarmes e turmas dos programas. A ficha de cada agendamento também oferece Original Windows.

## O que é preservado

Os agendamentos selecionados ficam na agenda online, com Reagendado e Em preparação disponíveis como status próprios. O arquivo integral inteiro fica no histórico privado do cliente, incluindo os registros não selecionados para a agenda.

O pacote de 06/10/2026 contém 83 agendamentos, 13 eventos, 36 escolas, 64 turmas, 69 vínculos de eventos/turmas, 65 controles operacionais, 996 itens de checklist, 326 alarmes, 246 registros de fila e 3 encerramentos. O Agente de Trânsito Mirim possui 64 vínculos de turmas. Também há os totais de participantes por turma usados pelo painel do Windows; este pacote não importa cadastros de alunos.

Turmas vinculadas a um programa e turmas específicas de um agendamento são relações distintas. O histórico mantém os vínculos originais do programa. Não escolhe turmas atuais do site por semelhança de nome nem cria associações inexistentes no banco. Os cadastros atuais de escola/turma/aluno e o módulo de certificados continuam sendo operados pelos seus próprios cadastros.

O status salvo de cada turma aparece junto com sua situação calculada a partir da fila, seguindo a lógica do painel do Windows. Início e término não são inventados quando faltam datas na origem. O status do agendamento é mantido separadamente.

Checklist e alarmes são preservados para consulta. Os alarmes históricos não disparam notificações e o checklist histórico não é editável.

## Reimportação e falhas

Os IDs da agenda são derivados do banco de origem e do ID original. Reimportar não cria agendas duplicadas e não sobrescreve os dados que você editou no site. Em registros importados pela versão anterior, é anexado o histórico quando ainda não existe; o status atual do site é mantido. Consulte o original e edite o status atual, se necessário.

Se a conexão cair, reabra e importe o mesmo arquivo. As partes do histórico já salvas são reaproveitadas. O histórico só aparece na lista quando todas as partes foram salvas. Agendamentos já gravados são preservados. A mensagem informa a primeira falha e os restantes não processados.

Se aparecer permission-denied, confira a publicação do arquivo completo de regras no Firebase e se o usuário possui events.manage e acesso a todas as escolas do cliente. Consultar o histórico exige events.read e acesso a todas as escolas.

## Exportar novamente do Windows

O arquivo JSON fornecido foi extraído do backup SQL de 06/10/2026. Para trazer alterações posteriores, execute Exportar_Agenda_Integral.sql no SQL Server Management Studio, conectado ao banco correto. O script é somente leitura e usa FOR XML, compatível com SQL Server 2012 ou superior. Abra o resultado XML e salve seu conteúdo completo em um arquivo .xml; esse arquivo também pode ser importado no site. O script não foi executado em um SQL Server nesta sessão.

A reimportação preserva alterações do site; ela não atualiza automaticamente agendamentos existentes com mudanças posteriores feitas no Windows. Novas extrações ficam disponíveis como novos históricos quando seu conteúdo muda.
