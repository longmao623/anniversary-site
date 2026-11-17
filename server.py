#!/usr/bin/env python3
"""Simple HTTP server for PWA development with correct MIME types."""
import http.server
import socketserver
import mimetypes

PORT = 8080

# Register PWA MIME types
mimetypes.add_type('application/manifest+json', '.json')
mimetypes.add_type('application/javascript', '.js')
mimetypes.add_type('font/woff2', '.woff2')

class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers for PWA
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

    def log_message(self, format, *args):
        pass  # Suppress logs

if __name__ == '__main__':
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"Serving at http://localhost:{PORT}/index666.html")
        httpd.serve_forever()
