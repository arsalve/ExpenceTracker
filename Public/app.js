// ============================================================
// खर्चप्रबंधक - वैयक्तिक आर्थिक खातेवही
// Frontend Summary Calculation Version
// ============================================================

class ExpenseTracker {

    constructor() {
        this.apiBaseUrl = this.getApiBaseUrl();
        this.currentUser = this.getOrCreateUser();
        this.categories = this.initializeCategories();

        this.initializeTheme();
        this.initializeEventListeners();

        this.loadMonthlyData();
    }


    // ========================================================
    // API URL
    // ========================================================

    getApiBaseUrl() {

        return "/api";
    }


    // ========================================================
    // User
    // ========================================================

    getOrCreateUser() {

        let user = localStorage.getItem("currentUser");

        if (!user) {

            const enteredName = prompt(
                "कृपया आपले नाव किंवा वापरकर्ता क्रमांक लिहा:"
            );

            user =
                "#" +
                (
                    enteredName ||
                    "वापरकर्ता_" + Date.now()
                );

            localStorage.setItem(
                "currentUser",
                user
            );
        }

        return user;
    }


    // ========================================================
    // Categories
    // ========================================================

    initializeCategories() {

        return {

            income: [
                "पगार",
                "फ्रीलान्स उत्पन्न",
                "गुंतवणुकीवरील परतावा",
                "बोनस",
                "भेट",
                "परतावा",
                "इतर उत्पन्न"
            ],

            expense: [
                "आहार",
                "किराणा",
                "घरातील खर्च",
                "परिवहन",
                "मनोरंजन",
                "दूरसंचार",
                "आरोग्य",
                "वैयक्तिक काळजी",
                "विमा",
                "कपडे",
                "वाहन देखरेख",
                "इंधन",
                "रोकड",
                "वॉलेट ट्रान्स्फर",
                "इतर खर्च",
                "भाडे",
                "वीज",
                "पाणी",
                "गॅस",
                "इंटरनेट",
                "मोबाईल रिचार्ज",
                "शिक्षण",
                "औषधे",
                "डॉक्टर",
                "प्रवास",
                "हॉटेल",
                "ऑनलाइन खरेदी",
                "खरेदी",
                "घर दुरुस्ती",
                "घरगुती उपकरणे",
                "मुलांचा खर्च",
                "पाळीव प्राणी",
                "देणगी",
                "कर",
                "बँक शुल्क",
                "कर्जाचा हप्ता",
                "क्रेडिट कार्ड",
                "गुंतवणूक",
                "आपत्कालीन खर्च",
                "भेटवस्तू",
                "समारंभ",
                "सदस्यत्व",
                "सॉफ्टवेअर आणि सेवा",
                "कार्यालयीन खर्च",
                "व्यवसाय खर्च",
                "इतर"
            ],

            savings: [
                "म्युच्युअल फंड",
                "मुदत ठेव",
                "आवर्ती ठेव",
                "सोने",
                "पीपीएफ",
                "बँक बचत",
                "गुंतवणूक",
                "इतर बचत"
            ]
        };
    }


    // ========================================================
    // Event Listeners
    // ========================================================

    initializeEventListeners() {

        // Theme
        const themeToggle =
            document.getElementById("themeToggle");

        if (themeToggle) {
            themeToggle.addEventListener(
                "click",
                () => this.toggleTheme()
            );
        }


        // Mobile menu
        const menuToggle =
            document.getElementById("menuToggle");

        if (menuToggle) {
            menuToggle.addEventListener(
                "click",
                () => this.toggleMobileMenu()
            );
        }


        // Transaction form
        const transactionForm =
            document.getElementById("transactionForm");

        if (transactionForm) {
            transactionForm.addEventListener(
                "submit",
                (e) => this.handleFormSubmit(e)
            );
        }


        // Transaction type
        const transType =
            document.getElementById("transType");

        if (transType) {
            transType.addEventListener(
                "change",
                () => this.updateCategoryOptions()
            );
        }


        // Search
        const searchBtn =
            document.getElementById("searchBtn");

        if (searchBtn) {
            searchBtn.addEventListener(
                "click",
                () => this.loadMonthlyData()
            );
        }


        // All entries
        const allEntries =
            document.getElementById("allEntries");

        if (allEntries) {

            allEntries.addEventListener(
                "change",
                () => {

                    const searchMonth =
                        document.getElementById(
                            "searchMonth"
                        );

                    if (searchMonth) {
                        searchMonth.disabled =
                            allEntries.checked;
                    }

                    this.loadMonthlyData();
                }
            );
        }


        // Delete mode
        const deleteMode =
            document.getElementById("deleteMode");

        if (deleteMode) {
            deleteMode.addEventListener(
                "change",
                () => this.loadMonthlyData()
            );
        }


        // Today's date
        const transDate =
            document.getElementById("transDate");

        if (transDate) {
            transDate.valueAsDate = new Date();
        }


        // Current month
        const searchMonth =
            document.getElementById("searchMonth");

        if (searchMonth) {

            const today = new Date();

            searchMonth.value =
                `${today.getFullYear()}-${String(
                    today.getMonth() + 1
                ).padStart(2, "0")}`;
        }


        // Initial all entries state
        if (allEntries && searchMonth) {
            searchMonth.disabled =
                allEntries.checked;
        }
    }


