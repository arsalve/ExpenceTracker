// Goals Page Handler
class GoalManager {
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
        document.getElementById('goalForm').addEventListener('submit', (e) => this.handleAddGoal(e));
        this.loadGoals();
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

    async handleAddGoal(e) {
        e.preventDefault();
        const goal = {
            user: this.currentUser,
            name: document.getElementById('goalName').value,
            target_amount: parseFloat(document.getElementById('goalरक्कम').value),
            target_date: document.getElementById('goalDate').value,
            priority: document.getElementById('goalPriority').value,
            description: document.getElementById('goalDescription').value
        };

        try {
            const response = await fetch(`${this.apiBaseUrl}/goals/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(goal)
            });

            if (response.ok) {
                alert('Goal created successfully!');
                document.getElementById('goalForm').reset();
                this.loadGoals();
            }
        } catch (error) {
            console.error('Error creating goal:', error);
        }
    }

    async loadGoals() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/goals/get`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user: this.currentUser })
            });

            if (response.ok) {
                const data = await response.json();
                this.displayGoals(data.data);
            }
        } catch (error) {
            console.error('Error loading goals:', error);
        }
    }

    displayGoals(goals) {
        const container = document.getElementById('goalsList');
        if (goals.length === 0) {
            container.innerHTML = '<div class="text-center py-8 text-gray-500">कोणतेही आर्थिक उद्दिष्ट निश्चित केलेले नाही</div>';
            return;
        }

        container.innerHTML = goals.map(goal => {
            const progress = (goal.current_amount / goal.target_amount) * 100;
            const priorityColor = goal.priority === 'high' ? 'red' : goal.priority === 'medium' ? 'yellow' : 'blue';

            return `
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <div class="flex justify-between items-start mb-3">
                        <h4 class="text-lg font-bold text-gray-900 dark:text-white">${goal.name}</h4>
                        <span class="px-2 py-1 rounded text-xs font-bold bg-${priorityColor}-100 text-${priorityColor}-800">
                            ${goal.priority.toUpperCase()}
                        </span>
                    </div>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">${goal.description}</p>
                    <div class="space-y-2 text-sm mb-4">
                        <div class="flex justify-between">
                            <span>लक्ष्य:</span>
                            <span class="font-bold">₹${goal.target_amount}</span>
                        </div>
                        <div class="flex justify-between">
                            <span>सध्याची रक्कम:</span>
                            <span class="font-bold">₹${goal.current_amount}</span>
                        </div>
                        <div class="flex justify-between">
                            <span>उर्वरित:</span>
                            <span class="font-bold">₹${goal.target_amount - goal.current_amount}</span>
                        </div>
                    </div>
                    <div class="w-full bg-gray-300 rounded-full h-2 mb-2">
                        <div class="bg-blue-500 h-2 rounded-full transition-all" style="width: ${Math.min(100, progress)}%"></div>
                    </div>
                    <div class="text-right text-xs text-gray-600 dark:text-gray-400 mb-4">
                        ${Math.round(progress)}% पूर्ण
                    </div>
                    <div class="flex gap-2">
                        <input type="number" placeholder="रक्कम" id="update_${goal.name}" class="flex-1 px-2 py-1 border rounded text-sm">
                        <button onclick="goalManager.updateProgress('${goal.name}')" class="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
                            अपडेट करा
                        </button>
                        <button onclick="goalManager.deleteGoal('${goal.name}')" class="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700">
                            हटवा
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    async updateProgress(goalName) {
        const amount = parseFloat(document.getElementById(`update_${goalName}`).value);
        if (!amount) {
            alert('Please enter an amount');
            return;
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}/goals/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user: this.currentUser,
                    goalName: goalName,
                    amount: amount
                })
            });

            if (response.ok) {
                alert('Goal progress updated!');
                this.loadGoals();
            }
        } catch (error) {
            console.error('Error updating goal:', error);
        }
    }

    async deleteGoal(goalName) {
        if (!confirm('हटवा this goal?')) return;

        try {
            const response = await fetch(`${this.apiBaseUrl}/goals/delete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user: this.currentUser,
                    goalName: goalName
                })
            });

            if (response.ok) {
                alert('Goal deleted!');
                this.loadGoals();
            }
        } catch (error) {
            console.error('Error deleting goal:', error);
        }
    }
}

let goalManager;
document.addEventListener('DOMContentLoaded', () => {
    goalManager = new GoalManager();
});
