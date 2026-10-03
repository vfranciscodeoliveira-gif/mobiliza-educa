const CACHE='mobiliza-educa-v0.22.0';
const ASSETS=[
 './','./index.html','./assets/app.css?v=36','./assets/showcase.css?v=14',
 './assets/icon.svg','./assets/ai/hero_area_escolar.webp?v=1','./assets/ai/publicos_sprite.webp?v=1','./assets/ai/jogos_experiencias_sprite.webp?v=1','./assets/mobiliza_educa_caminhos_para_a_vida.webp','./assets/icon-32.webp','./assets/icon-192.webp','./assets/brand-cover.webp',
 './assets/games/quiz_do_milhao_do_transito.svg',
 './assets/games/trilha_do_transito_agentes_mirins.svg',
 './assets/games/jogo_da_memoria_mobiliza_educa.svg',
 './assets/games/palavras_cruzadas_do_transito.svg',
 './assets/games/cidade_mirim_mobiliza_educa.svg',
 './assets/games/cidade_mirim_realista_ai_v35.webp',
 './assets/memory/pare.svg','./assets/memory/semaforo.svg','./assets/memory/pedestre.svg','./assets/memory/bicicleta.svg','./assets/memory/cinto.svg','./assets/memory/celular.svg','./assets/memory/velocidade.svg','./assets/memory/escola.svg','./assets/memory/capacete.svg','./assets/memory/faixa.svg',
 './js/app.js?v=46','./js/content.js?v=43','./js/modules/quiz.js?v=26','./js/modules/milhao.js?v=15',
 './js/modules/trilha.js?v=32','./js/modules/memoria.js?v=27','./js/modules/cruzadas.js?v=30',
 './js/modules/experiencias.js?v=43','./js/core/soundManager.js?v=1','./js/core/questionEngine.js?v=1','./js/data/questionBank.js?v=1','./js/modules/admin.js','./js/modules/auth.js','./js/modules/notifications.js','./manifest.webmanifest'
];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(fetch(e.request).then(resp=>{const copy=resp.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return resp;}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))));});