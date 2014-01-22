from django.conf.urls import patterns, include, url

urlpatterns = patterns('',
    # Examples:
    url(r'^(?P<docid>[\w\-\.]+)/?$', 'flat.modes.editor.views.view', name='index'),

)
