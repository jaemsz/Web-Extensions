VT_API_KEY = "<ENTER YOUR KEY HERE>";
VT_API_KEY_HEADER = "x-apikey";
VT_URL_SCAN_URL = "https://www.virustotal.com/api/v3/urls";
VT_GUI_URL_DETECTION_URL = "https://www.virustotal.com/gui/url/{id}/detection"

function vtScan(url)
{
    let p = new Promise(function(resolve, reject) {
        fd = new FormData();
        fd.append("url", url);
        
        xhr = new XMLHttpRequest();
        xhr.open("POST", VT_URL_SCAN_URL, true);
        xhr.setRequestHeader(VT_API_KEY_HEADER, VT_API_KEY);
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4 && xhr.status == 200)
            {
                responseJSON = JSON.parse(xhr.responseText);
                id = responseJSON.data.id.split("-")[1];
                
                vtUrl = VT_GUI_URL_DETECTION_URL;
                vtUrl = vtUrl.replace("{id}", id);
                
                resolve(vtUrl);
            }
            else if (xhr.status != 200)
            {
                reject();
            }
        }
        xhr.send(fd);
    });

    return p;
}

function onQueryTab(tabs)
{
    let tab = tabs[0];
    let request = vtScan(tab.url);
    
    request.then((url) => {
        browser.tabs.create({
            "url": url
        });
    }, () => {
        const executing = browser.tabs.executeScript({
            code: "alert('Please wait 60 seconds and try again...');"
        });
        executing.then(() => {
            console.log("Injected alert into active tab");
        });
    });
}

function onBrowserAction()
{
    // Tabs permission is required in order to make the following call
    browser.tabs.query({currentWindow: true, active: true}).then(onQueryTab, () => {});
}

function onDownload(item)
{   
    let request = vtScan(item.url);
    
    request.then((url) => {
        browser.tabs.create({
            "url": url
        });
    }, () => {
        const executing = browser.tabs.executeScript({
            code: "alert('Please wait 60 seconds and try again...');"
        });
        executing.then(() => {
            console.log("Injected alert into active tab");
        });
    });
}

browser.browserAction.onClicked.addListener(onBrowserAction);
browser.downloads.onCreated.addListener(onDownload);
