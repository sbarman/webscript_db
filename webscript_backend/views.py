from django.http import HttpResponse
from django.shortcuts import render

from webscript_backend.models import Script, Replay

def index(request):
    return HttpResponse("Hello, world. You're at the index.")

def compare(request):
    scripts_list = Script.objects.order_by('id')
    context = {'scripts_list': scripts_list}
    return render(request, 'compare.html', context)
