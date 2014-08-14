#!/usr/bin/env python
import os, sys

#sanity check
if not os.path.exists('/var/www2/flat/test/repo/flat'):
        raise Exception("Flat dir not found")
if not os.path.exists('/var/www2/flat/test/repo/flat/settings.py'):
        raise Exception("settings not found")

if not '/var/www2/flat/test/repo' in sys.path:
    sys.path.append('/var/www2/flat/test/repo')
if not '/var/www2/flat/test/repo/flat' in sys.path:
    sys.path.append('/var/www2/flat/test/repo/flat')

os.environ['DJANGO_SETTINGS_MODULE'] = 'flat.settings'
os.environ['DEV'] = 'true'

import django.core.handlers.wsgi
application = django.core.handlers.wsgi.WSGIHandler()


