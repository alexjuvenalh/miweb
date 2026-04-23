/**
 * Tests de Integración - Rutas de Transacciones
 * Usa supertest para testing de API
 */

const request = require('supertest');

// Mock defirebase-admin antes de importar la app
jest.mock('firebase-admin', () => {
    const mockVerifyIdToken = jest.fn();
    
    return {
        apps: [{ id: '[DEFAULT]' }],
        initializeApp: jest.fn(() => ({ name: '[DEFAULT]' })),
        credential: { cert: jest.fn() },
        auth: jest.fn(() => ({ verifyIdToken: mockVerifyIdToken })),
        // Exportar el mock para usarlo en los tests
        _mockVerifyIdToken: (token) => mockVerifyIdToken(token)
    };
});

// Mock de pg
jest.mock('pg', () => {
    const mockQuery = jest.fn();
    
    return {
        Pool: jest.fn(() => ({
            query: mockQuery,
            connect: jest.fn(),
            end: jest.fn(),
            on: jest.fn()
        }))
    };
});

const firebaseAdmin = require('firebase-admin');
const mockVerifyIdToken = firebaseAdmin.auth().verifyIdToken;

// Importar la app
const app = require('../../backend/src/app');

describe('API Routes - /api/transactions', () => {
    
    const mockUserId = 'user123';
    const mockToken = 'valid-user-token';
    
    // Headers de autenticación
    const authHeader = (token) => ({ 
        Authorization: `Bearer ${token || mockToken}` 
    });
    
    describe('Sin autenticación', () => {
        
        test('DEBE rechazar requests sin token (GET)', async () => {
            const res = await request(app)
                .get('/api/transactions');
            
            expect(res.status).toBe(401);
            expect(res.body.error).toBeDefined();
        });
        
        test('DEBE rechazar requests sin token (POST)', async () => {
            const res = await request(app)
                .post('/api/transactions')
                .send({ type: 'income', description: 'Test', amount: 100 });
            
            expect(res.status).toBe(401);
        });
    });
    
    describe('Con token inválido', () => {
        
        test('DEBE rechazar token inválido', async () => {
            mockVerifyIdToken.mockRejectedValue(new Error('Invalid token'));
            
            const res = await request(app)
                .get('/api/transactions')
                .set(authHeader('invalid-token'));
            
            expect(res.status).toBe(401);
        });
        
        test('DEBE rechazar token expirado', async () => {
            mockVerifyIdToken.mockRejectedValue({ code: 'auth/id-token-expired' });
            
            const res = await request(app)
                .get('/api/transactions')
                .set(authHeader('expired-token'));
            
            expect(res.status).toBe(401);
            expect(res.body.message).toContain('expired');
        });
    });
    
    describe('GET /api/transactions', () => {
        
        beforeEach(() => {
            mockVerifyIdToken.mockResolvedValue({ 
                uid: mockUserId, 
                email: 'test@test.com' 
            });
        });
        
        test('DEBE retornar array vacío si no hay transacciones', async () => {
            // Simular respuesta de BD vacía
            const { Pool } = require('pg');
            const mockPool = new Pool();
            mockPool.query.mockResolvedValue({ rows: [], rowCount: 0 });
            
            const res = await request(app)
                .get('/api/transactions')
                .set(authHeader());
            
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });
        
        test('DEBE aceptar filtros opcionales', async () => {
            const { Pool } = require('pg');
            const mockPool = new Pool();
            mockPool.query.mockResolvedValue({ rows: [], rowCount: 0 });
            
            const res = await request(app)
                .get('/api/transactions?month=5&year=2026')
                .set(authHeader());
            
            expect(res.status).toBe(200);
        });
        
        test('DEBE rechazar filtro de mes inválido', async () => {
            const res = await request(app)
                .get('/api/transactions?month=13')
                .set(authHeader());
            
            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Invalid filters');
        });
        
        test('DEBE rechazar filtro de año inválido', async () => {
            const res = await request(app)
                .get('/api/transactions?year=1800')
                .set(authHeader());
            
            expect(res.status).toBe(400);
        });
    });
    
    describe('POST /api/transactions', () => {
        
        beforeEach(() => {
            mockVerifyIdToken.mockResolvedValue({ 
                uid: mockUserId, 
                email: 'test@test.com' 
            });
        });
        
        test('DEBE crear ingreso válido', async () => {
            const { Pool } = require('pg');
            const mockPool = new Pool();
            mockPool.query.mockResolvedValue({ 
                rows: [{ 
                    id: 1, 
                    type: 'income', 
                    description: 'Salario', 
                    amount: 5000,
                    user_id: mockUserId
                }],
                rowCount: 1
            });
            
            const res = await request(app)
                .post('/api/transactions')
                .set(authHeader())
                .send({
                    type: 'income',
                    description: 'Salario',
                    amount: 5000
                });
            
            expect(res.status).toBe(201);
            expect(res.body.id).toBeDefined();
        });
        
        test('DEBE crear gasto válido', async () => {
            const { Pool } = require('pg');
            const mockPool = new Pool();
            mockPool.query.mockResolvedValue({ 
                rows: [{ 
                    id: 2, 
                    type: 'expense', 
                    description: 'Almuerzo', 
                    amount: 25,
                    category: 'alimentacion',
                    expense_type: 'variable',
                    user_id: mockUserId
                }],
                rowCount: 1
            });
            
            const res = await request(app)
                .post('/api/transactions')
                .set(authHeader())
                .send({
                    type: 'expense',
                    description: 'Almuerzo',
                    amount: 25,
                    category: 'alimentacion',
                    expense_type: 'variable'
                });
            
            expect(res.status).toBe(201);
        });
        
        test('DEBE rechazar transacción sin tipo', async () => {
            const res = await request(app)
                .post('/api/transactions')
                .set(authHeader())
                .send({
                    description: 'Test',
                    amount: 100
                });
            
            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Validation failed');
        });
        
        test('DEBE rechazar tipo inválido', async () => {
            const res = await request(app)
                .post('/api/transactions')
                .set(authHeader())
                .send({
                    type: 'credit',
                    description: 'Test',
                    amount: 100
                });
            
            expect(res.status).toBe(400);
        });
        
        test('DEBE rechazar gasto sin categoría', async () => {
            const res = await request(app)
                .post('/api/transactions')
                .set(authHeader())
                .send({
                    type: 'expense',
                    description: 'Gasto sin categoría',
                    amount: 50
                });
            
            expect(res.status).toBe(400);
        });
        
        test('DEBE rechazar monto negativo', async () => {
            const res = await request(app)
                .post('/api/transactions')
                .set(authHeader())
                .send({
                    type: 'income',
                    description: 'Test',
                    amount: -100
                });
            
            expect(res.status).toBe(400);
        });
        
        test('DEBE rechazar monto inválido', async () => {
            const res = await request(app)
                .post('/api/transactions')
                .set(authHeader())
                .send({
                    type: 'income',
                    description: 'Test',
                    amount: 'invalid'
                });
            
            expect(res.status).toBe(400);
        });
    });
    
    describe('GET /api/transactions/:id', () => {
        
        beforeEach(() => {
            mockVerifyIdToken.mockResolvedValue({ 
                uid: mockUserId, 
                email: 'test@test.com' 
            });
        });
        
        test('DEBE obtener transacción por ID', async () => {
            const { Pool } = require('pg');
            const mockPool = new Pool();
            mockPool.query.mockResolvedValue({ 
                rows: [{ id: 1, type: 'income', amount: 100 }],
                rowCount: 1
            });
            
            const res = await request(app)
                .get('/api/transactions/1')
                .set(authHeader());
            
            expect(res.status).toBe(200);
            expect(res.body.id).toBe(1);
        });
        
        test('DEBE rechazar ID inválido', async () => {
            const res = await request(app)
                .get('/api/transactions/abc')
                .set(authHeader());
            
            expect(res.status).toBe(400);
        });
        
        test('DEBE rechazar ID negativo', async () => {
            const res = await request(app)
                .get('/api/transactions/-1')
                .set(authHeader());
            
            expect(res.status).toBe(400);
        });
    });
    
    describe('PUT /api/transactions/:id', () => {
        
        beforeEach(() => {
            mockVerifyIdToken.mockResolvedValue({ 
                uid: mockUserId, 
                email: 'test@test.com' 
            });
        });
        
        test('DEBE actualizar transacción', async () => {
            const { Pool } = require('pg');
            const mockPool = new Pool();
            mockPool.query.mockResolvedValue({ 
                rows: [{ id: 1, type: 'income', amount: 200 }],
                rowCount: 1
            });
            
            const res = await request(app)
                .put('/api/transactions/1')
                .set(authHeader())
                .send({
                    type: 'income',
                    description: 'Salario actualizado',
                    amount: 200
                });
            
            expect(res.status).toBe(200);
        });
    });
    
    describe('DELETE /api/transactions/:id', () => {
        
        beforeEach(() => {
            mockVerifyIdToken.mockResolvedValue({ 
                uid: mockUserId, 
                email: 'test@test.com' 
            });
        });
        
        test('DEBE eliminar transacción', async () => {
            const { Pool } = require('pg');
            const mockPool = new Pool();
            mockPool.query.mockResolvedValue({ rowCount: 1 });
            
            const res = await request(app)
                .delete('/api/transactions/1')
                .set(authHeader());
            
            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Transaction deleted');
        });
        
        test('DEBE retornar 404 si no existe', async () => {
            const { Pool } = require('pg');
            const mockPool = new Pool();
            mockPool.query.mockResolvedValue({ rowCount: 0 });
            
            const res = await request(app)
                .delete('/api/transactions/999')
                .set(authHeader());
            
            expect(res.status).toBe(404);
        });
    });
});

describe('API Routes - /health', () => {
    
    test('DEBE retornar estado del servidor', async () => {
        const res = await request(app).get('/health');
        
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('ok');
        expect(res.body.uptime).toBeDefined();
        expect(res.body.timestamp).toBeDefined();
    });
});