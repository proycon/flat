
from urllib import urlencode
from urllib2 import urlopen
import flat.settings as settings
import json

def get( request, url):
    url = url.replace("%NS%",request.user.username)
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
