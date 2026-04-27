/**
 * Módulo de API para transacciones
 * Maneja todas las llamadas HTTP al backend con autenticación Firebase
 */

// URL del backend - se detecta automáticamente según el dominio actual
const getApiBaseUrl = () => {
    const hostname = window.location.hostname;
    // Si es localhost, usar localhost:3000
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:3000/api';
    }
    // En producción, usar el mismo dominio + /api
    return `${window.location.origin}/api`;
};

const API_URL = `${getApiBaseUrl()}/transactions`;

/**
 * Obtiene el token JWT del usuario actual
 * @returns {Promise<string>} Token JWT
 */
async function getAuthToken() {
    // Usar FirebaseAuth del frontend
    if (window.FirebaseAuth && window.FirebaseAuth.getIdToken) {
        return await window.FirebaseAuth.getIdToken();
    }
    
    throw new Error('FirebaseAuth no disponible. Debes iniciar sesión primero.');
}

/**
 * Headers base con autenticación
 * @returns {Promise<Object>} Headers con Authorization Bearer
 */
async function getAuthHeaders() {
    const token = await getAuthToken();
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

/**
 * Obtiene todas las transacciones con filtros opcionales
 * @param {Object} filters - Filtros { month, year }
 * @returns {Promise<Array>} Array de transacciones
 */
const getTransactions = async (filters = {}) => {
    try {
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
    } catch (err) {
        console.error('Error fetching transactions:', err);
        throw err;
    }
};

/**
 * Obtiene una transacción por ID
 * @param {number} id - ID de la transacción
 * @returns {Promise<Object>} Transacción
 */
const getTransaction = async (id) => {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_URL}/${id}`, { headers });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Transacción no encontrada');
        }
        
        return await response.json();
    } catch (err) {
        console.error('Error fetching transaction:', err);
        throw err;
    }
};

/**
 * Crea una nueva transacción
 * @param {Object} data - Datos de la transacción
 * @returns {Promise<Object>} Transacción creada
 */
const createTransaction = async (data) => {
    try {
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
    } catch (err) {
        console.error('Error adding transaction:', err);
        throw err;
    }
};

/**
 * Actualiza una transacción existente
 * @param {number} id - ID de la transacción
 * @param {Object} data - Nuevos datos
 * @returns {Promise<Object>} Transacción actualizada
 */
const updateTransaction = async (id, data) => {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            const error = await response.json();
            const message = error.details 
                ? error.details.join(', ') 
                : error.error?.message || 'Error al actualizar transacción';
            throw new Error(message);
        }
        
        return await response.json();
    } catch (err) {
        console.error('Error updating transaction:', err);
        throw err;
    }
};

/**
 * Elimina una transacción
 * @param {number} id - ID de la transacción
 * @returns {Promise<void>}
 */
const deleteTransaction = async (id) => {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Error al eliminar transacción');
        }
    } catch (err) {
        console.error('Error deleting transaction:', err);
        throw err;
    }
};

export {
    getTransactions,
    getTransaction,
    createTransaction,
    updateTransaction,
    deleteTransaction
};