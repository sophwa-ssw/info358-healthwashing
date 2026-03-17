#!/usr/bin/env python3
"""Dev server with static file serving, hotspot save, and checkout save."""

import http.server
import json
import os

try:
    from pymongo import MongoClient
except ImportError:
    MongoClient = None

PORT = int(os.environ.get("PORT", 8080))
ROOT = os.path.dirname(os.path.abspath(__file__))
HOTSPOTS_FILE = os.path.join(ROOT, 'src', 'data', 'hotspots.json')

# MongoDB Atlas connection settings.
# Preferred: provide full URI via MONGODB_URI (e.g. from GitHub Secrets).
# Falls back to local MongoDB for dev if not set.
MONGODB_URI = os.environ.get('MONGODB_URI') or 'mongodb://localhost:27017/'
MONGODB_DB = 'info358_healthwashing'
MONGODB_COLLECTION = 'checkouts'

ALLOWED_KEYS = {'front', 'ingredients', 'nutrition'}
ALLOWED_PRODUCTS = {'vitaminwater', 'cliff-bar', 'activia-yogurt', 'skinny-pop', 'nature-valley-bars', 'naked-juice'}


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
        elif self.path == '/checkout':
            length = int(self.headers.get('Content-Length', 0))
            body = json.loads(self.rfile.read(length))

            if not isinstance(body, dict):
                self._error(400, 'Checkout payload must be an object')
                return

            try:
                validate_checkout_payload(body)
                inserted_id = save_checkout(body)

                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'ok': True, 'insertedId': inserted_id}).encode())
                print(f'[saved] checkout {inserted_id}')
            except ValueError as e:
                self._error(400, str(e))
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


def validate_checkout_payload(data):
    missing = ALLOWED_PRODUCTS - set(data.keys())
    extra = set(data.keys()) - ALLOWED_PRODUCTS

    if missing:
        raise ValueError(f'Missing product fields: {sorted(missing)}')
    if extra:
        raise ValueError(f'Unexpected product fields: {sorted(extra)}')

    for product_id, value in data.items():
        if not isinstance(value, bool):
            raise ValueError(f'Product "{product_id}" must be a boolean')


def save_checkout(data):
    if MongoClient is None:
        raise RuntimeError('pymongo is not installed. Install it with "pip install pymongo".')

    client = MongoClient(MONGODB_URI)
    collection = client[MONGODB_DB][MONGODB_COLLECTION]
    result = collection.insert_one(data)
    client.close()
    return str(result.inserted_id)


if __name__ == '__main__':
    print(f'Serving at http://localhost:{PORT}')
    print(f'Annotation tool: http://localhost:{PORT}/annotate.html')
    print(f'Game: http://localhost:{PORT}')
    server = http.server.HTTPServer(('', PORT), Handler)
    server.serve_forever()
