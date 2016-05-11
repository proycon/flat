#!/usr/bin/env python
import os, sys
import site

VIRTUALENV = '/path/to/your/virtualenv'
site.addsitedir(VIRTUALENV + '/lib/python' + str(sys.version_info.major) + '.' + str(sys.version_info.minor) + '/site-packages')

SETTINGSDIR = '/path/to/flat/root/dir' #the dir that holds your settings.py

if SETTINGSDIR not in sys.path:
    sys.path.append(SETTINGSDIR)

os.environ['DJANGO_SETTINGS_MODULE'] = 'settings'

import django.core.handlers.wsgi
application = django.core.handlers.wsgi.WSGIHandler()


