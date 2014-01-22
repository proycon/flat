from django.conf.urls import patterns, include, url

urlpatterns = patterns('',
    # Examples:
    url(r'^(?P<docid>[\w\-\.]+)/$', 'flat.modes.viewer.views.view', name='view'),
    url(r'^(?P<docid>[\w\-\.]+)/(?P<elementid>[\w\-\.]+/$', 'flat.modes.viewer.views.subview', name='subview'),

)
