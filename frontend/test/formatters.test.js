/**
 * Tests Unitarios - Utilidades de Formateo (Frontend)
 * Tests de lógica pura - replicado sin imports
 */

const CURRENCY_SYMBOL = 'S/';

// ============================================================
// Funciones a testear (copiadas del módulo)
// ============================================================

const formatCurrency = (amount, decimals = 2) => {
    return `${CURRENCY_SYMBOL} ${parseFloat(amount).toFixed(decimals)}`;
};

const getMonthName = (month) => {
    const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril',
        'Mayo', 'Junio', 'Julio', 'Agosto',
        'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[month - 1] || '';
};

const getCurrentYear = () => new Date().getFullYear();

const getAvailableYears = () => {
    const currentYear = getCurrentYear();
    return Array.from({ length: 5 }, (_, i) => currentYear - i);
};

const getTypeClasses = (type) => {
    return type === 'income' ? 'plus' : 'minus';
};

const isValidAmount = (amount) => {
    const num = parseFloat(amount);
    return !isNaN(num) && num > 0 && num <= 1000000;
};

// ============================================================
// TESTS
// ============================================================

describe('Formatters - formatCurrency', () => {
    
    test('DEBE formatear número entero', () => {
        expect(formatCurrency(1000)).toBe('S/ 1000.00');
    });

    test('DEBE formatear número decimal', () => {
        expect(formatCurrency(99.99)).toBe('S/ 99.99');
    });

    test('DEBE formatear con decimales personalizados', () => {
        expect(formatCurrency(100, 0)).toBe('S/ 100');
    });

    test('DEBE formatear string de número', () => {
        expect(formatCurrency('500')).toBe('S/ 500.00');
    });

    test('DEBE manejar 0', () => {
        expect(formatCurrency(0)).toBe('S/ 0.00');
    });
});

describe('Formatters - getMonthName', () => {
    
    test('DEBE retornar nombre del mes válido', () => {
        expect(getMonthName(1)).toBe('Enero');
        expect(getMonthName(6)).toBe('Junio');
        expect(getMonthName(12)).toBe('Diciembre');
    });

    test('DEBE retornar vacío para mes inválido', () => {
        expect(getMonthName(0)).toBe('');
        expect(getMonthName(13)).toBe('');
    });
});

describe('Formatters - getCurrentYear', () => {
    
    test('DEBE retornar año actual', () => {
        expect(getCurrentYear()).toBe(new Date().getFullYear());
    });
});

describe('Formatters - getAvailableYears', () => {
    
    test('DEBE retornar últimos 5 años', () => {
        const years = getAvailableYears();
        
        expect(years).toHaveLength(5);
        expect(years[0]).toBe(new Date().getFullYear());
    });

    test('DEBE incluir año actual y 4 anteriores', () => {
        const currentYear = getCurrentYear();
        const years = getAvailableYears();
        
        expect(years).toContain(currentYear);
        expect(years).toContain(currentYear - 4);
    });
});

describe('Formatters - getTypeClasses', () => {
    
    test('DEBE retornar "plus" para income', () => {
        expect(getTypeClasses('income')).toBe('plus');
    });

    test('DEBE retornar "minus" para expense', () => {
        expect(getTypeClasses('expense')).toBe('minus');
    });
});

describe('Formatters - isValidAmount', () => {
    
    test('DEBE aceptar monto válido positivo', () => {
        expect(isValidAmount(100)).toBe(true);
        expect(isValidAmount(0.01)).toBe(true);
    });

    test('DEBE rechazar monto negativo', () => {
        expect(isValidAmount(-100)).toBe(false);
    });

    test('DEBE rechazar cero', () => {
        expect(isValidAmount(0)).toBe(false);
    });

    test('DEBE rechazar monto mayor al límite', () => {
        expect(isValidAmount(1000001)).toBe(false);
    });

    test('DEBE rechazar valores no numéricos', () => {
        expect(isValidAmount('abc')).toBe(false);
        expect(isValidAmount(null)).toBe(false);
        expect(isValidAmount(undefined)).toBe(false);
    });
});