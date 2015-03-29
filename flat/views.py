from __future__ import print_function, unicode_literals, division, absolute_import
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, HttpResponseForbidden, HttpResponseRedirect
import django.contrib.auth
import datetime
import flat.settings as settings
import flat.comm
import flat.users
import sys
if sys.version < '3':
    from urllib2 import URLError
else:
    from urllib.error import URLError
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
                return render(request, 'login.html', {'error': "This account is disabled","defaultconfiguration":settings.DEFAULTCONFIGURATION, "configurations":settings.CONFIGURATIONS , 'version': settings.VERSION} )
        else:
            # Return an 'invalid login' error message.
            return render(request, 'login.html', {'error': "Invalid username or password","defaultconfiguration":settings.DEFAULTCONFIGURATION, "configurations":settings.CONFIGURATIONS, 'version': settings.VERSION} )
    else:
        return render(request, 'login.html',{"defaultconfiguration":settings.DEFAULTCONFIGURATION, "configurations":settings.CONFIGURATIONS, "version": settings.VERSION})


def logout(request):
    if 'configuration' in request.session:
        del request.session['configuration']
    django.contrib.auth.logout(request)
    return redirect("/login")


def register(request):
    if request.method == 'POST':
        form = django.contrib.auth.forms.UserCreationForm(request.POST)
        if form.is_valid():
            new_user = form.save()
            return HttpResponseRedirect("/login/")
    else:
        form = django.contrib.auth.forms.UserCreationForm()
    return render(request, "register.html", {
        'form': form,
        'version': settings.VERSION,
    })


@login_required
def index(request, namespace=""):
    try:
        namespaces = flat.comm.get(request, '/namespaces/' + namespace)
    except URLError as e:
        return HttpResponseForbidden("The document server returned an error: "  + str(e))

    if not namespace:
        #check if user namespace is preset, if not, make it
        if not request.user.username in namespaces['namespaces']:
            try:
                flat.comm.get(request, "createnamespace/" + request.user.username, False)
            except URLError as e:
                return HttpResponseForbidden("Unable to connect to the document server" + str(e))

    readpermission = flat.users.models.hasreadpermission(request.user.username, namespace)
    dirs = []
    print(namespaces['namespaces'],file=sys.stderr)
    for ns in sorted(namespaces['namespaces']):
        if readpermission or flat.users.models.hasreadpermission(request.user.username, os.path.join(namespace, ns)):
            dirs.append(ns)

    dirs.sort()

    docs = []
    if namespace and readpermission:
        try:
            r = flat.comm.get(request, '/documents/' + namespace)
        except URLError as e:
            return HttpResponseForbidden("The document server returned an error: " + str(e))
        for d in sorted(r['documents']):
            docid =  os.path.basename(d.replace('.folia.xml',''))
            docs.append( (docid, round(r['filesize'][d] / 1024 / 1024,2) , datetime.datetime.fromtimestamp(r['timestamp'][d]).strftime("%Y-%m-%d %H:%M") ) )

    if not 'configuration' in request.session:
        return logout(request)

    docs.sort()

    if namespace:
        parentdir = '/'.join(namespace.split('/')[:-1])
    else:
        parentdir = ""

    return render(request, 'index.html', {'namespace': namespace,'parentdir': parentdir, 'dirs': dirs, 'docs': docs, 'defaultmode': settings.DEFAULTMODE,'loggedin': request.user.is_authenticated(), 'username': request.user.username, 'configuration': settings.CONFIGURATIONS[request.session['configuration']], 'version': settings.VERSION})

@login_required
def download(request, namespace, docid):
    data = flat.comm.query(request, "USE " + namespace + "/" + docid + " GET",False)
    return HttpResponse(data, content_type='text/xml')


@login_required
def upload(request):
    if request.method == 'POST':
        namespace = request.POST['namespace'].replace('/','').replace('..','.').replace(' ','').replace('&','')
        if flat.users.models.haswritepermission(request.user.username, namespace) and 'file' in request.FILES:
            if sys.version < '3':
                data = unicode(request.FILES['file'].read(),'utf-8')
            else:
                data = str(request.FILES['file'].read(),'utf-8')
            try:
                response = flat.comm.postxml(request,"upload/" + namespace , data)
            except URLError as e:
                return HttpResponseForbidden("The document server returned an error: " + str(e))
            if 'error' in response and response['error']:
                return HttpResponseForbidden(response['error'])
            else:
                docid = response['docid']
                return HttpResponseRedirect("/" + settings.DEFAULTMODE + "/" + namespace + "/" + docid  )
        else:
            return HttpResponseForbidden("Permission denied")
    else:
        return HttpResponseForbidden("Permission denied")


@login_required
def addnamespace(request):
    if request.method == 'POST':
        namespace = request.POST['namespace'].replace('/','').replace('..','.').replace(' ','').replace('&','')
        newdirectory = request.POST['newdirectory'].replace('/','').replace('..','.').replace(' ','').replace('&','')
        if flat.users.models.haswritepermission(request.user.username, namespace):
            try:
                response = flat.comm.get(request,"createnamespace/" + namespace + "/" + newdirectory)
            except URLError as e:
                return HttpResponseForbidden("The document server returned an error: " + str(e))
            if 'error' in response and response['error']:
                return HttpResponseForbidden(response['error'])
            elif namespace:
                return HttpResponseRedirect("/index/" + namespace + '/' + newdirectory  )
            else:
                return HttpResponseRedirect("/index/" + newdirectory  )
        else:
            return HttpResponseForbidden("Permission denied")
    else:
        return HttpResponseForbidden("Permission denied")
