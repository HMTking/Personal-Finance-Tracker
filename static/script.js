// Global variables
let transactions = [];
let filteredTransactions = []; // Store filtered transactions
let pieChart = null;
let barChart = null;
let currentChartType = 'expense'; // Track current pie chart type
let summaryData = null; // Store summary data for chart toggling
let dateFilter = { startDate: null, endDate: null }; // Store date filter

// Categories for income and expenses
const categories = {
    income: [
        'Salary',
        'Freelance',
        'Business',
        'Investment',
        'Gift',
        'Other Income'
    ],
    expense: [
        'Food & Dining',
        'Transportation',
        'Shopping',
        'Entertainment',
        'Bills & Utilities',
        'Healthcare',
        'Education',
        'Travel',
        'Insurance',
        'Other Expense'
    ]
};

// DOM elements
const form = document.getElementById('transaction-form');
const typeSelect = document.getElementById('type');
const categorySelect = document.getElementById('category');
const dateInput = document.getElementById('date');
const transactionsBody = document.getElementById('transactions-body');
const loadingDiv = document.getElementById('loading');
const toast = document.getElementById('toast');

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    // Set today's date as default
    dateInput.value = new Date().toISOString().split('T')[0];
    
    // Setup event listeners
    setupEventListeners();
    
    // Load initial data
    loadTransactions();
    loadSummary();
});

function setupEventListeners() {
    // Form submission
    form.addEventListener('submit', handleAddTransaction);
    
    // Type change event to update categories
    typeSelect.addEventListener('change', updateCategories);
    
    // Chart toggle buttons
    document.getElementById('toggle-income').addEventListener('click', () => toggleChart('income'));
    document.getElementById('toggle-expense').addEventListener('click', () => toggleChart('expense'));
    
    // Date filter buttons
    document.getElementById('apply-filter').addEventListener('click', applyDateFilter);
    document.getElementById('clear-filter').addEventListener('click', clearDateFilter);
}

function updateCategories() {
    const selectedType = typeSelect.value;
    const categoryOptions = categories[selectedType] || [];
    
    // Clear existing options
    categorySelect.innerHTML = '<option value="">Select Category</option>';
    
    // Add new options
    categoryOptions.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });
}

