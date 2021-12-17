#from django.conf.urls import patterns, include, url
from django import VERSION
from django.urls import re_path, include

import flat.modes.editor.views

urlpatterns = [
    # Examples:
    re_path(r'^pub/(?P<configuration>[\w\d\-_\./@]+)/(?P<docid>[\w\d\-_\.]+)/?$', flat.modes.editor.views.pub_view, name='view'),
    re_path(r'^(?P<namespace>[\w\d\-_\./@]+)/(?P<docid>[\w\d\-_\.]+)/history/?$', flat.modes.editor.views.history, name='history'),
    re_path(r'^(?P<namespace>[\w\d\-_\./@]+)/(?P<docid>[\w\d\-_\.]+)/revert/(?P<commithash>[a-f0-9]*)/?$', flat.modes.editor.views.revert, name='revert'),
    re_path(r'^(?P<namespace>[\w\d\-_\./@]+)/(?P<docid>[\w\d\-_\.]+)/save/?$', flat.modes.editor.views.save, name='save'),
    re_path(r'^(?P<namespace>[\w\d\-_\./@]+)/(?P<docid>[\w\d\-_\.]+)/?$', flat.modes.editor.views.view, name='view'),

    #redeclare viewer stuff: (why?)
    re_path(r'^pub/(?P<docid>[\w\d\-_\.]+)/poll/?$', flat.modes.viewer.views.pub_poll, name='poll'),
    re_path(r'^(?P<namespace>[\w\d\-_\./@]+)/(?P<docid>[\w\d\-_\.]+)/poll/?$', flat.modes.viewer.views.poll, name='poll'),
    re_path(r'^(?P<namespace>[\w\d\-_\./@]+)/(?P<docid>[\w\d\-_\.]+)/query/?$', flat.modes.viewer.views.query, name='query'),
    #re_path(r'^(?P<namespace>[\w\d\-_\./]+)/(?P<docid>[\w\d\-_\.]+)/(?P<elementid>[\w\d\-_\.]+)/?$', 'flat.modes.viewer.views.subview', name='subview'),
]

