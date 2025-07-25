document.addEventListener('DOMContentLoaded', function () {
    // Initial fetch can be done here if needed
});

function setLoading(isLoading) {
    const insights = document.getElementById('insights');
    if (isLoading) {
        insights.classList.add('loading');
        insights.innerHTML = '<p style="font-size:1.2em;text-align:center;">लोड होत आहे...</p>';
    } else {
        insights.classList.remove('loading');
    }
}

function fetchInsights() {
    setLoading(true);
    var user = location.hash || "#" + prompt("enter your name");
    var date = document.getElementById('date').value;
    var allEntries = document.getElementById('allEntries').checked;

    var data = { user: user };
    var today = new Date()
    if (document.querySelector("#date").value == '' && !allEntries)
        document.querySelector("#date").value = today.getFullYear() + "-" + today.toLocaleString('default', {
            month: '2-digit'
        });;

    if (allEntries) {
        var data = {
            user: location.hash || "#" + prompt("enter your name")
        }
    } else {
        var data = {
            user: location.hash || "#" + prompt("enter your name"),
            month: (document.querySelector("#date").value.split("-")[1]),
            year: (document.querySelector("#date").value.split("-")[0])
        }
    }

    fetch(url + "/find", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data)
        })
        .then((res) => res.json())
        .then((data) => {
            setLoading(false);
            // Scroll to insights for mobile
            document.getElementById('insights').scrollIntoView({ behavior: 'smooth', block: 'start' });
            if (!Array.isArray(data) || data.length === 0) {
                document.getElementById('insights').innerHTML = '<p style="font-size:1.1em;text-align:center;">डेटा नाही</p>';
                clearCharts();
                clearRecommendations();
                return;
            }
            displayInsights(data);
            generateRecommendations(data);
        })
        .catch((err) => {
            setLoading(false);
            document.getElementById('insights').innerHTML = '<p style="font-size:1.1em;text-align:center;">त्रुटी!</p>';
            clearCharts();
            clearRecommendations();
            console.error('Error:', err);
        });
}

function clearCharts() {
    Plotly.purge('expChart');
    Plotly.purge('saveChart');
    Plotly.purge('incomeChart');
}

function clearRecommendations() {
    var recommendationsList = document.getElementById('recommendationsList');
    if (recommendationsList) {
        recommendationsList.innerHTML = '';
    } else {
        // Optionally log a warning for debugging
        console.warn("Element with id 'recommendationsList' not found in the DOM.");
    }
}

function displayInsights(data) {
    var totalIncome = 0;
    var totalExpenses = 0;
    var totalSavings = 0;
    var expenseCategories = {};
    var savingsCategories = {};
    var incomeCategories = {};

    data.forEach((entry) => {
        var amount = Number(entry.transaction.amount);
        var type = entry.transaction.type;
        var category = entry.transaction.description;

        if (type === 'credit') {
            totalIncome += amount;
            incomeCategories[category] = (incomeCategories[category] || 0) + amount;
        } else if (type === 'debit') {
            totalExpenses += amount;
            expenseCategories[category] = (expenseCategories[category] || 0) + amount;
        } else if (type === 'Savings') {
            totalSavings += amount;
            savingsCategories[category] = (savingsCategories[category] || 0) + amount;
        }
    });

    // Add null checks before setting innerHTML
    const totalIncomeEl = document.getElementById('totalIncome');
    if (totalIncomeEl) totalIncomeEl.innerText = `एकूण उत्पन्न: ${totalIncome}`;

    const totalExpensesEl = document.getElementById('totalExpenses');
    if (totalExpensesEl) totalExpensesEl.innerText = `एकूण खर्च: ${totalExpenses}`;

    const totalSavingsEl = document.getElementById('totalSavings');
    if (totalSavingsEl) totalSavingsEl.innerText = `एकूण बचत: ${totalSavings}`;

    const balanceEl = document.getElementById('balance');
    if (balanceEl) balanceEl.innerText = `शिल्लक रक्कम: ${totalIncome - totalExpenses - totalSavings}`;

    const expensePercentageEl = document.getElementById('expensePercentage');
    if (expensePercentageEl) expensePercentageEl.innerText = `आपल्या एकूण उत्पन्नाचा ${((totalExpenses / totalIncome) * 100).toFixed(2)}% खर्च झाला आहे.`;

    const savingsPercentageEl = document.getElementById('savingsPercentage');
    if (savingsPercentageEl) savingsPercentageEl.innerText = `आपल्या एकूण उत्पन्नाचा ${((totalSavings / totalIncome) * 100).toFixed(2)}% बचत झाली आहे.`;

    const balancePercentageEl = document.getElementById('balancePercentage');
    if (balancePercentageEl) balancePercentageEl.innerText = `आपल्या एकूण उत्पन्नाचा ${(((totalIncome - totalExpenses - totalSavings) / totalIncome) * 100).toFixed(2)}% शिल्लक आहे.`;

    plotChart('expChart', 'खर्च', expenseCategories);
    plotChart('saveChart', 'बचत', savingsCategories);
    plotChart('incomeChart', 'उत्पन्न', incomeCategories);
}

