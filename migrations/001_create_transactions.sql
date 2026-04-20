-- Migration: 001_create_transactions
-- Description: Tabla de transacciones con constraints e indices
-- Created: 2026-04-16

-- ============================================================
-- Crear tabla transactions
-- ============================================================

CREATE TABLE IF NOT EXISTS transactions (
    -- Identificador unico
    id SERIAL PRIMARY KEY,
    
    -- Tipo de transaccion (ingreso o gasto)
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
    
    -- Descripcion de la transaccion
    description TEXT NOT NULL CHECK (char_length(description) >= 1 AND char_length(description) <= 500),
    
    -- Categoria del gasto (solo para expenses, null para income)
    category VARCHAR(100),
    
    -- Monto de la transaccion en soles
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0 AND amount <= 1000000),
    
    -- Tipo de gasto (variable o fijo, solo para expenses)
    expense_type VARCHAR(50) CHECK (expense_type IN ('variable', 'fijo')),
    
    -- Timestamps automaticos
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Constraint condicional: gastos deben tener categoria, ingresos no
    CONSTRAINT expense_needs_category CHECK (
        (type = 'income' AND category IS NULL) OR
        (type = 'expense' AND category IS NOT NULL)
    ),
    
    -- Constraint condicional: gastos deben tener tipo, ingresos no
    CONSTRAINT expense_needs_type CHECK (
        (type = 'income' AND expense_type IS NULL) OR
        (type = 'expense' AND expense_type IS NOT NULL)
    )
);

-- ============================================================
-- Crear indices para optimizar queries frecuentes
-- ============================================================

-- Indice para ordenar por fecha (historial, filtros)
CREATE INDEX IF NOT EXISTS idx_transactions_created_at 
    ON transactions(created_at DESC);

-- Indice para filtrar por tipo (income vs expense)
CREATE INDEX IF NOT EXISTS idx_transactions_type 
    ON transactions(type);

-- Indice para filtrar por categoria
CREATE INDEX IF NOT EXISTS idx_transactions_category 
    ON transactions(category);

-- Indice compuesto para filtros por mes/ano (usando columnas calculadas)
-- NOTA: Por now we use expression index on text cast to avoid IMMUTABLE issue
-- Alternatively, add year/month columns to the table
-- CREATE INDEX IF NOT EXISTS idx_transactions_year_month
--     ON transactions(EXTRACT(YEAR FROM created_at), EXTRACT(MONTH FROM created_at));
-- We'll rely on idx_transactions_created_at for date sorting

-- ============================================================
-- Trigger para actualizar updated_at automaticamente
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;

CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Comentarios para documentacion
-- ============================================================

COMMENT ON TABLE transactions IS 'Tabla principal para almacenar transacciones financieras (ingresos y gastos)';
COMMENT ON COLUMN transactions.id IS 'Identificador unico auto-incremental';
COMMENT ON COLUMN transactions.type IS 'Tipo: income (ingreso) o expense (gasto)';
COMMENT ON COLUMN transactions.description IS 'Descripcion textual de la transaccion';
COMMENT ON COLUMN transactions.category IS 'Categoria del gasto (solo para expenses)';
COMMENT ON COLUMN transactions.amount IS 'Monto en soles (S/)';
COMMENT ON COLUMN transactions.expense_type IS 'Tipo de gasto: variable o fijo (solo para expenses)';
COMMENT ON COLUMN transactions.created_at IS 'Fecha y hora de creacion';
COMMENT ON COLUMN transactions.updated_at IS 'Fecha y hora de ultima modificacion';
