/**
 * Componente de Formularios de Transacción
 * Maneja la creación de ingresos y gastos
 */

import { isValidAmount, escapeHtml } from '../utils/formatters.js';

const CATEGORIES = [
    "SERVICIOS", "MASCOTAS", "VESTIMENTA Y ACCESORIOS", "TRANSPORTE",
    "EDUCACION Y TRABAJO", "SALUD Y CUIDADO PERSONAL", "ENTRETENIMIENTO",
    "HOGAR", "COMIDA", "OTROS"
];

class TransactionFormComponent {
    constructor() {
        this.incomeForm = document.getElementById('income-form');
        this.expenseForm = document.getElementById('expense-form');
        
        // Elements del formulario de ingreso
        this.incomeDescription = document.getElementById('income-description');
        this.incomeAmount = document.getElementById('income-amount');
        
        // Elements del formulario de gasto
        this.expenseDescription = document.getElementById('expense-description');
        this.expenseCategory = document.getElementById('expense-category');
        this.expenseType = document.getElementById('expense-type');
        this.expenseAmount = document.getElementById('expense-amount');
        
        // Callbacks
        this.onIncomeSubmit = null;
        this.onExpenseSubmit = null;
        
        this.init();
    }
    
    /**
     * Inicializa el componente
     */
    init() {
        this.populateCategories();
        this.bindEvents();
    }
    
    /**
     * Llena el select de categorías
     */
    populateCategories() {
        const options = CATEGORIES.map(cat => `<option>${escapeHtml(cat)}</option>`).join('');
        this.expenseCategory.innerHTML = options;
    }
    
    /**
     * Vincula eventos a los formularios
     */
    bindEvents() {
        if (this.incomeForm) {
            this.incomeForm.addEventListener('submit', (e) => this.handleIncomeSubmit(e));
        }
        
        if (this.expenseForm) {
            this.expenseForm.addEventListener('submit', (e) => this.handleExpenseSubmit(e));
        }
    }
    
    /**
     * Maneja el submit del formulario de ingreso
     * @param {Event} e 
     */
    handleIncomeSubmit(e) {
        e.preventDefault();
        
        const description = this.incomeDescription.value.trim();
        const amount = parseFloat(this.incomeAmount.value);
        
        if (description === '' || !isValidAmount(amount)) {
            this.showAlert('Por favor ingrese una descripción y un monto válido.');
            return;
        }
        
        const data = {
            type: 'income',
            description,
            amount
        };
        
        if (this.onIncomeSubmit) {
            this.onIncomeSubmit(data);
        }
        
        this.incomeDescription.value = '';
        this.incomeAmount.value = '';
    }
    
    /**
     * Maneja el submit del formulario de gasto
     * @param {Event} e 
     */
    handleExpenseSubmit(e) {
        e.preventDefault();
        
        const description = this.expenseDescription.value.trim();
        const category = this.expenseCategory.value;
        const expense_type = this.expenseType.value;
        const amount = parseFloat(this.expenseAmount.value);
        
        if (description === '' || !isValidAmount(amount)) {
            this.showAlert('Por favor ingrese una descripción y un monto válido.');
            return;
        }
        
        const data = {
            type: 'expense',
            description,
            category,
            expense_type,
            amount
        };
        
        if (this.onExpenseSubmit) {
            this.onExpenseSubmit(data);
        }
        
        this.expenseDescription.value = '';
        this.expenseAmount.value = '';
    }
    
    /**
     * Muestra una alerta
     * @param {string} message 
     */
    showAlert(message) {
        alert(message);
    }
    
    /**
     * Limpia los formularios
     */
    reset() {
        if (this.incomeForm) this.incomeForm.reset();
        if (this.expenseForm) this.expenseForm.reset();
    }
}

export { CATEGORIES };
export default TransactionFormComponent;
