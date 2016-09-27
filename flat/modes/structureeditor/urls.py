#from django.conf.urls import patterns, include, url
from django import VERSION
if VERSION[0] > 1 or VERSION[1] >= 8: #Django 1.8 and higher
    from django.conf.urls import url, include
elif VERSION[1] >= 6: #Django 1.6
    from django.conf.urls import patterns, url, include
else:
    from django.conf.urls.defaults import *

import flat.modes.structureeditor.views

urlpatterns = [
    # Examples:
    url(r'^(?P<namespace>[\w\-_\.@]+)/(?P<docid>[\w\-\.]+)/?$', flat.modes.structureeditor.views.view, name='view'),
    #url(r'^(?P<namespace>[\w\-\.]+)/(?P<docid>[\w\-\.]+)/annotate/?$', 'flat.modes.structureeditor.views.annotate', name='annotate'),
]

if VERSION[0] == 1 and VERSION[1] < 8: #Django <1.8
    urlpatterns = patterns('',*urlpatterns)
