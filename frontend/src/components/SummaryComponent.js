/**
 * Componente de Resumen
 * Muestra los totales por categoría y por tipo
 */

import { formatCurrency, escapeHtml } from '../utils/formatters.js';

class SummaryComponent {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
    }
    
    /**
     * Renderiza el resumen
     * @param {Object} expenseTotals - Totales por categoría
     * @param {Object} typeTotals - Totales por tipo
     */
    render(expenseTotals, typeTotals) {
        if (!this.container) return;
        
        let html = '';
        
        // Resumen por categoría
        html += '<h3>Por Categoría</h3>';
        
        const categories = Object.keys(expenseTotals);
        if (categories.length === 0) {
            html += '<p class="no-data">No hay gastos para resumir.</p>';
        } else {
            // Ordenar por monto descendente
            const sortedCategories = categories.sort((a, b) => 
                expenseTotals[b] - expenseTotals[a]
            );
            
            sortedCategories.forEach(category => {
                html += `
                    <div class="summary-item">
                        <span>${escapeHtml(category)}</span>
                        <span>${formatCurrency(expenseTotals[category])}</span>
                    </div>
                `;
            });
        }
        
        // Resumen por tipo
        html += '<h3>Por Tipo</h3>';
        
        const types = Object.keys(typeTotals).filter(type => typeTotals[type] > 0);
        if (types.length === 0) {
            html += '<p class="no-data">No hay gastos registrados.</p>';
        } else {
            types.forEach(type => {
                const typeName = type.charAt(0).toUpperCase() + type.slice(1);
                html += `
                    <div class="summary-item">
                        <span>${typeName}</span>
                        <span>${formatCurrency(typeTotals[type])}</span>
                    </div>
                `;
            });
        }
        
        this.container.innerHTML = html;
    }
    
    /**
     * Limpia el resumen
     */
    clear() {
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

export default SummaryComponent;
