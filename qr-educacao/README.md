# QR Educação 360 — arquitetura da fundação

## Objetivo
Distribuir materiais digitais de eventos/ações educativas do Mobiliza Educa por QR Code, via internet pública ou rede Wi-Fi local sem internet.

## Integrações
- Referenciar **IDs existentes** de eventos e ações, sem duplicar cadastro.
- Vincular materiais digitais aos eventos, preservando biblioteca já existente.
- Referenciar quizzes já cadastrados, com cache de perguntas publicáveis no pacote offline.
- Consolidar métricas com origem online/offline, sem contar repetição de sincronização como novo atendimento.

## Contrato do pacote da ação
Cada pacote exportado contém um arquivo `manifest.json` no formato descrito em `schema/manifest.example.json` e arquivos dentro de `assets/`. Não incluir informações pessoais dos inscritos.
- `actionId` é o ID canônico do evento/ação.
- `revision` é número monotônico da publicação, imutável para uma revisão entregue.
- `materials[].path` é caminho relativo a assets, nunca URL externa no modo offline.
- `quiz` poderá ser incluído em etapa posterior mediante adaptação ao formato real do jogo do projeto.

## QR Code: dois ambientes
- **Online:** QR para a rota web pública `/qr/:actionId` (a integrar ao roteador atual).
- **Local:** conectar à rede Wi-Fi da blitz e abrir `http://192.168.4.1:8080/a/:actionId` (IP ilustrativo; configurar conforme equipamento).
- O QR Code Wi-Fi usa o padrão `WIFI:T:WPA;S:NOME_DA_REDE;P:SENHA;;`.
- Para participantes alternarem entre redes, usar placa com **dois QR Codes**, online e rede Wi-Fi, mais endereço local legível. Redirecionamento automático entre celular com internet e rede isolada não é garantido.

## Eventos de telemetria
Envelope: `{eventId,actionId,revision,type,createdAt,sessionId,materialId?,quizId?,score?,source}`.
- `eventId` UUID único, usado para deduplicação no servidor central.
- `source`: `online` ou `offline`.
- Nunca armazenar nome, CPF, placa, IP ou geolocalização do participante por padrão.
- Acessos e downloads são **interações**, não pessoas únicas nem atendimentos confirmados.
- Dados offline devem permanecer em fila até confirmação da sincronização; o servidor de campo não possui credenciais administrativas do Firebase.

## Segurança e operação
- Administrador exporta pacote público assinado/autorizado para mídia local; equipamento offline deve receber somente material já aprovado.
- Nunca transmitir segredos Firebase Admin ou chaves privadas no pacote.
- O servidor local disponível na LAN não deve expor arquivos fora do diretório autorizado.
- HTTPS não é automático numa rede offline. O protótipo usa HTTP local; navegadores podem tratar certos recursos como contexto inseguro. Não solicitar login ou dados sensíveis nesse portal.
- Sincronização: endpoint autenticado do backend central, idempotente por `eventId`; só então marcar registros locais como enviados. **Não implementada nesta fundação**.

## Próximas integrações ao projeto existente
1. Mapear as rotas/componentes reais de eventos, biblioteca, jogos e relatórios.
2. Implementar painel gestor de publicação com permissão por escola/organização.
3. Gerar QR Codes, PDFs imprimíveis e exportação de pacote.
4. Criar endpoint autenticado de importação idempotente das métricas.
5. Rodar teste real com dispositivos iPhone/Android e roteador sem WAN.

## Execução local do protótipo
Requer Node.js 18+.
```
cd qr-educacao/offline-server
node server.mjs
```
Abra `http://localhost:8080/a/blitz-capacete-demo`. Para smartphones conectados à mesma rede, substitua localhost pelo IP LAN do notebook/servidor. Ajuste firewall e roteador, sem expor a porta à internet.
