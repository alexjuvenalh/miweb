/**
 * Setup de Jest para Frontend
 * Versión simplificada sin JSDOM
 */

require('dotenv').config();

// Mock de fetch global
global.fetch = jest.fn();

// Variables globales falsas
global.window = {
    FirebaseAuth: {
        getIdToken: jest.fn().mockResolvedValue('mock-token-123')
    },
    location: { href: 'http://localhost' }
};

global.document = {
    getElementById: jest.fn(),
    createElement: jest.fn(() => ({ 
        textContent: '', 
        innerHTML: '',
        addEventListener: jest.fn(),
        innerHTML: ''
    }))
};

global.navigator = {
    userAgent: 'node.js'
};

beforeAll(() => {
    jest.setTimeout(10000);
});

beforeEach(() => {
    jest.clearAllMocks();
    global.fetch.mockReset();
});