async function handleAddTransaction(e) {
    e.preventDefault();
    
    const formData = new FormData(form);
    const transactionData = {
        amount: parseFloat(document.getElementById('amount').value),
        type: document.getElementById('type').value,
        category: document.getElementById('category').value,
        date: document.getElementById('date').value,
        description: document.getElementById('description').value
    };
    
    try {
        showLoading(true);
        
        const response = await fetch('/api/transactions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(transactionData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showToast('Transaction added successfully!', 'success');
            form.reset();
            dateInput.value = new Date().toISOString().split('T')[0];
            categorySelect.innerHTML = '<option value="">Select Category</option>';
            
            // Reload data
            await loadTransactions();
            await loadSummary();
        } else {
            showToast(result.error || 'Failed to add transaction', 'error');
        }
    } catch (error) {
        console.error('Error adding transaction:', error);
        showToast('Network error. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

async function loadTransactions() {
    try {
        const response = await fetch('/api/transactions');
        transactions = await response.json();
        
        // Apply current filter if any
        applyCurrentFilter();
        
        renderTransactions();
    } catch (error) {
        console.error('Error loading transactions:', error);
        showToast('Failed to load transactions', 'error');
    }
}

function applyCurrentFilter() {
    if (dateFilter.startDate || dateFilter.endDate) {
        filteredTransactions = transactions.filter(transaction => {
            const transactionDate = new Date(transaction.date);
            const start = dateFilter.startDate ? new Date(dateFilter.startDate) : null;
            const end = dateFilter.endDate ? new Date(dateFilter.endDate) : null;
            
            if (start && end) {
                return transactionDate >= start && transactionDate <= end;
            } else if (start) {
                return transactionDate >= start;
            } else if (end) {
                return transactionDate <= end;
            }
            return true;
        });
    } else {
        filteredTransactions = [...transactions];
    }
}

function applyDateFilter() {
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;
    
    if (!startDate && !endDate) {
        showToast('Please select at least one date', 'error');
        return;
    }
    
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
        showToast('Start date cannot be after end date', 'error');
        return;
    }
    
    dateFilter.startDate = startDate;
    dateFilter.endDate = endDate;
    
    // Apply filter and update displays
    applyCurrentFilter();
    renderTransactions();
    calculateFilteredSummary();
    
    showToast('Date filter applied successfully', 'success');
}

function clearDateFilter() {
    document.getElementById('start-date').value = '';
    document.getElementById('end-date').value = '';
    
    dateFilter.startDate = null;
    dateFilter.endDate = null;
    
    // Reset to show all transactions
    filteredTransactions = [...transactions];
    renderTransactions();
    calculateFilteredSummary();
    
    showToast('Date filter cleared', 'success');
}

function renderTransactions() {
    transactionsBody.innerHTML = '';
    
    const dataToRender = filteredTransactions.length > 0 || dateFilter.startDate || dateFilter.endDate 
        ? filteredTransactions 
        : transactions;
    
    if (dataToRender.length === 0) {
        const message = dateFilter.startDate || dateFilter.endDate 
            ? 'No transactions found for the selected date range.'
            : 'No transactions yet. Add your first transaction above!';
            
        transactionsBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; color: #666; padding: 20px;">
                    ${message}
                </td>
            </tr>
        `;
        return;
    }
    
    dataToRender.forEach(transaction => {
        const row = document.createElement('tr');
        const formattedDate = new Date(transaction.date).toLocaleDateString();
        const typeClass = transaction.type === 'income' ? 'income' : 'expense';
        const typeSymbol = transaction.type === 'income' ? '+' : '-';
        
        row.innerHTML = `
            <td>${formattedDate}</td>
            <td><span class="${typeClass}">${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}</span></td>
            <td>${transaction.category}</td>
            <td class="${typeClass}">${typeSymbol}₹${transaction.amount.toFixed(2)}</td>
            <td>${transaction.description || '-'}</td>
            <td>
                <button class="btn-delete" onclick="deleteTransaction(${transaction.id})">
                    Delete
                </button>
            </td>
        `;
        
        transactionsBody.appendChild(row);
    });
}

async function deleteTransaction(id) {
    if (!confirm('Are you sure you want to delete this transaction?')) {
        return;
    }
    
    try {
        showLoading(true);
        
        const response = await fetch(`/api/transactions/${id}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showToast('Transaction deleted successfully!', 'success');
            
            // Reload data
            await loadTransactions();
            await loadSummary();
        } else {
            showToast(result.error || 'Failed to delete transaction', 'error');
        }
    } catch (error) {
        console.error('Error deleting transaction:', error);
        showToast('Network error. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

async function loadSummary() {
    try {
        const response = await fetch('/api/summary');
        summaryData = await response.json();
        
        // Initialize filtered transactions if not done already
        if (filteredTransactions.length === 0 && transactions.length > 0) {
            filteredTransactions = [...transactions];
        }
        
        // Update summary cards based on current filter
        if (dateFilter.startDate || dateFilter.endDate) {
            calculateFilteredSummary();
        } else {
            updateSummaryCards(summaryData);
            updateCharts(summaryData);
        }
        
    } catch (error) {
        console.error('Error loading summary:', error);
        showToast('Failed to load summary', 'error');
    }
}

function calculateFilteredSummary() {
    const dataToCalculate = filteredTransactions;
    
    // Calculate totals from filtered data
    const totalIncome = dataToCalculate
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = dataToCalculate
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const currentBalance = totalIncome - totalExpenses;
    
    // Calculate categories from filtered data
    const expensesByCategory = {};
    const incomeByCategory = {};
    
    dataToCalculate.forEach(transaction => {
        if (transaction.type === 'expense') {
            expensesByCategory[transaction.category] = 
                (expensesByCategory[transaction.category] || 0) + transaction.amount;
        } else {
            incomeByCategory[transaction.category] = 
                (incomeByCategory[transaction.category] || 0) + transaction.amount;
        }
    });
    
    // Convert to array format
    const expensesArray = Object.entries(expensesByCategory)
        .map(([category, total]) => ({ category, total }))
        .sort((a, b) => b.total - a.total);
    
    const incomeArray = Object.entries(incomeByCategory)
        .map(([category, total]) => ({ category, total }))
        .sort((a, b) => b.total - a.total);
    
    const filteredSummary = {
        total_income: totalIncome,
        total_expenses: totalExpenses,
        current_balance: currentBalance,
        expenses_by_category: expensesArray,
        income_by_category: incomeArray
    };
    
    // Update displays
    updateSummaryCards(filteredSummary);
    updateCharts(filteredSummary);
}

function updateSummaryCards(summary) {
    // Update summary cards
    document.getElementById('total-income').textContent = `₹${summary.total_income.toFixed(2)}`;
    document.getElementById('total-expenses').textContent = `₹${summary.total_expenses.toFixed(2)}`;
    
    const balanceElement = document.getElementById('current-balance');
    balanceElement.textContent = `₹${summary.current_balance.toFixed(2)}`;
    
    // Color the balance based on positive/negative
    if (summary.current_balance >= 0) {
        balanceElement.style.color = '#4CAF50';
    } else {
        balanceElement.style.color = '#f44336';
    }
}

function updateCharts(summary) {
    // Store current summary for chart toggling
    summaryData = summary;
    updatePieChart();
    updateBarChart(summary);
}

function toggleChart(type) {
    currentChartType = type;
    
    // Update button states
    document.getElementById('toggle-income').classList.remove('active');
    document.getElementById('toggle-expense').classList.remove('active');
    document.getElementById(`toggle-${type}`).classList.add('active');
    
    // Update chart title
    const title = document.getElementById('pie-chart-title');
    title.textContent = type === 'income' ? 'Income by Category' : 'Expenses by Category';
    
    // Update pie chart
    updatePieChart();
}

function updatePieChart() {
    const ctx = document.getElementById('pie-chart').getContext('2d');
    
    // Destroy existing chart
    if (pieChart) {
        pieChart.destroy();
    }
    
    if (!summaryData) {
        return;
    }
    
    // Get data based on current chart type
    const categoryData = currentChartType === 'income' 
        ? summaryData.income_by_category 
        : summaryData.expenses_by_category;
    
    if (categoryData.length === 0) {
        // Show "No data" message
        ctx.font = '16px Arial';
        ctx.fillStyle = '#666';
        ctx.textAlign = 'center';
        ctx.fillText(
            `No ${currentChartType} data available`, 
            ctx.canvas.width / 2, 
            ctx.canvas.height / 2
        );
        return;
    }
    
    const labels = categoryData.map(item => item.category);
    const data = categoryData.map(item => item.total);
    
    // Generate colors based on chart type
    const colors = currentChartType === 'income' 
        ? generateIncomeColors(labels.length)
        : generateExpenseColors(labels.length);
    
    pieChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${context.label}: ₹${value.toFixed(2)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

function updateBarChart(summary) {
    const ctx = document.getElementById('bar-chart').getContext('2d');
    
    // Destroy existing chart
    if (barChart) {
        barChart.destroy();
    }
    
    barChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Income', 'Expenses', 'Balance'],
            datasets: [{
                label: 'Amount (₹)',
                data: [
                    summary.total_income,
                    summary.total_expenses,
                    Math.abs(summary.current_balance)
                ],
                backgroundColor: [
                    '#4CAF50',
                    '#f44336',
                    summary.current_balance >= 0 ? '#2196F3' : '#FF9800'
                ],
                borderWidth: 0,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let value = context.parsed.y;
                            if (context.dataIndex === 2) { // Balance
                                value = summary.current_balance;
                            }
                            return `${context.label}: ₹${value.toFixed(2)}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₹' + value.toFixed(0);
                        }
                    }
                }
            }
        }
    });
}

function generateColors(count) {
    // General high-contrast color palette with distinct colors
    const colors = [
        '#FF6384', // Pink/Red
        '#36A2EB', // Blue
        '#FFCE56', // Yellow
        '#4BC0C0', // Teal
        '#9966FF', // Purple
        '#FF9F40', // Orange
        '#FF6384', // Pink (repeat for more categories)
        '#C9CBCF', // Grey
        '#4BC0C0', // Teal (repeat)
        '#E7E9ED', // Light grey
        '#71B37C', // Green
        '#B19CD9'  // Light purple
    ];
    
    return colors.slice(0, count);
}

function generateIncomeColors(count) {
    // Distinct color palette for income categories - mix of greens, blues, and positive colors
    const incomeColors = [
        '#4CAF50', // Green - Primary income color
        '#2196F3', // Blue - Secondary income
        '#00BCD4', // Cyan - Freelance/side income
        '#8BC34A', // Light green - Business income
        '#3F51B5', // Indigo - Investment income
        '#009688', // Teal - Gift/bonus
        '#4FC3F7', // Light blue - Other income
        '#66BB6A', // Medium green
        '#42A5F5', // Medium blue
        '#26C6DA', // Light cyan
        '#7986CB', // Light indigo
        '#4DB6AC'  // Medium teal
    ];
    
    return incomeColors.slice(0, count);
}

function generateExpenseColors(count) {
    // Distinct color palette for expense categories - mix of reds, oranges, and warm colors
    const expenseColors = [
        '#f44336', // Red - Primary expense color
        '#FF9800', // Orange - Food & dining
        '#E91E63', // Pink - Shopping
        '#9C27B0', // Purple - Entertainment
        '#FF5722', // Deep orange - Transportation
        '#795548', // Brown - Bills & utilities
        '#607D8B', // Blue grey - Healthcare
        '#FFC107', // Amber - Education
        '#FF6F00', // Orange accent - Travel
        '#8E24AA', // Purple accent - Insurance
        '#D32F2F', // Dark red - Other expenses
        '#F57C00'  // Orange darken - Miscellaneous
    ];
    
    return expenseColors.slice(0, count);
}

function showLoading(show) {
    if (show) {
        loadingDiv.classList.remove('hidden');
    } else {
        loadingDiv.classList.add('hidden');
    }
}

function showToast(message, type) {
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Utility function to format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
}
