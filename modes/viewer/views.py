from __future__ import print_function, unicode_literals, division, absolute_import
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
import flat.comm as comm
import flat.settings as settings

def view(request, docid):
    data = comm.get(request, '/getdoc/%NS%/' + docid + '/')
    pass


