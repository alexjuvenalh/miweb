/**
 * Tests Unitarios - Manejo de Errores
 * Valida AppError, Errors factory y middlewares de error
 */

const {
    AppError,
    Errors,
    errorHandler,
    notFoundHandler,
    validateEnv
} = require('../../backend/src/middlewares/errorHandler');

// Mock de logger para evitar salida en tests
jest.mock('../../backend/src/utils/logger', () => ({
    error: jest.fn(),
    warn: jest.fn(),
    success: jest.fn(),
    info: jest.fn(),
    debug: jest.fn()
}));

describe('ErrorHandler - AppError', () => {
    
    describe('Constructor', () => {
        test('DEBE crear error con valores por defecto', () => {
            const error = new AppError('Test error');
            
            expect(error.message).toBe('Test error');
            expect(error.statusCode).toBe(500);
            expect(error.code).toBe('INTERNAL_ERROR');
            expect(error.isOperational).toBe(true);
        });

        test('DEBE crear error con código personalizado', () => {
            const error = new AppError('Test error', 404, 'NOT_FOUND');
            
            expect(error.statusCode).toBe(404);
            expect(error.code).toBe('NOT_FOUND');
        });

        test('DEBE ser instancia de Error', () => {
            const error = new AppError('Test');
            expect(error).toBeInstanceOf(Error);
        });

        test('DEBE mantener el stack trace', () => {
            const error = new AppError('Test');
            expect(error.stack).toBeDefined();
        });
    });
});

describe('ErrorHandler - Errors Factory', () => {
    
    describe('NOT_FOUND', () => {
        test('DEBE crear error 404 con recurso personalizado', () => {
            const error = Errors.NOT_FOUND('Transacción');
            
            expect(error.message).toBe('Transacción no encontrado');
            expect(error.statusCode).toBe(404);
            expect(error.code).toBe('NOT_FOUND');
        });

        test('DEBE usar默认值 si no se pasa recurso', () => {
            const error = Errors.NOT_FOUND();
            
            expect(error.message).toBe('Recurso no encontrado');
        });
    });

    describe('VALIDATION_ERROR', () => {
        test('DEBE crear error 400', () => {
            const error = Errors.VALIDATION_ERROR('Campo requerido');
            
            expect(error.message).toBe('Campo requerido');
            expect(error.statusCode).toBe(400);
            expect(error.code).toBe('VALIDATION_ERROR');
        });
    });

    describe('UNAUTHORIZED', () => {
        test('DEBE crear error 401', () => {
            const error = Errors.UNAUTHORIZED();
            
            expect(error.message).toBe('No autorizado');
            expect(error.statusCode).toBe(401);
            expect(error.code).toBe('UNAUTHORIZED');
        });
    });

    describe('FORBIDDEN', () => {
        test('DEBE crear error 403', () => {
            const error = Errors.FORBIDDEN();
            
            expect(error.message).toBe('Acceso denegado');
            expect(error.statusCode).toBe(403);
        });
    });

    describe('CONFLICT', () => {
        test('DEBE crear error 409 con mensaje personalizado', () => {
            const error = Errors.CONFLICT('Email ya registrado');
            
            expect(error.message).toBe('Email ya registrado');
            expect(error.statusCode).toBe(409);
        });
    });

    describe('DATABASE_ERROR', () => {
        test('DEBE crear error 500 con mensaje', () => {
            const error = Errors.DATABASE_ERROR('Error al conectar');
            
            expect(error.message).toBe('Error de base de datos');
            expect(error.statusCode).toBe(500);
            expect(error.code).toBe('DATABASE_ERROR');
        });
    });
});

