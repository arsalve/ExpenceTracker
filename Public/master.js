// Define dropdown values
var dropdownValues = {
    "Savings": ["म्युच्युअल फंड्स", "एफडी", "आरडी", "सोने", "पीपीएफ", "इतर गुंतवणूक"],
    "Income": ["पगार", "गुंतवणूक व परतावा", "इतर उत्पन्न", "मागील बाकी"],
    "Expence": ["आहार", "किराणा", "घरातील खर्च", "परिवहन", "मनोरंजन", "दूरसंचार", "आरोग्य", "वैयक्तिक काळजी", "विमा", "कपडे", "वाहन देखरेख", "इंधन", "रोकड", "वॉलेट ट्रान्स्फर", "इतर खर्च"]
};

// Get references to the form and table elements
var form = document.querySelector('form');
var table = document.querySelector('table');
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
 * Get the table element from HTML
 */
function displayData() {
    document.getElementById("entries").innerHTML = tableog;
    document.getElementById("summury").innerHTML = summuryog;
    document.getElementById("cate").innerHTML = catelog;
    var allEntries = document.querySelector("#allEntries").checked;
    var table = document.getElementById("entries");
    var summury = document.getElementById("summury");
    var cate = document.getElementById("cate");
    var today = new Date()
    if (document.querySelector("#selectMonth").value == '' && !allEntries)
        document.querySelector("#selectMonth").value = today.getFullYear() + "-" + today.toLocaleString('default', {
            month: '2-digit'
        });;

    if (allEntries) {
        var data = {
            user: location.hash || "#" + prompt("enter your name")
        }
    } else {
        var data = {
            user: location.hash || "#" + prompt("enter your name"),
            month: (document.querySelector("#selectMonth").value.split("-")[1]),
            year: (document.querySelector("#selectMonth").value.split("-")[0])
        }
    }

    fetch(url + "/find", {
            method: "POST", // or 'PUT'
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data)
        })
        .then((res) => {
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
            res.json().then((data) => {
                var TX = data;
                TX.forEach((Entry) => {
                    var item = Entry.transaction;
                    var element = item.description;
                    var type = item.type;
                    if (!counters[type]) {
                        counters[type] = {};
                        counters[type][element] = 0;
                        counters[type][element] = Number(counters[type][element] ? counters[type][element] + Number(item.amount) : Number(item.amount));
                    } else {
                        counters[type][element] = Number(counters[type][element] ? counters[type][element] + Number(item.amount) : Number(item.amount));
                    }
                    var row = document.createElement("tr");
                    var cell1 = document.createElement("td");
                    cell1.innerHTML = item.id;
                    row.appendChild(cell1);
                    var cell1 = document.createElement("td");
                    cell1.innerHTML = item.date;
                    row.appendChild(cell1);

                    var cell2 = document.createElement("td");
                    cell2.innerHTML = item.amount;
                    row.appendChild(cell2);

                    var cell3 = document.createElement("td");
                    switch (item.type) {
                        case "credit":
                            cell3.innerHTML = "उत्पन्न";
                            parent[2].push("उत्पन्न");
                            cell3.style.backgroundColor = "#12b1127d";
                            break;
                        case "debit":
                            cell3.innerHTML = "खर्च";
                            cell3.style.backgroundColor = "#b119127d";
                            parent[0].push("खर्च");
                            break;
                        case "Savings":
                            cell3.innerHTML = "बचत";
                            cell3.style.backgroundColor = "#fff0377d";
                            parent[1].push("बचत");
                            break;

                        default:
                            cell3.innerHTML = "";
                            break;
                    }
                    row.appendChild(cell3);

                    var cell4 = document.createElement("td");
                    cell4.innerHTML = item.description;
                    row.appendChild(cell4);
                    var cell5 = document.createElement("td");
                    const button = document.createElement("button");
                    button.innerText = "नोंदणी काढा";
                    button.className="btn-primary text-center"
                    button.onclick = function () {
                        Delete(Entry.transaction.id, this)
                    }
                    cell5.appendChild(button);

                    row.appendChild(cell5);

                    table.appendChild(row);
                    if (item.type == "credit") {
                        total = total + Number(item.amount);
                        income = income + Number(item.amount);
                    } else if (item.type == "Savings") {
                        savings = savings + Number(item.amount);
                        total = total - Number(item.amount);
                    } else {
                        total = total - Number(item.amount);
                        expence = expence + Number(item.amount);
                    }

                });
                yAxis[0] = Object.values(counters.debit);
                xAxis[0] = Object.keys(counters.debit);
                yAxis[1] = Object.values(counters.Savings);
                xAxis[1] = Object.keys(counters.Savings);
                yAxis[2] = Object.values(counters.credit);
                xAxis[2] = Object.keys(counters.credit);
                for (var key in counters) {

                    var subObj = counters[key];
                    for (var subKey in subObj) {
                        var SumRow = document.createElement("tr");
                        var cell1 = document.createElement("td");
                        cell1.innerHTML = subKey;

                        var cell2 = document.createElement("td");
                        cell2.innerHTML = subObj[subKey];
                        SumRow.appendChild(cell1)

                        switch (key) {
                            case "credit":

                                cell2.style.backgroundColor = "#12b1127d";

                                SumRow.appendChild(cell2)
                                break;
                            case "debit":

                                cell2.style.backgroundColor = "#b119127d";
                                SumRow.appendChild(cell2)

                                break;
                            case "Savings":

                                cell2.style.backgroundColor = "#fff0377d";
                                SumRow.appendChild(cell2)
                                break;

                            default:
                                cell2.innerHTML = "";
                                break;
                        }
                        cate.appendChild(SumRow);

                    }
                }
                Ploy(xAxis, yAxis, parent);
                var IncomeRow = document.createElement("tr");

                var cell1 = document.createElement("td");
                cell1.innerHTML = "एकूण  उत्पन्न";
                cell1.style.backgroundColor = "#12b1127d";
                IncomeRow.appendChild(cell1);

                var cell2 = document.createElement("td");
                cell2.innerHTML = income;
                IncomeRow.appendChild(cell2);

                summury.appendChild(IncomeRow);


                var expenceRow = document.createElement("tr");

                var cell1 = document.createElement("td");
                cell1.innerHTML = "एकूण खर्च";
                cell1.style.backgroundColor = "#b119127d";
                expenceRow.appendChild(cell1);

                var cell2 = document.createElement("td");
                cell2.innerHTML = expence;
                expenceRow.appendChild(cell2);
                summury.appendChild(expenceRow);

                var Savingsrow = document.createElement("tr");
                var cell1 = document.createElement("td");
                cell1.innerHTML = "एकूण बचत";
                cell1.style.backgroundColor = "#fff0377d";
                Savingsrow.appendChild(cell1);

                var cell2 = document.createElement("td");
                cell2.innerHTML = savings;
                Savingsrow.appendChild(cell2);

                summury.appendChild(Savingsrow);

                var Totalrow = document.createElement("tr");

                var cell1 = document.createElement("td");
                cell1.innerHTML = "शिल्लक रक्कम";
                Totalrow.appendChild(cell1);

                var cell2 = document.createElement("td");
                cell2.innerHTML = total;
                Totalrow.appendChild(cell2);

                summury.appendChild(Totalrow);
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
    var type = formData.get('type');
    var description = formData.get('description');

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