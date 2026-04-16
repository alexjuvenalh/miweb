/**
 * Componente de Gráficos
 * Renderiza gráficos de dona y pastel usando Chart.js
 */

class ChartsComponent {
    constructor() {
        this.expenseChartCanvas = document.getElementById('expense-chart');
        this.typeChartCanvas = document.getElementById('type-chart');
        
        this.expenseChart = null;
        this.typeChart = null;
        
        // Colores para los gráficos
        this.expenseColors = [
            '#e74c3c', '#3498db', '#2ecc71', '#f1c40f', 
            '#9b59b6', '#e67e22', '#1abc9c', '#34495e', 
            '#7f8c8d', '#c0392b'
        ];
        
        this.typeColors = ['#f39c12', '#8e44ad'];
    }
    
    /**
     * Renderiza los gráficos con los datos proporcionados
     * @param {Object} expenseTotals - Totales por categoría
     * @param {Object} typeTotals - Totales por tipo (variable/fijo)
     */
    render(expenseTotals, typeTotals) {
        this.renderExpenseChart(expenseTotals);
        this.renderTypeChart(typeTotals);
    }
    
    /**
     * Renderiza el gráfico de gastos por categoría
     * @param {Object} expenseTotals - { categoryName: total }
     */
    renderExpenseChart(expenseTotals) {
        if (!this.expenseChartCanvas) return;
        
        const ctx = this.expenseChartCanvas.getContext('2d');
        const labels = Object.keys(expenseTotals);
        const data = Object.values(expenseTotals);
        
        // Destruir gráfico anterior si existe
        if (this.expenseChart) {
            this.expenseChart.destroy();
        }
        
        // Crear nuevo gráfico
        this.expenseChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: this.expenseColors.slice(0, labels.length)
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 10,
                            usePointStyle: true
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Renderiza el gráfico de tipo de gasto (fijo vs variable)
     * @param {Object} typeTotals - { variable: total, fijo: total }
     */
    renderTypeChart(typeTotals) {
        if (!this.typeChartCanvas) return;
        
        const ctx = this.typeChartCanvas.getContext('2d');
        
        // Filtrar solo los que tienen valores > 0
        const labels = [];
        const data = [];
        const colors = [];
        
        if (typeTotals.variable > 0) {
            labels.push('Variable');
            data.push(typeTotals.variable);
            colors.push(this.typeColors[0]);
        }
        
        if (typeTotals.fijo > 0) {
            labels.push('Fijo');
            data.push(typeTotals.fijo);
            colors.push(this.typeColors[1]);
        }
        
        // Si no hay datos, no mostrar gráfico
        if (data.length === 0) {
            labels.push('Sin datos');
            data.push(1);
            colors.push('#e0e0e0');
        }
        
        // Destruir gráfico anterior si existe
        if (this.typeChart) {
            this.typeChart.destroy();
        }
        
        // Crear nuevo gráfico
        this.typeChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 10,
                            usePointStyle: true
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Actualiza los gráficos con nuevos datos
     * @param {Object} expenseTotals 
     * @param {Object} typeTotals 
     */
    update(expenseTotals, typeTotals) {
        this.render(expenseTotals, typeTotals);
    }
    
    /**
     * Destruye los gráficos
     */
    destroy() {
        if (this.expenseChart) {
            this.expenseChart.destroy();
            this.expenseChart = null;
        }
        if (this.typeChart) {
            this.typeChart.destroy();
            this.typeChart = null;
        }
    }
}

export default ChartsComponent;
