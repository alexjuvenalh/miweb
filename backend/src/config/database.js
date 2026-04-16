/**
 * Configuración de la conexión a PostgreSQL
 * Usa el driver pg con connection pooling
 */

require('dotenv').config();
const { Pool } = require('pg');

// Configuración del pool de conexiones
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    
    // Configuración del pool
    max: 20,                      // Máximo 20 conexiones simultáneas
    idleTimeoutMillis: 30000,     // Cerrar conexiones inactivas después de 30s
    connectionTimeoutMillis: 2000, // Timeout de conexión: 2s
});

// Manejo de errores de conexión
pool.on('error', (err, client) => {
    console.error('Error inesperado en el pool de PostgreSQL:', err.message);
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
        console.log(`Query ejecutada en ${duration}ms: ${text.substring(0, 50)}...`);
        return result;
    } catch (error) {
        console.error(`Error en query: ${text.substring(0, 50)}...`, error.message);
        throw error;
    }
};

/**
 * Obtiene un cliente del pool para transacciones
 * @returns {Promise<Object>} Cliente de PostgreSQL
 */
const getClient = async () => {
    const client = await pool.connect();
    return client;
};

/**
 * Cierra el pool de conexiones
 * Usar al cerrar la aplicación
 */
const closePool = async () => {
    await pool.end();
    console.log('Pool de PostgreSQL cerrado');
};

module.exports = {
    query,
    getClient,
    closePool,
    pool
};
