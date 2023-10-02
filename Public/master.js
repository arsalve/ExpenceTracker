// Define dropdown values
var dropdownValues = {
    "Savings": ["Mutual Funds", "FD", "RD", "Gold", "LIC/Insurance policies", "PPF"],
    "Income": ["Salary", "Return on Investmen", "Income-Other"],
    "Expence": ["Food", "HouseHold expence", "Transportation", "Entertainment", "Communication",
        "Personal care", "Clothing", "Vehicle Maintenance", "Fule"
    ]
};
// Get references to the form and table elements
var form = document.querySelector('form');
var table = document.querySelector('table');
const tableog = document.getElementById("entries").innerHTML;
const summuryog = document.getElementById("summury").innerHTML;
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
// Get the table element from HTML
function displayData() {
    document.getElementById("entries").innerHTML = tableog;
    document.getElementById("summury").innerHTML = summuryog;
    var table = document.getElementById("entries");
    var summury = document.getElementById("summury");
    var today = new Date()

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
            res.json().then((data) => {
                // Loop through the data
                var TX = data[0].transaction;
                TX.forEach((item) => {
                    // Get the month from the date

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
                    cell3.innerHTML = item.type;
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


                var IncomeRow = document.createElement("tr");

                // Create and append cells for each column
                var cell1 = document.createElement("td");
                cell1.innerHTML = "एकूण  उत्पन्न";
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



