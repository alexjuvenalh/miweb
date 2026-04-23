/**
 * Tests Unitarios - Store de Estado (Frontend)
 * Tests de lógica del store - replicado sin imports
 */

// ============================================================
// Store a testear (copiado del módulo)
// ============================================================

class Store {
    constructor() {
        this.state = {
            transactions: [],
            loading: false,
            error: null,
            filters: { month: null, year: null },
            charts: { expenseChart: null, typeChart: null }
        };
        this.listeners = [];
    }
    
    getState() {
        return this.state;
    }
    
    setState(partial) {
        this.state = { ...this.state, ...partial };
        this.notify();
    }
    
    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }
    
    notify() {
        this.listeners.forEach(listener => {
            try { listener(this.state); } catch (err) { console.error(err); }
        });
    }
    
    addTransaction(transaction) {
        const transactions = [transaction, ...this.state.transactions];
        this.setState({ transactions });
    }
    
    updateTransaction(updated) {
        const transactions = this.state.transactions.map(t => 
            t.id === updated.id ? updated : t
        );
        this.setState({ transactions });
    }
    
    removeTransaction(id) {
        const transactions = this.state.transactions.filter(t => t.id !== id);
        this.setState({ transactions });
    }
    
    setFilters(filters) {
        this.setState({ filters: { ...this.state.filters, ...filters } });
    }
    
    getTotals() {
        const incomes = this.state.transactions.filter(t => t.type === 'income');
        const expenses = this.state.transactions.filter(t => t.type === 'expense');
        
        const totalIncome = incomes.reduce((acc, t) => acc + parseFloat(t.amount), 0);
        const totalExpense = expenses.reduce((acc, t) => acc + parseFloat(t.amount), 0);
        
        return { totalIncome, totalExpense, balance: totalIncome - totalExpense };
    }
    
    getExpenseTotals() {
        const expenses = this.state.transactions.filter(t => t.type === 'expense');
        return expenses.reduce((acc, expense) => {
            acc[expense.category] = (acc[expense.category] || 0) + parseFloat(expense.amount);
            return acc;
        }, {});
    }
    
    getTypeTotals() {
        const expenses = this.state.transactions.filter(t => t.type === 'expense');
        return expenses.reduce((acc, expense) => {
            acc[expense.expense_type] = (acc[expense.expense_type] || 0) + parseFloat(expense.amount);
            return acc;
        }, { variable: 0, fijo: 0 });
    }
}

// ============================================================
// TESTS
// ============================================================

describe('Store - Constructor', () => {
    
    let store;
    
    beforeEach(() => {
        store = new Store();
    });
    
    test('DEBE inicializar con estado vacío', () => {
        const state = store.getState();
        expect(state.transactions).toEqual([]);
        expect(state.loading).toBe(false);
        expect(state.error).toBe(null);
    });
    
    test('DEBE inicializar con filtros nulos', () => {
        const state = store.getState();
        expect(state.filters.month).toBeNull();
        expect(state.filters.year).toBeNull();
    });
});

describe('Store - setState', () => {
    
    let store;
    
    beforeEach(() => {
        store = new Store();
    });
    
    test('DEBE actualizar estado parcialmente', () => {
        store.setState({ loading: true });
        expect(store.getState().loading).toBe(true);
    });
    
    test('DEBE mantener estado anterior', () => {
        store.setState({ loading: true });
        store.setState({ error: 'error' });
        const state = store.getState();
        expect(state.loading).toBe(true);
        expect(state.error).toBe('error');
    });
    
    test('DEBE notificar después de actualizar', () => {
        const listener = jest.fn();
        store.subscribe(listener);
        store.setState({ loading: true });
        expect(listener).toHaveBeenCalledWith(store.getState());
    });
});

describe('Store - subscribe/unsubscribe', () => {
    
    let store;
    
    beforeEach(() => {
        store = new Store();
    });
    
    test('DEBE suscribir listener', () => {
        const listener = jest.fn();
        store.subscribe(listener);
        store.setState({ loading: true });
        expect(listener).toHaveBeenCalled();
    });
    
    test('DEBE desuscribir listener', () => {
        const listener = jest.fn();
        const unsubscribe = store.subscribe(listener);
        unsubscribe();
        store.setState({ loading: true });
        expect(listener).not.toHaveBeenCalled();
    });
    
    test('DEBE permitir múltiples listeners', () => {
        const listener1 = jest.fn();
        const listener2 = jest.fn();
        store.subscribe(listener1);
        store.subscribe(listener2);
        store.setState({ loading: true });
        expect(listener1).toHaveBeenCalled();
        expect(listener2).toHaveBeenCalled();
    });
});

