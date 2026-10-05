# Usuários online por cliente e escola

## Ativação necessária

A interface é publicada pelo GitHub Pages. As regras do Firebase são uma implantação separada. Este ambiente não tem uma conta Firebase autorizada e não publica regras automaticamente. Antes de conceder contas a terceiros:

1. Abra o projeto `mobiliza-educa` no Console Firebase.
2. Em Firestore Database → Regras, substitua o conteúdo pelo arquivo `firestore.rules` desta atualização e clique em Publicar. As regras são completas; não acrescente um `allow read` genérico, pois permissões sobrepostas são combinadas por OR.
3. Preserve o documento existente `platformOwners/{UID_DO_ADMINISTRADOR}` com `active: true`. Esse documento é o que concede administração global, e não o perfil local do navegador.
4. Reabra a Gestão e entre com seu e-mail e senha Firebase.
5. Abra Usuários online e permissões. O administrador pode cadastrar um cliente online, criar uma conta Firebase ou preencher o UID de uma conta existente, escolher escolas e permissões e salvar o vínculo.

Alternativa de implantação no seu computador com Firebase CLI autorizado: `firebase deploy --only firestore:rules --project mobiliza-educa`. Esta atualização não altera os arquivos enviados como modelos de certificado.

Enquanto as regras não forem publicadas, o administrador existente mantém consulta e PDF; as novas gravações de vínculos e registros de emissão podem retornar permissão negada. A interface mostra aviso se uma emissão do proprietário não puder ser registrada. Usuários delegados precisam das regras publicadas para operar.

## Níveis de acesso

- Proprietário do sistema: documento ativo em `platformOwners`; acesso a todos os clientes.
- Equipe administrativa: `platformStaff/{uid}`, com permissões e clientes específicos ou todos os clientes atuais e futuros. Somente o proprietário concede este acesso global.
- Usuário do cliente: `tenants/{tenantId}/members/{uid}`, com todas as escolas ou escolas selecionadas. Perfil Gestor tem acesso completo dentro desse cliente, sem console global. Perfil personalizado usa as ações marcadas.

Contas e vínculos são diferentes: criar uma conta Firebase não concede acesso aos dados. O cadastro de conta usa uma instância secundária do Firebase Auth, sem desconectar o administrador; senhas não são armazenadas no Firestore. Uma conta existente deve ser vinculada pelo UID correto, consultável no Authentication. Não é possível alterar seu próprio vínculo pela interface; outro administrador deve realizar a mudança.

As permissões disponíveis são consultar, cadastrar/importar, editar e excluir cadastros; emitir certificados; gerenciar usuários; consultar/gerenciar agenda; e consultar relatórios. Os acessos de agenda e relatórios desta etapa exigem todas as escolas do cliente. A agenda online da equipe delegada usa registros do Firestore e permite criar ou editar nome, data, local e status; novos eventos são privados. O relatório delegado mostra totais de turmas e alunos por escola. Os módulos locais antigos permanecem restritos ao proprietário; não substituem os registros online.

O seletor Cliente na Gestão e nos certificados mostra apenas os clientes autorizados. Cadastros de alunos são consultados por turma e escola, sem carregar os dados de outras escolas no navegador. A escola autorizada também se aplica a professores. Instituições e contatos exigem acesso a todas as escolas do cliente. O cache de cadastros é separado por conta e cliente e limpo nas mudanças de sessão.

## Registros e limites

As emissões definitivas geram documentos imutáveis em `certificateIssues`, com código, usuário, aluno, turma, escola e data. O registro não guarda o PDF nem a arte enviada. O QR continua sendo de identificação, sem consulta pública de autenticidade. A prévia não registra uma emissão definitiva.

Vínculos e índices de descoberta são gravados atomicamente com dados iguais. O Firestore decide a autorização usando o vínculo atual, não o índice de descoberta nem permissões locais. Bloquear um vínculo impede novas operações naquele cliente. A revogação não apaga arquivos já baixados. O perfil global da equipe administrativa prevalece sobre os vínculos escolares nos clientes concedidos; reduza o perfil global quando quiser retirar esse acesso.

Cadastramento de clientes online nesta tela cria a organização básica. Assinaturas/cobrança e migração de agendas locais anteriores não são realizadas automaticamente. As permissões online não convertem os antigos usuários locais em contas Firebase.

## Validação

Testes de política e geração de PDFs, testes existentes e testes reais no Firebase Emulator verificam isolamento entre escolas/clientes, ausência de autoelevação, consulta sem edição, exclusão negada quando não concedida, vínculo/índice atômicos, emissão com vínculos válidos e agenda somente nos clientes concedidos. Fluxo completo de criação de conta e navegação no navegador publicado ainda precisa de validação.

Para executar os testes de regras: instale as dependências em `tests` (`npm install`) e rode `npm run rules`. Os testes de regras são ignorados na execução comum sem Firestore Emulator.
