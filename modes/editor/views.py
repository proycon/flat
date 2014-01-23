from __future__ import print_function, unicode_literals, division, absolute_import
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse,HttpResponseForbidden
import flat.settings as settings
import flat.comm
import flat.users
import json

@login_required
def view(request, namespace, docid):
    if flat.users.models.hasreadpermission(request.user.username, namespace):
        doc = flat.comm.get(request, '/getdoc/%NS%/' + docid + '/')
        d = {
                'namespace': namespace,
                'docid': docid,
                'mode': 'editor',
                'modes': settings.EDITOR_MODES,
                'modes_json': json.dumps([x[0] for x in settings.EDITOR_MODES]),
                'dochtml': doc['html'],
                'docannotations': json.dumps(doc['annotations']),
                'docdeclarations': json.dumps(doc['declarations']),
                'loggedin': request.user.is_authenticated(),
                'username': request.user.username
        }
        #TODO later: add setdefinitions
        return render(request, 'editor.html', d)
    else:
        return HttpResponseForbidden()

@login_required
def annotate(request,namespace, docid):
    if flat.users.models.haswritepermission(request.user.username, namespace):
        d = flat.comm.postjson(request, '/annotate/' +namespace + '/' + docid + '/', request.body)
        return HttpResponse(json.dumps(d), mimetype='application/json')
    else:
        return HttpResponseForbidden()




