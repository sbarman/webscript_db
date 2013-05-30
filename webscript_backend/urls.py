from django.conf.urls.defaults import patterns, include, url
from webscript_backend import views


urlpatterns = patterns('',
    url(r'^$', views.index, name='index'),
    url(r'^compare$', views.compare, name='compare'),
    url(r'^demo$', views.demo, name='demo')
)
