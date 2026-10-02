const CACHE='mobiliza-educa-v0.9.3';
const ASSETS=[
 './','./index.html','./assets/app.css','./assets/showcase.css',
 './assets/icon.svg','./assets/mobiliza_educa_caminhos_para_a_vida.webp','./assets/icon-32.webp','./assets/icon-192.webp','./assets/brand-cover.webp',
 './assets/games/quiz_do_milhao_do_transito.webp',
 './assets/games/trilha_do_transito_agentes_mirins.webp',
 './assets/games/jogo_da_memoria_mobiliza_educa.webp',
 './assets/games/palavras_cruzadas_do_transito.webp',
 './js/app.js?v=11','./js/content.js','./js/modules/quiz.js','./js/modules/milhao.js?v=11',
 './js/modules/trilha.js','./js/modules/memoria.js','./js/modules/cruzadas.js',
 './js/modules/admin.js','./js/modules/auth.js','./js/modules/notifications.js','./manifest.webmanifest'
];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(fetch(e.request).then(resp=>{const copy=resp.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return resp;}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))));});