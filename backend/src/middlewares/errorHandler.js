/**
 * Middleware de manejo de errores centralizado
 * Captura y formatea todos los errores de la aplicación
 */

const logger = require('../utils/logger');

/**
 * Clase personalizada para errores de la aplicación
 */
class AppError extends Error {
    constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = true; // Errores operativos vs errores de programación
        
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Errores predefinidos comunes
 */
const Errors = {
    NOT_FOUND: (resource = 'Recurso') => 
        new AppError(`${resource} no encontrado`, 404, 'NOT_FOUND'),
    
    VALIDATION_ERROR: (message) => 
        new AppError(message, 400, 'VALIDATION_ERROR'),
    
    UNAUTHORIZED: () => 
        new AppError('No autorizado', 401, 'UNAUTHORIZED'),
    
    FORBIDDEN: () => 
        new AppError('Acceso denegado', 403, 'FORBIDDEN'),
    
    CONFLICT: (message) => 
        new AppError(message, 409, 'CONFLICT'),
    
    INTERNAL: (message = 'Error interno del servidor') => 
        new AppError(message, 500, 'INTERNAL_ERROR'),
    
    DATABASE_ERROR: (message) => 
        new AppError('Error de base de datos', 500, 'DATABASE_ERROR')
};

/**
 * Middleware de manejo de errores
 * Debe ser el último middleware en usar (después de todos los demás)
 */
const errorHandler = (err, req, res, next) => {
    // Valores por defecto
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal server error';
    let code = err.code || 'INTERNAL_ERROR';
    
    // Manejo de errores de PostgreSQL
    if (err.code) {
        switch (err.code) {
            case '23505': // unique_violation
                statusCode = 409;
                message = 'Ya existe un registro con esos datos';
                code = 'DUPLICATE_ENTRY';
                break;
            case '23503': // foreign_key_violation
                statusCode = 400;
                message = 'Referencia a registro inexistente';
                code = 'FOREIGN_KEY_ERROR';
                break;
            case '23502': // not_null_violation
                statusCode = 400;
                message = `Campo requerido faltante: ${err.column || 'desconocido'}`;
                code = 'NOT_NULL_ERROR';
                break;
            case '22P02': // invalid_text_representation (ej: UUID invalido)
                statusCode = 400;
                message = 'Formato de dato inválido';
                code = 'INVALID_FORMAT';
                break;
            case 'ECONNREFUSED':
                statusCode = 503;
                message = 'Base de datos no disponible';
                code = 'DB_CONNECTION_ERROR';
                break;
        }
    }
    
    // Si es un error de validación de Joi
    if (err.isJoi) {
        statusCode = 400;
        message = 'Datos de entrada inválidos';
        code = 'VALIDATION_ERROR';
    }
    
    // Loguear el error
    const logMeta = {
        statusCode,
        code,
        path: req.originalUrl,
        method: req.method,
        ip: req.ip,
        stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined
    };
    
    if (statusCode >= 500) {
        logger.error('Error del servidor', logMeta);
    } else {
        logger.warn(`Client error: ${message}`, logMeta);
    }
    
    // Responder al cliente
    res.status(statusCode).json({
        success: false,
        error: {
            code,
            message,
            ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
        }
    });
};

/**
 * Middleware para rutas no encontradas (404)
 */
const notFoundHandler = (req, res, next) => {
    logger.warn(`Ruta no encontrada: ${req.method} ${req.originalUrl}`, {
        ip: req.ip,
        userAgent: req.headers['user-agent']
    });
    
    res.status(404).json({
        success: false,
        error: {
            code: 'NOT_FOUND',
            message: `Ruta ${req.method} ${req.originalUrl} no encontrada`
        }
    });
};

/**
 * Middleware para validar en desarrollo
 * Resalta errores sin mostrar stack trace en producción
 */
const validateEnv = () => {
    // Desactivado para seenode que no tiene env vars configurables
    return;
};

module.exports = {
    AppError,
    Errors,
    errorHandler,
    notFoundHandler,
    validateEnv
};
