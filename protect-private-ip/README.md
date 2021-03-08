
## What it does

This extension uses the proxy API listener `onRequest` to listen for AJAX requests.  After reading an article about DNS hijacking in Brazil, I decided to write a simple web extension that would use the proxy API listener `onRequest` to listen for AJAX requests and block it if the main frame hostname is not a private IP address.

To try out this extension:
* install it
* visit `http://10.0.0.1` and see it is not blocked
* visit a website that makes an AJAX request to 10.0.0.1, where website is not private IP address, and see it is blocked
* visit some pages that do not make AJAX requests to 10.0.0.1 to see it is not blocking.
