from django.conf.urls.defaults import patterns, include, url
from piston.resource import Resource
from api import handlers

script_handler = Resource(handlers.ScriptHandler)
event_handler = Resource(handlers.EventHandler)
param_handler = Resource(handlers.ParameterHandler)
user_handler = Resource(handlers.UserHandler)
comment_handler = Resource(handlers.CommentHandler)
benchmark_handler = Resource(handlers.BenchmarkHandler)
benchmark_run_handler = Resource(handlers.BenchmarkRunHandler)
capture_handler = Resource(handlers.CaptureHandler)

urlpatterns = patterns('',
   url(r'^script/(?P<script_id>\d+)/', script_handler),
   url(r'^script/(?P<script_name>[^/]+)/', script_handler),
   url(r'^script/', script_handler),
   url(r'^event/(?P<event_id>[^/]+)/', event_handler),
   url(r'^event/', event_handler),
   url(r'^script_events/(?P<script_id>[^/]+)/', event_handler),
   url(r'^parameter/', param_handler),
   url(r'^event_parameters/(?P<event_id>[^/]+)/', param_handler),
   url(r'^comment/', comment_handler),
   url(r'^script_comments/(?P<script_id>[^/]+)/', comment_handler),
   url(r'^user/(?P<username>[^/]+)/', user_handler),
   url(r'^user/', user_handler),
   url(r'^benchmark/', benchmark_handler),
   url(r'^benchmark_run/', benchmark_run_handler),
   url(r'^capture/(?P<script_id>\d+)/', capture_handler),
   url(r'^capture/', capture_handler),
)
