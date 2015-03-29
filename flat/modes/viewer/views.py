from __future__ import print_function, unicode_literals, division, absolute_import
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, HttpResponseForbidden
from django.conf import settings
import flat.comm
import flat.users
from flat.views import initdoc, query
import json
import sys
if sys.version < '3':
    from urllib2 import URLError
else:
    from urllib.error import URLError



@login_required
def view(request, namespace, docid):
    """The initial viewer, does not provide the document content yet"""
    context = initdoc(request, namespace,docid, 'viewer')
    return render(request, 'viewer.html', context)


@login_required
def query(request,namespace, docid):
    if flat.users.models.hasreadpermission(request.user.username, namespace):
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
        query = "\n".join(data['queries']) #todo: check and constrain queries to make sure they don't violate permissions
        try:
            d = flat.comm.query(request, query)
        except URLError as e:
            return HttpResponseForbidden("Unable to connect to the document server: " + e.reason + " [viewer/query]")
        return HttpResponse(json.dumps(d).encode('utf-8'), content_type='application/json')
    else:
        return HttpResponseForbidden("Permission denied, no read access")


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