function plotChart(elementId, title, categories) {
    var labels = Object.keys(categories);
    var values = Object.values(categories);

    var data = [{
        type: "pie",
        values: values,
        labels: labels,
        textinfo: "label+percent",
        textposition: "inside",
        insidetextorientation: "radial",
        automargin: true,
        title: title
    }];

    var layout = {
        margin: {
            autoexpand: false,
            r: 5,
            t: 20,
            l: 5,
            b: 5
        },
        autosize: true,
        width: window.innerWidth < 500 ? window.innerWidth - 40 : 350,
        height: 250,
        paper_bgcolor: "#272822",
        plot_bgcolor: "#272822",
        font: {
            color: "#f8f8f2",
            size: window.innerWidth < 500 ? 12 : 16
        },
        showlegend: true,
        legend: {
            orientation: "h",
            x: 0.5,
            xanchor: "center",
            y: -0.2
        }
    };

    Plotly.newPlot(elementId, data, layout, {responsive: true});
}

function generateRecommendations(data) {
    var totalIncome = 0;
    var totalExpenses = 0;
    var totalSavings = 0;

    data.forEach((entry) => {
        var amount = Number(entry.transaction.amount);
        var type = entry.transaction.type;

        if (type === 'credit') {
            totalIncome += amount;
        } else if (type === 'debit') {
            totalExpenses += amount;
        } else if (type === 'Savings') {
            totalSavings += amount;
        }
    });

    var recommendationsList = document.getElementById('insights');
    recommendationsList.innerHTML = `
        <ul style="padding-left:0;">
        ${totalExpenses / totalIncome > 0.5 ? '<li style="padding:10px 0;font-size:1em;">आपला खर्च कमी करण्याचा प्रयत्न करा. आपला खर्च आपल्या उत्पन्नाच्या 50% पेक्षा कमी ठेवण्याचे लक्ष्य ठेवा.</li>' : ''}
        ${totalSavings / totalIncome < 0.2 ? '<li style="padding:10px 0;font-size:1em;">आपली बचत वाढवा. आपल्या उत्पन्नाच्या किमान 20% बचत करण्याचे लक्ष्य ठेवा.</li>' : ''}
        ${totalIncome - totalExpenses - totalSavings < 0 ? '<li style="padding:10px 0;font-size:1em;">आपण आपल्या उत्पन्नापेक्षा जास्त खर्च करत आहात. कर्ज टाळण्यासाठी आपला बजेट पुनरावलोकन करण्याचा विचार करा.</li>' : ''}
        ${totalIncome - totalExpenses - totalSavings > 0 ? '<li style="padding:10px 0;font-size:1em;">छान काम! आपल्याकडे सकारात्मक शिल्लक आहे. आपली संपत्ती वाढवण्यासाठी आपल्या शिल्लक रक्कम गुंतवण्याचा विचार करा.</li>' : ''}
        ${totalExpenses > 1000 ? '<li style="padding:10px 0;font-size:1em;">आपला खर्च उच्च आहे. खर्च कमी करण्यासाठी अनावश्यक खरेदी टाळा.</li>' : ''}
        ${totalIncome < 500 ? '<li style="padding:10px 0;font-size:1em;">आपले उत्पन्न कमी आहे. उत्पन्न वाढवण्यासाठी नवीन संधी शोधा.</li>' : ''}
        ${totalSavings > 1000 ? '<li style="padding:10px 0;font-size:1em;">आपली बचत चांगली आहे. आपली बचत वाढवण्यासाठी गुंतवणूक पर्यायांचा विचार करा.</li>' : ''}
        ${totalExpenses / totalIncome < 0.3 ? '<li style="padding:10px 0;font-size:1em;">आपला खर्च कमी आहे. आपल्याकडे अधिक बचत करण्याची संधी आहे.</li>' : ''}
        ${totalIncome > 2000 ? '<li style="padding:10px 0;font-size:1em;">आपले उत्पन्न चांगले आहे. आपली संपत्ती वाढवण्यासाठी विविध गुंतवणूक पर्यायांचा विचार करा.</li>' : ''}
        ${totalExpenses < 200 ? '<li style="padding:10px 0;font-size:1em;">आपला खर्च खूप कमी आहे. आपल्याकडे अधिक खर्च करण्याची क्षमता आहे.</li>' : ''}
        </ul>
    `;
}