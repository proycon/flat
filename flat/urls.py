from django import VERSION

from django.contrib import admin, auth

if VERSION[0] >= 2 or VERSION[1] >= 8: #Django 1.8 and higher
    from django.conf.urls import url, include
    from django.conf.urls.static import static
elif VERSION[1] >= 6: #Django 1.6
    from django.conf.urls import patterns, url, include
    from django.conf.urls.static import static
else:
    from django.conf.urls.defaults import *

from django.conf import settings
import flat.views
admin.autodiscover()

urlpatterns = [
    # Examples:
    url(r'^$', flat.views.index, name='index'),
    url(r'^index/?$', flat.views.index, name='index'),
    url(r'^pub/?$', flat.views.pub, name='pub'),
    url(r'^index/(?P<namespace>[\w\d\-_\./@]+)/?$', flat.views.index, name='index'),
    url(r'^login/?$', flat.views.login, name='login'),
    url(r'^logout/?$', flat.views.logout, name='logout'),
    url(r'^account/', include('django.contrib.auth.urls')),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^admin/doc/', include('django.contrib.admindocs.urls')),
    url(r'^register/?$', flat.views.register, name='register'),
    url(r'^download/pub/(?P<docid>[\w\d\-_\.]+)\.folia\.xml/?$', flat.views.pub_download, name='download'),
    url(r'^download/pub/(?P<docid>[\w\d\-_\.]+)/?$', flat.views.pub_download, name='download'),
    url(r'^download/(?P<namespace>[\w\d\-_\./@]+)/(?P<docid>[\w\d\-_\.]+)\.folia\.xml/?$', flat.views.download, name='download'),
    url(r'^download/(?P<namespace>[\w\d\-_\./@]+)/(?P<docid>[\w\d\-_\.]+)/?$', flat.views.download, name='download'),
    url(r'^pub/upload/?$', flat.views.pub_upload, name='pub_upload'),
    url(r'^upload/?$', flat.views.upload, name='upload'),
    url(r'^filemanagement/?$', flat.views.filemanagement, name='filemanagement'),
    url(r'^addnamespace/?$', flat.views.addnamespace, name='addnamespace'),
    url(r'^pub/(?P<configuration>[\w\d\-_\./@]+)/(?P<docid>[\w\d\-_\.]+)/query/?$', flat.views.pub_query, name='query'), #generic query function
    url(r'^(?P<namespace>[\w\d\-_\./@]+)/(?P<docid>[\w\d\-_\.]+)/query/?$', flat.views.query, name='query'), #generic query function
    # url(r'^flat/', include('flat.foo.urls')),

]

if VERSION[0] == 1 and VERSION[1] < 8: #Django <1.8
    urlpatterns = patterns('',*urlpatterns)

if settings.DEBUG:
    if VERSION[0] > 1 or VERSION[1] >= 6: #Django 1.6
        urlpatterns += static(settings.STYLE_URL, document_root=settings.STYLE_ROOT)
    else:
        #Django 1.3
        urlpatterns += patterns('',
            (r'^style/(?P<path>.*)$', 'django.views.static.serve', {'document_root': settings.STYLE_ROOT}),
        )


for mode, _ in settings.MODES:
    urlpatterns += [ url(r'^' + mode + '/', include('flat.modes.' + mode + '.urls'))]
    if VERSION[0] == 1 and VERSION[1] < 8: #Django <1.8
        urlpatterns += patterns('', url(r'^' + mode + '/', include('flat.modes.' + mode + '.urls')))
    else:
        urlpatterns += [ url(r'^' + mode + '/', include('flat.modes.' + mode + '.urls'))]



