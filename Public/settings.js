// Settings Page Handler
class SettingsManager {
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
        this.setupThemeToggle();
        this.loadSettings();
        this.setupEventListeners();
    }

    setupThemeToggle() {
        const toggle = document.getElementById('themeToggle');
        if (toggle) {
            toggle.addEventListener('click', () => {
                document.body.classList.toggle('dark');
                localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
            });
        }
    }

    loadSettings() {
        document.getElementById('userName').value = this.currentUser;
        document.getElementById('currency').value = localStorage.getItem('currency') || '₹';
        document.getElementById('language').value = localStorage.getItem('language') || 'mr';
    }

    setupEventListeners() {
        document.getElementById('currency').addEventListener('change', (e) => {
            localStorage.setItem('currency', e.target.value);
        });

        document.getElementById('language').addEventListener('change', (e) => {
            localStorage.setItem('language', e.target.value);
        });

        document.getElementById('exportJsonBtn').addEventListener('click', () => this.exportJSON());
        document.getElementById('exportCsvBtn').addEventListener('click', () => this.exportCSV());
        document.getElementById('importBtn').addEventListener('click', () => this.triggerImport());
        document.getElementById('importFile').addEventListener('change', (e) => this.handleImport(e));
        document.getElementById('clearAllBtn').addEventListener('click', () => this.clearAllData());
    }

    async exportJSON() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/export/json`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user: this.currentUser })
            });

            if (response.ok) {
                const data = await response.json();
                const jsonString = JSON.stringify(data, null, 2);
                const blob = new Blob([jsonString], { type: 'application/json' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `expense-tracker-${this.currentUser}-${Date.now()}.json`;
                link.click();
                window.URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error('Error exporting:', error);
        }
    }

    async exportCSV() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/export/csv`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user: this.currentUser })
            });

            if (response.ok) {
                const data = await response.text();
                const blob = new Blob([data], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `expense-tracker-${this.currentUser}-${Date.now()}.csv`;
                link.click();
                window.URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error('Error exporting:', error);
        }
    }

    triggerImport() {
        document.getElementById('importFile').click();
    }

    async handleImport(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const data = JSON.parse(event.target.result);
                const response = await fetch(`${this.apiBaseUrl}/import/json`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ user: this.currentUser, data })
                });

                if (response.ok) {
                    const result = await response.json();
                    alert(`Import successful!\nTransactions: ${result.imported.transactions}\nBudgets: ${result.imported.budgets}\nGoals: ${result.imported.goals}`);
                }
            } catch (error) {
                console.error('Error importing:', error);
                alert('Error importing data');
            }
        };
        reader.readAsText(file);
    }

    clearAllData() {
        if (!confirm('Are you sure you want to clear ALL data? This cannot be undone!')) return;
        if (!confirm('This will delete everything. Are you absolutely sure?')) return;

        localStorage.clear();
        alert('All data cleared. Refreshing page...');
        window.location.reload();
    }
}

let settingsManager;
document.addEventListener('DOMContentLoaded', () => {
    settingsManager = new SettingsManager();
});
