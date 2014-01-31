from __future__ import print_function, unicode_literals, division, absolute_import
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
import django.contrib.auth
import flat.settings as settings
import flat.comm
import flat.users
import os
import sys


def login(request):
    if 'username' in request.POST and 'password' in request.POST:
        username = request.POST['username']
        password = request.POST['password']
        user = django.contrib.auth.authenticate(username=username, password=password)
        if user is not None:
            if user.is_active:
                django.contrib.auth.login(request, user)
                # Redirect to a success page.
                if 'next' in request.POST:
                    return redirect("/" + request.POST['next'])
                elif 'next' in request.GET:
                    return redirect("/" + request.GET['next'])
                else:
                    return redirect("/")
            else:
                # Return a 'disabled account' error message
                return render(request, 'login.html', {'error', "This account is disabled" } )
        else:
            # Return an 'invalid login' error message.
            return render(request, 'login.html', {'error': "Invalid username or password"} )
    else:
        return render(request, 'login.html')


def logout(request):
    django.contrib.auth.logout(request)
    return redirect("/login")

@login_required
def index(request):
    docs = {}
    namespaces = flat.comm.get(request, '/getnamespaces/', False)
    print(repr(namespaces),file=sys.stderr)
    if not request.user.username in namespaces['namespaces']:
        flat.comm.get(request, "makenamespace/" + request.user.username, False)
    for namespace in namespaces['namespaces']:
        if flat.users.models.hasreadpermission(request.user.username, namespace):
            docfiles = flat.comm.get(request, '/getdocuments/' + namespace, False)
            docs[namespace] = []
            for d in docfiles['documents']:
                docid =  os.path.basename(d.replace('.folia.xml',''))
                docs[namespace].append(docid)

    return render(request, 'index.html', {'docs': docs.items(), 'defaultmode': settings.DEFAULTMODE,'loggedin': request.user.is_authenticated(), 'username': request.user.username})



