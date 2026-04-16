/**
 * Componente de Filtros
 * Permite filtrar transacciones por mes y año
 */

import { getMonthName, getAvailableYears, escapeHtml } from '../utils/formatters.js';

class FilterComponent {
    constructor() {
        this.monthSelect = document.getElementById('filter-month');
        this.yearSelect = document.getElementById('filter-year');
        
        // Callback
        this.onChange = null;
        
        this.init();
    }
    
    /**
     * Inicializa el componente
     */
    init() {
        this.populateOptions();
        this.bindEvents();
    }
    
    /**
     * Llena las opciones de los selects
     */
    populateOptions() {
        // Meses
        const monthOptions = ['<option value="">Mes (Todos)</option>'];
        for (let i = 1; i <= 12; i++) {
            const monthName = getMonthName(i);
            monthOptions.push(`<option value="${i}">${monthName}</option>`);
        }
        this.monthSelect.innerHTML = monthOptions.join('');
        
        // Años
        const yearOptions = ['<option value="">Año (Todos)</option>'];
        getAvailableYears().forEach(year => {
            yearOptions.push(`<option value="${year}">${year}</option>`);
        });
        this.yearSelect.innerHTML = yearOptions.join('');
    }
    
    /**
     * Vincula eventos
     */
    bindEvents() {
        if (this.monthSelect) {
            this.monthSelect.addEventListener('change', () => this.handleChange());
        }
        
        if (this.yearSelect) {
            this.yearSelect.addEventListener('change', () => this.handleChange());
        }
    }
    
    /**
     * Maneja el cambio de filtro
     */
    handleChange() {
        const filters = {
            month: this.monthSelect.value || null,
            year: this.yearSelect.value || null
        };
        
        if (this.onChange) {
            this.onChange(filters);
        }
    }
    
    /**
     * Obtiene los filtros actuales
     * @returns {Object} { month, year }
     */
    getFilters() {
        return {
            month: this.monthSelect.value || null,
            year: this.yearSelect.value || null
        };
    }
    
    /**
     * Establece los filtros
     * @param {Object} filters 
     */
    setFilters(filters) {
        if (filters.month) {
            this.monthSelect.value = filters.month;
        } else {
            this.monthSelect.value = '';
        }
        
        if (filters.year) {
            this.yearSelect.value = filters.year;
        } else {
            this.yearSelect.value = '';
        }
    }
    
    /**
     * Limpia los filtros
     */
    reset() {
        this.monthSelect.value = '';
        this.yearSelect.value = '';
    }
}

export default FilterComponent;
