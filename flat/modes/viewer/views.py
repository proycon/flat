from __future__ import print_function, unicode_literals, division, absolute_import
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, HttpResponseForbidden
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
import flat.comm
import flat.users
from flat.views import initdoc, query
import json
import sys
from urllib.error import URLError



@login_required
def view(request, namespace, docid):
    """The initial viewer, does not provide the document content yet"""
    return initdoc(request, namespace,docid, 'viewer', 'viewer.html')

@login_required
def poll(request, namespace, docid):
    if flat.users.models.hasreadpermission(request.user.username, namespace, request):
        try:
            r = flat.comm.get(request, '/poll/' + namespace + '/' + docid + '/', False)
        except URLError:
            return HttpResponseForbidden("Unable to connect to the document server [viewer/poll]")
        return HttpResponse(r, content_type='application/json')
    else:
        return HttpResponseForbidden("Permission denied")

@csrf_exempt
def pub_view(request, configuration, docid):
    """The initial viewer, does not provide the document content yet"""
    return initdoc(request, 'pub',docid, 'viewer', 'viewer.html', configuration=configuration)

@csrf_exempt
def pub_poll(request, docid):
    """The initial viewer, does not provide the document content yet"""
    try:
        r = flat.comm.get(request, '/poll/pub/' + docid + '/', False)
    except URLError:
        return HttpResponseForbidden("Unable to connect to the document server [viewer/poll]")
    return HttpResponse(r, content_type='application/json')
