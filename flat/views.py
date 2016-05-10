from __future__ import print_function, unicode_literals, division, absolute_import
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, HttpResponseForbidden, HttpResponseRedirect
import django.contrib.auth
from pynlpl.formats import fql
import json
import datetime
from django.conf import settings
import flat.comm
import flat.users
import lxml.html
import sys
if sys.version < '3':
    from urllib2 import URLError, HTTPError #pylint: disable=import-error
else:
    from urllib.error import URLError, HTTPError
import os

def getcontext(request,namespace,docid, doc, mode):
    return {
            'configuration': settings.CONFIGURATIONS[request.session['configuration']],
            'configuration_json': json.dumps(settings.CONFIGURATIONS[request.session['configuration']]),
            'namespace': namespace,
            'testnum': request.GET.get('testNumber',0),
            'docid': docid,
            'mode': mode,
            'modes': settings.CONFIGURATIONS[request.session['configuration']]['modes'] ,
            'modes_json': json.dumps([x[0] for x in settings.CONFIGURATIONS[request.session['configuration']]['modes'] ]),
            'perspectives_json': json.dumps(settings.CONFIGURATIONS[request.session['configuration']]['perspectives']),
            'docdeclarations': json.dumps(doc['declarations']) if 'declarations' in doc else "{}",
            'setdefinitions': json.dumps(doc['setdefinitions']) if 'setdefinitions' in doc else "{}",
            'toc': json.dumps(doc['toc']) if 'toc' in doc else "[]",
            'slices': json.dumps(doc['slices']) if 'slices' in doc else "{}",
            'rtl': True if 'rtl' in doc and doc['rtl'] else False,
            'loggedin': request.user.is_authenticated(),
            'version': settings.VERSION,
            'username': request.user.username,
            'waitmessage': "Loading document on server and initialising web-environment...",
    }

def validatenamespace(namespace):
    return namespace.replace('..','').replace('"','').replace(' ','_').replace(';','').replace('&','').strip('/')

def getdocumentselector(query):
    if query.startswith("USE "):
        end = query[4:].index(' ') + 4
        if end >= 0:
            try:
                namespace,docid = query[4:end].rsplit("/",1)
            except:
                raise fql.SyntaxError("USE statement takes namespace/docid pair")
            return (validatenamespace(namespace),docid), query[end+1:]
        else:
            try:
                namespace,docid = query[4:end].rsplit("/",1)
            except:
                raise fql.SyntaxError("USE statement takes namespace/docid pair")
            return (validatenamespace(namespace),docid), ""
    return None, query

def getbody(html):
    doc = lxml.html.fromstring(html)
    return doc.xpath("//body/p")[0].text_content()

def docserveerror(e, d=None):
    if d is None: d={}
    if isinstance(e, HTTPError):
        body = getbody(e.read())
        d['fatalerror'] =  "<strong>Fatal Error:</strong> The document server returned an error<pre style=\"font-weight: bold\">" + str(e) + "</pre><pre>" + body +"</pre>"
        d['fatalerror_text'] = body
    elif isinstance(e, URLError):
        d['fatalerror'] =  "<strong>Fatal Error:</strong> Could not connect to document server!"
        d['fatalerror_text'] =  "Could not connect to document server!"
    elif isinstance(e, str) :
        if sys.version < '3':
            d['fatalerror'] =   e.decode('utf-8') #pylint: disable=undefined-variable
            d['fatalerror_text'] = e.decode('utf-8') #pylint: disable=undefined-variable
        else:
            d['fatalerror'] =  e
            d['fatalerror_text'] = e
    elif sys.version < '3' and isinstance(e, unicode): #pylint: disable=undefined-variable
        d['fatalerror'] =  e
        d['fatalerror_text'] = e
    elif isinstance(e, Exception):
        # we don't handle other exceptions, raise!
        raise e
    return d


def initdoc(request, namespace, docid, mode, template, context=None):
    """Initialise a document (not invoked directly)"""
    perspective = request.GET.get('perspective','document')
    if context is None: context = {}
    flatargs = {
        'setdefinitions': True,
        'declarations': True,
        'toc': True,
        'slices': request.GET.get('slices',settings.CONFIGURATIONS[request.session['configuration']].get('slices','p:25,s:100')), #overriden either by configuration or by user
        'customslicesize': 0, #disabled for initial probe
        'textclasses': True,
    }
    try:
        doc = flat.comm.query(request, "USE " + namespace + "/" + docid + " PROBE", **flatargs) #retrieves only the meta information, not document content
        context.update(getcontext(request,namespace,docid, doc, mode))
    except Exception as e:
        context.update(docserveerror(e))
    response = render(request, template, context)
    if 'fatalerror' in context:
        response.status_code = 500
    return response

