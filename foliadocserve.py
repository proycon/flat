#!/usr/bin/env python3

from __future__ import print_function, unicode_literals, division, absolute_import
import cherrypy
import argparse
import time
import os
import sys
import json
import random
import datetime
import time
from collections import defaultdict
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
        self.updateq = defaultdict(dict) #update queue, (namespace,docid) => session_id => [folia element id], for concurrency
        self.lastaccess = defaultdict(dict) # (namespace,docid) => session_id => time
        self.setdefinitions = {}
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
            self.data[key] = folia.Document(file=filename, setdefinitions=self.setdefinitions, loadsetdefinitions=True)
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
        if not isinstance(element, folia.Text) and not isinstance(element, folia.Division):
            try:
                label = "<span class=\"lbl\">" + element.text() + " </span>"
            except folia.NoSuchText:
                label = "<span class=\"lbl\"></span>"
        else:
            label = ""
        if isinstance(element, folia.Word) and element.space:
            label += "&nbsp;"

        if not element.id:
            element.id = element.doc.id + "." + element.XMLTAG + ".id" + str(random.randint(1000,999999999))
        if s:
            s = "<div id=\"" + element.id + "\" class=\"F " + element.XMLTAG + "\">" + label + s
        else:
            s = "<div id=\"" + element.id + "\" class=\"F " + element.XMLTAG + " deepest\">" + label
        if isinstance(element, folia.Linebreak):
            s += "<br />"
        if isinstance(element, folia.Whitespace):
            s += "<br /><br />"
        elif isinstance(element, folia.Figure):
            s += "<img src=\"" + element.src + "\">"
        s += "</div>"
        if isinstance(element, folia.List):
            s = "<ul>" + s + "</ul>"
        elif isinstance(element, folia.ListItem):
            s = "<li>" + s + "</li>"
        elif isinstance(element, folia.Table):
            s = "<table>" + s + "</table>"
        elif isinstance(element, folia.Row):
            s = "<tr>" + s + "</tr>"
        elif isinstance(element, folia.Cell):
            s = "<td>" + s + "</td>"
        return s
    else:
        raise Exception("Structure element expected, got " + str(type(element)))

def getannotations(element):
    if isinstance(element, folia.Correction):
        correction_new = []
        correction_original = []
        correction_suggestions = []
        if element.hasnew():
            for x in element.new():
                for y in  getannotations(x):
                    if not 'incorrection' in y: y['incorrection'] = []
                    y['incorrection'].append(element.id)
                    correction_new.append(y)
                    yield y #yield as any other
        if element.hasoriginal():
            for x in element.original():
                for y in  getannotations(x):
                    y['auth'] = False
                    if not 'incorrection' in y: y['incorrection'] = []
                    y['incorrection'].append(element.id)
                    correction_original.append(y)
        if element.hassuggestions():
            for x in element.suggestions():
                for y in  getannotations(x):
                    y['auth'] = False
                    if not 'incorrection' in y: y['incorrection'] = []
                    y['incorrection'].append(element.id)
                    correction_suggestions.append(y)

        annotation = {'id': element.id ,'set': element.set, 'class': element.cls, 'type': 'correction', 'new': correction_new, 'original': correction_original, 'suggestions': correction_suggestions}
        if element.annotator:
            annotation['annotator'] = element.annotator
        if element.annotatortype == folia.AnnotatorType.AUTO:
            annotation['annotatortype'] = "auto"
        elif element.annotatortype == folia.AnnotatorType.MANUAL:
            annotation['annotatortype'] = "manual"
        yield annotation
    elif isinstance(element, folia.AbstractTokenAnnotation) or isinstance(element,folia.TextContent):
        annotation = element.json()
        p = element.parent
        while not p.id or not isinstance(p, folia.AbstractStructureElement):
            p = p.parent
        annotation['targets'] = [ p.id ]
        assert isinstance(annotation, dict)
        yield annotation
    elif isinstance(element, folia.AbstractSpanAnnotation):
        annotation = element.json()
        annotation['targets'] = [ x.id for x in element.wrefs() ]
        assert isinstance(annotation, dict)
        yield annotation
    if isinstance(element, folia.AbstractStructureElement) or isinstance(element, folia.AbstractAnnotationLayer) or isinstance(element, folia.AbstractSpanAnnotation):
        for child in element:
            for x in getannotations(child):
                assert isinstance(x, dict)
                yield x

