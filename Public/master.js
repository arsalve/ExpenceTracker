// Define dropdown values
var dropdownValues = {
    "Savings": ["म्युच्युअल फंड्स", "एफडी", "आरडी", "सोने", "पीपीएफ", "इतर गुंतवणूक"],
    "Income": ["पगार", "गुंतवणूक व परतावा", "इतर उत्पन्न", "मागील बाकी"],
    "Expence": ["आहार", "किराणा", "घरातील खर्च", "परिवहन", "मनोरंजन", "दूरसंचार", "आरोग्य", "वैयक्तिक काळजी", "विमा", "कपडे", "वाहन देखरेख", "इंधन", "रोकड", "वॉलेट ट्रान्स्फर", "इतर खर्च"]
};

// Get references to the form and table elements
var form = document.querySelector('form');
const tableog = document.getElementById("entries").innerHTML;
const summuryog = document.getElementById("summury").innerHTML;
const catelog = document.getElementById("cate").innerHTML;

// Get references to the two dropdown lists
const firstDropdown = document.getElementById('ExpenseType');
const secondDropdown = document.getElementById('ExpenseOption');

// Initialize data array
var data = [];

/**
 * Define the options for the second dropdown based on the selection in the first dropdown
 */
function updateSecondDropdown() {
    // Clear the current options in the second dropdown
    secondDropdown.innerHTML = '';

    // Get the selected value from the first dropdown
    const selectedValue = firstDropdown.value;

    // Define the options for the second dropdown based on the selected value
    let options;

    switch (selectedValue) {
        case 'Savings':
            options = dropdownValues.Savings;
            break;
        case 'credit':
            options = dropdownValues.Income;
            break;
        case 'debit':
            options = dropdownValues.Expence;
            break;
        default:
            options = [];
    }

    // Add each option to the second dropdown
    for (const option of options) {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        secondDropdown.appendChild(optionElement);
    }
}

function sumArray(arr) {
    let sum = 0;
    arr.forEach(x => {
        sum += Number(x);
    });
    return sum;
}

