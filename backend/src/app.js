/**
 * Servidor Express - Entry Point
 * Aplicación de Control Financiero
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Importar config
const { initFirebaseAdmin } = require('./config/firebase');
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

// Rutas de la API
app.use('/api/transactions', transactionsRouter);

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

module.exports = app;
