/**
 * Servidor Express - Entry Point
 * Aplicación de Control Financiero
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');

// Importar config
const { initFirebaseAdmin } = require('./config/firebase');
const { closePool } = require('./config/database');
const { errorHandler, notFoundHandler, validateEnv } = require('./middlewares/errorHandler');

// Importar middlewares
const requestLogger = require('./middlewares/logger');

// Importar logger para uso en el archivo
const logger = require('./utils/logger');

// Importar rutas
const transactionsRouter = require('./routes/transactions');

// Crear app
const app = express();
const port = process.env.PORT || 3000;

// ============================================================
// VALIDATION
// ============================================================

// Validar variables de entorno requeridas
validateEnv();

// ============================================================
// MIDDLEWARE
// ============================================================

// CORS para permitir peticiones desde el frontend
app.use(cors());

// Parsear JSON en el body
app.use(express.json());

// Logger de requests HTTP
app.use(requestLogger);

// ============================================================
// RATE LIMITING
// ============================================================

// Rate limiter general - 100 requests por 15 minutos por IP
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // máximo 100 requests
    message: {
        error: 'Too many requests',
        message: 'Demasiadas peticiones. Intenta de nuevo en 15 minutos.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next, options) => {
        logger.warn('Rate limit excedido', { ip: req.ip });
        res.status(options.statusCode).json(options.message);
    }
});

// Rate limiter para autenticación - 10 attempts por 5 minutos
const authLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: 10, // máximo 10 attempts
    message: {
        error: 'Too many auth attempts',
        message: 'Demasiados intentos de autenticación. Intenta de nuevo en 5 minutos.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// ============================================================
// STATIC FILES
// ============================================================

// Servir archivos estáticos (frontend)
app.use(express.static(path.join(__dirname, '../../')));

// ============================================================
// ROUTES
// ============================================================

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Endpoint de migraciones (temporal - ejecutar una vez y desactivar)
// Acepta credenciales como query params para entornos sin env vars
app.get('/api/migrate', async (req, res) => {
    try {
        // Si no hay env vars, usar las pasadas como query params o las de seenode
        const dbConfig = {
            user: process.env.DB_USER || req.query.db_user || 'db_dl2imxnx7bds',
            host: process.env.DB_HOST || req.query.db_host || 'up-de-fra1-postgresql-2.db.run-on-seenode.com',
            database: process.env.DB_DATABASE || req.query.db_database || 'db_dl2imxnx7bds',
            password: process.env.DB_PASSWORD || req.query.db_password || 'ryoT58AfgFeotA8EjNRz2Shq',
            port: parseInt(process.env.DB_PORT) || parseInt(req.query.db_port) || 11550,
            ssl: { rejectUnauthorized: false }  // SSL requerido por Seenode
        };
        
        const { Pool } = require('pg');
        const pool = new Pool(dbConfig);
        const query = async (text) => {
            const result = await pool.query(text);
            return result;
        };
        
        // Migration 001: Crear tabla transactions
        await query(`
            CREATE TABLE IF NOT EXISTS transactions (
                id SERIAL PRIMARY KEY,
                type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
                description TEXT NOT NULL CHECK (char_length(description) >= 1 AND char_length(description) <= 500),
                category VARCHAR(100),
                amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0 AND amount <= 1000000),
                expense_type VARCHAR(50) CHECK (expense_type IN ('variable', 'fijo')),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
                user_id VARCHAR(255) NOT NULL DEFAULT 'default_user',
                CONSTRAINT expense_needs_category CHECK (
                    (type = 'income' AND category IS NULL) OR
                    (type = 'expense' AND category IS NOT NULL)
                ),
CONSTRAINT expense_needs_type CHECK (
                    (type = 'income' AND expense_type IS NULL) OR
                    (type = 'expense' AND expense_type IS NOT NULL)
                )
            );
        `);
        
        // Índices
        await query(`CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC)`);
        await query(`CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type)`);
        await query(`CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category)`);
        await query(`CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id)`);
        await query(`CREATE INDEX IF NOT EXISTS idx_transactions_user_created_at ON transactions(user_id, created_at DESC)`);
        
        // Trigger para updated_at
        await query(`
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = CURRENT_TIMESTAMP;
                RETURN NEW;
            END;
            $$ language 'plpgsql'
        `);
        await query(`DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions`);
        await query(`
            CREATE TRIGGER update_transactions_updated_at
            BEFORE UPDATE ON transactions
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column()
        `);
        
        // Tabla users
        await query(`
            CREATE TABLE IF NOT EXISTS users (
                uid VARCHAR(255) PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                display_name VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
                last_login_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
                is_active BOOLEAN DEFAULT TRUE NOT NULL
            )
        `);
        await query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
        
        res.json({ status: 'ok', message: 'Migraciones ejecutadas correctamente' });
        
        // Cerrar pool temporal
        await pool.end();
    } catch (error) {
        logger.error('Error en migraciones', { error: error.message });
        res.status(500).json({ error: error.message });
    }
});

// Rutas de la API con rate limiting
app.use('/api/transactions', generalLimiter, transactionsRouter);

// ============================================================
// ERROR HANDLING
// ============================================================

// 404 - Ruta no encontrada
app.use(notFoundHandler);

// Error handler genérico (debe ser el último)
app.use(errorHandler);

// ============================================================
// SERVER START
// ============================================================

// Inicializar Firebase Admin (requiere credenciales configuradas)
try {
  initFirebaseAdmin();
} catch (e) {
  console.error('Error inicializando Firebase Admin:', e.message);
  console.error('Las transacciones no funcionarán sin Firebase Admin configurado');
}

app.listen(port, () => {
    logger.success(`Servidor iniciado en puerto ${port}`);
    logger.info('Endpoints disponibles', {
        health: `http://localhost:${port}/health`,
        api: `http://localhost:${port}/api/transactions`
    });
});

// ============================================================
// GRACEFUL SHUTDOWN
// ============================================================

const gracefulShutdown = async (signal) => {
    logger.warn(`Recibido señal ${signal}. Cerrando servidor...`);
    
    try {
        // Cerrar pool de conexiones a DB
        await closePool();
        logger.success('Pool de DB cerrado');
        
        // Cerrar servidor HTTP
        process.exit(0);
    } catch (error) {
        logger.error('Error durante shutdown', { error: error.message });
        process.exit(1);
    }
};

// Manejar señales de terminación
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = app;