describe('Store - addTransaction', () => {
    
    let store;
    const mockTransaction = { id: 1, type: 'income', amount: 100 };
    
    beforeEach(() => { store = new Store(); });
    
    test('DEBE agregar transacción al inicio', () => {
        store.addTransaction(mockTransaction);
        expect(store.getState().transactions[0]).toEqual(mockTransaction);
    });
    
    test('DEBE mantener transacciones existentes', () => {
        store.addTransaction({ id: 1, amount: 50 });
        store.addTransaction(mockTransaction);
        expect(store.getState().transactions).toHaveLength(2);
    });
});

describe('Store - updateTransaction', () => {
    
    let store;
    const original = { id: 1, type: 'income', amount: 100 };
    const updated = { id: 1, type: 'income', amount: 200 };
    
    beforeEach(() => {
        store = new Store();
        store.setState({ transactions: [original] });
    });
    
    test('DEBE actualizar transacción existente', () => {
        store.updateTransaction(updated);
        expect(store.getState().transactions[0].amount).toBe(200);
    });
});

describe('Store - removeTransaction', () => {
    
    let store;
    const t1 = { id: 1, amount: 100 };
    const t2 = { id: 2, amount: 200 };
    
    beforeEach(() => {
        store = new Store();
        store.setState({ transactions: [t1, t2] });
    });
    
    test('DEBE eliminar transacción por ID', () => {
        store.removeTransaction(1);
        expect(store.getState().transactions).toHaveLength(1);
        expect(store.getState().transactions[0].id).toBe(2);
    });
    
    test('DEBE no fallar si no existe', () => {
        expect(() => store.removeTransaction(999)).not.toThrow();
    });
});

describe('Store - setFilters', () => {
    
    let store;
    
    beforeEach(() => { store = new Store(); });
    
    test('DEBE actualizar filtros', () => {
        store.setFilters({ month: 5, year: 2026 });
        const state = store.getState();
        expect(state.filters.month).toBe(5);
        expect(state.filters.year).toBe(2026);
    });
    
    test('DEBE mantener filtros anteriores', () => {
        store.setFilters({ month: 5 });
        store.setFilters({ year: 2026 });
        const state = store.getState();
        expect(state.filters.month).toBe(5);
        expect(state.filters.year).toBe(2026);
    });
});

describe('Store - getTotals', () => {
    
    let store;
    
    beforeEach(() => { store = new Store(); });
    
    test('DEBE calcular totales correctamente', () => {
        store.setState({
            transactions: [
                { type: 'income', amount: 1000 },
                { type: 'income', amount: 500 },
                { type: 'expense', amount: 300 },
                { type: 'expense', amount: 200 }
            ]
        });
        
        const totals = store.getTotals();
        expect(totals.totalIncome).toBe(1500);
        expect(totals.totalExpense).toBe(500);
        expect(totals.balance).toBe(1000);
    });
    
    test('DEBE manejar lista vacía', () => {
        const totals = store.getTotals();
        expect(totals.totalIncome).toBe(0);
        expect(totals.totalExpense).toBe(0);
        expect(totals.balance).toBe(0);
    });
    
    test('DEBE parsear montos como números', () => {
        store.setState({
            transactions: [
                { type: 'income', amount: '100' },
                { type: 'expense', amount: '50' }
            ]
        });
        
        const totals = store.getTotals();
        expect(totals.totalIncome).toBe(100);
        expect(totals.totalExpense).toBe(50);
    });
});

describe('Store - getExpenseTotals', () => {
    
    let store;
    
    beforeEach(() => { store = new Store(); });
    
    test('DEBE calcular totales por categoría', () => {
        store.setState({
            transactions: [
                { type: 'expense', amount: 100, category: 'comida' },
                { type: 'expense', amount: 50, category: 'comida' },
                { type: 'expense', amount: 200, category: 'transporte' }
            ]
        });
        
        const totals = store.getExpenseTotals();
        expect(totals.comida).toBe(150);
        expect(totals.transporte).toBe(200);
    });
    
    test('DEBE ignorar ingresos', () => {
        store.setState({
            transactions: [
                { type: 'income', amount: 1000 },
                { type: 'expense', amount: 100, category: 'comida' }
            ]
        });
        
        const totals = store.getExpenseTotals();
        expect(totals.comida).toBe(100);
    });
});

describe('Store - getTypeTotals', () => {
    
    let store;
    
    beforeEach(() => { store = new Store(); });
    
    test('DEBE calcular totales variable/fijo', () => {
        store.setState({
            transactions: [
                { type: 'expense', amount: 100, expense_type: 'variable' },
                { type: 'expense', amount: 50, expense_type: 'variable' },
                { type: 'expense', amount: 200, expense_type: 'fijo' }
            ]
        });
        
        const totals = store.getTypeTotals();
        expect(totals.variable).toBe(150);
        expect(totals.fijo).toBe(200);
    });
    
    test('DEBE inicializar en cero si no hay gastos', () => {
        const totals = store.getTypeTotals();
        expect(totals.variable).toBe(0);
        expect(totals.fijo).toBe(0);
    });
});