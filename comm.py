
from urllib import urlencode
from urllib2 import urlopen, Request
import flat.settings as settings
import json

def get( request, url):
    url = url.replace("%NS%",request.user.username)
    params = urlencode({'sid': request.session.session_key })
    f = urlopen("http://" + settings.FOLIADOCSERVE_HOST + ":" + str(settings.FOLIADOCSERVE_PORT) + "/" + url + "/" + params) #or opener.open()
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
    url = url.replace("%NS%",request.user.username)
    req = Request("http://" + settings.FOLIADOCSERVE_HOST + ":" + str(settings.FOLIADOCSERVE_PORT) + "/" + url) #or opener.open()
    req.add_header('Content-Type', 'application/json')
    if isinstance(data, dict) or isinstance(data,list) or isinstance(data, tuple):
        data['sid'] = request.session.session_key
        data = json.dumps(data)
    else:
        data = json.loads(data)
        data['sid'] = request.session.session_key
        data = json.dumps(data)
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