    // ========================================================
    // Theme
    // ========================================================

    initializeTheme() {

        const savedTheme =
            localStorage.getItem("theme");

        if (savedTheme === "dark") {
            document.body.classList.add("dark");
        } else {
            document.body.classList.remove("dark");
        }
    }


    toggleTheme() {

        document.body.classList.toggle("dark");

        const isDark =
            document.body.classList.contains("dark");

        localStorage.setItem(
            "theme",
            isDark ? "dark" : "light"
        );

        this.loadMonthlyData();
    }


    // ========================================================
    // Mobile Menu
    // ========================================================

    toggleMobileMenu() {

        const mobileMenu =
            document.getElementById("mobileMenu");

        if (mobileMenu) {
            mobileMenu.classList.toggle("hidden");
        }
    }


    // ========================================================
    // Category Dropdown
    // ========================================================

    updateCategoryOptions() {

        const transType =
            document.getElementById("transType");

        const categorySelect =
            document.getElementById("transCategory");

        if (!transType || !categorySelect) {
            return;
        }

        const type =
            transType.value;

        categorySelect.innerHTML = `
            <option value="">
                -- श्रेणी निवडा --
            </option>
        `;

        const categories =
            this.categories[type] || [];

        categories.forEach(category => {

            const option =
                document.createElement("option");

            option.value = category;
            option.textContent = category;

            categorySelect.appendChild(option);
        });
    }


    // ========================================================
    // Add Transaction
    // ========================================================

    async handleFormSubmit(e) {

        e.preventDefault();

        const transaction = {

            user: this.currentUser,

            date: document.getElementById(
                "transDate"
            ) ?.value,

            amount: parseFloat(
                document.getElementById(
                    "transAmount"
                ) ?.value
            ),

            type: document.getElementById(
                "transType"
            ) ?.value,

            category: document.getElementById(
                "transCategory"
            ) ?.value,

            description: document.getElementById(
                "transDescription"
            ) ?.value,

            notes: document.getElementById(
                "transNotes"
            ) ?.value
        };


        if (!transaction.date) {
            alert("कृपया दिनांक निवडा.");
            return;
        }


        if (
            !transaction.amount ||
            transaction.amount <= 0
        ) {
            alert("कृपया योग्य रक्कम लिहा.");
            return;
        }


        if (!transaction.type) {
            alert("कृपया व्यवहाराचा प्रकार निवडा.");
            return;
        }


        if (!transaction.category) {
            alert("कृपया व्यवहाराची श्रेणी निवडा.");
            return;
        }


        if (!transaction.description) {
            alert("कृपया व्यवहाराचे विवरण लिहा.");
            return;
        }


        try {

            const response =
                await fetch(
                    `${this.apiBaseUrl}/transactions/create`, {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify(transaction)
                    }
                );


            if (response.ok) {

                alert(
                    "व्यवहार यशस्वीरीत्या नोंदवला गेला."
                );

                const form =
                    document.getElementById(
                        "transactionForm"
                    );

                if (form) {
                    form.reset();
                }


                const transDate =
                    document.getElementById(
                        "transDate"
                    );

                if (transDate) {
                    transDate.valueAsDate =
                        new Date();
                }


                const categorySelect =
                    document.getElementById(
                        "transCategory"
                    );

                if (categorySelect) {

                    categorySelect.innerHTML = `
                        <option value="">
                            -- श्रेणी निवडा --
                        </option>
                    `;
                }


                await this.loadMonthlyData();

            } else {

                console.error(
                    "व्यवहार नोंदवताना API त्रुटी:",
                    await response.text()
                );

                alert(
                    "व्यवहार नोंदवताना अडचण आली."
                );
            }

        } catch (error) {

            console.error(
                "व्यवहार नोंद त्रुटी:",
                error
            );

            alert(
                "सर्व्हरशी संपर्क साधता आला नाही."
            );
        }
    }


