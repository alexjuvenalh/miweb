/**
 * Componente de Modal de Edición
 * Permite editar transacciones existentes
 */

import { CATEGORIES } from './TransactionFormComponent.js';
import { escapeHtml } from '../utils/formatters.js';

class EditModalComponent {
    constructor() {
        this.modal = document.getElementById('edit-modal');
        this.form = document.getElementById('edit-form');
        
        // Elements del formulario
        this.idInput = document.getElementById('edit-id');
        this.typeInput = document.getElementById('edit-type');
        this.descriptionInput = document.getElementById('edit-description');
        this.amountInput = document.getElementById('edit-amount');
        this.categoryInput = document.getElementById('edit-category');
        this.expenseTypeInput = document.getElementById('edit-expense-type');
        this.expenseFields = document.getElementById('edit-expense-fields');
        this.cancelBtn = document.getElementById('cancel-edit');
        
        // Callback
        this.onSave = null;
        this.onCancel = null;
        
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
        this.categoryInput.innerHTML = options;
    }
    
    /**
     * Vincula eventos
     */
    bindEvents() {
        // Submit del formulario
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
        
        // Botón cancelar
        if (this.cancelBtn) {
            this.cancelBtn.addEventListener('click', () => this.close());
        }
        
        // Cerrar modal al hacer click fuera
        if (this.modal) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.close();
                }
            });
        }
        
        // Tecla Escape para cerrar
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen()) {
                this.close();
            }
        });
    }
    
    /**
     * Abre el modal con los datos de una transacción
     * @param {Object} transaction - Transacción a editar
     */
    open(transaction) {
        if (!this.modal) return;
        
        // Llenar el formulario
        this.idInput.value = transaction.id;
        this.typeInput.value = transaction.type;
        this.descriptionInput.value = transaction.description;
        this.amountInput.value = transaction.amount;
        
        // Mostrar/ocultar campos de gasto según el tipo
        if (transaction.type === 'expense') {
            this.expenseFields.style.display = 'block';
            this.categoryInput.value = transaction.category;
            this.expenseTypeInput.value = transaction.expense_type;
        } else {
            this.expenseFields.style.display = 'none';
        }
        
        // Mostrar el modal
        this.modal.classList.add('show');
    }
    
    /**
     * Cierra el modal
     */
    close() {
        if (!this.modal) return;
        
        this.modal.classList.remove('show');
        
        if (this.onCancel) {
            this.onCancel();
        }
    }
    
    /**
     * Verifica si el modal está abierto
     * @returns {boolean}
     */
    isOpen() {
        return this.modal && this.modal.classList.contains('show');
    }
    
    /**
     * Maneja el submit del formulario
     * @param {Event} e 
     */
    handleSubmit(e) {
        e.preventDefault();
        
        const id = this.idInput.value;
        const type = this.typeInput.value;
        const description = this.descriptionInput.value.trim();
        const amount = parseFloat(this.amountInput.value);
        
        if (description === '' || isNaN(amount) || amount <= 0) {
            alert('Por favor complete todos los campos correctamente.');
            return;
        }
        
        const data = {
            type,
            description,
            amount
        };
        
        // Agregar campos de gasto si es expense
        if (type === 'expense') {
            data.category = this.categoryInput.value;
            data.expense_type = this.expenseTypeInput.value;
        }
        
        if (this.onSave) {
            this.onSave(id, data);
        }
        
        this.close();
    }
}

export default EditModalComponent;
