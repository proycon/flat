#!/usr/bin/env python
import os, sys

#sanity check
if not os.path.exists('/var/www2/flat/dev/repo/flat'):
        raise Exception("Flat dir not found")
if not os.path.exists('/var/www2/flat/dev/repo/flat/settings.py'):
        raise Exception("settings not found")

if not '/var/www2/flat/live/repo' in sys.path:
    sys.path.append('/var/www2/flat/dev/repo')
if not '/var/www2/flat/live/repo/flat' in sys.path:
    sys.path.append('/var/www2/flat/dev/repo/flat')

os.environ['DJANGO_SETTINGS_MODULE'] = 'flat.settings'

import django.core.handlers.wsgi
application = django.core.handlers.wsgi.WSGIHandler()


