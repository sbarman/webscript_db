from django.core.management.base import NoArgsCommand, CommandError
from webscript_backend import models

class Command(NoArgsCommand):
    args = ''
    help = 'create benchmarks from scripts'

    def handle_noargs(self, **options):
        scripts = models.Script.objects.all().order_by('-creation_date')
        benchmarks = models.Benchmark.objects.all()

        benchmark_scripts = {}
        for b in benchmarks:
            benchmark_scripts[b.script.name] = True

        new_scripts = []
        for s in scripts:
            if not s.name in benchmark_scripts:
                benchmark_scripts[s.name] = True
                self.create_benchmark(s)

    def create_benchmark(self, script):
        t = ''
        while t != 'y' and t != 'n':
            t = raw_input(u'create benchmark for {}: '.format(script.name))
        
        if t:
            b = models.Benchmark()
            b.script = script
            b.success_condition = ""
            b.save()
