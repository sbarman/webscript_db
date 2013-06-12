from django.http import HttpResponse
from django.shortcuts import render

from webscript_backend.models import Script
import json
import subprocess

def index(request):
    return HttpResponse("Hello, world. You're at the index.")

def compare(request):
    scripts_list = Script.objects.order_by('id')
    script_to_replays = {};
    for script in scripts_list:
        replays = script.replays.all();
        replay_id_list = []
        for replay in replays:
            replay_id_list.append(replay.id)
        script_to_replays[script.id] = replay_id_list

    context = {'scripts_list': scripts_list,
               'mapping': json.dumps(script_to_replays)}
    return render(request, 'compare.html', context)

def demo(request):
    return render(request, 'demo.html', {})

def demoUpdate(request):
    subprocess.Popen('google-chrome --profile-directory="Demo"', shell=True)
    return HttpResponse("demo update")
