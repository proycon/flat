from __future__ import print_function, unicode_literals, division, absolute_import
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, HttpResponseForbidden
import flat.settings as settings
import flat.comm
import flat.users
import json

@login_required
def view(request, namespace, docid):
    if flat.users.models.hasreadpermission(request.user.username, namespace):
        doc = flat.comm.get(request, '/getdoc/' + namespace + '/' + docid + '/')
        d = {
                'namespace': namespace,
                'docid': docid,
                'mode': 'viewer',
                'modes': settings.EDITOR_MODES,
                'modes_json': json.dumps([x[0] for x in settings.EDITOR_MODES]),
                'dochtml': doc['html'],
                'docannotations': json.dumps(doc['annotations']),
                'docdeclarations': json.dumps(doc['declarations']),
                'loggedin': request.user.is_authenticated(),
                'username': request.user.username
        }
        #TODO later: add setdefinitions
        return render(request, 'viewer.html', d)
    else:
        return HttpResponseForbidden()




@login_required
def subview(request, namespace, docid, elementid):
    if flat.users.models.hasreadpermission(request.user.username, namespace):
        e = flat.comm.get(request, '/getelement/' + namespace + '/' + docid + '/' + elementid + '/')
        d = {
                'elementid': elementid,
                'html': e['html'],
                'annotations': json.dumps(e['annotations']),
        }
        return HttpResponse(json.dumps(d), mimetype='application/json')
    else:
        return HttpResponseForbidden()
