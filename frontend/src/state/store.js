/**
 * Store de estado centralizado
 * Implementa patrón Observer para notificar cambios
 */

class Store {
    constructor() {
        // Estado inicial
        this.state = {
            transactions: [],
            loading: false,
            error: null,
            filters: {
                month: null,
                year: null
            },
            charts: {
                expenseChart: null,
                typeChart: null
            }
        };
        
        // Observadores
        this.listeners = [];
    }
    
    /**
     * Obtiene el estado actual
     * @returns {Object} Estado actual
     */
    getState() {
        return this.state;
    }
    
    /**
     * Actualiza el estado parcialmente
     * @param {Object} partial - Partial del estado
     */
    setState(partial) {
        this.state = { ...this.state, ...partial };
        this.notify();
    }
    
    /**
     * Suscribe un listener a cambios del estado
     * @param {Function} listener - Función a ejecutar en cambios
     * @returns {Function} Función para desuscribirse
     */
    subscribe(listener) {
        this.listeners.push(listener);
        
        // Retornar función de cleanup
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }
    
    /**
     * Notifica a todos los observadores
     */
    notify() {
        this.listeners.forEach(listener => {
            try {
                listener(this.state);
            } catch (err) {
                console.error('Error en listener:', err);
            }
        });
    }
    
    /**
     * Agrega una transacción al inicio de la lista
     * @param {Object} transaction - Transacción a agregar
     */
    addTransaction(transaction) {
        const transactions = [transaction, ...this.state.transactions];
        this.setState({ transactions });
    }
    
    /**
     * Actualiza una transacción existente
     * @param {Object} updated - Transacción actualizada
     */
    updateTransaction(updated) {
        const transactions = this.state.transactions.map(t => 
            t.id === updated.id ? updated : t
        );
        this.setState({ transactions });
    }
    
    /**
     * Elimina una transacción
     * @param {number} id - ID de la transacción
     */
    removeTransaction(id) {
        const transactions = this.state.transactions.filter(t => t.id !== id);
        this.setState({ transactions });
    }
    
    /**
     * Actualiza filtros
     * @param {Object} filters - Nuevos filtros
     */
    setFilters(filters) {
        this.setState({ filters: { ...this.state.filters, ...filters } });
    }
    
    /**
     * Calcula totales de ingresos y gastos
     * @returns {Object} { totalIncome, totalExpense, balance }
     */
    getTotals() {
        const incomes = this.state.transactions.filter(t => t.type === 'income');
        const expenses = this.state.transactions.filter(t => t.type === 'expense');
        
        const totalIncome = incomes.reduce((acc, t) => acc + parseFloat(t.amount), 0);
        const totalExpense = expenses.reduce((acc, t) => acc + parseFloat(t.amount), 0);
        const balance = totalIncome - totalExpense;
        
        return { totalIncome, totalExpense, balance };
    }
    
    /**
     * Calcula totales por categoría
     * @returns {Object} { categoryName: total }
     */
    getExpenseTotals() {
        const expenses = this.state.transactions.filter(t => t.type === 'expense');
        
        return expenses.reduce((acc, expense) => {
            acc[expense.category] = (acc[expense.category] || 0) + parseFloat(expense.amount);
            return acc;
        }, {});
    }
    
    /**
     * Calcula totales por tipo de gasto (variable/fijo)
     * @returns {Object} { variable: total, fijo: total }
     */
    getTypeTotals() {
        const expenses = this.state.transactions.filter(t => t.type === 'expense');
        
        return expenses.reduce((acc, expense) => {
            acc[expense.expense_type] = (acc[expense.expense_type] || 0) + parseFloat(expense.amount);
            return acc;
        }, { variable: 0, fijo: 0 });
    }
}

// Instancia singleton del store
const store = new Store();

export default store;
