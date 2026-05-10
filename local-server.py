from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import sys
from urllib.parse import urlsplit, urlunsplit


class SiteHandler(SimpleHTTPRequestHandler):
    def _clean_redirect_target(self):
        url = urlsplit(self.path)
        redirects = {
            "/index.html": "/",
            "/work.html": "/work",
            "/services.html": "/services",
            "/why-choose-us.html": "/why-choose-us",
            "/pricing.html": "/pricing",
            "/care-plans.html": "/care-plans",
            "/process.html": "/process",
            "/about.html": "/about",
            "/faq.html": "/faq",
            "/contact.html": "/contact",
            "/request.html": "/request",
            "/thanks.html": "/thanks",
        }
        target = redirects.get(url.path)
        if not target:
            return None

        return urlunsplit(("", "", target, url.query, url.fragment))

    def _redirect_clean_url(self):
        target = self._clean_redirect_target()
        if not target:
            return False

        self.send_response(301)
        self.send_header("Location", target)
        self.send_header("Content-Length", "0")
        self.end_headers()
        return True

    def do_GET(self):
        if self._redirect_clean_url():
            return
        super().do_GET()

    def do_HEAD(self):
        if self._redirect_clean_url():
            return
        super().do_HEAD()

    def translate_path(self, path):
        resolved_path = Path(super().translate_path(path))
        if resolved_path.is_file() or resolved_path.is_dir():
            return str(resolved_path)

        if not resolved_path.suffix:
            html_path = resolved_path.with_suffix(".html")
            if html_path.is_file():
                return str(html_path)

        return str(resolved_path)

    def send_error(self, code, message=None, explain=None):
        if code != 404:
            super().send_error(code, message, explain)
            return

        page = Path(self.directory) / "404.html"
        if not page.is_file():
            super().send_error(code, message, explain)
            return

        content = page.read_bytes()
        self.send_response(404, "File not found")
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(content)))
        self.end_headers()
        self.wfile.write(content)


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    server = ThreadingHTTPServer(("127.0.0.1", port), SiteHandler)
    print(f"Serving Better Site at http://127.0.0.1:{port}/")
    print("Clean URLs and missing URLs are supported. Press Ctrl+C to stop.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
