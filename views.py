from __future__ import print_function, unicode_literals, division, absolute_import
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, HttpResponseForbidden, HttpResponseRedirect
import django.contrib.auth
import flat.settings as settings
import flat.comm
import flat.users
import os

def login(request):
    if 'username' in request.POST and 'password' in request.POST:
        username = request.POST['username']
        password = request.POST['password']
        request.session['configuration'] = request.POST['configuration']
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
                return render(request, 'login.html', {'error': "This account is disabled","configurations":settings.CONFIGURATIONS } )
        else:
            # Return an 'invalid login' error message.
            return render(request, 'login.html', {'error': "Invalid username or password","configurations":settings.CONFIGURATIONS} )
    else:
        return render(request, 'login.html',{"configurations":settings.CONFIGURATIONS})


def logout(request):
    if 'configuration' in request.session:
        del request.session['configuration']
    django.contrib.auth.logout(request)
    return redirect("/login")

@login_required
def index(request):
    docs = {}
    namespaces = flat.comm.get(request, '/getnamespaces/', False)
    if not request.user.username in namespaces['namespaces']:
        flat.comm.get(request, "makenamespace/" + request.user.username, False)
    for namespace in namespaces['namespaces']:
        if flat.users.models.hasreadpermission(request.user.username, namespace):
            docfiles = flat.comm.get(request, '/getdocuments/' + namespace, False)
            docs[namespace] = []
            for d in docfiles['documents']:
                docid =  os.path.basename(d.replace('.folia.xml',''))
                docs[namespace].append(docid)

    return render(request, 'index.html', {'docs': docs.items(), 'defaultmode': settings.DEFAULTMODE,'loggedin': request.user.is_authenticated(), 'username': request.user.username, 'configuration': settings.CONFIGURATIONS[request.session['configuration']]})

@login_required
def download(request, namespace, docid):
    data = flat.comm.get(request, '/getdocxml/' +namespace + '/' + docid + '/',False)
    return HttpResponse(data, mimetype='text/xml')


@login_required
def upload(request):
    if request.method == 'POST':
        namespace = request.POST['namespace'].replace('/','').replace('..','.')
        if 'file' in request.FILES:
            data = unicode(request.FILES['file'].read(),'utf-8')
            response = flat.comm.postxml(request,"upload/" + namespace + "/", data)
            docid = response['docid']
            return HttpResponseRedirect("/" + settings.DEFAULTMODE + "/" + namespace + "/" + docid + "/")
        else:
            return HttpResponseForbidden("Permission denied")
    else:
        return HttpResponseForbidden("Permission denied")

