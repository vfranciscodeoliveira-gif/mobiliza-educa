# Mobiliza Educa Web/PWA — v0.1

Primeiro núcleo web do Mobiliza Educa, pensado para GitHub Pages e uso gratuito.

## Já funciona
- Home responsiva para PC, tablet e celular
- Instalação como PWA (quando servida via HTTPS/localhost)
- Cache offline por Service Worker
- Navegação por módulos
- Alto contraste e texto ampliado
- Central de Jogos
- Quiz Relâmpago funcional com pontuação e explicação pedagógica
- Resultados locais no dispositivo
- Estrutura reservada para Show do Milhão, Trilha, Memória, Cidade Mirim e Plateia Interativa
- Área do Educador e fluxo Planejar → Preparar → Executar → Avaliar → Comprovar

## Rodar localmente
Não abra apenas com duplo clique se quiser testar PWA/Service Worker. Sirva a pasta por HTTP:

```bash
python -m http.server 8080
```

Depois abra `http://localhost:8080`.

## Publicar no GitHub Pages
1. Crie um repositório público, por exemplo `mobiliza-educa`.
2. Envie todos os arquivos desta pasta para a raiz do repositório.
3. GitHub → Settings → Pages → Deploy from a branch → `main` / root.
4. Aguarde a publicação e abra a URL gerada pelo GitHub Pages.

## Próxima fase
1. Migrar Show do Milhão do Windows para web.
2. Migrar Trilha e Memória.
3. Criar modo Telão + Operador.
4. Plateia Interativa por QR Code.
5. Eventos, turmas, participantes e avaliações.
6. Backend opcional para sincronização multi-instituição.
7. Certificados digitais, ranking e indicadores.
8. Internacionalização e conteúdo por país/jurisdição.
