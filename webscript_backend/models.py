from django.db import models
from django.contrib.auth.models import User

# models.signals.post_save.connect(create_api_key, sender=User)


class Script(models.Model):
    name = models.CharField(max_length=128)
    description = models.TextField(help_text="Please describe what the " +
                                   "script does.", blank=True)
    notes = models.TextField(help_text="Comments, questions, problems, etc.",
                             blank=True)
    params = models.TextField(help_text="Comments, questions, problems, etc.",
                             blank=True)
    captures = models.TextField(help_text="Comments, questions, problems, etc.",
                             blank=True)
    user = models.ForeignKey(User,
                             help_text="The user who submitted the script.")
    creation_date = models.DateTimeField(auto_now_add=True)
    modification_date = models.DateTimeField(auto_now=True, auto_now_add=True)

    parent = models.ForeignKey('Script',
                               help_text="The script that was replayed",
                               related_name="replays", blank=True, null=True)

    def __unicode__(self):
        return u'{}'.format(self.name)
   
    class Meta:
        ordering = ['creation_date']

# class ScriptParameter(models.Model):
#     name = models.CharField(max_length=64)
#     value = models.TextField(blank=True)
# 
#     script = models.ForeignKey('Script', blank=True, null=True, default=None,
#                               related_name="parameters")
# 
#     creation_date = models.DateTimeField(auto_now_add=True)
#     modification_date = models.DateTimeField(auto_now=True, auto_now_add=True)
# 
#     def __unicode__(self):
#         value = self.value
#         if len(value) > 32:
#             value = value[:32]
#         return u'Param: {} - {} --> Script: {}'.\
#                format(self.name, value, self.script)

class Event(models.Model):
    event_type = models.CharField(max_length=128, help_text="The type of " + 
                                  "event to be replayed.")
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
    value = models.TextField(blank=True)
    data_type = models.CharField(max_length=32, 
                                 choices=[('number', 'number'),
                                          ('object', 'object'),
                                          ('boolean', 'boolean'),
                                          ('string', 'string')])

    event = models.ForeignKey('Event', related_name="parameters")

    creation_date = models.DateTimeField(auto_now_add=True)
    modification_date = models.DateTimeField(auto_now=True, auto_now_add=True)

    def __unicode__(self):
        if len(self.value) > 32:
            return u'Param: {} - {}... ({}) --> Event: {}'.\
                   format(self.name, self.value[:32], self.data_type, 
                          self.event)
        return u'Param: {} - {} ({}) --> Event: {}'.\
               format(self.name, self.value, self.data_type, self.event)

class Comment(models.Model):
    name = models.CharField(max_length=32) 
    value = models.TextField(blank=True)

    script = models.ForeignKey('Script', related_name="comments")
    execution_order = models.FloatField(help_text="Floating point number of "\
                                        "execution. This allows for " \
                                        "reconstructing the proper order of "\
                                        "events.")

    creation_date = models.DateTimeField(auto_now_add=True)
    modification_date = models.DateTimeField(auto_now=True, auto_now_add=True)

    def __unicode__(self):
        if len(self.value) > 32:
            return u'Param: {} - {}... --> Event: {}'.\
                   format(self.name, self.value[:32], self.script)
        return u'Param: {} - {} --> Event: {}'.\
               format(self.name, self.value, self.script)

class Benchmark(models.Model):
    name = models.CharField(max_length=128)
    creation_date = models.DateTimeField(auto_now_add=True)
    modification_date = models.DateTimeField(auto_now=True, auto_now_add=True)
    script = models.ForeignKey('Script', blank=False, null=False)
    success_captures = models.TextField(help_text="Value of captures to " +
                                         "check if benchmark was successful",
                                         blank=True, null=False)
    enabled = models.BooleanField()

    def __unicode__(self):
        return unicode(self.name)
    
class BenchmarkRun(models.Model):
    benchmark = models.ForeignKey('Benchmark', blank=False, null=False,
                                  related_name='benchmark_runs')
    creation_date = models.DateTimeField(auto_now_add=True)
    modification_date = models.DateTimeField(auto_now=True, auto_now_add=True)
    events_executed = models.FloatField(help_text="Execution order of last " +
                                        "event executed in replay")
    events_total = models.FloatField(help_text="Execution order of last " +
                                        "event of benchmark")
    time = models.FloatField(help_text="Time of execution")
    successful = models.BooleanField(help_text="Whether the run succeeded")
    captures = models.TextField(help_text="Value of captures",
                                         blank=True, null=False)
    trigger_timeouts = models.IntegerField(help_text="Number of timeouts on triggers")
    element_timeouts = models.IntegerField(help_text="Number of timeouts when element cannot be found")
    version = models.TextField(help_text="Version of benchmark", blank=True, null=True)
    notes = models.TextField(help_text="Misc notes", blank=True, null=True)
    errors = models.TextField(help_text="Errors raised during execution",
                              blank=True, null=True)
    log = models.TextField(help_text="Info log", blank=True, null=True, default="")

    def __unicode__(self):
        return unicode(self.benchmark) + " " + unicode(self.successful)
   
# class Capture(models.Model):
#     script = models.ForeignKey('Script', blank=False, null=False)
#     innerHtml = models.TextField(null=False)
#     innerText = models.TextField(null=False)
#     nodeName = models.TextField(null=False)
#     
#     creation_date = models.DateTimeField(auto_now_add=True)
#     modification_date = models.DateTimeField(auto_now=True, auto_now_add=True)
#      
#     def __unicode__(self):
#         return unicode(self.script) + " " + self.nodeName + " " + \
#                self.innerHtml[:32]
