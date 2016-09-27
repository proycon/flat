#from django.conf.urls import patterns, include, url
from django import VERSION
if VERSION[0] > 1 or VERSION[1] >= 8: #Django 1.8 and higher
    from django.conf.urls import url, include
elif VERSION[1] >= 6: #Django 1.6
    from django.conf.urls import patterns, url, include
else:
    from django.conf.urls.defaults import *

import flat.modes.editor.views

urlpatterns = [
    # Examples:
    url(r'^(?P<namespace>[\w\d\-_\./@]+)/(?P<docid>[\w\d\-_\.]+)/history/?$', flat.modes.editor.views.history, name='history'),
    url(r'^(?P<namespace>[\w\d\-_\./@]+)/(?P<docid>[\w\d\-_\.]+)/revert/(?P<commithash>[a-f0-9]*)/?$', flat.modes.editor.views.revert, name='revert'),
    url(r'^(?P<namespace>[\w\d\-_\./@]+)/(?P<docid>[\w\d\-_\.]+)/save/?$', flat.modes.editor.views.save, name='save'),
    url(r'^(?P<namespace>[\w\d\-_\./@]+)/(?P<docid>[\w\d\-_\.]+)/?$', flat.modes.editor.views.view, name='view'),

    #redeclare viewer stuff: (why?)
    url(r'^(?P<namespace>[\w\d\-_\./@]+)/(?P<docid>[\w\d\-_\.]+)/poll/?$', flat.modes.viewer.views.poll, name='poll'),
    url(r'^(?P<namespace>[\w\d\-_\./@]+)/(?P<docid>[\w\d\-_\.]+)/query/?$', flat.modes.viewer.views.query, name='query'),
    #url(r'^(?P<namespace>[\w\d\-_\./]+)/(?P<docid>[\w\d\-_\.]+)/(?P<elementid>[\w\d\-_\.]+)/?$', 'flat.modes.viewer.views.subview', name='subview'),
]

if VERSION[0] == 1 and VERSION[1] < 8: #Django <1.8
    urlpatterns = patterns('',*urlpatterns)
