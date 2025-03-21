// Define dropdown values
var dropdownValues = {
    "Savings": ["म्युच्युअल फंड्स", "एफडी", "आरडी", "सोने", "पीपीएफ", "इतर गुंतवणूक"],
    "Income": ["पगार", "गुंतवणूक व परतावा", "इतर उत्पन्न", "मागील बाकी"],
    "Expence": ["आहार", "किराणा", "घरातील खर्च", "परिवहन", "मनोरंजन", "दूरसंचार", "आरोग्य", "वैयक्तिक खर्च"]
};

// Get references to the form and table elements
var form = document.querySelector('form');
const tableog = document.getElementById("entries").innerHTML;
const summuryog = document.getElementById("summury").innerHTML;
const catelog = document.getElementById("cate").innerHTML;

// Get references to the two dropdown lists
const firstDropdown = document.getElementById('ExpenseType');
const secondDropdown = document.getElementById('ExpenseOption');

function updateSecondDropdown() {
    secondDropdown.innerHTML = '';
    const selectedValue = firstDropdown.value;
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
            var tableData = [];

            data.forEach((Entry) => {
                var item = Entry.transaction;
                var element = item.description;
                var type = item.type;
                if (!counters[type]) {
                    counters[type] = {};
                }
                counters[type][element] = Number(counters[type][element] ? counters[type][element] + Number(item.amount) : Number(item.amount));

                tableData.push(`
                    <tr>
                        <td>${tableData.length + 1}</td>
                        <td>${item.date}</td>
                        <td>${item.amount}</td>
                        <td>${item.type === "credit" ? "उत्पन्न" : item.type === "debit" ? "खर्च" : "बचत"}</td>
                        <td>${item.description}</td>
                        <td><button onClick="Delete('${item.id}', this)">Delete</button></td>
                    </tr>
                `);

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

            document.getElementById("entries").innerHTML = `
                <thead>
                    <tr>
                        <th>क्रमांक</th>
                        <th>दिनांक</th>
                        <th>रक्कम</th>
                        <th>प्रकार</th>
                        <th>तपशील</th>
                        <th>नोंदणी काढा</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableData.join('')}
                </tbody>
            `;

            document.getElementById("summury").innerHTML = `
                <thead>
                    <tr>
                        <th>विवरण</th>
                        <th>रक्कम</th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td>एकूण  उत्पन्न</td><td>${income}</td></tr>
                    <tr><td>एकूण खर्च</td><td>${expence}</td></tr>
                    <tr><td>एकूण बचत</td><td>${savings}</td></tr>
                    <tr><td>शिल्लक रक्कम</td><td>${total}</td></tr>
                </tbody>
            `;
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

    // Get form data using CSS selectors
    var date = document.querySelector('#date').value;
    var amount = document.querySelector('#ammount').value;
    var type = document.querySelector('#ExpenseType').value;
    var description = document.querySelector('#ExpenseOption').value;

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
            document.querySelector("#ammount").value = "";
            document.querySelector("#date").value = "";
            document.querySelector("#ExpenseType").value = "";
            document.querySelector("#ExpenseOption").value = "";
            displayData();
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