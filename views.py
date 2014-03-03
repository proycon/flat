from __future__ import print_function, unicode_literals, division, absolute_import
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, HttpResponseForbidden, HttpResponseRedirect
import django.contrib.auth
import datetime
import flat.settings as settings
import flat.comm
import flat.users
import urllib2
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
                return render(request, 'login.html', {'error': "This account is disabled","configurations":settings.CONFIGURATIONS , 'version': settings.VERSION} )
        else:
            # Return an 'invalid login' error message.
            return render(request, 'login.html', {'error': "Invalid username or password","configurations":settings.CONFIGURATIONS, 'version': settings.VERSION} )
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
    try:
        namespaces = flat.comm.get(request, '/getnamespaces/', False)
    except urllib2.URLError:
        return HttpResponseForbidden("Unable to connect to the document server")
    if not request.user.username in namespaces['namespaces']:
        try:
            flat.comm.get(request, "makenamespace/" + request.user.username, False)
        except urllib2.URLError:
            return HttpResponseForbidden("Unable to connect to the document server")

    namespaces_sorted = sorted([x for x in namespaces['namespaces'] if x != request.user.username])
    namespaces_sorted = [request.user.username] +  namespaces_sorted
    for namespace in namespaces_sorted:
        if flat.users.models.hasreadpermission(request.user.username, namespace):
            try:
                r = flat.comm.get(request, '/getdocuments/' + namespace, False)
            except urllib2.URLError:
                return HttpResponseForbidden("Unable to connect to the document server")
            docs[namespace] = []
            for d in sorted(r['documents']):
                docid =  os.path.basename(d.replace('.folia.xml',''))
                docs[namespace].append( (docid, datetime.datetime.fromtimestamp(r['timestamp'][d]).strftime("%Y-%m-%d %H:%M") ) )

    return render(request, 'index.html', {'docs': docs.items(), 'defaultmode': settings.DEFAULTMODE,'loggedin': request.user.is_authenticated(), 'username': request.user.username, 'configuration': settings.CONFIGURATIONS[request.session['configuration']], 'version': settings.VERSION})

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
            try:
                response = flat.comm.postxml(request,"upload/" + namespace , data)
            except urllib2.URLError:
                return HttpResponseForbidden("Unable to connect to the document server")
            docid = response['docid']
            return HttpResponseRedirect("/" + settings.DEFAULTMODE + "/" + namespace + "/" + docid  )
        else:
            return HttpResponseForbidden("Permission denied")
    else:
        return HttpResponseForbidden("Permission denied")

