from django.conf.urls import patterns, include, url

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
from django.conf.urls.static import static
import flat.settings as settings
admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    url(r'^$', 'flat.views.index', name='index'),
    url(r'^login/?$', 'flat.views.login', name='login'),
    url(r'^logout/?$', 'flat.views.logout', name='logout'),
    url(r'^download/(?P<namespace>[\w\-\.]+)/(?P<docid>[\w\-\.]+)/?$', 'flat.views.download', name='download'),
    # url(r'^flat/', include('flat.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    url(r'^admin/', include(admin.site.urls)),
)

if settings.DEBUG:
    urlpatterns += static(settings.STYLE_URL, document_root=settings.STYLE_ROOT)

for mode, _ in settings.EDITOR_MODES:
    urlpatterns += patterns('',url(r'^' + mode + '/', include('flat.modes.' + mode + '.urls')))


