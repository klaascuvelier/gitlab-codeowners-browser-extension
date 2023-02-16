chrome.webNavigation.onCompleted.addListener(function ({
    url,
}: {
    url: string;
}) {
    Promise.all([
        chrome.tabs.query({ active: true }).then((tabs) => tabs[0] ?? null),
        chrome.storage.local
            .get(['host'])
            .then((result: Record<string, unknown>) => result['host']),
    ]).then(([tab, host]) => {
        if (url.startsWith(host) && url.endsWith('/diffs')) {
            console.log('Bootstrapping extension...');
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['content.js'],
            });
        }
    });
});