@login_required
def query(request,namespace, docid):
    if request.method != 'POST':
        return HttpResponseForbidden("POST method required for " + namespace + "/" + docid + "/query")

    flatargs = {
        'customslicesize': request.POST.get('customslicesize',settings.CONFIGURATIONS[request.session['configuration']].get('customslicesize','50')), #for pagination of search results
    }

    if flat.users.models.hasreadpermission(request.user.username, namespace):

        #stupid compatibility stuff
        if sys.version < '3':
            if hasattr(request, 'body'):
                data = json.loads(unicode(request.body,'utf-8')) #pylint: disable=undefined-variable
            else: #older django
                data = json.loads(unicode(request.raw_post_data,'utf-8')) #pylint: disable=undefined-variable
        else:
            if hasattr(request, 'body'):
                data = json.loads(str(request.body,'utf-8'))
            else: #older django
                data = json.loads(str(request.raw_post_data,'utf-8'))

        if not data['queries']:
            return HttpResponseForbidden("No queries to run")

        for query in data['queries']:
            #get document selector and check it doesn't violate the namespace
            docselector, query = getdocumentselector(query)
            if not docselector:
                return HttpResponseForbidden("Query does not start with a valid document selector (USE keyword)!")
            elif docselector[0] != namespace:
                return HttpResponseForbidden("Query would affect a different namespace than your current one, forbidden!")

            if query != "GET" and query[:4] != "CQL ":
                #parse query on this end to catch syntax errors prior to sending, should be fast enough anyway
                try:
                    query = fql.Query(query)
                except fql.SyntaxError as e:
                    return HttpResponseForbidden("FQL Syntax Error: " + e)
                needwritepermission = query.declarations or query.action and query.action.action != "SELECT"
            else:
                needwritepermission = False

        if needwritepermission and not flat.users.models.haswritepermission(request.user.username, namespace):
            return HttpResponseForbidden("Permission denied, no write access")

        query = "\n".join(data['queries']) #throw all queries on a big pile to transmit
        try:
            d = flat.comm.query(request, query,**flatargs)
        except Exception as e:
            if sys.version < '3':
                errmsg = docserveerror(e)['fatalerror_text']
                return HttpResponseForbidden("FoLiA Document Server error: ".encode('utf-8') + errmsg.encode('utf-8'))
            else:
                return HttpResponseForbidden("FoLiA Document Server error: " + docserveerror(e)['fatalerror_text'])
        return HttpResponse(json.dumps(d).encode('utf-8'), content_type='application/json')
    else:
        return HttpResponseForbidden("Permission denied, no read access")

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

def fatalerror(request, e,code=404):
    if isinstance(e, Exception):
        response = render(request,'base.html', docserveerror(e))
    else:
        response = render(request,'base.html', {'fatalerror': e})
    response.status_code = code
    return response


@login_required
def index(request, namespace=""):
    try:
        namespaces = flat.comm.get(request, '/namespaces/' + namespace)
    except Exception as e:
        return fatalerror(request,e)

    if not namespace:
        #check if user namespace is preset, if not, make it
        if not request.user.username in namespaces['namespaces']:
            try:
                flat.comm.get(request, "createnamespace/" + request.user.username, False)
            except Exception as e:
                return fatalerror(request,e)

    readpermission = flat.users.models.hasreadpermission(request.user.username, namespace)
    dirs = []
    for ns in sorted(namespaces['namespaces']):
        if readpermission or flat.users.models.hasreadpermission(request.user.username, os.path.join(namespace, ns)):
            dirs.append(ns)

    dirs.sort()

    docs = []
    if namespace and readpermission:
        try:
            r = flat.comm.get(request, '/documents/' + namespace)
        except Exception as e:
            return fatalerror(request,e)
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
            #if sys.version < '3':
            #    data = unicode(request.FILES['file'].read(),'utf-8') #pylint: disable=undefined-variable
            #else:
            #    data = str(request.FILES['file'].read(),'utf-8')
            try:
                response = flat.comm.postxml(request,"upload/" + namespace , request.FILES['file'])
            except Exception as e:
                return fatalerror(request,e)
            if 'error' in response and response['error']:
                return fatalerror(response['error'],403)
            else:
                docid = response['docid']
                return HttpResponseRedirect("/" + settings.DEFAULTMODE + "/" + namespace + "/" + docid  )
        else:
            return fatalerror("Permission denied",403)
    else:
        return fatalerror("Permission denied",403)


@login_required
def addnamespace(request):
    if request.method == 'POST':
        namespace = request.POST['namespace'].replace('/','').replace('..','.').replace(' ','').replace('&','')
        newdirectory = request.POST['newdirectory'].replace('/','').replace('..','.').replace(' ','').replace('&','')
        if flat.users.models.haswritepermission(request.user.username, namespace):
            try:
                response = flat.comm.get(request,"createnamespace/" + namespace + "/" + newdirectory)
            except Exception as e:
                return fatalerror(request,e)
            if 'error' in response and response['error']:
                return fatalerror(response['error'],403)
            elif namespace:
                return HttpResponseRedirect("/index/" + namespace + '/' + newdirectory  )
            else:
                return HttpResponseRedirect("/index/" + newdirectory  )
        else:
            return fatalerror("Permission denied",403)
    else:
        return fatalerror("Permission denied",403)