/** Creates graphs */
function Ploy(xAxis, yAxis, parents) {
    var data = [{
        type: "pie",
        values: yAxis[0],
        labels: xAxis[0],
        textinfo: "label+percent",
        textposition: "inside",
        insidetextorientation: "radial",
        automargin: true,
        title: 'खर्च',
        marker: { colors: ['#ff7f0e', '#1f77b4', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'] }
    }];
    var data2 = [{
        type: "pie",
        values: yAxis[1],
        labels: xAxis[1],
        textinfo: "label+percent",
        insidetextorientation: "radial",
        textposition: "inside",
        automargin: true,
        title: 'बचत',
        marker: { colors: ['#ff7f0e', '#1f77b4', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'] }
    }];
    var data3 = [{
        type: "pie",
        values: yAxis[2],
        labels: xAxis[2],
        textinfo: "label+percent",
        textposition: "inside",
        automargin: true,
        title: 'उत्पन्न',
        insidetextorientation: "radial",
        marker: { colors: ['#ff7f0e', '#1f77b4', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'] }
    }]

    var layout = {
        margin: {
            autoexpand: false,
            r: 10,
            t: 10,
            l: 10,
            b: 10
        },
        autosize: true,
        paper_bgcolor: "#272822",
        plot_bgcolor: "#272822",
        font: {
            color: "#f8f8f2"
        },
        showlegend: true,
        grid: {
            rows: 1,
            columns: 1
        }
    };

    Plotly.newPlot('Exp', data, layout);
    Plotly.newPlot('Save', data2, layout);
    Plotly.newPlot('Income', data3, layout);
}

/**
 * Displays data using Plotly table
 */
function displayData() {
    document.getElementById("entries").innerHTML = tableog;
    document.getElementById("summury").innerHTML = summuryog;
    document.getElementById("cate").innerHTML = catelog;
    var allEntries = document.querySelector("#allEntries").checked;
    var today = new Date();
    if (document.querySelector("#selectMonth").value == '' && !allEntries)
        document.querySelector("#selectMonth").value = today.getFullYear() + "-" + today.toLocaleString('default', {
            month: '2-digit'
        });

    var data = {
        user: location.hash || "#" + prompt("enter your name")
    };

    if (!allEntries) {
        data.month = document.querySelector("#selectMonth").value.split("-")[1];
        data.year = document.querySelector("#selectMonth").value.split("-")[0];
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
            var total = 0;
            var savings = 0;
            var expence = 0;
            var income = 0;
            var xAxis = [
                [],
                [],
                []
            ];
            var yAxis = [
                [],
                [],
                []
            ];
            var parent = [
                [],
                [],
                []
            ];
            var counters = {
                Savings: {},
                Income: {},
                credit: {}
            };
            var tableData = {
                id: [],
                date: [],
                amount: [],
                type: [],
                description: []
            };

            data.forEach((Entry) => {
                var item = Entry.transaction;
                var element = item.description;
                var type = item.type;
                if (!counters[type]) {
                    counters[type] = {};
                }
                counters[type][element] = Number(counters[type][element] ? counters[type][element] + Number(item.amount) : Number(item.amount));

                tableData.id.push(item.id);
                tableData.date.push(item.date);
                tableData.amount.push(item.amount);
                tableData.type.push(item.type === "credit" ? "उत्पन्न" : item.type === "debit" ? "खर्च" : "बचत");
                tableData.description.push(item.description);

                if (item.type == "credit") {
                    total += Number(item.amount);
                    income += Number(item.amount);
                } else if (item.type == "Savings") {
                    savings += Number(item.amount);
                    total -= Number(item.amount);
                } else {
                    total -= Number(item.amount);
                    expence += Number(item.amount);
                }
            });

            yAxis[0] = Object.values(counters.debit);
            xAxis[0] = Object.keys(counters.debit);
            yAxis[1] = Object.values(counters.Savings);
            xAxis[1] = Object.keys(counters.Savings);
            yAxis[2] = Object.values(counters.credit);
            xAxis[2] = Object.keys(counters.credit);

            Plotly.newPlot('entries', [{
                type: 'table',
                header: {
                    values: ["क्रमांक", "दिनांक", "रक्कम", "प्रकार", "तपशील"],
                    align: "center",
                    line: { width: 1, color: 'black' },
                    fill: { color: "#49483e" },
                    font: { family: "Arial", size: 12, color: "white" }
                },
                cells: {
                    values: [tableData.id, tableData.date, tableData.amount, tableData.type, tableData.description],
                    align: "center",
                    line: { color: "black", width: 1 },
                    fill: { color: ["#272822", "#3b3a32"] },
                    font: { family: "Arial", size: 11, color: ["white"] }
                }
            }], {
                paper_bgcolor: "#272822",
                plot_bgcolor: "#272822"
            });

            Ploy(xAxis, yAxis, parent);

            Plotly.newPlot('summury', [{
                type: 'table',
                header: {
                    values: ["विवरण", "रक्कम"],
                    align: "center",
                    line: { width: 1, color: 'black' },
                    fill: { color: "#49483e" },
                    font: { family: "Arial", size: 12, color: "white" }
                },
                cells: {
                    values: [
                        ["एकूण  उत्पन्न", "एकूण खर्च", "एकूण बचत", "शिल्लक रक्कम"],
                        [income, expence, savings, total]
                    ],
                    align: "center",
                    line: { color: "black", width: 1 },
                    fill: { color: ["#272822", "#3b3a32"] },
                    font: { family: "Arial", size: 11, color: ["white"] }
                }
            }], {
                paper_bgcolor: "#272822",
                plot_bgcolor: "#272822"
            });

        })
        .catch((err) => {
            console.log(err);
        });
}

// Add an event listener to the first dropdown to update the second dropdown when it changes
firstDropdown.addEventListener('change', updateSecondDropdown);

// Add event listener to form submit button
form.addEventListener('submit', (event) => {
    event.preventDefault();

    // Get form data
    var formData = new FormData(form);
    var date = formData.get('date');
    var amount = formData.get('amount');
    var type = description = formData.get('description');

    // Validation: Check if all fields are filled
    if (!date || !amount || !type || !description) {
        alert("सर्व फील्ड्स भरावेत.");
        return;
    }

    var month = date.split("-")[1];
    var year = date.split("-")[0];
    var id = Date.now();
    var user = location.hash || "#" + prompt("enter your name");

    // Create transaction object
    var transaction = {
        date,
        amount,
        type,
        description,
        id,
        year,
        month,
    };

    // Create request object
    var req = {
        user: user,
        "transaction": [transaction]
    }

    // Convert request object to JSON string
    var json = JSON.stringify(req);

    // Make an AJAX request to your server
    var xhr = new XMLHttpRequest();
    xhr.open('POST', url + '/Insert', true);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xhr.send(json);

    // Hide save button and reset form fields
    document.getElementById("saveData").hidden = true;

    // Handle AJAX response
    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
            data = [];
            alert("Entry Saved");
            document.getElementById("saveData").hidden = false;
            document.getElementById("ammount").value = "";
            document.getElementById("date").value = "";
            document.getElementById("ExpenseType").value = "";
            document.getElementById("ExpenseOption").value = "";
        }
    }
});

/**
 * Deletes a transaction based on its ID.
 * @param {string} id - The ID of the transaction to delete.
 * @param {HTMLElement} element - The HTML element associated with the transaction.
 */
function Delete(id, element) {
    var cnf = prompt("Type confirm to delete");
    if (cnf === "confirm") {
        var user = location.hash || "#" + prompt("enter your name");
        var req = {
            user: user,
            Deid: id
        };

        var json = JSON.stringify(req);

        var xhr = new XMLHttpRequest();
        xhr.open('POST', url + '/Delete', true);
        xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
        xhr.send(json);

        element.innerHTML = "Entry is being Deleted";

        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                data = [];
                alert("Entry Deleted");
                displayData();
            }
        };
    }
}

// Initialize the second dropdown with the default options
updateSecondDropdown();