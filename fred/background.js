const SCANNER_URL = "http://localhost:8080/";

const TARGET_URL_HEADER = "x-target-url";

const css = `
div {
    text-align: center;
    border: 3px solid red;
    width: 300px;
    margin: 0 auto;
}`;

function scanUrl(url) {
    const p = new Promise((resolve, reject) => {
        xhr = new XMLHttpRequest();
        xhr.open("GET", SCANNER_URL, true);
        xhr.setRequestHeader(TARGET_URL_HEADER, url);
        xhr.onreadystatechange = () => {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                const status = xhr.status;
                if (status === 200) {
                    try {
                        const responseJSON = JSON.parse(xhr.responseText);
                        resolve(responseJSON);
                    } catch(error) {
                        console.log(`ERROR: ${error}`);
                    }
                } else {
                    reject(status)
                }
            }
        }
        xhr.send();
    });

    return p;
}

function messageTab(tabs) {
    browser.tabs.sendMessage(tabs[0].id, {
        replacement: "This is a phishing page!"
    });
}

function onExecuted(result) {
    let querying = browser.tabs.query({
        active: true,
        currentWindow: true
    });
    querying.then(messageTab);
}

function scanCurrentTab(tabs) {
    const tab = tabs[0];
    const url = tab.url;

    scanUrl(url).then((res) => {
        if (res.disposition === "clean") {
            console.log(`CLEAN: ${url}`);
        } else if (res.disposition === "phish") {
            console.log(`PHISH: ${url}`);
            let inserting = browser.tabs.insertCSS({code: css});
            inserting.then(null, null);
            let executing = browser.tabs.executeScript({
                file: "phishing.js"
            });
            executing.then(onExecuted);
        } else if (res.disposition === "unknown") {
            console.log(`UNKNOWN: ${url}`);
        }
    }).catch((error) => {
        console.log(`ERROR: ${error}`)
    })
}

function scan() {
    browser.tabs.query({currentWindow: true, active: true}).then(scanCurrentTab, () => {});
}

browser.browserAction.onClicked.addListener(scan);