/**
 * Componente de Historial de Transacciones
 * Muestra la lista de transacciones con acciones
 */

import { formatCurrency, formatDate, getTypeClasses, escapeHtml } from '../utils/formatters.js';

class HistoryListComponent {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        
        // Callbacks
        this.onEdit = null;
        this.onDelete = null;
    }
    
    /**
     * Renderiza la lista de transacciones
     * @param {Array} transactions - Array de transacciones
     */
    render(transactions) {
        if (!this.container) return;
        
        this.container.innerHTML = '';
        
        if (transactions.length === 0) {
            this.container.innerHTML = '<p class="no-data">No hay transacciones registradas.</p>';
            return;
        }
        
        transactions.forEach(item => {
            const itemEl = this.createTransactionElement(item);
            this.container.appendChild(itemEl);
        });
    }
    
    /**
     * Crea el elemento HTML para una transacción
     * @param {Object} item - Transacción
     * @returns {HTMLElement} Elemento creado
     */
    createTransactionElement(item) {
        const itemEl = document.createElement('div');
        const typeClass = getTypeClasses(item.type);
        itemEl.classList.add('history-item', typeClass);
        
        const isPlus = item.type === 'income';
        const isExpense = item.type === 'expense';
        
        itemEl.innerHTML = `
            <div class="history-info">
                <span class="description">${escapeHtml(item.description)}</span>
                <small class="date">${formatDate(item.created_at)}</small>
                ${isExpense ? `<span class="category-tag">${escapeHtml(item.category)} (${escapeHtml(item.expense_type)})</span>` : ''}
            </div>
            <div class="history-actions">
                <span class="amount ${typeClass}">${formatCurrency(item.amount)}</span>
                <button class="edit-btn" data-id="${item.id}" title="Editar">✎</button>
                <button class="delete-btn" data-id="${item.id}" title="Eliminar">×</button>
            </div>
        `;
        
        // Event listeners para los botones
        const editBtn = itemEl.querySelector('.edit-btn');
        const deleteBtn = itemEl.querySelector('.delete-btn');
        
        if (editBtn && this.onEdit) {
            editBtn.addEventListener('click', () => this.onEdit(item));
        }
        
        if (deleteBtn && this.onDelete) {
            deleteBtn.addEventListener('click', () => {
                if (confirm('¿Está seguro de eliminar esta transacción?')) {
                    this.onDelete(item.id);
                }
            });
        }
        
        return itemEl;
    }
    
    /**
     * Agrega una transacción al inicio de la lista (sin re-render completo)
     * @param {Object} transaction - Transacción a agregar
     */
    prependTransaction(transaction) {
        if (!this.container) return;
        
        // Remover mensaje de "no data" si existe
        const noData = this.container.querySelector('.no-data');
        if (noData) {
            noData.remove();
        }
        
        const itemEl = this.createTransactionElement(transaction);
        this.container.prepend(itemEl);
    }
    
    /**
     * Elimina una transacción de la lista
     * @param {number} id - ID de la transacción
     */
    removeTransaction(id) {
        if (!this.container) return;
        
        const item = this.container.querySelector(`[data-id="${id}"]`);
        if (item) {
            item.remove();
        }
        
        // Mostrar mensaje si no hay más transacciones
        if (this.container.children.length === 0) {
            this.container.innerHTML = '<p class="no-data">No hay transacciones registradas.</p>';
        }
    }
}

export default HistoryListComponent;
