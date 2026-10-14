# Implantação das Cloud Functions via GitHub OIDC — Mobiliza Educa

A autenticação foi atualizada para **Workload Identity Federation**, sem arquivo JSON de chave privada e sem necessidade de instalar Node.js no computador.

## Identidade federada
- Projeto Firebase: `mobiliza-educa`
- Número do projeto: `39731938550`
- Pool: `mobiliza-github`
- Provedor OIDC: `github-actions`
- Conta de serviço: `mobiliza-educa-github-deploy@mobiliza-educa.iam.gserviceaccount.com`
- Provedor completo: `projects/39731938550/locations/global/workloadIdentityPools/mobiliza-github/providers/github-actions`

O provedor deve restringir a emissão a `assertion.repository == 'vfranciscodeoliveira-gif/mobiliza-educa' && assertion.ref == 'refs/heads/main'`. Recomenda-se reforçar também com `repository_id` numérico e `repository_owner_id` após confirmados os IDs.

## Permissões necessárias antes de implantar
A política `roles/iam.workloadIdentityUser` permite à identidade federada assumir a conta, mas **não concede por si só acesso de implantação**.

Configure privilégios adequados para Cloud Functions v2, Cloud Run/Artifact Registry, Cloud Build e leitura da conta de runtime. As atribuições devem ser feitas com o menor privilégio possível e verificadas na documentação do projeto; nunca atribuir Proprietário ou Editor por conveniência. As permissões para agir como conta de serviço de runtime devem ser concedidas somente na conta específica.

Conferir faturamento, APIs habilitadas, cota de implantação e cobranças antes de iniciar qualquer deploy.

## Workflow
O arquivo `.github/workflows/deploy-firebase-functions-manual.yml` requer:
1. Branch `main`, pois o provedor OIDC não autentica outras branches.
2. Ambiente GitHub `firebase-production` com revisores aprovadores e branch `main` permitida.
3. Acionamento manual em Actions: confirmação textual `mobiliza-educa` e confirmação booleana de implantação.
4. Revisão da versão de Firebase CLI, dependências e das funções existentes antes de executar.

**Não criar o antigo secret `FIREBASE_SERVICE_ACCOUNT_MOBILIZA_EDUCA`**. O fluxo usa credenciais efêmeras de OIDC.

## Verificação após implantação
- Verificar endpoints `submitSolicitacao`, `submitInscricao`, `publicEvents` e `consultarProtocolo`.
- Validar `publicTenants/mobiliza-educa` e as configurações de assinatura/recursos correspondentes.
- Fazer teste autorizado de solicitação e consulta de protocolo; verificar registro administrativo e evitar dados pessoais reais nos logs de CI.
- Configurar proteção antiabuso e monitorar orçamento antes de grande uso público.
- Publicar frontend em GitHub Pages separadamente após verificar a API.

**Estado: apenas automação preparada, sem implantação realizada.**