describe('ErrorHandler - Middleware errorHandler', () => {
    
    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
    };
    
    const next = jest.fn();

    beforeEach(() => {
        res.status.mockClear();
        res.json.mockClear();
        next.mockClear();
    });

    test('DEBE manejar AppError correctamente', () => {
        const error = new AppError('Test error', 400, 'VALIDATION_ERROR');
        const req = { 
            method: 'POST', 
            originalUrl: '/api/test',
            ip: '127.0.0.1'
        };
        
        errorHandler(error, req, res, next);
        
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            error: expect.objectContaining({
                code: 'VALIDATION_ERROR',
                message: 'Test error'
            })
        });
    });

    test('DEBE manejar error de PostgreSQL unique_violation (23505)', () => {
        const error = new Error('Duplicate key');
        error.code = '23505';
        const req = { method: 'POST', originalUrl: '/api/test', ip: '127.0.0.1' };
        
        errorHandler(error, req, res, next);
        
        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                success: false,
                error: expect.objectContaining({
                    code: 'DUPLICATE_ENTRY'
                })
            })
        );
    });

    test('DEBE manejar error de PostgreSQL foreign_key_violation (23503)', () => {
        const error = new Error('Foreign key violation');
        error.code = '23503';
        const req = { method: 'POST', originalUrl: '/api/test', ip: '127.0.0.1' };
        
        errorHandler(error, req, res, next);
        
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('DEBE manejar error de PostgreSQL not_null_violation (23502)', () => {
        const error = new Error('Null value');
        error.code = '23502';
        error.column = 'email';
        const req = { method: 'POST', originalUrl: '/api/test', ip: '127.0.0.1' };
        
        errorHandler(error, req, res, next);
        
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                error: expect.objectContaining({
                    code: 'NOT_NULL_ERROR'
                })
            })
        );
    });

    test('DEBE manejar error de conexión a BD (ECONNREFUSED)', () => {
        const error = new Error('Connection refused');
        error.code = 'ECONNREFUSED';
        const req = { method: 'GET', originalUrl: '/api/test', ip: '127.0.0.1' };
        
        errorHandler(error, req, res, next);
        
        expect(res.status).toHaveBeenCalledWith(503);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                error: expect.objectContaining({
                    code: 'DB_CONNECTION_ERROR'
                })
            })
        );
    });

    test('DEBE manejar errores 500+ sin exponer stack trace en producción', () => {
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'production';
        
        const error = new AppError('Internal error', 500);
        const req = { method: 'GET', originalUrl: '/api/test', ip: '127.0.0.1' };
        
        errorHandler(error, req, res, next);
        
        // En producción, el stack no debería incluirse en la respuesta
        const response = res.json.mock.calls[0][0];
        expect(response.error.stack).toBeUndefined();
        
        process.env.NODE_ENV = originalEnv;
    });

    test('DEBE exponer stack trace en desarrollo', () => {
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'development';
        
        const error = new AppError('Internal error', 500);
        const req = { method: 'GET', originalUrl: '/api/test', ip: '127.0.0.1' };
        
        errorHandler(error, req, res, next);
        
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                error: expect.objectContaining({
                    stack: expect.any(String)
                })
            })
        );
        
        process.env.NODE_ENV = originalEnv;
    });
});

describe('ErrorHandler - notFoundHandler', () => {
    
    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
    };
    
    const next = jest.fn();

    test('DEBE retornar 404 con ruta correcta', () => {
        const req = { 
            method: 'GET', 
            originalUrl: '/api/nonexistent',
            ip: '127.0.0.1',
            headers: { 'user-agent': 'test' }
        };
        
        notFoundHandler(req, res, next);
        
        expect(res.status).toHaveBeenCalledWith(404);
        // El mensaje incluye el método
        const callArgs = res.json.mock.calls[0][0];
        expect(callArgs.success).toBe(false);
        expect(callArgs.error.code).toBe('NOT_FOUND');
        expect(callArgs.error.message).toContain('no encontrada');
    });
});

describe('ErrorHandler - validateEnv', () => {
    
    test('DEBE lanzar si faltan variables requeridas', () => {
        const originalEnv = { ...process.env };
        
        delete process.env.DB_USER;
        
        expect(() => validateEnv()).toThrow('Faltan variables de entorno');
        
        process.env.DB_USER = originalEnv.DB_USER;
    });

    test('DEBE pasar si todas las variables están presentes', () => {
        // Las variables ya están configuradas en setup.js
        expect(() => validateEnv()).not.toThrow();
    });
});