    // ========================================================
    // Load Transactions
    //
    // NOTE:
    // Summary API आता वापरले जात नाही.
    // Summary पूर्णपणे frontend वर calculate होतो.
    // ========================================================

    async loadMonthlyData() {

        const allEntries =
            document.getElementById("allEntries") ?.checked || false;

        const monthValue =
            document.getElementById("searchMonth") ?.value;


        try {

            // =====================================================
            // 1. GET ALL TRANSACTIONS
            // =====================================================

            const response = await fetch(
                `${this.apiBaseUrl}/transactions/get`, {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        user: this.currentUser
                    })
                }
            );


            if (!response.ok) {

                console.error(
                    "Transactions API Error:",
                    response.status
                );

                this.showTransactionError();

                return;
            }


            const responseData =
                await response.json();


            let allTransactions =
                Array.isArray(responseData.data) ?
                responseData.data :
                [];


            console.log(
                "सर्व व्यवहार:",
                allTransactions
            );


            // =====================================================
            // 2. TOP CARDS
            //
            // Always calculate from ALL records
            // =====================================================

            const totalSummary =
                this.calculateSummary(
                    allTransactions
                );


            console.log(
                "एकूण Summary:",
                totalSummary
            );


            // Top cards ALWAYS show all records
            this.updateSummaryDisplay(
                totalSummary
            );


            // =====================================================
            // 3. FILTER DATA FOR TABLE + CHART
            // =====================================================

            let displayTransactions = [...allTransactions];


            if (!allEntries) {

                if (!monthValue) {

                    alert(
                        "कृपया महिना निवडा."
                    );

                    return;
                }


                const [selectedYear, selectedMonth] =
                monthValue.split("-");


                displayTransactions =
                    allTransactions.filter(
                        transaction => {

                            if (!transaction.date) {
                                return false;
                            }


                            const date =
                                new Date(
                                    transaction.date
                                );


                            const transactionYear =
                                date.getFullYear()
                                .toString();


                            const transactionMonth =
                                String(
                                    date.getMonth() + 1
                                ).padStart(2, "0");


                            return (
                                transactionYear ===
                                selectedYear &&
                                transactionMonth ===
                                selectedMonth
                            );
                        }
                    );
            }


            console.log(
                "दर्शविण्यात येणारे व्यवहार:",
                displayTransactions
            );


            // =====================================================
            // 4. SELECTED PERIOD SUMMARY
            //
            // This is NOT used for top cards.
            // It is used only for summary table.
            // =====================================================

            const selectedSummary =
                this.calculateSummary(
                    displayTransactions
                );


            // Summary table = selected month
            // OR all records if "सर्व नोंदी" checked

            this.updateSummaryTable(
                selectedSummary
            );


            // =====================================================
            // 5. TRANSACTION TABLE
            // =====================================================

            this.updateTransactionsTable(
                displayTransactions
            );


            // =====================================================
            // 6. CATEGORY CHART
            // =====================================================

