#!/usr/bin/env python3

from __future__ import print_function, unicode_literals, division, absolute_import
import cherrypy
import argparse
import time
import os
import sys
from pynlpl.formats import folia

def fake_wait_for_occupied_port(host, port): return


class NoSuchDocument(Exception):
    pass

class DocStore(dict):
    def __init__(self, workdir, expiretime):
        self.workdir = workdir
        self.expiretime = expiretime
        self.lastchange = {}
        super().__init__()

    def getfilename(self, key):
        assert isinstance(key, tuple) and len(key) == 2
        return self.workdir + '/' + key[0] + '/' + key[1] + '.folia.xml'

    def load(self,key):
        filename = self.getfilename(key)
        if not filename in self:
            if not os.path.exists(filename):
                raise NoSuchDocument
            self[key] = folia.Document(file=filename)
            self.lastchange[key] = time.time()

    def unload(self, key, save=True):
        if key in self:
            if save:
                self[key].save()
            del self[key]
            del self.lastchange[key]
        else:
            raise NoSuchDocument

    def __getitem__(self, key):
        assert isinstance(key, tuple) and len(key) == 2
        self.load(key)
        super().__getitem__(key)

    def autounload(self, save=True):
        unload = []
        for key, t in self.lastchange.items():
            if t > time.time() + self.expiretime:
                unload.append(key)

        for key in unload:
            self.unload(key, save)




class Root:
    def __init__(self,docstore,args):
        self.docstore = docstore
        self.workdir = args.workdir

    @cherrypy.expose
    def makenamespace(self, namespace):
        namepace = namespace.replace('/','').replace('..','')
        os.mkdir(self.workdir + '/' + namespace)
        return "ok"

    @cherrypy.expose
    def getdocjson(self, namespace, docid, **args):
        namepace = namespace.replace('/','').replace('..','')
        try:
            self.docstore[(namespace,docid)]
        except NoSuchDocument:
            raise cherrypy.HTTPError(404, "Document not found: " + namespace + "/" + docid)


    @cherrypy.expose
    def getdocxml(self, namespace, docid, **args):
        namepace = namespace.replace('/','').replace('..','')
        try:
            return self.docstore[(namespace,docid)].xmlstring()
        except NoSuchDocument:
            raise cherrypy.HTTPError(404, "Document not found: " + namespace + "/" + docid)

def main():
    import argparse
    parser = argparse.ArgumentParser(description="", formatter_class=argparse.ArgumentDefaultsHelpFormatter)
    parser.add_argument('-d','--workdir', type=str,help="Work directory", action='store',required=True)
    parser.add_argument('-p','--port', type=int,help="Port", action='store',default=8080,required=False)
    parser.add_argument('--expirationtime', type=int,help="Expiration time in seconds, documents will be unloaded from memory after this period of inactivity", action='store',default=900,required=False)
    args = parser.parse_args()
    #args.storeconst, args.dataset, args.num, args.bar
    cherrypy.config.update({
        'server.socket_host': '0.0.0.0',
        'server.socket_port': args.port,
    })
    cherrypy.process.servers.wait_for_occupied_port = fake_wait_for_occupied_port
    docstore = DocStore(args.workdir, args.expirationtime)
    cherrypy.quickstart(Root(docstore,args))

if __name__ == '__main__':
    main()
