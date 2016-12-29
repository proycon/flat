import sys
if sys.version < '3':
    from urllib import urlencode
    from urllib2 import urlopen, Request
    from StringIO import StringIO
else:
    from urllib.parse import urlencode
    from urllib.request import urlopen, Request
    from io import BytesIO as StringIO
from django.conf import settings
import json
import requests


REQUIREFOLIADOCSERVE = '0.5'

def checkversion(version):
    """Checks foliadocserve version, returns 1 if the document is newer than the library, -1 if it is older, 0 if it is equal"""
    try:
        for refversion, responseversion in zip([int(x) for x in REQUIREFOLIADOCSERVE.split('.')], [int(x) for x in version.split('.')]):
            if responseversion > refversion:
                return 1 #response is newer than library
            elif responseversion < refversion:
                return -1 #response is older than library
        return 0 #versions are equal
    except ValueError:
        raise ValueError("Unable to parse version, invalid syntax")


def getsid(request):
    if 'X-sessionid' in request.META:
        return request.session.session_key + '_' + request.GET['sid']
    else:
        return request.session.session_key + '_NOSID'

def setsid(request, sid):
    request.add_header('X-sessionid', sid)

def query(request, query, parsejson=True, **extradata):
    data = {'query':query}
    for key, value in extradata.items():
        if isinstance(value, bool):
            data[key] = int(value)
        else:
            data[key] = value
    if sys.version < '3':
        #encode for python 2
        for key, value in data.items():
            if isinstance(value,unicode): #pylint: disable=undefined-variable
                data[key] = value.encode('utf-8')

    docservereq = Request("http://" + settings.FOLIADOCSERVE_HOST + ":" + str(settings.FOLIADOCSERVE_PORT) + "/query/")
    setsid(docservereq, getsid(request))
    f = urlopen(docservereq,urlencode(data).encode('utf-8')) #or opener.open()
    if sys.version < '3':
        contents = unicode(f.read(),'utf-8') #pylint: disable=undefined-variable
    else:
        contents = str(f.read(),'utf-8')
    f.close()
    if contents and contents[0] in ('{','['):
        #assume this is json
        if parsejson:
            parsed = json.loads(contents)
            if 'version' not in parsed:
                raise Exception("No version information supplied by foliadocserve, it is likely too old, please upgrade")
            elif checkversion(parsed['version']) == -1:
                raise Exception("Foliadocserve version is too old, got " + parsed['version'] + ", expected at " + REQUIREFOLIADOCSERVE + ", please upgrade")
            return parsed
        else:
            return contents
    elif contents:
        return contents
    else:
        if parsejson:
            return None
        else:
            return ""




def get( request, url, parsejson=True):
    docservereq = Request("http://" + settings.FOLIADOCSERVE_HOST + ":" + str(settings.FOLIADOCSERVE_PORT) + "/" + url) #or opener.open()
    setsid(docservereq, getsid(request))
    f = urlopen(docservereq)
    if sys.version < '3':
        contents = unicode(f.read(),'utf-8')
    else:
        contents = str(f.read(),'utf-8')
    f.close()
    if contents and contents[0] in ('{','['):
        #assume this is json
        if parsejson:
            return json.loads(contents)
        else:
            return contents
    elif contents:
        return contents
    else:
        if parsejson:
            return None
        else:
            return ""

def filemanagement(request, filemanmode, namespace, doc, **data):
    if sys.version < '3':
        #encode for python 2
        for key, value in data.items():
            if isinstance(value,unicode): #pylint: disable=undefined-variable
                data[key] = value.encode('utf-8')

    docservereq = Request("http://" + settings.FOLIADOCSERVE_HOST + ":" + str(settings.FOLIADOCSERVE_PORT) + "/" + filemanmode + "/" + namespace + "/" + doc)
    setsid(docservereq, getsid(request))
    f = urlopen(docservereq,urlencode(data).encode('utf-8')) #or opener.open()
    if sys.version < '3':
        contents = unicode(f.read(),'utf-8') #pylint: disable=undefined-variable
    else:
        contents = str(f.read(),'utf-8')
    f.close()
    if contents and contents[0] in ('{','['):
        return json.loads(contents)
    else:
        return None


def postjson( request, url, data):
    if isinstance(data, dict) or isinstance(data,list) or isinstance(data, tuple):
        data = json.dumps(data)
    docservereq = Request("http://" + settings.FOLIADOCSERVE_HOST + ":" + str(settings.FOLIADOCSERVE_PORT) + "/" + url + '/' + sid) #or opener.open()
    setsid(docservereq, getsid(request))
    docservereq.add_header('Content-Type', 'application/json')
    f = urlopen(docservereq, urlencode(data).encode('utf-8'))
    if sys.version < '3':
        contents = unicode(f.read(),'utf-8')
    else:
        contents = str(f.read(),'utf-8')
    f.close()
    if contents and contents[0] == '{':
        #assume this is json
        return json.loads(contents)
    elif contents:
        return contents
    else:
        return None

def postxml( request, url, f):
    #buf = StringIO()
    #c = pycurl.Curl()
    #url = "http://" + settings.FOLIADOCSERVE_HOST + ":" + str(settings.FOLIADOCSERVE_PORT) + "/" + url
    #c.setopt(c.URL, url.encode('utf-8'))
    #c.setopt(c.HTTPPOST, data.encode('utf-8') )
    #c.setopt(pycurl.HTTPHEADER, ["Content-Type: application/json"])
    #c.setopt(pycurl.POST, 1)
    #c.setopt(pycurl.POSTFIELDS, data.encode('utf-8'))
    #c.setopt(c.WRITEFUNCTION, buf.write)
    #c.perform()
    #code = c.getinfo(c.HTTP_CODE)
    #contents = buf.getvalue()
    #c.close()


    #req = Request("http://" + settings.FOLIADOCSERVE_HOST + ":" + str(settings.FOLIADOCSERVE_PORT) + "/" + url)
    #req.add_header('Content-Type', 'application/xml; charset=utf-8')
    #req.add_data(urlencode({'data':data.encode('utf-8')}))
    #f = urlopen(req)
    #contents = f.read()
    #f.close()

    response = requests.post("http://" + settings.FOLIADOCSERVE_HOST + ":" + str(settings.FOLIADOCSERVE_PORT) + "/" + url, data=f, headers={'Content-Type':'application/xml; charset=utf-8'})
    contents = response.text
    if contents and contents[0] == '{':
        #assume this is json
        return json.loads(contents)
    elif contents:
        return contents
    else:
        return None

