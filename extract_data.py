
import datetime

benchmark_names = []
start_date = datetime.datetime(2015, 6, 1)
end_date = timezone.now()

runs = BenchmarkRun.objects.order_by('creation_date')
                           .filter(creation_date__range(start_date, end_date))

PASS = 'working'
PARTIAL = 'partial'
FAIL = 'fail'


while date < end_date:
    date = start_date
    runs_prefix = runs.filter(creation_date__range(start_date, date))
    benchmarkStatus = {}

    date = date + timezone.timedelta(day=1)



