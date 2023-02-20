import { HelperService } from './services/helper';

(async function main() {
    let fileTree, myApprovals;

    const [config, url] = await Promise.all([getConfig(), getTabUrl()]);
    const helper = new HelperService(config);

    try {
        fileTree = await getFileTreeElement();
    } catch (e) {}

    if (!fileTree) {
        return;
    }

    try {
        myApprovals = await helper.getMyRequiredApprovals(url);
    } catch (e) {}

    if (myApprovals?.length) {
        visualizeMyApprovals(myApprovals);
    }
})();

async function getFileTreeElement(): Promise<HTMLElement | null> {
    return new Promise((resolve) => {
        let fileTreeEl = getQaElement('file_tree_container');

        if (fileTreeEl) {
            resolve(fileTreeEl);
            return;
        }

        const observer = new MutationObserver(() => {
            fileTreeEl = getQaElement('file_tree_container');

            if (fileTreeEl) {
                observer.disconnect();
                resolve(fileTreeEl);
                return;
            }
        });

        observer.observe(document.body, {
            attributes: true,
            childList: true,
            subtree: true,
        });
    });
}

function getTabUrl() {
    return window.location.href;
}

async function visualizeMyApprovals(myApprovals: any[]) {
    const approvalFolders = myApprovals.map((approval) => approval.name);
    const fileRowContainers = [
        ...document.querySelectorAll('.file-row.diff-file-row.folder'),
    ];

    fileRowContainers.forEach((element: HTMLElement | null) => {
        if (element) {
            const title = element.getAttribute('title') ?? '';

            if (
                title?.length > 0 &&
                !approvalFolders.some((folder) => title.includes(folder))
            ) {
                element.style.opacity = 0.35;
                element.style.background = '#999';
                element.click();
            }
        }
    });
}

async function getConfig() {
    const { host, token } = await chrome.storage.local.get(['host', 'token']);
    return { host, token };
}

function getQaElement(selector: string): HTMLElement | null {
    return document.querySelector(`[data-qa-selector="${selector}"]`);
}

function getQaElements(selector: string): HTMLElement[] {
    return [...document.querySelectorAll(`[data-qa-selector="${selector}"]`)];
}
