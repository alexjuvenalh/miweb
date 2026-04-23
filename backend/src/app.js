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
