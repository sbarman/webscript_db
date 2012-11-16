from django.db import models
from django.contrib.auth.models import User

# models.signals.post_save.connect(create_api_key, sender=User)


class Script(models.Model):
    name = models.CharField(max_length=128)
    description = models.TextField(help_text="Please describe what the " +
                                   "script does.", blank=True, null=True)
    notes = models.TextField(help_text="Comments, questions, problems, etc.",
                             blank=True, null=True)
    user = models.ForeignKey(User,
                             help_text="The user who submitted the script.")
    creation_date = models.DateTimeField(auto_now_add=True)
    modification_date = models.DateTimeField(auto_now=True, auto_now_add=True)

    def __unicode__(self):
        return u'{} - {}'.format(self.name, self.creation_date)
   
    class Meta:
        ordering = ['creation_date']


class Event(models.Model):
    event_type = models.CharField(max_length=128, help_text="The type of " + 
                                  "event to be replayed.")
    dom_pre_event_state = models.TextField(help_text="State of DOM prior to" +
                                           " Event firing", blank=True, 
                                           null=True)
    dom_post_event_state = models.TextField(help_text="State of DOM after " + 
                                            "Event finished", blank=True,
                                            null=True)
    version = models.CharField(max_length=32,
                               help_text="Event Format version for Event. " \
                               "Intended to allow backwards incompatible " \
                               "changes.", default="1.0")

    script = models.ForeignKey('Script',
                               related_name="events",
                               help_text="The script this event belongs to.")
    execution_order = models.FloatField(help_text="Floating point number of "\
                                        "execution. This allows for " \
                                        "reconstructing the proper order of "\
                                        "events.")

    creation_date = models.DateTimeField(auto_now_add=True)
    modification_date = models.DateTimeField(auto_now=True, auto_now_add=True)

    def __unicode__(self):
        return u'{}: {} ({})'.format(self.execution_order, self.event_type,
               self.script.name)

    class Meta:
        ordering = ['creation_date']


class Parameter(models.Model):
    name = models.CharField(max_length=64)
    value = models.TextField()
    data_type = models.CharField(max_length=32, 
                                 choices=[('number', 'number'),
                                          ('object', 'object'),
                                          ('boolean', 'boolean'),
                                          ('string', 'string')])

    event = models.ForeignKey('Event', blank=True, null=True, default=None,
                              related_name="parameters")
    replay_event = models.ForeignKey('ReplayEvent', blank=True, null=True,
                                     default=None,
                                     related_name="parameters")

    creation_date = models.DateTimeField(auto_now_add=True)
    modification_date = models.DateTimeField(auto_now=True, auto_now_add=True)

    def __unicode__(self):
        if len(self.value) > 32:
            return u'Param: {} - {}... ({}) --> Event: {}; ReplayEvent: {}'.\
                   format(self.name, self.value[:32], self.data_type, 
                          self.event, self.replay_event)
        return u'Param: {} - {} ({}) --> Event: {}; ReplayEvent: {}'.\
               format(self.name, self.value, self.data_type, self.event,
                      self.replay_event)


# FIXME: Need to define what the replay will store and where it should store 
#  it? In duplicated Events/Parameters, or similar objects with more details?
class Replay(models.Model):
    script = models.ForeignKey('Script',
                               help_text="The script that was replayed")

    creation_date = models.DateTimeField(auto_now_add=True)
    modification_date = models.DateTimeField(auto_now=True, auto_now_add=True)

    def __unicode__(self):
        return u'{} - {}'.format(self.script.name, self.creation_date)


class ReplayEvent(models.Model):
    replay = models.ForeignKey('Replay',
                               related_name="events",
                               help_text="The replay 'session' that this replay event belongs to.")
    event = models.ForeignKey('Event',
                              blank=True, null=True, default=None,
                              help_text="The event this replay was based on.")

    event_type = models.CharField(max_length=128,
                                  help_text="The type of event to be replayed.")
    dom_pre_event_state = models.TextField(help_text="State of DOM prior to Event firing",
                                     blank=True, null=True)
    dom_post_event_state = models.TextField(help_text="State of DOM after Event finished",
                                     blank=True, null=True)
    version = models.CharField(max_length=32,
                               help_text="Event Format version for Event. " \
                                     "Intended to allow backwards incompatible changes.",
                               default="1.0")

    execution_order = models.FloatField(help_text="Floating point number of execution." \
                                "This allows for reconstructing the proper order of events.")

    creation_date = models.DateTimeField(auto_now_add=True)
    modification_date = models.DateTimeField(auto_now=True, auto_now_add=True)

    def __unicode__(self):
        return u'{}: {} ({})'.format(self.execution_order, self.event_type, self.replay)


class Comment(models.Model):
    name = models.CharField(max_length=32) 
    value = models.TextField()

    script = models.ForeignKey('Script', blank=True, null=True, default=None,
                               related_name="comments")
    replay = models.ForeignKey('Replay', blank=True, null=True,
                               default=None, related_name="comments")
    execution_order = models.FloatField(help_text="Floating point number of "\
                                        "execution. This allows for " \
                                        "reconstructing the proper order of "\
                                        "events.")

    creation_date = models.DateTimeField(auto_now_add=True)
    modification_date = models.DateTimeField(auto_now=True, auto_now_add=True)

    def __unicode__(self):
        if len(self.value) > 32:
            return u'Param: {} - {}... --> Event: {}; ReplayEvent: {}'.\
                   format(self.name, self.value[:32], self.script,
                          self.replay)
        return u'Param: {} - {} --> Event: {}; ReplayEvent: {}'.\
               format(self.name, self.value, self.script, self.replay)
