# Arquitetura — Mobiliza Educa

## Camadas previstas

### 1. Experiência pública
Interface web/PWA para estudantes, famílias, educadores e comunidade.

### 2. Motor educacional
Jogos, desafios, microaprendizagem, avaliações, missões e progressão.

### 3. Operação de eventos
Agenda, evento ativo, participantes, presença, equipe, materiais, evidências e telão.

### 4. Conteúdo pedagógico
Banco de questões, categorias, dificuldade, faixa etária, revisão, homologação e versão.

### 5. Resultados
Pontuação, progresso, pré/pós-teste, indicadores, certificados, passaporte e relatórios.

### 6. Sincronização opcional
A plataforma deve continuar oferecendo recursos locais/offline. Recursos multiusuário e institucionais poderão usar backend separado.

## Modos de uso
- Individual
- Sala de aula
- Evento
- Telão
- Plateia interativa
- Administração/gestão

## Internacionalização
Separar:
1. núcleo pedagógico universal;
2. idioma;
3. legislação;
4. sinalização;
5. banco de questões;
6. regras específicas de cada país/jurisdição.

## Privacidade
A versão inicial mantém resultados no dispositivo. Contas e sincronização futuras devem ser opcionais e usar minimização de dados, consentimento e perfis de acesso.

## Acessibilidade
Acessibilidade é requisito estrutural:
- teclado;
- foco visível;
- contraste;
- redimensionamento de texto;
- redução de movimento;
- semântica HTML;
- futura narração/leitura assistida;
- alternativas a áudio, cor e animação.

## Relação com o Mobiliza Educa Windows
A versão Windows é fonte funcional de referência para:
- Show do Milhão;
- Memória;
- Quiz;
- Trilha;
- Cidade Mirim;
- Plateia Interativa;
- telão;
- eventos e agenda;
- gestão educacional;
- avaliação;
- passaporte;
- certificados;
- relatórios;
- auditoria;
- acessibilidade;
- backup.

A migração deve preservar regras pedagógicas úteis sem reproduzir limitações técnicas da arquitetura WinForms/SQL Server local.
