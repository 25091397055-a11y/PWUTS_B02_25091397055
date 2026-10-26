"""Server HTTP sederhana: file statis + POST /api/pengajuan (disimpan ke data/pengajuan.json).
Jalankan: python server.py  ->  http://localhost:8000"""
import json, os
from datetime import datetime
from http.server import SimpleHTTPRequestHandler, HTTPServer

FILE = os.path.join('data', 'pengajuan.json')

class H(SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path != '/api/pengajuan':
            return self.send_error(404)
        try:
            d = json.loads(self.rfile.read(int(self.headers.get('Content-Length', 0))))
        except ValueError:
            return self.send_error(400)
        os.makedirs('data', exist_ok=True)
        rows = json.load(open(FILE, encoding='utf-8')) if os.path.exists(FILE) else []
        d.update(id=len(rows) + 1, status='Menunggu Review', waktu=datetime.now().isoformat(timespec='seconds'))
        rows.append(d)
        json.dump(rows, open(FILE, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
        body = json.dumps({'ok': True, 'id': d['id']}).encode()
        self.send_response(201); self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(body))); self.end_headers(); self.wfile.write(body)

if __name__ == '__main__':
    print('Buka http://localhost:8000'); HTTPServer(('', 8000), H).serve_forever()
