from django import VERSION

from django.contrib import admin

if VERSION[1] >= 6: #Django 1.6
    from django.conf.urls import patterns, url, include
    from django.conf.urls.static import static
else:
    from django.conf.urls.defaults import *

import flat.settings as settings
admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    url(r'^$', 'flat.views.index', name='index'),
    url(r'^login/?$', 'flat.views.login', name='login'),
    url(r'^logout/?$', 'flat.views.logout', name='logout'),
    url(r'^register/?$', 'flat.views.register', name='register'),
    url(r'^download/(?P<namespace>[\w\-\.]+)/(?P<docid>[\w\-\.]+)\.folia\.xml/?$', 'flat.views.download', name='download'),
    url(r'^download/(?P<namespace>[\w\-\.]+)/(?P<docid>[\w\-\.]+)/?$', 'flat.views.download', name='download'),
    url(r'^upload/?$', 'flat.views.upload', name='upload'),
    # url(r'^flat/', include('flat.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    url(r'^admin/', include(admin.site.urls)),
)

if settings.DEBUG:
    if VERSION[1] >= 6: #Django 1.6
        urlpatterns += static(settings.STYLE_URL, document_root=settings.STYLE_ROOT)
    else:
        #Django 1.3
        urlpatterns += patterns('',
            (r'^style/(?P<path>.*)$', 'django.views.static.serve', {'document_root': settings.STYLE_ROOT}),
        )


for mode, _ in settings.EDITOR_MODES:
    urlpatterns += patterns('',url(r'^' + mode + '/', include('flat.modes.' + mode + '.urls')))


