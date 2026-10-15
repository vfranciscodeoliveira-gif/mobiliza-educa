# QR Educação 360 — Kit de campo sem internet

Protótipo operacional para uma **blitz educativa** com computador/notebook, roteador Wi-Fi local e celulares dos participantes. O servidor é Node.js 20+ e não exige Firebase, plano pago, CDN, internet ou cadastro dos participantes durante a atividade.

## Preparação na SEMOB (com internet, antes de sair)
1. Baixe o repositório GitHub como ZIP, extraia e abra a pasta `qr-educacao/offline`.
2. Coloque os **materiais oficiais autorizados** em `actions/<codigo>/assets/`, por exemplo `cartilha.pdf`. Não inclua cadastros, planilhas, imagens privadas ou dados pessoais.
3. Edite `actions/<codigo>/manifest.json`. Cada material precisa de `id`, `title`, `type` e `path` relativo do tipo `assets/cartilha.pdf`. O `actionId` deve ser igual ao nome da pasta.
4. Conecte o notebook e os celulares ao **mesmo roteador Wi-Fi**, sem precisar de internet. Use uma rede WPA2/WPA3 com senha definida pela equipe.
5. Inicie o servidor no notebook:
   ```powershell
   $env:HOST="0.0.0.0"
   $env:PORT="8080"
   $env:ADMIN_TOKEN="defina-um-segredo-forte-para-relatorios"
   node server.mjs
   ```
6. Descubra o IP do notebook com `ipconfig` (ex.: `192.168.1.50`). **Não use localhost ou 127.0.0.1 no QR Code distribuído ao público.**
7. Abra `http://192.168.1.50:8080/placa?acao=blitz-capacete-demo` e imprima a placa A4. O QR é desenhado localmente (não usa serviço externo). Distribua também o nome/senha da rede por cartaz separado.
8. No celular de teste, desligue dados móveis, conecte ao Wi-Fi local e abra o QR. Teste todos os materiais **antes** da blitz.

## Durante a blitz
- A equipe pode imprimir um QR por ação ou atividade. Se houver múltiplas ações, crie pastas e manifestos diferentes.
- A página apresenta os arquivos locais e registra `page_view` e `material_open`, sem nome, CPF, placa ou telefone.
- Os arquivos só são servidos se estiverem presentes no manifesto da ação.
- O dispositivo deve permitir conexões TCP de entrada na porta 8080; ajuste o firewall do Windows para a rede privada confiável.
- Navegadores podem mostrar aviso de HTTP porque o kit usa LAN sem certificado; **não inserir senhas nem dados pessoais no portal do participante**.
- Não exponha a porta 8080 do roteador à internet pública.

## Depois da blitz
- Interações ficam no notebook em `data/events.ndjson`. Copie e preserve essa pasta em backup protegido.
- Estatísticas locais podem ser consultadas pelo responsável em `/admin/stats` com cabeçalho `X-Admin-Token`. Nunca compartilhe o segredo no cartaz.
- **Acessos não significam pessoas únicas nem atendimentos efetivamente realizados.** Reabertura da página pode gerar acessos adicionais.
- Este kit **não sincroniza** dados automaticamente com o Firebase: exportação e consolidação controlada serão implementadas separadamente. Não prometa relatórios online instantâneos.
- Os materiais do exemplo são fictícios para homologação, não uma peça oficial aprovada da SEMOB.

## Testes
Na raiz do repositório, execute `node --test tests/qrOffline.test.mjs` para validar o servidor, as rotas de materiais, o cartaz e a proteção das estatísticas.

## Atenção à página QR online
O módulo online do Mobiliza Educa usa `qr-educacao.html?acao=...` no GitHub Pages e lê publicações no Firestore. O modo offline usa uma URL **diferente**, com o IP local do notebook. Para uso em campo são necessários Wi-Fi e QR locais próprios — um QR online não se transforma automaticamente em offline.
