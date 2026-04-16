# Backend - Control Financiero

API REST modular para gestión de transacciones financieras.

## Estructura

```
backend/
├── src/
│   ├── config/
│   │   └── database.js      # Conexión PostgreSQL con pooling
│   ├── routes/
│   │   └── transactions.js  # Rutas CRUD de transacciones
│   ├── validators/
│   │   └── transaction.js   # Schemas Joi para validación
│   └── app.js              # Entry point
├── index.js                 # Export principal
└── README.md
```

## API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/transactions` | Listar todas (con filtros opcionales) |
| GET | `/api/transactions/:id` | Obtener una por ID |
| POST | `/api/transactions` | Crear nueva |
| PUT | `/api/transactions/:id` | Actualizar |
| DELETE | `/api/transactions/:id` | Eliminar |
| GET | `/health` | Health check |

## Uso

```bash
# Ejecutar
node backend/src/app.js

# O desde package.json (agregar script)
npm start
```

## Dependencias

- `express` - Framework web
- `pg` - Driver PostgreSQL
- `joi` - Validación de datos
- `cors` - Cross-origin
- `dotenv` - Variables de entorno

## Variables de Entorno

Ver `.env` en la raíz del proyecto:

```
PORT=3000
DB_USER=postgres
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=control_financiero
DB_PASSWORD=tu_password
```

## Validación

El backend valida:

- **type**: Solo `'income'` o `'expense'`
- **description**: 1-500 caracteres
- **category**: Requerido para expenses
- **amount**: Positivo, máximo 1,000,000
- **expense_type**: `'variable'` o `'fijo'`, requerido para expenses
