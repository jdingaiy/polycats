import argparse
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
import mimetypes
import os
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).parent))
from segment import process_image
ROOT = Path(__file__).resolve().parents[1]
MAX_UPLOAD = 32 * 1024 * 1024
STATIC = {'index.html', 'style.css', 'app.js', 'cat.js', 'dist/polycats-demo.html'}

class Handler(BaseHTTPRequestHandler):
    def send_json(self, status, payload):
        data = json.dumps(payload, ensure_ascii=False).encode()
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(data)))
        self.send_header('Cache-Control', 'no-store')
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        path = self.path.split('?', 1)[0]
        if path == '/api/health':
            return self.send_json(200, {'ok': True})
        path = 'index.html' if path == '/' else path.lstrip('/')
        if path not in STATIC or not (ROOT / path).is_file():
            return self.send_json(404, {'error': '未找到页面。'})
        data = (ROOT / path).read_bytes()
        self.send_response(200)
        self.send_header('Content-Type', mimetypes.guess_type(path)[0] or 'application/octet-stream')
        self.send_header('Content-Length', str(len(data)))
        self.send_header('Cache-Control', 'no-cache')
        self.end_headers()
        self.wfile.write(data)

    def do_POST(self):
        if self.path != '/api/segment':
            return self.send_json(404, {'error': '未找到服务。'})
        try:
            size = int(self.headers.get('Content-Length', '0'))
            if not 0 < size <= MAX_UPLOAD:
                return self.send_json(413, {'error': '请选择不超过 32 MB 的图片。'})
            self.connection.settimeout(60)
            data = self.rfile.read(size)
            if len(data) != size:
                return self.send_json(400, {'error': '图片上传不完整，请重试。'})
            result = process_image(data)
        except ValueError as exc:
            return self.send_json(422, {'error': str(exc)})
        except (BrokenPipeError, ConnectionResetError):
            return
        except Exception:
            self.log_error('Image segmentation failed')
            return self.send_json(500, {'error': '图片处理失败，请重试。首次使用需要下载模型。'})
        return self.send_json(200, result)

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', type=int, default=int(os.environ.get('PORT', '8000')))
    parser.add_argument('--host', default='0.0.0.0')
    args = parser.parse_args()
    print(f'Polycats server listening on port {args.port}', flush=True)
    ThreadingHTTPServer((args.host, args.port), Handler).serve_forever()
