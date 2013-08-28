from django.contrib import admin
from webscript_backend import models

import copy

class InlineEvent(admin.TabularInline):
    model = models.Event

    date_hierarchy = 'creation_date'
    fields = ('event_type', 'execution_order')
    ordering = ['script', 'execution_order']

class InlineParam(admin.TabularInline):
    model = models.ScriptParameter

    date_hierarchy = 'creation_date'
    fields = ('name', 'value')
    ordering = ['name']

class ScriptAdmin(admin.ModelAdmin):
    actions = ['delete_script', 'copy_script']
    date_hierarchy = 'creation_date'
    inlines =  [InlineEvent, InlineParam]
    list_display = ('name', 'user', 'creation_date', 'description', 'parent')
    list_filter = ('user__username',)
    search_fields = ('^name', 'description', '^user__username')
    save_as = True

    def delete_script(self, request, queryset):
        queryset.delete()
    delete_script.short_description = "Delete selected scripts (no " + \
                                      " confirmation)"
    
    def copy_script(modeladmin, request, queryset):
        # s is an instance of Script
        for s in queryset:
            s_copy = copy.copy(s) # (2) django copy object
            s_copy.id = None   # (3) set 'id' to None to create new object
            s_copy.save()    # initial save

            for e in s.events.all():
                e_copy = copy.copy(e)
                e_copy.id = None
                e_copy.script = s_copy
                e_copy.save()

                for p in e.parameters.all():
                    p_copy = copy.copy(p)
                    p_copy.id = None
                    p_copy.event = e_copy
                    p_copy.save()


    copy_script.short_description = "Make a shallow copy of the script" 

class ScriptParameterAdmin(admin.ModelAdmin):
    date_hierarchy = 'creation_date'
    list_display = ('name', 'value', 'script')
    list_filter = ('script__name', 'script__id',
                   'script__user__username', 'value')
    ordering = ['id', 'name']
    search_fields = ('name', 'value')

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
    search_fields = ('event_type',
                     'script__name','parameter__name', 'parameter__value',)
    save_as = True

class ParameterAdmin(admin.ModelAdmin):
    date_hierarchy = 'creation_date'
    list_display = ('name', 'value', 'data_type', 'event')
    list_filter = ('event__script__name', 'event__script__id',
                   'event__script__user__username', 'event__event_type',
                   'value')
    ordering = ['id', 'name']
    search_fields = ('name', 'value')

class CommentAdmin(admin.ModelAdmin):
    date_hierarchy = 'creation_date'
    list_display = ('name', 'value', 'execution_order', 'script')
    list_filter = ('script__name', 'script__id',
                   'script__user__username')
    ordering = ['id', 'name']
    search_fields = ('name', 'value')

class BenchmarkAdmin(admin.ModelAdmin):
    list_display = ('script', 'success_condition')
    list_filter = ('script__name', 'script__id')
    ordering = ['id', 'script__id']

class BenchmarkRunAdmin(admin.ModelAdmin):
    date_hierarchy = 'creation_date'
    list_display = ('benchmark', 'successful', 'events_executed', 'errors')
    list_filter = ('benchmark__script__name', 'benchmark__script__id')
    ordering = ['id', 'benchmark__script__id']

class CaptureAdmin(admin.ModelAdmin):
    date_hierarchy = 'creation_date'
    list_display = ('script', 'nodeName')
    list_filter = ('script__name', 'script__id')
    ordering = ['id', 'script__id']

admin.site.register(models.Script, ScriptAdmin)
admin.site.register(models.ScriptParameter, ScriptParameterAdmin)
admin.site.register(models.Event, EventAdmin)
admin.site.register(models.Parameter, ParameterAdmin)
admin.site.register(models.Comment, CommentAdmin)
admin.site.register(models.Benchmark, BenchmarkAdmin)
admin.site.register(models.BenchmarkRun, BenchmarkRunAdmin)
admin.site.register(models.Capture, CaptureAdmin)
