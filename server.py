#!/usr/bin/env python3
"""Dev server with static file serving + hotspot save endpoint."""

import http.server
import json
import os

PORT = 8080
ROOT = os.path.dirname(os.path.abspath(__file__))
HOTSPOTS_FILE = os.path.join(ROOT, 'src', 'data', 'hotspots.json')

ALLOWED_KEYS = {'front', 'ingredients', 'nutrition'}


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def do_GET(self):
        if self.path == '/get-hotspots':
            try:
                data = read_hotspots()
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(data).encode())
            except Exception as e:
                self._error(500, str(e))
        else:
            super().do_GET()

    def do_POST(self):
        if self.path == '/save-hotspots':
            length = int(self.headers.get('Content-Length', 0))
            body = json.loads(self.rfile.read(length))
            product_id = body.get('productId')
            image_key = body.get('imageKey')
            hotspots = body.get('hotspots', [])

            if not product_id:
                self._error(400, 'Missing productId')
                return
            if image_key not in ALLOWED_KEYS:
                self._error(400, f'Invalid imageKey: {image_key}')
                return

            try:
                data = read_hotspots()
                if product_id not in data:
                    data[product_id] = {'front': [], 'ingredients': [], 'nutrition': []}
                data[product_id][image_key] = hotspots
                write_hotspots(data)

                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'ok': True}).encode())
                print(f'[saved] {len(hotspots)} {image_key} hotspots for "{product_id}"')
            except Exception as e:
                self._error(500, str(e))
        else:
            self.send_response(404)
            self.end_headers()

    def _error(self, code, msg):
        self.send_response(code)
        self.end_headers()
        self.wfile.write(msg.encode())


def read_hotspots():
    with open(HOTSPOTS_FILE, 'r') as f:
        return json.load(f)


def write_hotspots(data):
    with open(HOTSPOTS_FILE, 'w') as f:
        json.dump(data, f, indent=2)
        f.write('\n')


if __name__ == '__main__':
    print(f'Serving at http://localhost:{PORT}')
    print(f'Annotation tool: http://localhost:{PORT}/annotate.html')
    print(f'Game: http://localhost:{PORT}')
    server = http.server.HTTPServer(('', PORT), Handler)
    server.serve_forever()
