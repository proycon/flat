from __future__ import print_function, unicode_literals, division, absolute_import
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse,HttpResponseForbidden
import sys
from urllib.error import URLError
from django.conf import settings
import flat.comm
import flat.users
from flat.views import initdoc, fatalerror, getusername
import json


@login_required
def view(request, namespace, docid):
    """The initial view, does not provide the document content yet"""
    if flat.users.models.hasreadpermission(getusername(request), namespace, request):
        if 'autodeclare' in settings.CONFIGURATIONS[request.session['configuration']]:
            if flat.users.models.haswritepermission(getusername(request), namespace, request):
                for annotationtype, set in settings.CONFIGURATIONS[request.session['configuration']]['autodeclare']:
                    try:
                        r = flat.comm.query(request, "USE " + namespace + "/" + docid + " DECLARE " + annotationtype + " OF " + set)
                    except Exception as e:
                        return fatalerror(request,e)

        return initdoc(request, namespace,docid, 'metadata', 'metadata.html')
    else:
        return fatalerror(request,"Permission denied")

