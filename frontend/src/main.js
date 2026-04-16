/**
 * Main - Punto de entrada de la aplicación
 * Orkuesta todos los componentes y maneja el flujo de datos
 */

import * as api from './api/transactions.js';
import store from './state/store.js';
import BalanceComponent from './components/BalanceComponent.js';
import TransactionFormComponent from './components/TransactionFormComponent.js';
import HistoryListComponent from './components/HistoryListComponent.js';
import ChartsComponent from './components/ChartsComponent.js';
import SummaryComponent from './components/SummaryComponent.js';
import EditModalComponent from './components/EditModalComponent.js';
import FilterComponent from './components/FilterComponent.js';

class App {
    constructor() {
        // Componentes
        this.balance = new BalanceComponent('balance-section');
        this.forms = new TransactionFormComponent();
        this.history = new HistoryListComponent('history-list');
        this.charts = new ChartsComponent();
        this.summary = new SummaryComponent('summary-container');
        this.modal = new EditModalComponent();
        this.filters = new FilterComponent();
        
        // Estado de la app
        this.loading = false;
    }
    
    /**
     * Inicializa la aplicación
     */
    init() {
        console.log('Inicializando aplicación...');
        
        // Vincular eventos de los componentes
        this.bindComponentEvents();
        
        // Cargar datos iniciales
        this.loadTransactions();
    }
    
    /**
     * Vincula los eventos de los componentes
     */
    bindComponentEvents() {
        // Formularios
        this.forms.onIncomeSubmit = (data) => this.handleAddTransaction(data);
        this.forms.onExpenseSubmit = (data) => this.handleAddTransaction(data);
        
        // Historial
        this.history.onEdit = (transaction) => this.handleEditTransaction(transaction);
        this.history.onDelete = (id) => this.handleDeleteTransaction(id);
        
        // Modal
        this.modal.onSave = (id, data) => this.handleUpdateTransaction(id, data);
        this.modal.onCancel = () => console.log('Edición cancelada');
        
        // Filtros
        this.filters.onChange = (filters) => this.handleFilterChange(filters);
    }
    
    /**
     * Carga las transacciones desde la API
     */
    async loadTransactions() {
        if (this.loading) return;
        
        this.loading = true;
        store.setState({ loading: true, error: null });
        
        try {
            const filters = this.filters.getFilters();
            const transactions = await api.getTransactions(filters);
            
            store.setState({ transactions, loading: false });
            this.updateUI();
        } catch (err) {
            console.error('Error al cargar transacciones:', err);
            store.setState({ 
                loading: false, 
                error: 'Error al cargar transacciones. Verifique que el servidor esté corriendo.' 
            });
            alert('Error al cargar transacciones: ' + err.message);
        }
    }
    
    /**
     * Actualiza toda la UI basándose en el estado
     */
    updateUI() {
        const state = store.getState();
        
        // Actualizar balance
        const totals = store.getTotals();
        this.balance.render(totals);
        
        // Actualizar historial
        this.history.render(state.transactions);
        
        // Actualizar gráficos
        const expenseTotals = store.getExpenseTotals();
        const typeTotals = store.getTypeTotals();
        this.charts.render(expenseTotals, typeTotals);
        
        // Actualizar resumen
        this.summary.render(expenseTotals, typeTotals);
    }
    
    /**
     * Maneja la adición de una transacción
     * @param {Object} data 
     */
    async handleAddTransaction(data) {
        try {
            const newTransaction = await api.createTransaction(data);
            
            // Agregar al store y actualizar UI
            store.addTransaction(newTransaction);
            this.updateUI();
            
            console.log('Transacción creada:', newTransaction);
        } catch (err) {
            alert('Error al crear transacción: ' + err.message);
        }
    }
    
    /**
     * Maneja la edición de una transacción
     * @param {Object} transaction 
     */
    handleEditTransaction(transaction) {
        this.modal.open(transaction);
    }
    
    /**
     * Maneja la actualización de una transacción
     * @param {number} id 
     * @param {Object} data 
     */
    async handleUpdateTransaction(id, data) {
        try {
            const updated = await api.updateTransaction(id, data);
            
            // Actualizar en el store y UI
            store.updateTransaction(updated);
            this.updateUI();
            
            console.log('Transacción actualizada:', updated);
        } catch (err) {
            alert('Error al actualizar transacción: ' + err.message);
        }
    }
    
    /**
     * Maneja la eliminación de una transacción
     * @param {number} id 
     */
    async handleDeleteTransaction(id) {
        try {
            await api.deleteTransaction(id);
            
            // Remover del store y UI
            store.removeTransaction(id);
            this.updateUI();
            
            console.log('Transacción eliminada:', id);
        } catch (err) {
            alert('Error al eliminar transacción: ' + err.message);
        }
    }
    
    /**
     * Maneja el cambio de filtros
     * @param {Object} filters 
     */
    handleFilterChange(filters) {
        store.setFilters(filters);
        this.loadTransactions();
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
});
