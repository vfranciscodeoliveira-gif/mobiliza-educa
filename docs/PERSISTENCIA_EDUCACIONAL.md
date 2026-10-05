# Persistência educacional — primeira etapa

Os seis cadastros básicos usam `tenants/{tenantId}` (a estrutura existente do backend), por meio de `educationRepository.js`. A organização vem da sessão Cloud, sem fallback para uma organização fixa. Os registros locais antigos são preservados, mas não são importados automaticamente para evitar vincular dados de outro workspace. A importação CSV grava cada registro no servidor e informa eventual erro; uma falha pode deixar os registros anteriores da importação já gravados.

## Ativação

1. Publicar `firestore.rules` no projeto Firebase `mobiliza-educa`, por exemplo com `firebase deploy --only firestore:rules --project mobiliza-educa`.
2. Garantir que o usuário possua `platformOwners/{uid}.active=true` ou associação ativa em `tenants/{tenantId}/members/{uid}`, e que as memberships apontem para a mesma organização.
3. Publicar os arquivos Web atualizados. Conectar Firestore no painel e abrir Pessoas e instituições.
4. Importar dados legados apenas após confirmar sua organização de origem.

O servidor permite escrita ao proprietário e aos perfis GESTOR/OPERADOR; demais membros têm leitura. Exclusão é lógica. Criação/alteração têm usuário e horário do servidor. Usuários e associações continuam sendo provisionados pelo backend existente; esta alteração não implementa novos fluxos de provisionamento.

## Validação necessária antes de produção

Cadastrar e editar uma escola, recarregar, conectar a mesma organização em outro navegador e conferir o registro. Repetir com turma e aluno. Conferir que uma conta de outra organização não lê nem grava esses documentos e que Consulta não escreve. Testar indisponibilidade de rede: o formulário deve permanecer aberto e não confirmar sucesso. Conferir exclusão lógica e bloqueio dos vínculos conhecidos. Esses vínculos ainda são verificados pela interface, portanto não constituem garantia transacional contra alterações concorrentes.

Agenda, solicitações, inscrições, certificados e relatórios ainda têm rotas locais ou sua integração anterior. Nenhum desses módulos está declarado migrado por esta etapa. As outras telas usam os cadastros carregados em memória; entrar diretamente em um relatório sem carregar cadastros ainda exige integração adicional. Não há listener em tempo real: reabrir Cadastros consulta novamente o servidor.

Verificação local: `node --test tests/education-repository.test.mjs`; sintaxe dos módulos e `git diff --check`. Regras não foram executadas em Emulator nem publicadas por esta alteração. Testes locais cobrem bloqueio sem autenticação e cache vazio separado por organização, não provam isolamento no servidor.
