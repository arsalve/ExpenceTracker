(() => {
    'use strict';

    const API_BASE = '/api';

    class InsightsManager {
        constructor() {
            this.currentUser = this.getUser();
            this.stats = null;
            this.initialize();
        }

        getUser() {
            const stored = (localStorage.getItem('currentUser') || '').trim();
            if (stored) return stored;

            const hashUser = decodeURIComponent(
                window.location.hash.replace(/^#/, '').trim()
            );

            if (hashUser) {
                localStorage.setItem('currentUser', hashUser);
                return hashUser;
            }

            return '';
        }

        initialize() {
            this.setupButtons();
            this.setupUserControls();
            this.setupThemeCompatibility();

            const year = document.getElementById('analysisYear');
            if (year) year.value = new Date().getFullYear();

            if (this.currentUser) {
                this.loadAnalytics();
            } else {
                this.showError('कृपया वापरकर्ता नाव सेट करा.');
            }
        }

        setupButtons() {
            document.getElementById('loadAnalysisBtn')?.addEventListener(
                'click',
                () => this.loadAnalytics()
            );

            document.getElementById('exportDataBtn')?.addEventListener(
                'click',
                () => this.exportData()
            );
        }

        setupUserControls() {
            const input = document.getElementById('currentUserInput');
            const form = document.getElementById('userForm');

            if (input) input.value = this.currentUser;

            form?.addEventListener('submit', e => {
                e.preventDefault();

                const value = input?.value?.trim();

                if (!value) {
                    this.showError('कृपया वापरकर्ता नाव लिहा.');
                    return;
                }

                this.currentUser = value;
                localStorage.setItem('currentUser', value);
                this.loadAnalytics();
            });
        }

        setupThemeCompatibility() {
            const oldToggle = document.getElementById('themeToggle');

            oldToggle?.addEventListener('click', () => {
                document.body.classList.toggle('dark');
                this.redrawCharts();
            });
        }

        async loadAnalytics() {
            const year = Number(
                document.getElementById('analysisYear')?.value
            ) || new Date().getFullYear();

            if (!this.currentUser) {
                this.showError('वापरकर्ता उपलब्ध नाही.');
                return;
            }

            this.setLoading(true);
            this.hideError();

            try {
                const response = await fetch(`${API_BASE}/statistics`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        user: this.currentUser,
                        year
                    })
                });

                const raw = await response.text();
                let payload;

                try {
                    payload = raw ? JSON.parse(raw) : {};
                } catch {
                    throw new Error(
                        `API ने JSON दिले नाही. HTTP ${response.status}.`
                    );
                }

                console.log('[Insights] /api/statistics', payload);

                if (!response.ok) {
                    throw new Error(
                        payload?.message ||
                        `Statistics API error (${response.status})`
                    );
                }

                if (!payload.stats) {
                    throw new Error('API response मध्ये stats उपलब्ध नाही.');
                }

                this.stats = this.normalizeStats(payload.stats);
                this.displayStatistics(this.stats);

            } catch (error) {
                console.error('[Insights] Load failed:', error);
                this.showError(
                    `विश्लेषण लोड करता आले नाही: ${error.message}`
                );
                this.renderEmptyCharts();
            } finally {
                this.setLoading(false);
            }
        }

        normalizeNumber(value) {
            const n = Number(value);
            return Number.isFinite(n) ? n : 0;
        }

        normalizeStats(stats) {
            const totalIncome = this.normalizeNumber(stats.total_income);
            const totalExpense = this.normalizeNumber(stats.total_expense);
            const totalSavings = this.normalizeNumber(stats.total_savings);

            const monthly = stats.monthly_breakdown || {};
            const months = Object.keys(monthly)
                .filter(key => /^\d{4}-\d{2}$/.test(key))
                .sort();

            const normalized = {};

            months.forEach(key => {
                const item = monthly[key] || {};

                normalized[key] = {
                    income: this.normalizeNumber(item.income),
                    expense: this.normalizeNumber(
                        item.expense ?? item.expenses
                    ),
                    savings: this.normalizeNumber(item.savings)
                };
            });

            return {
                total_transactions:
                    this.normalizeNumber(stats.total_transactions),
                total_income: totalIncome,
                total_expense: totalExpense,
                total_savings: totalSavings,
                average_transaction:
                    this.normalizeNumber(stats.average_transaction),
                net_balance:
                    this.normalizeNumber(stats.net_balance),
                monthly_breakdown: normalized
            };
        }

        displayStatistics(stats) {
            this.setText('totalIncome', this.money(stats.total_income));
            this.setText('totalExpense', this.money(stats.total_expense));
            this.setText('totalSavings', this.money(stats.total_savings));
            this.setText('netBalance', this.money(stats.net_balance));

            const income = stats.total_income || 0;
            const expense = stats.total_expense || 0;
            const savings = stats.total_savings || 0;

            this.setText(
                'expensePercentage',
                `खर्च: ${income ? ((expense / income) * 100).toFixed(1) : '0.0'}%`
            );

            this.setText(
                'savingsPercentage',
                `बचत: ${income ? ((savings / income) * 100).toFixed(1) : '0.0'}%`
            );

            this.setText(
                'balancePercentage',
                `शिल्लक: ${income ? ((stats.net_balance / income) * 100).toFixed(1) : '0.0'}%`
            );

            this.drawMonthlyTrendChart(stats.monthly_breakdown);
            this.drawExpenseDistributionChart(stats.monthly_breakdown);
            this.generateRecommendations(stats);
        }

        setText(id, value) {
            const el = document.getElementById(id);
            if (el) el.textContent = value;
        }

        money(value) {
            return new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 0
            }).format(this.normalizeNumber(value));
        }

        getMonthData(monthlyData) {
            return Object.keys(monthlyData || {})
                .sort()
                .map(key => {
                    const [year, month] = key.split('-');
                    const date = new Date(
                        Number(year),
                        Number(month) - 1,
                        1
                    );

                    return {
                        key,
                        label: date.toLocaleDateString('mr-IN', {
                            month: 'short'
                        }),
                        income: this.normalizeNumber(
                            monthlyData[key]?.income
                        ),
                        expense: this.normalizeNumber(
                            monthlyData[key]?.expense
                        ),
                        savings: this.normalizeNumber(
                            monthlyData[key]?.savings
                        )
                    };
                });
        }

        chartTheme() {
            const dark = document.body.classList.contains('dark');

            return {
                paper_bgcolor: 'rgba(0,0,0,0)',
                plot_bgcolor: 'rgba(0,0,0,0)',
                font: {
                    family: '"Balbarati01", "Balbharati", "Noto Sans Devanagari", "Mukta", sans-serif',
                    color: dark ? '#f4f7fb' : '#151a2d',
                    size: 12
                },
                xaxis: {
                    gridcolor: dark ? '#30394a' : '#e8ecf3',
                    zerolinecolor: dark ? '#3a4454' : '#dfe4ed'
                },
                yaxis: {
                    gridcolor: dark ? '#30394a' : '#e8ecf3',
                    zerolinecolor: dark ? '#3a4454' : '#dfe4ed',
                    tickprefix: '₹'
                }
            };
        }

        ensurePlotly() {
            return new Promise((resolve, reject) => {
                if (window.Plotly) {
                    resolve(window.Plotly);
                    return;
                }

                const existing = document.querySelector(
                    'script[data-plotly-loader]'
                );

                if (existing) {
                    existing.addEventListener('load', () => resolve(window.Plotly));
                    existing.addEventListener('error', reject);
                    return;
                }

                const script = document.createElement('script');
                script.src =
                    'https://cdn.plot.ly/plotly-2.35.2.min.js';
                script.async = true;
                script.dataset.plotlyLoader = 'true';

                script.onload = () => {
                    if (window.Plotly) resolve(window.Plotly);
                    else reject(new Error('Plotly loaded but window.Plotly is missing.'));
                };

                script.onerror = () => reject(
                    new Error('Plotly CDN load failed. Check CSP/network.')
                );

                document.head.appendChild(script);
            });
        }

        async drawMonthlyTrendChart(monthlyData) {
            const element =
                document.getElementById('monthlyTrendChart');

            if (!element) return;

            try {
                const Plotly = await this.ensurePlotly();
                const months = this.getMonthData(monthlyData);

                const root = getComputedStyle(document.documentElement);
                const chartIncome = root.getPropertyValue('--chart-income').trim() || '#1f9d73';
                const chartExpense = root.getPropertyValue('--chart-expense').trim() || '#d95763';
                const chartSavings = root.getPropertyValue('--chart-savings').trim() || '#635bff';

                const traces = [
                    {
                        x: months.map(m => m.label),
                        y: months.map(m => m.income),
                        name: 'उत्पन्न',
                        type: 'scatter',
                        mode: 'lines+markers',
                        line: {
                            color: chartIncome,
                            width: 3,
                            shape: 'spline'
                        },
                        fill: 'tozeroy',
                        fillcolor: 'rgba(31,157,115,.08)',
                        marker: { size: 6 }
                    },
                    {
                        x: months.map(m => m.label),
                        y: months.map(m => m.expense),
                        name: 'खर्च',
                        type: 'scatter',
                        mode: 'lines+markers',
                        line: {
                            color: '#d95763',
                            width: 3,
                            shape: 'spline'
                        },
                        marker: { size: 6 }
                    },
                    {
                        x: months.map(m => m.label),
                        y: months.map(m => m.savings),
                        name: 'बचत',
                        type: 'scatter',
                        mode: 'lines+markers',
                        line: {
                            color: chartSavings,
                            width: 2,
                            dash: 'dot',
                            shape: 'spline'
                        },
                        marker: { size: 5 }
                    }
                ];

                await Plotly.react(
                    element,
                    traces,
                    {
                        ...this.chartTheme(),
                        title: {
                            text: 'मासिक उत्पन्न, खर्च व बचत',
                            font: { size: 15 }
                        },
                        margin: { t: 55, r: 18, b: 55, l: 65 },
                        legend: {
                            orientation: 'h',
                            x: 0,
                            y: 1.08
                        },
                        hovermode: 'x unified',
                        autosize: true
                    },
                    {
                        responsive: true,
                        displaylogo: false,
                        modeBarButtonsToRemove: [
                            'lasso2d',
                            'select2d',
                            'autoScale2d'
                        ]
                    }
                );
            } catch (error) {
                console.error('[Insights] Trend chart failed:', error);
                element.innerHTML =
                    '<div class="chart-error">चार्ट लोड करता आला नाही.</div>';
            }
        }

        async drawExpenseDistributionChart(monthlyData) {
            const element =
                document.getElementById('expenseDistributionChart');

            if (!element) return;

            try {
                const Plotly = await this.ensurePlotly();
                const months = this.getMonthData(monthlyData);

                await Plotly.react(
                    element,
                    [{
                        x: months.map(m => m.label),
                        y: months.map(m => m.expense),
                        type: 'bar',
                        name: 'खर्च',
                        marker: {
                            color: '#d95763',
                            line: {
                                width: 0
                            },
                            opacity: 0.86
                        },
                        hovertemplate:
                            '%{x}<br>खर्च: ₹%{y:,.0f}<extra></extra>'
                    }],
                    {
                        ...this.chartTheme(),
                        title: {
                            text: 'मासिक खर्चाचे वितरण',
                            font: { size: 15 }
                        },
                        margin: { t: 55, r: 18, b: 55, l: 65 },
                        hovermode: 'x',
                        autosize: true
                    },
                    {
                        responsive: true,
                        displaylogo: false,
                        modeBarButtonsToRemove: [
                            'lasso2d',
                            'select2d',
                            'autoScale2d'
                        ]
                    }
                );
            } catch (error) {
                console.error('[Insights] Expense chart failed:', error);
                element.innerHTML =
                    '<div class="chart-error">चार्ट लोड करता आला नाही.</div>';
            }
        }

        renderEmptyCharts() {
            const empty = {};
            this.drawMonthlyTrendChart(empty);
            this.drawExpenseDistributionChart(empty);
        }

        redrawCharts() {
            if (!this.stats) return;
            this.drawMonthlyTrendChart(this.stats.monthly_breakdown);
            this.drawExpenseDistributionChart(this.stats.monthly_breakdown);
        }

        generateRecommendations(stats) {
            const list =
                document.getElementById('recommendationsList');

            if (!list) return;

            const income = stats.total_income;
            const expense = stats.total_expense;
            const savings = stats.total_savings;
            const balance = stats.net_balance;

            const items = [];

            if (income <= 0) {
                items.push('या कालावधीत उत्पन्नाची नोंद आढळली नाही.');
            } else {
                const expenseRate = expense / income;
                const savingsRate = savings / income;

                if (expenseRate > 0.5) {
                    items.push(
                        `आपला खर्च उत्पन्नाच्या ${(expenseRate * 100).toFixed(1)}% आहे. अनावश्यक खर्च कमी करण्याचा प्रयत्न करा.`
                    );
                } else {
                    items.push(
                        `आपला खर्च उत्पन्नाच्या ${(expenseRate * 100).toFixed(1)}% आहे. खर्च नियंत्रणात आहे.`
                    );
                }

                if (savingsRate >= 0.2) {
                    items.push(
                        `उत्तम! आपण उत्पन्नाच्या ${(savingsRate * 100).toFixed(1)}% बचत करत आहात.`
                    );
                } else {
                    items.push(
                        `आपली बचत ${(savingsRate * 100).toFixed(1)}% आहे. शक्य असल्यास 20% बचतीचे लक्ष्य ठेवा.`
                    );
                }
            }

            items.push(
                balance >= 0
                    ? `आपली उपलब्ध शिल्लक ${this.money(balance)} आहे.`
                    : 'आपली शिल्लक नकारात्मक आहे. खर्चाचे नियोजन पुन्हा तपासा.'
            );

            list.innerHTML = items.map(item =>
                `<li class="recommendation">${this.escapeHtml(item)}</li>`
            ).join('');
        }

        escapeHtml(value) {
            return String(value)
                .replaceAll('&', '&amp;')
                .replaceAll('<', '&lt;')
                .replaceAll('>', '&gt;')
                .replaceAll('"', '&quot;')
                .replaceAll("'", '&#039;');
        }

        setLoading(loading) {
            const button =
                document.getElementById('loadAnalysisBtn');
            const status =
                document.getElementById('loadingStatus');

            if (button) {
                button.disabled = loading;
                button.dataset.originalText ||= button.textContent;
                button.textContent =
                    loading ? 'लोड होत आहे...' : button.dataset.originalText;
            }

            if (status) status.hidden = !loading;
        }

        showError(message) {
            const element =
                document.getElementById('errorMessage');

            if (element) {
                element.textContent = message;
                element.hidden = false;
            }
        }

        hideError() {
            const element =
                document.getElementById('errorMessage');

            if (element) {
                element.textContent = '';
                element.hidden = true;
            }
        }

        async exportData() {
            try {
                if (!this.currentUser) {
                    throw new Error('वापरकर्ता उपलब्ध नाही.');
                }

                const response = await fetch(
                    `${API_BASE}/export/json`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify({
                            user: this.currentUser
                        })
                    }
                );

                const payload = await response.json();

                if (!response.ok) {
                    throw new Error(
                        payload?.message || `Export error (${response.status})`
                    );
                }

                const blob = new Blob(
                    [JSON.stringify(payload, null, 2)],
                    { type: 'application/json;charset=utf-8' }
                );

                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');

                a.href = url;
                a.download =
                    `financial-data-${Date.now()}.json`;

                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);

            } catch (error) {
                this.showError(
                    `डेटा निर्यात करता आला नाही: ${error.message}`
                );
            }
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        window.insightsManager = new InsightsManager();
    });
})();