            this.updateCategoryChart(
                displayTransactions
            );


        } catch (error) {

            console.error(
                "डेटा लोड करताना त्रुटी:",
                error
            );

            this.showTransactionError();
        }
    }


    // ========================================================
    // FRONTEND SUMMARY CALCULATION
    // ========================================================

    calculateSummary(transactions) {

        let income = 0;
        let expense = 0;
        let savings = 0;


        if (!Array.isArray(transactions)) {

            return {
                income: 0,
                expense: 0,
                savings: 0,
                net: 0
            };
        }


        transactions.forEach(transaction => {

            const amount =
                Number(
                    transaction.amount || 0
                );


            if (
                transaction.type ===
                "income"
            ) {

                income += amount;

            } else if (
                transaction.type ===
                "expense"
            ) {

                expense += amount;

            } else if (
                transaction.type ===
                "savings"
            ) {

                savings += amount;
            }
        });


        /*
         * एकूण शिल्लक:
         *
         * उत्पन्न - खर्च - बचत
         *
         * उदाहरण:
         *
         * उत्पन्न = 50,000
         * खर्च = 20,000
         * बचत = 10,000
         *
         * शिल्लक = 20,000
         */

        const net =
            income -
            expense -
            savings;


        return {

            income: this.roundMoney(income),

            expense: this.roundMoney(expense),

            savings: this.roundMoney(savings),

            net: this.roundMoney(net)
        };
    }


    // ========================================================
    // Summary Cards
    // ========================================================

    updateSummaryDisplay(summary) {

        const income =
            Number(
                summary.income || 0
            );


        const expense =
            Number(
                summary.expense || 0
            );


        const savings =
            Number(
                summary.savings || 0
            );


        const net =
            Number(
                summary.net || 0
            );


        const monthlyIncome =
            document.getElementById(
                "monthlyIncome"
            );


        const monthlyExpense =
            document.getElementById(
                "monthlyExpense"
            );


        const monthlySavings =
            document.getElementById(
                "monthlySavings"
            );


        const netBalance =
            document.getElementById(
                "netBalance"
            );


        if (monthlyIncome) {

            monthlyIncome.textContent =
                this.formatCurrency(
                    income
                );
        }


        if (monthlyExpense) {

            monthlyExpense.textContent =
                this.formatCurrency(
                    expense
                );
        }


        if (monthlySavings) {

            monthlySavings.textContent =
                this.formatCurrency(
                    savings
                );
        }


        if (netBalance) {

            netBalance.textContent =
                this.formatCurrency(
                    net
                );
        }
    }


    // ========================================================
    // Summary Table
    // ========================================================

    updateSummaryTable(summary) {

        const tbody =
            document.getElementById(
                "summaryTableBody"
            );


        if (!tbody) {
            return;
        }


        tbody.innerHTML = `

            <tr
                class="border-b
                       border-gray-200
                       dark:border-gray-700">

                <td class="px-4 py-3">
                    उत्पन्न
                </td>

                <td
                    class="px-4 py-3 text-right font-semibold value-income">

                    ${this.formatCurrency(
                        summary.income
                    )}

                </td>

            </tr>


            <tr
                class="border-b
                       border-gray-200
                       dark:border-gray-700">

                <td class="px-4 py-3">
                    खर्च
                </td>

                <td
                    class="px-4 py-3 text-right font-semibold value-expense">

                    ${this.formatCurrency(
                        summary.expense
                    )}

                </td>

            </tr>


            <tr
                class="border-b
                       border-gray-200
                       dark:border-gray-700">

                <td class="px-4 py-3">
                    बचत
                </td>

                <td
                    class="px-4 py-3 text-right font-semibold value-savings">

                    ${this.formatCurrency(
                        summary.savings
                    )}

                </td>

            </tr>


            <tr>

                <td
                    class="px-4 py-3
                           font-bold">

                    एकूण शिल्लक

                </td>

                <td
                    class="px-4 py-3 text-right font-bold value-balance">

                    ${this.formatCurrency(
                        summary.net
                    )}

                </td>

            </tr>
        `;
    }


    // ========================================================
    // Transactions Table
    // ========================================================

    updateTransactionsTable(
        transactions
    ) {

        const tbody =
            document.getElementById(
                "transactionsTableBody"
            );


        if (!tbody) {
            return;
        }


        if (
            !Array.isArray(transactions) ||
            transactions.length === 0
        ) {

            tbody.innerHTML = `

                <tr>

                    <td
                        colspan="5"
                        class="px-4 py-3
                               text-center
                               text-gray-500">

                        कोणतेही व्यवहार आढळले नाहीत.

                    </td>

                </tr>
            `;

            return;
        }


        const deleteMode =
            document.getElementById(
                "deleteMode"
            ) ?.checked || false;


        const deleteHeader =
            document.getElementById(
                "deleteHeader"
            );


        if (deleteHeader) {

            deleteHeader.style.display =
                deleteMode ?
                "" :
                "none";
        }

        const transactionTable =
            tbody.closest(".transaction-table");

        if (transactionTable) {
            transactionTable.classList.toggle(
                "delete-enabled",
                deleteMode
            );
        }


        tbody.innerHTML =
            transactions
            .map(transaction => {

                const date =
                    this.formatDate(
                        transaction.date
                    );


                const description =
                    this.escapeHtml(
                        transaction.description ||
                        "-"
                    );


                const category =
                    this.escapeHtml(
                        transaction.category ||
                        "-"
                    );


                const amount =
                    Number(
                        transaction.amount || 0
                    );


                let typeColor =
                    "value-balance";


                if (
                    transaction.type ===
                    "income"
                ) {

                    typeColor =
                        "value-income";

                } else if (
                    transaction.type ===
                    "expense"
                ) {

                    typeColor =
                        "value-expense";

                } else if (
                    transaction.type ===
                    "savings"
                ) {

                    typeColor =
                        "value-savings";
                }


                return `

                        <tr
                            class="border-b
                                   border-gray-200
                                   dark:border-gray-700
                                   hover:bg-gray-50
                                   dark:hover:bg-gray-700">

                            <td
                                class="px-4 py-3">

                                ${date}

                            </td>


                            <td
                                class="px-4 py-3">

                                ${description}

                            </td>


                            <td
                                class="px-4 py-3">

                                ${category}

                            </td>


                            <td
                                class="px-4 py-3
                                       text-right
                                       font-semibold
                                       ${typeColor}">

                                ${this.formatCurrency(
                                    amount
                                )}

                            </td>


                            <td class="action-cell" style="${deleteMode ? "" : "display:none"}">
                                <button
                                    type="button"
                                    class="delete-button"
                                    data-transaction-id="${transaction.id}"
                                    title="व्यवहार हटवा"
                                    aria-label="व्यवहार हटवा">
                                    ×
                                </button>
                            </td>

                        </tr>
                    `;
            })
            .join("");
    }


    // ========================================================
    // Category Chart
    // ========================================================

    updateCategoryChart(
        transactions
    ) {

        const chartDiv =
            document.getElementById(
                "categoryChart"
            );


        if (!chartDiv) {
            return;
        }


        const categoryBreakdown = {};


        transactions.forEach(transaction => {

            if (
                transaction.type !==
                "expense"
            ) {
                return;
            }


            const category =
                transaction.category ||
                "इतर खर्च";


            const amount =
                Number(
                    transaction.amount || 0
                );


            categoryBreakdown[category] =
                (
                    categoryBreakdown[category] ||
                    0
                ) + amount;
        });


        const categories =
            Object.keys(
                categoryBreakdown
            );


        const amounts =
            Object.values(
                categoryBreakdown
            );


        if (categories.length === 0) {

            chartDiv.innerHTML = `

                <div
                    class="h-full flex
                           items-center
                           justify-center
                           text-gray-500">

                    खर्चाची माहिती उपलब्ध नाही.

                </div>
            `;

            return;
        }


        const isDark =
            document.body.classList.contains(
                "dark"
            );


        const chartPalette = [
            "#635bff",
            "#20b486",
            "#3f7ee8",
            "#d98b2b",
            "#d95763",
            "#8a72d8",
            "#159a86",
            "#6c78b8",
            "#b86f4b",
            "#7b879b"
        ];

        const trace = {

            labels: categories,

            values: amounts,

            type: "pie",

            hole: 0.46,

            marker: {
                colors: chartPalette.slice(
                    0,
                    Math.max(categories.length, 1)
                ),
                line: {
                    color: isDark ?
                        "#171d29" :
                        "#ffffff",
                    width: 2
                }
            },

            textinfo: "label+percent",

            textfont: {
                family: '"Balbarati01", "Balbharati", "Noto Sans Devanagari", "Mukta", sans-serif',
                color: isDark ?
                    "#f4f7fb" :
                    "#151a2d"
            },

            hovertemplate: "%{label}<br>" +
                "रक्कम: ₹%{value:,.2f}" +
                "<br>प्रमाण: %{percent}" +
                "<extra></extra>"
        };


        const layout = {

            title: {
                text: "खर्चाचे वितरण",

                font: {
                    family: "Balbharati, Noto Sans Devanagari, Mangal, sans-serif",

                    color: isDark ?
                        "#ffffff" :
                        "#111827"
                }
            },

            paper_bgcolor: "rgba(0,0,0,0)",

            plot_bgcolor: "rgba(0,0,0,0)",

            font: {
                family: "Balbharati, Noto Sans Devanagari, Mangal, sans-serif",

                color: isDark ?
                    "#ffffff" :
                    "#111827"
            },

            margin: {
                t: 50,
                r: 20,
                b: 20,
                l: 20
            },

            legend: {
                orientation: "h",
                y: -0.1,
                font: {
                    family: '"Balbarati01", "Balbharati", "Noto Sans Devanagari", "Mukta", sans-serif',
                    color: isDark ?
                        "#dce2ee" :
                        "#596277"
                }
            }
        };


        const config = {

            responsive: true,

            displayModeBar: false
        };


        Plotly.newPlot(
            chartDiv,
            [trace],
            layout,
            config
        );
    }


    // ========================================================
    // Delete Transaction
    // ========================================================

    async deleteTransaction(
        transactionId
    ) {

        if (!transactionId) {

            alert(
                "व्यवहार क्रमांक उपलब्ध नाही."
            );

            return;
        }


        if (
            !confirm(
                "हा व्यवहार कायमचा हटवायचा आहे का?"
            )
        ) {
            return;
        }


        try {

            const response =
                await fetch(
                    `${this.apiBaseUrl}/transactions/delete`, {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({

                            user: this.currentUser,

                            transactionId: transactionId
                        })
                    }
                );


            if (response.ok) {

                alert(
                    "व्यवहार यशस्वीरीत्या हटवला गेला."
                );


                await this.loadMonthlyData();

            } else {

                console.error(
                    "Delete error:",
                    await response.text()
                );

                alert(
                    "व्यवहार हटवताना अडचण आली."
                );
            }

        } catch (error) {

            console.error(
                "Delete error:",
                error
            );

            alert(
                "सर्व्हरशी संपर्क साधता आला नाही."
            );
        }
    }


    // ========================================================
    // Currency Formatting
    // ========================================================

    formatCurrency(amount) {

        return new Intl.NumberFormat(
            "mr-IN", {
                style: "currency",

                currency: "INR",

                minimumFractionDigits: 2,

                maximumFractionDigits: 2
            }
        ).format(
            Number(amount || 0)
        );
    }


    // ========================================================
    // Date Formatting
    // ========================================================

    formatDate(dateValue) {

        if (!dateValue) {
            return "-";
        }


        const date =
            new Date(dateValue);


        if (
            isNaN(
                date.getTime()
            )
        ) {
            return "-";
        }


        return date.toLocaleDateString(
            "mr-IN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            }
        );
    }


    // ========================================================
    // Round Money
    // ========================================================

    roundMoney(value) {

        return Math.round(
            (Number(value) + Number.EPSILON) *
            100
        ) / 100;
    }


    // ========================================================
    // Escape HTML
    // ========================================================

    escapeHtml(value) {

        const div =
            document.createElement(
                "div"
            );

        div.textContent =
            String(value ? ? "");

        return div.innerHTML;
    }


    // ========================================================
    // Error Message
    // ========================================================

    showTransactionError() {

        const tbody =
            document.getElementById(
                "transactionsTableBody"
            );


        if (!tbody) {
            return;
        }


        tbody.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    class="px-4 py-3
                           text-center
                           text-red-500">

                    व्यवहारांची माहिती
                    लोड करता आली नाही.
                    कृपया पुन्हा प्रयत्न करा.

                </td>

            </tr>
        `;
    }
}


// ============================================================
// Application सुरू करा
// ============================================================

let app;

container.querySelectorAll('.delete-button').forEach(button => {
    button.addEventListener('click', (event) => {
        const id = event.currentTarget.dataset.transactionId;
        app.deleteTransaction(id);
    });
});

document.addEventListener(
    "DOMContentLoaded",
    () => {

        app =
            new ExpenseTracker();
    }
);