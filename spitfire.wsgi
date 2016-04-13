#!/usr/bin/env python
import os, sys
import site


site.addsitedir('/var/www2/flat/live/env/lib/python2.7/site-packages') #all python eggs here should be available


#sanity check
if not os.path.exists('/var/www2/flat/live/repo/flat'):
        raise Exception("Flat dir not found")

if not '/var/www2/flat/live/repo' in sys.path:
    sys.path.append('/var/www2/flat/live/repo')
if not '/var/www2/flat/live/repo/flat' in sys.path:
    sys.path.append('/var/www2/flat/live/repo/flat')
if not '/var/www2/flat/live/repo/flat/config' in sys.path:
    sys.path.append('/var/www2/flat/live/repo/flat/config')

os.environ['DJANGO_SETTINGS_MODULE'] = 'rusettings'

import django.core.handlers.wsgi
application = django.core.handlers.wsgi.WSGIHandler()


