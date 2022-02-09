const SCANNER_URL = "http://localhost:8080/";

const DISPOSITION_CLEAN = 'clean';
const DISPOSITION_PHISH = 'phish';
const DISPOSITION_UNKNOWN = 'unknown';

const MSG_CLEAN = 'This is a clean page!';
const MSG_PHISH = 'This is a phishing page!';
const MSG_UNKNOWN = 'This is an unknown page!';

let userIdToken = '';

// https://stackoverflow.com/questions/23822170/getting-unique-clientid-from-chrome-extension
function generateRandomToken() {
    let randomPool = new Uint8Array(32);
    crypto.getRandomValues(randomPool);
    let hex = '';
    for (let i = 0; i < randomPool.length; i++) {
        hex += randomPool[i].toString(16);
    }
    return hex;
}

function status(response) {
    if (response.status === 200) {
        return Promise.resolve(response);
    } else {
        return Promise.reject(new Error(response.status));
    }
}

function json(response) {
    return response.json();
}

function callAlert(msg) {
    alert(msg);
}

function execAlert(tabId, msg) {
    chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: callAlert,
        args: [msg]
    });
}

function scanTab(tab) {
    const options = {
        method: 'GET',
        headers: new Headers({
            'x-user-id-token': userIdToken,
            'x-target-url': tab.url
        })
    };

    fetch(SCANNER_URL, options)
        .then(status)
        .then(json)
        .then((res) => {
            if (res.disposition === DISPOSITION_CLEAN) {
                execAlert(tab.id, MSG_CLEAN);
            } else if (res.disposition === DISPOSITION_PHISH) {
                execAlert(tab.id, MSG_PHISH);
            } else {
                execAlert(tab.id, MSG_UNKNOWN);
            }
        }).catch((error) => {
            console.log("Request failed", error);
        });
}

chrome.storage.sync.get('userId', (data) => {
    let userId = data.userId;
    if (userId) {
        useToken(userId)
    } else {
        userId = generateRandomToken();
        chrome.storage.sync.set({ userId: userId }, () => {
            useToken(userId)
        });
    }

    function useToken(userId) {
        userIdToken = userId;
    }
});

chrome.action.onClicked.addListener((tab) => {
    scanTab(tab);
});
