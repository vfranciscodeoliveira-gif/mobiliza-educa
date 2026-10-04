import {cloudConfig} from '../cloudConfig.js?v=2';

let appPromise=null;
let authPromise=null;

export const cloudAuthConfigured=()=>!!(cloudConfig.enabled&&cloudConfig.firebaseWebConfig?.apiKey&&cloudConfig.firebaseWebConfig?.projectId);
export const cloudSessionHint=()=>localStorage.getItem('mobiliza.cloud.authEmail')||'';

async function getFirebaseApp(){
 if(!cloudAuthConfigured())throw new Error('Firebase Web ainda não configurado.');
 if(!appPromise){
  appPromise=(async()=>{
   const sdk=await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js');
   return sdk.getApps().length?sdk.getApp():sdk.initializeApp(cloudConfig.firebaseWebConfig);
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
 const user=cred.user;
 localStorage.setItem('mobiliza.cloud.authEmail',user.email||'');
 window.dispatchEvent(new CustomEvent('mobiliza-cloud-auth',{detail:{signedIn:true,email:user.email||''}}));
 return user;
}
export async function signOutCloud(){
 const auth=await getCloudAuth();
 const sdk=await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js');
 await sdk.signOut(auth);
 localStorage.removeItem('mobiliza.cloud.authEmail');
 localStorage.removeItem('mobiliza.cloud.tenantId');
 window.dispatchEvent(new CustomEvent('mobiliza-cloud-auth',{detail:{signedIn:false}}));
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
