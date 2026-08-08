#!/usr/bin/env python3
"""A fake deployment for the hook suite. Stdlib only, loopback only, no outbound calls.

Usage: fakeserver.py GOOD|BAD|REDIRECT [port] [protected_path] [revision]
  GOOD      /health 200, protected 403, /version serves <revision>
  BAD       /health 500, protected 200 (open), /version serves a stale build
  REDIRECT  protected 302 — a redirect is not a refusal
"""
import sys
from http.server import BaseHTTPRequestHandler, HTTPServer

MODE = sys.argv[1] if len(sys.argv) > 1 else "GOOD"
PORT = int(sys.argv[2]) if len(sys.argv) > 2 else 8731
PROTECTED = sys.argv[3] if len(sys.argv) > 3 else "/api/me"
REVISION = sys.argv[4] if len(sys.argv) > 4 else "rev-good"


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/health":
            code, body = (500, "down") if MODE == "BAD" else (200, "ok")
        elif self.path == PROTECTED:
            code, body = {"GOOD": (403, "denied"), "BAD": (200, "open"),
                          "REDIRECT": (302, "")}[MODE]
        elif self.path == "/version":
            code, body = 200, ("stale-build" if MODE == "BAD" else REVISION)
        else:
            code, body = 404, "no such path"
        raw = body.encode()
        self.send_response(code)
        if code == 302:
            self.send_header("Location", "/login")
        self.send_header("Content-Length", str(len(raw)))
        self.end_headers()
        self.wfile.write(raw)

    def log_message(self, *args):
        pass


HTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
