/**
 * सेटिंग्ज पानासाठी व्यवहार.
 *
 * येथे शक्य तितका मूळ API/export/import प्रवाह ठेवला आहे.
 * नवीन भाग फक्त वापरकर्ता बदलण्यासाठी आणि भाषा पर्याय काढण्यासाठी आहे.
 */
class SettingsManager {
    constructor() {
        this.apiBaseUrl = this.getApiBaseUrl();
        this.currentUser = this.getUser();
        this.initialize();
    }

    /** @returns {string} API चा मूळ मार्ग. */
    getApiBaseUrl() {
        return "/api";
    }

    /** @returns {string} सध्याचा वापरकर्ता. */
    getUser() {
        return localStorage.getItem("currentUser") || "#User";
    }

    /**
     * पानावरील सर्व सेटिंग्ज तयार करते.
     */
    initialize() {
        this.loadSettings();
        this.setupUserSwitcher();
        this.setupEventListeners();
    }

    /**
     * सध्याची वापरकर्ता माहिती आणि चलन दाखवते.
     */
    loadSettings() {
        const userField = document.getElementById("userName");
        const currencyField = document.getElementById("currency");

        if (userField) userField.value = this.currentUser;
        if (currencyField) {
            currencyField.value = localStorage.getItem("currency") || "₹";
        }
    }

    /**
     * उपलब्ध वापरकर्त्यांची साधी यादी तयार करते.
     *
     * स्थानिक storage मध्ये users नसल्यास सध्याचा वापरकर्ता पुरेसा आहे.
     */
    setupUserSwitcher() {
        const userSelect = document.getElementById("userSelect");
        if (!userSelect) return;

        const savedUsers = JSON.parse(localStorage.getItem("users") || "[]");
        const users = Array.from(new Set([this.currentUser, ...savedUsers]))
            .filter(Boolean);

        userSelect.innerHTML =
            '<option value="">वापरकर्ता निवडा</option>' +
            users.map(user => `<option value="${this.escapeHtml(user)}">${this.escapeHtml(user)}</option>`).join("");

        userSelect.value = this.currentUser;
    }

    /**
     * वापरकर्ता नाव HTML मध्ये सुरक्षितपणे दाखवते.
     * @param {string} value - वापरकर्ता नाव.
     * @returns {string} सुरक्षित मजकूर.
     */
    escapeHtml(value) {
        return String(value)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    /**
     * बटणे आणि पर्यायांसाठी click/change घटना जोडते.
     */
    setupEventListeners() {
        document.getElementById("currency")?.addEventListener("change", (event) => {
            localStorage.setItem("currency", event.target.value);
        });

        document.getElementById("switchUserBtn")?.addEventListener("click", () => {
            this.switchUser();
        });

        document.getElementById("userSelect")?.addEventListener("change", (event) => {
            const selectedUser = event.target.value;
            if (selectedUser) {
                document.getElementById("newUserName").value = selectedUser;
            }
        });

        document.getElementById("exportJsonBtn")?.addEventListener("click", () => this.exportJSON());
        document.getElementById("exportCsvBtn")?.addEventListener("click", () => this.exportCSV());
        document.getElementById("importBtn")?.addEventListener("click", () => this.triggerImport());
        document.getElementById("importFile")?.addEventListener("change", (event) => this.handleImport(event));
        document.getElementById("clearAllBtn")?.addEventListener("click", () => this.clearAllData());
    }

    /**
     * नवीन वापरकर्ता निवडून संपूर्ण अॅप त्या खात्यावर नेते.
     */
    switchUser() {
        const select = document.getElementById("userSelect");
        const input = document.getElementById("newUserName");

        const selectedUser = select?.value?.trim();
        const typedUser = input?.value?.trim();
        const nextUser = typedUser || selectedUser;

        if (!nextUser) {
            alert("कृपया वापरकर्ता निवडा किंवा नवीन वापरकर्ता नाव लिहा.");
            return;
        }

        if (nextUser === this.currentUser) {
            alert("हा वापरकर्ता आधीपासून निवडलेला आहे.");
            return;
        }

        const users = JSON.parse(localStorage.getItem("users") || "[]");
        if (!users.includes(nextUser)) {
            users.push(nextUser);
            localStorage.setItem("users", JSON.stringify(users));
        }

        localStorage.setItem("currentUser", nextUser);
        window.location.href = "/";
    }

    async exportJSON() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/export/json`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user: this.currentUser })
            });

            if (response.ok) {
                const data = await response.json();
                const jsonString = JSON.stringify(data, null, 2);
                const blob = new Blob([jsonString], { type: "application/json" });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = `expense-tracker-${this.currentUser}-${Date.now()}.json`;
                link.click();
                window.URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error("निर्यात करताना त्रुटी:", error);
            alert("डेटा निर्यात करता आला नाही.");
        }
    }

    async exportCSV() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/export/csv`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user: this.currentUser })
            });

            if (response.ok) {
                const data = await response.text();
                const blob = new Blob([data], { type: "text/csv" });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = `expense-tracker-${this.currentUser}-${Date.now()}.csv`;
                link.click();
                window.URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error("CSV निर्यात करताना त्रुटी:", error);
            alert("CSV निर्यात करता आला नाही.");
        }
    }

    triggerImport() {
        document.getElementById("importFile")?.click();
    }

    async handleImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = async (loadEvent) => {
            try {
                const data = JSON.parse(loadEvent.target.result);

                const response = await fetch(`${this.apiBaseUrl}/import/json`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ user: this.currentUser, data })
                });

                if (response.ok) {
                    const result = await response.json();
                    alert(
                        `आयात पूर्ण झाले.\nव्यवहार: ${result.imported.transactions}\nअंदाजपत्रके: ${result.imported.budgets}\nउद्दिष्टे: ${result.imported.goals}`
                    );
                } else {
                    alert("डेटा आयात करता आला नाही.");
                }
            } catch (error) {
                console.error("आयात करताना त्रुटी:", error);
                alert("वैध JSON फाईल निवडा.");
            }
        };

        reader.readAsText(file);
    }

    clearAllData() {
        if (!confirm("तुमचा सर्व डेटा हटवायचा आहे का? ही कृती परत करता येणार नाही.")) return;
        if (!confirm("सर्व व्यवहार, अंदाजपत्रके आणि उद्दिष्टे कायमची हटवली जातील. खात्री आहे का?")) return;

        localStorage.clear();
        alert("सर्व डेटा हटवला आहे. पान पुन्हा उघडले जात आहे.");
        window.location.reload();
    }
}

let settingsManager;

document.addEventListener("DOMContentLoaded", () => {
    settingsManager = new SettingsManager();
});
