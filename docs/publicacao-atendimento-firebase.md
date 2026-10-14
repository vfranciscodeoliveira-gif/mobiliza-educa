# Publicação sem instalar Node.js no computador

O PR #34 corrige o **frontend**, mas o envio só funciona quando as Cloud Functions estiverem implantadas.

## Pré-requisitos da implantação
1. Ativar faturamento/projeto Firebase compatível com Cloud Functions v2 e conferir limites de custo.
2. Criar credencial de serviço de implantação com permissões mínimas necessárias, sem enviá-la ao chat ou versioná-la no Git.
3. Cadastrar seu JSON como **GitHub Actions secret** `FIREBASE_SERVICE_ACCOUNT_MOBILIZA_EDUCA`. Avaliar como alternativa recomendada a autenticação por Workload Identity Federation antes de produção.
4. Criar ambiente GitHub `firebase-production` com revisores obrigatórios.
5. Confirmar que existem `publicTenants/mobiliza-educa`, a assinatura do tenant e as funcionalidades públicas ativas.
6. Verificar que `firebase/functions/package-lock.json` existe e é compatível com `npm ci`.

## Fluxo de implantação
Após incorporar a branch à main, no GitHub vá em **Actions → Implantar Cloud Functions - Mobiliza Educa → Run workflow**. Digite o identificador de projeto e marque a confirmação. O workflow só executa se ambos estiverem corretos. **Não há implantação automática a cada push**.

Depois confira os endpoints `submitSolicitacao`, `submitInscricao`, `publicEvents`, `consultarProtocolo` e teste com solicitação de homologação autorizada, validando o protocolo na gestão e o status. O frontend também precisa ser publicado na main (GitHub Pages).

Não afrouxar `firestore.rules` para escrita anônima de pedidos. Ativar proteção contra abusos e monitoramento de custos antes de uso público em larga escala.
