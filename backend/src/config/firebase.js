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

  // Opción 1: Usar GOOGLE_APPLICATION_CREDENTIALS (path al JSON)
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

  // Opción 2: Credenciales como variables de entorno
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

  // Opción 3: Usar Application Default Credentials (para producción en GCP)
  try {
    admin.initializeApp();
    console.log('[Firebase Admin] Inicializado con ADC (GCP default)');
    return admin;
  } catch (e) {
    console.error('[Firebase Admin] ERROR: No se pudieron cargar credenciales');
    console.error('[Firebase Admin] Opciones:');
    console.error('[Firebase Admin] 1. GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccount.json');
    console.error('[Firebase Admin] 2. FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL');
    throw new Error('Firebase Admin no configurado');
  }
}

// Exportar
module.exports = {
  initFirebaseAdmin,
  admin
};