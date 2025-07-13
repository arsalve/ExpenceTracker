document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('fixedForm');
    const fixedList = document.getElementById('fixedList');
    let user = location.hash || localStorage.getItem('urlHash') || "#" + prompt("enter your name");

    function fetchFixed() {
        fetch(url + '/fixed/list', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user })
        })
        .then(res => res.json())
        .then(data => {
            fixedList.innerHTML = '<h4>नियत खर्च/बचत</h4><ul>' +
                data.map(e => `<li>${e.type === 'debit' ? 'खर्च' : 'बचत'}: ${e.description} - ₹${e.amount}</li>`).join('') +
                '</ul>';
        });
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const type = document.getElementById('type').value;
        const description = document.getElementById('description').value;
        const amount = document.getElementById('amount').value;
        fetch(url + '/fixed/add', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user, type, description, amount })
        })
        .then(res => res.json())
        .then(() => {
            form.reset();
            fetchFixed();
        });
    });

    fetchFixed();
});
