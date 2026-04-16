/**
 * Servidor Express - Entry Point
 * Aplicación de Control Financiero
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Importar rutas
const transactionsRouter = require('./routes/transactions');

// Crear app
const app = express();
const port = process.env.PORT || 3000;

// ============================================================
// MIDDLEWARE
// ============================================================

// CORS para permitir peticiones desde el frontend
app.use(cors());

// Parsear JSON en el body
app.use(express.json());

// Logger de requests (básico)
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    });
    next();
});

// ============================================================
// ROUTES
// ============================================================

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rutas de la API
app.use('/api/transactions', transactionsRouter);

// ============================================================
// ERROR HANDLING
// ============================================================

// 404 - Ruta no encontrada
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Error handler genérico
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// ============================================================
// SERVER START
// ============================================================

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Health check: http://localhost:${port}/health`);
    console.log(`API: http://localhost:${port}/api/transactions`);
});

module.exports = app;
