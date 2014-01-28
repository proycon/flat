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
        return render(request, 'editor.html', d)
    else:
        return HttpResponseForbidden("Permission denied")

@login_required
def annotate(request,namespace, docid):
    if flat.users.models.haswritepermission(request.user.username, namespace):
        d = flat.comm.postjson(request, '/annotate/' +namespace + '/' + docid + '/', request.body)
        return HttpResponse(json.dumps(d), mimetype='application/json')
    else:
        return HttpResponseForbidden("Permission denied, no write access")




