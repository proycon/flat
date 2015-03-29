#from django.conf.urls import patterns, include, url
from django import VERSION
if VERSION[1] >= 6: #Django 1.6
    from django.conf.urls import patterns, url, include
else:
    from django.conf.urls.defaults import *

urlpatterns = patterns('',
    # Examples:
    url(r'^(?P<namespace>[\w\d\-_\./]+)/(?P<docid>[\w\d\-_\.]+)/poll/?$', 'flat.modes.viewer.views.poll', name='poll'),
    url(r'^(?P<namespace>[\w\d\-_\./]+)/(?P<docid>[\w\d\-_\.]+)/?$', 'flat.modes.viewer.views.view', name='view'),
)