def getdeclarations(doc):
    for annotationtype, set in doc.annotations:
        C = folia.ANNOTATIONTYPE2CLASS[annotationtype]
        if (issubclass(C, folia.AbstractAnnotation) or C is folia.TextContent) and not (issubclass(C, folia.AbstractTextMarkup)): #rules out structure elements for now
            annotationtype = folia.ANNOTATIONTYPE2XML[annotationtype]
            yield {'annotationtype': annotationtype, 'set': set}

def getsetdefinitions(doc):
    setdefs = {}
    for annotationtype, set in doc.annotations:
        if set in doc.setdefinitions:
            setdefs[set] = doc.setdefinitions[set].json()
    return setdefs

def doannotation(doc, data):
    response = {'returnelementid': None}
    changed = [] #changed elements

    print("Received: ", repr(data),file=sys.stderr)

    if len(data['targets']) > 1:
        ancestors = []
        for targetid in data['targets']:
            try:
                target = doc[targetid]
            except:
                response['error'] = "Target element " + targetid + " does not exist!"
                return response

            ancestors.append( set( ( x for x in target.ancestors() if isinstance(x,folia.AbstractStructureAnnotation) and x.id ) ) )

        commonancestors = set.intersection(*ancestors)
        commonancestor = commonancestors[0]
        response['returnelementid'] = commonancestor.id
    else:
        for targetid in data['targets']:
            try:
                target = doc[targetid]
                response['returnelementid'] = target.id
            except:
                response['error'] = "Target element " + targetid + " does not exist!"
                return response





    for edit in data['edits']:
        assert 'type' in edit
        Class = folia.XML2CLASS[edit['type']]
        annotationtype = Class.ANNOTATIONTYPE
        annotation = None

        edit['datetime'] = datetime.datetime.now()


        if not 'set' in edit or edit['set'] == 'undefined' or edit['set'] == 'null':
            edit['set'] = None

        if issubclass(Class, folia.AbstractTokenAnnotation):
            #Token annotation, each target will get a copy
            for targetid in data['targets']:
                try:
                    target = doc[targetid]
                except:
                    response['error'] = "Target element " + targetid + " does not exist!"
                    return response

                if edit['class']:
                    target.replace(Class,set=edit['set'], cls=edit['class'], annotator=data['annotator'], annotatortype=folia.AnnotatorType.MANUAL, datetime=edit['datetime']) #does append if no replacable found
                else:
                    #we have a deletion
                    replace = Class.findreplacables(target.parent, edit['set'])
                    if len(replace) == 1:
                        #good
                        target.remove(replace[0])
                    elif len(replace) > 1:
                        response['error'] = "Unable to delete, multiple ambiguous candidates found!"
                        return response
                changed.append(target)

        elif issubclass(Class, folia.AbstractSpanAnnotation):
            targets = []
            for targetid in data['targets']:
                try:
                    targets.append( doc[targetid] )
                except:
                    response['error'] = "Target element " + targetid + " does not exist!"
                    return response

            #Span annotation, one annotation spanning all tokens
            if edit['new']:
                #this is a new span annotation

                #find common ancestor of all targets
                layers = commonancestor.layers(annotationtype, edit['set'])
                if len(layers) >= 1:
                    layer = layers[0]
                else:
                    layer = commonancestor.append(folia.ANNOTATIONTYPE2LAYERCLASS[annotationtype])

                layer.append(Class, *targets, set=edit['set'], cls=edit['cls'], annotator=data['annotator'], annotatortype=folia.AnnotatorType.MANUAL, datetime=edit['datetime'])


            elif 'id' in edit:
                #existing span annotation, we should have an ID
                try:
                    annotation = doc[edit['id']]
                except Exception as e:
                    response['error'] = "No existing span annotation with id " + edit['id'] + " found"
                    return response

                currenttargets = annotation.wrefs()
                if currenttargets != targets:
                    if annotation.hasannotation(Class):
                        response['error'] = "Unable to change the span of this annotation as there are nested span annotations embedded"
                        return response
                    else:
                        annotation.data = targets

                annotation.cls = edit['cls']
                annotation.annotator = data['annotator']
                annotation.annotatortype = folia.AnnotatorType.MANUAL

            else:
                #no ID, fail
                response['error'] = "Unable to edit span annotation without explicit id"
                return response
        else:
            response['error'] = "Unable to edit annotations of type " + Class.__name__
            return response


    return response




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
    def getdoc(self, namespace, docid, sid):
        if sid[-5:] != 'NOSID':
            self.docstore.lastaccess[(namespace,docid)][sid] = time.time()
            if sid in self.docstore.updateq[(namespace,docid)]:
                self.docstore.updateq[(namespace,docid)][sid] = []
        namepace = namespace.replace('/','').replace('..','')
        try:
            cherrypy.response.headers['Content-Type'] = 'application/json'
            return json.dumps({
                'html': gethtml(self.docstore[(namespace,docid)].data[0]),
                'declarations': tuple(getdeclarations(self.docstore[(namespace,docid)])),
                'annotations': tuple(getannotations(self.docstore[(namespace,docid)].data[0])),
                'setdefinitions': getsetdefinitions(self.docstore[(namespace,docid)]),
            }).encode('utf-8')
        except NoSuchDocument:
            raise cherrypy.HTTPError(404, "Document not found: " + namespace + "/" + docid)


    @cherrypy.expose
    def annotate(self, namespace, docid, sid):
        namepace = namespace.replace('/','').replace('..','')
        cl = cherrypy.request.headers['Content-Length']
        rawbody = cherrypy.request.body.read(int(cl))
        data = json.loads(str(rawbody,'utf-8'))
        self.docstore.lastaccess[(namespace,docid)][sid] = time.time()
        doc = self.docstore[(namespace,docid)]
        response = doannotation(doc, data)
        #set concurrency:
        for s in self.docstore.updateq[(namespace,docid)]:
            if s != sid:
                self.docstore.updateq[(namespace,docid)][s].append(response['returnelementid'])
        return self.getelement(namespace,docid, response['returnelementid'],sid);


    def checkexpireconcurrency(self):
        #purge old buffer
        deletelist = []
        for d in self.docstore.updateq:
            if d in self.docstore.lastaccess:
                for s in self.docstore.updateq[d]:
                    if s in self.docstore.lastaccess[d]:
                        lastaccess = self.docstore.lastaccess[d][s]
                        if time.time() - lastaccess > 3600*12:  #expire after 12 hours
                            deletelist.append( (d,s) )
        for d,s in deletelist:
            del self.docstore.lastaccess[d][s]
            del self.docstore.updateq[d][s]
            if len(self.docstore.lastaccess[d]) == 0:
                del self.docstore.lastaccess[d]
            if len(self.docstore.updateq[d]) == 0:
                del self.docstore.updateq[d]





    @cherrypy.expose
    def getelement(self, namespace, docid, elementid, sid):
        if sid[-5:] != 'NOSID':
            self.docstore.lastaccess[(namespace,docid)][sid] = time.time()
            if sid in self.docstore.updateq[(namespace,docid)]:
                try:
                    self.docstore.updateq[(namespace,docid)][sid].remove(elementid)
                except:
                    pass
        namepace = namespace.replace('/','').replace('..','')
        try:
            cherrypy.response.headers['Content-Type'] = 'application/json'
            if elementid:
                print("Request element: ", elementid,file=sys.stderr)
                return json.dumps({
                    'html': gethtml(self.docstore[(namespace,docid)][elementid]),
                    'annotations': tuple(getannotations(self.docstore[(namespace,docid)][elementid])),
                }).encode('utf-8')
            else:
                return "{}".encode('utf-8')
        except NoSuchDocument:
            raise cherrypy.HTTPError(404, "Document not found: " + namespace + "/" + docid)


    @cherrypy.expose
    def poll(self, namespace, docid, sid):
        self.checkexpireconcurrency()
        if sid in self.docstore.updateq[(namespace,docid)]:
            ids = self.docstore.updateq[(namespace,docid)][sid]
            self.docstore.updateq[(namespace,docid)][sid] = []
            return json.dumps({'update': ids})
        else:
            return json.dumps({})






    #UNUSED:


    @cherrypy.expose
    def getdocjson(self, namespace, docid, **args):
        namepace = namespace.replace('/','').replace('..','')
        try:
            cherrypy.response.headers['Content-Type']= 'application/json'
            return json.dumps(self.docstore[(namespace,docid)].json()).encode('utf-8')
        except NoSuchDocument:
            raise cherrypy.HTTPError(404, "Document not found: " + namespace + "/" + docid)

    @cherrypy.expose
    def getdocxml(self, namespace, docid, **args):
        namepace = namespace.replace('/','').replace('..','')
        try:
            cherrypy.response.headers['Content-Type']= 'text/xml'
            return self.docstore[(namespace,docid)].xmlstring().encode('utf-8')
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
