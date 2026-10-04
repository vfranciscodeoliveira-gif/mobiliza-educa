const CACHE='mobiliza-educa-v0.49.2';
const ASSETS=[
 './','./index.html','./assets/app.css?v=41','./assets/showcase.css?v=14',
 './assets/icon.svg','./assets/ai/hero_area_escolar.webp?v=2','./assets/ai/publicos_sprite.webp?v=2','./assets/ai/jogos_experiencias_sprite.webp?v=2','./assets/mobiliza_educa_caminhos_para_a_vida.webp','./assets/icon-32.webp','./assets/icon-192.webp','./assets/brand-cover.webp',
 './assets/games/quiz_do_milhao_do_transito.svg',
 './assets/games/trilha_do_transito_agentes_mirins.svg',
 './assets/games/jogo_da_memoria_mobiliza_educa.svg',
 './assets/games/palavras_cruzadas_do_transito.svg',
 './assets/games/plateia_conectada.svg?v=24',
 './assets/games/cidade_mirim_mobiliza_educa.svg',
 './assets/games/cidade_mirim_realista_ai_v35.webp',
 './assets/memory/pare.svg','./assets/memory/semaforo.svg','./assets/memory/pedestre.svg','./assets/memory/bicicleta.svg','./assets/memory/cinto.svg','./assets/memory/celular.svg','./assets/memory/velocidade.svg','./assets/memory/escola.svg','./assets/memory/capacete.svg','./assets/memory/faixa.svg',
 './js/app.js?v=81','./js/content.js?v=67','./js/modules/quiz.js?v=30','./js/modules/milhao.js?v=19',
 './js/modules/trilha.js?v=36','./js/modules/memoria.js?v=28','./js/modules/eAgora.js?v=40','./js/modules/cruzadas.js?v=31','./js/modules/plateia.js?v=6','./js/modules/participant.js?v=3','./js/modules/learning.js?v=3','./js/core/sharedSession.js?v=1',
 './js/modules/experiencias.js?v=46','./js/modules/experienciasExtra.js?v=3','./js/core/soundManager.js?v=1','./js/core/historyStore.js?v=1','./js/core/questionEngine.js?v=3','./js/data/questionBank.js?v=1','./js/modules/admin.js?v=19','./js/modules/educator.js?v=1','./js/modules/results.js?v=3','./js/modules/auth.js?v=2','./js/modules/notifications.js?v=7','./js/modules/publicService.js?v=4','./js/cloudGateway.js?v=5','./js/cloudConfig.js?v=2','./js/core/cloudAuth.js?v=2','./js/core/qr.js?v=1','./js/modules/checkinPublic.js?v=3','./js/modules/certValidation.js?v=3','./js/modules/passaporteCertificados.js?v=3','./js/core/assessmentEngine.js?v=2','./js/modules/avaliacaoPedagogica.js?v=2','./js/modules/avaliacaoPublica.js?v=1','./js/core/evidenceStore.js?v=3','./js/modules/evidenciasImpacto.js?v=3','./js/modules/relatorios360.js?v=1','./js/core/accessControl.js?v=1','./js/modules/usuariosAuditoria.js?v=1','./js/core/backupManager.js?v=2','./js/modules/sistemaContinuity.js?v=4','./js/core/contentRepository.js?v=1','./js/modules/centroEditorial.js?v=1','./js/core/saasContext.js?v=2','./js/modules/assinaturaSaas.js?v=2','./js/core/tenantRegistry.js?v=1','./js/modules/plataformaComercial.js?v=1','./manifest.webmanifest'
];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;const u=new URL(e.request.url);if(u.hostname==='127.0.0.1'||u.hostname==='localhost')return;e.respondWith(fetch(e.request).then(resp=>{const copy=resp.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return resp;}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))));});
self.addEventListener('push',event=>{let data={};try{data=event.data?event.data.json():{};}catch{data={title:'Mobiliza Educa',body:event.data?event.data.text():'Nova solicitação recebida.'};}const title=data.title||'Mobiliza Educa';const options={body:data.body||'Há uma nova solicitação aguardando análise.',icon:'./assets/icon-192.webp',badge:'./assets/icon-32.webp',tag:data.tag||'mobiliza-gestor',data:{url:data.url||'./'}};event.waitUntil(self.registration.showNotification(title,options));});
self.addEventListener('notificationclick',event=>{event.notification.close();const url=event.notification.data?.url||'./';event.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>{for(const c of list){if('focus'in c){c.navigate(url);return c.focus();}}return clients.openWindow?clients.openWindow(url):null;}));});
