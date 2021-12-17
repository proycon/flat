#from django.conf.urls import patterns, include, url
from django import VERSION
from django.urls import re_path, include

import flat.modes.viewer.views

urlpatterns = [
    # Examples:
    re_path(r'^pub/(?P<docid>[\w\d\-_\.]+)/poll/?$', flat.modes.viewer.views.pub_poll, name='poll'),
    re_path(r'^pub/(?P<configuration>[\w\d\-_\./@]+)/(?P<docid>[\w\d\-_\.]+)/?$', flat.modes.viewer.views.pub_view, name='view'),
    re_path(r'^(?P<namespace>[\w\d\-_\./@]+)/(?P<docid>[\w\d\-_\.]+)/poll/?$', flat.modes.viewer.views.poll, name='poll'),
    re_path(r'^(?P<namespace>[\w\d\-_\./@]+)/(?P<docid>[\w\d\-_\.]+)/?$', flat.modes.viewer.views.view, name='view'),
]

