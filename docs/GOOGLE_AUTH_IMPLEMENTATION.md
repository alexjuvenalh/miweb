# Implementación Google Login con Firebase Auth

## Requisitos Previos
- Cuenta Gmail personal
- App desplegada o para desplegar en internet

---

## Paso 1: Crear Proyecto en Firebase

1. Ir a [firebase.google.com](https://firebase.google.com)
2. Clickear **"Ir a la consola"**
3. Click **"Crear proyecto"**
4. Nombre del proyecto: `financiero-app`
5. Aceptar términos → click "Continuar"

---

## Paso 2: Habilitar Google como método de login

1. En consola Firebase → **Authentication** → **Sign-in method**
2. Click en **"Google"**
3. Toggle **"Habilitar"**
4. Nombre público del proyecto: `Mi Financiero` (lo que verán los usuarios)
5. Email de soporte: tu Gmail
6. Click **"Guardar"**

---

## Paso 3: Agregar tu app al proyecto Firebase

1. Ir a **General** (icono de engranaje) → **Agregar app** → **Web** (`</>`)
2. Registrar app:
   - Apodo: `Financiero Web`
   - Opcional: Hosting de Firebase → **desmarcar** (usaremos nuestro servidor)
3. Click **"Registrar app"**
4. **COPIAR** el objeto `firebaseConfig` que te da (lo necesitamos para el código)

---

## Paso 4: Instalar Firebase SDK

En la raíz del proyecto:

```bash
npm install firebase
```

---

## Paso 5: Configurar Firebase en el Frontend

Crear archivo `frontend/src/firebase.js`:

```javascript
import { initializeApp } from 'firebase';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

const firebaseConfig = {
  // COPIAR desde Firebase Console → General → Tu app → Config
  apiKey: "TU_API_KEY",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Funciones de autenticación
export const loginWithGoogle = () => signInWithPopup(auth, googleProvider);
export const logout = () => signOut(auth);
export { auth };
```

---

## Paso 6: Modificar frontend para usar login

### A) Modificar `index.html`
Agregar el SDK de Firebase antes de tus scripts:

```html
<script type="module" src="https://www.gstatic.com/firebasejs/10.x.x/firebase-app.js"></script>
<script type="module" src="https://www.gstatic.com/firebasejs/10.x.x/firebase-auth.js"></script>
```

### B) Modificar `main.js`
Agregar lógica de login:

```javascript
import { loginWithGoogle, logout, auth } from './firebase.js';

class App {
    constructor() {
        this.init();
    }

    async init() {
        // Verificar si ya está logueado
        auth.onAuthStateChanged((user) => {
            if (user) {
                console.log('Usuario:', user.displayName);
                this.loadApp();
            } else {
                this.showLogin();
            }
        });
    }

    showLogin() {
        // Mostrar botón de Google Login
        const loginBtn = document.getElementById('login-btn');
        loginBtn.addEventListener('click', async () => {
            try {
                await loginWithGoogle();
            } catch (err) {
                console.error('Error:', err.message);
            }
        });
    }

    async loadApp() {
        // Tu app normal...
    }
}
```

---

## Paso 7: Probar localmente

1. Iniciar servidor frontend: `python -m http.server 8080`
2. Abrir `http://localhost:8080`
3. Click "Continuar con Google"
4. Aceptar permisos

---

## Estructura de archivos a modificar:

```
frontend/
├── src/
│   ├── firebase.js      (NUEVO)
│   └── main.js        (MODIFICAR)
index.html            (MODIFICAR - agregar scripts Firebase)
```

---

## Opciones Extra (opcional):

### Restringir a dominio específico
Si querés solo usuarios de un dominio:

```javascript
googleProvider.setCustomParameters({
  hd: "gmail.com"  // solo @gmail.com
  // o: "ana.gob.pe"  solo emails institucionales
});
```

### Guardar usuario en backend
Enviar el token a tu backend y validarlo ahí.

---

## Links útiles:
- [Firebase Auth Docs](https://firebase.google.com/docs/auth/web/google-signin)
- [Google Cloud Console](https://console.cloud.google.com/)

---

## Estado: ✅ COMPLETADO
*Implementado el 20 de Abril 2026*

### Archivos modificados:
- `frontend/src/firebase.js` (NUEVO)
- `frontend/src/main.js` (MODIFICADO)
- `index.html` (MODIFICADO)
- `style.css` (MODIFICADO)