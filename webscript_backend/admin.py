from django.contrib import admin
from webscript_backend import models

class InlineEvent(admin.TabularInline):
    model = models.Event

    date_hierarchy = 'creation_date'
    fields = ('event_type', 'execution_order')
    ordering = ['script', 'execution_order']

class ScriptAdmin(admin.ModelAdmin):
    date_hierarchy = 'creation_date'
    inlines =  [InlineEvent]
    list_display = ('name', 'user', 'creation_date', 'description')
    list_filter = ('user__username',)
    search_fields = ('^name', 'description', '^user__username')
    save_as = True

class InlineParameter(admin.TabularInline):
    model = models.Parameter

    date_hierarchy = 'creation_date'
    fields = ('name', 'value', 'data_type')
    ordering = ['name']

class EventAdmin(admin.ModelAdmin):

    def display_parameters(self, obj):
        """
        Summarize parameters for this event.
        """
        l = []
        for param in obj.parameters.all():
            if len(param.value) > 16:
                l.append(u"{}={}...".format(param.name, param.value[:16]))
            else:
                l.append(u"{}={}".format(param.name, param.value))
        return "; ".join(l)
    display_parameters.short_description = "Parameters"

    date_hierarchy = 'creation_date'
    inlines = [InlineParameter]
    list_display = ('execution_order', 'event_type', 'display_parameters',
                    'script',)
    list_filter = ('script__name', 'script__id', 'script__user__username',
                   'event_type')
    ordering = ['script', 'execution_order']
    search_fields = ('event_type', 'dom_pre_event_state',
                     'dom_post_event_state', 'script__name','parameter__name',
                     'parameter__value',)
    save_as = True

class ParameterAdmin(admin.ModelAdmin):
    date_hierarchy = 'creation_date'
    list_display = ('name', 'value', 'data_type', 'event')
    list_filter = ('event__script__name', 'event__script__id',
                   'event__script__user__username', 'event__event_type',
                   'value')
    ordering = ['id', 'name']
    search_fields = ('name', 'value')

class InlineReplayEvent(admin.TabularInline):
    model = models.ReplayEvent

    date_hierarchy = 'creation_date'
    fields = ('event_type', 'execution_order')
    ordering = ['replay', 'execution_order']

class ReplayAdmin(admin.ModelAdmin):
    date_hierarchy = 'creation_date'
    inlines =  [InlineReplayEvent]
    list_display = ('script', 'creation_date', 'description')
    list_filter = ('user__username',)
    search_fields = ('^script__name', 'description', '^script__user__username')
    save_as = True

class ReplayEventAdmin(admin.ModelAdmin):

    def display_parameters(self, obj):
        """
        Summarize parameters for this event.
        """
        l = []
        for param in obj.parameters.all():
            if len(param.value) > 16:
                l.append(u"{}={}...".format(param.name, param.value[:16]))
            else:
                l.append(u"{}={}".format(param.name, param.value))
        return "; ".join(l)
    display_parameters.short_description = "Parameters"

    date_hierarchy = 'creation_date'
    inlines = [InlineParameter]
    list_display = ('execution_order', 'event_type', 'display_parameters',
                    'replay',)
    list_filter = ('replay__script__name', 'replay__id', 
                   'replay__script__user__username', 'event_type')
    ordering = ['replay__script', 'execution_order']
    search_fields = ('event_type', 'dom_pre_event_state',
                     'dom_post_event_state', 'replay__script__name',
                     'parameter__name', 'parameter__value',)
    save_as = True

admin.site.register(models.Script, ScriptAdmin)
admin.site.register(models.Event, EventAdmin)
admin.site.register(models.Parameter, ParameterAdmin)
admin.site.register(models.Replay, ReplayAdmin)
admin.site.register(models.ReplayEvent, ReplayEventAdmin)
