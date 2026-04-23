/**
 * Tests Unitarios - API de Transacciones (Frontend)
 * Tests con fetch mockeado
 */

const API_URL = 'http://localhost:3000/api/transactions';

// Mock de FirebaseAuth
global.window = {
    FirebaseAuth: {
        getIdToken: jest.fn().mockResolvedValue('mock-token-123')
    }
};

// Funciones a testear (lógica replicada)
async function getAuthHeaders() {
    const token = await window.FirebaseAuth.getIdToken();
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

const getTransactions = async (filters = {}) => {
    let url = API_URL;
    if (filters.month || filters.year) {
        const params = new URLSearchParams();
        if (filters.month) params.append('month', filters.month);
        if (filters.year) params.append('year', filters.year);
        url += `?${params.toString()}`;
    }
    
    const headers = await getAuthHeaders();
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Error al obtener transacciones');
    }
    
    return await response.json();
};

const createTransaction = async (data) => {
    const headers = await getAuthHeaders();
    const response = await fetch(API_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
    });
    
    if (!response.ok) {
        const error = await response.json();
        const message = error.details 
            ? error.details.join(', ') 
            : error.error?.message || 'Error al crear transacción';
        throw new Error(message);
    }
    
    return await response.json();
};

const updateTransaction = async (id, data) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data)
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Error al actualizar transacción');
    }
    
    return await response.json();
};

const deleteTransaction = async (id) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Error al eliminar transacción');
    }
};

// ============================================================
// TESTS
// ============================================================

describe('API - getTransactions', () => {
    
    beforeEach(() => {
        global.fetch = jest.fn();
    });

    test('DEBE obtener todas las transacciones', async () => {
        const mockData = [
            { id: 1, type: 'income', amount: 1000 },
            { id: 2, type: 'expense', amount: 50 }
        ];
        
        global.fetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockData)
        });

        const result = await getTransactions();

        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/api/transactions'),
            expect.any(Object)
        );
        expect(result).toEqual(mockData);
    });

    test('DEBE agregar filtros a la URL', async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve([])
        });

        await getTransactions({ month: 5, year: 2026 });

        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('month=5'),
            expect.any(Object)
        );
    });

    test('DEBE lanzar error si response no es ok', async () => {
        global.fetch.mockResolvedValue({
            ok: false,
            json: () => Promise.resolve({ error: { message: 'Unauthorized' } })
        });

        await expect(getTransactions()).rejects.toThrow('Unauthorized');
    });
});

describe('API - createTransaction', () => {
    
    beforeEach(() => {
        global.fetch = jest.fn();
    });

    test('DEBE crear transacción exitosamente', async () => {
        const newTransaction = { type: 'income', description: 'Salario', amount: 5000 };
        const mockResponse = { id: 1, ...newTransaction };
        
        global.fetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockResponse)
        });

        const result = await createTransaction(newTransaction);

        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/api/transactions'),
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify(newTransaction)
            })
        );
        expect(result).toEqual(mockResponse);
    });

    test('DEBE manejar errores de validación', async () => {
        global.fetch.mockResolvedValue({
            ok: false,
            json: () => Promise.resolve({ 
                error: { message: 'Validation failed' },
                details: ['type is required']
            })
        });

        await expect(createTransaction({})).rejects.toThrow('type is required');
    });
});

describe('API - updateTransaction', () => {
    
    beforeEach(() => {
        global.fetch = jest.fn();
    });

    test('DEBE actualizar transacción', async () => {
        const updates = { amount: 6000 };
        const mockResponse = { id: 1, amount: 6000 };
        
        global.fetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockResponse)
        });

        const result = await updateTransaction(1, updates);

        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/api/transactions/1'),
            expect.objectContaining({
                method: 'PUT',
                body: JSON.stringify(updates)
            })
        );
    });
});

describe('API - deleteTransaction', () => {
    
    beforeEach(() => {
        global.fetch = jest.fn();
    });

    test('DEBE eliminar transacción', async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ message: 'Deleted' })
        });

        await deleteTransaction(1);

        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/api/transactions/1'),
            expect.objectContaining({
                method: 'DELETE'
            })
        );
    });

    test('DEBE lanzar error si no existe', async () => {
        global.fetch.mockResolvedValue({
            ok: false,
            json: () => Promise.resolve({ error: { message: 'Not found' } })
        });

        await expect(deleteTransaction(999)).rejects.toThrow('Not found');
    });
});