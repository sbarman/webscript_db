from django.core.management.base import BaseCommand, CommandError
from webscript_backend import models
import json

class Command(BaseCommand):
    args = '<script_id script_id ...>'
    help = 'create benchmarks from scripts'

    def handle(self, *args, **options):
        benchmarks = models.Benchmark.objects.all()
        benchmark_scripts = {}
        for b in benchmarks:
            benchmark_scripts[b.script.id] = True

        for script_id in args:
            try:
                script = models.Script.objects.get(id=script_id)

                if not script.id in benchmark_scripts:
                    benchmark_scripts[script_id] = True
                    self.create_benchmark(script)
            except Exception as e:
                print e

    def create_benchmark(self, script):
        t = ''
        while t != 'y' and t != 'n':
            t = raw_input(u'Create benchmark for {}({}): '.format(script.name,
                    script.id))
        
        if t:
            b = models.Benchmark()
            b.script = script
            captures = [];
            for event in script.events.all():
                if (event.event_type == 'capture'):
                    target = json.loads(
                            event.parameters.get(name='target').value)
                    text = target['snapshot']['prop']['innerText']
                    captures.append(text)
            b.success_captures = json.dumps(captures)
            b.enabled = True
            b.save()
            print "Saving benchmark " + script.name
