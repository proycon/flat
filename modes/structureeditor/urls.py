from django.conf.urls import patterns, include, url

urlpatterns = patterns('',
    # Examples:
    url(r'^(?P<namespace>[\w\-\.]+)/(?P<docid>[\w\-\.]+)/?$', 'flat.modes.structureeditor.views.view', name='view'),
    url(r'^(?P<namespace>[\w\-\.]+)/(?P<docid>[\w\-\.]+)/annotate/?$', 'flat.modes.structureeditor.views.annotate', name='annotate'),

)
