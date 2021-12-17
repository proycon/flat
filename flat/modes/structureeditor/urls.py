#from django.conf.urls import patterns, include, url
from django import VERSION
from django.urls import re_path, include

import flat.modes.structureeditor.views

urlpatterns = [
    # Examples:
    re_path(r'^(?P<namespace>[\w\-_\.@]+)/(?P<docid>[\w\-\.]+)/?$', flat.modes.structureeditor.views.view, name='view'),
    #re_path(r'^(?P<namespace>[\w\-\.]+)/(?P<docid>[\w\-\.]+)/annotate/?$', 'flat.modes.structureeditor.views.annotate', name='annotate'),
]

