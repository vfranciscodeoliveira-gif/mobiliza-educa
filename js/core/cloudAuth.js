import {cloudConfig} from '../cloudConfig.js?v=2';

let appPromise=null;
let authPromise=null;
let authEmulatorConnected=false;

export const isCloudEmulatorMode=()=>{
 try{return new URLSearchParams(location.search).get('emulator')==='1';}
 catch{return false;}
};

const emulatorFirebaseConfig=Object.freeze({
 apiKey:'fake-api-key',
 authDomain:'127.0.0.1',
 projectId:'mobiliza-educa',
 appId:'1:000000000000:web:emulator'
});

export const cloudStoragePrefix=()=>isCloudEmulatorMode()?'mobiliza.cloud.emulator':'mobiliza.cloud';
export const cloudAuthConfigured=()=>isCloudEmulatorMode()||!!(cloudConfig.enabled&&cloudConfig.firebaseWebConfig?.apiKey&&cloudConfig.firebaseWebConfig?.projectId);
export const cloudSessionHint=()=>localStorage.getItem(cloudStoragePrefix()+'.authEmail')||'';

async function getFirebaseApp(){
 if(!cloudAuthConfigured())throw new Error('Firebase Web ainda não configurado.');
 if(!appPromise){
  appPromise=(async()=>{
   const sdk=await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js');
   const cfg=isCloudEmulatorMode()?emulatorFirebaseConfig:cloudConfig.firebaseWebConfig;
   return sdk.getApps().length?sdk.getApp():sdk.initializeApp(cfg);
  })();
 }
 return appPromise;
}
export async function getCloudAuth(){
 if(!authPromise){
  authPromise=(async()=>{
   const [app,sdk]=await Promise.all([
    getFirebaseApp(),
    import('https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js')
   ]);
   const auth=sdk.getAuth(app);
   if(isCloudEmulatorMode()&&!authEmulatorConnected){
    sdk.connectAuthEmulator(auth,'http://127.0.0.1:9099',{disableWarnings:true});
    authEmulatorConnected=true;
   }
   await sdk.setPersistence(auth,sdk.browserLocalPersistence);
   return auth;
  })();
 }
 return authPromise;
}
export async function signInCloud(email,password){
 const auth=await getCloudAuth();
 const sdk=await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js');
 const cred=await sdk.signInWithEmailAndPassword(auth,String(email||'').trim(),String(password||''));
 const user=cred.user,prefix=cloudStoragePrefix();
 localStorage.setItem(prefix+'.authEmail',user.email||'');
 window.dispatchEvent(new CustomEvent('mobiliza-cloud-auth',{detail:{signedIn:true,email:user.email||'',emulator:isCloudEmulatorMode()}}));
 return user;
}
export async function signOutCloud(){
 const auth=await getCloudAuth();
 const sdk=await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js');
 await sdk.signOut(auth);
 const prefix=cloudStoragePrefix();
 localStorage.removeItem(prefix+'.authEmail');
 localStorage.removeItem(prefix+'.tenantId');
 localStorage.removeItem(prefix+'.me');
 window.dispatchEvent(new CustomEvent('mobiliza-cloud-auth',{detail:{signedIn:false,emulator:isCloudEmulatorMode()}}));
}
export async function getCloudUser(){
 const auth=await getCloudAuth();
 if(auth.currentUser)return auth.currentUser;
 await new Promise(resolve=>{
  const timer=setTimeout(resolve,1200);
  const off=auth.onAuthStateChanged(()=>{clearTimeout(timer);off();resolve();});
 });
 return auth.currentUser||null;
}
export async function getCloudIdToken(forceRefresh=false){
 const user=await getCloudUser();
 if(!user)return'';
 return user.getIdToken(forceRefresh);
}
