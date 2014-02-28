from __future__ import print_function, unicode_literals, division, absolute_import
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, HttpResponseForbidden
import flat.settings as settings
import flat.comm
import flat.users
import json
import urllib2

def getcontext(request,namespace,docid, doc):
    return {
            'configuration': settings.CONFIGURATIONS[request.session['configuration']],
            'configuration_json': json.dumps(settings.CONFIGURATIONS[request.session['configuration']]),
            'namespace': namespace,
            'docid': docid,
            'mode': 'viewer',
            'modes': settings.CONFIGURATIONS[request.session['configuration']]['modes'] ,
            'modes_json': json.dumps([x[0] for x in settings.CONFIGURATIONS[request.session['configuration']]['modes'] ]),
            'dochtml': doc['html'],
            'docannotations': json.dumps(doc['annotations']),
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
            doc = flat.comm.get(request, '/getdoc/' + namespace + '/' + docid + '/')
        except urllib2.URLError:
            return HttpResponseForbidden("Unable to connect to the document server")
        d = getcontext(request,namespace,docid, doc)
        return render(request, 'viewer.html', d)
    else:
        return HttpResponseForbidden("Permission denied")




@login_required
def subview(request, namespace, docid, elementid):
    if flat.users.models.hasreadpermission(request.user.username, namespace):
        try:
            e = flat.comm.get(request, '/getelement/' + namespace + '/' + docid + '/' + elementid + '/') #handles sid
        except urllib2.URLError:
            return HttpResponseForbidden("Unable to connect to the document server")
        d = {
                'elementid': elementid,
                'html': e['html'],
                'annotations': json.dumps(e['annotations']),
        }
        return HttpResponse(json.dumps(d), mimetype='application/json')
    else:
        return HttpResponseForbidden("Permission denied")

@login_required
def poll(request, namespace, docid):
    if flat.users.models.hasreadpermission(request.user.username, namespace):
        try:
            r = flat.comm.get(request, '/poll/' + namespace + '/' + docid + '/') #handles sid
        except urllib2.URLError:
            return HttpResponseForbidden("Unable to connect to the document server")
        d = []
        if len(r) > 0:
            for elementid in r:
                try:
                    e = flat.comm.get(request, '/getelement/' + namespace + '/' + docid + '/' + elementid + '/')
                except urllib2.URLError:
                    return HttpResponseForbidden("Unable to connect to the document server")
                d.append({
                        'elementid': elementid,
                        'html': e['html'],
                        'annotations': json.dumps(e['annotations']),
                })
        return HttpResponse(json.dumps(d), mimetype='application/json')
    else:
        return HttpResponseForbidden("Permission denied")

