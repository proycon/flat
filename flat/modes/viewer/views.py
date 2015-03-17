from __future__ import print_function, unicode_literals, division, absolute_import
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, HttpResponseForbidden
import flat.settings as settings
import flat.comm
import flat.users
import flat.modes.viewer.views
import json
import sys
if sys.version < '3':
    from urllib2 import URLError
else:
    from urllib.error import URLError

def getcontext(request,namespace,docid, doc):
    return {
            'configuration': settings.CONFIGURATIONS[request.session['configuration']],
            'configuration_json': json.dumps(settings.CONFIGURATIONS[request.session['configuration']]),
            'namespace': namespace,
            'docid': docid,
            'mode': 'viewer',
            'modes': settings.CONFIGURATIONS[request.session['configuration']]['modes'] ,
            'modes_json': json.dumps([x[0] for x in settings.CONFIGURATIONS[request.session['configuration']]['modes'] ]),
            'dochtml': doc['elements'][0]['html'],
            'docannotations': json.dumps(doc['elements'][0]['annotations']),
            'docdeclarations': json.dumps(doc['declarations']),
            'setdefinitions': json.dumps(doc['setdefinitions']),
            'loggedin': request.user.is_authenticated(),
            'version': settings.VERSION,
            'username': request.user.username
    }


@login_required
def view(request, namespace, docid):
    if flat.users.models.hasreadpermission(request.user.username, namespace):
        try:
            doc = flat.comm.query(request, "USE " + namespace + "/" + docid + " SELECT ALL FORMAT flat", setdefinitions=True,declarations=True) #get the entire document with meta information
        except URLError:
            return HttpResponseForbidden("Unable to connect to the document server [viewer/view]")
        d = getcontext(request,namespace,docid, doc)
        return render(request, 'viewer.html', d)
    else:
        return HttpResponseForbidden("Permission denied")


@login_required
def subview(request, namespace, docid, elementid):
    if flat.users.models.hasreadpermission(request.user.username, namespace):
        try:
            e = flat.comm.query(request, "USE " + namespace + "/" + docid + " SELECT FOR ID \"" + elementid + "\" FORMAT flat", False) # False =  do not parse json
        except URLError:
            return HttpResponseForbidden("Unable to connect to the document server [viewer/subview]")
        return HttpResponse(e, content_type='application/json')
    else:
        return HttpResponseForbidden("Permission denied")

@login_required
def poll(request, namespace, docid):
    if flat.users.models.hasreadpermission(request.user.username, namespace):
        try:
            r = flat.comm.get(request, '/poll/' + namespace + '/' + docid + '/', False)
        except URLError:
            return HttpResponseForbidden("Unable to connect to the document server [viewer/poll]")
        return HttpResponse(r, content_type='application/json')
    else:
        return HttpResponseForbidden("Permission denied")

