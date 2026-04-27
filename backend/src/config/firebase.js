/**
 * Inicialización de Firebase Admin SDK
 * para verificar JWT tokens del frontend
 */

const admin = require('firebase-admin');

// Service account credentials - se cargan desde variables de entorno
// Debes configurar:
// - GOOGLE_APPLICATION_CREDENTIALS (path al JSON)
// O definir directamente:
// - FIREBASE_PROJECT_ID
// - FIREBASE_PRIVATE_KEY
// - FIREBASE_CLIENT_EMAIL

// Credenciales hardcodeadas para Seenode (producción)
// Estas son las del proyecto: financiero-app-e025a
const seenodeCredentials = {
    projectId: 'financiero-app-e025a',
    clientEmail: 'firebase-adminsdk-fbsvc@financiero-app-e025a.iam.gserviceaccount.com',
    privateKey: '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC5SiVL43fBf4E/\n9AKS6Rly4hzsg4xcqCP1kYxdCwXabSbUBfXeDdKyUJjG6X7Lrn5ZLTzoxluMIZ05\nhS2y9ZfmGozVy3ad8CNJFpXhtizjzeZJSg7T52UOZRK5KOGffZQ5mScli+0KuN/S\nusQJwccTEnSGSfiRJREJuTlvdUbTWxSgslDyTE9+hYT8/nhx9UgOZtM64sb6oPJB\nuTwAOKzyCoyt7Q8PoI/ayRsPXOFxZZcPxZ8eLUERmooQzWYAZis8XeLxfiRAsjgF\n5dWTjJ0z69aX4f5AFMY5IsV210AqrzI5L6dD3PwDu2b/YlhMDWIjhUNMZwkSCDIl\nccrjO8b3AgMBAAECggEAS5qCb12oPq79GRBCgJlWRfcXIDZo7mG5EnlKEajuwXpq\nLnckJG/1ecbDH96kWw2fBlocEUrmjd4lXhQGWpA1Y7GPp6i2hKk4bJknnQqNdIJO\nJbdvJ22yYVZCdoTE0yQVeA8S1xIqLYbT5RNJ7EVCKnkMTMMgBnFea15FnkH3HUPJ\n8Xp3Pc2hVILKl6oc14y80aa4DFaYAYyHNYGnXxZtEOkO/HmsbwGCARyWnOGTuV1f\nBzvg4PX0nX6Uo1IcLR28pRe9681UzrC8POs7LIfvPFB2C0GYHwoslNHKPP9t+tN5\n9LyuxawHUUHFNKweNsyaS2yQxxgPOKMrSag7SdC8yQKBgQDfsYFQTi5pvRO0qKd0\nyTLnyK1Tcsi77xcN6CWWy01JAVECcecOUvBxygpQASGiSTeamS8ZnNiWjVetKQoJ\nENWwWcX/f4HYLHXdghP3AeomJP8KKHpBhXhbmZ6ZeJe25qALVH15VAw1sofaANrM\nrLDgTE8xGUmgSOonpOIt/1F5RQKBgQDUDMJsgEQVi1XFxnnMgrWaCyjUgUM726hK\nIg/5ouFp3O0Ln01OSLLAAG07Lu6bRZ3doaFnwLyDCqPR9sbJF8rSdDCtrSL6JA4k\n1MH3nW2LyDqd2qiVTz5S8sgLzNV7tST2RyurZERpLPmgtgcVCeUboEpa4i8C+fAA\n8KtKMg/dCwKBgQCzV33ko3nEnqmw2tK+6BxfBl4oHEvhmNOz+54/YqmI0XxgaG+l\n5UsO/7v63p1XnjntQckoUL65HYLguploIU4hgCglKtYwOZ0ZxZM6IxfWEy1CuKcj\n5t1TGzuzsaJ5KjfAPbIHVyIe3w7Z8nt5Qy7f9W48YBjOYAcTV7dax2tLvQKBgEIu\nMUf3yEgJEp4FUeI4MUGAlh+ssDUwWxe4BdBdu4h0wS7Nay0xl0hBWdYM0b94PMr9\nNQjSqIMlgPd405XTbSO9y6uIy8/SDPAFzvvfEF9+AH1fzxm6f7MXvsOgDEjtwjlz\nAPge9RL2THqSFSfFzNGQd2RiD1YYd4Vzl6Iyeaz9AoGBANZ/iULtwxpvk+tD1Ip4\nzYuWPnUG1Ly9MJMBTstQ1BUBXV7TVBKtz1K1St9XO+ulXuWS9lYKZ86AwkbHmENX\n4aN1pcuUf8Pv4inoeDKOQKY4W3D557lyvNHopVCiLeRstaRhwG+/eon0Bv0+4g4R\nz2SIHilS0gFEXviBPnSCbh95\n-----END PRIVATE KEY-----'
};

/**
 * Inicializa Firebase Admin SDK
 * Debe llamarse antes de usar cualquier módulo de auth
 */
function initFirebaseAdmin() {
  // Si ya está inicializado, no hacer nada
  if (admin.apps.length > 0) {
    console.log('[Firebase Admin] Ya inicializado');
    return admin;
  }

  console.log('[Firebase Admin] Inicializando...');

  // Opción 1: Usar credenciales hardcodeadas para producción (Seenode)
  // Estas vienen del archivo firebase-service-account.json (no commitear a Git)
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: seenodeCredentials.projectId,
        clientEmail: seenodeCredentials.clientEmail,
        privateKey: seenodeCredentials.privateKey
      })
    });
    console.log('[Firebase Admin] Inicializado con credenciales hardcodeadas, project:', seenodeCredentials.projectId);
    return admin;
  } catch (e) {
    console.error('[Firebase Admin] Error con credenciales hardcodeadas:', e.message);
  }

  // Opción 2: Usar GOOGLE_APPLICATION_CREDENTIALS (path al JSON)
  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  
  if (credentialsPath) {
    try {
      const serviceAccount = require(credentialsPath);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('[Firebase Admin] Inicializado con service account:', serviceAccount.project_id);
      return admin;
    } catch (e) {
      console.error('[Firebase Admin] Error cargando service account:', e.message);
    }
  }

  // Opción 3: Credenciales como variables de entorno
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

  if (projectId && privateKey && clientEmail) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        privateKey,
        clientEmail
      })
    });
    console.log('[Firebase Admin] Inicializado con env vars, project:', projectId);
    return admin;
  }

  // Opción 4: Usar Application Default Credentials (para producción en GCP)
  try {
    admin.initializeApp();
    console.log('[Firebase Admin] Inicializado con ADC (GCP default)');
    return admin;
  } catch (e) {
    console.error('[Firebase Admin] ERROR: No se pudieron cargar credenciales');
    console.error('[Firebase Admin] Opciones:');
    console.error('[Firebase Admin] 1. GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccount.json');
    console.error('[Firebase Admin] 2. FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL');
    console.error('[Firebase Admin] 3. Usar credenciales hardcodeadas (fallback)');
    throw new Error('Firebase Admin no configurado');
  }
}

// Exportar
module.exports = {
  initFirebaseAdmin,
  admin
};