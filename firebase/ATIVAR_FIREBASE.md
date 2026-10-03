# Mobiliza Educa — ativação Firebase, formulários públicos e push

Esta pasta deixa o **Atendimento Mobiliza Educa** pronto para funcionar entre dispositivos.

## O fluxo final

1. Escola, instituição ou pessoa acessa **Atendimento** no site.
2. Envia uma **solicitação** ou **inscrição**.
3. O backend grava no Firestore com status **Recebida** e gera protocolo.
4. O gestor recebe **push no celular** e a pendência aparece na área de Gestão.
5. O gestor analisa e altera o status.
6. O solicitante consulta o andamento usando protocolo + e-mail/telefone.
7. Somente **Agendada/Confirmada** representa atendimento ou vaga confirmada.

## Segurança adotada

- O navegador público **não acessa o Firestore diretamente**.
- As regras do Firestore bloqueiam leitura/escrita direta.
- O formulário público fala apenas com Cloud Functions.
- A chave `GESTOR_PUSH_KEY` fica como **Firebase Secret**.
- O arquivo `js/cloudConfig.js` contém somente configuração pública Web/FCM.
- Nunca coloque no GitHub chave de conta de serviço ou `GESTOR_PUSH_KEY`.

## 1. Criar o projeto Firebase

No Console Firebase, crie um projeto **exclusivo para o Mobiliza Educa**.

Sugestão de Project ID:

`mobiliza-educa-pp`

Depois habilite:

- Firestore Database — modo Produção;
- Cloud Messaging;
- um app Web do Mobiliza Educa.

## 2. Executar o assistente de backend no Windows

Na raiz do repositório:

```powershell
powershell -ExecutionPolicy Bypass -File .\firebase\setup-mobiliza.ps1
```

O assistente:

- confere Node/npm;
- instala Firebase CLI se necessário;
- solicita login;
- grava `.firebaserc`;
- instala dependências;
- gera uma chave forte para o gestor;
- salva a chave como Firebase Secret;
- publica Cloud Functions e regras do Firestore.

Guarde a **CHAVE DO GESTOR** exibida no final. Ela não deve ser commitada.

## 3. Configurar app Web e Push

No Console Firebase:

**Configurações do projeto > Geral > Seus apps > Web**

Copie o objeto `firebaseConfig`.

Depois:

**Cloud Messaging > Certificados de push da Web**

Gere ou copie a **VAPID public key**.

Execute:

```powershell
powershell -ExecutionPolicy Bypass -File .\firebase\configurar-web-push.ps1
```

O script atualiza `js/cloudConfig.js` com os valores públicos.

## 4. Publicar

Faça commit do `js/cloudConfig.js` preenchido e aguarde o GitHub Pages.

No celular do gestor:

1. abra o Mobiliza Educa;
2. entre em **Gestão**;
3. na Central de Notificações, toque em **Chave de gestão**;
4. informe a chave gerada pelo assistente;
5. toque em **Ativar push**;
6. permita notificações no navegador/PWA.

## 5. Teste recomendado

Use outro celular ou uma janela anônima:

1. abra **Atendimento**;
2. envie uma solicitação;
3. confirme que aparece protocolo `SOL-...`;
4. confirme que o celular do gestor recebe o push;
5. entre na Gestão e sincronize;
6. altere o status para **Em análise**;
7. consulte o protocolo no aparelho do solicitante;
8. depois agende a solicitação e confirme que o status passa para **Agendada**.

Repita o teste com uma inscrição `INS-...`.

## Observação

O GitHub Pages hospeda o front-end. Firestore + Cloud Functions + FCM fazem o transporte seguro entre aparelhos e o push do gestor.
