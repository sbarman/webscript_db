from django.conf.urls.defaults import patterns, include, url
from piston.resource import Resource
from api import handlers

script_handler = Resource(handlers.ScriptHandler)
replay_handler = Resource(handlers.ReplayHandler)
event_handler = Resource(handlers.EventHandler)
replay_event_handler = Resource(handlers.ReplayEventHandler)
param_handler = Resource(handlers.ParameterHandler)
user_handler = Resource(handlers.UserHandler)

urlpatterns = patterns('',
   url(r'^script/(?P<script_id>\d+)/', script_handler),
   url(r'^script/(?P<script_name>[^/]+)/', script_handler),
   url(r'^script/', script_handler),
   url(r'^replay/',replay_handler),
   url(r'^event/(?P<event_id>[^/]+)/', event_handler),
   url(r'^script_events/(?P<script_id>[^/]+)/', event_handler),
   url(r'^event/', event_handler),
   url(r'^event_parameters/(?P<event_id>[^/]+)/', param_handler),
   url(r'^replay_event/', replay_event_handler),
   url(r'^parameter/', param_handler),
   url(r'^user/(?P<username>[^/]+)/', user_handler),
   url(r'^user/', user_handler),
)
