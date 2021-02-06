VT_API_KEY = "<ENTER YOUR KEY HERE>";
VT_URL_SCAN_URL = "https://www.virustotal.com/api/v3/urls";
VT_URL_DETECTION_URL = "https://www.virustotal.com/gui/url/{id}/detection"
VT_API_KEY_HEADER = "x-apikey";

function onQueryTab(tabs)
{
    tab = tabs[0];

    fd = new FormData();
    fd.append("url", tab.url);
    
    xhr = new XMLHttpRequest();
    xhr.open("POST", VT_URL_SCAN_URL, true);
    xhr.setRequestHeader(VT_API_KEY_HEADER, VT_API_KEY);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200)
        {
            responseJSON = JSON.parse(xhr.responseText);
            id = responseJSON.data.id.split("-")[1];
            
            vtUrl = VT_URL_DETECTION_URL;
            vtUrl = vtUrl.replace("{id}", id);
            
            browser.tabs.create({
                "url": vtUrl
            });
        }
        else if (xhr.status != 200)
        {
            alert("Please wait 60 seconds and try again...");
        }
    }
    xhr.send(fd);
}

function openVT()
{
    // Tabs permission is required in order to make the following call
    browser.tabs.query({currentWindow: true, active: true}).then(onQueryTab, console.error);
}

browser.browserAction.onClicked.addListener(openVT);