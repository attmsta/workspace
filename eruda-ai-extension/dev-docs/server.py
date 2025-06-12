#!/usr/bin/env python3
"""
Simple HTTP server for testing the Eruda AI Assistant extension.
Serves the demo page and handles CORS for development.
"""

import http.server
import socketserver
import os
import sys
from urllib.parse import urlparse

class CORSHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def log_message(self, format, *args):
        # Custom logging format
        print(f"[{self.log_date_time_string()}] {format % args}")

def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 12000
    
    # Change to the extension directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    with socketserver.TCPServer(("0.0.0.0", port), CORSHTTPRequestHandler) as httpd:
        print(f"🚀 Eruda AI Assistant Demo Server")
        print(f"📍 Serving at: http://localhost:{port}")
        print(f"🌐 External URL: https://work-1-vtyugejgbscktilp.prod-runtime.all-hands.dev")
        print(f"📄 Demo page: http://localhost:{port}/demo.html")
        print(f"🔧 Extension files available for loading")
        print(f"\n💡 To test the extension:")
        print(f"   1. Load the extension in Chrome (chrome://extensions/)")
        print(f"   2. Visit the demo page")
        print(f"   3. Open Eruda and find the AI Assistant tab")
        print(f"\n🛑 Press Ctrl+C to stop the server")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n👋 Server stopped")

if __name__ == "__main__":
    main()