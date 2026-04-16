/**
 * Middleware de logging para requests HTTP
 * Registra todas las peticiones entrantes y salientes
 */

const logger = require('../utils/logger');

/**
 * Middleware que loguea cada request entrante
 * Incluye método, URL, headers relevantes, body y respuesta
 */
const requestLogger = (req, res, next) => {
    const start = Date.now();
    const { method, originalUrl, ip, headers } = req;
    
    // Capturar el user-agent para debugging
    const userAgent = headers['user-agent'] || 'unknown';
    
    // Guardar el body original para loguear (si existe)
    const requestBody = req.body && Object.keys(req.body).length > 0 
        ? { ...req.body } 
        : null;
    
    // Loguear request entrante
    logger.info(`Request entrante`, {
        method,
        url: originalUrl,
        ip,
        userAgent,
        body: requestBody
    });
    
    // Interceptar la respuesta
    const originalSend = res.send;
    res.send = function(body) {
        const duration = Date.now() - start;
        const statusCode = res.statusCode;
        
        // Determinar nivel de log según status code
        const logLevel = statusCode >= 500 ? 'error' 
            : statusCode >= 400 ? 'warn' 
            : 'info';
        
        // Loguear respuesta
        logger[logLevel](`Response`, {
            method,
            url: originalUrl,
            statusCode,
            duration: `${duration}ms`,
            contentLength: res.get('content-length') || 'unknown'
        });
        
        // Si hay error, incluir detalles del body
        if (statusCode >= 400 && body) {
            let responseBody = body;
            try {
                responseBody = typeof body === 'string' ? JSON.parse(body) : body;
            } catch (e) {
                // Si no es JSON, usar como texto
            }
            logger[logLevel](`Error response`, {
                error: responseBody
            });
        }
        
        return originalSend.call(this, body);
    };
    
    next();
};

module.exports = requestLogger;
