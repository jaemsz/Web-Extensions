const SCANNER_URL = "http://localhost:8080/";

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
        method: "GET",
        headers: new Headers({
            "x-target-url": tab.url
        })
    };

    fetch(SCANNER_URL, options)
        .then(status)
        .then(json)
        .then((res) => {
            if (res.disposition === "clean") {
                execAlert(tab.id, "This is a clean page!");
            } else if (res.disposition === "phish") {
                execAlert(tab.id, "This is a phishing page!");
            } else {
                execAlert(tab.id, "This is an unknown page!");
            }
        }).catch((error) => {
            console.log("Request failed", error);
        });
}

chrome.action.onClicked.addListener((tab) => {
    scanTab(tab);
});
