#!/usr/bin/env python3

from __future__ import print_function, unicode_literals, division, absolute_import
import cherrypy
import argparse
import time
import os
import sys
import json
from pynlpl.formats import folia

def fake_wait_for_occupied_port(host, port): return


class NoSuchDocument(Exception):
    pass

class DocStore:
    def __init__(self, workdir, expiretime):
        self.workdir = workdir
        self.expiretime = expiretime
        self.data = {}
        self.lastchange = {}
        super().__init__()

    def getfilename(self, key):
        assert isinstance(key, tuple) and len(key) == 2
        return self.workdir + '/' + key[0] + '/' + key[1] + '.folia.xml'

    def load(self,key):
        filename = self.getfilename(key)
        if not key in self:
            if not os.path.exists(filename):
                raise NoSuchDocument
            print("Loading " + filename,file=sys.stderr)
            self.data[key] = folia.Document(file=filename)
            self.lastchange[key] = time.time()

    def unload(self, key, save=True):
        if key in self:
            if save:
                print("Saving " + "/".join(key),file=sys.stderr)
                self.data[key].save()
            print("Unloading " + "/".join(key),file=sys.stderr)
            del self.data[key]
            del self.lastchange[key]
        else:
            raise NoSuchDocument

    def __getitem__(self, key):
        assert isinstance(key, tuple) and len(key) == 2
        self.load(key)
        return self.data[key]

    def __contains__(self,key):
        assert isinstance(key, tuple) and len(key) == 2
        return key in self.data


    def __len__(self):
        return len(self.data)

    def keys(self):
        return self.data.keys()

    def items(self):
        return self.data.items()

    def values(self):
        return self.data.values()

    def __iter__(self):
        return iter(self.data)

    def autounload(self, save=True):
        unload = []
        for key, t in self.lastchange.items():
            if t > time.time() + self.expiretime:
                unload.append(key)

        for key in unload:
            self.unload(key, save)


def gethtml(element):
    """Converts the element to html skeleton"""
    if isinstance(element, folia.AbstractStructureElement):
        s = ""
        for child in element:
            if isinstance(child, folia.AbstractStructureElement):
                s += gethtml(child)
        if s:
            s = "<div id=\"" + element.id + "\" class=\"F " + element.XMLTAG + "\">" + s
        else:
            s = "<div id=\"" + element.id + "\" class=\"F " + element.XMLTAG + " deepest\">"
        s += "</div>"
        return s
    else:
        raise Exception("Structure element expected, got " + str(type(element)))

def getannotations(element):
    if isinstance(element, folia.AbstractTokenAnnotation) or isinstance(element,folia.TextContent):
        annotation = element.json()
        p = element.parent
        while not p.id or not isinstance(p, folia.AbstractStructureElement):
            p = p.parent
        annotation['targets'] = [ p.id ]
        yield annotation
    elif isinstance(element, folia.AbstractSpanAnnotation):
        annotation = element.json()
        annotation['targets'] = [ x.id for x in element.wrefs() ]
    if isinstance(element, folia.AbstractStructureElement) or isinstance(element, folia.AbstractAnnotationLayer) or isinstance(element, folia.AbstractSpanAnnotation):
        for child in element:
            for x in getannotations(child):
                yield x



class Root:
    def __init__(self,docstore,args):
        self.docstore = docstore
        self.workdir = args.workdir

    @cherrypy.expose
    def makenamespace(self, namespace):
        namepace = namespace.replace('/','').replace('..','')
        os.mkdir(self.workdir + '/' + namespace)
        cherrypy.response.headers['Content-Type']= 'text/plain'
        return "ok"

    @cherrypy.expose
    def getdoc(self, namespace, docid):
        namepace = namespace.replace('/','').replace('..','')
        try:
            cherrypy.response.headers['Content-Type'] = 'application/json'
            return json.dumps({
                'html': gethtml(self.docstore[(namespace,docid)].data[0]),
                'annotations': tuple(getannotations(self.docstore[(namespace,docid)].data[0])),
            })
        except NoSuchDocument:
            raise cherrypy.HTTPError(404, "Document not found: " + namespace + "/" + docid)

    def getelement(self, namespace, docid, elementid):
        namepace = namespace.replace('/','').replace('..','')
        try:
            cherrypy.response.headers['Content-Type'] = 'application/json'
            return json.dumps({
                'html': gethtml(self.docstore[(namespace,docid)][elementid]),
                'annotations': tuple(getannotations(self.docstore[(namespace,docid)][elementid])),
            })
        except NoSuchDocument:
            raise cherrypy.HTTPError(404, "Document not found: " + namespace + "/" + docid)


    @cherrypy.expose
    def getdocjson(self, namespace, docid, **args):
        namepace = namespace.replace('/','').replace('..','')
        try:
            cherrypy.response.headers['Content-Type']= 'application/json'
            return json.dumps(self.docstore[(namespace,docid)].json())
        except NoSuchDocument:
            raise cherrypy.HTTPError(404, "Document not found: " + namespace + "/" + docid)

    @cherrypy.expose
    def getdocxml(self, namespace, docid, **args):
        namepace = namespace.replace('/','').replace('..','')
        try:
            cherrypy.response.headers['Content-Type']= 'text/xml'
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
