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

    document.getElementById('totalIncome').innerText = `एकूण उत्पन्न: ${totalIncome}`;
    document.getElementById('totalExpenses').innerText = `एकूण खर्च: ${totalExpenses}`;
    document.getElementById('totalSavings').innerText = `एकूण बचत: ${totalSavings}`;
    document.getElementById('balance').innerText = `शिल्लक रक्कम: ${totalIncome - totalExpenses - totalSavings}`;
    document.getElementById('expensePercentage').innerText = `आपल्या एकूण उत्पन्नाचा ${((totalExpenses / totalIncome) * 100).toFixed(2)}% खर्च झाला आहे.`;
    document.getElementById('savingsPercentage').innerText = `आपल्या एकूण उत्पन्नाचा ${((totalSavings / totalIncome) * 100).toFixed(2)}% बचत झाली आहे.`;
    document.getElementById('balancePercentage').innerText = `आपल्या एकूण उत्पन्नाचा ${(((totalIncome - totalExpenses - totalSavings) / totalIncome) * 100).toFixed(2)}% शिल्लक आहे.`;

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

    var recommendationsList = document.getElementById('recommendationsList');
    recommendationsList.innerHTML = `
        ${totalExpenses / totalIncome > 0.5 ? '<li>आपला खर्च कमी करण्याचा प्रयत्न करा. आपला खर्च आपल्या उत्पन्नाच्या 50% पेक्षा कमी ठेवण्याचे लक्ष्य ठेवा.</li>' : ''}
        ${totalSavings / totalIncome < 0.2 ? '<li>आपली बचत वाढवा. आपल्या उत्पन्नाच्या किमान 20% बचत करण्याचे लक्ष्य ठेवा.</li>' : ''}
        ${totalIncome - totalExpenses - totalSavings < 0 ? '<li>आपण आपल्या उत्पन्नापेक्षा जास्त खर्च करत आहात. कर्ज टाळण्यासाठी आपला बजेट पुनरावलोकन करण्याचा विचार करा.</li>' : ''}
        ${totalIncome - totalExpenses - totalSavings > 0 ? '<li>छान काम! आपल्याकडे सकारात्मक शिल्लक आहे. आपली संपत्ती वाढवण्यासाठी आपल्या शिल्लक रक्कम गुंतवण्याचा विचार करा.</li>' : ''}
        ${totalIncome < (totalExpenses +totalIncome) ? '<li>आपले उत्पन्न कमी आहे. उत्पन्न वाढवण्यासाठी नवीन संधी शोधा.</li>' : ''}
        ${totalSavings > 1000 ? '<li>आपली बचत चांगली आहे. आपली बचत वाढवण्यासाठी गुंतवणूक पर्यायांचा विचार करा.</li>' : ''}
        ${totalExpenses / totalIncome < 0.3 ? '<li>आपला खर्च कमी आहे. आपल्याकडे अधिक बचत करण्याची संधी आहे.</li>' : ''}
        ${(totalExpenses+totalSavings)-totalIncome  >0? '<li>आपले उत्पन्न चांगले आहे. आपली संपत्ती वाढवण्यासाठी विविध गुंतवणूक पर्यायांचा विचार करा.</li>' : ''}
        ${totalExpenses < 200 ? '<li>आपला खर्च खूप कमी आहे. आपल्याकडे अधिक खर्च करण्याची क्षमता आहे.</li>' : ''}
    `;
    
}