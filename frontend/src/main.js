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

// Estado de autenticación
let currentUser = null;

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
async init() {
    console.log('Inicializando aplicación...');
    this.showLogin();
    await window.FirebaseAuth.init();
    console.log('Firebase inicializado');
    
    const onLoggedIn = (user) => {
        if (user) {
            console.log('LOGIN EXITOSO:', user.displayName);
            currentUser = user;
            this.hideLogin();
            this.startApp();
            return true;
        }
        return false;
    };
    
    window.FirebaseAuth.onAuthStateChanged((user) => {
        console.log('Auth changed:', user ? user.displayName : 'null');
        onLoggedIn(user);
    });
    
    const user = window.FirebaseAuth.getCurrentUser();
    if (onLoggedIn(user)) return;
    
    console.log('Mostrando login');
    this.showLogin();
}

/**
 * Muestra la pantalla de login
 */
showLogin() {
    const appContainer = document.getElementById('app-container');
    const loginContainer = document.getElementById('login-container');
    
    if (appContainer) appContainer.style.display = 'none';
    if (loginContainer) loginContainer.style.display = 'flex';
        
        // Re-habilitar botón de login
        const loginBtn = document.getElementById('google-login-btn');
        if (loginBtn) {
            loginBtn.innerHTML = '<img src="https://www.gstatic.com/images/branding/googleg/1x/googleg_standard_color.svg" alt="Google"> Continuar con Google';
            loginBtn.disabled = false;
            
            // Remover eventos previos
            loginBtn.onclick = null;
            
            loginBtn.onclick = async () => {
                console.log('CLICK EN BOTON LOGIN');
                console.log('FirebaseAuth disponible:', typeof window.FirebaseAuth);
                
                loginBtn.innerHTML = 'Iniciando sesión...';
                loginBtn.disabled = true;
                
                try {
                    console.log('Llamando loginWithGoogle...');
                    const user = await window.FirebaseAuth.loginWithGoogle();
                    console.log('Login completado:', user);
                } catch (err) {
                    console.error('Error de login:', err);
                    alert('Error al iniciar sesión: ' + err.message);
                    loginBtn.innerHTML = '<img src="https://www.gstatic.com/images/branding/googleg/1x/googleg_standard_color.svg" alt="Google"> Continuar con Google';
                    loginBtn.disabled = false;
                }
            };
        }
    }
    
    /**
     * Oculta la pantalla de login
     */
    hideLogin() {
        const appContainer = document.getElementById('app-container');
        const loginContainer = document.getElementById('login-container');
        
        if (loginContainer) loginContainer.style.display = 'none';
        if (appContainer) appContainer.style.display = 'block';
    }
    
    /**
     * Inicia la app (después de login exitoso)
     */
    startApp() {
        console.log('Iniciando app con usuario:', currentUser?.displayName);
        
        // Vincular eventos de los componentes
        this.bindComponentEvents();
        
        // Cargar datos iniciales
        this.loadTransactions();
        
        // Mostrar botón de logout
        this.updateLogoutButton();
    }
    
    /**
     * Actualiza el botón de logout
     */
    updateLogoutButton() {
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn && currentUser) {
            logoutBtn.style.display = 'inline-block';
            logoutBtn.onclick = async () => {
                await window.FirebaseAuth.logout();
            };
            
            // Mostrar nombre del usuario
            const userNameEl = document.getElementById('user-name');
            if (userNameEl) userNameEl.textContent = currentUser.displayName;
            
            const userPhotoEl = document.getElementById('user-photo');
            console.log('photoURL:', currentUser.photoURL);
            console.log('displayName:', currentUser.displayName);
            console.log('userPhotoEl existe:', !!userPhotoEl);
            
            if (userPhotoEl && currentUser.photoURL) {
                // Crear una imagen con las iniciales como backup
                const initials = currentUser.displayName.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
                
                // Probar cargar la imagen
                const img = new Image();
                img.onload = () => {
                    userPhotoEl.src = currentUser.photoURL;
                    console.log('Foto cargada OK');
                };
                img.onerror = () => {
                    // Si falla, mostrar las iniciales
                    console.log('Foto no cargos, mostrando iniciales:', initials);
                    userPhotoEl.alt = initials;
                    userPhotoEl.title = currentUser.displayName;
                };
                img.src = currentUser.photoURL;
                
            } else {
                console.log('Sin photoURL o elemento no existe');
            }
        }
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
     * @param {Object} filters - Filtros opcionales (si no se pasa, obtiene del componente)
     */
    async loadTransactions(filters = null) {
        store.setState({ loading: true, error: null });

        try {
            // Usar filtros pasados o obtener del componente
            if (!filters) {
                filters = this.filters.getFilters();
            }
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
        this.loadTransactions(filters);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
});
