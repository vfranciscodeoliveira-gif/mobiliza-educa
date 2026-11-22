// Configuração pública do Mobiliza Educa Cloud.
// Os identificadores abaixo pertencem ao App Web do Firebase e não são segredos privados.
export const cloudConfig=Object.freeze({
  enabled:true,
  functionsBaseUrl:'',
  publicTenantSlug:'mobiliza-educa',
  firebaseWebConfig:Object.freeze({
    apiKey:'AIzaSyA-ue1Y-1d_U35_iAr4lHm5ZskVQTfyK2U',
    authDomain:'mobiliza-educa.firebaseapp.com',
    projectId:'mobiliza-educa',
    storageBucket:'mobiliza-educa.firebasestorage.app',
    messagingSenderId:'39731938550',
    appId:'1:39731938550:web:099c367925c82487a618d7'
  }),
  directFirestore:Object.freeze({
    enabled:true,
    tenantId:'mobiliza-educa'
  }),
  vapidKey:''
});
