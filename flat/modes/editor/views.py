from __future__ import print_function, unicode_literals, division, absolute_import
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse,HttpResponseForbidden
import sys
if sys.version < '3':
    from urllib2 import URLError
else:
    from urllib.error import URLError
import flat.settings as settings
import flat.comm
import flat.users
import flat.modes.viewer.views
import json


@login_required
def view(request, namespace, docid):
    if flat.users.models.hasreadpermission(request.user.username, namespace):
        try:
            doc = flat.comm.query(request, "USE " + namespace + "/" + docid + " SELECT ALL FORMAT flat", setdefinitions=True,declarations=True) #get the entire document with meta information
        except URLError:
            return HttpResponseForbidden("Unable to connect to the document server [editor/view]")
        d = flat.modes.viewer.views.getcontext(request,namespace,docid, doc)
        d['mode'] = 'editor'
        try:
            d['initialcorrectionset'] = settings.CONFIGURATIONS[request.session['configuration']]['initialcorrectionset']
        except:
            pass

        if 'autodeclare' in settings.CONFIGURATIONS[request.session['configuration']]:
            if flat.users.models.haswritepermission(request.user.username, namespace):
                for annotationtype, set in settings.CONFIGURATIONS[request.session['configuration']]['autodeclare']:
                    try:
                        r = flat.comm.query(request, "USE " + namespace + "/" + docid + " DECLARE " + annotationtype + " OF " + set)
                    except URLError as e:
                        return HttpResponseForbidden("Unable to connect to the document server: " + e.reason + " [editor/view]")
                    d['docdeclarations'] = json.dumps(r['declarations'])
                    d['setdefinitions'] = json.dumps(r['setdefinitions'])
        return render(request, 'editor.html', d)
    else:
        return HttpResponseForbidden("Permission denied")

@login_required
def annotate(request,namespace, docid):
    if flat.users.models.haswritepermission(request.user.username, namespace):
        if sys.version < '3':
            if hasattr(request, 'body'):
                data = json.loads(unicode(request.body,'utf-8'))
            else: #older django
                data = json.loads(unicode(request.raw_post_data,'utf-8'))
        else:
            if hasattr(request, 'body'):
                data = json.loads(str(request.body,'utf-8'))
            else: #older django
                data = json.loads(str(request.raw_post_data,'utf-8'))
        query = "\n".join(data['queries'])
        try:
            d = flat.comm.query(request, query)
        except URLError as e:
            return HttpResponseForbidden("Unable to connect to the document server: " + e.reason + " [editor/annotate]")
        return HttpResponse(json.dumps(d).encode('utf-8'), content_type='application/json')
    else:
        return HttpResponseForbidden("Permission denied, no write access")



@login_required
def history(request,namespace, docid):
    if flat.users.models.hasreadpermission(request.user.username, namespace):
        try:
            if hasattr(request, 'body'):
                d = flat.comm.get(request, '/getdochistory/' +namespace + '/' + docid + '/',False)
            else:
                d = flat.comm.get(request, '/getdochistory/' +namespace + '/' + docid + '/',False)
        except URLError as e:
            return HttpResponseForbidden("Unable to connect to the document server: " + e.reason + " [editor/history]")
        return HttpResponse(json.dumps(d).encode('utf-8'), content_type='application/json')
    else:
        return HttpResponseForbidden("Permission denied, no read access")

@login_required
def revert(request,namespace, docid, commithash):
    if flat.users.models.haswritepermission(request.user.username, namespace):
        try:
            if hasattr(request, 'body'):
                flat.comm.get(request, '/revert/' +namespace + '/' + docid + '/' + commithash + '/',False)
            else:
                flat.comm.get(request, '/revert/' +namespace + '/' + docid + '/' + commithash + '/',False)
        except URLError as e:
            return HttpResponseForbidden("Unable to connect to the document server: " + e.reason + " [editor/revert]")
        return HttpResponse("{}", content_type='application/json') #no content, client will do a full reload
    else:
        return HttpResponseForbidden("Permission denied, no write access")
