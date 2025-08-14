from django.shortcuts import render
from django.http import HttpResponse

def index(request):
    return render(request, 'webapp/index.html')

def submit_config(request):
    if request.method == 'POST':
        ip = request.POST.get('device_ip')
        param1 = request.POST.get('parameter1')
        param2 = request.POST.get('parameter2')
        print(f"IP: {ip}, Param1: {param1}, Param2: {param2}")
        return HttpResponse("Configuration submitted successfully.")
    return HttpResponse("Invalid request.")


