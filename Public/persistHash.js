document.addEventListener('DOMContentLoaded', function () {
    const insightsLink = document.getElementById('insightsLink');
    const backLink = document.getElementById('backLink');

    // Save the hash value to local storage
    if (window.location.hash) {
        localStorage.setItem('urlHash', window.location.hash);
    }

    // Retrieve the hash value from local storage if it's not in the URL
    const storedHash = localStorage.getItem('urlHash');
    if (!window.location.hash && storedHash) {
        window.location.hash = storedHash;
    }

    // Append the hash value to the links
    if (insightsLink) {
        insightsLink.href += window.location.hash;
    }

    if (backLink) {
        backLink.href += window.location.hash;
    }
});
