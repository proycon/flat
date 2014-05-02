#!/usr/bin/env python3

from __future__ import print_function, unicode_literals, division, absolute_import
import cherrypy
import argparse
import time
import os
import json
import random
import datetime
import subprocess
from copy import copy
from collections import defaultdict
from pynlpl.formats import folia

def fake_wait_for_occupied_port(host, port): return

class NoSuchDocument(Exception):
    pass


logfile = None
def log(msg):
    global logfile
    if logfile:
        logfile.write(msg+"\n")
        logfile.flush()


def parsegitlog(data):
    commit = None
    date = None
    msg = None
    for line in data.split("\n"):
        line = line.strip()
        if line[0:6] == 'commit':
            #yield previous
            if commit and date and msg:
                yield commit, date, msg
            commit = line[7:]
            msg = None
            date = None
        elif line[0:7] == 'Author:':
            pass
        elif line[0:5] == 'Date:':
            date = line[6:].strip()
        elif line:
            msg = line
    if commit and date and msg:
        yield commit, date, msg


class DocStore:
    def __init__(self, workdir, expiretime):
        log("Initialising document store in " + workdir)
        self.workdir = workdir
        self.expiretime = expiretime
        self.data = {}
        self.lastchange = {}
        self.updateq = defaultdict(dict) #update queue, (namespace,docid) => session_id => [folia element id], for concurrency
        self.lastaccess = defaultdict(dict) # (namespace,docid) => session_id => time
        self.setdefinitions = {}
        if os.path.exists(self.workdir + "/.git"):
            self.git = True
        else:
            self.git = False
        super().__init__()

    def getfilename(self, key):
        assert isinstance(key, tuple) and len(key) == 2
        return self.workdir + '/' + key[0] + '/' + key[1] + '.folia.xml'

    def load(self,key):
        filename = self.getfilename(key)
        if not key in self:
            if not os.path.exists(filename):
                raise NoSuchDocument
            log("Loading " + filename)
            self.data[key] = folia.Document(file=filename, setdefinitions=self.setdefinitions, loadsetdefinitions=True)
            self.lastchange[key] = time.time()


    def save(self, key, message = "unspecified change"):
        doc = self[key]
        log("Saving " + self.getfilename(key) + " - " + message)
        doc.save()
        if self.git:
            log("Doing git commit for " + self.getfilename(key) + " - " + message)
            os.chdir(self.workdir)
            r = os.system("git add " + self.getfilename(key) + " && git commit -m \"" + message + "\"")
            if r != 0:
                log("Error during git add/commit of " + self.getfilename(key))


    def unload(self, key, save=True):
        if key in self:
            if save:
                self.save(key,"Saving unsaved changes")
            log("Unloading " + "/".join(key))
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
    if isinstance(element, folia.Correction):
        s = ""
        if element.hasnew():
            for child in element.new():
                if isinstance(child, folia.AbstractStructureElement) or isinstance(child, folia.Correction):
                    s += gethtml(child)
        elif element.hascurrent():
            for child in element.current():
                if isinstance(child, folia.AbstractStructureElement) or isinstance(child, folia.Correction):
                    s += gethtml(child)
        return s
    elif isinstance(element, folia.AbstractStructureElement):
        s = ""
        for child in element:
            if isinstance(child, folia.AbstractStructureElement) or isinstance(child, folia.Correction):
                s += gethtml(child)
        if not isinstance(element, folia.Text) and not isinstance(element, folia.Division):
            try:
                label = "<span class=\"lbl\">" + element.text() + "</span>"
            except folia.NoSuchText:
                label = "<span class=\"lbl\"></span>"
        else:
            label = ""
        if not isinstance(element,folia.Word) or (isinstance(element, folia.Word) and element.space):
            label += " "

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
        if not element.id:
            #annotator requires IDS on corrections, make one on the fly
            hash = random.getrandbits(128)
            element.id = element.doc.id + ".correction.%032x" % hash
        correction_new = []
        correction_current = []
        correction_original = []
        correction_suggestions = []
        if element.hasnew():
            for x in element.new():
                for y in  getannotations(x):
                    if not 'incorrection' in y: y['incorrection'] = []
                    y['incorrection'].append(element.id)
                    correction_new.append(y)
                    yield y #yield as any other
        if element.hascurrent():
            for x in element.current():
                for y in  getannotations(x):
                    if not 'incorrection' in y: y['incorrection'] = []
                    y['incorrection'].append(element.id)
                    correction_current.append(y)
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
        annotation = {'id': element.id ,'set': element.set, 'class': element.cls, 'type': 'correction', 'new': correction_new,'current': correction_current, 'original': correction_original, 'suggestions': correction_suggestions}
        if element.annotator:
            annotation['annotator'] = element.annotator
        if element.annotatortype == folia.AnnotatorType.AUTO:
            annotation['annotatortype'] = "auto"
        elif element.annotatortype == folia.AnnotatorType.MANUAL:
            annotation['annotatortype'] = "manual"
        p = element.ancestor(folia.AbstractStructureElement)
        annotation['targets'] = [ p.id ]
        yield annotation
    elif isinstance(element, folia.AbstractTokenAnnotation) or isinstance(element,folia.TextContent):
        annotation = element.json()
        p = element.parent
        #log("Parent of " + str(repr(element))+ " is "+ str(repr(p)))
        p = element.ancestor(folia.AbstractStructureElement)
        annotation['targets'] = [ p.id ]
        assert isinstance(annotation, dict)
        yield annotation
    elif isinstance(element, folia.AbstractSpanAnnotation):
        annotation = element.json()
        annotation['targets'] = [ x.id for x in element.wrefs() ]
        assert isinstance(annotation, dict)
        yield annotation
    if isinstance(element, folia.AbstractStructureElement):
        annotation =  element.json(None, False) #no recursion
        annotation['self'] = True #this describes the structure element itself rather than an annotation under it
        annotation['targets'] = [ element.id ]
        yield annotation
    if isinstance(element, folia.AbstractStructureElement) or isinstance(element, folia.AbstractAnnotationLayer) or isinstance(element, folia.AbstractSpanAnnotation) or isinstance(element, folia.Suggestion):
        for child in element:
            for x in getannotations(child):
                assert isinstance(x, dict)
                yield x

