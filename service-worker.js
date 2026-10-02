const CACHE='mobiliza-educa-v0.4.0';
const ASSETS=[
'./','./index.html','./assets/app.css','./assets/brand-icon.webp','./assets/hero-ai.webp',
'./assets/games/milhao.webp','./assets/games/trilha.webp','./assets/games/memoria.webp','./assets/games/cruzadas.webp',
'./js/app.js','./js/content.js','./js/modules/quiz.js','./js/modules/milhao.js','./js/modules/trilha.js',
'./js/modules/memoria.js','./js/modules/cruzadas.js','./js/modules/cidade.js','./js/modules/plateia.js',
'./js/modules/admin.js','./js/modules/auth.js','./js/modules/notifications.js','./manifest.webmanifest'
];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET')return;
 e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(resp=>{
  const copy=resp.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return resp;
 }).catch(()=>e.request.mode==='navigate'?caches.match('./index.html'):Response.error())));
});