document.addEventListener('DOMContentLoaded', function () {
    // Initial fetch can be done here if needed
});

function fetchInsights() {
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
            displayInsights(data);
            generateRecommendations(data);
        })
        .catch((err) => {
            console.error('Error:', err);
        });
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

    var insightsDiv = document.getElementById('insights');
    insightsDiv.innerHTML = `
        <h3>Insights</h3>
        <p>एकूण उत्पन्न: ${totalIncome}</p>
        <p>एकूण खर्च: ${totalExpenses}</p>
        <p>एकूण बचत: ${totalSavings}</p>
        <p>शिल्लक रक्कम: ${totalIncome - totalExpenses - totalSavings}</p>
        <p>आपल्या एकूण उत्पन्नाचा ${((totalExpenses / totalIncome) * 100).toFixed(2)}% खर्च झाला आहे.</p>
        <p>आपल्या एकूण उत्पन्नाचा ${((totalSavings / totalIncome) * 100).toFixed(2)}% बचत झाली आहे.</p>
        <p>आपल्या एकूण उत्पन्नाचा ${(((totalIncome - totalExpenses - totalSavings) / totalIncome) * 100).toFixed(2)}% शिल्लक आहे.</p>
    `;

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
            r: 10,
            t: 10,
            l: 10,
            b: 10
        },
        autosize: true,
        paper_bgcolor: "#272822", // Monokai background
        plot_bgcolor: "#272822", // Monokai background
        font: {
            color: "#f8f8f2" // Monokai foreground
        },
        showlegend: true,
        grid: {
            rows: 1,
            columns: 1
        }
    };

    Plotly.newPlot(elementId, data, layout);
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

    var recommendationsDiv = document.getElementById('recommendations');
    recommendationsDiv.innerHTML = `
        <h3>शिफारसी</h3>
        <p>आपल्या आर्थिक अहवालाच्या आधारे, येथे काही शिफारसी आहेत:</p>
        <ul>
            ${totalExpenses / totalIncome > 0.5 ? '<li>आपला खर्च कमी करण्याचा प्रयत्न करा. आपला खर्च आपल्या उत्पन्नाच्या 50% पेक्षा कमी ठेवण्याचे लक्ष्य ठेवा.</li>' : ''}
            ${totalSavings / totalIncome < 0.2 ? '<li>आपली बचत वाढवा. आपल्या उत्पन्नाच्या किमान 20% बचत करण्याचे लक्ष्य ठेवा.</li>' : ''}
            ${totalIncome - totalExpenses - totalSavings < 0 ? '<li>आपण आपल्या उत्पन्नापेक्षा जास्त खर्च करत आहात. कर्ज टाळण्यासाठी आपला बजेट पुनरावलोकन करण्याचा विचार करा.</li>' : ''}
            ${totalIncome - totalExpenses - totalSavings > 0 ? '<li>छान काम! आपल्याकडे सकारात्मक शिल्लक आहे. आपली संपत्ती वाढवण्यासाठी आपल्या शिल्लक रक्कम गुंतवण्याचा विचार करा.</li>' : ''}
        </ul>
    `;
}