def getdeclarations(doc):
    for annotationtype, set in doc.annotations:
        try:
            C = folia.ANNOTATIONTYPE2CLASS[annotationtype]
        except KeyError:
            pass
        #if (issubclass(C, folia.AbstractAnnotation) or C is folia.TextContent or C is folia.Correction) and not (issubclass(C, folia.AbstractTextMarkup)): #rules out structure elements for now
        if not issubclass(C, folia.AbstractTextMarkup) and annotationtype in folia.ANNOTATIONTYPE2XML:
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
    log("Received data for doannotation: "+ repr(data))

    if len(data['targets']) > 1:
        commonancestors = None
        for targetid in data['targets']:
            try:
                target = doc[targetid]
            except:
                response['error'] = "Target element " + targetid + " does not exist!"
                return response
            ancestors = list( ( x.id for x in target.ancestors() if isinstance(x,folia.AbstractStructureElement) and x.id ) )
            if commonancestors is None:
                commonancestors = copy(ancestors)
            else:
                removeancestors = []
                for a in commonancestors:
                    if not (a in ancestors):
                        removeancestors.append(a)
                for a in removeancestors:
                    commonancestors.remove(a)
        if commonancestors:
            commonancestor = commonancestors[0]
            log("Common ancestor as return element: "+ commonancestor )
            response['returnelementid'] = commonancestor
    else:
        for targetid in data['targets']:
            try:
                target = doc[targetid]
                response['returnelementid'] = target.id
            except:
                response['error'] = "Target element " + targetid + " does not exist!"
                return response



    if 'elementid' in data:
        ElementClass = folia.XML2CLASS[doc[data['elementid']].XMLTAG]
    else:
        ElementClass = None


    for edit in data['edits']:
        assert 'type' in edit
        Class = folia.XML2CLASS[edit['type']]
        annotationtype = Class.ANNOTATIONTYPE
        annotation = None


        edit['datetime'] = datetime.datetime.now()


        if not 'set' in edit or edit['set'] == 'null':
            edit['set'] = 'undefined'

        log("Processing edit: "+ str(repr(edit)) )
        log("Class=" + Class.__name__ )

        if issubclass(Class, folia.TextContent):
            #Text Content, each target will get a copy
            if len(data['targets']) > 1:
                log("Text edit of multiple elements")
                #more than one target, this implies a merge
                targets = []
                ancestor = None
                for target in data['targets']:
                    targets.append( doc[target] )
                    if not ancestor:
                        ancestor = doc[target].ancestor(folia.AbstractStructureElement)
                        index = ancestor.data.index(doc[target]) #TODO, can't find if already part of a correction
                    elif ancestor != doc[target].ancestor(folia.AbstractStructureElement):
                        response['error'] = "Unable to merge words, they are not in the same structure element"
                        return response

                if edit['editform'] == 'direct':
                    #remove all targets and insert a new one in its place
                    response['log'] = "Merging/replacing words, by " + data['annotator']
                    log(response['log'])
                    for target in targets:
                        ancestor.remove(target)
                    ancestor.insert(index, ElementClass(doc, folia.TextContent(doc, edit['text'], set=edit['set']), generate_id_in=ancestor ) )
                elif edit['editform'] == 'correction':
                    response['log'] = "Merging/replacing words (correction " + edit['correctionclass'] + "), by " + data['annotator']
                    log(response['log'])
                    ancestor.mergewords(ElementClass(doc, folia.TextContent(doc, edit['text'], set=edit['set']), generate_id_in=ancestor), *targets, set=edit['correctionset'], cls=edit['correctionclass'], annotator=data['annotator'], annotatortype=folia.AnnotatorType.MANUAL, datetime=edit['datetime'] )

                response['returnelementid'] = ancestor.id
            else:
                try:
                    target = doc[data['targets'][0]]
                except:
                    response['error'] = "Target element " + data['targets'][0] + " does not exist!"
                    return response

                log("Text edit of " + target.id)

                if edit['editform'] == 'direct':
                    if 'insertright' in edit:
                        response['log'] = "Right insertion after " + target.id + ", by " + data['annotator']
                        log(response['log'])

                        #Undo any space=False attribute on the word we insert after, if set
                        if isinstance(target, folia.Word) and not target.space:
                            target.space = True

                        try:
                            index = target.parent.data.index(target) + 1
                        except ValueError:
                            response['error'] = "Unable to find insertion index"
                            return response

                        for wordtext in reversed(edit['insertright'].split(' ')):
                            target.parent.insert(index, ElementClass(doc, wordtext,generate_id_in=target.parent ) )
                        response['returnelementid'] = target.parent.id
                    elif 'insertleft' in edit:
                        response['log'] = "Left insertion before " + target.id + ", by " + data['annotator']
                        log(response['log'])
                        try:
                            index = target.parent.data.index(target)
                        except ValueError:
                            response['error'] = "Unable to find insertion index"
                            return response

                        #undo any space=False prior to our insertion point
                        if index > 0 and target.parent.data[index-1] and isinstance(target.parent.data[index-1], folia.Word) and not target.parent.data[index-1].space:
                            target.parent.data[index-1].space = True

                        for wordtext in reversed(edit['insertleft'].split(' ')):
                            target.parent.insert(index, ElementClass(doc, wordtext,generate_id_in=target.parent ) )
                        response['returnelementid'] = target.parent.id

                    elif 'dosplit' in edit:
                        response['log'] = "Split of " + target.id + ", by " + data['annotator']
                        log(response['log'])
                        try:
                            index = target.parent.data.index(target)
                        except ValueError:
                            response['error'] = "Unable to find insertion index"
                            return response

                        p = target.parent
                        index = -1
                        for i, w in enumerate(target.data):
                            if w is target:
                                index = i
                        if index > -1:
                            p.remove(target)

                        for wordtext in reversed(edit['text'].split(' ')):
                            p.insert(index, ElementClass(doc, folia.TextContent(doc, value=wordtext ), generate_id_in=p ) )

                        response['returnelementid'] = p.id
                    elif edit['text']:
                        response['log'] = "Text content change of " + target.id + " (" + edit['text']+"), by " + data['annotator']
                        log(response['log'])
                        target.replace(Class,value=edit['text'], set=edit['set'], cls=edit['class'],annotator=data['annotator'], annotatortype=folia.AnnotatorType.MANUAL, datetime=edit['datetime']) #does append if no replacable found
                    else:
                        log("Text deletion of " + target.id + ", by " + data['annotator'])
                        log(response['log'])

                        #undo any space=False prior to our deleted entry
                        try:
                            index = target.parent.data.index(target)
                        except ValueError:
                            index = 0
                        if index > 0 and isinstance(target.parent.data[index-1], folia.Word) and not target.parent.data[index-1].space:
                            target.parent.data[index-1].space = True

                        #we have a text deletion! This implies deletion of the entire structure element!
                        p = target.parent
                        p.remove(target)
                        response['returnelementid'] = p.id
                elif edit['editform'] == 'alternative':
                    response['error'] = "Can not add alternative text yet, not implemented"
                    return response
                elif edit['editform'] == 'correction':
                    if 'insertright' in edit:
                        #Undo any space=False attribute if set
                        if isinstance(target, folia.Word) and not target.space:
                            target.space = True

                        response['log'] = "Right insertion '" + edit['insertright'] + "' (correction " + edit['correctionclass'] + ") after " + target.id +", by " + data['annotator']
                        log(response['log'])
                        newwords = []
                        for wordtext in edit['insertright'].split(' '):
                            newwords.append( ElementClass(doc, folia.TextContent(doc, wordtext, set=edit['set']), generate_id_in=target.parent ) )
                        target.parent.insertword(newwords, target, set=edit['correctionset'], cls=edit['correctionclass'], annotator=data['annotator'], annotatortype=folia.AnnotatorType.MANUAL, datetime=edit['datetime'] )
                        response['returnelementid'] = target.parent.id
                    elif 'insertleft' in edit:

                        response['log'] = "Left insertion '" + edit['insertleft'] + "' (correction " + edit['correctionclass'] + ") before " + target.id + ", by " + data['annotator']
                        log(response['log'])

                        #undo any space=False prior to our insertion point
                        try:
                            index = target.parent.data.index(target)
                        except ValueError:
                            index = 0
                        if index > 0 and  isinstance(target.parent.data[index-1], folia.Word) and not target.parent.data[index-1].space:
                            target.parent.data[index-1].space = True

                        newwords = []
                        for wordtext in edit['insertleft'].split(' '):
                            newwords.append( ElementClass(doc, folia.TextContent(doc, wordtext, set=edit['set']), generate_id_in=target.parent ) )
                        target.parent.insertwordleft(newwords, target, set=edit['correctionset'], cls=edit['correctionclass'], annotator=data['annotator'], annotatortype=folia.AnnotatorType.MANUAL, datetime=edit['datetime'] )
                        response['returnelementid'] = target.parent.id
                    elif 'dosplit' in edit:
                        response['log'] = "Split of " + target.id + " '"+ edit['text'] +"' (correction " + edit['correctionclass']+"), by " + data['annotator']
                        log(response['log'])
                        newwords = []
                        for wordtext in edit['text'].split(' '):
                            newwords.append( ElementClass(doc, folia.TextContent(doc, wordtext, set=edit['set']), generate_id_in=target.parent ) )
                        target.parent.splitword(target, *newwords, set=edit['correctionset'], cls=edit['correctionclass'], annotator=data['annotator'], annotatortype=folia.AnnotatorType.MANUAL, datetime=edit['datetime'] )
                        response['returnelementid'] = target.parent.id
                    elif edit['text']:
                        response['log'] = "Text correction '" + edit['text'] + "' on " + target.id + " (correction " + edit['correctionclass']+"), by " + data['annotator']
                        log(response['log'])
                        target.correct(new=folia.TextContent(doc, value=edit['text'], cls=edit['class'], annotator=data['annotator'], annotatortype=folia.AnnotatorType.MANUAL, datetime=edit['datetime'] ), set=edit['correctionset'], cls=edit['correctionclass'], annotator=data['annotator'], annotatortype=folia.AnnotatorType.MANUAL, datetime=edit['datetime'])
                    else:
                        response['log'] = "Deletion of " + target.id + " '" + target.text() + "' (correction " + edit['correctionclass']+"), by " + data['annotator']
                        log(response['log'])

                        #undo any space=False prior to our deleted entry
                        try:
                            index = target.parent.data.index(target)
                        except ValueError:
                            index = 0
                        if index > 0 and isinstance(target.parent.data[index-1], folia.Word) and not target.parent.data[index-1].space:
                            target.parent.data[index-1].space = True

                        #we have a deletion as a correction! This implies deletion of the entire structure element!
                        p = target.ancestor(folia.AbstractStructureElement)
                        p.deleteword(target,set=edit['correctionset'], cls=edit['correctionclass'], annotator=data['annotator'], annotatortype=folia.AnnotatorType.MANUAL, datetime=edit['datetime']) #does correction
                        response['returnelementid'] = p.id


        elif issubclass(Class, folia.AbstractTokenAnnotation):
            log("Edit of token annotation")
            #Token annotation, each target will get a copy (usually just one target)
            for targetid in data['targets']:
                try:
                    target = doc[targetid]
                except:
                    response['error'] = "Target element " + targetid + " does not exist!"
                    return response

                if edit['editform'] == 'direct':
                    if edit['class']:
                        response['log'] = "Edit of " + Class.__name__ + " (" + edit['class'] + ") in " + target.id + ", by " + data['annotator']
                        log(response['log'])
                        target.replace(Class,set=edit['set'], cls=edit['class'], annotator=data['annotator'], annotatortype=folia.AnnotatorType.MANUAL, datetime=edit['datetime']) #does append if no replacable found
                    else:
                        response['log'] = "Deletion of " + Class.__name__ + " in " + target.id + ", by " + data['annotator']
                        log(response['log'])
                        #we have a deletion
                        replace = Class.findreplaceables(target, edit['set'])
                        if len(replace) == 1:
                            #good
                            target.remove(replace[0])
                        elif len(replace) > 1:
                            response['error'] = "Unable to delete, multiple ambiguous candidates found!"
                            return response
                elif edit['editform'] == 'alternative':
                    response['log'] = "Adding alternative of " + Class.__name__ + " (" + edit['class'] + ") in " + target.id + ", by " + data['annotator']
                    log(response['log'])
                    target.append(Class,set=edit['set'], cls=edit['class'], annotator=data['annotator'], annotatortype=folia.AnnotatorType.MANUAL, datetime=edit['datetime'], alternative=True)
                elif edit['editform'] == 'correction':
                    response['log'] = "Correcting " + Class.__name__ + " (" + edit['class'] + ") in " + target.id + ", by " + data['annotator']
                    log(response['log'])
                    log("Calling correct")
                    target.correct(new=Class(doc, set=edit['set'], cls=edit['class'], annotator=data['annotator'], annotatortype=folia.AnnotatorType.MANUAL, datetime=edit['datetime']), set=edit['correctionset'], cls=edit['correctionclass'], annotator=data['annotator'], annotatortype=folia.AnnotatorType.MANUAL, datetime=edit['datetime'])


        elif issubclass(Class, folia.AbstractSpanAnnotation):
            if edit['editform'] != 'direct':
                #TODO
                response['error'] = "Only direct edit form is supported for span annotation elements at this time. Corrections and alternatives to be implemented still."
                return response


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

                response['log'] = "Adding " + Class.__name__ + " (" + edit['class'] + ") for " + ",".join([x.id for x in targets]) + "; by " + data['annotator']
                log(response['log'])

                #find common ancestor of all targets
                layers = doc[commonancestor].layers(annotationtype, edit['set'])
                if len(layers) >= 1:
                    layer = layers[0]
                else:
                    layer = doc[commonancestor].append(folia.ANNOTATIONTYPE2LAYERCLASS[annotationtype])

                layer.append(Class, *targets, set=edit['set'], cls=edit['class'], annotator=data['annotator'], annotatortype=folia.AnnotatorType.MANUAL, datetime=edit['datetime'])


            elif 'id' in edit:
                if edit['class']:
                    response['log'] = "Editing " + Class.__name__ + " (" + edit['class'] + ") for " + ",".join([x.id for x in targets]) + "; by " + data['annotator']
                else:
                    response['log'] = "Deleting " + Class.__name__ + " for " + ",".join([x.id for x in targets]) + "; by " + data['annotator']
                log(response['log'])
                #existing span annotation, we should have an ID
                try:
                    annotation = doc[edit['id']]
                except:
                    response['error'] = "No existing span annotation with id " + edit['id'] + " found"
                    return response

                currenttargets = annotation.wrefs()
                if currenttargets != targets:
                    if annotation.hasannotation(Class):
                        response['error'] = "Unable to change the span of this annotation as there are nested span annotations embedded"
                        return response
                    else:
                        annotation.data = targets

                if edit['class']:
                    annotation.cls = edit['class']
                    annotation.annotator = data['annotator']
                    annotation.annotatortype = folia.AnnotatorType.MANUAL
                else:
                    #delete:
                    annotation.parent.remove(annotation)


            else:
                #no ID, fail
                response['error'] = "Unable to edit span annotation without explicit id"
                return response
        else:
            response['error'] = "Unable to edit annotations of type " + Class.__name__
            return response

    log("Return element: " + repr(response['returnelementid']))
    if response['returnelementid']:
        log(doc[response['returnelementid']].xmlstring())
        return response
    else:
        del response['returnelementid']
        return response




