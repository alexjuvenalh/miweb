# Documentación de Implementación

## Aplicación de Control Financiero

---

## 1. Arquitectura

### Stack Tecnológico
- **Backend**: Node.js + Express.js
- **Base de datos**: PostgreSQL (host: up-de-fra1-postgresql-2.db.run-on-seenode.com:11550)
- **Frontend**: Vanilla JavaScript + HTML/CSS
- **Autenticación**: Firebase Auth (Google Sign-In)
- **Tests**: Jest

### Estructura del Proyecto
```
Financiero/
├── backend/
│   ├── src/
│   │   ├── app.js              # Entry point del servidor
│   │   ├── config/
│   │   │   ├── database.js     # Conexión PostgreSQL
│   │   │   └── firebase.js     # Configuración Firebase Admin
│   │   ├── routes/
│   │   │   └── transactions.js # API de transacciones
│   │   ├── middlewares/
│   │   │   ├── auth.js         # Verificación de tokens
│   │   │   ├── errorHandler.js # Manejo de errores
│   │   │   └── logger.js       # Logging de requests
│   │   ├── validators/
│   │   │   └── transaction.js  # Validación con Joi
│   │   └── utils/
│   │       └── logger.js       # Utilidad de logging
│   ├── index.js                # Punto de inicio
│   └── package.json
├── frontend/
│   ├── index.html
│   ├── css/
│   └── js/
├── migrations/                 # Scripts SQL
└── docs/
```

---

## 2. API Endpoints

### Health Check
```
GET /health
```
Retorna estado del servidor.

### Migraciones
```
GET /api/migrate
```
Crea las tablas `transactions` y `users` en la base de datos.

### Transacciones
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/transactions` | Listar transacciones (paginadas) |
| POST | `/api/transactions` | Crear transacción |
| GET | `/api/transactions/:id` | Obtener una transacción |
| PUT | `/api/transactions/:id` | Actualizar transacción |
| DELETE | `/api/transactions/:id` | Eliminar transacción |

---

## 3. Base de Datos

### Tabla: transactions
```sql
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
    description TEXT NOT NULL,
    category VARCHAR(100),
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0 AND amount <= 1000000),
    expense_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id VARCHAR(255) NOT NULL DEFAULT 'default_user'
);
```

### Tabla: users
```sql
CREATE TABLE users (
    uid VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);
```

### Índices
- `idx_transactions_user_id` — Filtrado por usuario
- `idx_transactions_created_at` — Ordenamiento por fecha
- `idx_transactions_type` — Filtrado por tipo (income/expense)
- `idx_transactions_category` — Filtrado por categoría

---

## 4. Seguridad

### Rate Limiting
- **General**: 100 requests cada 15 minutos por IP
- **Auth**: 10 intentos cada 5 minutos

### Validación
- Entradas validadas con Joi
- Constraints en la base de datos
- Tokens JWT verificados con Firebase Admin

### CORS
Configurado para permitir peticiones desde cualquier origen (en desarrollo).

---

## 5. Despliegue en Seenode

### Credenciales de Base de Datos
```javascript
{
    user: 'db_dl2imxnx7bds',
    host: 'up-de-fra1-postgresql-2.db.run-on-seenode.com',
    database: 'db_dl2imxnx7bds',
    password: 'ryoT58AfgFeotA8EjNRz2Shq',
    port: 11550
}
```

### Endpoint de Migración
```bash
GET https://tu-app.seenode.app/api/migrate
```

---

## 6. Características Implementadas

- ✅ Autenticación con Google (Firebase)
- ✅ CRUD de transacciones (ingresos y gastos)
- ✅ Paginación en API
- ✅ Rate limiting
- ✅ Validación de datos
- ✅ Health check endpoint
- ✅ Migración automática de DB
- ✅ Tests unitarios

---

*Documento creado: 24/04/2026*
*Proyecto: Control Financiero*
*Repositorio: https://github.com/alexjuvenalh/miweb*