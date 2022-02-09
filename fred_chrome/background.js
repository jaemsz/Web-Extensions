const SCANNER_URL = "http://localhost:8080/";

const disposition_clean = 'clean';
const disposition_phish = 'phish';
const disposition_unknown = 'unknown';

const msg_clean = 'This is a clean page!';
const msg_phish = 'This is a phishing page!';
const msg_unknown = 'This is an unknown page!';

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
            if (res.disposition === disposition_clean) {
                execAlert(tab.id, msg_clean);
            } else if (res.disposition === disposition_phish) {
                execAlert(tab.id, msg_phish);
            } else {
                execAlert(tab.id, msg_unknown);
            }
        }).catch((error) => {
            console.log("Request failed", error);
        });
}

chrome.action.onClicked.addListener((tab) => {
    scanTab(tab);
});
