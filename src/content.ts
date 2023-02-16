console.log('CONTENT');
console.log(window.document);

let bootstrapped = false;

const observer = new MutationObserver(async () => {
    if (!bootstrapped) {
        const fileTreeContainer = getQaElement('file_tree_container');

        if (fileTreeContainer) {
            await bootstrapApp(fileTreeContainer);
            observer.disconnect();
        }
    }
});
observer.observe(document, { childList: true, subtree: true });

async function bootstrapApp(fileTreeContainer: HTMLElement) {
    bootstrapped = true;

    if (fileTreeContainer) {
        const iframe = document.createElement('iframe');
        iframe.setAttribute('src', chrome.runtime.getURL('index.html'));
        iframe.style.border = 'none';
        fileTreeContainer.prepend(iframe);
    }
}

function getQaElement(selector: string): HTMLElement | null {
    return document.querySelector(`[data-qa-selector="${selector}"]`);
}
