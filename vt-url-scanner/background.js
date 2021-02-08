VT_API_KEY = "<ENTER YOUR KEY HERE>";
VT_API_KEY_HEADER = "x-apikey";
VT_URL_SCAN_URL = "https://www.virustotal.com/api/v3/urls";
VT_URL_ID_SCAN_URL = "https://www.virustotal.com/api/v3/urls/{id}";
VT_GUI_FILE_ID_DETECTION_URL = "https://www.virustotal.com/gui/file/{id}/detection";
VT_GUI_URL_DETECTION_URL = "https://www.virustotal.com/gui/url/{id}/detection"

let downloadUrls = {};

function vtScanUrl(url)
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
                resolve(id);
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

function vtScanUrlId(urlId)
{
    let vtUrl = VT_URL_ID_SCAN_URL;
    vtUrl = vtUrl.replace("{id}", urlId);
    
    let p = new Promise(function(resolve, reject) {        
        xhr = new XMLHttpRequest();
        xhr.open("GET", vtUrl, true);
        xhr.setRequestHeader(VT_API_KEY_HEADER, VT_API_KEY);
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4 && xhr.status == 200)
            {
                responseJSON = JSON.parse(xhr.responseText);
                resolve(responseJSON.data);
            }
            else if (xhr.status != 200)
            {
                reject();
            }
        }
        xhr.send();
    });

    return p;
}

function onQueryActiveTab(tabs)
{
    let tab = tabs[0];
    let scanningUrl = vtScanUrl(tab.url);
    
    scanningUrl.then((id) => {
        url = VT_GUI_URL_DETECTION_URL;
        url = url.replace("{id}", id);
        browser.tabs.create({
            "url": url
        });
    }, () => {
        const executing = browser.tabs.executeScript({
            code: "alert('Please wait 60 seconds and try again...');"
        });
        executing.then(() => {});
    });
}

function onBrowserActionClicked()
{
    // Tabs permission is required in order to make the following call
    browser.tabs.query({currentWindow: true, active: true}).then(onQueryActiveTab, () => {});
}

function onDownloadCreated(item)
{
    downloadUrls[item.id] = item.url;
}

function onDownloadChanged(delta)
{
    if (delta.state && delta.state.current == "complete")
    {
        let url = downloadUrls[delta.id];
        
        if (delta.url != null)
        {
            url = delta.url;
        }
        
        let scanningUrl = vtScanUrl(url);
        
        scanningUrl.then((id) => {
            let scanningUrlId = vtScanUrlId(id);
            
            scanningUrlId.then((data) => {
                sha256 = data.attributes.last_http_response_content_sha256;
                url = VT_GUI_FILE_ID_DETECTION_URL;
                url = url.replace("{id}", sha256);
                browser.tabs.create({
                    "url": url
                });
            });
        }, () => {
            const executing = browser.tabs.executeScript({
                code: "alert('Error: Failed to run VT scan on download URL');"
            });
            executing.then(() => {});
        });
    }
}

browser.browserAction.onClicked.addListener(onBrowserActionClicked);
// downloads permission is required in order to listen for download events
browser.downloads.onCreated.addListener(onDownloadCreated);
browser.downloads.onChanged.addListener(onDownloadChanged);