class Root:
    def __init__(self,docstore,args):
        self.docstore = docstore
        self.workdir = args.workdir

    @cherrypy.expose
    def makenamespace(self, namespace):
        namepace = namespace.replace('/','').replace('..','')
        try:
            os.mkdir(self.workdir + '/' + namespace)
        except:
            pass
        cherrypy.response.headers['Content-Type']= 'text/plain'
        return "ok"

    @cherrypy.expose
    def getdoc(self, namespace, docid, sid):
        namepace = namespace.replace('/','').replace('..','')
        if sid[-5:] != 'NOSID':
            log("Creating session " + sid + " for " + "/".join((namespace,docid)))
            self.docstore.lastaccess[(namespace,docid)][sid] = time.time()
            self.docstore.updateq[(namespace,docid)][sid] = []
        try:
            log("Returning document " + "/".join((namespace,docid)) + " in session " + sid)
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
    def getdochistory(self, namespace, docid):
        namepace = namespace.replace('/','').replace('..','').replace(';','').replace('&','')
        docid = docid.replace('/','').replace('..','').replace(';','').replace('&','')
        log("Returning history for document " + "/".join((namespace,docid)))
        cherrypy.response.headers['Content-Type'] = 'application/json'
        if self.docstore.git and (namespace,docid) in self.docstore:
            log("Invoking git log " + namespace+"/"+docid + ".folia.xml")
            os.chdir(self.workdir)
            proc = subprocess.Popen("git log " + namespace + "/" + docid + ".folia.xml", stdout=subprocess.PIPE,stderr=subprocess.PIPE,shell=True,cwd=self.workdir)
            outs, errs = proc.communicate()
            if errs: log("git log errors? " + errs.decode('utf-8'))
            d = {'history':[]}
            count = 0
            for commit, date, msg in parsegitlog(outs.decode('utf-8')):
                count += 1
                d['history'].append( {'commit': commit, 'date': date, 'msg':msg})
            if count == 0: log("git log output: " + outs.decode('utf-8'))
            log(str(count) + " revisions found - " + errs.decode('utf-8'))
            return json.dumps(d).encode('utf-8')
        else:
            return json.dumps({'history': []}).encode('utf-8')

    @cherrypy.expose
    def revert(self, namespace, docid, commithash):
        if not all([ x.isalnum() for x in commithash ]):
            return b"{}"

        cherrypy.response.headers['Content-Type'] = 'application/json'
        if self.docstore.git:
            if (namespace,docid) in self.docstore:
                os.chdir(self.workdir)
                #unload document (will even still save it if not done yet, cause we need a clean workdir)
                key = (namespace,docid)
                self.docstore.unload(key)

            log("Doing git revert for " + self.docstore.getfilename(key) )
            os.chdir(self.workdir)
            r = os.system("git checkout " + commithash + " " + self.docstore.getfilename(key) + " && git commit -m \"Reverting to commit " + commithash + "\"")
            if r != 0:
                log("Error during git revert of " + self.docstore.getfilename(key))
            return b"{}"
        else:
            return b"{}"

    @cherrypy.expose
    def annotate(self, namespace, docid, sid):
        namepace = namespace.replace('/','').replace('..','')
        cl = cherrypy.request.headers['Content-Length']
        rawbody = cherrypy.request.body.read(int(cl))
        data = json.loads(str(rawbody,'utf-8'))
        log("Annotation action - Renewing session " + sid + " for " + "/".join((namespace,docid)))
        self.docstore.lastaccess[(namespace,docid)][sid] = time.time()
        doc = self.docstore[(namespace,docid)]
        response = doannotation(doc, data)
        if 'log' in response:
            response['log'] += " in document " + "/".join((namespace,docid))
        else:
            if 'returnelementid' in response:
                response['log'] = "Unknown edit by " + data['annotator'] + " in " + response['returnelementid'] + " in " + "/".join((namespace,docid))
            else:
                response['log'] = "Unknown edit by " + data['annotator'] + " in " + "/".join((namespace,docid))
        if 'returnelementid' in response:
            self.docstore.save((namespace,docid),response['log'] )
            #set concurrency:
            for s in self.docstore.updateq[(namespace,docid)]:
                if s != sid:
                    log("Scheduling update for " + s)
                    self.docstore.updateq[(namespace,docid)][s].append(response['returnelementid'])
            return self.getelement(namespace,docid, response['returnelementid'],sid);
        else:
            self.docstore.save((namespace,docid), response['log'])
            return self.getelement(namespace,docid, doc.data[0].id,sid) #return all


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
            log("Expiring session " + s + " for " + "/".join(d))
            del self.docstore.lastaccess[d][s]
            del self.docstore.updateq[d][s]
            if len(self.docstore.lastaccess[d]) == 0:
                del self.docstore.lastaccess[d]
            if len(self.docstore.updateq[d]) == 0:
                del self.docstore.updateq[d]





    @cherrypy.expose
    def getelement(self, namespace, docid, elementid, sid):
        log("Returning element " + str(elementid) + " in document " + "/".join((namespace,docid)) + ", session " + sid)
        namepace = namespace.replace('/','').replace('..','')
        if sid[-5:] != 'NOSID':
            self.docstore.lastaccess[(namespace,docid)][sid] = time.time()
            if sid in self.docstore.updateq[(namespace,docid)]:
                try:
                    self.docstore.updateq[(namespace,docid)][sid].remove(elementid)
                except:
                    pass
        try:
            cherrypy.response.headers['Content-Type'] = 'application/json'
            if elementid:
                log("Request element: "+ elementid)
                return json.dumps({
                    'elementid': elementid,
                    'html': gethtml(self.docstore[(namespace,docid)][elementid]),
                    'annotations': tuple(getannotations(self.docstore[(namespace,docid)][elementid])),
                }).encode('utf-8')
            else:
                return "{}".encode('utf-8')
        except NoSuchDocument:
            raise cherrypy.HTTPError(404, "Document not found: " + namespace + "/" + docid)


    @cherrypy.expose
    def poll(self, namespace, docid, sid):
        cherrypy.log("Poll from session " + sid + " for " + "/".join((namespace,docid)))
        self.checkexpireconcurrency()
        if sid in self.docstore.updateq[(namespace,docid)]:
            ids = self.docstore.updateq[(namespace,docid)][sid]
            log("Returning IDs after poll: " + repr(ids))
            self.docstore.updateq[(namespace,docid)][sid] = []
            return json.dumps({'update': ids})
        else:
            return json.dumps({})



    @cherrypy.expose
    def declare(self, namespace, docid, sid):
        cl = cherrypy.request.headers['Content-Length']
        rawbody = cherrypy.request.body.read(int(cl))
        data = json.loads(str(rawbody,'utf-8'))
        log("Declaration: " + data['set'] + " for " + "/".join((namespace,docid)))
        self.docstore.lastaccess[(namespace,docid)][sid] = time.time()
        doc = self.docstore[(namespace,docid)]
        Class = folia.XML2CLASS[data['annotationtype']]
        doc.declare(Class, set=data['set'])
        return json.dumps({
                'declarations': tuple(getdeclarations(self.docstore[(namespace,docid)])),
                'setdefinitions': getsetdefinitions(self.docstore[(namespace,docid)])
        })



    @cherrypy.expose
    def getnamespaces(self):
        namespaces = [ x for x in os.listdir(self.docstore.workdir) ]
        return json.dumps({
                'namespaces': namespaces
        })

    @cherrypy.expose
    def getdocuments(self, namespace):
        namepace = namespace.replace('/','').replace('..','')
        docs = [ x for x in os.listdir(self.docstore.workdir + "/" + namespace) if x[-10:] == ".folia.xml" ]
        return json.dumps({
                'documents': docs,
                'timestamp': { x:os.path.getmtime(self.docstore.workdir + "/" + namespace + "/"+ x) for x in docs  }
        })


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

    @cherrypy.expose
    def upload(self, namespace):
        log("In upload, namespace=" + namespace)
        response = {}
        cl = cherrypy.request.headers['Content-Length']
        data = cherrypy.request.body.read(int(cl))
        cherrypy.response.headers['Content-Type'] = 'application/json'
        #data =cherrypy.request.params['data']
        try:
            log("Loading document from upload")
            doc = folia.Document(string=data)
            response['docid'] = doc.id
        except:
            response['error'] = "Uploaded file is no valid FoLiA Document"
            log("error")
            return json.dumps(response).encode('utf-8')

        filename = self.docstore.getfilename( (namespace, doc.id))
        i = 1
        while os.path.exists(filename):
            filename = self.docstore.getfilename( (namespace, doc.id + "." + str(i)))
            i += 1
        self.docstore.save((namespace,doc.id), "Initial upload")
        return json.dumps(response).encode('utf-8')




def main():
    global logfile
    parser = argparse.ArgumentParser(description="", formatter_class=argparse.ArgumentDefaultsHelpFormatter)
    parser.add_argument('-d','--workdir', type=str,help="Work directory", action='store',required=True)
    parser.add_argument('-p','--port', type=int,help="Port", action='store',default=8080,required=False)
    parser.add_argument('-l','--logfile', type=str,help="Log file", action='store',default="foliadocserve.log",required=False)
    parser.add_argument('--expirationtime', type=int,help="Expiration time in seconds, documents will be unloaded from memory after this period of inactivity", action='store',default=900,required=False)
    args = parser.parse_args()
    logfile = open(args.logfile,'w',encoding='utf-8')
    os.chdir(args.workdir)
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
