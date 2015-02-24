from __future__ import print_function, unicode_literals, division, absolute_import
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse,HttpResponseForbidden
import urllib2
import flat.settings as settings
import flat.comm
import flat.users
import flat.modes.viewer.views
import json


@login_required
def view(request, namespace, docid):
    if flat.users.models.hasreadpermission(request.user.username, namespace):
        try:
            doc = flat.comm.query(request, "USE " + namespace + "/" + docid + " SELECT FOR text", setdefinitions=True,declarations=True) #get the entire document with meta information
        except urllib2.URLError:
            return HttpResponseForbidden("Unable to connect to the document server")
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
                    except urllib2.URLError as e:
                        return HttpResponseForbidden("Unable to connect to the document server: " + e.reason)
                    d['docdeclarations'] = json.dumps(r['declarations'])
                    d['setdefinitions'] = json.dumps(r['setdefinitions'])
        return render(request, 'editor.html', d)
    else:
        return HttpResponseForbidden("Permission denied")

@login_required
def annotate(request,namespace, docid):
    if flat.users.models.haswritepermission(request.user.username, namespace):
        try:
            if hasattr(request, 'body'):
                d = flat.comm.postjson(request, '/annotate/' +namespace + '/' + docid + '/', request.body)
            else: #older django
                d = flat.comm.postjson(request, '/annotate/' +namespace + '/' + docid + '/', request.raw_post_data)
        except urllib2.URLError as e:
            return HttpResponseForbidden("Unable to connect to the document server: " + e.reason)
        return HttpResponse(json.dumps(d), mimetype='application/json')
    else:
        return HttpResponseForbidden("Permission denied, no write access")


@login_required
def declare(request,namespace, docid):
    if flat.users.models.haswritepermission(request.user.username, namespace):
        try:
            if hasattr(request, 'body'):
                d = flat.comm.postjson(request, '/declare/' +namespace + '/' + docid + '/', request.body)
            else:
                d = flat.comm.postjson(request, '/declare/' +namespace + '/' + docid + '/', request.raw_post_data)
        except urllib2.URLError as e:
             return HttpResponseForbidden("Unable to connect to the document server: " + e.reason)
        return HttpResponse(json.dumps(d), mimetype='application/json')
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
        except urllib2.URLError as e:
            return HttpResponseForbidden("Unable to connect to the document server: " + e.reason)
        return HttpResponse(json.dumps(d), mimetype='application/json')
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
        except urllib2.URLError as e:
            return HttpResponseForbidden("Unable to connect to the document server: " + e.reason)
        return HttpResponse("{}", mimetype='application/json') #no content, client will do a full reload
    else:
        return HttpResponseForbidden("Permission denied, no write access")
