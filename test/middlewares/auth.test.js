/**
 * Tests Unitarios - Middleware de Autenticación
 * Valida authenticate y optionalAuth
 */

const { authenticate, optionalAuth } = require('../../backend/src/middlewares/auth');

// Mock de firebase-admin
jest.mock('firebase-admin', () => {
    const mockVerifyIdToken = jest.fn();
    
    return {
        apps: [],
        initializeApp: jest.fn(),
        credential: {
            cert: jest.fn()
        },
        auth: jest.fn(() => ({
            verifyIdToken: mockVerifyIdToken
        }))
    };
});

// Obtener referencia al mock para configurar返回值
const firebaseAdmin = require('firebase-admin');
const mockVerifyIdToken = firebaseAdmin.auth().verifyIdToken;

describe('Auth Middleware - authenticate', () => {
    
    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
    };
    
    const next = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        next.mockClear();
        res.status.mockClear();
        res.json.mockClear();
    });

    describe('Casos de error - Sin token', () => {
        
        test('DEBE rechazar request sin Authorization header', async () => {
            const req = { headers: {} };
            
            await authenticate(req, res, next);
            
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Unauthorized',
                message: 'No Authorization header provided'
            });
            expect(next).not.toHaveBeenCalled();
        });

        test('DEBE rechazar request con Authorization vacío', async () => {
            const req = { headers: { authorization: '' } };
            
            await authenticate(req, res, next);
            
            expect(res.status).toHaveBeenCalledWith(401);
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe('Casos de error - Formato inválido', () => {
        
        test('DEBE rechazar formato sin "Bearer"', async () => {
            const req = { headers: { authorization: 'Basic token123' } };
            
            await authenticate(req, res, next);
            
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: expect.stringContaining('Bearer')
                })
            );
        });

        test('DEBE rechazar formato solo "Bearer" sin token', async () => {
            const req = { headers: { authorization: 'Bearer' } };
            
            await authenticate(req, res, next);
            
            expect(res.status).toHaveBeenCalledWith(401);
        });

        test('DEBE rechazar formato con múltiples espacios', async () => {
            const req = { headers: { authorization: 'Bearer token extra' } };
            
            await authenticate(req, res, next);
            
            expect(res.status).toHaveBeenCalledWith(401);
        });
    });

    describe('Verificación de token', () => {
        
        test('DEBE continuar y agregar userId si token es válido', async () => {
            const mockUser = { uid: 'user123', email: 'test@test.com', name: 'Test User' };
            mockVerifyIdToken.mockResolvedValue(mockUser);
            
            const req = { headers: { authorization: 'Bearer valid-token' } };
            
            await authenticate(req, res, next);
            
            expect(mockVerifyIdToken).toHaveBeenCalledWith('valid-token');
            expect(req.userId).toBe('user123');
            expect(req.userEmail).toBe('test@test.com');
            expect(req.userData).toEqual(expect.objectContaining({
                uid: 'user123',
                email: 'test@test.com'
            }));
            expect(next).toHaveBeenCalled();
        });

        test('DEBE rechazar token expirado', async () => {
            mockVerifyIdToken.mockRejectedValue({ code: 'auth/id-token-expired' });
            
            const req = { headers: { authorization: 'Bearer expired-token' } };
            
            await authenticate(req, res, next);
            
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Token expired. Please login again'
                })
            );
        });

        test('DEBE rechazar token inválido', async () => {
            mockVerifyIdToken.mockRejectedValue({ code: 'auth/invalid-id-token' });
            
            const req = { headers: { authorization: 'Bearer invalid-token' } };
            
            await authenticate(req, res, next);
            
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Invalid token'
                })
            );
        });

        test('DEBE rechazar token con error genérico', async () => {
            mockVerifyIdToken.mockRejectedValue(new Error('Network error'));
            
            const req = { headers: { authorization: 'Bearer some-token' } };
            
            await authenticate(req, res, next);
            
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Token verification failed'
                })
            );
        });
    });

    describe('Datos del usuario', () => {
        
        test('DEBE manejar usuario sin displayName', async () => {
            mockVerifyIdToken.mockResolvedValue({ 
                uid: 'user123', 
                email: 'test@test.com' 
                // Sin name
            });
            
            const req = { headers: { authorization: 'Bearer token' } };
            
            await authenticate(req, res, next);
            
            expect(req.userData.displayName).toBeNull();
            expect(next).toHaveBeenCalled();
        });

        test('DEBE manejar usuario sin picture', async () => {
            mockVerifyIdToken.mockResolvedValue({ 
                uid: 'user123', 
                email: 'test@test.com' 
                // Sin picture
            });
            
            const req = { headers: { authorization: 'Bearer token' } };
            
            await authenticate(req, res, next);
            
            expect(req.userData.photoURL).toBeNull();
            expect(next).toHaveBeenCalled();
        });
    });
});

describe('Auth Middleware - optionalAuth', () => {
    
    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
    };
    
    const next = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        next.mockClear();
        res.status.mockClear();
        res.json.mockClear();
    });

    describe('Sin Authorization header', () => {
        
        test('DEBE permitir request como anónimo', async () => {
            const req = { headers: {} };
            
            await optionalAuth(req, res, next);
            
            expect(req.userId).toBe('anonymous');
            expect(req.userData).toBeNull();
            expect(next).toHaveBeenCalled();
        });
    });

    describe('Formato inválido', () => {
        
        test('DEBE permitir request con formato inválido como anónimo', async () => {
            const req = { headers: { authorization: 'InvalidFormat' } };
            
            await optionalAuth(req, res, next);
            
            expect(req.userId).toBe('anonymous');
            expect(next).toHaveBeenCalled();
        });
    });

    describe('Token inválido', () => {
        
        test('DEBE permitir request con token inválido como anónimo', async () => {
            mockVerifyIdToken.mockRejectedValue(new Error('Invalid'));
            
            const req = { headers: { authorization: 'Bearer bad-token' } };
            
            await optionalAuth(req, res, next);
            
            expect(req.userId).toBe('anonymous');
            expect(next).toHaveBeenCalled();
        });
    });

    describe('Token válido', () => {
        
        test('DEBE autenticar normalmente si el token es válido', async () => {
            const mockUser = { uid: 'user456', email: 'optional@test.com' };
            mockVerifyIdToken.mockResolvedValue(mockUser);
            
            const req = { headers: { authorization: 'Bearer good-token' } };
            
            await optionalAuth(req, res, next);
            
            expect(req.userId).toBe('user456');
            expect(req.userData).toEqual(mockUser);
            expect(next).toHaveBeenCalled();
        });
    });
});