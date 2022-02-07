from http.server import BaseHTTPRequestHandler, HTTPServer
import json

host = "localhost"
port = 8080

clean_urls = [
    "https://www.google.com/"
]

phish_urls = [
    "https://stackoverflow.com/"
]

class ScanServer(BaseHTTPRequestHandler):
    def _set_headers(self, status_code):
        self.send_response(status_code)
        self.send_header("Content-type", "application/json")
        self.end_headers()

    def do_GET(self):
        # get the target url
        for h in self.headers:
            if h == "x-target-url":
                print(f"URL:  {self.headers[h]}")
                self._set_headers(200)
                if self.headers[h] in clean_urls:
                    self.wfile.write(bytes(json.dumps({"disposition": "clean"}, ensure_ascii=False), "utf-8"))
                elif self.headers[h] in phish_urls:
                    self.wfile.write(bytes(json.dumps({"disposition": "phish"}, ensure_ascii=False), "utf-8"))
                else:
                    self.wfile.write(bytes(json.dumps({"disposition": "unknown"}, ensure_ascii=False), "utf-8"))

def main():
    print("Starting server")
    web_server = HTTPServer((host, port), ScanServer)
    try:
        web_server.serve_forever()
    except:
        pass
    web_server.server_close()
    print("Server stopped")

if __name__ == "__main__":
    main()