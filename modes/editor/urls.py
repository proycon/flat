from django.conf.urls import * #patterns, include, url
#from django.conf.urls import patterns, include, url

urlpatterns = patterns('',
    # Examples:
    url(r'^(?P<namespace>[\w\-\.]+)/(?P<docid>[\w\-\.]+)/?$', 'flat.modes.editor.views.view', name='view'),
    url(r'^(?P<namespace>[\w\-\.]+)/(?P<docid>[\w\-\.]+)/annotate/?$', 'flat.modes.editor.views.annotate', name='annotate'),
    url(r'^(?P<namespace>[\w\-\.]+)/(?P<docid>[\w\-\.]+)/declare/?$', 'flat.modes.editor.views.declare', name='declare'),

)
