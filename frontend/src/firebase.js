/**
 * Firebase Auth Configuration
 * Login con Google para Financiero App
 */

console.log('Cargando firebase.js...');

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDnYv3mhIwCHP6LCHIl44I90t9Au569Z0Q",
  authDomain: "financiero-app-e025a.firebaseapp.com",
  projectId: "financiero-app-e025a",
  storageBucket: "financiero-app-e025a.firebasestorage.app",
  messagingSenderId: "147269858347",
  appId: "1:147269858347:web:b54d6729bc374f8c3f666e",
  measurementId: "G-FFLS0GH660"
};

// Variables globales
let auth;
let googleProvider;
let initialized = false;

// Debug: verificar que firebase existe
console.log('firebase global existe:', typeof firebase !== 'undefined');
console.log('firebase.auth existe:', typeof firebase !== 'undefined' && typeof firebase.auth);
console.log('firebase VERSION:', firebase.SDK_VERSION);

// Inicializar Firebase
function initFirebase() {
    return new Promise((resolve, reject) => {
        if (initialized && auth) {
            console.log('Firebase ya inicializado');
            resolve();
            return;
        }
        
        console.log('Intentando inicializar Firebase...');
        
        let attempts = 0;
        const maxAttempts = 50;
        
        const tryInit = () => {
            attempts++;
            console.log(`Intento ${attempts} - firebase disponible:`, typeof firebase !== 'undefined');
            
            if (typeof firebase === 'undefined') {
                if (attempts < maxAttempts) {
                    setTimeout(tryInit, 100);
                } else {
                    reject(new Error('Firebase SDK no disponible después de 50 intentos'));
                }
                return;
            }
            
            try {
                console.log('Inicializando app...');
                const app = firebase.initializeApp(firebaseConfig);
                console.log('App inicializada:', app.name);
                
                // Configurar persistencia LOCAL (más confiable)
                auth = firebase.auth();
                auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
                
                googleProvider = new firebase.auth.GoogleAuthProvider();
                googleProvider.setCustomParameters({
                    prompt: 'select_account'
                });
                
                initialized = true;
                
                console.log('Firebase INICIALIZADO correctamente');
                console.log('auth:', auth);
                resolve();
            } catch (e) {
                console.error('Error al inicializar:', e);
                reject(e);
            }
        };
        
        tryInit();
    });
}

// Login con Google - usando Popup (funciona mejor cuando el dominio está autorizado)
async function loginWithGoogle() {
    console.log('loginWithGoogle llamado, initialized:', initialized);
    console.log('URL:', window.location.href);
    console.log('Hostname:', window.location.hostname);
    
    if (!initialized) {
        console.log('Esperando a que Firebase inicialice...');
        await initFirebase();
    }
    
    if (!auth || !googleProvider) {
        throw new Error('Firebase Auth no está inicializado');
    }
    
    console.log('Haciendo signInWithPopup (popup)...');
    try {
        const result = await auth.signInWithPopup(googleProvider);
        console.log('Login exitoso:', result.user.displayName);
        return result.user;
    } catch (e) {
        console.error('Error en popup:', e.code, e.message);
        
        // Si el popup fue bloqueado, intentar redirect como backup
        if (e.code === 'auth/popup-blocked') {
            console.log('Popup bloqueado, usando redirect como backup...');
            await auth.signInWithRedirect(googleProvider);
            return;
        }
        
        throw e;
    }
}

// Logout
function logout() {
    if (auth) {
        return auth.signOut();
    }
}

// Obtener JWT token del usuario actual
// Necesario para autenticar requests al backend
async function getIdToken() {
    if (!auth || !auth.currentUser) {
        throw new Error('No hay usuario autenticado');
    }
    
    try {
        const token = await auth.currentUser.getIdToken();
        return token;
    } catch (e) {
        console.error('Error al obtener token:', e);
        throw e;
    }
}

// Obtener usuario actual
function getCurrentUser() {
    return auth ? auth.currentUser : null;
}

// Observar cambios
function onAuthStateChanged(callback) {
    if (auth) {
        auth.onAuthStateChanged(callback);
    } else {
        setTimeout(() => onAuthStateChanged(callback), 500);
    }
}

// Check redirect result - llamado después de que Firebase redirige de vuelta
async function checkRedirectResult() {
    console.log('checkRedirectResult llamado');
    console.log('auth disponible:', !!auth);
    
    if (!initialized) {
        await initFirebase();
    }
    
    try {
        // Primero verificar si ya hay un usuario activo (sesión persistida)
        if (auth.currentUser) {
            console.log('Usuario existente en sesión:', auth.currentUser.displayName);
            return auth.currentUser;
        }
        
        // Luego verificar el resultado del redirect
        const result = await auth.getRedirectResult();
        console.log('Redirect result completo:', result);
        console.log('  - result.user:', result?.user?.displayName);
        console.log('  - result.credential:', result?.credential);
        console.log('  - result.additionalUserInfo:', result?.additionalUserInfo);
        
        if (result && result.user) {
            console.log('Login exitoso via redirect:', result.user.displayName);
            return result.user;
        } else if (result && result.credential) {
            // Usuario con credential pero sin user info completa
            console.log('Credential recibida, verificando usuario actual...');
            if (auth.currentUser) {
                console.log('Usuario desde auth.currentUser:', auth.currentUser.displayName);
                return auth.currentUser;
            }
        }
        
        // Si no hay resultado de redirect ni usuario, devolver null
        console.log('No hay usuario de redirect');
        return null;
    } catch (e) {
        console.error('Error getRedirectResult:', e.code, e.message);
        
        // Si el error es "auth/unauthorized-domain", el dominio no está autorizado
        if (e.code === 'auth/unauthorized-domain') {
            console.error('DOMINIO NO AUTORIZADO. Agregá este dominio en Firebase Console → Authentication → Settings → Authorized domains:');
            console.error(window.location.hostname);
        }
        
        return null;
    }
}

// Auto-inicializar
initFirebase().then(() => {
    console.log('Firebase auto-inicializado');
}).catch(e => {
    console.error('Error en auto-inicialización:', e);
});

// Exportar
window.FirebaseAuth = {
    init: initFirebase,
    loginWithGoogle,
    logout,
    getIdToken,
    getCurrentUser,
    onAuthStateChanged,
    checkRedirectResult,
    isInitialized: () => initialized
};

console.log('firebase.js cargado');
