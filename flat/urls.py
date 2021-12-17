from django import VERSION

from django.contrib import admin, auth

from django.urls import re_path, include
from django.conf.urls.static import static

from django.conf import settings
import flat.views
admin.autodiscover()

urlpatterns = [
    # Examples:
    re_path(r'^$', flat.views.index, name='index'),
    re_path(r'^index/?$', flat.views.index, name='index'),
    re_path(r'^pub/?$', flat.views.pub, name='pub'),
    re_path(r'^config/?$', flat.views.config, name='config'),
    re_path(r'^index/(?P<namespace>[\w\d\-_\./@]+)/?$', flat.views.index, name='index'),
    re_path(r'^login/?$', flat.views.login, name='login'),
    re_path(r'^selectconf/?$', flat.views.selectconf, name='selectconf'),
    re_path(r'^logout/?$', flat.views.logout, name='logout'),
    re_path(r'^account/', include('django.contrib.auth.urls')),
    re_path(r'^admin/', admin.site.urls if VERSION[0] >= 2 else include(admin.site.urls)),
    re_path(r'^admin/doc/', include('django.contrib.admindocs.urls')),
    re_path(r'^register/?$', flat.views.register, name='register'),
    re_path(r'^download/pub/(?P<docid>[\w\d\-_\.]+)\.folia\.xml/?$', flat.views.pub_download, name='download'),
    re_path(r'^download/pub/(?P<docid>[\w\d\-_\.]+)/?$', flat.views.pub_download, name='download'),
    re_path(r'^download/(?P<namespace>[\w\d\-_\./@]+)/(?P<docid>[\w\d\-_\.]+)\.folia\.xml/?$', flat.views.download, name='download'),
    re_path(r'^download/(?P<namespace>[\w\d\-_\./@]+)/(?P<docid>[\w\d\-_\.]+)/?$', flat.views.download, name='download'),
    re_path(r'^pub/upload/?$', flat.views.pub_upload, name='pub_upload'),
    re_path(r'^upload/?$', flat.views.upload, name='upload'),
    re_path(r'^filemanagement/?$', flat.views.filemanagement, name='filemanagement'),
    re_path(r'^addnamespace/?$', flat.views.addnamespace, name='addnamespace'),
    re_path(r'^pub/(?P<configuration>[\w\d\-_\./@]+)/(?P<docid>[\w\d\-_\.]+)/query/?$', flat.views.pub_query, name='query'), #generic query function
    re_path(r'^(?P<namespace>[\w\d\-_\./@]+)/(?P<docid>[\w\d\-_\.]+)/query/?$', flat.views.query, name='query'), #generic query function
    re_path('^oidc/', include('mozilla_django_oidc.urls')),
    # re_path(r'^flat/', include('flat.foo.urls')),
]

if VERSION[0] == 1 and VERSION[1] < 8: #Django <1.8
    urlpatterns = patterns('',*urlpatterns)

if VERSION[0] > 1 or VERSION[1] >= 6: #Django 1.6
    urlpatterns += static(settings.STYLE_URL, document_root=settings.STYLE_ROOT)
    urlpatterns += static(settings.SCRIPT_URL, document_root=settings.SCRIPT_ROOT)


for mode, _ in settings.MODES:
    urlpatterns += [ re_path(r'^' + mode + '/', include('flat.modes.' + mode + '.urls'))]
    if VERSION[0] == 1 and VERSION[1] < 8: #Django <1.8
        urlpatterns += patterns('', re_path(r'^' + mode + '/', include('flat.modes.' + mode + '.urls')))
    else:
        urlpatterns += [ re_path(r'^' + mode + '/', include('flat.modes.' + mode + '.urls'))]



