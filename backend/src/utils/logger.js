/**
 * Logger centralizado para la aplicación
 * Proporciona funciones de logging con niveles y formato consistente
 */

// Colores para consola (ANSI)
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m'
};

/**
 * Obtiene la fecha y hora actual formateada
 * @returns {string} Timestamp formateado
 */
const getTimestamp = () => {
    const now = new Date();
    return now.toISOString();
};

/**
 * Formatea un mensaje de log
 * @param {string} level - Nivel de log (INFO, ERROR, etc.)
 * @param {string} color - Color ANSI
 * @param {string} message - Mensaje principal
 * @param {Object} meta - Metadatos adicionales
 * @returns {string} Mensaje formateado
 */
const formatLog = (level, color, message, meta = {}) => {
    const timestamp = getTimestamp();
    let log = `${colors.dim}[${timestamp}]${colors.reset} ${color}${level}${colors.reset}: ${message}`;
    
    if (Object.keys(meta).length > 0) {
        log += `\n    ${JSON.stringify(meta, null, 2).split('\n').join('\n    ')}`;
    }
    
    return log;
};

/**
 * Log de información general
 * @param {string} message - Mensaje
 * @param {Object} meta - Metadatos opcionales
 */
const info = (message, meta = {}) => {
    console.log(formatLog('INFO', colors.cyan, message, meta));
};

/**
 * Log de advertencias
 * @param {string} message - Mensaje
 * @param {Object} meta - Metadatos opcionales
 */
const warn = (message, meta = {}) => {
    console.warn(formatLog('WARN', colors.yellow, message, meta));
};

/**
 * Log de errores
 * @param {string} message - Mensaje
 * @param {Object} meta - Metadatos opcionales
 */
const error = (message, meta = {}) => {
    // Incluir stack trace si existe
    if (meta.stack) {
        console.error(formatLog('ERROR', colors.red, message, meta));
    } else {
        console.error(formatLog('ERROR', colors.red, message, meta));
    }
};

/**
 * Log de éxito
 * @param {string} message - Mensaje
 * @param {Object} meta - Metadatos opcionales
 */
const success = (message, meta = {}) => {
    console.log(formatLog('SUCCESS', colors.green, message, meta));
};

/**
 * Log de debugging (solo en desarrollo)
 * @param {string} message - Mensaje
 * @param {Object} meta - Metadatos opcionales
 */
const debug = (message, meta = {}) => {
    if (process.env.NODE_ENV !== 'production') {
        console.log(formatLog('DEBUG', colors.magenta, message, meta));
    }
};

/**
 * Crea un logger específico para un módulo
 * @param {string} moduleName - Nombre del módulo
 * @returns {Object} Logger configurado para el módulo
 */
const createLogger = (moduleName) => ({
    info: (message, meta = {}) => info(`[${moduleName}] ${message}`, meta),
    warn: (message, meta = {}) => warn(`[${moduleName}] ${message}`, meta),
    error: (message, meta = {}) => error(`[${moduleName}] ${message}`, meta),
    success: (message, meta = {}) => success(`[${moduleName}] ${message}`, meta),
    debug: (message, meta = {}) => debug(`[${moduleName}] ${message}`, meta)
});

module.exports = {
    info,
    warn,
    error,
    success,
    debug,
    createLogger
};
