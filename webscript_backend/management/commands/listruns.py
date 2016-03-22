from django.core.management.base import BaseCommand, CommandError
from webscript_backend import models
import json, datetime, pytz

class Command(BaseCommand):
    args = ''
    help = ''

    # benchmarks = ['allrecipes','amazon','best buy','bloomberg','booking','drugs','ebay','expedia','facebook','g-maps','g-translate','gmail','goodreads','google','g-docs','hotels','howstuffworks','kayak','linkedin','mapquest','myfitnesspal','opentable','paypal','southwest','target','thesaurus','tripadvisor','twitter','walmart','webmd','xe','yahoo','yelp','youtube','zillow']
    benchmarks = ['allrecipes']

    timezone = pytz.timezone('US/Pacific')

    init_start = datetime.datetime(2016, 3, 8, tzinfo=timezone)
    init_end = datetime.datetime(2016, 3, 10, tzinfo=timezone)

    final_start = datetime.datetime(2016, 3, 16, tzinfo=timezone)
    final_end = datetime.datetime(2016, 3, 18, tzinfo=timezone)

    def handle(self, *args, **options):
        run_data = {}
        for b in self.benchmarks:
            init = self.getBenchmarkData(b, self.init_start, self.init_end)
            final = self.getBenchmarkData(b, self.final_start, self.final_end)
            run_data[b] = {'init': init, 'final': final}

        print run_data

    def getBenchmarkData(self, name, start, end):
        runs = models.BenchmarkRun.objects
        runs = runs.filter(creation_date__range=(start, end))
        runs = runs.filter(benchmark__name__istartswith=name)
        runs = runs.order_by('-creation_date')

        out = {'trigger':
                {'1run': [],
                 '2run': [],
                 'original': [],
                 'nowait': []
                },
               'runtime':
                {'noAtomic': [],
                 'noCascadeCheck': [],
                 'noCompensation': [],
                 'regular': []
                }
              }

        for r in runs:
            name = r.benchmark.name
            if name.endswith('original'):
                out['trigger']['original'].append(r)
            elif name.endswith('1run-triggers'):
                out['trigger']['1run'].append(r)
            elif name.endswith('2run-triggers'):
                out['trigger']['2run'].append(r)
            elif name.endswith('original-nowait'):
                out['trigger']['nowait'].append(r)
            elif name.endswith('basic'):
                version = r.version
                if version in ['regular', 'noCompensation', 'noCascadeCheck', 
                        'noAtomic']:
                    out['runtime'][version].append(r)
                else:
                    print "Error"
            else:
                print "Error"

        return out

        #for b in benchmark_runs:
        #    print b
