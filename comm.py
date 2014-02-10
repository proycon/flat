from urllib import urlencode
from urllib2 import urlopen, Request
from StringIO import StringIO
import flat.settings as settings
import json
import pycurl

def get( request, url, usesid=True):
    if 'sid' in request.GET:
        sid = request.session.session_key + '_' + request.GET['sid']
    elif usesid:
        sid = request.session.session_key + '_NOSID'
    if usesid:
        f = urlopen("http://" + settings.FOLIADOCSERVE_HOST + ":" + str(settings.FOLIADOCSERVE_PORT) + "/" + url + "/" + sid) #or opener.open()
    else:
        f = urlopen("http://" + settings.FOLIADOCSERVE_HOST + ":" + str(settings.FOLIADOCSERVE_PORT) + "/" + url) #or opener.open()
    contents = f.read()
    f.close()
    if contents and contents[0] == '{':
        #assume this is json
        return json.loads(contents)
    elif contents:
        return contents
    else:
        return None

def postjson( request, url, data):
    if isinstance(data, dict) or isinstance(data,list) or isinstance(data, tuple):
        data = json.dumps(data)
    else:
        data = json.loads(data)
        data['sid'] = sid = request.session.session_key + '_' + str(data['sid'])
        data = json.dumps(data)
    req = Request("http://" + settings.FOLIADOCSERVE_HOST + ":" + str(settings.FOLIADOCSERVE_PORT) + "/" + url + '/' + sid) #or opener.open()
    req.add_header('Content-Type', 'application/json')
    f = urlopen(req, data)
    contents = f.read()
    f.close()
    if contents and contents[0] == '{':
        #assume this is json
        return json.loads(contents)
    elif contents:
        return contents
    else:
        return None

def postxml( request, url, data):
    buf = StringIO()
    c = pycurl.Curl()
    url = "http://" + settings.FOLIADOCSERVE_HOST + ":" + str(settings.FOLIADOCSERVE_PORT) + "/" + url
    c.setopt(c.URL, url.encode('utf-8'))
    c.setopt(c.HTTPPOST, [('data',data.encode('utf-8')) ] )
    c.setopt(c.WRITEFUNCTION, buf.write)
    c.perform()
    code = c.getinfo(c.HTTP_CODE)
    contents = buf.getvalue()
    c.close()

    #req = Request("http://" + settings.FOLIADOCSERVE_HOST + ":" + str(settings.FOLIADOCSERVE_PORT) + "/" + url)
    #req.add_header('Content-Type', 'application/xml; charset=utf-8')
    #req.add_data(urlencode({'data':data.encode('utf-8')}))
    #f = urlopen(req)
    #contents = f.read()
    #f.close()
    if contents and contents[0] == '{':
        #assume this is json
        return json.loads(contents)
    elif contents:
        return contents
    else:
        return None

