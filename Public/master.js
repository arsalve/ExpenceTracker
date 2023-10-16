// Define dropdown values
var dropdownValues = {

    "Savings": ["म्युच्युअल फंड्स", "एफडी", "आरडी", "सोने", "पीपीएफ", "इतर गुंतवणूक"],
    "Income": ["पगार", "गुंतवणूकीचा परतावा", "इतर उत्पन्न"],
    "Expence": ["आहार", "किराणा", "घरातील खर्च", "परिवहन", "मनोरंजन", "दूरसंचार", "आरोग्य", "वैयक्तिक काळजी","विमा", "कपडे", "वाहन देखरेख", "इंधन", "रोकड", "वॉलेट ट्रान्स्फर", "इतर खर्च"]
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

// Define the options for the second dropdown based on the selection in the first dropdown
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
    // Calculation the sum using forEach
    arr.forEach(x => {
        sum += Number(x);
    });
    return sum;
}

function Ploy(xAxis, yAxis, parents) {
    // var labels=((["खर्च","बचत","उत्पन्न"].concat(xAxis[0])).concat(xAxis[1])).concat(xAxis[2])
    // var sum1=Math.abs((-sumArray(yAxis[0]))-sumArray(yAxis[1])+sumArray(yAxis[2]));
    // var Debit1=sumArray(yAxis[0]);
    // var Saving1=sumArray(yAxis[1]);
    // var Income1=sumArray(yAxis[2]);
    // var value=(([Debit1,Saving1,Income1]).concat(yAxis[0])).concat(yAxis[1])).concat(yAxis[2]);
    // var parent=((["",""].concat(parents[0])).concat(parents[1])).concat(parents[2]);
    // var dataS = [{
    //     type: "sunburst",
    //     labels: labels,
    //     parents: parent,
    //     values:  value,
    //     outsidetextfont: {size: 20, color: "#377eb8"},
    //     leaf: {opacity: 0.4},
    //     marker: {line: {width: 2}},
    //   }];

    //   var layoutS = {
    //     margin: {l: 0, r: 0, b: 0, t: 0},
    //     width: 500,
    //     height: 500
    //   };


    //   Plotly.newPlot('sunburst', dataS, layoutS);


    //

    var data = [{
        type: "pie",
        values: yAxis[0],
        labels: xAxis[0],
        textinfo: "label+percent",
        textposition: "inside",
        insidetextorientation: "radial",
        automargin: true,
        title: 'खर्च'

    }];
    var data2 = [{
        type: "pie",
        values: yAxis[1],
        labels: xAxis[1],
        textinfo: "label+percent",
        insidetextorientation: "radial",
        textposition: "inside",
        automargin: true,
        title: 'बचत'

    }];
    var data3 = [{
        type: "pie",
        values: yAxis[2],
        labels: xAxis[2],
        textinfo: "label+percent",
        textposition: "inside",
        automargin: true,
        title: 'उत्पन्न',
        insidetextorientation: "radial"
    }]

    var layout = {
        margin: {
            autoexpand: false,
r:10,t:10,l:10,b:10
        },
        autosize: true,
        grid: {
            rows: 1,
            columns: 1
        }
    };



    Plotly.newPlot('Exp', data, layout);
    Plotly.newPlot('Save', data2, layout);
    Plotly.newPlot('Income', data3, layout);


}

// Get the table element from HTML
function displayData() {
    document.getElementById("entries").innerHTML = tableog;
    document.getElementById("summury").innerHTML = summuryog;
    document.getElementById("cate").innerHTML = catelog;
    var table = document.getElementById("entries");
    var summury = document.getElementById("summury");
    var cate = document.getElementById("cate");
    var today = new Date()
    if (document.querySelector("#selectMonth").value == '')
        document.querySelector("#selectMonth").value = today.getFullYear() + "-" + today.toLocaleString('default', {
            month: '2-digit'
        });;


    var data = {
        user: location.hash || "#" + prompt("enter your name"),
        month: document.querySelector("#selectMonth").value.split("-")[1] || today.getMonth(),
        year: document.querySelector("#selectMonth").value.split("-")[0] || today.getFullYear()
    }

    fetch(url + "/find", {
            method: "POST", // or 'PUT'
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data)
        })
        .then((res) => {
            // Convert the response into a JSON object 
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
                // Loop through the data
                var TX = data;
                TX.forEach((Entry) => {
                    // Get the month from the date
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
                    // Create a new table row
                    var row = document.createElement("tr");
                    var cell1 = document.createElement("td");
                    cell1.innerHTML = item.id;
                    row.appendChild(cell1);
                    // Create and append cells for each column
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

                    // Append the row to the table
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

                }}
                Ploy(xAxis, yAxis, parent);
                var IncomeRow = document.createElement("tr");

                // Create and append cells for each column
                var cell1 = document.createElement("td");
                cell1.innerHTML = "एकूण  उत्पन्न";
                cell1.style.backgroundColor = "#12b1127d";
                IncomeRow.appendChild(cell1);

                var cell2 = document.createElement("td");
                cell2.innerHTML = income;
                IncomeRow.appendChild(cell2);

                // Append the row to the table
                summury.appendChild(IncomeRow);


                var expenceRow = document.createElement("tr");

                // Create and append cells for each column
                var cell1 = document.createElement("td");
                cell1.innerHTML = "एकूण खर्च";
                cell1.style.backgroundColor = "#b119127d";
                expenceRow.appendChild(cell1);

                var cell2 = document.createElement("td");
                cell2.innerHTML = expence;
                expenceRow.appendChild(cell2);
                // Append the row to the table
                summury.appendChild(expenceRow);

                var Savingsrow = document.createElement("tr");
                // Create and append cells for each column
                var cell1 = document.createElement("td");
                cell1.innerHTML = "एकूण बचत";
                cell1.style.backgroundColor = "#fff0377d";
                Savingsrow.appendChild(cell1);

                var cell2 = document.createElement("td");
                cell2.innerHTML = savings;
                Savingsrow.appendChild(cell2);

                // Append the row to the table
                summury.appendChild(Savingsrow);

                var Totalrow = document.createElement("tr");

                // Create and append cells for each column
                var cell1 = document.createElement("td");
                cell1.innerHTML = "शिल्लक रक्कम";
                Totalrow.appendChild(cell1);

                var cell2 = document.createElement("td");
                cell2.innerHTML = total;
                Totalrow.appendChild(cell2);

                // Append the row to the table
                summury.appendChild(Totalrow);
            });
        })
        .catch((err) => {
            // Handle any errors
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
    var month = date.split("-")[1];
    var year = date.split("-")[0];
    var amount = formData.get('amount');
    var type = formData.get('type');
    var description = formData.get('description');
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
        }
    }
});
// Initialize the second dropdown with the default options
updateSecondDropdown();