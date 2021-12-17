#from django.conf.urls import patterns, include, url
from django import VERSION
from django.urls import re_path, include

import flat.modes.metadata.views

urlpatterns = [
    re_path(r'^(?P<namespace>[\w\d\-_\./@]+)/(?P<docid>[\w\d\-_\.]+)/?$', flat.modes.metadata.views.view, name='view'),
]
