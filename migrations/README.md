# Migrations

Este directorio contiene los scripts SQL para crear y modificar la estructura de la base de datos.

## Estructura

```
migrations/
├── 001_create_transactions.sql  # Tabla principal de transacciones
└── README.md                     # Este archivo
```

## Uso

### Ejecutar migraciones manualmente

```bash
# Conectarse a PostgreSQL
psql -U postgres -d control_financiero

# Ejecutar el script
\i migrations/001_create_transactions.sql
```

### Verificar que se creo correctamente

```sql
-- Ver estructura de la tabla
\d transactions

-- Ver indices
\d idx_transactions_created_at
\d idx_transactions_type

-- Ver constraints
SELECT conname FROM pg_constraint WHERE conrelid = 'transactions'::regclass;
```

## Migration 001: transactions

Crea la tabla `transactions` con:

- **Constraints:**
  - `type IN ('income', 'expense')`
  - `amount > 0 AND amount <= 1000000`
  - `expense_needs_category`: gastos deben tener categoria, ingresos no
  - `expense_needs_type`: gastos deben tener tipo, ingresos no

- **Indices:**
  - `idx_transactions_created_at` - Ordenamiento por fecha
  - `idx_transactions_type` - Filtrado por tipo
  - `idx_transactions_category` - Filtrado por categoria
  - `idx_transactions_year_month` - Filtros por mes/ano

- **Triggers:**
  - `update_updated_at_column` - Actualiza `updated_at` automaticamente

## Nota

Si la tabla `transactions` ya existe en tu base de datos, NO ejecutes esta migracion. El script usa `CREATE TABLE IF NOT EXISTS` e `CREATE INDEX IF NOT EXISTS` para ser idempotente, pero si tienes datos existentes, migralos primero.
