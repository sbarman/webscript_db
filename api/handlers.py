from piston.handler import BaseHandler
from piston.utils import rc, throttle
from piston.utils import validate
from django import forms
from django.contrib.auth.models import User

from webscript_backend import models

class ScriptForm(forms.ModelForm):
    class Meta:
        model = models.Script

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
              'modification_date',
              'creation_date',
              'id',
              ('user', ('username', 'firstname', 'lastname', 'id')),
              ('events', ('event_type', 'modification_date')),
               )
    model = models.Script

    def read(self, request, script_id=None, script_name=None):
        base = models.Script.objects

        if script_name:
            return base.filter(name=script_name)
        elif script_id:
            return base.get(pk=script_id)
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

            if 'user' in data:
                user = User.objects.get(username=data['user']['username'])
                script.user = user
            else:
                resp = rc.BAD_REQUEST
                resp.write('Must include: {"user": {"username": <username>}, ...}')
                return resp

            script.save()

            # for comment in data['comments']:
            #    Comment(parent=em, content=comment['content']).save()

            return script
        else:
            super(ScriptHandler, self).create(request)

class ReplayHandler(BaseHandler):
    allowed_methods = ('GET', 'POST',)  # 'PUT')
    fields = ('id',
              ('script', ('id'))
             )
    model = models.Replay

    def read(self, request):
        base = models.Replay.objects
        return base.all()  # Or base.filter(...)

    # @validate(ScriptForm, 'POST')
    def create(self, request):
        if request.content_type:
            data = request.data

            replay = self.model()
            
            if 'script_id' in data:
                script = models.Script.objects.get(pk=data['script_id'])
                replay.script = script
            else:
                resp = rc.BAD_REQUEST
                resp.write('Must include: {"script_id": <script_id>, ...}')
                return resp

            replay.save()
            return replay
        else:
            super(ReplayHandler, self).create(request)

class EventHandler(BaseHandler):
    allowed_methods = ('GET', 'POST')  # 'PUT')
    fields = ('event_type',
               'execution_order',
               'version',
               'modification_date',
               'creation_date',
               'id',
               'dom_pre_event_state',
               'dom_post_event_state',
               ('parameters', ('name',)),
               )
    exclude = ('script',)
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
                resp.write('Must include script_id: {"script_id": <id>, "events": [...], }')
                return resp

            script = models.Script.objects.get(pk=data['script_id'])

            # Bail if there is no events
            if 'events' not in data:
                resp = rc.BAD_REQUEST
                resp.write('Must include list of events: {"script_id": <id>, "events": [...], }')
                return resp

            # Handle all of the events
            for event_data in data['events']:
                event = self.model()
                event.script = script

                if 'event_type' in event_data:
                    event.event_type = event_data['event_type']

                if 'dom_pre_event_state' in event_data:
                    event.dom_pre_event_state = event_data['dom_pre_event_state']

                if 'dom_post_event_state' in event_data:
                    event.dom_post_event_state = event_data['dom_post_event_state']

                if 'execution_order' in event_data:
                    event.execution_order = event_data['execution_order']

                if 'version' in event_data:
                    event.version = event_data['version']

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
            return event
        else:
            super(EventHandler, self).create(request)

class ReplayEventHandler(BaseHandler):
    allowed_methods = ('GET', 'POST')  # 'PUT')
    fields = ('event',
               'event_type',
               'execution_order',
               'version',
               'modification_date',
               'creation_date',
               'id',
               'dom_pre_event_state',
               'dom_post_event_state',
               ('parameters', ('name',)),
               )
    exclude = ('replay',)
    model = models.ReplayEvent

    def read(self, request, replay_id=None, event_id=None):
        base = models.Event.objects

        if replay_id:
            return base.filter(replay=int(replay_id))
        elif event_id:
            return base.get(pk=event_id)
        else:
            return base.all()

    def create(self, request):
        if request.content_type:
            data = request.data

            if 'replay_id' not in data:
                resp = rc.BAD_REQUEST
                resp.write('Must include script_id: {"replay_id": <id>, "events": [...], }')
                return resp

            replay = models.Replay.objects.get(pk=data['replay_id'])

            # Bail if there is no events
            if 'events' not in data:
                resp = rc.BAD_REQUEST
                resp.write('Must include list of events: {"replay_id": <id>, "events": [...], }')
                return resp

            # Handle all of the events
            for event_data in data['events']:
                event = self.model()
                event.replay = replay

                if 'event_type' in event_data:
                    event.event_type = event_data['event_type']

                if 'dom_pre_event_state' in event_data:
                    event.dom_pre_event_state = event_data['dom_pre_event_state']

                if 'dom_post_event_state' in event_data:
                    event.dom_post_event_state = event_data['dom_post_event_state']

                if 'execution_order' in event_data:
                    event.execution_order = event_data['execution_order']

                if 'version' in event_data:
                    event.version = event_data['version']

                event.save()

                # Handle all the parameters if there are any
                if 'parameters' in event_data:
                    for param_data in event_data['parameters']:
                        param = models.Parameter()
                        param.replay_event = event

                        if 'name' in param_data:
                            param.name = param_data['name']

                        if 'value' in param_data:
                            param.value = param_data['value']

                        if 'data_type' in param_data:
                            param.data_type = param_data['data_type']

                        param.save()
            return event
        else:
            super(EventHandler, self).create(request)

class ParameterHandler(BaseHandler):
    allowed_methods = ('GET',)  # 'PUT')
    exclude = ('event',)
    model = models.Parameter

    def read(self, request, event_id=None):
        base = models.Parameter.objects

        if event_id:
            return base.filter(event=int(event_id))
        else:
            return base.all()

class CommentHandler(BaseHandler):
    allowed_methods = ('POST')  # 'PUT', 'GET')
    fields = ('name',
              'value',
              'execution_order',
    #          ('script', ('notes',)),
    #          'replay'
             )
    #exclude = ('script',)
    model = models.Comment

    def read(self, request):
        base = model.objects
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
                    if 'replay_id' in comment_data:
                        comment.replay = models.Replay.objects.get(
                            pk=comment_data['replay_id'])

                    comment.save()
            return True
        else:
            super(EventHandler, self).create(request)
