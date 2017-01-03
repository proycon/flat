#from django.conf.urls import patterns, include, url
from django import VERSION
if VERSION[0] > 1 or VERSION[1] >= 8: #Django 1.8 and higher
    from django.conf.urls import url, include
elif VERSION[1] >= 6: #Django 1.6
    from django.conf.urls import patterns, url, include
else:
    from django.conf.urls.defaults import *

import flat.modes.viewer.views

urlpatterns = [
    # Examples:
    url(r'^pub/(?P<docid>[\w\d\-_\.]+)/poll/?$', flat.modes.viewer.views.pub_poll, name='poll'),
    url(r'^pub/(?P<configuration>[\w\d\-_\./@]+)/(?P<docid>[\w\d\-_\.]+)/?$', flat.modes.viewer.views.pub_view, name='view'),
    url(r'^(?P<namespace>[\w\d\-_\./@]+)/(?P<docid>[\w\d\-_\.]+)/poll/?$', flat.modes.viewer.views.poll, name='poll'),
    url(r'^(?P<namespace>[\w\d\-_\./@]+)/(?P<docid>[\w\d\-_\.]+)/?$', flat.modes.viewer.views.view, name='view'),
]

if VERSION[0] == 1 and VERSION[1] < 8: #Django <1.8
    urlpatterns = patterns('',*urlpatterns)
