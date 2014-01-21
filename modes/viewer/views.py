from __future__ import print_function, unicode_literals, division, absolute_import
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
import flat.comm as comm
import flat.settings as settings
import json

@login_required
def view(request, docid):
    doc = comm.get(request, '/getdoc/%NS%/' + docid + '/')
    return render(request, 'viewer.html', {'docid': docid, 'mode': 'viewer', 'modes': settings.EDITOR_MODES, 'modes_json': json.dumps([x[0] for x in settings.EDITOR_MODES]), 'dochtml': doc['html'], 'docannotations': json.dumps(doc['annotations']), 'loggedin': request.user.is_authenticated(), 'username': request.user.username})


