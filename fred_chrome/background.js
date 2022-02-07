const SCANNER_URL = "http://localhost:8080/";

const TARGET_URL_HEADER = "x-target-url";

const css = `
div {
    text-align: center;
    border: 3px solid red;
    width: 300px;
    margin: 0 auto;
}`;

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

function scanTab(tab) {
    const options = {
        method: "GET",
        headers: new Headers({
            TARGET_URL_HEADER: tab.url
        })
    };

    fetch(SCANNER_URL, options)
        .then(status)
        .then(json)
        .then((res) => {
            if (res.disposition === "clean") {
                console.log(`CLEAN: ${tab.url}`);
                // change icon to green
            } else if (res.disposition === "phish") {
                console.log(`PHISH: ${tab.url}`);
                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    files: ["phishing.js"]
                });
                // change icon to red
            } else {
                console.log(`UNKNOWN: ${tab.url}`);
                // change icon to yellow
            }
        }).catch((error) => {
            console.log("Request failed", error);
        });
}

chrome.action.onClicked.addListener((tab) => {
    const url = tab.url;
    scanTab(tab);
});