document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const balanceEl = document.getElementById('balance');
    const totalIncomeEl = document.getElementById('total-income');
    const totalExpenseEl = document.getElementById('total-expense');
    const historyList = document.getElementById('history-list');
    const summaryContainer = document.getElementById('summary-container');
    const expenseChartCanvas = document.getElementById('expense-chart').getContext('2d');
    const typeChartCanvas = document.getElementById('type-chart').getContext('2d');

    // Forms
    const incomeForm = document.getElementById('income-form');
    const incomeDescriptionInput = document.getElementById('income-description');
    const incomeAmountInput = document.getElementById('income-amount');

    const expenseForm = document.getElementById('expense-form');
    const expenseDescriptionInput = document.getElementById('expense-description');
    const expenseCategoryInput = document.getElementById('expense-category');
    const expenseTypeInput = document.getElementById('expense-type');
    const expenseAmountInput = document.getElementById('expense-amount');

    // Filters
    const filterMonth = document.getElementById('filter-month');
    const filterYear = document.getElementById('filter-year');

    // Modal Elements
    const editModal = document.getElementById('edit-modal');
    const editForm = document.getElementById('edit-form');
    const editIdInput = document.getElementById('edit-id');
    const editTypeInput = document.getElementById('edit-type');
    const editDescriptionInput = document.getElementById('edit-description');
    const editCategoryInput = document.getElementById('edit-category');
    const editExpenseTypeInput = document.getElementById('edit-expense-type');
    const editAmountInput = document.getElementById('edit-amount');
    const editExpenseFields = document.getElementById('edit-expense-fields');
    const cancelEditBtn = document.getElementById('cancel-edit');

    // --- App State ---
    let transactions = [];
    let expenseChart;
    let typeChart;
    const API_URL = 'http://localhost:3000/api/transactions';

    const categories = [
        "SERVICIOS", "MASCOTAS", "VESTIMENTA Y ACCESORIOS", "TRANSPORTE",
        "EDUCACION Y TRABAJO", "SALUD Y CUIDADO PERSONAL", "ENTRETENIMIENTO",
        "HOGAR", "COMIDA", "OTROS"
    ];
    
    // --- Functions ---

    const fetchTransactions = async () => {
        try {
            const month = filterMonth.value;
            const year = filterYear.value;
            let url = API_URL;
            if (month || year) {
                const params = new URLSearchParams();
                if (month) params.append('month', month);
                if (year) params.append('year', year);
                url += `?${params.toString()}`;
            }

            const res = await fetch(url);
            transactions = await res.json();
            updateUI();
        } catch (err) {
            console.error('Error fetching transactions:', err);
        }
    };

    const addTransaction = async (data) => {
        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const newTransaction = await res.json();
            transactions.unshift(newTransaction);
            updateUI();
        } catch (err) {
            console.error('Error adding transaction:', err);
        }
    };

    const deleteTransaction = async (id) => {
        try {
            await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            transactions = transactions.filter(t => t.id !== id);
            updateUI();
        } catch (err) {
            console.error('Error deleting transaction:', err);
        }
    };

    const updateTransaction = async (id, data) => {
        try {
            const res = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const updatedTransaction = await res.json();
            transactions = transactions.map(t => t.id === +id ? updatedTransaction : t);
            updateUI();
            closeModal();
        } catch (err) {
            console.error('Error updating transaction:', err);
        }
    };

    const openEditModal = (id) => {
        const t = transactions.find(item => item.id === +id);
        if (!t) return;

        editIdInput.value = t.id;
        editTypeInput.value = t.type;
        editDescriptionInput.value = t.description;
        editAmountInput.value = t.amount;

        if (t.type === 'expense') {
            editExpenseFields.style.display = 'block';
            editCategoryInput.value = t.category;
            editExpenseTypeInput.value = t.expense_type;
        } else {
            editExpenseFields.style.display = 'none';
        }

        editModal.classList.add('show');
    };

    const closeModal = () => {
        editModal.classList.remove('show');
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        const id = editIdInput.value;
        const type = editTypeInput.value;
        const description = editDescriptionInput.value;
        const amount = +editAmountInput.value;
        
        const data = { type, description, amount };
        if (type === 'expense') {
            data.category = editCategoryInput.value;
            data.expense_type = editExpenseTypeInput.value;
        }

        updateTransaction(id, data);
    };

    const handleIncomeSubmit = (e) => {
        e.preventDefault();
        const description = incomeDescriptionInput.value;
        const amount = +incomeAmountInput.value;

        if (description.trim() === '' || amount <= 0) {
            alert('Por favor ingrese una descripción y un monto válido.');
            return;
        }

        addTransaction({ type: 'income', description, amount });
        incomeDescriptionInput.value = '';
        incomeAmountInput.value = '';
    };

    const handleExpenseSubmit = (e) => {
        e.preventDefault();
        const description = expenseDescriptionInput.value;
        const category = expenseCategoryInput.value;
        const expense_type = expenseTypeInput.value;
        const amount = +expenseAmountInput.value;

        if (description.trim() === '' || amount <= 0) {
            alert('Por favor ingrese una descripción y un monto válido.');
            return;
        }

        addTransaction({ type: 'expense', description, category, amount, expense_type });
        expenseDescriptionInput.value = '';
        expenseAmountInput.value = '';
    };
    
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-PE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const renderHistory = () => {
        historyList.innerHTML = '';
        transactions.forEach(item => {
            const itemEl = document.createElement('div');
            const isPlus = item.type === 'income';
            itemEl.classList.add('history-item', isPlus ? 'plus' : 'minus');
            
            itemEl.innerHTML = `
                <div class="history-info">
                    <span class="description">${item.description}</span>
                    <small class="date">${formatDate(item.created_at)}</small>
                    ${!isPlus ? `<span class="category-tag">${item.category} (${item.expense_type})</span>` : ''}
                </div>
                <div class="history-actions">
                    <span class="amount">S/ ${parseFloat(item.amount).toFixed(2)}</span>
                    <button class="edit-btn" data-id="${item.id}">✎</button>
                    <button class="delete-btn" data-id="${item.id}">x</button>
                </div>
            `;
            historyList.appendChild(itemEl);
        });
    };

    const renderSummary = (expenseTotals, typeTotals) => {
        summaryContainer.innerHTML = '<h3>Por Categoría</h3>';
        
        if (Object.keys(expenseTotals).length === 0) {
            summaryContainer.innerHTML += '<p>No hay gastos para resumir.</p>';
        } else {
            for (const category in expenseTotals) {
                const summaryItem = document.createElement('div');
                summaryItem.classList.add('summary-item');
                summaryItem.innerHTML = `
                    <span>${category}</span>
                    <span>S/ ${expenseTotals[category].toFixed(2)}</span>
                `;
                summaryContainer.appendChild(summaryItem);
            }
        }

        summaryContainer.innerHTML += '<h3 style="margin-top:20px">Por Tipo</h3>';
        for (const type in typeTotals) {
            const summaryItem = document.createElement('div');
            summaryItem.classList.add('summary-item');
            summaryItem.innerHTML = `
                <span>${type.toUpperCase()}</span>
                <span>S/ ${typeTotals[type].toFixed(2)}</span>
            `;
            summaryContainer.appendChild(summaryItem);
        }
    };

    const renderCharts = (expenseTotals, typeTotals) => {
        // Expense Chart
        if (expenseChart) expenseChart.destroy();
        expenseChart = new Chart(expenseChartCanvas, {
            type: 'doughnut',
            data: {
                labels: Object.keys(expenseTotals),
                datasets: [{
                    data: Object.values(expenseTotals),
                    backgroundColor: ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6', '#e67e22', '#1abc9c', '#34495e', '#7f8c8d', '#c0392b']
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });

        // Type Chart
        if (typeChart) typeChart.destroy();
        typeChart = new Chart(typeChartCanvas, {
            type: 'pie',
            data: {
                labels: Object.keys(typeTotals).map(t => t.charAt(0).toUpperCase() + t.slice(1)),
                datasets: [{
                    data: Object.values(typeTotals),
                    backgroundColor: ['#f39c12', '#8e44ad']
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    };
    
    const updateUI = () => {
        const incomes = transactions.filter(t => t.type === 'income');
        const expenses = transactions.filter(t => t.type === 'expense');

        const totalIncome = incomes.reduce((acc, item) => acc + parseFloat(item.amount), 0);
        const totalExpense = expenses.reduce((acc, item) => acc + parseFloat(item.amount), 0);
        const balance = totalIncome - totalExpense;

        totalIncomeEl.innerText = `S/ ${totalIncome.toFixed(2)}`;
        totalExpenseEl.innerText = `S/ ${totalExpense.toFixed(2)}`;
        balanceEl.innerText = `S/ ${balance.toFixed(2)}`;
        
        const expenseTotals = expenses.reduce((acc, expense) => {
            acc[expense.category] = (acc[expense.category] || 0) + parseFloat(expense.amount);
            return acc;
        }, {});

        const typeTotals = expenses.reduce((acc, expense) => {
            acc[expense.expense_type] = (acc[expense.expense_type] || 0) + parseFloat(expense.amount);
            return acc;
        }, { variable: 0, fijo: 0 });

        renderHistory();
        renderSummary(expenseTotals, typeTotals);
        renderCharts(expenseTotals, typeTotals);
    };

    const init = () => {
        expenseCategoryInput.innerHTML = categories.map(cat => `<option>${cat}</option>`).join('');
        editCategoryInput.innerHTML = categories.map(cat => `<option>${cat}</option>`).join('');
        
        // Event Delegation for delete/edit buttons
        historyList.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            if (e.target.classList.contains('delete-btn')) {
                deleteTransaction(id);
            } else if (e.target.classList.contains('edit-btn')) {
                openEditModal(id);
            }
        });

        incomeForm.addEventListener('submit', handleIncomeSubmit);
        expenseForm.addEventListener('submit', handleExpenseSubmit);
        editForm.addEventListener('submit', handleEditSubmit);
        cancelEditBtn.addEventListener('click', closeModal);

        filterMonth.addEventListener('change', fetchTransactions);
        filterYear.addEventListener('change', fetchTransactions);

        fetchTransactions();
    };

    init();
});
