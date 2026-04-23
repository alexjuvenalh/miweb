/**
 * Setup de Jest - Mocks globales para testing
 */

const { Pool } = require('pg');

// ============================================================
// MOCKS DE BASE DE DATOS
// ============================================================

// Mock del_pool de pg
jest.mock('pg', () => {
    const mockQuery = jest.fn();
    const mockConnect = jest.fn();
    const mockEnd = jest.fn();

    return {
        Pool: jest.fn(() => ({
            query: mockQuery,
            connect: mockConnect,
            end: mockEnd,
            on: jest.fn()
        }))
    };
});

// ============================================================
// MOCKS DE FIREBASE ADMIN
// ============================================================

jest.mock('firebase-admin', () => {
    const mockVerifyIdToken = jest.fn();
    const mockAuth = jest.fn(() => ({
        verifyIdToken: mockVerifyIdToken
    }));

    return {
        apps: [],
        initializeApp: jest.fn(),
        credential: {
            cert: jest.fn()
        },
        auth: mockAuth
    };
});

// ============================================================
// VARIABLES DE ENTORNO PARA TESTING
// ============================================================

process.env.NODE_ENV = 'test';
process.env.DB_USER = 'test_user';
process.env.DB_HOST = 'localhost';
process.env.DB_DATABASE = 'test_financiero';
process.env.DB_PASSWORD = 'test_password';
process.env.DB_PORT = '5432';
process.env.PORT = '3000';
process.env.FIREBASE_PROJECT_ID = 'test-project';
process.env.FIREBASE_PRIVATE_KEY = 'test-key';
process.env.FIREBASE_CLIENT_EMAIL = 'test@test.com';

// ============================================================
// GLOBAL SETUP
// ============================================================

beforeAll(() => {
    // Aumentar timeout para operaciones async
    jest.setTimeout(10000);
});

afterAll(() => {
    // Limpiar cualquier conexión pendiente
    jest.clearAllMocks();
});

beforeEach(() => {
    // Resetear todos los mocks antes de cada test
    jest.clearAllMocks();
});