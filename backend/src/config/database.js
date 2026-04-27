/**
 * Configuración de la conexión a PostgreSQL
 * Usa el driver pg con connection pooling
 */

require('dotenv').config();
const { Pool } = require('pg');
const logger = require('../utils/logger');

const log = logger.createLogger('Database');

// Configuración del pool de conexiones
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: false },  // SSL requerido por Seenode
    
    // Configuración del pool
    max: 20,                      // Máximo 20 conexiones simultáneas
    idleTimeoutMillis: 30000,     // Cerrar conexiones inactivas después de 30s
    connectionTimeoutMillis: 2000, // Timeout de conexión: 2s
});

// Manejo de errores de conexión
pool.on('error', (err, client) => {
    log.error('Error inesperado en el pool de PostgreSQL', {
        error: err.message,
        code: err.code
    });
});

pool.on('connect', () => {
    log.debug('Nueva conexión establecida al pool');
});

pool.on('acquire', () => {
    log.debug('Cliente adquirido del pool');
});

/**
 * Ejecuta una consulta SQL
 * @param {string} text - Query SQL
 * @param {Array} params - Parámetros de la query
 * @returns {Promise<Object>} Resultado de la query
 */
const query = async (text, params) => {
    const start = Date.now();
    try {
        const result = await pool.query(text, params);
        const duration = Date.now() - start;
        
        log.debug('Query ejecutada', {
            duration: `${duration}ms`,
            rows: result.rowCount,
            query: text.substring(0, 100)
        });
        
        return result;
    } catch (error) {
        const duration = Date.now() - start;
        log.error('Error en query', {
            duration: `${duration}ms`,
            query: text.substring(0, 100),
            error: error.message,
            code: error.code
        });
        throw error;
    }
};

/**
 * Obtiene un cliente del pool para transacciones
 * @returns {Promise<Object>} Cliente de PostgreSQL
 */
const getClient = async () => {
    log.debug('Solicitando cliente del pool');
    const client = await pool.connect();
    log.debug('Cliente obtenido');
    return client;
};

/**
 * Cierra el pool de conexiones
 * Usar al cerrar la aplicación
 */
const closePool = async () => {
    log.info('Cerrando pool de PostgreSQL');
    await pool.end();
    log.success('Pool de PostgreSQL cerrado');
};

module.exports = {
    query,
    getClient,
    closePool,
    pool
};
