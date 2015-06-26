from piston.handler import BaseHandler
from piston.utils import rc, throttle
from piston.utils import validate
from django.contrib.auth.models import User
import HTMLParser

from webscript_backend import models

class UserHandler(BaseHandler):
    allowed_methods = ('GET',)
    fields = ('username', 'first_name', 'last_name')
    model = User

    def read(self, request, username=None):
        base = self.model.objects

        if username:
            return base.get(username=username)
        else:
            return base.all()

class ScriptHandler(BaseHandler):
    allowed_methods = ('GET', 'POST',)  # 'PUT')
    fields = ('name',
              'notes',
              'description',
              'params',
              'captures',
              'id',
              ('parent', ('id',)),
              ('user', (),),
              ('events', ('id',)),
              ('comments', (),),
              ('replays', ('id',)),
             )
    model = models.Script

    def read(self, request, script_id=None, script_name=None):
        base = models.Script.objects

        if script_name:
            print script_name
            script_name = HTMLParser.HTMLParser().unescape(script_name)
            print script_name
            return base.filter(name=script_name)
        elif script_id:
            return base.filter(pk=script_id)
        else:
            return base.all()  # Or base.filter(...)

    # @validate(ScriptForm, 'POST')
    def create(self, request):
        if request.content_type:
            data = request.data

            script = self.model()
            script.name = data['name']
            if 'notes' in data:
                script.notes = data['notes']

            if 'description' in data:
                script.description = data['description']

            if 'params' in data:
                script.params = data['params']

            if 'captures' in data:
                script.captures = data['captures']

            if 'parent_id' in data:
                parent = models.Script.objects.get(pk=data['parent_id'])
                script.parent = parent

            if 'user' in data:
                user = User.objects.get(username=data['user']['username'])
                script.user = user
            else:
                resp = rc.BAD_REQUEST
                resp.write('Must include: {"user": {"username": <username>}, '
                           '...}')
                return resp

            script.save()

            # for comment in data['comments']:
            #    Comment(parent=em, content=comment['content']).save()

            return script
        else:
            super(ScriptHandler, self).create(request)

# class ScriptParameterHandler(BaseHandler):
#     allowed_methods = ('GET', 'POST')
#     fields = ('name',
#               'value',
#               'id',
#               ('script', ('id',)),
#              )
#     model = models.ScriptParameter
# 
#     def read(self, request, script_id=None):
#         base = self.model.objects
# 
#         if script_id:
#             return base.filter(script=int(script_id))
#         else:
#             return base.all()
# 
#     def create(self, request):
#         if request.content_type:
#             data = request.data
# 
#             if 'script_id' not in data:
#                 resp = rc.BAD_REQUEST
#                 resp.write('Must include script_id: {"script_id": <id>, '
#                            '"params": [...], }')
#                 return resp
# 
#             script = models.Script.objects.get(pk=data['script_id'])
# 
#             # Bail if there is no events
#             if 'params' not in data:
#                 resp = rc.BAD_REQUEST
#                 resp.write('Must include list of events: {"script_id": <id>, '
#                            '"params": [...], }')
#                 return resp
# 
#             # Handle all of the events
#             for param_data in data['params']:
#                 param = self.model()
#                 param.script = script
# 
#                 if 'name' in param_data and 'value' in param_data:
#                     param.name = param_data['name']
#                     param.value = param_data['value']
# 
#                 param.save()
# 
#             return True
#         else:
#             super(EventHandler, self).create(request)

class EventHandler(BaseHandler):
    allowed_methods = ('GET', 'POST')  # 'PUT')
    fields = ('event_type',
              'execution_order',
              'id',
              ('parameters', ()),
              ('script', ('id')),
             )
    model = models.Event

    def read(self, request, script_id=None, event_id=None):
        base = models.Event.objects

        if script_id:
            return base.filter(script=int(script_id))
        elif event_id:
            return base.get(pk=event_id)
        else:
            return base.all()

    def create(self, request):
        if request.content_type:
            data = request.data

            if 'script_id' not in data:
                resp = rc.BAD_REQUEST
                resp.write('Must include script_id: {"script_id": <id>, '
                           '"events": [...], }')
                return resp

            script = models.Script.objects.get(pk=data['script_id'])

            # Bail if there is no events
            if 'events' not in data:
                resp = rc.BAD_REQUEST
                resp.write('Must include list of events: {"script_id": <id>,'
                           ' "events": [...], }')
                return resp

            # Handle all of the events
            for event_data in data['events']:
                event = self.model()
                event.script = script

                if 'event_type' in event_data:
                    event.event_type = event_data['event_type']

                if 'execution_order' in event_data:
                    event.execution_order = event_data['execution_order']

                event.save()

                # Handle all the parameters if there are any
                if 'parameters' in event_data:
                    for param_data in event_data['parameters']:
                        param = models.Parameter()
                        param.event = event

                        if 'name' in param_data:
                            param.name = param_data['name']

                        if 'value' in param_data:
                            param.value = param_data['value']

                        if 'data_type' in param_data:
                            param.data_type = param_data['data_type']

                        param.save()
            return True
        else:
            super(EventHandler, self).create(request)

