import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
test('Conteúdo público persiste sem execução de JS',()=>{assert.match(html,/id="audienceGrid"[^>]*><article/);assert.match(html,/id="tipText"[^>]*>Respeite/);assert.match(html,/id="homeNotifications"[^>]*><p/);});
test('A falha de carregamento apresenta rota administrativa',()=>{assert.match(html,/id="homeBootWarning"/);assert.match(html,/onerror="document.getElementById/);assert.match(html,/home-stability.css/);});
