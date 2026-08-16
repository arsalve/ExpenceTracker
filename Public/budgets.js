// Budgets Page Handler
class BudgetManager {
    constructor() {
        this.apiBaseUrl = this.getApiBaseUrl();
        this.currentUser = this.getUser();
        this.initialize();
    }

    getApiBaseUrl() {
        return "/api";
    }

    getUser() {
        return localStorage.getItem('currentUser') || '#User';
    }

    initialize() {
        document.getElementById('budgetForm').addEventListener('submit', (e) => this.handleAddBudget(e));
        this.loadBudgets();
        this.setupThemeToggle();
    }

    setupThemeToggle() {
        const toggle = document.getElementById('themeToggle');
        if (toggle) {
            toggle.addEventListener('click', () => {
                document.body.classList.toggle('dark');
            });
        }
    }

    async handleAddBudget(e) {
        e.preventDefault();
        const budget = {
            user: this.currentUser,
            category: document.getElementById('budgetCategory').value,
            limit: parseFloat(document.getElementById('budgetLimit').value),
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
            alert_threshold: parseFloat(document.getElementById('budgetसूचना').value)
        };

        try {
            const response = await fetch(`${this.apiBaseUrl}/budgets/set`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(budget)
            });

            if (response.ok) {
                alert('Budget set successfully!');
                document.getElementById('budgetForm').reset();
                this.loadBudgets();
            }
        } catch (error) {
            console.error('Error setting budget:', error);
        }
    }

    async loadBudgets() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/budgets/status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user: this.currentUser,
                    month: new Date().getMonth() + 1,
                    year: new Date().getFullYear()
                })
            });

            if (response.ok) {
                const data = await response.json();
                this.displayBudgets(data.status);
            }
        } catch (error) {
            console.error('Error loading budgets:', error);
        }
    }

    displayBudgets(budgets) {
        const container = document.getElementById('budgetList');
        if (budgets.length === 0) {
            container.innerHTML = '<div class="text-center py-8 text-gray-500">कोणतेही अंदाजपत्रक सेट केलेले नाही</div>';
            return;
        }

        container.innerHTML = budgets.map(budget => {
            const statusColor = budget.status === 'exceeded' ? 'red' : budget.status === 'alert' ? 'yellow' : 'green';
            const statusText = budget.status === 'exceeded' ? 'मर्यादा ओलांडली' : budget.status === 'alert' ? 'सूचना' : 'ठीक';

            return `
                <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border-l-4 border-${statusColor}-500">
                    <div class="flex justify-between items-start mb-3">
                        <h4 class="font-bold text-gray-900 dark:text-white">${budget.category}</h4>
                        <span class="px-2 py-1 rounded text-xs font-bold" style="background-color: #${statusColor === 'red' ? 'fee2e2' : statusColor === 'yellow' ? 'fef3c7' : 'd1fae5'}; color: #${statusColor === 'red' ? '991b1b' : statusColor === 'yellow' ? '92400e' : '065f46'};">
                            ${statusText}
                        </span>
                    </div>
                    <div class="space-y-2 text-sm">
                        <div class="flex justify-between">
                            <span>खर्च:</span>
                            <span class="font-bold">₹${budget.spent}</span>
                        </div>
                        <div class="flex justify-between">
                            <span>मर्यादा:</span>
                            <span class="font-bold">₹${budget.limit}</span>
                        </div>
                        <div class="flex justify-between">
                            <span>शिल्लक:</span>
                            <span class="font-bold" style="color: ${budget.remaining >= 0 ? 'green' : 'red'};">₹${budget.remaining}</span>
                        </div>
                        <div class="w-full bg-gray-300 rounded-full h-2 mt-2">
                            <div class="bg-${statusColor}-500 h-2 rounded-full" style="width: ${Math.min(100, budget.percentUsed)}%"></div>
                        </div>
                        <div class="text-right text-xs text-gray-600 dark:text-gray-400">
                            ${budget.percentUsed}% वापरले
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
}

let budgetManager;
document.addEventListener('DOMContentLoaded', () => {
    budgetManager = new BudgetManager();
});
