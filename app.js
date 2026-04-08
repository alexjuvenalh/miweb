document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const balanceEl = document.getElementById('balance');
    const totalIncomeEl = document.getElementById('total-income');
    const totalExpenseEl = document.getElementById('total-expense');
    const historyList = document.getElementById('history-list');
    const summaryContainer = document.getElementById('summary-container');
    const expenseChartCanvas = document.getElementById('expense-chart').getContext('2d');

    // Forms
    const incomeForm = document.getElementById('income-form');
    const incomeDescriptionInput = document.getElementById('income-description');
    const incomeAmountInput = document.getElementById('income-amount');

    const expenseForm = document.getElementById('expense-form');
    const expenseDescriptionInput = document.getElementById('expense-description');
    const expenseCategoryInput = document.getElementById('expense-category');
    const expenseAmountInput = document.getElementById('expense-amount');

    // --- App State ---
    let expenses = localStorage.getItem('expenses') ? JSON.parse(localStorage.getItem('expenses')) : [];
    let incomes = localStorage.getItem('incomes') ? JSON.parse(localStorage.getItem('incomes')) : [];
    let expenseChart;

    const categories = [
        "SERVICIOS", "MASCOTAS", "VESTIMENTA Y ACCESORIOS", "TRANSPORTE",
        "EDUCACION Y TRABAJO", "SALUD Y CUIDADO PERSONAL", "ENTRETENIMIENTO",
        "HOGAR", "COMIDA", "OTROS"
    ];
    
    // --- Functions ---

    const generateID = () => Math.floor(Math.random() * 1000000000);
    const updateLocalStorage = () => {
        localStorage.setItem('incomes', JSON.stringify(incomes));
        localStorage.setItem('expenses', JSON.stringify(expenses));
    };

    const addIncome = (e) => {
        e.preventDefault();
        const description = incomeDescriptionInput.value;
        const amount = +incomeAmountInput.value;

        if (description.trim() === '' || amount <= 0) {
            alert('Por favor ingrese una descripción y un monto válido.');
            return;
        }

        const income = { id: generateID(), type: 'income', description, amount, date: new Date() };
        incomes.push(income);
        update();
        incomeDescriptionInput.value = '';
        incomeAmountInput.value = '';
    };

    const addExpense = (e) => {
        e.preventDefault();
        const description = expenseDescriptionInput.value;
        const category = expenseCategoryInput.value;
        const amount = +expenseAmountInput.value;

        if (description.trim() === '' || amount <= 0) {
            alert('Por favor ingrese una descripción y un monto válido.');
            return;
        }

        const expense = { id: generateID(), type: 'expense', description, category, amount, date: new Date() };
        expenses.push(expense);
        update();
        expenseDescriptionInput.value = '';
        expenseAmountInput.value = '';
    };
    
    const deleteItem = (type, id) => {
        if (type === 'income') {
            incomes = incomes.filter(item => item.id !== id);
        } else {
            expenses = expenses.filter(item => item.id !== id);
        }
        update();
    };
    
    const renderHistory = () => {
        historyList.innerHTML = '';
        const allItems = [...incomes, ...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        allItems.forEach(item => {
            const itemEl = document.createElement('div');
            const isPlus = item.type === 'income';
            itemEl.classList.add('history-item', isPlus ? 'plus' : 'minus');
            
            itemEl.innerHTML = `
                <span class="description">${item.description}</span>
                ${!isPlus ? `<span class="category">${item.category}</span>` : ''}
                <span class="amount">S/ ${item.amount.toFixed(2)}</span>
                <button class="delete-btn" onclick="deleteItem('${item.type}', ${item.id})">x</button>
            `;
            historyList.appendChild(itemEl);
        });
    };

    const renderSummary = (expenseTotals) => {
        summaryContainer.innerHTML = '';
        if (Object.keys(expenseTotals).length === 0) {
            summaryContainer.innerHTML = '<p>No hay gastos para resumir.</p>';
            return;
        }
        for (const category in expenseTotals) {
            const summaryItem = document.createElement('div');
            summaryItem.classList.add('summary-item');
            summaryItem.innerHTML = `
                <span>${category}</span>
                <span>S/ ${expenseTotals[category].toFixed(2)}</span>
            `;
            summaryContainer.appendChild(summaryItem);
        }
    };

    const renderChart = (expenseTotals) => {
        const labels = Object.keys(expenseTotals);
        const data = Object.values(expenseTotals);

        if (expenseChart) {
            expenseChart.destroy();
        }

        expenseChart = new Chart(expenseChartCanvas, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Gastos por Categoría',
                    data: data,
                    backgroundColor: [
                        '#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6',
                        '#e67e22', '#1abc9c', '#34495e', '#7f8c8d', '#c0392b'
                    ],
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                    }
                }
            }
        });
    };
    
    const update = () => {
        const totalIncome = incomes.reduce((acc, item) => acc + item.amount, 0);
        const totalExpense = expenses.reduce((acc, item) => acc + item.amount, 0);
        const balance = totalIncome - totalExpense;

        totalIncomeEl.innerText = `S/ ${totalIncome.toFixed(2)}`;
        totalExpenseEl.innerText = `S/ ${totalExpense.toFixed(2)}`;
        balanceEl.innerText = `S/ ${balance.toFixed(2)}`;
        
        const expenseTotals = expenses.reduce((acc, expense) => {
            acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
            return acc;
        }, {});

        renderHistory();
        renderSummary(expenseTotals);
        renderChart(expenseTotals);
        updateLocalStorage();
    };

    const init = () => {
        // Populate categories dropdown
        expenseCategoryInput.innerHTML = categories.map(cat => `<option>${cat}</option>`).join('');
        // Make delete function global
        window.deleteItem = deleteItem;
        // Initial render
        update();
    };

    // --- Event Listeners ---
    incomeForm.addEventListener('submit', addIncome);
    expenseForm.addEventListener('submit', addExpense);

    init();
});
