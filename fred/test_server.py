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
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET")
        self.send_header("Access-Control-Allow-Headers", "Content-Type", "x-target-url")
        self.end_headers()

    def do_GET(self):
        # get the target url
        if "x-target-url" in self.headers:
            target_url = self.headers["x-target-url"]
            print(f"URL:  {target_url}")
            self._set_headers(200)
            if target_url in clean_urls:
                self.wfile.write(bytes(json.dumps({"disposition": "clean"}, ensure_ascii=False), "utf-8"))
            elif target_url in phish_urls:
                self.wfile.write(bytes(json.dumps({"disposition": "phish"}, ensure_ascii=False), "utf-8"))
            else:
                self.wfile.write(bytes(json.dumps({"disposition": "unknown"}, ensure_ascii=False), "utf-8"))
        else:
            self._set_headers(404)

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
