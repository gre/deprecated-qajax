#!/usr/bin/env python

import posixpath
import BaseHTTPServer
import urllib
import cgi
import shutil
import mimetypes
from StringIO import StringIO
import SocketServer
import logging
import cgi
import os, sys, re
import time

PORT = 7778

# A modified version of SimpleHTTPServer 
# for handling POST/DELETE/PUT/GET
# add status=500 in the url to customize the http code returned by the server
# add latency=400 to make the server wait (in milliseconds)
class ServerHandler(BaseHTTPServer.BaseHTTPRequestHandler):

    def do_POST(self):
        ServerHandler.do_GET(self)

    def do_DELETE(self):
        ServerHandler.do_GET(self)

    def do_PUT(self):
        ServerHandler.do_GET(self)

    def do_GET(self):
        if self.path.split("?")[0] == "/ECHO":
          self.send_response(200)
          self.end_headers()
          content_len = int(self.headers.getheader('content-length'))
          body = self.rfile.read(content_len)
          self.wfile.write(body)
          self.rfile.close()
        else:
          f = self.send_head()
          if f:
              self.copyfile(f, self.wfile)
              f.close()

    def do_HEAD(self):
        f = self.send_head()
        if f:
            f.close()

    def send_head(self):
        path = self.translate_path(self.path)
        f = None
        if os.path.isdir(path):
            for index in "index.html", "index.htm":
                index = os.path.join(path, index)
                if os.path.exists(index):
                    path = index
                    break
            else:
                return self.list_directory(path)
        ctype = self.guess_type(path)
        if ctype.startswith('text/'):
            mode = 'r'
        else:
            mode = 'rb'
        try:
            f = open(path, mode)
        except IOError:
            self.send_error(404, "File not found")
            return None

        latencyurl = re.search("latency=([0-9]+)", self.path)
        if latencyurl:
          t = int(latencyurl.group(1))
          print "waiting", t, "ms"
          time.sleep(t/1000.)

        statusurl = re.search("status=([0-9]{3})", self.path)
        if statusurl:
          httpCode = int(statusurl.group(1))
          print "sending http code", httpCode
          self.send_response(httpCode)
        else:
          self.send_response(200)

        self.send_header("Content-Type", ctype)
        self.end_headers()
        return f

    def list_directory(self, path):
        try:
            list = os.listdir(path)
        except os.error:
            self.send_error(404, "No permission to list directory")
            return None
        list.sort(lambda a, b: cmp(a.lower(), b.lower()))
        f = StringIO()
        f.write("<title>Directory listing for %s</title>\n" % self.path)
        f.write("<h2>Directory listing for %s</h2>\n" % self.path)
        f.write("<hr>\n<ul>\n")
        for name in list:
            fullname = os.path.join(path, name)
            displayname = linkname = name = cgi.escape(name)
            # Append / for directories or @ for symbolic links
            if os.path.isdir(fullname):
                displayname = name + "/"
                linkname = name + "/"
            if os.path.islink(fullname):
                displayname = name + "@"
                # Note: a link to a directory displays with @ and links with /
            f.write('<li><a href="%s">%s</a>\n' % (linkname, displayname))
        f.write("</ul>\n<hr>\n")
        f.seek(0)
        self.send_response(200)
        self.send_header("Content-type", "text/html")
        self.end_headers()
        return f

    def translate_path(self, path):
        path = posixpath.normpath(urllib.unquote(path)).split("?")[0]
        words = path.split('/')
        words = filter(None, words)
        path = os.getcwd()
        for word in words:
            drive, word = os.path.splitdrive(word)
            head, word = os.path.split(word)
            if word in (os.curdir, os.pardir): continue
            path = os.path.join(path, word)
        return path

    def copyfile(self, source, outputfile):
        shutil.copyfileobj(source, outputfile)

    def guess_type(self, path):
        base, ext = posixpath.splitext(path)
        if self.extensions_map.has_key(ext):
            return self.extensions_map[ext]
        ext = ext.lower()
        if self.extensions_map.has_key(ext):
            return self.extensions_map[ext]
        else:
            return self.extensions_map['']

    extensions_map = mimetypes.types_map.copy()
    extensions_map.update({
        '': 'application/octet-stream', # Default
        '.py': 'text/plain',
        '.c': 'text/plain',
        '.h': 'text/plain',
        })

Handler = ServerHandler

httpd = SocketServer.TCPServer(("", PORT), Handler)

print "Please go to http://localhost:%s/test/index.html" % PORT
print "serving at port", PORT, "..."
httpd.serve_forever()
