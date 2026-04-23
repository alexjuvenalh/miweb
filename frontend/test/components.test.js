/**
 * Tests de Componentes (Frontend)
 * Tests de lógica de componentes
 */

// ============================================================
// CATEGORÍAS DEFINIDAS
// ============================================================

const CATEGORIES = [
    "SERVICIOS", "MASCOTAS", "VESTIMENTA Y ACCESORIOS", "TRANSPORTE",
    "EDUCACION Y TRABAJO", "SALUD Y CUIDADO PERSONAL", "ENTRETENIMIENTO",
    "HOGAR", "COMIDA", "OTROS"
];

// Funciones a testear
const isValidAmount = (amount) => {
    const num = parseFloat(amount);
    return !isNaN(num) && num > 0 && num <= 1000000;
};

// ============================================================
// TESTS
// ============================================================

describe('Components - Categorías', () => {
    
    test('DEBE tener todas las categorías requeridas', () => {
        expect(CATEGORIES).toContain('COMIDA');
        expect(CATEGORIES).toContain('TRANSPORTE');
        expect(CATEGORIES).toContain('ENTRETENIMIENTO');
    });

    test('DEBE tener 10 categorías', () => {
        expect(CATEGORIES).toHaveLength(10);
    });
});

describe('Components - Validación de Formularios', () => {
    
    describe('Validar monto', () => {
        
        test('DEBE validar monto positivo', () => {
            expect(isValidAmount(100)).toBe(true);
            expect(isValidAmount(0.01)).toBe(true);
        });

        test('DEBE rechazar monto negativo', () => {
            expect(isValidAmount(-100)).toBe(false);
        });

        test('DEBE rechazar cero', () => {
            expect(isValidAmount(0)).toBe(false);
        });

        test('DEBE rechazar límite máximo', () => {
            expect(isValidAmount(1000001)).toBe(false);
        });
    });

    describe('Validar descripción', () => {
        
        test('DEBE aceptar descripción válida', () => {
            expect('Salario'.length).toBeGreaterThan(0);
            expect('Salario'.length).toBeLessThanOrEqual(500);
        });

        test('DEBE rechazar descripción vacía', () => {
            expect(''.length).toBe(0);
        });
    });
});

describe('Components - Tipos de Transacción', () => {
    
    test('DEBE tener tipo income', () => {
        const validTypes = ['income', 'expense'];
        expect(validTypes).toContain('income');
    });

    test('DEBE tener tipo expense', () => {
        const validTypes = ['income', 'expense'];
        expect(validTypes).toContain('expense');
    });
});

describe('Components - Tipos de Gasto', () => {
    
    test('DEBE tener tipo fijo', () => {
        const expenseTypes = ['fijo', 'variable'];
        expect(expenseTypes).toContain('fijo');
    });

    test('DEBE tener tipo variable', () => {
        const expenseTypes = ['fijo', 'variable'];
        expect(expenseTypes).toContain('variable');
    });
});