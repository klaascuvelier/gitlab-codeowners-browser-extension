chrome.storage.local.get(['host', 'token']).then(({ token, host }) => {
    if (host) {
        document.getElementById('host').value = host;
    }

    if (token) {
        document.getElementById('token').value = host;
    }
});

document
    .getElementsByTagName('form')[0]
    .addEventListener('submit', function store(event) {
        event.preventDefault();

        const host = document.getElementById('host').value;
        const token = document.getElementById('token').value;

        chrome.storage.local
            .set({ host, token })
            .then(() => {
                alert('stored');
            })
            .catch(() => {
                alert('error');
            });
    });
