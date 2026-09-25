import http.server, socketserver, sys
PORT=int(sys.argv[1])
class Threading(http.server.ThreadingHTTPServer):
    allow_reuse_address=True
with Threading(("",PORT), http.server.SimpleHTTPRequestHandler) as httpd:
    httpd.serve_forever()
