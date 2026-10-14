#!/usr/bin/env python3
"""Serve the site folder the way GitHub Pages does, for the browser tests. Standard library only.

Like `python3 -m http.server`, except that an address that is not a file (at any depth, /a/b/c) gets the site's own
404.html with status 404, as GitHub Pages answers it. tests/conftest.py uses Handler; CI runs this file.

Usage: python3 .github/scripts/serve.py _site [port]   (default port 8080, on 127.0.0.1)
"""
import functools
import http.server
import os
import sys


class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

    def send_error(self, code, message=None, explain=None):
        page = os.path.join(self.directory, '404.html')
        if code != 404 or not os.path.isfile(page):
            return super().send_error(code, message, explain)
        with open(page, 'rb') as f:
            body = f.read()
        self.send_response(404)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        if self.command != 'HEAD':
            self.wfile.write(body)


def handler(directory):
    return functools.partial(Handler, directory=str(directory))


if __name__ == '__main__':
    folder = sys.argv[1] if len(sys.argv) > 1 else '_site'
    port = int(sys.argv[2]) if len(sys.argv) > 2 else 8080
    server = http.server.ThreadingHTTPServer(('127.0.0.1', port), handler(os.path.abspath(folder)))
    print(f'Serving {folder}/ on http://127.0.0.1:{port}/ (unknown addresses get 404.html)', flush=True)
    server.serve_forever()
