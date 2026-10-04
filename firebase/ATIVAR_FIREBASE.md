# Desenvolvimento local sem Blaze

Enquanto o projeto permanecer no plano Spark, use o Firebase Emulator Suite para testar o backend SaaS sem publicar Cloud Functions.

Portas configuradas:

- Emulator UI: http://127.0.0.1:4000
- Authentication: http://127.0.0.1:9099
- Firestore: http://127.0.0.1:8080
- Functions: http://127.0.0.1:5001

Na raiz do repositório:

~~~powershell
powershell -ExecutionPolicy Bypass -File .\firebase\emulator-start.ps1
~~~

Mantenha essa janela aberta. Em uma segunda janela:

~~~powershell
powershell -ExecutionPolicy Bypass -File .\firebase\emulator-smoke-test.ps1
~~~

Depois, para testar Authentication + tenant + membership + assinatura + proprietário:

~~~powershell
powershell -ExecutionPolicy Bypass -File .\firebase\emulator-bootstrap-owner.ps1
~~~

Esses scripts usam apenas os emuladores locais. A chave de bootstrap local é gerada em arquivos ignorados pelo Git.

---

# Mobiliza Educa — Backend Firebase SaaS

A partir da versão **0.48.0**, o backend do Mobiliza Educa usa Firebase Authentication, Cloud Firestore multitenant, Cloud Functions, Firebase Cloud Messaging e Cloud Storage opcional. Planos, tenants e assinaturas são validados no servidor.

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

O navegador nunca decide sozinho a qual cliente o usuário pertence. O backend valida o Firebase ID token e a membership do usuário antes de acessar um tenant.

## 1. Preparação sem faturamento de Functions

Na raiz do repositório:

```powershell
powershell -ExecutionPolicy Bypass -File .\firebase\setup-mobiliza.ps1 -ProjectId mobiliza-educa
```

No Windows, os scripts usam explicitamente `npm.cmd` e `firebase.cmd`, evitando bloqueios de `npm.ps1` pela Execution Policy.

Esse primeiro script apenas:

1. valida Node/npm/Firebase CLI;
2. autentica no Firebase;
3. grava `.firebaserc` local;
4. instala dependências;
5. valida sintaxe e carregamento do backend;
6. publica regras e índices do Firestore.

Ele **não publica Cloud Functions e não cria segredo**.

## 2. Authentication e App Web

No Console Firebase habilite **Authentication > Email/Password** e crie o primeiro usuário proprietário.

Crie também o App Web do Mobiliza Educa em **Configurações do projeto > Geral > Seus apps > Web**.

## 3. Cloud Functions

Cloud Functions pode exigir plano Blaze/faturamento habilitado. O projeto não altera o plano automaticamente.

Somente depois de decidir conscientemente pelo faturamento, execute:

```powershell
powershell -ExecutionPolicy Bypass -File .\firebase\deploy-functions.ps1 -ProjectId mobiliza-educa
```

O script interrompe imediatamente se qualquer comando externo retornar erro. Portanto, a mensagem **CLOUD FUNCTIONS PUBLICADAS** só aparece após um deploy realmente concluído.

Esse script:

1. reinstala dependências a partir do `package-lock.json`;
2. valida o backend;
3. cria ou reutiliza uma chave de bootstrap local;
4. salva essa chave em `firebase/bootstrap-key.local.txt`, ignorado pelo Git;
5. envia a chave como Secret `PLATFORM_BOOTSTRAP_KEY`;
6. publica as Cloud Functions.

O valor da chave não é exibido na tela e não deve ser colocado no GitHub.

## 4. Configuração Web

Execute:

```powershell
powershell -ExecutionPolicy Bypass -File .\firebase\configurar-web-push.ps1
```

Informe o `firebaseConfig` do App Web. A VAPID key pode ficar em branco nesta primeira etapa.

O script atualiza `js/cloudConfig.js` e grava `firebase/web-config.local.json`, que é ignorado pelo Git.

## 5. Bootstrap do proprietário

Execute:

```powershell
powershell -ExecutionPolicy Bypass -File .\firebase\bootstrap-owner.ps1
```

O script lê automaticamente a chave de `firebase/bootstrap-key.local.txt` quando o arquivo existe, sem mostrá-la.

Ele autentica o primeiro usuário, cria o tenant proprietário, membership Gestor, assinatura Institucional, registro de proprietário e tenant público padrão.

## 6. Publicar configuração Web

Depois do bootstrap, faça commit apenas de `js/cloudConfig.js`.

Não versione:

- `.firebaserc`;
- `firebase/web-config.local.json`;
- `firebase/bootstrap-key.local.txt`;
- chaves de conta de serviço;
- outros segredos.

## 7. Login no Mobiliza Educa

Com a configuração publicada:

1. abra o Mobiliza Educa;
2. faça o login administrativo local;
3. na Central de Notificações, clique **Conectar Firebase**;
4. autentique com Firebase Authentication;
5. selecione a organização;
6. clique **Sincronizar**.

As operações administrativas online usam `Authorization: Bearer <Firebase ID token>`.

## Segurança

- Firestore direto com leitura restrita por membership;
- escritas de negócio pelas Cloud Functions;
- tenant validado no servidor;
- plano/assinatura validados no servidor;
- dados isolados por tenant;
- proprietário da plataforma separado dos membros;
- trilha de auditoria por tenant;
- segredo de bootstrap fora do Git.

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