class ParameterHandler(BaseHandler):
    allowed_methods = ('GET',)  # 'PUT')
    fields = ('name',
              'value',
              'data_type',
              'id',
              ('event', ('id',)),
             )
    model = models.Parameter

    def read(self, request, event_id=None):
        base = models.Parameter.objects

        if event_id:
            return base.filter(event=int(event_id))
        else:
            return base.all()

class CommentHandler(BaseHandler):
    allowed_methods = ('GET', 'POST')  # 'PUT')
    fields = ('name',
              'value',
              'execution_order',
              ('script', ('id',)),
             )
    model = models.Comment

    def read(self, request, script_id=None):
        base = self.model.objects

        if script_id:
            # TODO: fix this
            return base.filter(script=int(script_id))
        else:
            return base.all()

    def create(self, request):
        if request.content_type:
            data = request.data

            if 'comments' in data:
                for comment_data in data['comments']:
                    comment = self.model()

                    if ('name' not in comment_data) or \
                       ('value' not in comment_data) or \
                       ('execution_order' not in comment_data):
                        resp = rc.BAD_REQUEST
                        resp.write('Must include required fields')
                        return resp

                    comment.name = comment_data['name']
                    comment.value = comment_data['value']
                    comment.execution_order = comment_data['execution_order']

                    if 'script_id' in comment_data:
                        comment.script = models.Script.objects.get(
                            pk=comment_data['script_id'])

                    comment.save()
            return True
        else:
            super(CommentHandler, self).create(request)

class BenchmarkHandler(BaseHandler):
    allowed_methods = ('GET', 'POST')  # 'PUT')
    fields = ('name',
              'success_captures',
              'id',
              'creation_date',
              ('script', ('id', 'name')),
             )
    model = models.Benchmark

    def read(self, request):
        base = models.Benchmark.objects
        return base.filter(enabled=True)

    def create(self, request):
        if request.content_type:
            data = request.data
            benchmark = self.model()

            if ('script' not in data) or \
               ('name' not in data) or \
               ('success_captures' not in data) or \
               ('enabled' not in data):
                resp = rc.BAD_REQUEST
                resp.write('Must include required fields')
                return resp

            benchmark.success_captures = data['success_captures']
            benchmark.enabled = data['enabled']
            benchmark.name = data['name']

            benchmark.script = models.Script.objects.get(pk=data['script'])

            benchmark.save()
            return benchmark
        else:
            super(BenchmarkHandler, self).create(request)

class BenchmarkRunHandler(BaseHandler):
    allowed_methods = ('GET', 'POST')  # 'PUT')
    fields = ('errors',
              'events_executed',
              'events_total',
              'time',
              'successful',
              'notes'
              'log',
              'id',
              'captures',
              'creation_date',
              'trigger_timeouts',
              'element_timeouts',
              'version',
              ('benchmark', ('id','name')),
             )
    model = models.BenchmarkRun

    def read(self, request):
        base = self.model.objects
        return base.all()

    def create(self, request):
        if request.content_type:
            data = request.data
            run = self.model()

            if ('benchmark' not in data) or \
               ('successful' not in data) or \
               ('events_total' not in data) or \
               ('events_executed' not in data) or \
               ('captures' not in data) or \
               ('time' not in data):
                resp = rc.BAD_REQUEST
                resp.write('Must include required fields')
                return resp

            run.events_executed = data['events_executed']
            run.events_total = data['events_total']
            run.successful = data['successful']
            run.captures = data['captures']
            run.time = data['time']

            run.benchmark = models.Benchmark.objects.get(pk=data['benchmark'])

            if 'errors' in data:
                run.errors = data['errors']
            else:
                run.errors = ""

            if 'notes' in data:
                run.notes = data['notes']
            else:
                run.notes = ""

            if 'log' in data:
                run.log = data['log']
            else:
                run.log = ""

            if 'trigger_timeouts' in data:
                run.trigger_timeouts = data['trigger_timeouts']
            else:
                run.log = -1

            if 'element_timeouts' in data:
                run.element_timeouts = data['element_timeouts']
            else:
                run.element_timeouts = -1

            if 'version' in data:
                run.version = data['version']
            else:
                run.version = ""

            run.save()
            return True
        else:
            super(BenchmarkRunHandler, self).create(request)

# class CaptureHandler(BaseHandler):
#     allowed_methods = ('GET', 'POST')  # 'PUT')
#     fields = ('innerHtml',
#               'innerText',
#               'nodeName',
#               ('script', ('id','name')),
#              )
#     model = models.Capture
# 
#     def read(self, request, script_id=None):
#         base = self.model.objects
# 
#         if script_id:
#             return base.filter(script=script_id).latest('creation_date')
#         else:
#             return base.all()  # Or base.filter(...)
# 
#     def create(self, request):
#         if request.content_type:
#             data = request.data
#             capture = self.model()
# 
#             if ('innerHtml' not in data) or \
#                ('nodeName' not in data) or \
#                ('innerText' not in data) or \
#                ('script' not in data):
#                 resp = rc.BAD_REQUEST
#                 resp.write('Must include required fields')
#                 return resp
# 
#             capture.innerHtml = data['innerHtml']
#             capture.nodeName = data['nodeName']
#             capture.innerText = data['innerText']
#             capture.script = models.Script.objects.get(pk=data['script'])
# 
#             capture.save()
#             return True
#         else:
#             super(CaptureHandler, self).create(request)
