# Mobiliza Educa — Backend Firebase SaaS

A partir da versão **0.48.0**, o backend do Mobiliza Educa deixa de usar uma chave única de gestor e passa a usar:

- Firebase Authentication;
- Cloud Firestore multitenant;
- Cloud Functions;
- Firebase Cloud Messaging;
- Cloud Storage opcional para evidências;
- planos e assinaturas validados no servidor.

## Arquitetura

```text
GitHub Pages / PWA
        |
        | HTTPS + Firebase ID token
        v
Cloud Functions
        |
        +-- tenants/{tenantId}
        |     +-- members/{uid}
        |     +-- requests/
        |     +-- registrations/
        |     +-- publicEvents/
        |     +-- certificates/
        |     +-- auditLogs/
        |     +-- pushDevices/
        |
        +-- subscriptions/{tenantId}
        +-- plans/{planId}
        +-- memberships/{uid|tenant}
        +-- platformOwners/{uid}
```

O navegador nunca decide sozinho a qual cliente o usuário pertence. O backend valida o **Firebase ID token** e a membership do usuário antes de acessar um tenant.

## 1. Criar o projeto Firebase

Crie um projeto exclusivo para o Mobiliza Educa no Console Firebase.

Exemplo de Project ID:

`mobiliza-educa`

### Firestore

Crie o **Cloud Firestore** em modo Produção.

Use uma localização compatível com a região escolhida para as Functions. O projeto está preparado para Functions em:

`southamerica-east1`

### Authentication

Abra:

**Authentication > Sign-in method**

Habilite:

**Email/Password**

Depois abra:

**Authentication > Users**

e crie manualmente o primeiro usuário proprietário.

Use um e-mail seu e uma senha forte. Esse usuário ainda não será proprietário da plataforma até executarmos o bootstrap.

## 2. Preparar e publicar o backend

Na raiz do repositório, abra PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File .\firebase\setup-mobiliza.ps1
```

O assistente:

1. confere Node/npm;
2. instala Firebase CLI se necessário;
3. faz login no Firebase;
4. grava `.firebaserc` local;
5. instala dependências;
6. gera `PLATFORM_BOOTSTRAP_KEY`;
7. publica regras/índices do Firestore;
8. publica Cloud Functions.

Guarde a chave de bootstrap exibida.

**Não coloque essa chave no GitHub.**

### Observação sobre faturamento

O Firebase pode exigir uma conta de faturamento habilitada para publicar Cloud Functions. Isso não significa contratar um servidor dedicado ou SQL Server. O custo passa a ser baseado em uso.

Nesta primeira fase, **Cloud Storage pode ficar desativado**. Ele será necessário quando migrarmos fotos/documentos de evidências.

## 3. Criar o App Web Firebase

No Console Firebase:

**Configurações do projeto > Geral > Seus apps > Web**

Crie o App Web do Mobiliza Educa.

Copie:

- apiKey;
- authDomain;
- projectId;
- storageBucket;
- messagingSenderId;
- appId.

Se já quiser push, gere também a VAPID key em:

**Cloud Messaging > Certificados de push da Web**

Execute:

```powershell
powershell -ExecutionPolicy Bypass -File .\firebase\configurar-web-push.ps1
```

Esse script atualiza:

`js/cloudConfig.js`

e cria um auxiliar local ignorado pelo Git:

`firebase/web-config.local.json`

## 4. Transformar o primeiro usuário em proprietário

Execute:

```powershell
powershell -ExecutionPolicy Bypass -File .\firebase\bootstrap-owner.ps1
```

Informe:

- e-mail do usuário criado no Firebase Authentication;
- senha;
- chave de bootstrap;
- nome da organização, se solicitado.

O script:

1. autentica o usuário diretamente no Firebase Authentication;
2. obtém um ID token;
3. chama `bootstrapPlatformOwner`;
4. cria o primeiro tenant;
5. cria membership Gestor;
6. cria assinatura Institucional;
7. registra o usuário como proprietário da plataforma;
8. define esse tenant como organização pública padrão;
9. grava o slug em `js/cloudConfig.js`.

O bootstrap só funciona enquanto ainda não existir proprietário cadastrado.

## 5. Publicar a configuração Web

Depois do bootstrap, faça commit de:

`js/cloudConfig.js`

Os valores do Firebase Web Config não são senhas privadas.

Não versione:

- `.firebaserc`;
- `firebase/web-config.local.json`;
- chaves de conta de serviço;
- a chave de bootstrap.

## 6. Login no Mobiliza Educa

Com a configuração publicada:

1. abra o Mobiliza Educa;
2. faça o login administrativo local;
3. na Central de Notificações, clique **Conectar Firebase**;
4. informe o usuário do Firebase Authentication;
5. selecione a organização;
6. clique **Sincronizar**.

As operações administrativas online passam a enviar:

`Authorization: Bearer <Firebase ID token>`

A antiga `GESTOR_PUSH_KEY` não é mais utilizada pelo PWA.

## 7. Teste multitenant recomendado

Como proprietário:

1. crie um segundo tenant pelo Console do Proprietário;
2. associe um usuário ao tenant quando implementarmos convites/memberships;
3. confirme que o usuário do tenant A não lê dados do tenant B;
4. envie solicitação pública;
5. confirme armazenamento em:
   `tenants/{tenantId}/requests`;
6. sincronize no PWA;
7. altere o status;
8. consulte o protocolo publicamente.

## Segurança adotada

- Firestore direto é leitura restrita por membership.
- Escritas de negócio são feitas pelas Cloud Functions.
- O tenant é validado no servidor.
- Plano/assinatura são validados no servidor.
- Certificados, solicitações, inscrições e push são isolados por tenant.
- O proprietário da plataforma é separado dos membros comuns.
- O backend mantém trilha de auditoria por tenant.

## Próximas fases

1. convites e memberships pela nuvem;
2. migração dos usuários locais para Firebase Auth;
3. migração dos dados locais para Firestore;
4. Storage para evidências;
5. cobrança real via Mercado Pago/Stripe;
6. webhook de pagamento;
7. trial automático e suspensão;
8. limites de uso autoritativos por plano;
9. custom domains e white-label.
