// The idea to write a web extension came from the following article:
//  https://cujo.com/dns-hijacking-attacks-on-home-routers-in-brazil/
//
// In this article, the attacker decided to use AJAX to send requests to the router
// So, I decided a simple proxy that would block AJAX requests going to private
// IP address ranges.

// Setup proxy 
browser.proxy.onRequest.addListener(handleProxyRequest, {urls: ["<all_urls>"]});

let tabid_hostname_map = {};


function isPrivateIP(hostname)
{
    /*
        The following IPv4 address ranges are reserved by the IANA for private
        internets, and are not publicly routable on the global internet:
                
        10.0.0.0/8 IP addresses:        10.0.0.0    – 10.255.255.255
        172.16.0.0/12 IP addresses:     172.16.0.0  – 172.31.255.255
        192.168.0.0/16 IP addresses:    192.168.0.0 – 192.168.255.255
    */
    
    let parts = hostname.split(".");
    let ret = false;
    
    let octect1 = Number.parseInt(parts[0], 10);
    if (!Number.isNaN(octect1))
    {
        // check if url contains 10.x.y.z
        if (octect1 == 10)
        {
            let octect2 = Number.parseInt(parts[1], 10);
            if (!Number.isNaN(octect2) && octect2 >= 0 && octect2 <= 255)
            {
                let octect3 = Number.parseInt(parts[2], 10);
                if (!Number.isNaN(octect3) && octect3 >= 0 && octect3 <= 255)
                {
                    let octect4 = Number.parseInt(parts[3], 10);
                    if (!Number.isNaN(octect4) && octect4 >= 0 && octect4 <= 255)
                    {
                        ret = true;
                    }
                }
            }
        }
        // check if url contains 172.16.y.z - 172.31.y.z
        else if (octect1 == 172)
        {
            let octect2 = Number.parseInt(parts[1], 10);
            if (!Number.isNaN(octect2) && octect2 >= 16 && octect2 <= 31)
            {
                let octect3 = Number.parseInt(parts[2], 10);
                if (!Number.isNaN(octect3) && octect3 >= 0 && octect3 <= 255)
                {
                    let octect4 = Number.parseInt(parts[3], 10);
                    if (!Number.isNaN(octect4) && octect4 >= 0 && octect4 <= 255)
                    {
                        ret = true;
                    }
                }
            }
        }
        // check if url contains 192.168.y.z
        else if (octect1 == 192)
        {
            let octect2 = Number.parseInt(parts[1], 10);
            if (!Number.isNaN(octect2) && octect2 == 168)
            {
                let octect3 = Number.parseInt(parts[2], 10);
                if (!Number.isNaN(octect3) && octect3 >= 0 && octect3 <= 255)
                {
                    let octect4 = Number.parseInt(parts[3], 10);
                    if (!Number.isNaN(octect4) && octect4 >= 0 && octect4 <= 255)
                    {
                        ret = true;
                    }
                }
            }
        }
    }
    
    return ret;
}


function shouldBlock(main_frame_hostname)
{
    console.log(`Resolving: ${main_frame_hostname}`);
    
    let p = new Promise(function(resolve, reject) {
        let resolving = browser.dns.resolve(main_frame_hostname);
        
        resolving.then(record => {
            let isPrivate = isPrivateIP(record.addresses[0]);
            if (isPrivate)
            {
                resolve({type: "direct"});
            }
            else
            {
                resolve({type: "http", host: "127.0.0.1", port: 65535});
            }
        });
    });
    
    return p;
}


function handleProxyRequest(requestInfo)
{
    if (requestInfo.type == "main_frame")
    {
        const url = new URL(requestInfo.url);
        tabid_hostname_map[requestInfo.tabId] = url.hostname;
    }
    else if (requestInfo.type == "xmlhttprequest")
    {
        const url = new URL(requestInfo.url);
        let isPrivate = isPrivateIP(url.hostname);
        if (isPrivate)
        {
            let main_frame_hostname = tabid_hostname_map[requestInfo.tabId];
            if (main_frame_hostname != null)
            {
                return shouldBlock(main_frame_hostname);
            }
        }
    }
    
    return {type: "direct"};
}

browser.proxy.onError.addListener(error => {
    console.error(`Proxy error: ${error.message}`);
});
