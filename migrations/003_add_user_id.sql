-- Migration: 003_add_user_id
-- Description: Agregar user_id para multi-tenancy
-- Created: 2026-04-22

-- ============================================================
-- Agregar columna user_id a transactions
-- ============================================================

ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS user_id VARCHAR(255) NOT NULL DEFAULT 'default_user';

-- ============================================================
-- Crear índice para queries por usuario
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_transactions_user_id
ON transactions(user_id);

-- ============================================================
-- Actualizar queries que filtran por fecha para incluir user_id
-- ============================================================

-- Nota: Los índices compuesto帮助你 filtrar por usuario + fecha
-- Este índice es útil para queries como:
-- "dame las transacciones de este usuario en enero 2026"
CREATE INDEX IF NOT EXISTS idx_transactions_user_created_at
ON transactions(user_id, created_at DESC);

-- ============================================================
-- Tabla de usuarios (para metadata adicional si necesitas)
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
    -- Firebase UID (clave primaria)
    uid VARCHAR(255) PRIMARY KEY,
    
    -- Email del usuario
    email VARCHAR(255) UNIQUE NOT NULL,
    
    -- Nombre display (opcional)
    display_name VARCHAR(255),
    
    -- Timestamp de creación
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Última vez que hizo login
    last_login_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Activo/inactivo
    is_active BOOLEAN DEFAULT TRUE NOT NULL
);

-- Índice para buscar por email
CREATE INDEX IF NOT EXISTS idx_users_email
ON users(email);

-- ============================================================
-- Comentarios
-- ============================================================

COMMENT ON COLUMN transactions.user_id IS 'Firebase UID del usuario que creó la transacción';
COMMENT ON TABLE users IS 'Tabla de usuarios para metadata adicional (opcional)';