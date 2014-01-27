
from urllib import urlencode
from urllib2 import urlopen, Request
import flat.settings as settings
import json

def get( request, url):
    if 'sid' in request.GET:
        sid = request.session.session_key + '_' + request.GET['sid']
    else:
        sid = request.session.session_key + '_NOSID'
    f = urlopen("http://" + settings.FOLIADOCSERVE_HOST + ":" + str(settings.FOLIADOCSERVE_PORT) + "/" + url + "/" + sid) #or opener.open()
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
