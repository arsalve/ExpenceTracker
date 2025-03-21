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
        optionElement option;
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

    Plot