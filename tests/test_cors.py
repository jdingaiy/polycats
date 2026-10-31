from pathlib import Path
import sys
import os
import threading
import unittest
from unittest.mock import patch
from http.client import HTTPConnection
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'server'))
from serve import Handler,ThreadingHTTPServer

class CorsTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.environment=patch.dict(os.environ,{'ALLOWED_ORIGINS':'https://jdingaiy.github.io'})
        cls.environment.start()
        cls.server=ThreadingHTTPServer(('127.0.0.1',0),Handler)
        cls.thread=threading.Thread(target=cls.server.serve_forever,daemon=True);cls.thread.start()
    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown();cls.server.server_close();cls.environment.stop()
    def request(self,method,origin,body=None):
        conn=HTTPConnection('127.0.0.1',self.server.server_port,timeout=5)
        conn.request(method,'/api/segment',body=body,headers={'Origin':origin,'Content-Type':'image/png','Access-Control-Request-Headers':'content-type'})
        r=conn.getresponse();data=r.read();headers=dict(r.getheaders());conn.close();return r.status,headers,data
    def test_pages_origin_preflight(self):
        status,headers,_=self.request('OPTIONS','https://jdingaiy.github.io')
        self.assertEqual(status,204);self.assertEqual(headers['Access-Control-Allow-Origin'],'https://jdingaiy.github.io');self.assertIn('Content-Type',headers['Access-Control-Allow-Headers'])
    def test_other_origin_is_not_granted(self):
        for method in ['OPTIONS','POST']:
            status,headers,_=self.request(method,'https://example.com',b'bad')
            self.assertEqual(status,403);self.assertNotIn('Access-Control-Allow-Origin',headers)
    def test_error_response_is_readable_by_allowed_frontend(self):
        status,headers,_=self.request('POST','https://jdingaiy.github.io',b'bad')
        self.assertEqual(status,422);self.assertEqual(headers['Access-Control-Allow-Origin'],'https://jdingaiy.github.io')
if __name__=='__main__':unittest.main()
