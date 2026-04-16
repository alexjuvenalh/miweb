/**
 * Componente de Balance
 * Muestra los totales de ingresos, gastos y saldo
 */

import { formatCurrency } from '../utils/formatters.js';

class BalanceComponent {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.elements = {
            balance: document.getElementById('balance'),
            totalIncome: document.getElementById('total-income'),
            totalExpense: document.getElementById('total-expense')
        };
    }
    
    /**
     * Actualiza los valores del balance
     * @param {Object} totals - { totalIncome, totalExpense, balance }
     */
    render(totals) {
        const { totalIncome, totalExpense, balance } = totals;
        
        this.elements.balance.innerText = formatCurrency(balance);
        this.elements.totalIncome.innerText = formatCurrency(totalIncome);
        this.elements.totalExpense.innerText = formatCurrency(totalExpense);
        
        // Colorear el balance según sea positivo o negativo
        this.elements.balance.style.color = balance >= 0 ? 'var(--balance-color)' : 'var(--minus-color)';
    }
}

export default BalanceComponent;
