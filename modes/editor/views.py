from __future__ import print_function, unicode_literals, division, absolute_import
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse,HttpResponseForbidden
import flat.settings as settings
import flat.comm
import flat.users
import flat.modes.viewer.views
import json

@login_required
def view(request, namespace, docid):
    if flat.users.models.hasreadpermission(request.user.username, namespace):
        doc = flat.comm.get(request, '/getdoc/' + namespace + '/' + docid + '/')
        d = flat.modes.viewer.views.getcontext(request,namespace,docid, doc)
        d['mode'] = 'editor'
        try:
            d['editforms'] = settings.EDITFORMS
        except AttributeError:
            d['editforms'] = ['direct']
        try:
            d['initialcorrectionset'] = settings.CONFIGURATIONS[request.session['configuration']]['initialcorrectionset']
        except:
            pass

        if 'autodeclare' in settings.CONFIGURATIONS[request.session['configuration']]:
            if flat.users.models.haswritepermission(request.user.username, namespace):
                for annotationtype, set in settings.CONFIGURATIONS[request.session['configuration']]['autodeclare']:
                    r = flat.comm.postjson(request, '/declare/' +namespace + '/' + docid + '/', {'annotationtype': annotationtype, 'set': set} )
                    d['docdeclarations'] = json.dumps(r['declarations'])
                    d['setdefinitions'] = json.dumps(r['setdefinitions'])
            else:
                return HttpResponseForbidden("Permission denied, no write access")
        return render(request, 'editor.html', d)
    else:
        return HttpResponseForbidden("Permission denied")

@login_required
def annotate(request,namespace, docid):
    if flat.users.models.haswritepermission(request.user.username, namespace):
        if hasattr(request, 'body'):
            d = flat.comm.postjson(request, '/annotate/' +namespace + '/' + docid + '/', request.body)
        else: #older django
            d = flat.comm.postjson(request, '/annotate/' +namespace + '/' + docid + '/', request.raw_post_data)
        return HttpResponse(json.dumps(d), mimetype='application/json')
    else:
        return HttpResponseForbidden("Permission denied, no write access")


@login_required
def declare(request,namespace, docid):
    if flat.users.models.haswritepermission(request.user.username, namespace):
        if hasattr(request, 'body'):
            d = flat.comm.postjson(request, '/declare/' +namespace + '/' + docid + '/', request.body)
        else:
            d = flat.comm.postjson(request, '/declare/' +namespace + '/' + docid + '/', request.raw_post_data)
        return HttpResponse(json.dumps(d), mimetype='application/json')
    else:
        return HttpResponseForbidden("Permission denied, no write access")

@login_required
def history(request,namespace, docid):
    if flat.users.models.hasreadpermission(request.user.username, namespace):
        if hasattr(request, 'body'):
            d = flat.comm.get(request, '/getdochistory/' +namespace + '/' + docid + '/',False)
        else:
            d = flat.comm.get(request, '/getdochistory/' +namespace + '/' + docid + '/',False)
        return HttpResponse(json.dumps(d), mimetype='application/json')
    else:
        return HttpResponseForbidden("Permission denied, no read access")
